# GitHelp 🚀

> AI-powered code analysis and Q&A platform that helps developers understand their codebases faster than ever before.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-githelp.onrender.com-blue?style=for-the-badge)](https://githelp.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Yashborse45/GitHelp)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 🌟 Features

### 🤖 **AI-Powered Code Analysis**
- Connect any GitHub repository and get instant AI-powered insights
- Ask questions about your codebase in natural language
- Get detailed explanations with direct links to source code

### ⚡ **Swift AI Responses**
- ChatGPT-like typing animation for real-time response rendering
- Markdown support with proper formatting (bold, code blocks, lists)
- Enhanced dark mode with high contrast for optimal visibility

### 📊 **Smart Commit Summaries**
- AI-generated summaries of new commits
- Track team progress and understand changes instantly
- Comprehensive commit analysis with context

### 🎙️ **Meeting Analysis**
- Upload technical meeting recordings
- Get AI-powered summaries and insights
- Ask questions about meeting content

### 🎨 **Modern UI/UX**
- Beautiful dark/light mode with OKLCH color system
- Responsive design that works on all devices
- Glassmorphism effects and smooth animations
- Professional landing page with "How It Works" section

## 🚀 How It Works

### 1. **Connect Repository** 📂
Link your GitHub repository to GitHelp. Our AI analyzes your codebase and makes it searchable with advanced vector embeddings.

### 2. **Ask Questions** 💬
Ask questions about your code in natural language. Our AI understands context, functions, classes, and project architecture.

### 3. **Get AI Insights** ✨
Receive detailed explanations, code references, and insights. Understand your codebase like never before with cited sources.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.3 with App Router
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS with OKLCH color system
- **UI Components**: Custom components with shadcn/ui base
- **Authentication**: Clerk for secure user management
- **Database**: Neon PostgreSQL with Prisma ORM
- **Vector Database**: Pinecone for semantic search
- **AI**: Google Gemini for code analysis and Q&A
- **Deployment**: Render.com with GitHub integration

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** 18.17 or later
- **npm** or **pnpm** package manager
- **Git** for version control
- **GitHub account** for repository integration

## 🚀 Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/Yashborse45/GitHelp.git
cd GitHelp
```

### 2. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

### 3. **Environment Variables**
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your_neon_postgresql_url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# GitHub Integration
GITHUB_TOKEN="your_github_personal_access_token"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Pinecone Vector Database
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_INDEX_NAME="your_pinecone_index_name"
PINECONE_ENVIRONMENT="your_pinecone_environment"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. **Run Development Server**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
GitHelp/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Authentication pages
│   │   ├── api/                # API routes
│   │   └── globals.css         # Global styles with dark mode
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── qa-component.tsx    # AI Q&A interface
│   │   ├── features-section.tsx # Landing page features
│   │   └── markdown-renderer.tsx # Markdown rendering
│   ├── lib/                    # Utility functions
│   ├── server/                 # Server-side logic
│   │   ├── db.ts              # Database connection
│   │   ├── gemini.ts          # AI integration
│   │   ├── github.ts          # GitHub API
│   │   └── pinecone.ts        # Vector database
│   └── hooks/                  # Custom React hooks
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets
└── package.json               # Dependencies and scripts
```

## 🎯 Key Features Explained

### **Enhanced Dark Mode**
- Uses OKLCH color system for superior contrast
- High visibility text in dark environments
- Smooth theme transitions

### **Markdown Rendering**
- Processes Gemini AI responses with proper formatting
- Converts **bold text** from asterisks to actual bold styling
- Syntax highlighting for code blocks
- Support for lists, headers, and links

### **Typing Animation**
- 3ms character-by-character typing speed
- Adaptive speed based on response length
- Real-time markdown rendering during typing
- Visual typing indicators and cursor

### **Vector Search**
- Pinecone integration for semantic code search
- Embeddings-based similarity matching
- Context-aware code retrieval
- Citation tracking with source links

## 🌐 Deployment

The project is deployed on [Render.com](https://githelp.onrender.com/) with:

- **Automatic deployments** from GitHub main branch
- **Environment variables** configured in Render dashboard
- **Neon PostgreSQL** for production database
- **Custom domain** support available

### Deploy Your Own

1. Fork this repository
2. Connect to Render.com
3. Set environment variables
4. Deploy with auto-sync enabled

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Add proper error handling and loading states
- Test your changes thoroughly
- Update documentation as needed

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

## 🔧 Configuration

### **ESLint Configuration**
The project uses a custom ESLint configuration optimized for Next.js 15:

```typescript
// eslint.config.js
import { dir } from "console";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
```

### **TypeScript Configuration**
Strict TypeScript setup with Next.js 15 support:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🚨 Troubleshooting

### Common Issues

**Build Errors:**
- Ensure all environment variables are set
- Check TypeScript errors with `npm run type-check`
- Verify database connection with `npx prisma db pull`

**Authentication Issues:**
- Verify Clerk keys are correct
- Check redirect URLs in Clerk dashboard
- Ensure domain is added to allowed origins

**AI Not Responding:**
- Verify Gemini API key is valid
- Check Pinecone connection and index
- Ensure sufficient API credits

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Yashborse45/GitHelp/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Join discussions in GitHub Discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment tools
- **Clerk** for authentication services
- **Neon** for PostgreSQL hosting
- **Pinecone** for vector database
- **Google** for Gemini AI API
- **shadcn/ui** for beautiful UI components

---

<div align="center">

**Made with ❤️ by the GitHelp Team**

[Live Demo](https://githelp.onrender.com/) • [GitHub](https://github.com/Yashborse45/GitHelp) • [Report Bug](https://github.com/Yashborse45/GitHelp/issues)

</div>
