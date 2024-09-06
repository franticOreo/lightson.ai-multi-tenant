import { getUserPostUnderstandings } from '../utils/payload';
import { startDeployment } from '../utils/onboarding';
import { updateBusinessDetails } from '../utils/payload';
import { getDeployment } from '../utils/vercel';
import { sendDeploymentEmail } from '../utils/email';
import { verifySignature } from '../utils/vercel';
import payload from 'payload';

export async function getDeploymentRoute(req, res){
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  const data = await getDeployment(id);

  return res.status(200).json({ message: 'Deployment fetched successfully', data });
};

export async function getDeploymentStatusRoute(req, res){
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendStatus = async () => {
    try {
      const deployment: any = await getDeployment(id);
      const status = deployment?.readyState;
      res.write(`data: ${JSON.stringify({ status })}\n\n`);

      if (status === 'READY') {
        res.end();
        return;
      }

      setTimeout(sendStatus, 5000);
    } catch (error) {
      console.error('Error fetching deployment status:', error);
      res.write(`data: ${JSON.stringify({ error: 'Failed to fetch deployment status' })}\n\n`);
      res.end();
    }
  };

  sendStatus();
};

export const deployWebsiteRoute = async(req, res)=>{
  try {
      let { userId, businessId, accessToken, instagramHandle, renewPosts, ...data } = req.body;
      const updatedBusiness: any = await updateBusinessDetails(businessId, data)
      
      const tenantDetails = {
        tenantId: updatedBusiness.tenant.id,
        userId: userId
      }

      const userPosts: any = await getUserPostUnderstandings(userId);
      // const postUnderstandings: string[] = userPosts?.map((post: any) => post.description)
      
      const aboutPageServices = {aboutPage: updatedBusiness.aboutPage, serviceList: updatedBusiness.serviceList}
      
      // const { aboutPage } = aboutPageServices
      const businessDetailsWithDeployment = await startDeployment(userId, instagramHandle, aboutPageServices, updatedBusiness);

      res.status(200).send({ message: 'Onboarding completed successfully', data: businessDetailsWithDeployment });

  } catch (error) {
      console.error('Onboarding error:', error);
      res.status(500).send({ error: 'Error updating page' });
  }
}

export const vercelDeploymentWebhookRoute = async (req, res) => {
try {
  const isValid = await verifySignature(req);
  if (!isValid) {
    return res.status(401).send({ error: 'Invalid signature' });
  }

  const { deployment } = req?.body?.payload;

  console.log('===Deployment data:', deployment);
  if (!deployment || !deployment.url) {
    return res.status(400).send({ error: 'Invalid deployment data' });
  }
  
  const business = await payload.find({
    collection: 'business',
    where: {
      vercelDeploymentId: {
        equals: deployment.id
      }
    }
  });

  if (business.docs.length === 0) {
    return res.status(404).send({ error: 'Business not found for this project' });
  }

  const businessData = business.docs[0];

  const userEmail = businessData.email;
  const productionURL = businessData.vercelProductionURL;

  console.log('===Production URL:', productionURL);
  await sendDeploymentEmail(userEmail.toString(), productionURL.toString());

  res.status(200).send({ message: 'Deployment webhook processed successfully' });
} catch (error) {
  console.error('Deployment webhook error:', error);
  res.status(500).send({ error: 'Deployment webhook processing failed' });
}
};