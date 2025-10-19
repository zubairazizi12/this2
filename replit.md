# Hospital Resident Management System

## Overview

This web-based Hospital Resident Management System tracks and manages medical residents (specialist trainees) throughout their training. It provides comprehensive resident profiles, mandatory training forms, performance evaluations, disciplinary actions, and faculty supervision. The system features role-based access control (admin and viewer permissions) and reporting capabilities for institutional oversight. Its business vision is to streamline resident management, improve oversight, and provide robust reporting for medical training institutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript
- **Vite** for fast development and build
- **Wouter** for client-side routing
- **TailwindCSS** for styling with a custom hospital theme
- **shadcn/ui** (built on Radix UI) for accessible components
- **TanStack Query** for server state management
- **React Hook Form** with Zod for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API design**
- **Session-based authentication** using MongoDB session store
- **Replit Auth integration** for OAuth
- **Role-based access control** (admin/viewer)
- **Middleware pattern** for logging and error handling
- **MVC pattern** for code organization

### Data Layer
- **MongoDB** for document-based storage, with fallback to in-memory storage
- **Mongoose ODM** for schema modeling
- **Collections**: users, residents, teachers, forms, disciplinary actions, rewards, sessions, vacancies
- **Schema validation** using Zod
- **Document-based data modeling**
- **Comprehensive seeding system** with 36 teachers across 12 departments and 14 residents.
- **Department-based organization** for various medical specialties.

### Key Features
- **Resident Management**: CRUD operations for resident profiles, department assignment, and status tracking.
- **Training Forms System**: Nine mandatory forms with completion tracking and data storage.
- **Teacher Management**: Comprehensive teacher profiles with academic rank, contact details, and department assignment (replaces former faculty system).
- **Vacancies Management**: Dynamic job posting system with database persistence, CRUD operations for vacant positions.
- **Disciplinary Actions & Rewards**: Tracking system for resident performance incidents and achievements, with file upload support.
- **Trainer Actions & Reward/Punishment**: Unified tabbed interface in reports showing trainer actions and reward/punishment records with file download capabilities.
- **Reports Module**: Detailed reporting for residents, forms, disciplinary actions, rewards, and teachers with tabbed navigation.
- **Authentication**: Secure OAuth integration with Replit Auth and demo fallback.
- **Authorization**: Role-based permissions (admin for full access, viewer for read-only).
- **File Upload/Download**: Secure file handling for lectures, trainer actions, rewards, and punishments.
- **Mobile Responsiveness**: Mobile-first design with collapsible sidebar and responsive layouts.
- **Sidebar Enhancement**: Header component integrated into sidebar for consistent branding across desktop view.

### Design Patterns
- **Repository Pattern**: Abstraction for data access.
- **Component Composition**: Reusable UI components.
- **Hooks Pattern**: Custom React hooks for authentication and mobile detection.
- **Error Boundary**: Centralized error handling.
- **Loading States**: Skeleton components and loading indicators.

## External Dependencies

### Database & ODM
- **MongoDB**
- **Mongoose**

### Authentication
- **Replit Auth** (OAuth provider)
- **OpenID Connect**
- **Passport.js**
- **connect-mongo**

### UI Framework
- **Radix UI**
- **Lucide React** (icons)
- **Class Variance Authority**
- **TailwindCSS**

### Development Tools
- **TypeScript**
- **ESBuild** (backend bundling)
- **Vite plugins**
- **TSX**

### Utilities
- **date-fns**
- **nanoid**
- **memoizee**
- **clsx**
- **tailwind-merge**
- **Multer** (file uploads)