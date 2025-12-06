# ClubSphere Deployment Guide

## Backend Deployment (Render)

### Step 1: Prepare Your Repository
1. Ensure all code is committed to GitHub
2. Push to your GitHub repository

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: clubsphere-api
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: server
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:

```
MONGODB_URI=your_mongodb_atlas_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

**Important**: For `FIREBASE_PRIVATE_KEY`, make sure to keep the newlines. In Render, paste it as:
```
-----BEGIN PRIVATE KEY-----
your_key_here
-----END PRIVATE KEY-----
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://clubsphere-api.onrender.com`)

---

## Frontend Deployment (Vercel)

### Step 1: Update Environment Variables
1. Create a `.env.production` file in the client directory:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_URL=https://your-backend-url.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Step 2: Deploy to Vercel
1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. **Option A: Deploy via Vercel Dashboard**
   - Go to [Vercel.com](https://vercel.com) and sign up/login
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: client
     - **Build Command**: `npm run build`
     - **Output Directory**: dist
   - Add environment variables from `.env.production`
   - Click "Deploy"

3. **Option B: Deploy via CLI**
   ```bash
   cd client
   vercel
   ```
   - Follow the prompts
   - Add environment variables when prompted

### Step 3: Update Backend CORS
Once frontend is deployed, update the `CLIENT_URL` environment variable in Render with your Vercel URL.

---

## Firebase Configuration

### Add Authorized Domains
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Authentication → Settings → Authorized domains
4. Add your deployed domains:
   - Your Vercel frontend URL
   - Your Render backend URL (if needed)

---

## MongoDB Atlas Setup

### Create Production Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist IP addresses:
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allow from anywhere) for Render
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Use this as `MONGODB_URI` in Render

---

## Post-Deployment Checklist

- [ ] Backend is live and accessible
- [ ] Frontend is live and accessible
- [ ] Environment variables are set correctly
- [ ] Firebase authorized domains are updated
- [ ] MongoDB connection is working
- [ ] Test user registration
- [ ] Test login (email/password and Google)
- [ ] Test club creation
- [ ] Test event creation
- [ ] Test Stripe payments with test card (4242 4242 4242 4242)
- [ ] Test all three dashboard roles
- [ ] Check responsive design on mobile
- [ ] Update README with live URLs

---

## Troubleshooting

### Backend Issues
- **500 Error**: Check Render logs for errors
- **CORS Error**: Verify `CLIENT_URL` environment variable
- **Database Connection**: Check MongoDB Atlas IP whitelist and connection string

### Frontend Issues
- **API Errors**: Verify `VITE_API_URL` points to correct backend
- **Build Errors**: Check Vercel build logs
- **Firebase Errors**: Verify all Firebase environment variables

### Payment Issues
- **Stripe Errors**: Verify Stripe keys (use test keys for testing)
- **Payment Not Processing**: Check Stripe dashboard for webhook events

---

## Alternative Deployment Options

### Backend Alternatives
- **Railway**: Similar to Render, supports Node.js
- **Heroku**: Classic PaaS (paid plans only now)
- **DigitalOcean App Platform**: Good for production apps

### Frontend Alternatives
- **Netlify**: Similar to Vercel, great for static sites
- **GitHub Pages**: Free but limited (no server-side routing)
- **Cloudflare Pages**: Fast and free

---

## Environment Variables Quick Reference

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
PORT=5000
NODE_ENV=production
CLIENT_URL=https://...
```

### Frontend (.env.production)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=https://...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Testing in Production

### Test Cards (Stripe)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Authentication Required**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

---

## Monitoring

### Render
- View logs in Render dashboard
- Set up health checks
- Monitor resource usage

### Vercel
- View deployment logs
- Analytics available on paid plans
- Monitor build times

---

Good luck with your deployment! 🚀
