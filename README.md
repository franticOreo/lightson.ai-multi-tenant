# README.md

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

