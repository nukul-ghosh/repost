# Professional Reputation Platform

A LinkedIn-alternative platform that builds verifiable professional resumes through timeline-based events, community endorsements, and transparent reputation tracking.

## 🌟 Key Features

### Core Functionality
- **Timeline-Based Resumes**: Build professional profiles through chronological events
- **Verifiable Events**: Skills, projects, certifications, and endorsements with sources
- **Community Endorsements**: Team members, managers, and colleagues can add events to user profiles
- **Star System**: Community-driven trust indicators for each event (weighted by organization affiliation)
- **Project Interlinking**: Connect team members through shared projects
- **Organization Profiles**: Companies can showcase their reputation and projects

### User Types
- **Individual Users**: Build and manage personal professional timelines
- **Organization Admins**: Manage company profiles, verify employees, add organizational events

### Social Features
- **Connections**: LinkedIn-style connection requests and acceptance
- **Watch/Follow**: Follow users and organizations without direct connection
- **Comments**: Public discourse on timeline events with moderation
- **Approval System**: Users approve/reject events added to their timeline with reason feedback

### Privacy & Moderation
- **Granular Privacy Controls**: Per-event and global visibility settings
- **Comment Moderation**: Auto-approve, manual review, or AI filtering (per-event or global)
- **Anonymous Stars**: Optional anonymous endorsement counting
- **Rejection Feedback**: Users explain why they reject events/comments
- **Public Profile Limits**: Non-authenticated users see limited profile information

### Discovery
- **Smart Search**: Find users by skills, projects, or organizations
- **Organization Verification**: Verified company profiles
- **Team Composition**: View project contributors and their roles

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for server state
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.io Client** for real-time updates

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time features
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **Cloudinary** for image storage

## 📁 Project Structure

```
professional-reputation-platform/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand stores
│   │   ├── services/         # API service layer
│   │   ├── utils/            # Helper functions
│   │   ├── config/           # Configuration files
│   │   └── App.jsx           # Root component
│   └── package.json
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   ├── controllers/      # Route controllers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── utils/            # Helper functions
│   │   ├── config/           # Configuration
│   │   ├── socket/           # Socket.io handlers
│   │   └── server.js         # Entry point
│   └── package.json
└── package.json               # Root workspace config
```

## 🔧 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Setup

1. **Clone and install dependencies:**
```bash
cd professional-reputation-platform
npm install
```

2. **Configure environment variables:**

Create `server/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/professional-reputation-platform

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Client URL
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

3. **Start development servers:**
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/search` - Search users
- `PUT /api/users/privacy-settings` - Update privacy settings

### Connections
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/:id/accept` - Accept connection request
- `PUT /api/connections/:id/reject` - Reject connection request with reason
- `GET /api/connections/my-connections` - Get user connections
- `POST /api/connections/watch/:userId` - Watch/follow a user

### Timeline Events
- `POST /api/events` - Create timeline event
- `PUT /api/events/:id/approve` - Approve pending event
- `PUT /api/events/:id/reject` - Reject event with reason
- `GET /api/events/user/:userId` - Get user's timeline
- `DELETE /api/events/:id` - Delete own event

### Stars/Endorsements
- `POST /api/stars/:eventId` - Star an event
- `DELETE /api/stars/:eventId` - Remove star
- `GET /api/stars/:eventId` - Get star count and details

### Comments
- `POST /api/comments/:eventId` - Add comment to event
- `PUT /api/comments/:id/moderate` - Approve/reject comment
- `DELETE /api/comments/:id` - Delete comment

### Projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id/add-member` - Add team member to project
- `GET /api/projects/:id` - Get project details with team

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization profile
- `POST /api/organizations/:id/claim-project` - Claim project ownership
- `GET /api/organizations/search` - Search organizations

## 🎯 Key Workflows

### Adding a Skill Event
1. User creates skill event with timeline date and source
2. Event appears on their timeline immediately (self-added)
3. Other users can star the event to increase trust
4. Connected users can comment on the event

### Manager Endorsement
1. Manager (connected user) adds endorsement event to team member's timeline
2. Event goes to team member's "pending approval" queue
3. Team member approves or rejects with reason
4. If approved, event appears on timeline
5. If rejected, manager sees rejection reason

### Project Collaboration
1. User creates project with timeline and description
2. Adds team members to the project
3. Each team member receives notification to approve/reject participation
4. Project links all approved members' timelines
5. Organization can claim ownership of the project
6. Public can view team composition and project details

### Star Weighting
- Stars from same organization members have 2x weight
- Stars from direct connections have 1.5x weight
- Stars from public users have 1x weight
- Weighted score displayed alongside raw star count

## 🔒 Privacy Levels

### Event Visibility Options
- **Public**: Anyone can see (including non-authenticated users, limited info)
- **Connections Only**: Only direct connections can see full details
- **Private**: Only the user can see

### Star Visibility Options
- **Show All**: Display who starred the event
- **Count Only**: Show total count, hide individual users
- **Anonymous**: Hide stars completely (user still knows internally)

### Comment Moderation Settings
- **Auto-Approve All**: Comments appear immediately
- **Auto-Approve Connections**: Connection comments auto-approve, others need review
- **Manual Review**: All comments need approval
- **AI Filter**: Automatic profanity/toxicity detection with manual override

## 🚧 Future Enhancements

- [ ] Skill verification through automated tests/certifications
- [ ] AI-powered resume suggestions
- [ ] Export timeline as traditional resume (PDF)
- [ ] Analytics dashboard for users and organizations
- [ ] Reputation score algorithm
- [ ] Blockchain verification for critical events
- [ ] Video endorsements
- [ ] Integration with GitHub, LinkedIn, etc.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

**Built with ❤️ for transparent professional reputation**
