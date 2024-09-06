import sgMail from '@sendgrid/mail';

console.log('===SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendDeploymentEmail(email: string, productionURL: string) {
  const senderEmail = process.env.SENDGRID_FROM_EMAIL;
  const msg = {
    to: email,
    from: senderEmail,
    subject: 'Your Website is Live!',
    text: `Congratulations! Your website is now live at: ${productionURL}`,
    html: `
      <h1>Congratulations!</h1>
      <p>Your website is now live and ready to view.</p>
      <p>You can access it at: <a href="${productionURL}">${productionURL}</a></p>
    `,
  };

  console.log('===Sending deployment email:', JSON.stringify(msg));

  try {
    await sgMail.send(msg);
    console.log('Deployment email sent successfully');
  } catch (error) {
    console.error('Error sending deployment email:', JSON.stringify(error?.response?.body));
  }
}