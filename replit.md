# Overview

This is a cryptocurrency lending platform that allows users to obtain instant loans using cryptocurrency as collateral. The application is built as a full-stack web application with a React frontend and Express.js backend, featuring user authentication, loan management, and real-time dashboard functionality.

The platform enables users to apply for loans by depositing cryptocurrency as collateral, manage their active loans, make payments, and track their lending history through an intuitive dashboard interface.

# User Preferences

Preferred communication style: Simple, everyday language.

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