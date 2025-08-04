# Clynic AI - AI-Powered Healthcare Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![HIPAA Compliant](https://img.shields.io/badge/HIPAA-Compliant-green)](https://www.hhs.gov/hipaa/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-blue)](https://web.dev/progressive-web-apps/)

## 🏥 Overview

Clynic AI is a state-of-the-art healthcare platform leveraging artificial intelligence to provide instant medical guidance, connect users with healthcare providers, and manage sensitive health data with unparalleled security. Designed with user privacy and accessibility at its core, Clynic AI complies with **HIPAA** standards, ensuring the protection of Protected Health Information (PHI).

The platform is built as a **Progressive Web App (PWA)**, supporting offline access, push notifications, and a native-like experience. It employs military-grade encryption (AES-256-GCM, PBKDF2) and integrates modern web technologies for a scalable, secure, and responsive user experience.

### 🎯 Mission
*"Your first stop for all your medical needs"* - Democratizing healthcare access through AI-powered insights while maintaining the highest standards of data security and privacy.

## 📋 Table of Contents

1. [Features](#-features)
2. [Architecture](#-architecture)
3. [Security and HIPAA Compliance](#-security-and-hipaa-compliance)
4. [Directory Structure](#-directory-structure)
5. [Technologies Used](#-technologies-used)
6. [Environment Variables](#-environment-variables)
7. [Getting Started](#-getting-started)
8. [Development Workflow](#-development-workflow)
9. [API Endpoints](#-api-endpoints)
10. [Progressive Web App (PWA)](#-progressive-web-app-pwa)
11. [Testing](#-testing)
12. [Contributing](#-contributing)
13. [Troubleshooting](#-troubleshooting)
14. [License](#-license)

## ✨ Features

### Core Functionality
- **🤖 AI-Powered Medical Guidance**: Interactive chat interface for symptom analysis and personalized health recommendations
- **🏥 Healthcare Provider Search**: Locate nearby doctors and hospitals with detailed profiles, ratings, and real-time availability
- **📊 Secure Health Assessments**: Encrypted health assessments for tailored medical insights
- **🔔 Push Notifications**: Real-time alerts for medication reminders, appointments, and health updates
- **💳 Payment Integration**: Secure payment processing via UPI or card for consultations and services

### Security & Compliance
- **🔒 Military-Grade Security**: Client-side encryption with AES-256-GCM and PBKDF2 key derivation
- **🏛️ HIPAA Compliant**: Full compliance with Security Rule, Privacy Rule, and Breach Notification Rule
- **🔐 Multi-Factor Authentication**: Email, Google, and phone-based sign-in with OTP verification
- **📝 Comprehensive Audit Logging**: Complete tracking of encryption operations and data access

### Technical Excellence
- **📱 Progressive Web App (PWA)**: Installable app with offline access and native-like performance
- **⚡ Performance Optimized**: Lazy loading, code splitting, and efficient caching strategies
- **🎨 Modern UI/UX**: Responsive design with smooth animations and intuitive navigation
- **🛠️ Developer Tools**: Built-in debugging console for monitoring system performance

## 🏗️ Architecture

Clynic AI is architected as a modular, scalable web application, combining a **React-based frontend**, **TypeScript** for type safety, and a **RESTful API** integrated with a **Prisma-managed PostgreSQL database**. The architecture is designed to handle high-throughput healthcare data while maintaining security and performance.

### System Architecture Diagram

```mermaid
graph TD
    A[User Device] -->|HTTPS/TLS 1.3| B[Frontend: React + TypeScript]
    B -->|Service Worker| C[PWA Cache]
    B -->|Axios Requests| D[RESTful API]
    D -->|Prisma ORM| E[PostgreSQL Database]
    D -->|Encrypted Data| F[Encryption Service: AES-256-GCM]
    B -->|Push Notifications| G[Firebase Cloud Messaging]
    D -->|AI Integration| H[Gemini/OpenAI API]
    D -->|Location Services| I[Google Maps API]
    D -->|Payment Processing| J[Payment Gateway]
    F -->|Audit Logs| E
    B -->|Client-Side Encryption| F
    B -->|UI Rendering| K[Tailwind CSS + Framer Motion]
    E -->|Schema Models| L[User, Assessment, ChatMessage, EncryptionAuditLog]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#fff3e0
```

### Key Architectural Components

#### Frontend Layer
- **React 18 with TypeScript**: Type-safe, component-driven UI architecture
- **React Router v6**: Client-side routing for seamless navigation
- **Tailwind CSS**: Utility-first styling for responsive design
- **Framer Motion**: Smooth animations and transitions
- **Custom Components**: Modular, reusable UI components

#### Backend Integration
- **RESTful API**: Configurable endpoints for all data operations
- **Mock APIs**: Offline development and testing capabilities
- **External Integrations**: Google Maps, Firebase, AI APIs
- **Prisma ORM**: Type-safe database operations with PostgreSQL

#### Security Layer
- **Client-Side Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Audit Logging**: Comprehensive tracking of all security operations
- **HTTPS/TLS 1.3**: Secure communication protocols
- **Firebase Authentication**: Multi-provider authentication system

## 🔐 Security and HIPAA Compliance

Clynic AI implements robust security measures to protect user data and ensure compliance with HIPAA regulations, safeguarding Protected Health Information (PHI) through military-grade encryption, comprehensive audit logging, and secure authentication.

### Security Features

#### Client-Side Encryption
- **AES-256-GCM**: Galois/Counter Mode encryption for sensitive data
- **PBKDF2**: 256-bit key derivation with 100,000 iterations and SHA-256
- **Random Salts & IVs**: Unique encryption per operation (16-byte salt, 12-byte IV)
- **Base64 Encoding**: Secure data transmission over HTTPS

```typescript
// Example encryption implementation
async function encrypt(data: string, password: string): Promise<string> {
  const salt = generateSalt(16); // 16-byte salt
  const iv = generateIv(12); // 12-byte IV
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveKey']),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data)
  );
  return arrayBufferToBase64(encrypted);
}
```

#### Comprehensive Audit Logging
All encryption operations are logged to the `EncryptionAuditLog` model:

```json
{
  "id": "uuid-1234",
  "operation": "encrypt",
  "success": true,
  "processingTimeMs": 15.7,
  "error": null,
  "timestamp": "2025-08-04T16:44:00Z"
}
```

### HIPAA Compliance Framework

#### Administrative Safeguards
- **Role-Based Access Control (RBAC)**: Restricted PHI access
- **Audit Controls**: Comprehensive logging of data access
- **Security Assessments**: Regular vulnerability audits
- **Staff Training**: HIPAA compliance education

#### Physical Safeguards
- **HIPAA-Compliant Hosting**: AWS with Business Associate Agreement
- **Encrypted Backups**: Secure, access-controlled storage
- **Physical Access Controls**: Restricted server access

#### Technical Safeguards
- **Data Encryption**: PHI encrypted at rest and in transit
- **Access Controls**: Strong authentication and session management
- **Data Integrity**: SHA-256 hashing for verification
- **Audit Logging**: Complete access and operation tracking

### Security Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant E as Encryption Service
    participant A as API
    participant D as Database
    participant L as Audit Log

    U->>F: Enter PHI Data
    F->>E: Encrypt Data (AES-256-GCM)
    E->>L: Log Encryption Operation
    E->>F: Return Encrypted Data
    F->>A: Send Encrypted Data (HTTPS)
    A->>D: Store Encrypted Data
    D->>A: Confirm Storage
    A->>L: Log Database Operation
    A->>F: Return Success Response
    F->>U: Display Confirmation

    Note over E,L: All operations logged for HIPAA compliance
    Note over F,A: TLS 1.3 encryption in transit
    Note over D: AES-256 encryption at rest
```

## 📁 Directory Structure

```
afnan006-clynic_ai/
├── README.md
├── eslint.config.js
├── index.html
├── postcss.config.js
├── tailwind.config.js
├── vite.config.ts
├── prisma/
│   └── schema.prisma                 # Database schema with encrypted fields
├── public/
│   ├── offline.html                  # PWA offline page
│   ├── robots.txt
│   ├── service-worker.js             # PWA service worker
│   ├── sitemap.xml
│   └── manifest.json                 # PWA manifest
└── src/
    ├── App.tsx                       # Main application component
    ├── index.css                     # Global styles
    ├── main.tsx                      # Application entry point
    ├── vite-env.d.ts                # Vite type definitions
    ├── api/                         # API layer
    │   ├── axiosInstance.ts         # HTTP client configuration
    │   ├── config.ts                # API configuration
    │   ├── assessment/              # Assessment endpoints
    │   ├── auth/                    # Authentication endpoints
    │   ├── chat/                    # Chat/AI endpoints
    │   ├── mock/                    # Mock API implementations
    │   ├── notifications/           # Notification endpoints
    │   ├── payment/                 # Payment endpoints
    │   └── settings/                # Settings endpoints
    ├── components/                  # React components
    │   ├── ConsentModal.tsx         # HIPAA consent modal
    │   ├── assessment/              # Assessment components
    │   ├── auth/                    # Authentication components
    │   ├── chat/                    # Chat interface components
    │   ├── dev/                     # Development tools
    │   ├── notifications/           # Notification components
    │   ├── payment/                 # Payment components
    │   ├── settings/                # Settings components
    │   └── ui/                      # Reusable UI components
    ├── hooks/                       # Custom React hooks
    │   ├── useAuth.tsx              # Authentication hook
    │   ├── useImageLoader.ts        # Image loading hook
    │   └── useResponsive.ts         # Responsive design hook
    ├── pages/                       # Page components
    │   ├── Assessment.tsx           # Health assessment page
    │   ├── Auth.tsx                 # Authentication page
    │   ├── Chat.tsx                 # AI chat page
    │   ├── LandingPage.tsx          # Landing page
    │   └── SettingsPage.tsx         # Settings page
    ├── services/                    # Business logic services
    │   ├── NotificationService.ts   # Push notification service
    │   └── PaymentService.ts        # Payment processing service
    ├── types/                       # TypeScript type definitions
    │   ├── index.ts                 # Common types
    │   └── payment.ts               # Payment types
    └── utils/                       # Utility functions
        ├── api.ts                   # API utilities
        ├── encryption.ts            # Encryption utilities
        └── mockData.ts              # Mock data for testing
```

### Key Files Description

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | HIPAA-compliant database models with encrypted fields |
| `src/utils/encryption.ts` | AES-256-GCM and PBKDF2 encryption implementation |
| `src/components/dev/DevConsole.tsx` | Real-time system monitoring and debugging |
| `src/api/mock/` | Mock API implementations for offline development |
| `public/service-worker.js` | PWA service worker for caching and notifications |

## 🛠️ Technologies Used

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | Component-based UI framework |
| **TypeScript** | 5.x | Type-safe JavaScript superset |
| **Vite** | 5.x | Fast build tool and dev server |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Framer Motion** | 11.x | Animation library |
| **React Router** | 6.x | Client-side routing |
| **Axios** | 1.x | HTTP client with interceptors |
| **Lucide React** | Latest | Modern icon library |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Prisma ORM** | Type-safe database operations |
| **PostgreSQL** | Primary database with encryption |
| **RESTful API** | Backend communication protocol |

### Security & Authentication
| Technology | Purpose |
|------------|---------|
| **Web Crypto API** | Browser-native encryption (AES-256-GCM, PBKDF2) |
| **Firebase Auth** | Multi-provider authentication |
| **HTTPS/TLS 1.3** | Secure communication protocol |

### External Integrations
| Service | Purpose |
|---------|---------|
| **Google Maps API** | Location-based provider search |
| **Gemini/OpenAI API** | AI-powered chat and recommendations |
| **Firebase Cloud Messaging** | Push notifications |
| **Payment Gateways** | UPI and card payment processing |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality |
| **Prettier** | Code formatting |
| **Jest/Vitest** | Unit testing framework |
| **Cypress** | End-to-end testing |

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application Configuration
VITE_APP_NAME="Clynic AI"
VITE_APP_TAGLINE="Your first stop for all your medical needs"
VITE_APP_URL="https://clynic-ai.com"

# API Configuration
VITE_API_BASE_URL="http://localhost:8000"
VITE_API_URL="http://localhost:8000"
VITE_USE_MOCK_API="true"

# External Services
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
VITE_GEMINI_API_KEY="your-gemini-api-key"
VITE_OPENAI_API_KEY="your-openai-api-key"

# Firebase Configuration
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef123456"

# Push Notifications
VITE_VAPID_PUBLIC_KEY="your-vapid-public-key"

# Database (Backend)
DATABASE_URL="postgresql://user:password@localhost:5432/clynic_db"
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_APP_NAME` | Application display name | ✅ |
| `VITE_APP_TAGLINE` | Application tagline for UI | ✅ |
| `VITE_API_BASE_URL` | Base URL for API requests | ✅ |
| `VITE_USE_MOCK_API` | Enable mock APIs for development | ✅ |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps integration | ⚠️ Optional |
| `VITE_FIREBASE_*` | Firebase configuration | ✅ |
| `VITE_GEMINI_API_KEY` | Gemini AI integration | ⚠️ Optional |
| `VITE_OPENAI_API_KEY` | OpenAI integration | ⚠️ Optional |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |

> **Security Note**: Never commit the `.env` file to version control. Add it to `.gitignore`.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/afnan006/clynic_ai.git
   cd clynic_ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Quick Start Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Database operations
npx prisma studio        # Database GUI
npx prisma migrate dev   # Apply migrations
npx prisma generate      # Generate client
```

## 👨‍💻 Development Workflow

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Enforced linting rules for React and TypeScript
- **Prettier**: Consistent code formatting
- **Commit Messages**: Follow conventional commit format

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   ```bash
   # Follow coding standards
   npm run lint
   npm run format
   npm run test
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Development Guidelines

- **Component Structure**: Use functional components with hooks
- **Type Safety**: Define interfaces for all props and data structures
- **Error Handling**: Implement comprehensive error boundaries
- **Performance**: Use React.memo, useMemo, and useCallback appropriately
- **Accessibility**: Follow WCAG 2.1 guidelines
- **Testing**: Write unit tests for critical functionality

## 🔌 API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/signin/email` | POST | Email/password sign-in | ❌ |
| `/auth/signin/google` | POST | Google OAuth sign-in | ❌ |
| `/auth/signin/phone` | POST | Phone OTP sign-in | ❌ |
| `/auth/refresh` | POST | Refresh JWT token | ✅ |
| `/auth/signout` | POST | Sign out user | ✅ |

### Assessment Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/assessment/submit` | POST | Submit encrypted health assessment | ✅ |
| `/assessment/history` | GET | Retrieve user's assessment history | ✅ |
| `/assessment/:id` | GET | Get specific assessment | ✅ |

### Chat Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/chat/message` | POST | Send AI chat message | ✅ |
| `/chat/history` | GET | Retrieve chat history | ✅ |
| `/chat/clear` | DELETE | Clear chat history | ✅ |

### User Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/users/:userId/profile` | GET/PUT | Get/update user profile | ✅ |
| `/users/:userId/export-data` | GET | Export user data (HIPAA) | ✅ |
| `/users/:userId` | DELETE | Delete user account | ✅ |

### Notification Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/notifications/push/subscribe` | POST | Subscribe to push notifications | ✅ |
| `/notifications/preferences` | GET/PUT | Notification preferences | ✅ |

### Payment Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/payments/process` | POST | Process payment | ✅ |
| `/payments/history` | GET | Payment history | ✅ |

### Mock API Support

All endpoints have corresponding mock implementations in `src/api/mock/` for offline development:

```bash
# Enable mock APIs
VITE_USE_MOCK_API=true

# Disable for live API
VITE_USE_MOCK_API=false
```

## 📱 Progressive Web App (PWA)

Clynic AI is built as a fully-featured PWA, providing a native app-like experience across all devices.

### PWA Features

- **🔄 Offline Support**: Complete offline functionality with cached content
- **📲 App Installation**: Install prompt for iOS, Android, and desktop
- **🔔 Push Notifications**: Real-time notifications via Firebase Cloud Messaging
- **⚡ Fast Loading**: Service worker caching for instant loading
- **📊 Background Sync**: Sync data when connection is restored

### PWA Configuration

#### Service Worker (`public/service-worker.js`)
```javascript
// Cache strategies
- Cache First: Static assets (CSS, JS, images)
- Network First: API requests with fallback
- Stale While Revalidate: Dynamic content
```

#### Web Manifest (`public/manifest.json`)
```json
{
  "name": "Clynic AI",
  "short_name": "Clynic",
  "description": "AI-Powered Healthcare Platform",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#6366f1",
  "background_color": "#ffffff",
  "orientation": "portrait-primary"
}
```

### Installation

Users can install the app by:
1. Visiting the website on mobile/desktop
2. Clicking the "Add to Home Screen" prompt
3. Following browser-specific installation steps

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and service integration
- **End-to-End Tests**: Complete user workflow testing
- **Security Tests**: Encryption and authentication testing

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run cypress:open

# E2E headless
npm run cypress:run
```

### Test Structure

```
src/
├── __tests__/                 # Test files
│   ├── components/           # Component tests
│   ├── hooks/               # Hook tests
│   ├── utils/               # Utility tests
│   └── api/                 # API tests
└── cypress/
    ├── fixtures/            # Test data
    ├── integration/         # E2E tests
    └── support/             # Test utilities
```

### Encryption Testing

Test encryption utilities in browser console:
```javascript
// Run encryption tests
testEncryptionUtilities()
```

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/clynic_ai.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Development Process

1. **Follow coding standards**
   - Use TypeScript for all new code
   - Follow ESLint and Prettier configurations
   - Write meaningful commit messages
   - Add tests for new features

2. **Make changes**
   - Implement your feature/fix
   - Add appropriate tests
   - Update documentation if needed
   - Ensure all tests pass

3. **Submit changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```
   - Create a detailed pull request
   - Link relevant issues
   - Request review from maintainers

### Contribution Guidelines

- **Code Quality**: Maintain high code quality standards
- **Documentation**: Update README and inline documentation
- **Testing**: Include tests for new functionality
- **Security**: Follow security best practices
- **HIPAA Compliance**: Maintain HIPAA compliance in all changes

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## 🛠️ Troubleshooting

### Common Issues

#### Service Worker Problems
```bash
# Symptoms: PWA features not working, caching issues
# Solutions:
1. Check HTTPS requirement for PWA
2. Verify VITE_VAPID_PUBLIC_KEY is set
3. Clear browser cache and service workers
4. Check service-worker.js is in public/ directory
```

#### Encryption Failures
```bash
# Symptoms: Data encryption/decryption errors
# Solutions:
1. Verify Web Crypto API support in browser
2. Check encryption key derivation parameters
3. Review DevConsole.tsx for detailed error logs
4. Test encryption utilities in browser console
```

#### API Connection Issues
```bash
# Symptoms: API requests failing, CORS errors
# Solutions:
1. Verify VITE_API_BASE_URL configuration
2. Check VITE_USE_MOCK_API setting
3. Confirm backend server is running
4. Review network requests in browser DevTools
```

#### Database Connection Problems
```bash
# Symptoms: Prisma errors, database connection failures
# Solutions:
1. Verify DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Run: npx prisma migrate dev
4. Check database permissions
```

#### Build/Development Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev

# Reset TypeScript cache
rm -rf .tsbuildinfo
```

### Development Tools

#### DevConsole Access
Access the developer console in the app:
1. Navigate to any page
2. Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
3. View real-time logs for:
   - Encryption operations
   - API requests
   - Performance metrics
   - Error tracking

#### Debugging Tips

1. **Use React DevTools**: Install browser extension for component debugging
2. **Check Network Tab**: Monitor API requests and responses
3. **Console Logging**: Use browser console for runtime debugging
4. **Prisma Studio**: Use `npx prisma studio` for database inspection

### Getting Help

If you encounter issues not covered here:

1. **Check GitHub Issues**: Search existing issues for solutions
2. **Create New Issue**: Provide detailed reproduction steps
3. **Discussion Forum**: Join community discussions
4. **Documentation**: Review official documentation links

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify the source code
- ✅ **Distribution**: Distribute copies of the software
- ✅ **Private Use**: Use privately
- ❗ **Liability**: Software is provided "as is"
- ❗ **Warranty**: No warranty provided

---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Anthropic** for AI integration capabilities
- **Open Source Community** for the fantastic libraries
- **Healthcare Professionals** for domain expertise
- **Security Researchers** for HIPAA compliance guidance

---

## 📞 Support

For support and questions:

- **Documentation**: [Project Wiki](https://github.com/afnan006/clynic_ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/afnan006/clynic_ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/afnan006/clynic_ai/discussions)
- **Email**: support@clynic-ai.com

---

<div align="center">

**Made with ❤️ by the Clynic AI Team**

[⭐ Star this repo](https://github.com/afnan006/clynic_ai) • [🐛 Report Bug](https://github.com/afnan006/clynic_ai/issues) • [💡 Request Feature](https://github.com/afnan006/clynic_ai/issues)

</div>
