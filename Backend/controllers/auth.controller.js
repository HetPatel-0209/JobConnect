const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const test_users = [
    {username: 'tester', password: 'test1234', role: 'admin', name: 'tester'}
];

const testUsers = async ()=> {
    try {
        const existingUsers = await User.countDocuments();

        if (existingUsers === 0) {
            const hashedUsers = await Promise.all(
                test_users.map(async (user) => ({
                    ...user,
                    password: await bcrypt.hash(user.password, 10)
                }))
            );
            await User.insertMany(hashedUsers);
            console.log('Initial users created successfully');
        }
    } catch (error) {
        console.error('Error initializing users:', error);
    }
}
testUsers();

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { login };
