import { createUser } from './tenantUserManagement';
import { createBusinessEntry } from './createBusinessDetails';   

import { createInstagramProfileEntry} from './instagramFunctions'; 
import uploadInitialPostsToPayload from './uploadPostsToPayload';

export default async function startSignUp(req, res) {
    try {
      const { email, instagramHandle } = req.body;
      const createdUser = await createUser(email);
      const userId = createdUser.id;

      const businessDetails = {
          userId,
          instagramHandle,
          email
      };

      console.log("Creating business entry...");
      console.log(businessDetails)
      const createdBusiness = await createBusinessEntry(businessDetails);
      console.log(createdBusiness)
      console.log("Business entry created");
  
      
  
      const entryResponse = await createInstagramProfileEntry({
        payloadUserId: userId,
        instagramUserId: 'notNanny',
        instagramHandle: instagramHandle,
        accessToken: 'notNanny',
      })
  
      console.log('Created instagram profile entry:', entryResponse)
  
      // Return the instagramHandle to the client
      console.log('Redirecting to onboarding...');
      res.redirect(302, `/onboarding?userId=${userId}`);
  
      try {
        console.log('Beginning post creation pipeline.');
        const response = await uploadInitialPostsToPayload(userId, instagramHandle, 4)
        console.log(response)
      } catch (error) {
        console.error('Error during additional processing:', error);
      }
  
  
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).send({ error: 'Signup failed' });
    }
  }

