const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./config/database');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000" }
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('MySQL connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('MySQL connection failed:', err);
    console.log('Make sure MySQL is running and database "gigconnect" exists');
  });

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Create demo user
app.post('/api/demo-user', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('demo123', 12);
    await db.execute(`
      INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name)
      VALUES ('demo@gigconnect.com', ?, 'both', 'Demo', 'User')
    `, [hashedPassword]);
    res.json({ message: 'Demo user created' });
  } catch (error) {
    res.json({ message: 'Demo user already exists or created' });
  }
});

// Root route serves the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, location } = req.body;
    
    // Check if user exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const [result] = await db.execute(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [email, hashedPassword, role, firstName, lastName, location?.lat || null, location?.lng || null]);

    const user = { id: result.insertId, email, role, firstName, lastName };
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [result] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '24h' });
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        firstName: user.first_name, 
        lastName: user.last_name 
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gig routes
app.get('/api/gigs', async (req, res) => {
  try {
    const query = `
      SELECT g.*, u.first_name, u.last_name
      FROM gigs g
      JOIN users u ON g.client_id = u.id
      WHERE g.status = 'open'
      ORDER BY g.created_at DESC
      LIMIT 50
    `;
    
    const [result] = await db.execute(query);
    res.json(result);
  } catch (error) {
    console.error('Gigs query error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gigs', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, budgetMin, budgetMax, budgetType, location, isRemote, deadline, requiredSkills } = req.body;
    
    const [result] = await db.execute(`
      INSERT INTO gigs (client_id, title, description, category, budget_min, budget_max, budget_type, latitude, longitude, is_remote, deadline, required_skills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, title, description, category, budgetMin, budgetMax, budgetType, location?.lat || null, location?.lng || null, isRemote, deadline, JSON.stringify(requiredSkills || [])]);

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Freelancer routes
app.get('/api/freelancers', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.profile_image,
             COALESCE(fp.title, 'Freelancer') as title, 
             COALESCE(fp.hourly_rate, 0) as hourly_rate, 
             COALESCE(fp.bio, 'No bio available') as bio, 
             COALESCE(fp.experience_years, 0) as experience_years,
             0 as avg_rating, 0 as review_count
      FROM users u
      LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
      WHERE u.is_active = true AND u.role IN ('freelancer', 'both')
      ORDER BY u.created_at DESC
      LIMIT 50
    `;
    
    const [result] = await db.execute(query);
    res.json(result);
  } catch (error) {
    console.error('Freelancers query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gig applications
app.post('/api/gig-applications', authenticateToken, async (req, res) => {
  try {
    const { gigId, coverLetter, proposedRate } = req.body;
    
    // Check if already applied
    const [existing] = await db.execute(
      'SELECT id FROM gig_applications WHERE gig_id = ? AND freelancer_id = ?',
      [gigId, req.user.id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already applied to this gig' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO gig_applications (gig_id, freelancer_id, cover_letter, proposed_rate)
      VALUES (?, ?, ?, ?)
    `, [gigId, req.user.id, coverLetter, proposedRate]);
    
    res.status(201).json({ id: result.insertId, message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io for real-time messaging
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.id;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  socket.join(`user_${socket.userId}`);

  socket.on('send_message', async (data) => {
    try {
      const { recipientId, content } = data;
      
      // Save message to database
      const [result] = await db.execute(`
        INSERT INTO messages (sender_id, receiver_id, content)
        VALUES (?, ?, ?)
      `, [socket.userId, recipientId, content]);

      const message = { id: result.insertId, sender_id: socket.userId, receiver_id: recipientId, content, created_at: new Date() };
      
      // Send to recipient
      socket.to(`user_${recipientId}`).emit('new_message', message);
      socket.emit('message_sent', message);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server run