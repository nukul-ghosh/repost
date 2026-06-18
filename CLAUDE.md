# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A LinkedIn-alternative platform for building verifiable professional resumes through timeline-based events, community endorsements, and transparent reputation tracking. The system uses a monorepo structure with a React frontend and Node.js/Express backend.

## 🆓 Zero-Cost Development Approach

This project is designed to be built and deployed **entirely for free** using free tiers and open-source tools:

**Development Stack (Free):**
- MongoDB Atlas free tier (512MB) or local MongoDB
- Node.js + Express (open-source)
- React + Vite (open-source)
- All npm packages are open-source

**Deployment Options (Free):**
- **Frontend**: Vercel, Netlify, or Cloudflare Pages (all have generous free tiers)
- **Backend**: Render, Fly.io, or Railway free tiers
- **Database**: MongoDB Atlas free tier (512MB storage)
- **File Storage**: Local storage initially, or Cloudinary free tier (25GB)
- **Email**: Gmail SMTP (500 emails/day) or Brevo free tier
- **Caching**: Upstash Redis free tier or Node.js in-memory cache

**When Implementing New Features:**
- Prefer open-source packages over paid services
- Use public APIs (GitHub, LeetCode, Stack Overflow) for integrations
- Avoid services requiring credit cards unless they have truly free tiers
- For AI features: Use Ollama (local), Groq API (generous free tier), or Hugging Face

**Cost Target**: $0/month for development and MVP, $0-12/month for production (optional domain name only)

## Development Commands

### Setup
```bash
# Install all dependencies (client + server)
npm install

# Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit the .env files with your configuration
```

### Development
```bash
# Run both client and server concurrently
npm run dev

# Run separately
npm run dev:server  # Backend only (port 5000)
npm run dev:client  # Frontend only (port 5173)
```

### Client-Specific Commands
```bash
cd client
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

### Server-Specific Commands
```bash
cd server
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production mode
npm test         # Run tests
```

### Testing
```bash
# Server tests (when implemented)
cd server && npm test
```

## Architecture

### Monorepo Structure

This is an npm workspace with two main packages:
- `client/` - React 18 frontend with Vite
- `server/` - Node.js/Express backend with MongoDB

### Key Architectural Patterns

**Backend (server/src/)**
- **Models** (`models/`) - Mongoose schemas defining data structure
- **Routes** (`routes/`) - Express route definitions (thin routing layer)
- **Controllers** (`controllers/`) - Business logic handlers
- **Middleware** (`middleware/`) - Auth, error handling, rate limiting, connection verification
- **Socket** (`socket/`) - Real-time Socket.io event handlers

**Frontend (client/src/)**
- **Pages** (`pages/`) - Route-level components
- **Components** (`components/`) - Reusable UI components
- **Services** (`services/`) - API client (Axios) and Socket.io client
- **Store** (`store/`) - Zustand state management (auth state)
- **Hooks** (`hooks/`) - Custom React hooks

### Data Model Relationships

**Core Entities:**
- **User** - Base user account with authentication and profile
- **Organization** - Company profiles with admin/employee relationships
- **Event** - Timeline events (skills, projects, endorsements) with approval workflow
- **Project** - Collaborative projects linking multiple users
- **Connection** - User-to-user connections with request/accept/reject flow
- **Watch** - Follow functionality for users and organizations
- **Star** - Endorsements with weighted scoring (same org: 2x, connection: 1.5x, public: 1x)
- **Comment** - Comments on events with moderation capabilities
- **Notification** - Real-time notifications for user actions

**Key Relationships:**
- Events belong to users but can be submitted by others (pending approval)
- Projects have many team members (users) and can be claimed by organizations
- Stars track weighted endorsements based on relationship to event owner
- Connections are bidirectional with status tracking
- Comments support moderation settings (auto-approve, manual review, AI filter)

### Authentication Flow

1. JWT tokens generated on login/register (`POST /api/auth/login`, `/api/auth/register`)
2. Token stored in client localStorage and Zustand store
3. Axios interceptor adds token to all requests (`Authorization: Bearer <token>`)
4. Server middleware (`middleware/auth.js`) verifies JWT and attaches user to `req.user`
5. Protected routes require authentication middleware

### Event Approval System

Critical pattern used throughout the platform:
1. User A submits event to User B's timeline
2. Event created with `status: 'pending'`, `addedBy: User A`, `userId: User B`
3. Notification sent to User B via Socket.io
4. User B can:
   - **Approve**: Event becomes visible on timeline (`status: 'approved'`)
   - **Reject**: Event stays hidden, rejection reason stored and sent to User A
5. Self-added events auto-approve (`addedBy === userId`)

### Privacy Controls

Multi-level privacy system:
- **Event visibility**: Public (anyone), Connections Only, Private
- **Star visibility**: Show All, Count Only, Anonymous
- **Comment moderation**: Auto-Approve All, Auto-Approve Connections, Manual Review, AI Filter
- Settings can be global (user-level) or per-event overrides

### Real-time Features

Socket.io integration:
- Users join personal room on connection: `socket.emit('join', userId)`
- Notifications emitted to specific users: `io.to(userId).emit('notification', data)`
- Socket instance initialized in `server.js` and made globally available via `socket/index.js`

## Environment Variables

### Server (.env)
**Required (Free):**
- `MONGODB_URI` - MongoDB connection string (Free: MongoDB Atlas free tier or local)
- `JWT_SECRET` - Secret for signing tokens (Free: generate with `openssl rand -base64 32`)
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)

**Optional (Free Alternatives Available):**
- `CLOUDINARY_CLOUD_NAME` - Image upload service (Free tier: 25GB/month OR use local file storage)
- `CLOUDINARY_API_KEY` - Cloudinary key (Optional, free tier available)
- `CLOUDINARY_API_SECRET` - Cloudinary secret (Optional, free tier available)
- `EMAIL_HOST` - Email service host (Free: smtp.gmail.com with Gmail account)
- `EMAIL_PORT` - Email port (Free: 587 for Gmail SMTP)
- `EMAIL_USER` - Email username (Free: your Gmail address)
- `EMAIL_PASSWORD` - Email app password (Free: Generate Gmail app password)

**Zero-Cost MVP**: Only `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_URL` are needed. Email and file uploads can be added later.

### Client (.env)
- `VITE_API_URL` - Backend API base URL (required)
- `VITE_SOCKET_URL` - Socket.io server URL (required)

## API Structure

All routes prefixed with `/api`:
- `/api/auth/*` - Authentication and user management
- `/api/users/*` - User profiles and search
- `/api/connections/*` - Connection requests and watch/follow
- `/api/events/*` - Timeline event CRUD and approval workflow
- `/api/stars/*` - Endorsement system with weighted scoring
- `/api/comments/*` - Comment system with moderation
- `/api/projects/*` - Project management and team linking
- `/api/organizations/*` - Organization profiles
- `/api/notifications/*` - Notification retrieval and management
- `/api/search/*` - Universal search functionality

## Common Workflows

### Adding New API Endpoints

1. Define Mongoose schema in `server/src/models/`
2. Create route file in `server/src/routes/`
3. Implement controller logic in `server/src/controllers/` (optional, can be inline in routes)
4. Add authentication middleware if protected: `const { protect } = require('../middleware/auth')`
5. Register route in `server/src/server.js`
6. Add API calls in `client/src/services/api.js`

### Adding New Pages

1. Create page component in `client/src/pages/`
2. Add route in `client/src/App.jsx` with React Router
3. Update navigation in `client/src/components/layout/Header.jsx` or `Sidebar.jsx` if needed
4. Use Zustand store for auth state: `const { user } = useAuthStore()`
5. Use Axios instance from `services/api.js` for API calls

### Working with Approvals

Pattern used for events, connections, comments:
- Create with `status: 'pending'`
- Emit notification via Socket.io
- Provide separate approve/reject endpoints that update status and store reasons
- Handle rejection feedback for transparency

## Tech Stack Details

### Frontend
- **React 18** - UI library
- **Vite** - Build tool (faster than CRA)
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management (simpler than Redux)
- **React Query** - Server state and caching
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication

### Backend
- **Express** - Web framework
- **Mongoose** - MongoDB ODM with schema validation
- **JWT** - Stateless authentication
- **Bcrypt** - Password hashing
- **Socket.io** - Real-time bidirectional communication
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **Express Validator** - Input validation

## Database

MongoDB with Mongoose ODM. Connection configured in `server/src/server.js`.

**Accessing the database:**
```bash
# Using mongosh
mongosh
use professional-reputation-platform
db.users.find().pretty()

# Using MongoDB Compass GUI
# Connect to: mongodb://localhost:27017
```

## Testing API Endpoints

Health check: `GET http://localhost:5000/health`

Example registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "individual"
  }'
```

## Troubleshooting

### Port conflicts
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### MongoDB not running
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Module not found
```bash
# Clear all node_modules and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm install
```

## Zero-Cost Deployment

### Frontend Deployment (Vercel - Recommended)

**Cost: $0/month**

1. **Prepare for deployment:**
```bash
cd client
npm run build  # Creates dist/ folder
```

2. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time)
cd client
vercel

# Follow prompts:
# - Link to Vercel account (free signup)
# - Set root directory to ./client
# - Build command: npm run build
# - Output directory: dist
```

3. **Set environment variables in Vercel dashboard:**
- `VITE_API_URL` - Your backend URL (e.g., https://your-app.onrender.com/api)
- `VITE_SOCKET_URL` - Your backend URL (e.g., https://your-app.onrender.com)

**Alternative free options:** Netlify, Cloudflare Pages

---

### Backend Deployment (Render - Recommended)

**Cost: $0/month (with auto-sleep after 15 mins inactivity)**

1. **Push code to GitHub**

2. **Create Render account** (free at render.com)

3. **Create new Web Service:**
- Connect GitHub repo
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Plan: Free

4. **Set environment variables:**
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_generated_secret
JWT_EXPIRE=7d
CLIENT_URL=your_vercel_frontend_url
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail
EMAIL_PASSWORD=your_gmail_app_password
```

5. **Deploy** - Render auto-deploys on git push

**Note:** Free tier sleeps after 15 mins. First request takes ~30s to wake up. For always-on, upgrade to $7/month.

**Alternative free options:** Fly.io, Railway, Cyclic

---

### Database Setup (MongoDB Atlas)

**Cost: $0/month (512MB free tier)**

1. **Create account** at mongodb.com/cloud/atlas
2. **Create free cluster** (M0 Sandbox - 512MB)
3. **Create database user** with password
4. **Whitelist IP:** Add `0.0.0.0/0` (allow from anywhere)
5. **Get connection string:**
   - Click "Connect" > "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
6. **Use in .env:** `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname`

---

### Email Service (Gmail SMTP)

**Cost: $0 (500 emails/day limit)**

1. **Use existing Gmail account** or create new one
2. **Enable 2FA** on Gmail account
3. **Create App Password:**
   - Google Account > Security > 2-Step Verification > App passwords
   - Generate app password for "Mail"
4. **Use in .env:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=generated_app_password
```

**Alternative:** Brevo (SendinBlue) free tier - 300 emails/day

---

### File Storage Options

**Option 1: Local Storage (MVP)**
- **Cost:** $0
- Store files in `server/uploads/` directory
- **Limitation:** Files lost on free tier restarts, not CDN

**Option 2: Cloudinary (Recommended)**
- **Cost:** $0 (25GB storage, 25GB bandwidth/month free)
1. Create account at cloudinary.com
2. Get credentials from dashboard
3. Add to .env:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### Complete Zero-Cost Stack

```
✅ Frontend: Vercel (100GB bandwidth/month)
✅ Backend: Render (750 hours/month free)
✅ Database: MongoDB Atlas (512MB storage)
✅ Email: Gmail SMTP (500 emails/day)
✅ Files: Cloudinary (25GB/month) or Local

Total cost: $0/month
Scaling cost: $10-20/month when needed
```

## Code Patterns

### Error Handling
Use consistent error responses:
```javascript
// Controller pattern
try {
  // Logic
  res.status(200).json({ success: true, data: result });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
```

### Protected Routes
```javascript
const { protect } = require('../middleware/auth');
router.get('/profile', protect, getProfile);
```

### Socket.io Notifications
```javascript
const { getIO } = require('../socket');
const io = getIO();
io.to(userId).emit('notification', { type: 'connection_request', data });
```

### Mongoose Population
Related data loaded via populate:
```javascript
const events = await Event.find({ userId })
  .populate('addedBy', 'firstName lastName')
  .populate('organizationId', 'name logo');
```
