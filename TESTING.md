# Testing Locally with Mock Data

The portfolio is now configured to work with mock data when Firebase is not configured. This makes it easy to test locally without setting up Firebase.

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:9999](http://localhost:9999)

## What You'll See

The portfolio will automatically use mock data that includes:

- **Sidebar Menu**: 10 menu items (BUTTER, EXPERIMENTS, PRODUCTS, BREAD, PERSONIO, GOOGLE, ZALANDO, INTUIT, HONEYWELL, ALAP)
- **Bio Section**: Sample bio text with emojis
- **Projects**: 2 sample projects with:
  - Company, year, and type metadata
  - Titles and descriptions
  - Image carousels (using Unsplash placeholder images)
  - Tags

## Mock Data Location

Mock data is defined in `lib/mockData.ts`. You can modify this file to:
- Add more projects
- Change menu items
- Update the bio text
- Test different content configurations

## How It Works

The application automatically detects if Firebase is configured by checking for environment variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

If these are not set, the app uses mock data instead. This means:
- ✅ No Firebase setup required for local testing
- ✅ No `.env.local` file needed
- ✅ Works immediately after `npm install`

## Switching to Firebase

When you're ready to use Firebase:

1. Create a `.env.local` file with your Firebase config
2. The app will automatically switch to using Firebase data
3. Mock data will only be used as a fallback if Firebase fails

## Testing Different Content Configurations

You can test the ContentHolder component's toggleable features by modifying the `content` object in `lib/mockData.ts`:

```typescript
content: {
  showTitle: true,           // Show/hide title
  showDescription: true,     // Show/hide description
  showPhotoCarousel: true,   // Show/hide image carousel
  showTags: true,            // Show/hide tags
}
```

## Port Configuration

The dev server runs on port **9999** by default. To change this, edit `package.json`:

```json
"dev": "next dev -p YOUR_PORT"
```

## Troubleshooting

### Port Already in Use
If port 9999 is already in use:
```bash
# Kill the process using port 9999
lsof -ti:9999 | xargs kill -9

# Or use a different port
npm run dev -- -p 3000
```

### Images Not Loading
The mock data uses Unsplash placeholder images. If they don't load:
- Check your internet connection
- The images will show a placeholder if they fail to load

### TypeScript Errors
If you see TypeScript errors:
```bash
npm run build
```
This will show any type errors that need to be fixed.

