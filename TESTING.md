# Testing Checklist for Professional Reputation Platform

## Prerequisites
- [ ] MongoDB is running (local or Atlas)
- [ ] Server dependencies installed (`cd server && npm install`)
- [ ] Client dependencies installed (`cd client && npm install`)
- [ ] Environment variables configured

## Backend Testing

### 1. Server Startup
```bash
cd server
npm run dev
```
**Expected:** Server starts on port 5000, connects to MongoDB

### 2. Health Check
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"ok"}`

### 3. Authentication Flow

#### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "userType": "individual"
  }' \
  -c cookies.txt
```
**Expected:** Success response with user data, httpOnly cookie set

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' \
  -c cookies.txt
```
**Expected:** Success response, JWT cookie set

#### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```
**Expected:** User profile data

### 4. Timeline Events

#### Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "skill",
    "title": "React Development",
    "description": "Expert in React and modern web development",
    "visibility": "public"
  }'
```
**Expected:** Event created successfully

#### Get User Events
```bash
curl http://localhost:5000/api/events/user/{userId} \
  -b cookies.txt
```
**Expected:** List of user events

### 5. Search Functionality
```bash
curl "http://localhost:5000/api/search?q=test" \
  -b cookies.txt
```
**Expected:** Search results for users, projects, organizations

## Frontend Testing

### 1. Start Development Server
```bash
cd client
npm run dev
```
**Expected:** Vite dev server starts on port 5173

### 2. Manual UI Testing

#### Authentication
- [ ] Navigate to http://localhost:5173
- [ ] Click "Register" or "Sign Up"
- [ ] Fill form with:
  - Email: test2@example.com
  - Password: Test123!@#
  - First Name: John
  - Last Name: Doe
- [ ] Submit form
- [ ] Verify redirect to dashboard/home

#### Profile & Timeline
- [ ] Navigate to Profile page
- [ ] Click "Add Event" button
- [ ] Create a new skill/achievement:
  - Type: Skill
  - Title: JavaScript
  - Description: Expert level
  - Visibility: Public
- [ ] Verify event appears on timeline

#### Connections
- [ ] Navigate to Connections page
- [ ] Verify tabs: My Connections, Requests, Sent
- [ ] Test search functionality (if you have connections)

#### Search
- [ ] Navigate to Search page
- [ ] Enter search query (e.g., "test")
- [ ] Verify results display
- [ ] Test filters (location, skills, etc.)
- [ ] Test tab navigation (All, Users, Projects, Organizations)

#### Projects
- [ ] Navigate to Projects page
- [ ] Click "Create Project"
- [ ] Fill form:
  - Title: Test Project
  - Description: A test project
  - Technologies: React, Node.js
  - Visibility: Public
- [ ] Submit and verify creation
- [ ] Click on project to view details
- [ ] Test adding team members (if implemented)

#### Organizations
- [ ] Navigate to Organizations page
- [ ] Click "Create Organization"
- [ ] Fill form:
  - Name: Test Company
  - Industry: Technology
  - Location: San Francisco, USA
- [ ] Submit and verify creation
- [ ] View organization details
- [ ] Test employee management (if admin)

#### Settings
- [ ] Navigate to Settings page
- [ ] Test Profile tab:
  - Update first name, last name
  - Add headline, bio
  - Save changes
- [ ] Test Privacy tab:
  - Change profile visibility
  - Toggle email visibility
  - Update comment moderation
- [ ] Test Password tab:
  - Change password
  - Verify old password required

#### Notifications
- [ ] Click notification bell icon in header
- [ ] Verify dropdown shows recent notifications
- [ ] Click "View All" to see full page
- [ ] Test mark as read functionality
- [ ] Test delete notification

### 3. Browser Console Checks
- [ ] Open DevTools Console (F12)
- [ ] Verify no errors during navigation
- [ ] Check Network tab for failed requests
- [ ] Verify cookies are being set (Application > Cookies)

## Integration Testing

### Real-time Features
1. Open app in two different browsers/incognito windows
2. Login with different users
3. Send connection request from User A to User B
4. Verify User B receives real-time notification
5. Accept request and verify both users see update

### Cross-Feature Testing
1. Create a project
2. Add team members
3. Approve team members
4. Create events for project milestones
5. Star events from other accounts
6. Verify weighted scoring works

## Security Testing

### Cookie Security
- [ ] Check that JWT is in httpOnly cookie (not localStorage)
- [ ] Verify cookie has Secure flag (in production)
- [ ] Test that cookie expires correctly

### Input Validation
- [ ] Try SQL injection in forms
- [ ] Try XSS payloads: `<script>alert('xss')</script>`
- [ ] Verify inputs are sanitized

### Authentication
- [ ] Try accessing protected routes without login
- [ ] Verify redirect to login page
- [ ] Test password requirements (min 8 chars, special chars)

## Performance Testing

### Page Load Times
- [ ] Measure initial page load
- [ ] Check bundle size in DevTools
- [ ] Verify images load efficiently

### API Response Times
- [ ] Search queries < 500ms
- [ ] User profile load < 300ms
- [ ] Timeline load < 500ms

## Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile (responsive design)

## Known Limitations (MVP)

The following features are planned but not yet implemented:
- Email notifications (email service not configured)
- File uploads (Cloudinary not configured)
- Account deletion (marked as "not implemented")
- Advanced caching (Redis not configured)
- Automated tests (not yet written)

## Bug Tracking

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| | | | |

## Test Results Summary

**Date:** _______________
**Tester:** _______________

### Backend
- [ ] All routes responding correctly
- [ ] Authentication working
- [ ] Database operations successful
- [ ] Real-time notifications working

### Frontend
- [ ] All pages rendering correctly
- [ ] Forms submitting successfully
- [ ] Navigation working
- [ ] No console errors

### Issues Found:
1. _______________
2. _______________
3. _______________

### Overall Status: [ ] PASS [ ] FAIL [ ] NEEDS WORK
