# Testing Firebase Connection

## Quick Test

To test if Firebase is connected and working:

### Option 1: Using the Test Script

1. **Create `.env.local` file** in the project root with your Firebase config:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. **Run the test script**:
```bash
npm run test:firebase
```

This will:
- ✅ Check if Firebase config is provided
- ✅ Initialize Firebase connection
- ✅ Test reading from `menu`, `projects`, and `bio` collections
- ✅ Show how many documents are found in each collection

### Option 2: Test via Dev Server

1. **Create `.env.local`** with your Firebase config (same as above)

2. **Start the dev server**:
```bash
npm run dev
```

3. **Check the browser console** - it will show:
   - `"Firebase not configured, using mock data"` if Firebase isn't set up
   - Or it will load data from Firebase if configured correctly

4. **Visit `/edit` page** - if Firebase is connected, you can edit content and it will save

## What to Expect

### ✅ Success
```
🔥 Testing Firebase Connection...

✅ Firebase config found!
   Project ID: your-project-id
   Auth Domain: your-project.firebaseapp.com

📡 Initializing Firebase...
✅ Firebase initialized!

🗄️  Testing Firestore connection...
   Reading from "menu" collection...
   ✅ Found 3 menu items
   Reading from "projects" collection...
   ✅ Found 2 projects
   Reading from "bio" collection...
   ✅ Found 1 bio document(s)

🎉 Firebase connection successful!
```

### ❌ Failure (No Config)
```
❌ Firebase not configured!

Missing environment variables:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID

💡 Create a .env.local file with your Firebase config
```

### ❌ Failure (Permission Denied)
```
❌ Firebase connection failed!

Error details:
   Message: Missing or insufficient permissions.
   Code: permission-denied

💡 This might be a security rules issue.
   Make sure Firestore is in "test mode" or security rules allow reads.
```

## Troubleshooting

### "Permission Denied" Error
- Go to Firebase Console → Firestore Database → Rules
- Make sure rules allow reads: `allow read: if true;`
- Or start Firestore in "test mode" (allows all reads/writes for 30 days)

### "Collection Not Found" Warning
- This is OK if you haven't created collections yet
- Create `menu`, `projects`, and `bio` collections in Firestore
- See `FIREBASE_CHECKLIST.md` for collection structure

### Environment Variables Not Loading
- Make sure `.env.local` is in the project root (same level as `package.json`)
- Restart the dev server after creating/updating `.env.local`
- Variables must start with `NEXT_PUBLIC_` to be available in the browser

## Next Steps

Once Firebase is connected:
1. ✅ Add data to Firestore collections (see `FIREBASE_CHECKLIST.md`)
2. ✅ Test reading data on the homepage
3. ✅ Test editing data on `/edit` page
4. ✅ Deploy to Vercel and add environment variables there

