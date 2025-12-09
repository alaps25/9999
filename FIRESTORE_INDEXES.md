# Firestore Indexes Required

## 🔍 Issue

Firestore requires **composite indexes** when you query with:
- A `where` clause on one field (`userId`)
- AND an `orderBy` clause on another field (`order`)

## ✅ Required Indexes

You need to create **2 composite indexes**:

### 1. Menu Collection Index
- **Collection**: `menu`
- **Fields**:
  - `userId` (Ascending)
  - `order` (Ascending)

### 2. Projects Collection Index
- **Collection**: `projects`
- **Fields**:
  - `userId` (Ascending)
  - `order` (Ascending)

## 🚀 Quick Fix - Automatic Creation

Firebase has provided direct links in the error messages. Simply:

1. **Click the first link** from the error message (for `menu` collection)
   - This will open Firebase Console with the index pre-configured
   - Click **"Create Index"**
   - Wait for it to build (usually 1-2 minutes)

2. **Click the second link** from the error message (for `projects` collection)
   - Click **"Create Index"**
   - Wait for it to build

## 📝 Manual Creation (Alternative)

If the links don't work, create them manually:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **"Create Index"**

### For Menu Collection:
- Collection ID: `menu`
- Fields to index:
  - Field: `userId`, Order: `Ascending`
  - Field: `order`, Order: `Ascending`
- Query scope: `Collection`
- Click **"Create"**

### For Projects Collection:
- Collection ID: `projects`
- Fields to index:
  - Field: `userId`, Order: `Ascending`
  - Field: `order`, Order: `Ascending`
- Query scope: `Collection`
- Click **"Create"**

## ⏱️ Index Building Time

- Indexes typically build in **1-2 minutes**
- You'll see a status indicator in Firebase Console
- Once built, the errors will disappear and queries will work

## 🔄 Alternative: Remove orderBy Temporarily

If you need to test immediately, you can temporarily remove `orderBy` from queries, but this will affect the order of items displayed.

## ✅ After Indexes Are Built

Once both indexes are built:
- ✅ Menu items will load correctly
- ✅ Projects will load correctly
- ✅ No more index errors in console
- ✅ Data will be properly ordered

