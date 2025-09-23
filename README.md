# RESZEN8 Webapp

## Architecture

## FRONTEND

Frontend web app is a React app, using Redux toolkit for basic app-wide state management.

There are instances of Context to handle audio playback and store-cart managements.

Page content such as text, membership tiers and FAQs come from www.contentful.com CMS.

Hosting is with Netlify.com, where the frontend SPA lives and communications via a series of APIs for its functionality.

## BACKEND

Reszen8 backend is a serverless architecture, utilising AWS services for authentication, data retrieval and managements, email server and payment-flow.

### Authentication

AWS Cognito login via hosted login/signup page

### Data

AWS APIs established through the API Gateway, to call Lambda functions which interact with DynamoDB for Users, Users_Bespoke_Meditations, Static_Meditations content which we update as a user adds 'likes', saves items, updates their subscription, plus other actions.

### Payments

Stripe APIs connected via the AWS APIs allow the React app to communicate with Stripe to initiate payment flows, and update User data on successful transactions using webhook connection between Stripe and AWS.

### Emails

Emails from the site get sent using an AWS API to a Lambda which currently uses the reszen8 gmail address with gmail smtp.

## Meditation Generation

Parameters for generating a meditations are sent via an AWS API to a Lambda function, which invokes a call to the openAI API to generate a script for the meditations. When this is successfully returned, we send the script to Microsoft's Azure TTS to generate the audio track.

Once we have this, audio is stored in AWS S3 storage and linked to a new object in the DynamoDB.

### Immersive Audio

These sound files are either retrieved from Contentful or included in the codebase. React has a custom audio-player which will play both tracks together.
