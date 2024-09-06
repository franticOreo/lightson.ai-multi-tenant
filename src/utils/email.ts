import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendDeploymentEmail(email: string, productionURL: string) {
  const msg = {
    to: email,
    from: 'your-verified-sender@example.com', // Replace with your SendGrid verified sender
    subject: 'Your Website is Live!',
    text: `Congratulations! Your website is now live at: ${productionURL}`,
    html: `
      <h1>Congratulations!</h1>
      <p>Your website is now live and ready to view.</p>
      <p>You can access it at: <a href="${productionURL}">${productionURL}</a></p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Deployment email sent successfully');
  } catch (error) {
    console.error('Error sending deployment email:', error);
  }
}