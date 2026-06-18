# 🚀 Getting Started Guide

This guide will help you set up and run the Professional Reputation Platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)

## Installation Steps

### 1. Navigate to the Project Directory

```bash
cd professional-reputation-platform
```

### 2. Install Dependencies

Install all dependencies for both client and server using the workspace feature:

```bash
npm install
```

This will install dependencies for:
- Root project
- Server (backend)
- Client (frontend)

### 3. Set Up MongoDB

**Option A: Local MongoDB**
1. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   # MongoDB runs as a service automatically after installation
   ```

2. Verify MongoDB is running:
   ```bash
   mongosh
   # You should see a MongoDB shell prompt
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Use it in your `.env` file

### 4. Configure Environment Variables

**Server Configuration:**

1. Copy the example env file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit `server/.env` with your values:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database - Update with your MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/professional-reputation-platform

   # JWT - IMPORTANT: Change this secret in production!
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
   JWT_EXPIRE=7d

   # Cloudinary (Optional for now - for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email (Optional for now - for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Client URL
   CLIENT_URL=http://localhost:5173
   ```

**Client Configuration:**

1. Copy the example env file:
   ```bash
   cd ../client
   cp .env.example .env
   ```

2. Edit `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

### 5. Start the Application

You have two options:

**Option A: Run both client and server together (Recommended for development)**

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

**Option B: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/health

## 📝 First Steps

### Create Your First Account

1. Go to http://localhost:5173
2. Click "Get Started" or "Register"
3. Fill in your details:
   - First Name
   - Last Name
   - Email
   - Password (minimum 8 characters)
   - Account Type: Choose "Individual" or "Organization Admin"
4. Click "Create Account"

### Test the Connection System

1. Create a second account (you can use a different email)
2. Send a connection request
3. Accept/reject with reasons
4. Try the "Watch" feature to follow users

## 🔧 Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Nodemon restarts the server on file changes

### View Database

**Using MongoDB Compass (GUI):**
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. View the `professional-reputation-platform` database

**Using mongosh (CLI):**
```bash
mongosh
use professional-reputation-platform
db.users.find().pretty()
```

### Test API Endpoints

You can use tools like:
- **Thunder Client** (VS Code extension)
- **Postman**
- **cURL**

Example: Test user registration
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

### Debug Mode

**Backend:**
```bash
cd server
NODE_ENV=development npm run dev
```

**Frontend:**
Check browser console (F12) for errors and logs

## 🐛 Troubleshooting

### Port Already in Use

If you get "Port already in use" errors:

**Backend (Port 5000):**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend (Port 5173):**
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### MongoDB Connection Issues

1. Ensure MongoDB is running:
   ```bash
   # macOS
   brew services list | grep mongodb
   
   # Linux
   sudo systemctl status mongod
   ```

2. Check connection string in `server/.env`
3. Verify network access if using MongoDB Atlas

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm install
```

### CORS Errors

1. Check `CLIENT_URL` in `server/.env`
2. Verify CORS settings in `server/src/server.js`

## 📚 Next Steps

Once your app is running, you can:

1. **Explore the codebase:**
   - `/server/src/models/` - Database schemas
   - `/server/src/routes/` - API endpoints
   - `/client/src/pages/` - UI pages
   - `/client/src/components/` - Reusable components

2. **Implement remaining features:**
   - Events/Timeline functionality
   - Stars and comments system
   - Project management
   - Organization profiles
   - Search functionality

3. **Customize:**
   - Modify colors in `client/tailwind.config.js`
   - Add new fields to models
   - Create custom components

## 🛠️ Available Scripts

### Root Directory
- `npm run dev` - Run both client and server
- `npm run dev:server` - Run server only
- `npm run dev:client` - Run client only
- `npm run build` - Build both client and server
- `npm start` - Run production server

### Server Directory
- `npm run dev` - Run development server with nodemon
- `npm start` - Run production server
- `npm test` - Run tests (when implemented)

### Client Directory
- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 🎓 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)

## 💡 Tips for New Developers

1. Start with understanding the data models in `/server/src/models/`
2. Follow the authentication flow to understand user management
3. Use the browser's React DevTools for debugging components
4. Check the Network tab to see API requests and responses
5. Read inline code comments for implementation details

## 🤝 Need Help?

If you encounter issues:
1. Check this guide thoroughly
2. Review error messages carefully
3. Search for similar issues online
4. Check the MongoDB and Node.js logs

---

Happy coding! 🚀
