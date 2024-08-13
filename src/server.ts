import dotenv from 'dotenv'
import next from 'next'
import nextBuild from 'next/dist/build'
import path from 'path'
import startSignUp from './utils/startSignUp';

import { createServer } from 'http'
import { Server } from 'socket.io'


dotenv.config();

import express from 'express'
import payload from 'payload'

import { seed } from './payload/seed'

const app = express()
const PORT = process.env.PORT || 3000

const httpServer = createServer(app)
const io = new Server(httpServer)

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('clientReady', () => {
    console.log('clientReady')
  });

  socket.emit('test', 'Hello from server');

  io.emit('test', 'Hello from server using io.emit');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.redirect('/signup');
});


// signup user to our CMS and input their form details into the business collection.
app.post('/api/signup', startSignUp)


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

    httpServer.listen(PORT, async () => {
      payload.logger.info(`Next.js App URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}`)
    })
  })
}

start()

export { io }

