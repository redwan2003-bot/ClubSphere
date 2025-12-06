# ClubSphere - Membership & Event Management Platform

A full-stack MERN application for discovering, joining, and managing local clubs and events.

## Live URL
*To be added after deployment*

## Project Purpose
ClubSphere helps people discover and join local clubs, connect with like-minded individuals, and participate in exciting events. The platform provides role-based dashboards for admins, club managers, and members, with integrated payment processing through Stripe.

## Key Features

### Authentication & Authorization
- Firebase Authentication (Email/Password + Google Sign-in)
- Role-based access control (Admin, Club Manager, Member)
- Protected routes with automatic redirection
- Persistent authentication state

### Public Features
- Browse clubs with search, filter by category, and sort options
- View club details and upcoming events
- Browse all upcoming events with search and sort
- Responsive design for mobile, tablet, and desktop
- Smooth animations using Framer Motion

### Admin Dashboard
- Platform statistics overview with interactive charts
- User management with role assignment
- Club approval/rejection system
- Payment transaction monitoring
- Real-time data updates

### Club Manager Dashboard
- Create and manage multiple clubs
- View club members and their status
- Create and manage events for clubs
- Track event registrations
- Monitor club-specific payments

### Member Dashboard
- View joined clubs and membership status
- Browse and register for club events
- Cancel event registrations
- View payment history
- Track upcoming events

### Payment Integration
- Stripe payment processing for paid memberships
- Stripe integration for paid events
- Secure payment confirmation
- Payment history tracking

## Important NPM Packages Used

### Frontend
- **react** (^18.3.1) - UI library
- **react-router-dom** (^7.1.1) - Client-side routing
- **@tanstack/react-query** (^5.62.11) - Data fetching and caching
- **react-hook-form** (^7.54.2) - Form management and validation
- **framer-motion** (^11.15.0) - Animations
- **firebase** (^11.1.0) - Authentication
- **axios** (^1.7.9) - HTTP client
- **@stripe/stripe-js** (^5.4.0) - Stripe payment integration
- **react-hot-toast** (^2.4.1) - Toast notifications
- **tailwindcss** (^3.4.17) - Utility-first CSS framework
- **daisyui** (^4.12.22) - Tailwind CSS component library
- **recharts** (^2.15.0) - Charts and data visualization
- **react-icons** (^5.4.0) - Icon library

### Backend
- **express** (^4.18.2) - Web framework
- **mongodb** (^6.3.0) - Database driver
- **cors** (^2.8.5) - CORS middleware
- **dotenv** (^16.3.1) - Environment variables
- **jsonwebtoken** (^9.0.2) - JWT token generation
- **firebase-admin** (^12.0.0) - Firebase Admin SDK for token verification
- **stripe** (^14.10.0) - Stripe payment processing
- **nodemon** (^3.0.2) - Development server auto-restart

## Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Firebase project
- Stripe account (test mode)

### Environment Variables

#### Client (.env)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### Server (.env)
```
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd assignment-11
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables
- Copy `.env.example` to `.env` in both client and server directories
- Fill in your actual credentials

5. Run the development servers

Server:
```bash
cd server
npm run dev
```

Client:
```bash
cd client
npm run dev
```

6. Open http://localhost:5173 in your browser

## Project Structure

```
assignment-11/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── layouts/       # Layout components
│   │   ├── routes/        # Router configuration
│   │   ├── services/      # API services
│   │   └── config/        # Configuration files
│   └── package.json
└── server/                # Express backend
    ├── src/
    │   ├── config/        # Database, Firebase, Stripe config
    │   ├── middleware/    # Authentication middleware
    │   ├── routes/        # API routes
    │   └── index.js       # Server entry point
    └── package.json
```

## Features Implementation

### Search & Filter
- Server-side search for clubs by name
- Filter clubs by category
- Sort clubs by newest, oldest, highest fee, lowest fee
- Search events by title
- Sort events by date

### Token Verification
- Firebase ID token verification on protected routes
- Role-based middleware for admin and club manager routes
- Secure API endpoints with authentication checks

### Sorting
- MongoDB-based sorting for clubs and events
- Multiple sort options (date, fee, creation time)

### React Hook Form
- Form validation on login and registration
- Password requirements (uppercase, lowercase, 6+ characters)
- Club and event creation/editing forms
- Error handling and user feedback

### TanStack Query
- Data fetching with automatic caching
- Optimistic updates for mutations
- Query invalidation for real-time updates
- Loading and error states

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, DaisyUI
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: Firebase Authentication
- **Payment**: Stripe
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Charts**: Recharts

## Author
*Your name here*

## License
MIT
