# Wires

A modern, fast, and customizable portfolio website builder built with Next.js and Firebase. Create beautiful portfolio pages with drag-and-drop editing, real-time updates, and complete customization control.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.14-orange?style=flat-square&logo=firebase)

## ✨ Features

### 🎨 **Design & Customization**
- **Customizable Themes**: Light, dark, and auto (system preference) modes
- **Accent Colors**: Fully customizable accent color with hex color picker
- **Rounded Corners**: Adjustable border radius (0-48px) for modern aesthetics
- **Real-time Preview**: See changes instantly as you customize

### 📝 **Content Management**
- **Drag-and-Drop Editing**: Intuitive drag-and-drop interface for organizing projects
- **Multiple Page Support**: Create unlimited pages with custom slugs
- **Rich Project Cards**: Showcase projects with images, descriptions, tags, and metadata
- **Flexible Content Layouts**: Toggle visibility of title, description, images, tags, and more
- **Media Carousels**: Beautiful image carousels with navigation controls
- **Tag System**: Organize projects with custom tags

### 🔐 **Authentication & Security**
- **Email Authentication**: Passwordless email link authentication
- **Google Sign-In**: Quick authentication with Google
- **Protected Routes**: Secure edit pages with authentication
- **Private Portfolios**: Password-protected portfolio pages
- **Session Management**: Secure session handling

### 👤 **User Management**
- **Custom Usernames**: Choose your own unique username (3-20 characters)
- **Real-time Availability Check**: Instant feedback on username availability
- **Username Validation**: Format validation with reserved word protection
- **Profile Settings**: Comprehensive settings page for account management

### 🚀 **Performance & UX**
- **Fast Loading**: Optimized with Next.js server-side rendering
- **Image Optimization**: Automatic image optimization and lazy loading
- **Responsive Design**: Works beautifully on all devices
- **Smooth Animations**: Polished animations with Framer Motion
- **Debounced Inputs**: Optimized form inputs with debouncing

### 🎯 **Developer Experience**
- **TypeScript**: Full type safety throughout the codebase
- **Component Library**: Reusable UI components
- **Mock Data Support**: Test locally without Firebase setup
- **Hot Reload**: Instant feedback during development
- **ESLint**: Code quality enforcement

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: SCSS Modules + Tailwind CSS
- **Backend**: [Firebase](https://firebase.google.com/)
  - Firestore (Database)
  - Firebase Storage (File uploads)
  - Firebase Auth (Authentication)
- **UI Libraries**:
  - [Framer Motion](https://www.framer.com/motion/) (Animations)
  - [Lucide React](https://lucide.dev/) (Icons)
  - [@dnd-kit](https://dndkit.com/) (Drag and Drop)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (free tier works)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/wires.git
cd wires
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database (start in test mode)
3. Enable Firebase Storage
4. Enable Authentication (Email/Password and Google providers)
5. Copy your Firebase config from Project Settings > General > Your apps

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:9999](http://localhost:9999) to see your portfolio!

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running quickly
- **[Firebase Setup](./FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[Firestore Security Rules](./FIRESTORE_SECURITY_RULES.md)** - Security configuration
- **[Testing Guide](./TESTING.md)** - Testing with mock data

## 🏗️ Project Structure

```
wires/
├── app/                    # Next.js app directory
│   ├── [username]/        # Dynamic username routes
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── content/           # Content display components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   ├── firebase/         # Firebase configuration & helpers
│   └── utils/            # Utility functions
├── styles/               # Global styles
└── public/               # Static assets
```

## 🎨 Customization

### Change Accent Color

Edit `tailwind.config.ts` or use the settings page in the app.

### Modify Theme

Themes are managed in `lib/utils/theme.ts`. You can customize:
- Light mode colors
- Dark mode colors
- Auto mode (system preference)

### Add Custom Components

1. Create component in `components/ui/` or `components/content/`
2. Export from component file
3. Use in pages or other components

## 🔧 Available Scripts

- `npm run dev` - Start development server (port 9999)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test:firebase` - Test Firebase connection

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables (same as `.env.local`)
4. Deploy!

The app is optimized for Vercel deployment with automatic builds and previews.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test your changes locally before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## 📧 Support

For support, email support@example.com or open an issue in the GitHub repository.

## 🔗 Links

- [Live Demo](https://your-demo-url.com)
- [Documentation](./QUICKSTART.md)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Report a Bug](https://github.com/yourusername/wires/issues)

---

Made with ❤️ by [Your Name]

