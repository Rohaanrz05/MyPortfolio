const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const db = new Database(path.join(__dirname, 'portfolio.db'));

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT,
    title TEXT,
    bio TEXT,
    location TEXT,
    email TEXT,
    phone TEXT,
    github TEXT,
    linkedin TEXT,
    cv_url TEXT
  );

  CREATE TABLE IF NOT EXISTS nav_buttons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    url TEXT,
    icon TEXT,
    is_external INTEGER DEFAULT 1,
    position TEXT DEFAULT 'header'
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT DEFAULT 'AI & Machine Learning',
    proficiency INTEGER
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    company TEXT,
    period TEXT,
    status TEXT,
    points TEXT,
    cert_url TEXT,
    rec_url TEXT,
    report_url TEXT
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution TEXT,
    degree TEXT,
    period TEXT,
    disciplines TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    tags TEXT
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    issuer TEXT,
    issue_date TEXT,
    pdf_url TEXT,
    badge_icon TEXT DEFAULT '📜'
  );
`);

// Create Default Admin (admin / admin123)
const adminExists = db.prepare('SELECT id FROM admin WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', hash);
}

// Seed Profile Data
const profileExists = db.prepare('SELECT id FROM profile WHERE id = 1').get();
if (!profileExists) {
  db.prepare(`
    INSERT INTO profile (id, name, title, bio, location, email, phone, github, linkedin, cv_url)
    VALUES (
      1,
      'M. Rohaan Zahid',
      'AI Programmer & Developer',
      'Artificial Intelligence undergraduate at Sir Syed CASE Institute of Technology with a strong focus on AI, software development, and emerging technologies. Hands-on experience in C++, Python, database management, web development, and machine learning pipelines.',
      'Street 08, House 420, FMC A Block, B-17 MultiGarden, Islamabad',
      'rohaanzahid.04@gmail.com',
      '03338705793',
      'https://github.com/Rohaanrz05',
      'https://www.linkedin.com/in/rohaan-zahid-510850400/',
      'https://drive.google.com/file/d/1dYY_z03Ax_fhmrKHXxkyNUVDHeym-0Xu/view?usp=sharing'
    )
  `).run();
}

// Seed Custom Action Buttons
const buttonsCount = db.prepare('SELECT count(*) as count FROM nav_buttons').get().count;
if (buttonsCount === 0) {
  db.prepare('INSERT INTO nav_buttons (label, url, icon, is_external, position) VALUES (?, ?, ?, ?, ?)').run(
    'Author Portal',
    'https://books.rohaanzahid.space',
    '📚',
    1,
    'header'
  );
}

// Seed Experiences
const expCount = db.prepare('SELECT count(*) as count FROM experiences').get().count;
if (expCount === 0) {
  const insertExp = db.prepare(`
    INSERT INTO experiences (role, company, period, status, points, cert_url, rec_url, report_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExp.run(
    'Machine Learning Intern',
    'FlyRank.AI',
    'July 2026 - August 2026',
    'Completed',
    'Assisted in developing and testing Machine Learning models for real-world applications.\nPerformed data collection, cleaning, preprocessing, and feature engineering for model training.\nWorked with Python libraries such as NumPy, Pandas, Scikit-learn, and Matplotlib.\nAnalyzed datasets and generated insights to support AI-driven solutions.\nParticipated in model evaluation, optimization, and performance improvement.\nCollaborated with team members using Git/GitHub for project management and version control.\nGained practical experience in Machine Learning workflows, data analysis, and AI development.',
    'https://drive.google.com/file/d/1tGuvZmLH7SaJ2421W5oRx3O4r2wj9es2/view?usp=sharing',
    'https://drive.google.com/file/d/18-0C70YonQnxcIn3tWfp8eONE0WamhsI/view?usp=sharing',
    'https://drive.google.com/file/d/1T_F8eq5s5sFiE0eL1b_3lEK85ZYuvH-s/view?usp=sharing'
  );

  insertExp.run(
    'Artificial Intelligence Intern',
    'Decode Labs (Govt. Registered Enterprise)',
    'June 2026 - August 2026',
    'Completed',
    'Developed AI and Machine Learning projects using Python and modern AI tools.\nBuilt and tested intelligent applications, including chatbot and automation solutions.\nPerformed data preprocessing, analysis, and model evaluation to improve project performance.\nApplied programming concepts to solve real-world problems and optimize workflows.\nStrengthened practical skills in Artificial Intelligence, software development, and problem-solving.',
    'https://drive.google.com/file/d/1g-ckWz8VBy9OtYSCeb7KsPu8k64CAx1M/view?usp=sharing',
    'https://drive.google.com/file/d/1-bHXXejIb8t_GXyeOm2qH40ZjE9LIo5g/view?usp=sharing',
    ''
  );

  insertExp.run(
    'Python Programming Intern',
    'CodeAlpha',
    'May 2026 - June 2026',
    'Completed',
    'Developed Python-based applications and automation solutions.\nApplied OOP concepts and software development best practices.\nTested, debugged, and optimized code for improved performance.\nCollaborated on real-world projects to enhance programming and problem-solving skills.',
    '',
    '',
    ''
  );
}

// Seed Skills
const skillsCount = db.prepare('SELECT count(*) as count FROM skills').get().count;
if (skillsCount === 0) {
  const insertSkill = db.prepare('INSERT INTO skills (name, category, proficiency) VALUES (?, ?, ?)');
  insertSkill.run('Supervised & Predictive ML', 'AI & Machine Learning', 90);
  insertSkill.run('Data Cleaning & Feature Engineering', 'AI & Machine Learning', 88);
  insertSkill.run('Model Evaluation & Optimization', 'AI & Machine Learning', 82);
  insertSkill.run('Data Visualization (Matplotlib)', 'AI & Machine Learning', 85);
  insertSkill.run('Python Development', 'Languages & Systems', 92);
  insertSkill.run('C++ Core & Data Structures', 'Languages & Systems', 85);
  insertSkill.run('C# Programming', 'Languages & Systems', 78);
  insertSkill.run('Relational DB (MySQL, phpMyAdmin)', 'Languages & Systems', 80);
}

// Seed Projects
const projectsCount = db.prepare('SELECT count(*) as count FROM projects').get().count;
if (projectsCount === 0) {
  const insertProj = db.prepare(`
    INSERT INTO projects (title, description, github_url, live_url, image_url, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertProj.run(
    'AI Smart Route Optimization System',
    'Developed an AI-powered route optimization system to determine efficient travel paths using machine learning and data analysis techniques with an interactive Streamlit UI.',
    'https://github.com/Rohaanrz05/Smart-Route-detection-system',
    '',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=60',
    'Python, Streamlit, ML'
  );

  insertProj.run(
    'Airline Reservation Management System',
    'Designed and developed a reservation management system implementing flight booking, cancellation, passenger handling, and automated ticket generation in C++.',
    'https://github.com/Rohaanrz05/airline-reservation-system-',
    '',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60',
    'C++ Core, Databases, File I/O'
  );

  insertProj.run(
    'AI Impact on Society Research',
    'Conducted a comprehensive research study analyzing the influence, ethical considerations, cybersecurity dynamics, and societal implications of AI across industries.',
    'https://github.com/Rohaanrz05/AI-Impact-on-society',
    '',
    '',
    'Data Analysis, Research, Ethics'
  );

  insertProj.run(
    'Hospital Database Management System',
    'Engineered a clinical data management system handling patient records, appointments, doctor allocations, and indexed database queries safely.',
    'https://github.com/Rohaanrz05',
    '',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=60',
    'OOP Logic, MySQL'
  );

  insertProj.run(
    'books.rohaanzahid.space',
    'Official author and publication portal designed and maintained to present historical manuscripts, book landing pages, and interactive reviews.',
    'https://github.com/Rohaanrz05',
    'https://books.rohaanzahid.space',
    '',
    'Live Platform, Web Architecture'
  );

  insertProj.run(
    'JF-17 Fighter Simulation Game',
    'Programmed a 2D arcade shooter simulation game tracking keyboard inputs, bounding checks, and linear object movement paths within C#.',
    'https://github.com/Rohaanrz05/jf-17-shooting-game-',
    '',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
    'C# Core, Game Loop'
  );
}

// Seed Certificates
const certsCount = db.prepare('SELECT count(*) as count FROM certificates').get().count;
if (certsCount === 0) {
  const insertCert = db.prepare(`
    INSERT INTO certificates (title, issuer, issue_date, pdf_url, badge_icon)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertCert.run('FlyRank.AI Certificate', 'FlyRank.AI', 'ML Track Completion', 'https://drive.google.com/file/d/1tGuvZmLH7SaJ2421W5oRx3O4r2wj9es2/view?usp=sharing', '📈');
  insertCert.run('FlyRank Recommendation', 'FlyRank.AI', 'Official Commendation', 'https://drive.google.com/file/d/18-0C70YonQnxcIn3tWfp8eONE0WamhsI/view?usp=sharing', '📑');
  insertCert.run('FlyRank Progress Report', 'FlyRank.AI', 'Performance Assessment', 'https://drive.google.com/file/d/1T_F8eq5s5sFiE0eL1b_3lEK85ZYuvH-s/view?usp=sharing', '📊');
  insertCert.run('Decodes Lab Certificate', 'DECODELABS VIRTUAL INTERNSHIP', 'ID: AIA074381', 'https://drive.google.com/file/d/1g-ckWz8VBy9OtYSCeb7KsPu8k64CAx1M/view?usp=sharing', '🎓');
  insertCert.run('Decode Labs Recommendation', 'DECODE LABS', 'Formal Reference', 'https://drive.google.com/file/d/1-bHXXejIb8t_GXyeOm2qH40ZjE9LIo5g/view?usp=sharing', '📜');
  insertCert.run('Claude 101 Certificate', 'ANTHROPIC', 'Claude 101 Certified', 'https://drive.google.com/file/d/1IN2r3Rz3knx1o3iXrg3eKCQCnJabMFd8/view?usp=sharing', '🤖');
}

// Seed Education
const eduCount = db.prepare('SELECT count(*) as count FROM education').get().count;
if (eduCount === 0) {
  const insertEdu = db.prepare(`
    INSERT INTO education (institution, degree, period, disciplines)
    VALUES (?, ?, ?, ?)
  `);

  insertEdu.run(
    'Sir Syed CASE Institute of Technology, Islamabad',
    'Bachelor of Science in Artificial Intelligence (BS-AI) | Expected 2028',
    '2024 - Present | 5th Semester',
    'Artificial Intelligence, Machine Learning, Database Systems, Data Structures, Software Engineering, Calculus'
  );
  insertEdu.run(
    'Punjab College Blue Area Campus, Islamabad',
    'Intermediate in Computer Science (ICS)',
    '2022 - 2024',
    'Programming Fundamentals, Logic Design, Mathematics'
  );
  insertEdu.run(
    'SLS Montessori & High School, Islamabad',
    'Matriculation (Computer Science)',
    '2020 - 2022',
    'Computer Science, Mathematics, Physical Sciences'
  );
}

module.exports = db;