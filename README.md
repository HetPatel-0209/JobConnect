# JobConnect

A comprehensive job portal application that connects job seekers with recruiters and organizations. Built with modern web technologies, JobConnect provides a seamless experience for job posting, application management, and real-time communication.

## 🚀 Features

### For Job Seekers
- **Job Discovery**: Browse and search for jobs with advanced filtering options
- **Profile Management**: Create and manage professional profiles
- **Resume Upload**: Upload and manage resumes with AI-powered parsing
- **Job Applications**: Apply to jobs with ATS (Applicant Tracking System) scoring
- **Saved Jobs**: Save interesting job postings for later
- **Real-time Chat**: Communicate with recruiters and HR representatives
- **Organization Insights**: View detailed company profiles and information

### For Recruiters
- **Job Posting**: Create and manage job postings with detailed requirements
- **Applicant Management**: Review applications with ATS scoring and filtering
- **Analytics Dashboard**: Track job performance and application metrics
- **Organization Management**: Manage company profiles and details
- **Real-time Communication**: Chat with potential candidates
- **Application Tracking**: Monitor application status and candidate pipeline

### General Features
- **Real-time Notifications**: Instant updates for messages and applications
- **Responsive Design**: Optimized for desktop and mobile devices
- **Secure Authentication**: JWT-based authentication with role-based access
- **File Management**: Cloudinary integration for image and document uploads
- **Search & Filtering**: Advanced search capabilities across jobs and organizations

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Modern icon library
- **React Icons** - Additional icon sets

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Cloud-based image and video management
- **Multer** - File upload handling
- **Nodemailer** - Email sending functionality

### Additional Tools
- **PDF-lib & PDF-parse** - PDF processing for resumes
- **DOCX-parser** - Document parsing
- **Groq SDK** - AI integration for resume analysis
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Nodemon** - Development server auto-restart

## 📁 Project Structure

```
JobConnect/
├── Backend/
│   ├── config/          # Database and configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middleware functions
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── tests/           # Test files
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── Frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HetPatel-0209/JobConnect.git
   cd JobConnect
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   ```

### Environment Configuration

Create a `.env` file in the Backend directory with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for password reset)
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AI Integration (optional)
GROQ_API_KEY=your_groq_api_key
```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   The backend will run on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm test
```

### Frontend Linting
```bash
cd Frontend
npm run lint
```

## 📚 API Documentation

The backend provides RESTful APIs for:
- User authentication and management
- Job posting and management
- Application processing
- Organization management
- Real-time chat functionality
- File upload and processing

Key endpoints include:
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/jobs` - Job listings
- `POST /api/jobs` - Create job posting
- `POST /api/applications` - Submit job application

## 🔧 Key Features Implementation

### Real-time Communication
- Socket.IO integration for instant messaging
- Online user status tracking
- Message delivery and read receipts
- Typing indicators

### ATS Integration
- Resume parsing and scoring
- Keyword matching algorithms
- Experience and education evaluation
- Automated candidate ranking

### File Management
- Cloudinary integration for secure file storage
- Support for multiple file formats (PDF, DOCX, images)
- Automatic file optimization and transformation

## 🚀 Deployment

### Backend Deployment (Render)
The backend is configured for deployment on Render platform with:
- Automatic builds from Git repository
- Environment variable management
- Health check endpoints

### Frontend Deployment (Vercel)
The frontend is optimized for Vercel deployment with:
- Static site generation
- Automatic deployments from Git
- Environment variable configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the robust database solution
- Cloudinary for excellent file management services
- All open-source contributors whose libraries made this project possible

## 📞 Support

For support, email 12202080601055@adit.ac.in or create an issue in the repository.

---

**JobConnect** - Connecting talent with opportunity 🚀
