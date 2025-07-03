const projectEmailFromFreelancerToClient = ({
    projectName,
    clientEmail,
    proposal,
    description,
    biddingAmount,
    country,
    freelancerEmail,
    freelancerName
  }) => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2c3e50;">📁 New Project Created: <span style="color:#2980b9">${projectName}</span></h2>
  
        <p>Dear <strong>Client</strong>,</p>
  
        <p>We are excited to inform you that a new project has been created under the freelancer: <strong>${freelancerName}</strong> (<em>${freelancerEmail}</em>) in <strong>${country}</strong>.</p>
  
        <hr style="border:none; border-top:1px solid #ccc; margin:20px 0;" />
  
        <h3 style="color:#16a085;">📝 Project Details:</h3>
        <p><strong>Description:</strong><br/>${description}</p>
        <p><strong>Proposal:</strong><br/>${proposal}</p>
        <p><strong>Bidding Amount:</strong> $${biddingAmount}</p>
  
        <hr style="border:none; border-top:1px solid #ccc; margin:20px 0;" />
  
        <p style="font-size: 14px; color: #555;">
          If you have any questions or need support, feel free to reach out to our team.
        </p>
  
        <p>Thanks & Regards,<br/>
        <strong>Project Coordination Team</strong><br/>
        <a href="mailto:ayushofficials2609@gmail.com" style="color: #2980b9;">clientflow support team</a></p>
      </div>
    `;
  };
  
  export default projectEmailFromFreelancerToClient;
  