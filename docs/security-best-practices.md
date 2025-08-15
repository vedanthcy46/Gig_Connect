# GigConnect Security Best Practices

## 1. Authentication & Authorization

### JWT Implementation
```javascript
// Secure JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET, // 256-bit random key
  expiresIn: '15m', // Short-lived access tokens
  refreshTokenExpiry: '7d',
  algorithm: 'HS256'
};

// Role-based middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Password Security
- **Bcrypt** with salt rounds ≥ 12
- Password complexity requirements
- Account lockout after failed attempts
- Password reset with time-limited tokens

## 2. Data Protection

### Input Validation & Sanitization
```javascript
// Using Joi for validation
const gigSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).max(5000).required(),
  budget: Joi.number().positive().max(1000000),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180)
  })
});

// SQL injection prevention with parameterized queries
const getGigsByLocation = async (lat, lng, radius) => {
  return await db.query(`
    SELECT * FROM gigs 
    WHERE ST_DWithin(location, ST_Point($1, $2)::geography, $3)
  `, [lng, lat, radius]);
};
```

### XSS Prevention
- Content Security Policy (CSP) headers
- Input sanitization with DOMPurify
- Output encoding for user-generated content
- Secure cookie configuration

## 3. API Security

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit login attempts
  skipSuccessfulRequests: true
});
```

### CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 4. File Upload Security

### Secure File Handling
```javascript
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});
```

## 5. Database Security

### Connection Security
```javascript
// Encrypted database connections
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('ca-certificate.crt').toString()
  }
};
```

### Data Encryption
- Encrypt sensitive data at rest (PII, payment info)
- Use AES-256 encryption for stored files
- Hash sensitive fields (passwords, tokens)
- Implement field-level encryption for PCI compliance

## 6. Payment Security

### PCI DSS Compliance
```javascript
// Never store card details - use tokenization
const processPayment = async (paymentData) => {
  const razorpayOrder = await razorpay.orders.create({
    amount: paymentData.amount * 100, // paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  });
  
  // Store only payment reference, never card data
  await db.query(`
    INSERT INTO transactions (contract_id, amount, gateway_order_id, status)
    VALUES ($1, $2, $3, 'pending')
  `, [contractId, amount, razorpayOrder.id]);
};
```

### Webhook Security
```javascript
// Verify webhook signatures
const verifyWebhook = (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
    
  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  next();
};
```

## 7. Communication Security

### Real-time Messaging
```javascript
// Socket.io authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.id;
    next();
  });
});

// Message encryption for sensitive data
const encryptMessage = (message) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.MESSAGE_KEY);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

## 8. Infrastructure Security

### Environment Configuration
```bash
# .env.example
NODE_ENV=production
JWT_SECRET=your-256-bit-secret
DB_PASSWORD=strong-database-password
RAZORPAY_KEY_SECRET=your-razorpay-secret
ENCRYPTION_KEY=your-encryption-key
ALLOWED_ORIGINS=https://yourdomain.com
```

### HTTPS & Security Headers
```javascript
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 9. Monitoring & Logging

### Security Logging
```javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log security events
const logSecurityEvent = (event, userId, details) => {
  securityLogger.info({
    event,
    userId,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    details
  });
};
```

### Intrusion Detection
- Monitor failed login attempts
- Track unusual API usage patterns
- Alert on suspicious file uploads
- Monitor database query patterns

## 10. Privacy & Compliance

### GDPR Compliance
- Data minimization principles
- User consent management
- Right to erasure implementation
- Data portability features
- Privacy by design architecture

### Data Retention Policies
```javascript
// Automated data cleanup
const cleanupExpiredData = async () => {
  // Delete old messages after 2 years
  await db.query(`
    DELETE FROM messages 
    WHERE created_at < NOW() - INTERVAL '2 years'
  `);
  
  // Anonymize completed contracts after 7 years
  await db.query(`
    UPDATE contracts 
    SET client_id = NULL, freelancer_id = NULL 
    WHERE created_at < NOW() - INTERVAL '7 years'
  `);
};
```

## 11. Incident Response Plan

### Security Incident Workflow
1. **Detection** - Automated monitoring alerts
2. **Assessment** - Determine severity and scope
3. **Containment** - Isolate affected systems
4. **Investigation** - Analyze attack vectors
5. **Recovery** - Restore services securely
6. **Lessons Learned** - Update security measures

### Emergency Contacts
- Security team lead
- Infrastructure team
- Legal/compliance team
- Payment processor contacts