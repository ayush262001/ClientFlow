import { connect, disconnect } from './lib/db.js';
import Country from '../../model/projects.js';
import EmailHistory from '../../model/emailHistory.js';
import s3Uploader from './lib/utils/s3Uploader.js';
import companyEmailSender from './lib/utils/companyEmailSender.js';
import EmailTemplate from './lib/emailTemplate/projectEmailfromFreelancertoClient.js';
import Busboy from 'busboy';
import jwtVerify from './lib/middleware/jwtVerify.js';

const rawhandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const fields = {};
  const filePromises = [];

  try {
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type'],
      },
    });

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const fileChunks = [];
      file.on('data', (data) => fileChunks.push(data));
      file.on('end', () => {
        const buffer = Buffer.concat(fileChunks);
        filePromises.push(
          s3Uploader({ originalname: filename, buffer, mimetype }) // ✅ pass originalname
        );
      });
    });

    busboy.on('field', (fieldname, value) => {
      fields[fieldname] = value;
    });

    await new Promise((resolve, reject) => {
      busboy.on('finish', resolve);
      busboy.on('error', reject);
      busboy.end(Buffer.from(event.body, 'base64'));
    });

    const uploads = await Promise.all(filePromises);

    const document_shared = uploads.map((u) => ({
      url: u.Location,
      name: u.originalname, // ✅ safely get the filename from upload result
    }));

    const {
      name,
      domain,
      client_email,
      description,
      proposal,
      bidding_amount,
      milestones,
      country,
      freelancer_id,
      freelancerEmail,
      freelancerName,
    } = fields;

    const parsedMilestones = typeof milestones === 'string' ? JSON.parse(milestones) : [];
    const formattedMilestones = parsedMilestones.map((m) => ({
      name: m.name,
      amount: m.amount,
      status: m.status,
      payment_done: m.payment_done || false,
      date: m.date ? new Date(m.date) : new Date(),
    }));

    await connect();

    const newProject = {
      name,
      domain,
      client_email,
      description,
      proposal,
      bidding_amount,
      milestones: formattedMilestones,
      document_shared,
    };

    let countryDoc = await Country.findOne({ country, freelancer_id });

    if (countryDoc) {
      countryDoc.project.push(newProject);
      await countryDoc.save();
    } else {
      countryDoc = new Country({
        country,
        freelancer_id,
        project: [newProject],
      });
      await countryDoc.save();
    }

    const addedProject = countryDoc.project[countryDoc.project.length - 1];

    const emailContent = EmailTemplate({
      projectName: name,
      clientEmail: client_email,
      proposal,
      description,
      biddingAmount: bidding_amount,
      country,
      freelancerEmail,
      freelancerName,
    });

    await companyEmailSender({
      to: [client_email],
      subject: `📁 New Project Created: ${name}`,
      html: emailContent,
    });

    await new EmailHistory({
      project_id: addedProject._id,
      emails: [
        {
          from: freelancerEmail,
          to: client_email,
          topic: `📁 New Project Created: ${name}`,
          date: new Date().toISOString(),
        },
      ],
    }).save();

    await disconnect();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: '✅ Project created successfully.',
        project: addedProject,
      }),
    };
  } catch (error) {
    console.error('❌ Error in createProject:', error);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while creating project.' }),
    };
  }
};

export const handler = jwtVerify(rawhandler);
