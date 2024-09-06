import { createUser, getUserPostUnderstandings } from '../utils/payload';
import { createBusinessEntry } from '../utils/createBusinessDetails';   
import payload from 'payload';
import { loginUser } from '../utils/instagramFunctions'; 
import { getInstagramPostsAndPostToPayload, startDeployment, setUpBusinessDetailsAndPosts } from '../utils/onboarding';
import { updateBusinessDetails } from '../utils/payload';
import { emitToSocket, getAllSocketIds } from '../socketio';
import { generateAboutPage } from '../utils/gpt';
import { fetchInstagramData } from '../utils/instagramBio';
import { sendDeploymentEmail } from '../utils/email';
import { verifySignature } from '../utils/vercel';

export async function signUpRoute(req, res) {
    try {
      const { email, instagramHandle } = req.body;

      const sanitizedInstagramHandle = instagramHandle.replace('.', '_').replace('@', '').toLowerCase().trim();

      // Check if email or Instagram handle already exists
      const existingBusiness = await payload.find({
        collection: 'business',
        where: {
          or: [
            {
              email: {
                equals: email
              }
            },
            {
              instagramHandle: {
                equals: sanitizedInstagramHandle
              }
            }
          ]
        }
      });

      const instagramData = await fetchInstagramData(instagramHandle)
      
      if (existingBusiness.docs.length > 0) {
        const existingDoc = existingBusiness.docs[0];
        if (existingDoc.email === email) {
          return res.status(400).json({ error: 'User with this email already exists' });
        } else {
          return res.status(400).json({ error: 'User with this Instagram handle already exists' });
        }
      }
      else if (instagramData === null) {
        return res.status(400).json({ error: 'Instagram handle not found' });
      }

      let createdUser = await createUser(email, 'testy');
      const userId = createdUser.id;

      // Emit to all connected sockets
      const allSocketIds = getAllSocketIds();
      allSocketIds.forEach(socketId => {
        emitToSocket(socketId, 'test', `User ${userId} signed up with email ${email}`);
      });

      // TODO: NOT USE ADMIN
      const loginResponse = await loginUser(email, 'testy', false)
      const accessToken = loginResponse.token

      const businessDetails = {
          userId,
          instagramHandle: sanitizedInstagramHandle,
          email
      };

      await createBusinessEntry(businessDetails);

      Promise.resolve().then(() => {
        setUpBusinessDetailsAndPosts(userId.toString(), sanitizedInstagramHandle, 4, accessToken).catch(error => {
          console.error('Background process error:', error);
        });
      });

      res.status(200).json({ userId, accessToken, instagramHandle: sanitizedInstagramHandle });
  
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).send({ error: 'Signup failed' });
    }
}

export const onBoardingRoute = async(req, res)=>{
    try {
        const { userId } = req.query;
        
        const response = await payload.find({
            collection: 'business',
            where: {
                userId: {
                    equals: userId
                }
            }
        })

        let data = {}
        if (response.docs.length > 0) {
          data = response.docs[0]
        }
        
        res.status(200).send({ message: 'Onboarding completed successfully', data });

    } catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).send({ error: 'Onboarding failed' });
    }
}

export const regenerateAboutPage = async(req, res)=>{
    try {
        let { userId, businessId, accessToken, instagramHandle, renewPosts, ...data } = req.body;
        const updatedBusiness: any = await updateBusinessDetails(businessId, data)
        
        const tenantDetails = {
          tenantId: updatedBusiness.tenant.id,
          userId: userId
        }

        const userPosts: any = await getUserPostUnderstandings(userId);
        const postUnderstandings: string[] = userPosts?.map((post: any) => post.description)
        
        const aboutPageServices = {aboutPage: updatedBusiness.aboutPage, serviceList: updatedBusiness.serviceList}
        
        const { aboutPage } = aboutPageServices
        const businessDetailsWithDeployment = await startDeployment(userId, instagramHandle, aboutPageServices, updatedBusiness);

        res.status(200).send({ message: 'Onboarding completed successfully', data: businessDetailsWithDeployment });

    } catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).send({ error: 'Error updating page' });
    }
}

export const vercelDeploymentWebhook = async (req, res) => {
  try {
    const isValid = await verifySignature(req);
    if (!isValid) {
      return res.status(401).send({ error: 'Invalid signature' });
    }

    const { deployment } = req.body;

    if (!deployment || !deployment.url) {
      return res.status(400).send({ error: 'Invalid deployment data' });
    }

    const productionURL = deployment.url;
    const projectId = deployment.projectId;

    const business = await payload.find({
      collection: 'business',
      where: {
        vercelProjectId: {
          equals: projectId
        }
      }
    });

    if (business.docs.length === 0) {
      return res.status(404).send({ error: 'Business not found for this project' });
    }

    const businessData = business.docs[0];

    const userEmail = businessData.email;

    await sendDeploymentEmail(userEmail.toString(), productionURL);

    await payload.update({
      collection: 'business',
      id: businessData.id,
      data: {
        vercelProductionURL: productionURL
      }
    });

    res.status(200).send({ message: 'Deployment webhook processed successfully' });
  } catch (error) {
    console.error('Deployment webhook error:', error);
    res.status(500).send({ error: 'Deployment webhook processing failed' });
  }
};