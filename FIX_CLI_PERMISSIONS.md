# Fix Firebase CLI Permissions

## Current Issue
The Firebase CLI is logged in as `alapshah.com@gmail.com` but doesn't have permission to deploy to project `project-3283170620316444791`.

## Solution Steps

### Step 1: Verify Project Ownership
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Check if project `project-3283170620316444791` appears in your project list
3. If it doesn't appear, you might be logged into a different Google account

### Step 2: Check Current CLI Account
```bash
firebase login:list
```
This shows which account is currently logged in.

### Step 3: Login with Correct Account (if needed)
If you need to switch accounts:

```bash
# Logout current account
firebase logout

# Login with correct account
firebase login
```

This will open a browser window to authenticate with Google.

### Step 4: Verify Project Access
After logging in with the correct account:

```bash
# List all projects you have access to
firebase projects:list
```

Look for `project-3283170620316444791` in the list. If it's not there, you don't have access.

### Step 5: Grant Permissions (if project exists but no access)
If the project exists but you don't have CLI access:

1. **Go to Firebase Console** → Select your project
2. **Go to Project Settings** (gear icon) → **Users and permissions**
3. **Add yourself** with role **"Owner"** or **"Editor"**
   - Click "Add user"
   - Enter your email: `alapshah.com@gmail.com`
   - Select role: **"Editor"** (can deploy) or **"Owner"** (full access)
   - Click "Add"

### Step 6: Set Active Project
Once you have access:

```bash
# Set the project as active
firebase use project-3283170620316444791

# Or add it as an alias
firebase use project-3283170620316444791 --alias default
```

### Step 7: Deploy Rules
Now you can deploy:

```bash
firebase deploy --only firestore:rules
```

## Alternative: Use Different Account
If the project belongs to a different Google account:

1. **Logout current account:**
   ```bash
   firebase logout
   ```

2. **Login with the account that owns the project:**
   ```bash
   firebase login
   ```

3. **Verify access:**
   ```bash
   firebase projects:list
   ```

4. **Deploy:**
   ```bash
   firebase deploy --only firestore:rules --project project-3283170620316444791
   ```

## Troubleshooting

### "Permission denied" Error
- Make sure you're logged in with the account that owns the project
- Check Firebase Console → Project Settings → Users and permissions
- Ensure your account has "Editor" or "Owner" role

### "Project not found" Error
- Verify the project ID is correct: `project-3283170620316444791`
- Check if the project exists in Firebase Console
- Make sure you're logged into the correct Google account

### "Service not enabled" Error
- Go to Firebase Console → Project Settings → General
- Make sure Firestore Database is enabled
- If not, enable it first before deploying rules

## Quick Check Commands

```bash
# Check current login
firebase login:list

# List accessible projects
firebase projects:list

# Check current project
firebase use

# Test deployment (dry run)
firebase deploy --only firestore:rules --dry-run
```

