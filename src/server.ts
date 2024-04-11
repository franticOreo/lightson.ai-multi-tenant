import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import express from 'express'
import payload from 'payload'

import { seed } from './seed'

const app = express()

// Define the redirect rules
app.use((req, res, next) => {
  if (req.hostname === 'www.lightson.ai') {
    return res.redirect(301, `https://lightson.ai${req.originalUrl}`);
  }
  if (req.hostname === 'lightson.ai') {
    return res.redirect(301, `https://www.lightson.ai${req.originalUrl}`);
  }
  next();
});


app.get('/', (_, res) => {
  res.redirect('/admin')
})



const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  if (process.env.PAYLOAD_SEED === 'true') {
    payload.logger.info('---- SEEDING DATABASE ----')
    await seed(payload)
  }

  app.use('/assets', express.static(path.resolve(__dirname, './assets')));

  app.listen(3000)
}

start()
