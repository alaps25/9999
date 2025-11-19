# Quick Start Guide

Get your portfolio up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- A Firebase account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Firebase

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database (start in test mode)
3. Copy your Firebase config from Project Settings > General > Your apps
4. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

5. Add your Firebase config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 3: Add Sample Data to Firestore

### Create `menu` Collection

Add documents with this structure:
```json
{
  "label": "BUTTER",
  "href": "/",
  "order": 0
}
```

```json
{
  "label": "EXPERIMENTS",
  "href": "/experiments",
  "order": 1
}
```

### Create `projects` Collection

Add a project document:
```json
{
  "company": "GOOGLE",
  "year": "2020",
  "type": "EXPERIMENT",
  "title": "Project title",
  "description": "Description",
  "images": [],
  "tags": ["React", "Next.js"],
  "order": 1,
  "content": {
    "showTitle": true,
    "showDescription": true,
    "showPhotoCarousel": true,
    "showTags": true
  }
}
```

### Create `bio` Collection (Optional)

Add a bio document:
```json
{
  "text": "Crafting performance tools to help people grow and orgs flourish 👯. Hustling & experimenting in the after-hours 🧪."
}
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your portfolio!

## Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables (same as `.env.local`)
4. Deploy!

## Architecture Overview

### Design System
- **Colors**: Defined in `tailwind.config.ts` with accent colors
- **Components**: Reusable UI components in `components/ui/`
- **Layout**: Sidebar and MainContent components

### Content System
- **ContentHolder**: Flexible component with toggleable features
- **PhotoCarousel**: Image carousel with navigation
- **Tags**: Tag display component

### Data Flow
1. Firebase Firestore stores all data
2. Server Components fetch data on page load
3. Components render data with type safety

## Customization

### Change Accent Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  accent: {
    primary: '#000000',  // Change this
    secondary: '#FFFFFF', // Change this
    blue: '#0066FF',     // Change this
  }
}
```

### Add New Components

1. Create component in `components/ui/` or `components/content/`
2. Export from component file
3. Use in pages or other components

### Modify Layout

- Sidebar: `components/layout/Sidebar.tsx`
- Main Content: `components/layout/MainContent.tsx`
- Page Layout: `app/page.tsx`

## Troubleshooting

### Firebase Connection Issues
- Check `.env.local` has correct values
- Verify Firestore is enabled in Firebase Console
- Check browser console for error messages

### Data Not Showing
- Verify Firestore collections exist
- Check document structure matches types
- Ensure `order` fields are set for sorting

### Build Errors
- Run `npm install` again
- Check TypeScript errors: `npm run build`
- Verify all imports are correct

## Next Steps

- Add more projects to Firestore
- Customize the design system colors
- Add more content holder features
- Implement dynamic routing for project pages
- Add image optimization with Next.js Image

For detailed documentation, see `README.md` and `FIREBASE_SETUP.md`.

