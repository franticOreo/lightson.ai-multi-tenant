# LightsOn.ai Multi-Tenant Platform

Welcome to the **LightsOn.ai Multi-Tenant** platform! This comprehensive application is designed to empower businesses—especially those with an Instagram presence—to automate and enhance their online marketing efforts.

## Table of Contents

- [Overview](#overview)
- [Business Use Case](#business-use-case)
- [Key Features](#key-features)
  - [User Signup and Onboarding](#user-signup-and-onboarding)
  - [Content Generation](#content-generation)
  - [Instagram Integration](#instagram-integration)
  - [Deployment and Environment Management](#deployment-and-environment-management)
  - [Automated Processes](#automated-processes)
- [Example Workflow](#example-workflow)
- [Benefits](#benefits)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Overview

LightsOn.ai Multi-Tenant is a platform that leverages artificial intelligence to simplify and automate the creation and management of a business's online presence. By integrating with Instagram and using advanced AI models, it streamlines content generation, SEO optimization, and website deployment.

## Business Use Case

The primary use case for this application is to assist businesses in:

- **Automating Content Creation**: Generate high-quality, SEO-optimized content without manual effort.
- **Enhancing Online Presence**: Maintain an engaging online profile across various platforms.
- **Streamlining Marketing Efforts**: Use AI to analyze and repurpose existing content for maximum impact.

This is particularly beneficial for businesses that may lack the resources or expertise to manage their digital marketing effectively.

## Key Features

### User Signup and Onboarding

- **Simple Registration**: Users sign up using their email and Instagram handle.
- **Duplicate Prevention**: The system checks for existing users to avoid duplicates.
- **Data Import**: Automatically fetches Instagram data, including profile pictures and bios, to populate business profiles.

### Content Generation

Utilizing OpenAI's GPT models, the platform can:

- **Image Analysis**: Understand and describe images from Instagram posts.
- **Color Scheme Suggestions**: Recommend complementary color codes based on the business logo.
- **Bio and Keywords Generation**: Create a compelling business bio, define a language style, and generate SEO keywords.
- **Blog Posts Creation**: Produce SEO-optimized blog posts using Instagram content and business information.
- **About Page and Services**: Generate an "About Us" page and list of services for the business website.

### Instagram Integration

- **Content Fetching**: Retrieves and analyzes Instagram posts to inform content generation.
- **Insight Generation**: Uses Instagram data to enhance marketing materials and strategies.

### Deployment and Environment Management

- **Automated Deployment**: Deploys websites via Vercel, handling environment variables and deployment statuses.
- **CMS Integration**: Manages business details within Payload CMS for consistent data management.

### Automated Processes

- **Efficiency**: Automates tasks like data fetching, content creation, and website deployment.
- **Consistency**: Ensures all platforms reflect up-to-date information and branding.

## Example Workflow

1. **Signup**:
   - The user registers with their email and Instagram handle.
   - The system checks for existing accounts and imports Instagram data.

2. **Onboarding**:
   - Generates initial business details, including a bio, language style, and SEO keywords.
   - Suggests complementary colors for branding purposes.

3. **Content Generation**:
   - AI generates blog posts, an about page, and a services list based on Instagram content and business info.

4. **Deployment**:
   - The platform deploys the website using Vercel.
   - Manages environment variables and monitors deployment status.

5. **Management**:
   - Users can update business details at any time.
   - The system synchronizes updates across the CMS and deployed website.

## Benefits

- **Time-Saving**: Automates repetitive tasks, freeing up time for other business activities.
- **Cost-Effective**: Reduces the need for a dedicated marketing team.
- **Improved SEO**: Generates content optimized for search engines to increase visibility.
- **Personalization**: Tailors content to match the business's unique voice and style.


### Known Bugs/Issues:
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

- !! URGENT !! Need to set DEV, STAGING, PROD environments properly.
    - when tenant is created, in local, tenant should be `tenant.localhost:3000`.
-- create just one .env vatiable : PUBLIC_DOMAIN...
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

