import { createUser } from './tenantUserManagement';
import { createBusinessEntry } from './createBusinessDetails';   

import { createInstagramProfileEntry, loginUser} from './instagramFunctions'; 
import uploadInitialPostsToPayload from './uploadPostsToPayload';

import { emitToSocket, getAllSocketIds } from '../socketio';

export default async function startSignUp(req, res) {
    try {
      const { email, instagramHandle } = req.body;

      // if instagramHanlde contains a . replace with _
      const sanitizedInstagramHandle = instagramHandle.replace('.', '_');

      const createdUser = await createUser(email);
      const userId = createdUser.id;

      // Emit to all connected sockets
      const allSocketIds = getAllSocketIds();
      allSocketIds.forEach(socketId => {
        emitToSocket(socketId, 'test', `User ${userId} signed up with email ${email}`);
      });

      // TODO: NOT USE ADMIN
      const loginResponse = await loginUser(null, null, true)
      console.log(loginResponse)
      const accessToken = loginResponse.token

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
  
      // Return the instagramHandle to the client
      console.log('Redirecting to onboarding...');
      // TODO: change this!
      res.redirect(302, `/onboarding?userId=${userId}&accessToken=${accessToken}`);
  
      try {
        console.log('Beginning post creation pipeline.');
        const response = await uploadInitialPostsToPayload(userId, sanitizedInstagramHandle, 4)
        // console.log(response)
      } catch (error) {
        console.error('Error during additional processing:', error);
      }
  
  
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).send({ error: 'Signup failed' });
    }
  }