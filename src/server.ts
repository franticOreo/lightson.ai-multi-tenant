import dotenv from 'dotenv'
import next from 'next'
import path from 'path'

import { handleInstagramCallback } from './utils/uploadPostsToPayload'; // Adjust the import path as necessary

import jwt from 'jsonwebtoken';


dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import express from 'express'
import payload from 'payload'

import { seed } from './payload/seed'

const app = express()
const PORT = process.env.PORT || 3000

// app.get('/', (_, res) => {
//   res.redirect('/admin')
// })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/api/signup', async (req, res) => {
  try {
    const { client_instagram_handle, client_email, password } = req.body;

    console.log(req.body)

    const createdTenant = await payload.create({
      collection: "tenants",
      data: {
        name: client_instagram_handle,
        domains: [{ domain: `${client_instagram_handle}.${process.env.PAYLOAD_PUBLIC_SERVER_BASE}` }],
      },
    })

    const createdUser = await payload.create({
      collection: "users",
      data: {
        email: client_email,
        password: password,
        roles: ["user"],
        tenants: [
          {
            tenant: createdTenant.id,
            roles: ["admin"],
          },
        ],
      },
    })

    const userToken = jwt.sign(
      { 
        user_id: createdUser.id, 
        tenant_id: createdTenant.id 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    const state = encodeURIComponent(JSON.stringify({ userToken }));
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI)}&scope=user_profile,user_media&response_type=code&state=${state}`;
    res.redirect(instagramAuthUrl);

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
    app.listen(PORT, async () => {
      payload.logger.info(`Next.js is now building...`)
      // @ts-expect-error
      await nextBuild(path.join(__dirname, '../'))
      process.exit()
    })

    return
  }

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
