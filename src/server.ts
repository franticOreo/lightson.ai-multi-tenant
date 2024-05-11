import dotenv from 'dotenv'
import next from 'next'
import nextBuild from 'next/dist/build'
import path from 'path'
import fs from 'fs'
import { tenantExists } from './utils/tenantUserManagement';
import { handleInstagramCallback } from './utils/handleInstagramCallback'; // Adjust the import path as necessary
import startSignUp from './utils/startSignUp';


dotenv.config();

// if (process.env.NODE_ENV !== 'production') {
//   const dotenvResult = dotenv.config({
//     path: path.resolve(__dirname, '../.env'),
//   });

//   if (dotenvResult.error) {
//     console.error('Failed to load .env file:', dotenvResult.error);
//   } else {
//     console.log('.env file loaded:', dotenvResult.parsed);
//   }
// }

import express from 'express'
import payload from 'payload'

import { seed } from './payload/seed'



const app = express()
const PORT = process.env.PORT || 3000

// Route for Cloudflare custom hostname challenge
app.get('/.well-known/cf-custom-hostname-challenge/:challenge', (req, res) => {
    const challenge = req.params.challenge;
    const filePath = path.join(__dirname, 'public', '.well-known', 'cf-custom-hostname-challenge', challenge);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.redirect('/join-waitlist');
});


// signup user to our CMS and input their form details into the business collection.
app.post('/api/signup', startSignUp)
// startSignUp triggers instagram callback
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

  

  app.use(async (req, res, next) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0]; // Extract the subdomain from the hostname
  
    // Check if the hostname is directly the domain or a subdomain
    if (hostname === 'domain.com' || hostname === 'www.domain.com') {
      // No subdomain, proceed with the request
      next();
    } else {
      // There is a subdomain, check if it corresponds to a valid tenant
      try {
        const exists = await tenantExists(subdomain);
        if (!exists) {
          return res.status(404).send("Tenant not found");
        }
        // Tenant exists, redirect to the admin panel of the subdomain
        if (!req.originalUrl.includes('/admin')) {
          return res.redirect(`https://${subdomain}.domain.com/admin`);
        }
        // If already accessing some part of /admin, continue processing
        next();
      } catch (error) {
        console.error(`Error while checking tenant: ${error}`);
        res.status(500).send("Server error");
      }
    }
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
