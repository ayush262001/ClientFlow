const dynamicEmail = ({ fromName, toName, subject, message }) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #fff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
          }
          .header h2 {
            margin: 0;
            color: #333;
          }
          .body {
            padding: 20px 0;
            color: #444;
            line-height: 1.6;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
          }
          .highlight {
            color: #007bff;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${subject}</h2>
          </div>
          <div class="body">
            <p>Hi <span class="highlight">${toName || 'there'}</span>,</p>
            <p>${message}</p>
            <p style="margin-top: 30px;">Best regards,<br/><strong>${fromName}</strong></p>
          </div>
          <div class="footer">
            <p>This message was sent as part of your project collaboration on <strong>ClientFlow</strong>.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  export default dynamicEmail;
  