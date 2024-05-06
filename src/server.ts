import dotenv from 'dotenv'
import next from 'next'
import nextBuild from 'next/dist/build'
import path from 'path'

import { handleInstagramCallback } from './utils/uploadPostsToPayload'; // Adjust the import path as necessary
import { createUser } from './utils/tenantUserManagement';
import { getPayloadAuthToken } from './utils/instagramFunctions';
import { createBusinessEntry } from './utils/createBusinessDetails';

import jwt from 'jsonwebtoken';


dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import express from 'express'
import payload from 'payload'

import { seed } from './payload/seed'



const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.redirect('/join-waitlist');
});


// signup user to our CMS and input their form details into the business collection.
// 
app.post('/api/signup', async (req, res) => {
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
});

app.get('/api/instagram/callback', handleInstagramCallback);


const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || '',
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })



  if (process.env.PAYLOAD_SEED === 'true') {
    payload.logger.info('---- SEEDING DATABASE ----')
    await seed(payload)
  }

  app.use('/assets/', express.static(path.resolve(__dirname, './payload/assets')));

  if (process.env.NEXT_BUILD) {
    console.log('NEXT_BUILD is', process.env.NEXT_BUILD)
    const server = app.listen(PORT, async () => {
      payload.logger.info(`Next.js is now building...`)
      // @ts-expect-error
      await nextBuild(path.join(__dirname, '../'))
      process.exit()
    });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

    return
  }

  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
  
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(`Request to ${req.method} ${req.url} sent response ${res.statusCode}`);
    });
    next();
  });

  const nextApp = next({
    dev: process.env.NODE_ENV !== 'production',
  })

  const nextHandler = nextApp.getRequestHandler()

  app.use((req, res) => nextHandler(req, res))

  nextApp.prepare().then(() => {
    payload.logger.info('Starting Next.js...')

    app.listen(PORT, async () => {
      payload.logger.info(`Next.js App URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}`)
    })
  })
}

start()
