import { createUser } from '../utils/tenantUserManagement';
import { createBusinessEntry } from '../utils/createBusinessDetails';   

import { createInstagramProfileEntry, loginUser} from '../utils/instagramFunctions'; 
import uploadInitialPostsToPayload from '../utils/uploadPostsToPayload';

import { emitToSocket, getAllSocketIds } from '../socketio';

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
        const { userId, accessToken, instagramHandle } = req.body;
        console.log('[--]', userId, instagramHandle)
        
        res.status(200).send({ message: 'Onboarding completed successfully' });

    } catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).send({ error: 'Onboarding failed' });
    }
}