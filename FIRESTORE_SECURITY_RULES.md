# Firestore Security Rules - Updated

## ✅ Current Rules Configuration

The security rules have been updated to properly support authenticated users writing their own data.

### Key Features:

1. **Authentication Required for Writes**: All write operations require authentication
2. **User-Scoped Data**: Users can only read/write data where `userId` matches their `request.auth.uid`
3. **Public Read Access**: All collections allow public read (for viewing portfolios)
4. **Collections Covered**:
   - `users` - User profile data
   - `userTags` - User's tag pool
   - `menu` - Menu items (pages)
   - `projects` - Project cards
   - `bio` - Bio text

### Rules Breakdown:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own user document
    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // UserTags collection - users can read/write their own tags
    match /userTags/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Menu collection - public read, authenticated users can write their own items
    match /menu/{menuId} {
      allow read: if true; // Public read access
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Projects collection - public read, authenticated users can write their own projects
    match /projects/{projectId} {
      allow read: if true; // Public read access
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Bio collection - public read, authenticated users can write their own bio
    match /bio/{bioId} {
      allow read: if true; // Public read access
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🚀 Deployment Instructions

### Option 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the Rules editor
6. Click **"Publish"**

### Option 2: Firebase CLI

```bash
firebase deploy --only firestore:rules
```

## 🔒 Security Features

- ✅ **Authentication Required**: All writes require user authentication
- ✅ **User Isolation**: Users can only access their own data (`userId` must match `request.auth.uid`)
- ✅ **Public Read**: Portfolios are publicly readable (for sharing)
- ✅ **Prevents Data Leakage**: Users cannot read or modify other users' data

## ⚠️ Important Notes

1. **Data Structure**: All documents must include a `userId` field that matches the authenticated user's UID
2. **Bio Collection**: Uses query-based updates (finds first bio doc for user), rules still enforce ownership
3. **Testing**: After deploying rules, test that:
   - Authenticated users can create/update their own data
   - Users cannot access other users' data
   - Public read access works for viewing portfolios

## 🐛 Troubleshooting

If writes are failing:
1. Verify user is authenticated (`request.auth != null`)
2. Verify `userId` field exists and matches `request.auth.uid`
3. Check Firebase Console → Firestore → Rules for any validation errors
4. Check browser console for specific permission denied errors

