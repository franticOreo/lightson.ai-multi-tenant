# README.md

# lightson.ai Documentation

Known Bugs/Issues:
- startSignUp does not provide helpful information to the client if the email sign up fails.
- /signup form claims "field is required" when fields are filled (after going back to previous page).
will need to implement a IP proxy method or rotator to avoid this at scale.
- createBusinessEntry in startSignup, I don't think auth token is required.

- fetchInstagramUserHeader : need to utilise profile pic and full-name (no longer required in sign up flow)

- openai client is instatiated locally, probally needs be classed.

- Docker/Payload : .env variables are not being passed???
- ARG PAYLOAD_SECRET 

- In the /signup route there is a double of the hours field, two are not needed. Remove one.

- Handle the case where during the instagram authentication, the user has 0 posts.

- Remove tenant field in post creation, should be automatically set and invisible for end-user.

- lastloggedintenant field within the Users field needs to be removed from standard users. This value should never change. 

- getInstagramPosts only returns the first image of coursels, the subsequent images could be stored or handled.

- I am calling the Hiker API twice, I need to smartly store the response in a seperate db to avoid calling it twice. 


##


## Web Application Architecture Summary
Backend
Node.js with Express: Serves as the main backend framework.
Payload CMS: Integrated for content management, handling CMS admin functionalities and asset management.
Environment Configuration: Managed using dotenv for sensitive and environment-specific variables.
Frontend
Next.js and React: Used for building the user interface, supporting server-side rendering for improved performance and SEO.
Component-Based Architecture: Utilizes reusable React components for UI elements like headers, footers, and forms.
SCSS for Styling: Organized into partials and utilities for a scalable and maintainable styling system.
Deployment
Docker: Containerization is used for consistent environments across development and production, defined in Dockerfiles and managed with Docker Compose for local development setups.
Database and Storage
MongoDB: Utilized as the primary database through Payload CMS's adapter.
DigitalOcean Spaces: Configured for cloud storage, handling file uploads and static assets.
This architecture provides a robust platform combining modern web technologies for efficient content management, dynamic web serving, and scalable deployment practices.

