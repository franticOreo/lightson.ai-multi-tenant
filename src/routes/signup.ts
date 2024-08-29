import { createUser } from '../utils/payload';
import { createBusinessEntry } from '../utils/createBusinessDetails';   
import payload from 'payload';
import { createInstagramProfileEntry, loginUser} from '../utils/instagramFunctions'; 
import { getInstagramPostsAndPostToPayload, startDeployment, setUpBusinessDetailsAndPosts } from '../utils/onboarding';
import { updateBusinessDetails } from '../utils/payload';
import { emitToSocket, getAllSocketIds } from '../socketio';
import { generateAboutPage } from '../utils/gpt';
import { fetchInstagramData } from '../utils/instagramBio';


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
        createInstagramProfileEntry({
          payloadUserId: userId.toString(),
          instagramUserId: 'notNanny',
          instagramHandle: sanitizedInstagramHandle,
          accessToken: 'notNanny',
        })
        .catch(error => {
          console.error('Background process error:', error);
        })
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

        const postCreationResponse = await getInstagramPostsAndPostToPayload(4, instagramHandle, updatedBusiness, tenantDetails, accessToken, renewPosts);

        const postUnderstandings = postCreationResponse.postUnderstandings;
        
        const aboutPageServices = await generateAboutPage(updatedBusiness, postUnderstandings);
        const { aboutPage } = aboutPageServices

        const updatedBusinessDetailsAgain = await updateBusinessDetails(updatedBusiness.id, {aboutPage})

        const businessDetailsWithDeployment = await startDeployment(userId, instagramHandle, aboutPageServices, updatedBusinessDetailsAgain);
        
        res.status(200).send({ message: 'Onboarding completed successfully', data: businessDetailsWithDeployment });

    } catch (error) {
        console.error('Onboarding error:', error);

        res.status(500).send({ error: 'Error updating page' });
    }
}