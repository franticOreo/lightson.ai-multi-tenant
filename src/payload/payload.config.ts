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
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

dotenv.config()

const digitalOceanAdapter = s3Adapter({
  config: {
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: process.env.DO_SPACE_REGION,
    credentials: {
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
    },
  },
  bucket: process.env.DO_SPACES_BUCKET,
})

export default buildConfig({
  collections: [Users, Tenants, Posts, Media, Business, Waitlists],
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
  plugins: [
    cloudStorage({
      collections: {
        'media': {
          adapter: digitalOceanAdapter,
          disableLocalStorage: true
        },
      },
    }),
  ],
});
