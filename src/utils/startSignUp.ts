import { createUser } from './tenantUserManagement';
import { getPayloadAuthToken } from './instagramFunctions';
import { createBusinessEntry } from './createBusinessDetails';   

export default async function startSignUp(req, res) {
    try {
      
      const {
        email,
        password,
        fullName,
        businessName,
        businessPhone,
        businessAddress,
        serviceArea,  
        businessHours,
        operatingHours,
      } = req.body;
      console.log(req.body)
  
      const createdUser = await createUser(email, password);
      const userId = createdUser.id;
  
      const businessDetails = {
        userId,
        fullName,
        email,
        businessName,
        businessPhone,
        businessAddress,
        operatingHours,
        serviceArea,
        businessHours,
      };
  
      const payloadToken = await getPayloadAuthToken();
      console.log("Payload token received:", payloadToken);
   
      console.log("Creating business entry...");
      const createdBusiness = await createBusinessEntry(businessDetails, payloadToken);
      console.log("Business entry created");
  
      const clientId = '743103918004392';
      const scope = 'user_profile,user_media';
      const state = encodeURIComponent(JSON.stringify({ userId: userId }));
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=${scope}&response_type=code&state=${state}`;
  
      console.log("Generated Instagram auth URL:", authUrl);
      // return back to the client with the instagram redirect.
      res.json({ authUrl });
  
  
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).send({ error: 'Signup failed' });
    }
  }

