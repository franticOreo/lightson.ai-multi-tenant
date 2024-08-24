import { Request } from 'express';

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'express-serve-static-core' {
  interface Request {
    isSignupOrOnboarding?: boolean;
  }
}