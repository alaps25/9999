# Quick Fix: Firebase CLI Permissions

## Problem
Project `project-3283170620316444791` is not accessible to CLI account `alapshah.com@gmail.com`.

## Solution: Grant Permissions in Firebase Console

### Step 1: Add Your Account to Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **project-3283170620316444791**
3. Click **⚙️ Settings** (gear icon) → **Users and permissions**
4. Click **"Add user"**
5. Enter email: **alapshah.com@gmail.com**
6. Select role: **"Editor"** (allows deployment)
7. Click **"Add"**

### Step 2: Wait & Verify
Wait 1-2 minutes for permissions to propagate, then verify:

```bash
firebase projects:list | grep 3283170620316444791
```

If you see the project, you're good to go!

### Step 3: Deploy Rules
```bash
cd /Users/alap.shah/Downloads/Personal/Projects/Wires
firebase use project-3283170620316444791
firebase deploy --only firestore:rules
```

## Alternative: If Project Belongs to Different Account

If the project belongs to a different Google account:

```bash
# Logout current account
firebase logout

# Login with the account that owns the project
firebase login

# Verify access
firebase projects:list

# Deploy
firebase deploy --only firestore:rules --project project-3283170620316444791
```

## After Fixing Permissions

Once permissions are fixed, you can deploy rules anytime with:

```bash
firebase deploy --only firestore:rules
```

The rules file is already created at `firestore.rules` and ready to deploy!

