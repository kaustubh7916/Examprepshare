# ExamPrepShare 📚

A full-stack platform where students can share and discover study resources for various competitive exams like UPSC, JEE, GATE, and more.

## 🌟 Features

- **Resource Sharing**: Upload and share study materials (PDFs, documents, images)
- **Smart Filtering**: Filter resources by exam category and section
- **Rating System**: Rate and review resources to help others
- **Search Functionality**: Find resources by title, description, or tags
- **User Authentication**: Secure login and registration with JWT
- **Responsive Design**: Works seamlessly on desktop and mobile
- **File Management**: Secure file storage with Firebase Storage

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Firebase Storage** for file uploads
- **Express Validator** for input validation
- **Multer** for file handling

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Firebase project with Storage enabled

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd examprepshare/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/examprepshare
   JWT_SECRET=your_super_secret_jwt_key_here
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

   The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=ExamPrepShare
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be running on `http://localhost:3000`

## 📁 Project Structure

```
ExamPrepShare/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── firebase.js        # Firebase configuration
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Resource.js        # Resource model
│   │   └── Rating.js          # Rating model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── resources.js       # Resource CRUD routes
│   │   └── ratings.js         # Rating routes
│   ├── index.js               # Main server file
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Navigation component
│   │   │   ├── ResourceCard.jsx # Resource card component
│   │   │   └── StarRating.jsx # Star rating component
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Register.jsx   # Registration page
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Upload.jsx     # Resource upload page
│   │   │   └── ResourceDetails.jsx # Resource details page
│   │   ├── utils/
│   │   │   └── api.js         # API configuration
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # App entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── env.example
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resources
- `GET /api/resources` - Get all resources (with filtering)
- `GET /api/resources/:id` - Get single resource
- `POST /api/resources` - Upload new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Ratings
- `POST /api/ratings` - Add/update rating
- `GET /api/ratings/resource/:id` - Get ratings for resource
- `GET /api/ratings/user/:id` - Get user's ratings
- `GET /api/ratings/my-ratings` - Get current user's ratings
- `DELETE /api/ratings/:id` - Delete rating
- `GET /api/ratings/stats/:id` - Get rating statistics

## 🎨 Features Overview

### Dashboard
- Browse all uploaded resources
- Filter by exam category and section
- Search functionality
- Pagination support
- Resource statistics

### Resource Management
- Upload files (PDF, DOC, DOCX, TXT, JPG, PNG)
- Add descriptions and tags
- Categorize by exam type
- File size validation (max 50MB)

### Rating System
- 5-star rating system
- Written reviews
- Rating statistics
- User-specific ratings

### User Experience
- Responsive design
- Real-time notifications
- Loading states
- Error handling
- Form validation

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with Node.js buildpack

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Environment Variables for Production
```env
# Backend
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
# ... other Firebase config

# Frontend
VITE_API_URL=https://your-backend-url.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [MongoDB](https://www.mongodb.com/) for the database
- [Firebase](https://firebase.google.com/) for file storage
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact us at [your-email@example.com].

---

Made with ❤️ for students by students
