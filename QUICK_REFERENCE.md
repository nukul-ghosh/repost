# Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd professional-reputation-platform

# Install all dependencies
npm install

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start development servers (both client & server)
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `server/.env` | Backend environment variables |
| `client/.env` | Frontend environment variables |
| `server/src/server.js` | Backend entry point |
| `client/src/main.jsx` | Frontend entry point |
| `server/src/models/` | Database schemas |
| `server/src/routes/` | API endpoints |
| `client/src/pages/` | UI pages |

## 🔑 Key Features Implemented

### ✅ Fully Implemented
- User authentication (register, login, JWT)
- Connection system (send, accept, reject with reasons)
- Watch/Follow system (users and organizations)
- Real-time notifications via Socket.io
- Privacy settings structure
- Database models for all entities

### 🚧 Placeholder/Incomplete
- Timeline events (needs controller implementation)
- Stars/endorsements (needs controller implementation)
- Comments system (needs controller implementation)
- Projects (needs controller implementation)
- Organizations (needs controller implementation)
- Search functionality (needs controller implementation)
- UI pages (basic structure only)

## 🗄️ Database Models

### User
```javascript
{
  email, password, firstName, lastName,
  userType: 'individual' | 'organizationAdmin',
  profilePicture, headline, bio, location,
  privacySettings: { ... },
  connectionsCount, watchersCount, watchingCount
}
```

### Connection
```javascript
{
  requester: userId,
  recipient: userId,
  status: 'pending' | 'accepted' | 'rejected',
  requestMessage, rejectionReason
}
```

### Event
```javascript
{
  user: userId,
  eventType: 'skill' | 'project' | 'certification' | 'endorsement' | ...,
  title, description, eventDate,
  addedBy: userId,
  status: 'pending' | 'approved' | 'rejected',
  starsCount, weightedStarsScore, commentsCount,
  visibility, starVisibility, commentModeration
}
```

### Project
```javascript
{
  title, description, startDate, endDate,
  createdBy: userId,
  teamMembers: [{ user, role, status }],
  organizations: [{ organization, role, status }],
  technologies, tags, visibility
}
```

### Organization
```javascript
{
  name, logo, description, industry,
  admins: [{ user, role }],
  employees: [{ user, position, isVerified }],
  isVerified, verificationBadge
}
```

## 🔌 API Endpoints Reference

### Authentication
```
POST   /api/auth/register        - Register user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
PUT    /api/auth/update-profile  - Update profile
PUT    /api/auth/privacy-settings - Update privacy
```

### Connections (✅ Fully Implemented)
```
POST   /api/connections/request                    - Send connection request
PUT    /api/connections/:id/accept                 - Accept request
PUT    /api/connections/:id/reject                 - Reject request
GET    /api/connections/my-connections             - Get connections
GET    /api/connections/requests/received          - Received requests
GET    /api/connections/requests/sent              - Sent requests
POST   /api/connections/watch/user/:userId         - Watch user
POST   /api/connections/watch/organization/:orgId  - Watch org
DELETE /api/connections/watch/user/:userId         - Unwatch user
GET    /api/connections/watching                   - Get watching list
GET    /api/connections/watchers                   - Get watchers
```

### Events (🚧 Placeholder)
```
POST   /api/events              - Create event
GET    /api/events/user/:userId - Get user timeline
PUT    /api/events/:id/approve  - Approve event
PUT    /api/events/:id/reject   - Reject event
DELETE /api/events/:id          - Delete event
```

### Stars (🚧 Placeholder)
```
POST   /api/stars/:eventId      - Star event
DELETE /api/stars/:eventId      - Remove star
GET    /api/stars/:eventId      - Get event stars
```

### Comments (🚧 Placeholder)
```
POST   /api/comments/:eventId   - Add comment
GET    /api/comments/:eventId   - Get comments
PUT    /api/comments/:id/moderate - Moderate comment
DELETE /api/comments/:id        - Delete comment
```

## 🎨 Frontend Routes

```
/                      - Landing page (public)
/login                 - Login page (public)
/register              - Register page (public)
/profile/:userId       - User profile (protected)
/timeline/:userId      - User timeline (protected)
/connections           - Connections management (protected)
/search                - Search page (protected)
/projects              - Projects listing (protected)
/projects/:projectId   - Project details (protected)
/organizations         - Organizations listing (protected)
/organizations/:orgId  - Organization details (protected)
/settings              - User settings (protected)
/notifications         - Notifications (protected)
```

## 🔐 Authentication Headers

All protected endpoints require:
```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>'
}
```

## 💾 Sample API Calls

### Register User
```javascript
POST /api/auth/register
Body: {
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "individual"
}
```

### Login
```javascript
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Send Connection Request
```javascript
POST /api/connections/request
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "recipientId": "user_id_here",
  "message": "I'd like to connect with you"
}
```

### Accept Connection
```javascript
PUT /api/connections/:connectionId/accept
Headers: { "Authorization": "Bearer <token>" }
```

### Reject Connection
```javascript
PUT /api/connections/:connectionId/reject
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "reason": "Don't know this person"
}
```

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "userType": "individual"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User (with token)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🛠️ Development Workflow

1. **Start a new feature:**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make changes:**
   - Edit files
   - Test locally
   - Check for errors

3. **Commit:**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```

4. **Push:**
   ```bash
   git push origin feature/feature-name
   ```

## 🐛 Debugging Tips

### Backend Debugging
```javascript
// Add console.log in controllers
console.log('Request body:', req.body);
console.log('User:', req.user);
console.log('Params:', req.params);

// Check MongoDB queries
const result = await Model.find({ ... });
console.log('Query result:', result);
```

### Frontend Debugging
```javascript
// React DevTools (Browser Extension)
// Check component state and props

// Console logging
console.log('State:', someState);
console.log('API Response:', response.data);

// Network tab
// Check API calls and responses
```

### MongoDB Debugging
```bash
# Connect to MongoDB shell
mongosh

# Use the database
use professional-reputation-platform

# Check collections
show collections

# Query data
db.users.find().pretty()
db.connections.find({ status: 'pending' })
db.events.countDocuments()
```

## 📦 Package Scripts

### Root Directory
```bash
npm run dev          # Run both client and server
npm run dev:server   # Run server only
npm run dev:client   # Run client only
npm run build        # Build both
npm start            # Production server
```

### Server
```bash
cd server
npm run dev          # Development with nodemon
npm start            # Production
```

### Client
```bash
cd client
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

## 🌐 Environment Variables

### Required for Development

**Server (.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/professional-reputation-platform
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Optional (For Full Features)
```env
# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (notifications)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

## 🔍 Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Check connection string in .env
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm install
```

### Token Invalid/Expired
```bash
# Clear localStorage in browser console
localStorage.clear()

# Or just remove the token
localStorage.removeItem('token')
```

## 📚 Useful Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT.io](https://jwt.io/) - Decode JWT tokens

## 🎯 Next Steps

1. **Set up your development environment**
   - Follow GETTING_STARTED.md

2. **Explore the codebase**
   - Read PROJECT_STRUCTURE.md
   - Review the models in `server/src/models/`

3. **Start implementing features**
   - Follow IMPLEMENTATION_ROADMAP.md
   - Start with Phase 1: Timeline Events

4. **Test as you go**
   - Use Postman/Thunder Client for API testing
   - Test UI in browser

5. **Deploy when ready**
   - Follow deployment guides online
   - Consider Heroku, Railway, or DigitalOcean

---

**Need help? Check the detailed documentation in README.md and other guide files!**
