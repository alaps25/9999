# Firebase Setup Guide

This guide will help you set up your Firebase database structure for the Wires portfolio.

## Firestore Collections Structure

### 1. `menu` Collection

This collection stores the navigation menu items for the sidebar.

**Document Structure:**
```json
{
  "label": "EXPERIMENTS",
  "href": "/experiments",
  "order": 1
}
```

**Fields:**
- `label` (string, required): The display text for the menu item
- `href` (string, optional): The URL path for navigation
- `order` (number, required): Display order (lower numbers appear first)

**Example Documents:**
```json
// Document 1
{
  "label": "EXPERIMENTS",
  "href": "/experiments",
  "order": 1
}

// Document 2
{
  "label": "PRODUCTS",
  "href": "/products",
  "order": 2
}

// Document 3
{
  "label": "BUTTER",
  "href": "/",
  "order": 0
}
```

### 2. `projects` Collection

This collection stores portfolio project information.

**Document Structure:**
```json
{
  "company": "COMPANY",
  "year": "2014",
  "type": "EXPERIMENT",
  "title": "Project title",
  "description": "Description",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "order": 1,
  "content": {
    "showTitle": true,
    "showDescription": true,
    "showPhotoCarousel": true,
    "showTags": true
  }
}
```

**Fields:**
- `company` (string, required): Company name
- `year` (string, required): Project year
- `type` (string, required): Project type (e.g., "EXPERIMENT", "PRODUCT")
- `title` (string, required): Project title
- `description` (string, required): Project description
- `images` (array of strings, optional): Array of image URLs
- `tags` (array of strings, optional): Array of tag strings
- `order` (number, required): Display order
- `content` (object, optional): Content visibility configuration
  - `showTitle` (boolean): Show/hide title
  - `showDescription` (boolean): Show/hide description
  - `showPhotoCarousel` (boolean): Show/hide photo carousel
  - `showTags` (boolean): Show/hide tags

**Example Document:**
```json
{
  "company": "GOOGLE",
  "year": "2020",
  "type": "EXPERIMENT",
  "title": "Social Network Visualization",
  "description": "A tool for visualizing social connections and networks",
  "images": [
    "https://firebasestorage.googleapis.com/.../image1.jpg",
    "https://firebasestorage.googleapis.com/.../image2.jpg"
  ],
  "tags": ["React", "D3.js", "Visualization"],
  "order": 1,
  "content": {
    "showTitle": true,
    "showDescription": true,
    "showPhotoCarousel": true,
    "showTags": true
  }
}
```

### 3. `bio` Collection (Optional)

This collection stores the bio/intro text displayed at the top of the portfolio.

**Document Structure:**
```json
{
  "text": "Crafting performance tools to help people grow and orgs flourish 👯. Hustling & experimenting in the after-hours 🧪. Obsessed with enabling ideas & people that drive meaningful change. Poke me for good coffee/noodle 🍜 in Berlin!"
}
```

**Fields:**
- `text` (string, required): Bio text (supports newlines and emojis)

## Setting Up Firebase

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Firestore**
   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location for your database

3. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (`</>`) to add a web app
   - Copy the configuration values

4. **Set Environment Variables**
   - Create a `.env.local` file in your project root
   - Add your Firebase configuration:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

5. **Create Collections**
   - In Firestore, create the `menu` collection
   - Create the `projects` collection
   - Optionally create the `bio` collection

6. **Add Sample Data**
   - Add menu items to the `menu` collection
   - Add projects to the `projects` collection
   - Add bio text to the `bio` collection

## Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Menu collection - read-only for all
    match /menu/{document=**} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
    
    // Projects collection - read-only for all
    match /projects/{document=**} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
    
    // Bio collection - read-only for all
    match /bio/{document=**} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
  }
}
```

## Firebase Storage (for Images)

If you want to store images in Firebase Storage:

1. **Enable Storage**
   - Go to "Storage" in Firebase Console
   - Click "Get started"
   - Choose "Start in test mode"

2. **Upload Images**
   - Upload your project images
   - Get the download URLs
   - Add these URLs to the `images` array in your project documents

3. **Update Security Rules**
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

## Testing

After setting up Firebase:

1. Start your development server: `npm run dev`
2. Check the browser console for any Firebase errors
3. Verify data is loading correctly
4. Test the ContentHolder component with different content configurations

