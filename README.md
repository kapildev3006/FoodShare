# FoodShare - Food Wastage Management Platform

FoodShare is a responsive web application built with Next.js and Firebase that helps reduce food waste by allowing users to share, donate, or sell excess food they cannot consume.

## Features

- **User Authentication**: Sign up/in with Google or email/password
- **User Profiles**: Store user details including name, city, state, and contact information
- **Food Listings**: Create, view, and manage food listings with details, images, and expiry dates
- **Image Upload**: Upload images via Cloudinary with upload presets
- **Location-Based Search**: Find food listings based on the user's city
- **Donations**: Option to donate food or sell it at a price
- **Responsive Design**: Works on all device sizes
- **Animations**: Smooth transitions and animations using Framer Motion

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Image Storage**: Cloudinary
- **Animation**: Framer Motion
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Firebase account
- Cloudinary account

### Setup

1. Clone the repository

```bash
git clone <repository-url>
cd food-wastage-management
```

2. Install dependencies

```bash
npm install
```

3. Create a Firebase project
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up Authentication (enable Google and Email/Password)
   - Create a Firestore database
   - Create a Storage bucket
   - Register a web app and obtain your Firebase config

4. Set up Cloudinary
   - Create a [Cloudinary account](https://cloudinary.com/)
   - Create an upload preset for unsigned uploads
   - Note your cloud name and upload preset name

5. Create a `.env.local` file in the project root with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

6. Run the development server

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── app/             # App directory containing routes
│   ├── components/       # Reusable components
│   ├── context/         # React context files
│   ├── firebase/        # Firebase configuration
│   ├── models/          # TypeScript interfaces
│   └── utils/           # Utility functions
├── .env.local           # Environment variables (create this file locally)
└── next.config.ts      # Next.js configuration
```

## Key Pages

- `/`: Homepage with search functionality
- `/login`: User login page
- `/signup`: User registration page
- `/profile/setup`: Profile completion page
- `/listings`: Browse all food listings
- `/listings/[id]`: Individual food listing details
- `/add-listing`: Create a new food listing

## Firebase Security Rules

This project includes comprehensive security rules for Firestore and Firebase Storage to protect your data. The rules are defined in `firestore.rules` and `storage.rules` in the project root.

### Deploying Security Rules

1. Install the Firebase CLI if you haven't already:

```bash
npm install -g firebase-tools
```

2. Login to your Firebase account:

```bash
firebase login
```

3. Initialize Firebase in your project directory (if not already done):

```bash
firebase init
```

4. Select Firestore and Storage when prompted for which Firebase features to set up.

5. Deploy the security rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### Understanding the Rules

The security rules implement the following permissions:

#### Firestore Rules

- **Users Collection**:
  - Read: Authenticated users can read profiles
  - Create: Users can only create their own profiles
  - Update: Users can only update their own profiles
  - Delete: Not allowed (should be handled by admin functions)

- **Food Listings Collection**:
  - Read: Public (anyone can view listings)
  - Create: Authenticated users with required fields
  - Update/Delete: Only the owner of the listing

- **Wishlist Collection**:
  - Read/Write: Users can only access their own wishlist items

- **Conversations Collection**:
  - Read/Write: Only participants in the conversation

- **Messages Collection**:
  - Read: Only participants in the conversation
  - Create: Authenticated users can send messages to conversations they're part of
  - Update: Only to mark messages as read
  - Delete: Not allowed

#### Storage Rules

- **Profile Images**:
  - Read: Public
  - Write: Only the owner of the profile

- **Food Listing Images**:
  - Read: Public
  - Write: Only the authenticated user to their own directory

## Deployment

The easiest way to deploy this application is to use the [Vercel Platform](https://vercel.com/new). Connect your GitHub repository and deploy with environment variables set up in the Vercel dashboard.

## License

This project is licensed under the MIT License.
