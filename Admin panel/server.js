const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
  secret: 'rohaan-dynamic-space-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Static Assets
app.use('/uploads', express.static(uploadDir));
// Serves CSS/JS/images inside 'admin' folder when requested at /admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));
// Serves CSS/JS/images inside 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function authRequired(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Page Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auth Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.isAdmin) });
});

// Full Portfolio Data Consumer
app.get('/api/portfolio', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  const skills = db.prepare('SELECT * FROM skills ORDER BY proficiency DESC').all();
  const experiences = db.prepare('SELECT * FROM experiences ORDER BY id DESC').all();
  const education = db.prepare('SELECT * FROM education ORDER BY id DESC').all();
  const projects = db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
  const certificates = db.prepare('SELECT * FROM certificates ORDER BY id DESC').all();
  res.json({ profile, skills, experiences, education, projects, certificates });
});

// 1. Profile, CV & Custom Action Buttons
app.put('/api/profile', authRequired, (req, res) => {
  const { name, title, bio, github, linkedin, cv_url, author_btn_text, author_btn_url } = req.body;
  db.prepare(`
    UPDATE profile SET 
      name = ?, title = ?, bio = ?, github = ?, linkedin = ?, cv_url = ?, author_btn_text = ?, author_btn_url = ? 
    WHERE id = 1
  `).run(name, title, bio, github, linkedin, cv_url, author_btn_text, author_btn_url);
  res.json({ success: true });
});

// 2. Skills
app.post('/api/skills', authRequired, (req, res) => {
  const { name, proficiency } = req.body;
  const result = db.prepare('INSERT INTO skills (name, proficiency) VALUES (?, ?)').run(name, proficiency);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/skills/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 3. Work Experience & Internships
app.post('/api/experiences', authRequired, (req, res) => {
  const { role, company, period, status, points } = req.body;
  const result = db.prepare(`
    INSERT INTO experiences (role, company, period, status, points) VALUES (?, ?, ?, ?, ?)
  `).run(role, company, period, status, points);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/experiences/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 4. Education & Academic Timeline
app.post('/api/education', authRequired, (req, res) => {
  const { institution, degree, period, disciplines } = req.body;
  const result = db.prepare(`
    INSERT INTO education (institution, degree, period, disciplines) VALUES (?, ?, ?, ?)
  `).run(institution, degree, period, disciplines);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/education/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM education WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 5. Projects
app.post('/api/projects', authRequired, upload.single('image'), (req, res) => {
  const { title, description, github_url, live_url } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : '';
  const result = db.prepare(`
    INSERT INTO projects (title, description, github_url, live_url, image_url) VALUES (?, ?, ?, ?, ?)
  `).run(title, description, github_url, live_url, image_url);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/projects/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 6. Certificates
app.post('/api/certificates', authRequired, upload.single('certificateFile'), (req, res) => {
  const { title, issuer, issue_date, direct_url } = req.body;
  let pdf_url = direct_url || '';
  if (req.file) pdf_url = `/uploads/${req.file.filename}`;
  const result = db.prepare(`
    INSERT INTO certificates (title, issuer, issue_date, pdf_url) VALUES (?, ?, ?, ?)
  `).run(title, issuer, issue_date, pdf_url);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/certificates/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM certificates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

const PORT = 3000;

// Add these routes to server.js before app.listen()

// Get full dynamic portfolio data
app.get('/api/portfolio', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  const buttons = db.prepare('SELECT * FROM nav_buttons ORDER BY id ASC').all();
  const skills = db.prepare('SELECT * FROM skills ORDER BY proficiency DESC').all();
  const experiences = db.prepare('SELECT * FROM experiences ORDER BY id DESC').all();
  const education = db.prepare('SELECT * FROM education ORDER BY id ASC').all();
  const projects = db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
  const certificates = db.prepare('SELECT * FROM certificates ORDER BY id DESC').all();
  res.json({ profile, buttons, skills, experiences, education, projects, certificates });
});

// Update Profile, CV & Contact
app.put('/api/profile', authRequired, (req, res) => {
  const { name, title, bio, location, email, phone, github, linkedin, cv_url } = req.body;
  db.prepare(`
    UPDATE profile SET 
      name = ?, title = ?, bio = ?, location = ?, email = ?, phone = ?, github = ?, linkedin = ?, cv_url = ? 
    WHERE id = 1
  `).run(name, title, bio, location, email, phone, github, linkedin, cv_url);
  res.json({ success: true });
});

// Custom Buttons & Navigation Manager (Create / Delete)
app.post('/api/buttons', authRequired, (req, res) => {
  const { label, url, icon, is_external, position } = req.body;
  const result = db.prepare('INSERT INTO nav_buttons (label, url, icon, is_external, position) VALUES (?, ?, ?, ?, ?)').run(
    label, url, icon || '🔗', is_external ? 1 : 0, position || 'header'
  );
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/buttons/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM nav_buttons WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`Open Portfolio:   http://localhost:${PORT}/`);
});