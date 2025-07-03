import { connect, disconnect } from './lib/db';
import emailHistory from '../../model/emailHistory.js';
import Country from '../../model/projects.js';
import s3Uploader from './lib/utils/s3Uploader.js';
import s3Deleter from './lib/utils/s3Deleter.js';
import dynamicSMTPMailer from './lib/utils/dynamicSMTPmailer.js';
import DynamicEmail from './lib/emailTemplate/dynamicEmail';
import jwtVerify from './lib/middleware/jwtVerify';

import AWS from 'aws-sdk';
import multipartParser from './lib/utils/multipartParser.js'; // You must implement or install one like 'lambda-multipart-parser'

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION
});

async function rawhandler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // 1. Parse incoming multipart form data (file + body)
    const { fields, files } = await multipartParser(event);

    const { country_id, project_id } = fields;
    const { from, to, topic, date, message, email_pass } = fields;

    if (!from || !to || !topic || !message || !email_pass || !date) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields.' })
      };
    }

    let uploadedDocs = [];

    await connect();

    const countryDoc = await Country.findById(country_id);
    if (!countryDoc) {
      await disconnect();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Country not found.' })
      };
    }

    const project = countryDoc.project.id(project_id);
    if (!project) {
      await disconnect();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Project not found.' })
      };
    }

    // 2. Upload files
    if (files && files.length > 0) {
      uploadedDocs = await Promise.all(
        files.map(async (file) => {
          const result = await s3Uploader(file);
          return {
            url: result.Location,
            name: file.filename || file.originalname,
            key: result.Key
          };
        })
      );

      await Country.findByIdAndUpdate(
        country_id,
        {
          $push: {
            'project.$[proj].document_shared': { $each: uploadedDocs }
          }
        },
        {
          arrayFilters: [{ 'proj._id': project_id }],
          new: true,
          runValidators: false
        }
      );
    }

    // 3. Log email history
    const historyEntry = { from, to, topic, date };
    let historyDoc = await emailHistory.findOne({ project_id });
    if (historyDoc) {
      historyDoc.emails.push(historyEntry);
    } else {
      historyDoc = new emailHistory({ project_id, emails: [historyEntry] });
    }
    await historyDoc.save();

    // 4. Prepare attachments
    const attachments = await Promise.all(
      uploadedDocs.map(async (doc) => {
        const fileBuffer = await s3.getObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: doc.key
        }).promise();

        return {
          filename: doc.name,
          content: fileBuffer.Body
        };
      })
    );

    // 5. Email body
    const htmlContent = DynamicEmail({
      fromName: from,
      toName: to,
      subject: topic,
      message,
      attachmentCount: attachments.length
    });

    // 6. Send email
    const sendResult = await dynamicSMTPMailer({
      from,
      email_pass,
      to,
      subject: topic,
      html: htmlContent,
      attachments
    });

    await disconnect();

    if (!sendResult.success) {
      throw new Error(`SMTP Error: ${sendResult.error}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Email history logged and email sent successfully.',
        attachments: uploadedDocs.map(doc => doc.url)
      })
    };
  } catch (err) {
    console.error('❌ Error occurred:', err);

    if (uploadedDocs.length > 0) {
      for (let doc of uploadedDocs) {
        try {
          await s3Deleter(doc.key);
        } catch (delErr) {
          console.error(`⚠️ Failed to delete S3 file ${doc.key}:`, delErr);
        }
      }

      try {
        await Country.findByIdAndUpdate(
          fields.country_id,
          {
            $pull: {
              'project.$[proj].document_shared': {
                url: { $in: uploadedDocs.map(doc => doc.url) }
              }
            }
          },
          {
            arrayFilters: [{ 'proj._id': fields.project_id }],
            runValidators: false
          }
        );
      } catch (rollbackErr) {
        console.error('⚠️ Rollback failed in project document:', rollbackErr);
      }
    }

    await disconnect();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while logging or sending email.' })
    };
  }
}

export const handler = jwtVerify(rawhandler)