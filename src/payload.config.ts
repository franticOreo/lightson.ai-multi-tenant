import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import dotenv from 'dotenv'
import path from 'path'

import { Logo } from './payload/graphics/logo';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import { buildConfig } from 'payload/config'

import { Posts } from './payload/collections/Posts'
import { Tenants } from './payload/collections/Tenants'
import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Business } from './payload/collections/Business';

export default buildConfig({
  collections: [Users, Tenants, Posts, Media, Business],
  // serverURL: process.env.NODE_ENV === 'production' ? 'https://lightson.ai' : 'http://localhost:3000',
  cors: '*',
  admin: {
    bundler: webpackBundler(),
    webpack: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          dotenv: path.resolve(__dirname, "./dotenv.js"),
        },
      },
    }),
    meta: {
      titleSuffix: "- lightson.ai",
      favicon: "/assets/logo.svg",
      ogImage: "/assets/logo.svg",
    },
    components: {
      graphics: {
        Logo,
      },
    },
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "./graphql/schema.graphql"),
  },
});
