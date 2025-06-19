const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const JobSeeker = require('./models/JobSeeker');
const Organization = require('./models/Organizations');
const JobPost = require('./models/JobPost');
const Resume = require('./models/Resume');
const Application = require('./models/Application');
const { Chat, Message } = require('./models/Chat');

// Sample organizations
const organizations = [
    {
        gstin: "07AAAAA0000A1Z5",
        name: "TechCorp Solutions",
        companySize: "201-500",
        description: {
            about: "Leading technology solutions provider specializing in web and mobile applications.",
            vision: "To transform businesses through innovative technology solutions.",
            mission: "Delivering cutting-edge software solutions that drive business growth.",
            benefits: ["Health Insurance", "Work from Home", "Flexible Hours", "Learning Budget"]
        },
        contact: {
            email: "hr@techcorp.com",
            phone: "+91-9876543210",
            address: {
                street: "Tech Park, Sector 5",
                city: "Gurgaon",
                state: "Haryana",
                pincode: "122001",
                country: "India"
            }
        },
        website: "https://techcorp.com",
        socialMedia: {
            linkedin: "https://linkedin.com/company/techcorp",
            twitter: "https://twitter.com/techcorp"
        }
    },
    {
        gstin: "19AAAAA0000A1Z5",
        name: "InnovateLabs",
        companySize: "51-200",
        description: {
            about: "Startup focused on AI and machine learning solutions.",
            vision: "Making AI accessible to every business.",
            mission: "Building intelligent solutions for tomorrow's challenges.",
            benefits: ["Stock Options", "Flexible Work", "Health Coverage", "Team Outings"]
        },
        contact: {
            email: "careers@innovatelabs.com",
            phone: "+91-8765432109",
            address: {
                street: "Innovation Hub, Block A",
                city: "Bangalore",
                state: "Karnataka",
                pincode: "560001",
                country: "India"
            }
        },
        website: "https://innovatelabs.com"
    },
    {
        gstin: "27AAAAA0000A1Z5",
        name: "Global Enterprises",
        companySize: "1000+",
        description: {
            about: "Multinational corporation with diverse business interests.",
            vision: "Global leadership in sustainable business practices.",
            mission: "Creating value for customers, employees, and shareholders worldwide.",
            benefits: ["International Opportunities", "Premium Healthcare", "Retirement Plans", "Training Programs"]
        },
        contact: {
            email: "recruitment@globalent.com",
            phone: "+91-7654321098",
            address: {
                street: "Corporate Tower, Financial District",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001",
                country: "India"
            }
        },
        website: "https://globalenterprises.com"
    }
];

const users = [
    // Recruiters
    {
        email: "recruiter1@techcorp.com",
        password: "password123",
        role: "recruiter",
        name: "Sarah Johnson",
        phone: "+91-9876543210",
        location: "Gurgaon, Haryana",
        profileCompleted: true
    },
    {
        email: "recruiter2@innovatelabs.com",
        password: "password123",
        role: "recruiter",
        name: "Raj Patel",
        phone: "+91-8765432109",
        location: "Bangalore, Karnataka",
        profileCompleted: true
    },
    {
        email: "recruiter3@globalent.com",
        password: "password123",
        role: "recruiter",
        name: "Priya Sharma",
        phone: "+91-7654321098",
        location: "Mumbai, Maharashtra",
        profileCompleted: true
    },
    // Job Seekers
    {
        email: "john.doe@email.com",
        password: "password123",
        role: "jobseeker",
        name: "John Doe",
        phone: "+91-9876543211",
        location: "Delhi, India",
        profileCompleted: true
    },
    {
        email: "jane.smith@email.com",
        password: "password123",
        role: "jobseeker",
        name: "Jane Smith",
        phone: "+91-8765432110",
        location: "Pune, Maharashtra",
        profileCompleted: true
    },
    {
        email: "alex.kumar@email.com",
        password: "password123",
        role: "jobseeker",
        name: "Alex Kumar",
        phone: "+91-7654321099",
        location: "Chennai, Tamil Nadu",
        profileCompleted: true
    },
    {
        email: "emily.davis@email.com",
        password: "password123",
        role: "jobseeker",
        name: "Emily Davis",
        phone: "+91-6543210988",
        location: "Hyderabad, Telangana",
        profileCompleted: true
    },
    {
        email: "mike.wilson@email.com",
        password: "password123",
        role: "jobseeker",
        name: "Mike Wilson",
        phone: "+91-5432109877",
        location: "Kolkata, West Bengal",
        profileCompleted: false
    },
    // Admin user for testing
    {
        email: "admin@jobconnect.com",
        password: "admin123",
        role: "admin",
        name: "Admin User",
        phone: "+91-9999999999",
        location: "New Delhi, India",
        profileCompleted: true
    }
];

// Job seeker profiles (based on the actual JobSeeker model)
const jobSeekerProfiles = [
    {
        // John Doe - Full Stack Developer
        skills: [
            { name: "JavaScript", level: "advanced" },
            { name: "React", level: "advanced" },
            { name: "Node.js", level: "intermediate" },
            { name: "MongoDB", level: "intermediate" },
            { name: "Python", level: "beginner" }
        ],
        experience: [
            {
                title: "Frontend Developer",
                company: "StartupXYZ",
                startDate: new Date("2022-01-15"),
                endDate: new Date("2024-03-30"),
                current: false,
                description: "Developed responsive web applications using React and JavaScript"
            },
            {
                title: "Junior Developer",
                company: "TechStart",
                startDate: new Date("2020-06-01"),
                endDate: new Date("2021-12-31"),
                current: false,
                description: "Built web applications and learned modern development practices"
            }
        ],
        education: [
            {
                degree: "Bachelor of Computer Science",
                institution: "Delhi University",
                startYear: 2016,
                endYear: 2020,
                score: "8.5 GPA"
            }
        ],
        jobPreferences: {
            titles: ["Full Stack Developer", "Frontend Developer", "React Developer"],
            jobTypes: ["full-time", "contract"],
            workModes: ["remote", "hybrid"],
            locations: ["Delhi", "Gurgaon", "Remote"],
            salaryRange: { min: 800000, max: 1200000 }
        }
    },
    {
        // Jane Smith - Data Scientist
        skills: [
            { name: "Python", level: "expert" },
            { name: "Machine Learning", level: "advanced" },
            { name: "TensorFlow", level: "advanced" },
            { name: "SQL", level: "advanced" }
        ],
        experience: [
            {
                title: "Data Scientist",
                company: "DataCorp",
                startDate: new Date("2021-03-01"),
                endDate: null,
                current: true,
                description: "Building ML models for predictive analytics and business intelligence"
            },
            {
                title: "Data Analyst",
                company: "Analytics Pro",
                startDate: new Date("2019-07-01"),
                endDate: new Date("2021-02-28"),
                current: false,
                description: "Analyzed large datasets and created data visualizations"
            }
        ],
        education: [
            {
                degree: "Master of Data Science",
                institution: "IIT Bombay",
                startYear: 2017,
                endYear: 2019,
                score: "9.2 GPA"
            },
            {
                degree: "Bachelor of Mathematics",
                institution: "University of Pune",
                startYear: 2014,
                endYear: 2017,
                score: "8.8 GPA"
            }
        ],
        jobPreferences: {
            titles: ["Data Scientist", "ML Engineer", "AI Researcher"],
            jobTypes: ["full-time"],
            workModes: ["remote", "hybrid"],
            locations: ["Pune", "Mumbai", "Bangalore", "Remote"],
            salaryRange: { min: 1500000, max: 2500000 }
        }
    },
    {
        // Alex Kumar - DevOps Engineer
        skills: [
            { name: "AWS", level: "advanced" },
            { name: "Docker", level: "advanced" },
            { name: "Kubernetes", level: "intermediate" },
            { name: "Jenkins", level: "intermediate" },
            { name: "Terraform", level: "intermediate" }
        ],
        experience: [
            {
                title: "DevOps Engineer",
                company: "CloudTech",
                startDate: new Date("2020-09-01"),
                endDate: null,
                current: true,
                description: "Managing cloud infrastructure and CI/CD pipelines"
            }
        ],
        education: [
            {
                degree: "Bachelor of Information Technology",
                institution: "Anna University",
                startYear: 2016,
                endYear: 2020,
                score: "8.0 GPA"
            }
        ],
        jobPreferences: {
            titles: ["DevOps Engineer", "Cloud Engineer", "SRE"],
            jobTypes: ["full-time", "contract"],
            workModes: ["remote", "on-site"],
            locations: ["Chennai", "Bangalore", "Remote"],
            salaryRange: { min: 1000000, max: 1800000 }
        }
    },
    {
        // Emily Davis - UI/UX Designer
        skills: [
            { name: "Figma", level: "expert" },
            { name: "Adobe XD", level: "advanced" },
            { name: "User Research", level: "advanced" },
            { name: "Prototyping", level: "advanced" },
            { name: "HTML/CSS", level: "intermediate" }
        ],
        experience: [
            {
                title: "UI/UX Designer",
                company: "DesignStudio",
                startDate: new Date("2021-01-15"),
                endDate: null,
                current: true,
                description: "Designing user interfaces and conducting user experience research"
            }
        ],
        education: [
            {
                degree: "Bachelor of Design",
                institution: "NIFT Hyderabad",
                startYear: 2017,
                endYear: 2021,
                score: "8.5 GPA"
            }
        ],
        jobPreferences: {
            titles: ["UI/UX Designer", "Product Designer", "Visual Designer"],
            jobTypes: ["full-time", "part-time"],
            workModes: ["remote", "hybrid"],
            locations: ["Hyderabad", "Bangalore", "Remote"],
            salaryRange: { min: 600000, max: 1200000 }
        }
    },
    {
        // Mike Wilson - Fresh Graduate
        skills: [
            { name: "Java", level: "intermediate" },
            { name: "Spring Boot", level: "beginner" },
            { name: "MySQL", level: "intermediate" },
            { name: "Git", level: "intermediate" }
        ],
        experience: [
            {
                title: "Software Development Intern",
                company: "TechStart",
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-06-30"),
                current: false,
                description: "Worked on Java backend development projects"
            }
        ],
        education: [
            {
                degree: "Bachelor of Computer Applications",
                institution: "Calcutta University",
                startYear: 2021,
                endYear: 2024,
                score: "7.8 GPA"
            }
        ],
        jobPreferences: {
            titles: ["Java Developer", "Backend Developer", "Software Engineer"],
            jobTypes: ["full-time", "internship"],
            workModes: ["on-site", "hybrid"],
            locations: ["Kolkata", "Bangalore"],
            salaryRange: { min: 400000, max: 800000 }
        }
    }
];

// Sample job posts
const jobPosts = [
    {
        title: "Senior Full Stack Developer",
        description: "We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.",
        requirements: {
            experience: { min: 3, max: 7 },
            education: ["Bachelor's degree in Computer Science or related field"],
            skills: {
                required: ["JavaScript", "React", "Node.js", "MongoDB"],
                preferred: ["TypeScript", "AWS", "Docker"]
            }
        },
        location: "Gurgaon, Haryana",
        jobType: "full-time",
        workMode: "hybrid",
        salary: { min: 1200000, max: 2000000 },
        status: "active"
    },
    {
        title: "Data Science Manager",
        description: "Lead our data science team to drive insights and build machine learning models that impact business decisions.",
        requirements: {
            experience: { min: 5, max: 10 },
            education: ["Master's degree in Data Science, Statistics, or related field"],
            skills: {
                required: ["Python", "Machine Learning", "SQL", "TensorFlow"],
                preferred: ["MLOps", "Spark", "Kubernetes"]
            }
        },
        location: "Bangalore, Karnataka",
        jobType: "full-time",
        workMode: "remote",
        salary: { min: 2500000, max: 4000000 },
        status: "active"
    },
    {
        title: "Frontend React Developer",
        description: "Join our frontend team to build beautiful and responsive user interfaces using React and modern web technologies.",
        requirements: {
            experience: { min: 2, max: 5 },
            education: ["Bachelor's degree preferred"],
            skills: {
                required: ["React", "JavaScript", "CSS", "HTML"],
                preferred: ["TypeScript", "Next.js", "Tailwind CSS"]
            }
        },
        location: "Remote",
        jobType: "full-time",
        workMode: "remote",
        salary: { min: 800000, max: 1500000 },
        status: "active"
    },
    {
        title: "DevOps Engineer",
        description: "Manage and scale our cloud infrastructure while implementing best practices for CI/CD and automation.",
        requirements: {
            experience: { min: 2, max: 6 },
            education: ["Bachelor's degree in Engineering or related field"],
            skills: {
                required: ["AWS", "Docker", "Kubernetes", "CI/CD"],
                preferred: ["Terraform", "Monitoring", "Security"]
            }
        },
        location: "Mumbai, Maharashtra",
        jobType: "full-time",
        workMode: "on-site",
        salary: { min: 1500000, max: 2500000 },
        status: "active"
    },
    {
        title: "UI/UX Designer",
        description: "Create intuitive and engaging user experiences for our digital products. Work closely with product and engineering teams.",
        requirements: {
            experience: { min: 1, max: 4 },
            education: ["Bachelor's degree in Design or related field"],
            skills: {
                required: ["Figma", "User Research", "Prototyping", "Design Systems"],
                preferred: ["Adobe Creative Suite", "Animation", "Frontend basics"]
            }
        },
        location: "Hyderabad, Telangana",
        jobType: "full-time",
        workMode: "hybrid",
        salary: { min: 600000, max: 1200000 },
        status: "active"
    },
    {
        title: "Junior Java Developer",
        description: "Great opportunity for fresh graduates to start their career in Java development. You'll work on enterprise applications and learn from senior developers.",
        requirements: {
            experience: { min: 0, max: 2 },
            education: ["Bachelor's degree in Computer Science or related field"],
            skills: {
                required: ["Java", "Spring Boot", "MySQL", "Git"],
                preferred: ["REST APIs", "Microservices", "Maven"]
            }
        },
        location: "Kolkata, West Bengal",
        jobType: "full-time",
        workMode: "on-site",
        salary: { min: 400000, max: 800000 },
        status: "active"
    },
    {
        title: "Senior Python Developer",
        description: "Looking for a senior Python developer to work on backend services and API development. Django/Flask experience preferred.",
        requirements: {
            experience: { min: 4, max: 8 },
            education: ["Bachelor's degree in Computer Science"],
            skills: {
                required: ["Python", "Django", "PostgreSQL", "REST APIs"],
                preferred: ["Flask", "Redis", "Celery", "AWS"]
            }
        },
        location: "Pune, Maharashtra",
        jobType: "full-time",
        workMode: "hybrid",
        salary: { min: 1500000, max: 2200000 },
        status: "active"
    }
];

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to database...');
        
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set');
        }
          await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');

        // Clear existing data
        console.log('🧹 Clearing existing data...');        await Promise.all([
            User.deleteMany({}),
            JobSeeker.deleteMany({}),
            Organization.deleteMany({}),
            JobPost.deleteMany({}),
            Resume.deleteMany({}),
            Application.deleteMany({}),
            Chat.deleteMany({}),
            Message.deleteMany({})
        ]);
        console.log('✅ Cleared existing data');

        // Create organizations
        console.log('🏢 Creating organizations...');
        const createdOrganizations = await Organization.insertMany(organizations);
        console.log(`✅ Created ${createdOrganizations.length} organizations`);

        // Hash passwords and create users
        console.log('👥 Creating users...');
        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 12)
            }))
        );
        const createdUsers = await User.insertMany(hashedUsers);
        console.log(`✅ Created ${createdUsers.length} users`);

        // Separate users by role
        const recruiters = createdUsers.filter(user => user.role === 'recruiter');
        const jobseekers = createdUsers.filter(user => user.role === 'jobseeker');
        const admin = createdUsers.find(user => user.role === 'admin');

        // Update organizations with recruiters
        console.log('🔗 Linking recruiters to organizations...');
        for (let i = 0; i < recruiters.length && i < createdOrganizations.length; i++) {
            await Organization.findByIdAndUpdate(
                createdOrganizations[i]._id,
                { $push: { recruiters: recruiters[i]._id } }
            );
        }

        // Create job seeker profiles
        console.log('📝 Creating job seeker profiles...');
        const jobSeekerProfilesWithUsers = jobSeekerProfiles.map((profile, index) => ({
            ...profile,
            user: jobseekers[index]._id
        }));
        const createdJobSeekerProfiles = await JobSeeker.insertMany(jobSeekerProfilesWithUsers);
        console.log(`✅ Created ${createdJobSeekerProfiles.length} job seeker profiles`);

        // Create job posts
        console.log('💼 Creating job posts...');
        const jobPostsWithData = jobPosts.map((job, index) => ({
            ...job,
            recruiter: recruiters[index % recruiters.length]._id,
            organization: createdOrganizations[index % createdOrganizations.length]._id
        }));
        const createdJobPosts = await JobPost.insertMany(jobPostsWithData);
        console.log(`✅ Created ${createdJobPosts.length} job posts`);

        // Create some sample applications
        console.log('📋 Creating sample applications...');
        const applications = [];
        
        // Each jobseeker applies to 2-3 jobs
        for (let i = 0; i < jobseekers.length; i++) {
            const numApplications = Math.floor(Math.random() * 3) + 1; // 1-3 applications
            const jobsToApply = createdJobPosts
                .sort(() => 0.5 - Math.random())
                .slice(0, numApplications);

            for (const job of jobsToApply) {
                applications.push({
                    job: job._id,
                    applicant: jobseekers[i]._id,
                    atsScore: Math.floor(Math.random() * 40) + 60, // 60-100 score
                    status: ['applied', 'reviewed', 'shortlisted'][Math.floor(Math.random() * 3)],
                    appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
                });
            }
        }        const createdApplications = await Application.insertMany(applications);
        console.log(`✅ Created ${createdApplications.length} applications`);

        // Create sample chats and messages
        console.log('💬 Creating sample chats and messages...');
        const chats = [];
        const messages = [];

        // Create chats between recruiters and job seekers (based on applications)
        const chatPairs = new Set();
        
        // Create chats for applications
        for (const application of createdApplications) {
            const jobPost = createdJobPosts.find(job => job._id.equals(application.job));
            if (jobPost) {
                const recruiterId = jobPost.recruiter;
                const jobseekerId = application.applicant;
                const pairKey = `${recruiterId}_${jobseekerId}`;
                
                if (!chatPairs.has(pairKey)) {
                    chatPairs.add(pairKey);
                    chats.push({
                        participants: [
                            { user: recruiterId, joinedAt: new Date(), lastSeen: new Date() },
                            { user: jobseekerId, joinedAt: new Date(), lastSeen: new Date() }
                        ],
                        isActive: true
                    });
                }
            }
        }

        // Create some additional random chats between users
        for (let i = 0; i < 3; i++) {
            const recruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
            const jobseeker = jobseekers[Math.floor(Math.random() * jobseekers.length)];
            const pairKey = `${recruiter._id}_${jobseeker._id}`;
            
            if (!chatPairs.has(pairKey)) {
                chatPairs.add(pairKey);
                chats.push({
                    participants: [
                        { user: recruiter._id, joinedAt: new Date(), lastSeen: new Date() },
                        { user: jobseeker._id, joinedAt: new Date(), lastSeen: new Date() }
                    ],
                    isActive: true
                });
            }
        }

        const createdChats = await Chat.insertMany(chats);
        console.log(`✅ Created ${createdChats.length} chats`);

        // Create sample messages for each chat
        const sampleMessages = [
            "Hi! I saw your application for the Full Stack Developer position. I'd like to discuss your experience.",
            "Thank you for reaching out! I'm very interested in this opportunity.",
            "Could you tell me more about your experience with React and Node.js?",
            "I have been working with React for over 3 years and Node.js for 2 years. I've built several full-stack applications.",
            "That's great! When would be a good time for a technical interview?",
            "I'm available this week. Tuesday or Wednesday afternoon works best for me.",
            "Perfect! Let's schedule it for Wednesday at 2 PM. I'll send you the meeting details.",
            "Sounds good! Looking forward to it.",
            "Great! I'll prepare some technical questions about JavaScript and React.",
            "Thank you! I'll review my projects and be ready to discuss them.",
            "Do you have any questions about our company or the role?",
            "Yes, could you tell me more about the team structure and development practices?",
            "We follow Agile methodology with 2-week sprints. The team consists of 5 developers.",
            "That sounds like a great environment. I'm excited about the possibility of joining your team.",
            "We're looking forward to our interview. Have a great day!",
            "Thank you! You too!"
        ];

        for (const chat of createdChats) {
            const numMessages = Math.floor(Math.random() * 8) + 3; // 3-10 messages per chat
            const chatMessages = [];
            
            for (let i = 0; i < numMessages; i++) {
                const sender = chat.participants[i % 2].user; // Alternate between participants
                const messageContent = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
                const messageTime = new Date(Date.now() - (numMessages - i) * 60 * 60 * 1000); // Spread over hours
                
                const message = {
                    chat: chat._id,
                    sender: sender,
                    content: messageContent,
                    messageType: 'text',
                    readBy: [{ user: sender, readAt: messageTime }],
                    timestamp: messageTime
                };

                // Some messages are read by both participants
                if (Math.random() > 0.3) {
                    const otherParticipant = chat.participants[(i + 1) % 2].user;
                    message.readBy.push({ 
                        user: otherParticipant, 
                        readAt: new Date(messageTime.getTime() + Math.random() * 30 * 60 * 1000) // Read within 30 minutes
                    });
                }

                chatMessages.push(message);
            }
            
            messages.push(...chatMessages);
        }

        const createdMessages = await Message.insertMany(messages);
        console.log(`✅ Created ${createdMessages.length} messages`);

        // Update chats with last message
        for (const chat of createdChats) {
            const chatMessages = createdMessages.filter(msg => msg.chat.equals(chat._id));
            if (chatMessages.length > 0) {
                const lastMessage = chatMessages[chatMessages.length - 1];
                await Chat.findByIdAndUpdate(chat._id, { lastMessage: lastMessage._id });
            }
        }

        console.log('\n🎉 Database seeded successfully!');        console.log('\n📊 Summary:');
        console.log(`  👥 Users: ${createdUsers.length} (${recruiters.length} recruiters, ${jobseekers.length} jobseekers, 1 admin)`);
        console.log(`  🏢 Organizations: ${createdOrganizations.length}`);
        console.log(`  💼 Job Posts: ${createdJobPosts.length}`);
        console.log(`  📋 Applications: ${createdApplications.length}`);
        console.log(`  📝 Job Seeker Profiles: ${createdJobSeekerProfiles.length}`);
        console.log(`  💬 Chats: ${createdChats.length}`);
        console.log(`  📩 Messages: ${createdMessages.length}`);

        console.log('\n🔑 Test Credentials for Postman:');
        console.log('\n  🏢 RECRUITERS:');
        recruiters.forEach((recruiter, index) => {
            console.log(`    ${recruiter.email} : password123`);
        });
        
        console.log('\n  👤 JOB SEEKERS:');
        jobseekers.forEach((jobseeker, index) => {
            console.log(`    ${jobseeker.email} : password123`);
        });

        console.log('\n  🔧 ADMIN:');
        console.log(`    ${admin.email} : admin123`);        console.log('\n📝 Sample IDs for Testing:');
        console.log(`  Organization IDs: ${createdOrganizations.map(org => org._id).join(', ')}`);
        console.log(`  Job Post IDs: ${createdJobPosts.slice(0, 3).map(job => job._id).join(', ')}`);
        console.log(`  User IDs: ${jobseekers.slice(0, 2).map(user => user._id).join(', ')}`);
        console.log(`  Chat IDs: ${createdChats.slice(0, 3).map(chat => chat._id).join(', ')}`);process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        // Ensure connection is closed
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };