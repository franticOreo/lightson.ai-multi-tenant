import { createUser } from '../utils/tenantUserManagement';
import { createBusinessEntry } from '../utils/createBusinessDetails';   

import { createInstagramProfileEntry, loginUser} from '../utils/instagramFunctions'; 
import uploadInitialPostsToPayload, { updateBusinessDetails, getInstagramPostsAndPostToPayload, startDeployment } from '../utils/uploadPostsToPayload';

import { emitToSocket, getAllSocketIds } from '../socketio';
import { generateAboutPage } from '../utils/gpt';
import payload from 'payload';

export async function signUpRoute(req, res) {
    try {
      // const { email, password, instagramHandle } = req.body;
      const { email, instagramHandle } = req.body;

      // if instagramHanlde contains a . replace with _
      const sanitizedInstagramHandle = instagramHandle.replace('.', '_');

      let createdUser = await createUser(email, 'testy');
      const userId = createdUser.id;


      // Emit to all connected sockets
      const allSocketIds = getAllSocketIds();
      allSocketIds.forEach(socketId => {
        emitToSocket(socketId, 'test', `User ${userId} signed up with email ${email}`);
      });

      // TODO: NOT USE ADMIN
      const loginResponse = await loginUser(email, 'testy', false)
      console.log('Login Response', loginResponse)
      const accessToken = loginResponse.token

      createdUser.accessToken = accessToken
      createdUser.instagramHandle = sanitizedInstagramHandle

      const businessDetails = {
          userId,
          instagramHandle: sanitizedInstagramHandle,
          email
      };

      console.log("Creating business entry...");
      console.log(businessDetails)
      const createdBusiness = await createBusinessEntry(businessDetails);
      console.log(createdBusiness)
      console.log("Business entry created");
  
      
  
      const entryResponse = await createInstagramProfileEntry({
        payloadUserId: userId.toString(),
        instagramUserId: 'notNanny',
        instagramHandle: sanitizedInstagramHandle,
        accessToken: 'notNanny',
      })
  
      console.log('Created instagram profile entry:', entryResponse)

      await uploadInitialPostsToPayload(userId.toString(), sanitizedInstagramHandle, 4, accessToken);
  
      // Return the necessary data to the client
      res.status(200).json({ userId, accessToken, instagramHandle: sanitizedInstagramHandle });
  
  
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).send({ error: 'Signup failed' });
    }
}

export const onBoardingRoute = async(req, res)=>{
    try {
        const { userId, accessToken, instagramHandle } = req.query;
        
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
        const { userId, businessId, accessToken, instagramHandle, ...data } = req.body;

        const updatedBusiness: any = await updateBusinessDetails(businessId, data)
        
        console.log('new update', updatedBusiness)
        
        
        const tenantDetails = {
          tenantId: updatedBusiness.tenant.id,
          userId: userId
        }

        const postCreationResponse = await getInstagramPostsAndPostToPayload(4, instagramHandle, updatedBusiness, tenantDetails, accessToken);

        const postUnderstandings = postCreationResponse.postUnderstandings;
        console.log('postUnderstandings', postUnderstandings)
        
        const aboutPageServices = await generateAboutPage(updatedBusiness, postUnderstandings);
        const { aboutPage } = aboutPageServices

        const updatedBusinessDetailsAgain = await updateBusinessDetails(updatedBusiness.id, {aboutPage})

        console.log('added about page and service list to business details')

        const domainUrl = await startDeployment(userId, instagramHandle, aboutPageServices, updatedBusinessDetailsAgain);
        console.log('domainUrl', domainUrl)

        updatedBusiness.domainUrl = domainUrl
        
        res.status(200).send({ message: 'Onboarding completed successfully', data: updatedBusiness });

    } catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).send({ error: 'Onboarding failed' });
    }
}