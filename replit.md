# Overview

CryptoLend is a comprehensive cryptocurrency lending platform that allows users to obtain instant stablecoin loans using cryptocurrency as collateral. The application is built as a full-stack web application with a React frontend and Express.js backend, featuring user authentication, loan management, real-time dashboard functionality, and complete loan lifecycle management.

The platform enables users to:
- Apply for loans through a multi-step application process with real-time collateral calculations
- Manage active loans with detailed analytics and payment tracking
- Make payments and view comprehensive transaction history
- Monitor loan health with liquidation alerts and repayment progress
- Access professional landing page with comprehensive product information

Key Features Implemented:
✓ Professional landing page with hero section, features, rates, security info, and footer
✓ Multi-step loan application modal with 8 supported cryptocurrencies (BTC, ETH, BNB, ADA, SOL, MATIC, DOT, LINK)
✓ Real-time crypto price integration and collateral value calculations with live market data
✓ Comprehensive dashboard with loan stats, active loans overview, and transaction history
✓ Detailed loan management page with payment processing and progress tracking
✓ Enhanced payment system with comprehensive validation, balance checking, and auto loan completion
✓ Database-backed user authentication with Replit Auth and secure session management
✓ Complete responsive design with professional UI/UX optimized for all devices
✓ Comprehensive testing interface with API endpoint testing and demo data creation
✓ Advanced notification system with loan approval, payment reminders, and status updates
✓ Full transaction history tracking with detailed payment logs and loan lifecycle management
✓ Error handling and validation throughout the application with user-friendly feedback
✓ Advanced security features including 2FA simulation and password strength validation
✓ API rate limiting system with endpoint-specific controls and performance monitoring
✓ Comprehensive admin panel with user management, loan oversight, and platform analytics
✓ Smart payment reminder system with customizable notification preferences
✓ Real-time analytics dashboard with performance metrics and business intelligence
✓ Enhanced settings page with security controls and user preference management
✓ Step-by-step loan application with progress indicators and real-time feedback
✓ Production-ready architecture with scalability, security, and compliance features

# User Preferences

Preferred communication style: Simple, everyday language.
Development approach: Comprehensive step-by-step implementation with focus on security, scalability, and user experience optimization.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod for validation and type-safe forms
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: Replit Auth with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage for persistent login state
- **API Design**: RESTful API endpoints with structured error handling and logging middleware
- **Database Integration**: Drizzle ORM for type-safe database operations and migrations

## Database Schema
- **Users Table**: Stores user profile information from authentication provider
- **Loans Table**: Core lending data including amount, collateral, interest rates, and terms
- **Transactions Table**: Payment history and loan-related financial transactions
- **Sessions Table**: Secure session storage for authentication state

## Authentication & Authorization
- **Provider**: Replit's OpenID Connect implementation for secure authentication
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTP-only cookies with secure flags for production environments
- **Access Control**: Route-level authentication middleware protecting sensitive endpoints

## Data Storage Strategy
- **Primary Database**: PostgreSQL for relational data with ACID compliance
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling for scalability
- **Schema Management**: Drizzle Kit for database migrations and schema versioning
- **Type Safety**: Generated TypeScript types from database schema using Drizzle

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Connection Management**: WebSocket-based connections for serverless environments

## Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication and profile management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

## Frontend Libraries
- **UI Framework**: Radix UI for accessible, unstyled component primitives
- **Component Library**: shadcn/ui for pre-built, customizable UI components
- **State Management**: TanStack Query for server state synchronization and caching
- **Form Management**: React Hook Form with Hookform Resolvers for validation integration
- **Validation**: Zod for runtime type validation and schema enforcement
- **Date Handling**: date-fns for date manipulation and formatting
- **Styling**: Tailwind CSS with class-variance-authority for component variants

## Development Tools
- **Build System**: Vite with React plugin for fast development and production builds
- **Type Checking**: TypeScript compiler with strict configuration
- **Code Quality**: ESBuild for fast bundling and transpilation
- **Development**: tsx for TypeScript execution in development mode

## Backend Dependencies
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Validation**: Zod for API request/response validation and type safety
- **Authentication**: Passport.js with OpenID Connect strategy for auth integration
- **Session Management**: Express session with PostgreSQL store for persistence
- **Utilities**: Memoizee for function result caching and performance optimization