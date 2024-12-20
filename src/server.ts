import dotenv from 'dotenv'
import next from 'next'
import nextBuild from 'next/dist/build'
import path from 'path'
import { signUpRoute, onBoardingRoute } from './routes/signup';
import { createServer } from 'http'
import { initIO } from './socketio'
import express from 'express'
import payload from 'payload'
import { deployWebsiteRoute, getDeploymentStatusRoute, vercelDeploymentWebhookRoute } from './routes/deployments';
import { getDeployment } from './utils/vercel';

dotenv.config();

const app = express()
const PORT = process.env.PORT || 3000

const httpServer = createServer(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.get('/', (req, res) => {
//   res.redirect('/join-waitlist');
// });

// signup user to our CMS and input their form details into the business collection.
app.post('/api/signup', signUpRoute);

app.get('/api/onboarding', onBoardingRoute);

app.post('/api/deployments', deployWebsiteRoute)
app.get('/api/deployments/status', getDeploymentStatusRoute)
app.post('/api/deployments/webhook', vercelDeploymentWebhookRoute)
app.get('/api/deployments', getDeployment)

const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || '',
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

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
    // console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
  
  app.use((req, res, next) => {
    res.on('finish', () => {
      // console.log(`Request to ${req.method} ${req.url} sent response ${res.statusCode}`);
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
    const io = initIO(httpServer)

    httpServer.listen(PORT, async () => {
      payload.logger.info(`Next.js App URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}`)
    })
  })
}

start()

export { app }