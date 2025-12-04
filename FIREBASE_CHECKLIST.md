# Firebase Setup Checklist

## ✅ Already Done
- [x] Firebase package installed (`npm install firebase`)
- [x] Firebase config file ready (`lib/firebase/config.ts`)
- [x] Code is set up to use Firebase with environment variables

## 🔧 What You Need to Do in Firebase Console

### 1. Enable Firestore Database
- Go to Firebase Console → **Firestore Database**
- Click **"Create database"**
- Choose **"Start in test mode"** (for now - we'll update security rules later)
- Select a **location** (choose closest to your users)
- Click **"Enable"**

### 2. Create Collections
You need to create these 3 collections in Firestore:

#### Collection: `menu`
- Click **"Start collection"**
- Collection ID: `menu`
- Add your first document (you can add more later):
  - Field: `label` (string) = `"BUTTER"`
  - Field: `href` (string) = `"/"`
  - Field: `order` (number) = `0`
  - Document ID: Auto-generate or use `menu-1`

#### Collection: `projects`
- Click **"Start collection"**
- Collection ID: `projects`
- You can add projects later, or add one now:
  - Field: `company` (string) = `"COMPANY"`
  - Field: `year` (string) = `"2024"`
  - Field: `type` (string) = `"EXPERIMENT"`
  - Field: `title` (string) = `"My First Project"`
  - Field: `description` (string) = `"Project description"`
  - Field: `order` (number) = `1`
  - Field: `content` (map) = 
    - `showTitle` (boolean) = `true`
    - `showDescription` (boolean) = `true`
    - `showTextOnly` (boolean) = `true`
  - Document ID: Auto-generate

#### Collection: `bio` (Optional)
- Click **"Start collection"**
- Collection ID: `bio`
- Add one document:
  - Field: `text` (string) = Your bio text
  - Document ID: Auto-generate

### 3. Set Up Security Rules (IMPORTANT!)
Go to **Firestore Database** → **Rules** tab and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read for all collections
    match /menu/{document=**} {
      allow read: if true;
      allow write: if false; // Only you can write via Firebase Console or authenticated admin
    }
    
    match /projects/{document=**} {
      allow read: if true;
      allow write: if false; // Only you can write via Firebase Console or authenticated admin
    }
    
    match /bio/{document=**} {
      allow read: if true;
      allow write: if false; // Only you can write via Firebase Console or authenticated admin
    }
  }
}
```

**Note:** For the `/edit` page to work, you'll need to enable write access. For now, use test mode or set up Firebase Authentication later.

### 4. Add Environment Variables to Vercel
Go to your Vercel project → **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important:** Make sure to add these for all environments (Production, Preview, Development)

### 5. (Optional) Enable Firebase Storage
If you want to upload images directly to Firebase:
- Go to **Storage** → **Get started**
- Choose **"Start in test mode"**
- Update Storage security rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
  }
}
```

## 🧪 Testing
After setup:
1. Deploy to Vercel (or test locally with `.env.local`)
2. Visit your site - it should load data from Firebase
3. Visit `/edit` page - if security rules allow, you can edit content

## 📝 Notes
- The app falls back to mock data if Firebase isn't configured
- For local development, create `.env.local` with the same variables
- The `/edit` page requires write permissions - update security rules accordingly

