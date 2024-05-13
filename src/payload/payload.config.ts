import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import dotenv from 'dotenv'
import path from 'path'
import { Logo } from './graphics/logo';
import { buildConfig } from 'payload/config'
import { Posts } from './collections/Posts'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Business } from './collections/Business';
import { Waitlists } from './collections/Waitlists'
import { InstagramProfiles } from './collections/InstagramProfiles'

dotenv.config()

export default buildConfig({
  serverURL: "https://lightson.ai",
  collections: [Users, Tenants, Posts, Media, Business, Waitlists, InstagramProfiles],
  cors: '*',
  admin: {
    bundler: webpackBundler(),
    webpack: (config) => {
      if (config.resolve) {
        return {
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve.alias,
            },
          },
        };
      } else {
        return config;
      }
    },
    meta: {
      titleSuffix: "- lightson.ai",
      favicon: "/favicon.ico",
      ogImage: "/payload/assets/logo.svg",
    },
    components: {
      graphics: {
        Logo,
      },
    },
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || false,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "./graphql/schema.graphql"),
  },
});
