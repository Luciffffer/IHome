# IHome - Smart Home Management Interface

A modern, feature-rich Next.js application for managing smart home devices with interactive 3D floor visualization and intelligent scene automation. Built as a UI3 course project at Karel de Grote University of Applied Sciences and Arts to showcase advanced frontend development skills.

> **Note:** This is a portfolio/demonstration project focused on frontend excellence, not intended for production use.

## Key Features

### Interactive 3D Floor Planning

- **Real-time 3D Rendering**: Immersive floor visualization using Three.js and React Three Fiber

![3D Floor](/public/images/3d-floor.png)

- **Custom Floor Editor**: Draw and design floor plans with rooms and walls

![Floor Editor](/public/images/floor-editor.png)

- **Device Placement**: Drag-and-drop devices onto floor plans with real-time 3D preview

- **Grid Overlay System**: Precise positioning with visual grid guides

![Device Placement](/public/images/device-placement.png)

![Device Placement 2](/public/images/device-placement-2.png)

### Device Management

- **Multi-Device Support**:
  - Smart Lights (brightness control, on/off)
  - Thermostats (temperature adjustment)
  - Door Locks (lock/unlock)
  - Audio Systems (playlist selection, volume control)
- **Real-time State Updates**: Optimistic UI updates with TanStack Query
- **Device Details Panel**: Comprehensive device information and controls

![Light Device](/public/images/light-device.png)
![Thermostat Device](/public/images/thermostat-device.png)
![Audio Device](/public/images/audio-device.png)
![Doorlock Device](/public/images/door-lock-device.png)

### Scene Automation

- **Custom Scenes**: Create personal automation scenes
- **Global Scenes**: Admin-managed scenes for all users
- **Time-based Scheduling**: Automate scenes based on time slots and days of week
- **Fast Actions**: Quick access to common automation tasks (lock all doors, turn off all lights, etc.)
- **Scene Activation**: One-click scene execution affecting multiple devices

![Fast Scenes](/public/images/fast-scenes.png)
![Global Scenes](/public/images/global-scenes.png)

### Authentication & Authorization

- **NextAuth.js Integration**: Secure credential-based authentication
- **Role-based Access**: User and Admin roles with different permissions
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Persistent user sessions

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5 (App Router, React Server Components)
- **Language**: TypeScript 5
- **UI Library**: React 19.1
- **Styling**: Tailwind CSS 4
- **3D Graphics**: Three.js with React Three Fiber & Drei
- **Post-processing**: @react-three/postprocessing
- **Animations**: tw-animate-css
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query) v5

### UI Components

- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Fonts**: Inter & Poppins (Google Fonts)
- **Notifications**: Sonner
- **Gestures**: @use-gesture/react

### Backend

- **API Routes**: Next.js 15 Route Handlers
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v5 (Beta)
- **Password Hashing**: bcryptjs
- **Scheduling**: node-cron
- **Geometry Processing**: polygon-clipping

### Development Tools

- **Runtime**: Next.js Turbopack
- **Linting**: ESLint 9
- **Type Checking**: TypeScript strict mode
- **Environment Variables**: dotenv
- **Database Container**: Docker Compose
