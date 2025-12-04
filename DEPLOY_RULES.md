# Deploy Firestore Rules

## Current Status
✅ Rules file created: `firestore.rules`
✅ Firebase config created: `firebase.json`

## Option 1: Manual Deployment (Recommended)

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project: `project-3283170620316444791`
   - Navigate to **Firestore Database** → **Rules** tab

2. **Copy Rules**
   - Open `firestore.rules` file in this project
   - Copy all the content
   - Paste into Firebase Console Rules editor

3. **Publish**
   - Click **"Publish"** button

## Option 2: CLI Deployment (If permissions fixed)

If you fix the CLI permissions:

```bash
firebase deploy --only firestore:rules --project project-3283170620316444791
```

### To Fix CLI Permissions:
1. Make sure you're logged in with the correct Google account that owns the Firebase project
2. Check Firebase Console → Project Settings → Users and permissions
3. Ensure your account has "Owner" or "Editor" role

## Rules Content

The rules allow:
- ✅ **Read access** for everyone (public)
- ❌ **Write access** restricted (only via Firebase Console or authenticated admin)

This is perfect for production - your portfolio is publicly readable, but only you can edit via the `/edit` page (once you add authentication) or Firebase Console.

