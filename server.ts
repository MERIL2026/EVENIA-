/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

// Standard ES modules resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// AI Platform: Lazy Gemini SDK Setup
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. AI features will run in sandbox mode with fallback answers.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// Database setup & Seeds
// -------------------------------------------------------------
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Interfaces for our DB structure
interface DB {
  users: any[];
  events: any[];
  registrations: any[];
  tickets: any[];
  payments: any[];
  certificates: any[];
  feedback: any[];
  volunteers: any[];
  notifications: any[];
}

const defaultDBState: DB = {
  users: [
    {
      id: 'usr_admin',
      name: 'Super Admin',
      email: 'admin@evenia.com',
      password: 'password', // Plain text for local simulation
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'usr_org',
      name: 'Sarah Jenkins',
      email: 'organizer@evenia.com',
      password: 'password',
      role: 'organizer',
      college: 'TechTronix University',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'usr_vol',
      name: 'Alex Rivera',
      email: 'volunteer@evenia.com',
      password: 'password',
      role: 'volunteer',
      college: 'MIT Computer Club',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'usr_part_user',
      name: 'Alex Mercer',
      email: 'merilpu37@gmail.com', // Match active user's email
      password: 'password',
      role: 'participant',
      college: 'MIT campus',
      phone: '+1 555-0199',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    },
  ],
  events: [
    {
      id: 'evt_glitch',
      title: 'GLITCH HACKATHON 2026',
      description: 'The ultimate 36-hour brutalist coding storm. Build or break, compile or crash. We provide the coffee, you bring the absolute chaos. Form teams, hack physical interfaces, and push Web3 and AI architectures to the absolute limits.',
      category: 'hackathon',
      banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      logo: '👾',
      venue: 'Main Arena Hall, MIT campus',
      google_map_url: 'https://maps.google.com/?q=MIT+Campus+Arena',
      date: '2026-07-20',
      time: '09:00',
      capacity: 250,
      price: 0,
      registration_deadline: '2026-07-15',
      contact_number: '+1 555-HACK',
      email: 'hacks@evenia.com',
      website: 'https://glitch2026.com',
      faq: [
        { q: 'Who can participate?', a: 'Any high school or college student with a thirst for code and design.' },
        { q: 'Do we need teams?', a: 'Teams of 1 to 4 are highly recommended. You can also form teams on-site.' },
      ],
      sponsors: ['Supabase', 'Vercel', 'Google AI', 'Stripe'],
      speakers: [
        { name: 'Dr. Jane Turing', role: 'Distinguished Architect', bio: 'Pioneered decentralization protocols.' },
        { name: 'Marcus Sterling', role: 'Lead UI Engineer', bio: 'Evangelist of anti-design and brutalist web.' },
      ],
      created_by: 'usr_org',
      status: 'active',
      rating: 4.8,
    },
    {
      id: 'evt_cyberpunk',
      title: 'CYBERPUNK CODES v2',
      description: 'A 4-hour speed coding shootout under neon backlights. Compile assembly, solve visual puzzles, and bypass network layers. Only the fastest command-line operators survive.',
      category: 'coding',
      banner: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      logo: '💀',
      venue: 'Lab 4, Science Park',
      google_map_url: 'https://maps.google.com/?q=Science+Park+Lab+4',
      date: '2026-07-25',
      time: '14:00',
      capacity: 100,
      price: 15,
      registration_deadline: '2026-07-24',
      contact_number: '+1 555-CYBER',
      email: 'cyberpunk@evenia.com',
      website: 'https://cyberpunk.evenia.com',
      faq: [
        { q: 'What languages are supported?', a: 'C++, Rust, Python, Go, and assembly dialects.' },
      ],
      sponsors: ['DigitalOcean', 'Cloudflare'],
      speakers: [
        { name: 'ZeroCool', role: 'Security Analyst', bio: 'Legendary whitehat operator.' },
      ],
      created_by: 'usr_org',
      status: 'active',
      rating: 4.5,
    },
    {
      id: 'evt_apex',
      title: 'APEX LEGENDS CLASH',
      description: 'Intense 3v3 battle-royale gaming tournament. Live casted on high-contrast screen formats. High-stakes gaming with brutalist prize trophies.',
      category: 'gaming',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      logo: '🎯',
      venue: 'Cyber Lounge Esports',
      google_map_url: 'https://maps.google.com/?q=Cyber+Lounge+Arena',
      date: '2026-07-28',
      time: '18:00',
      capacity: 48,
      price: 5,
      registration_deadline: '2026-07-27',
      contact_number: '+1 555-GAME',
      email: 'apex@evenia.com',
      faq: [
        { q: 'Is there pre-determined seeding?', a: 'Yes, teams will be seeded based on competitive ranking.' },
      ],
      sponsors: ['Razer', 'SteelSeries'],
      speakers: [],
      created_by: 'usr_org',
      status: 'active',
      rating: 4.9,
    },
    {
      id: 'evt_brutalist_design',
      title: 'BRUTALIST WEB EXPO 2026',
      description: 'A design summit exploring massive typography, solid color blocks, print layouts, and the resurgence of tactile web magazine layouts. Say no to cookie-cutter gradients.',
      category: 'workshop',
      banner: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
      logo: '🧱',
      venue: 'Design Center, Block 9',
      google_map_url: 'https://maps.google.com/?q=Design+Center+Block+9',
      date: '2026-08-05',
      time: '11:00',
      capacity: 150,
      price: 0,
      registration_deadline: '2026-08-01',
      contact_number: '+1 555-BRUT',
      email: 'expo@evenia.com',
      faq: [],
      sponsors: ['Figma', 'Typeform'],
      speakers: [
        { name: 'Oskar Grotesk', role: 'Typography Critic', bio: 'Author of "The Tyranny of the Curved Border".' },
      ],
      created_by: 'usr_org',
      status: 'active',
      rating: 4.7,
    },
  ],
  registrations: [
    {
      id: 'reg_01',
      user_id: 'usr_part_user',
      event_id: 'evt_glitch',
      ticket_id: 'tkt_01',
      status: 'confirmed',
      registration_date: '2026-07-01T12:00:00.000Z',
      fields: {
        name: 'Alex Mercer',
        email: 'merilpu37@gmail.com',
        phone: '+1 555-0199',
        college: 'MIT campus',
        department: 'Computer Science',
        interests: 'AI, Web3, Hackathons',
        gender: 'Male',
        age: 21,
        custom_answers: {
          'Why do you want to join?': 'To build the future of brutalist software designs!',
          'T-Shirt Size': 'L',
        },
      },
    },
    {
      id: 'reg_02',
      user_id: 'usr_part_user',
      event_id: 'evt_cyberpunk',
      ticket_id: 'tkt_02',
      status: 'confirmed',
      registration_date: '2026-07-02T10:00:00.000Z',
      fields: {
        name: 'Alex Mercer',
        email: 'merilpu37@gmail.com',
        phone: '+1 555-0199',
        college: 'MIT campus',
        department: 'Computer Science',
        interests: 'AI, Web3, Hackathons',
        gender: 'Male',
        age: 21,
        custom_answers: {
          'Experience Level': 'Intermediate',
        },
      },
    },
    {
      id: 'reg_03',
      user_id: 'usr_part_jane',
      event_id: 'evt_glitch',
      ticket_id: 'tkt_03',
      status: 'confirmed',
      registration_date: '2026-07-03T11:00:00.000Z',
      fields: {
        name: 'Jane Doe',
        email: 'jane@mit.edu',
        phone: '+1 555-0212',
        college: 'MIT campus',
        department: 'EECS',
        interests: 'AI, Machine Learning, Robotics',
        gender: 'Female',
        age: 20,
        custom_answers: {
          'Why do you want to join?': 'To collaborate on AI agents!',
          'T-Shirt Size': 'M',
        },
      },
    },
    {
      id: 'reg_04',
      user_id: 'usr_part_david',
      event_id: 'evt_glitch',
      ticket_id: 'tkt_04',
      status: 'confirmed',
      registration_date: '2026-07-03T14:30:00.000Z',
      fields: {
        name: 'David Chen',
        email: 'david@stanford.edu',
        phone: '+1 555-0344',
        college: 'Stanford University',
        department: 'Electrical Engineering',
        interests: 'Robotics, IoT, Cyber Security',
        gender: 'Male',
        age: 22,
        custom_answers: {
          'Why do you want to join?': 'Looking for cross-disciplinary hardware hacks.',
          'T-Shirt Size': 'XL',
        },
      },
    },
    {
      id: 'reg_05',
      user_id: 'usr_part_priya',
      event_id: 'evt_brutalist_design',
      ticket_id: 'tkt_05',
      status: 'confirmed',
      registration_date: '2026-07-04T09:15:00.000Z',
      fields: {
        name: 'Priya Sharma',
        email: 'priya@tech.edu',
        phone: '+1 555-0455',
        college: 'TechTronix University',
        department: 'Information Technology',
        interests: 'Web Development, Design, AI',
        gender: 'Female',
        age: 21,
        custom_answers: {
          'Why do you want to join?': 'I love brutalist architecture and responsive typography!',
          'T-Shirt Size': 'S',
        },
      },
    },
    {
      id: 'reg_06',
      user_id: 'usr_part_marcus',
      event_id: 'evt_cyberpunk',
      ticket_id: 'tkt_06',
      status: 'confirmed',
      registration_date: '2026-07-04T10:00:00.000Z',
      fields: {
        name: 'Marcus Aurelius',
        email: 'marcus@columbia.edu',
        phone: '+1 555-0677',
        college: 'Columbia University',
        department: 'Data Science',
        interests: 'AI, Machine Learning, Quantitative Trading',
        gender: 'Male',
        age: 23,
        custom_answers: {
          'Experience Level': 'Expert',
        },
      },
    }
  ],
  tickets: [
    {
      id: 'tkt_01',
      registration_id: 'reg_01',
      ticket_type: 'student',
      price: 0,
      qr_code: 'EVN-GLITCH-01-MERCER',
      seat_number: 'A-12',
      status: 'valid',
    },
    {
      id: 'tkt_02',
      registration_id: 'reg_02',
      ticket_type: 'paid',
      price: 15,
      qr_code: 'EVN-CYBER-02-MERCER',
      seat_number: 'B-04',
      status: 'valid',
    },
    {
      id: 'tkt_03',
      registration_id: 'reg_03',
      ticket_type: 'student',
      price: 0,
      qr_code: 'EVN-GLITCH-03-DOE',
      seat_number: 'A-13',
      status: 'valid',
    },
    {
      id: 'tkt_04',
      registration_id: 'reg_04',
      ticket_type: 'student',
      price: 0,
      qr_code: 'EVN-GLITCH-04-CHEN',
      seat_number: 'A-14',
      status: 'valid',
    },
    {
      id: 'tkt_05',
      registration_id: 'reg_05',
      ticket_type: 'student',
      price: 0,
      qr_code: 'EVN-BRUT-05-SHARMA',
      seat_number: 'C-01',
      status: 'valid',
    },
    {
      id: 'tkt_06',
      registration_id: 'reg_06',
      ticket_type: 'paid',
      price: 15,
      qr_code: 'EVN-CYBER-06-AURELIUS',
      seat_number: 'B-05',
      status: 'valid',
    },
  ],
  payments: [
    {
      id: 'pay_01',
      registration_id: 'reg_02',
      user_id: 'usr_part_user',
      amount: 15,
      status: 'success',
      gateway: 'stripe',
      transaction_id: 'ch_sim_82739182',
      date: '2026-07-02T10:00:00.000Z',
    },
  ],
  certificates: [
    {
      id: 'cert_01',
      registration_id: 'reg_01',
      event_id: 'evt_glitch',
      recipient_name: 'Alex Mercer',
      certificate_type: 'participation',
      title: 'GLITCH HACKATHON ACCOMPLISHMENT',
      issue_date: '2026-07-21',
      url: '#',
    },
  ],
  feedback: [
    {
      id: 'fb_01',
      registration_id: 'reg_01',
      event_id: 'evt_glitch',
      user_id: 'usr_part_user',
      rating: 5,
      overall_experience: 5,
      venue_rating: 4,
      food_rating: 5,
      speaker_rating: 5,
      comments: 'The Glitch Hackathon was incredible! Brutalist layout of the workspace, great energy, plenty of coffee, and fantastic typography sessions.',
      suggestions: 'Add even more physical hardware components to hack on next time.',
      date: '2026-07-22T18:00:00.000Z',
    },
  ],
  volunteers: [
    {
      id: 'vol_01',
      event_id: 'evt_glitch',
      user_id: 'usr_vol',
      status: 'active',
    },
  ],
  notifications: [
    {
      id: 'not_01',
      user_id: 'usr_part_user',
      title: 'Registration Approved',
      message: 'Your seat for GLITCH HACKATHON 2026 has been successfully reserved! Download your pass from My Tickets.',
      date: '2026-07-01T12:05:00.000Z',
      read: false,
    },
    {
      id: 'not_02',
      user_id: 'usr_part_user',
      title: 'Ticket Purchased',
      message: 'Payment of $15.00 for CYBERPUNK CODES v2 was processed successfully via Stripe.',
      date: '2026-07-02T10:00:00.000Z',
      read: true,
    },
  ],
};

function readDB(): DB {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDBState, null, 2));
      return defaultDBState;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, using fallback state:', err);
    return defaultDBState;
  }
}

function writeDB(data: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to database:', err);
  }
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, college, phone } = req.body;
  const db = readDB();

  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const newUser = {
    id: 'usr_' + Math.random().toString(36).substr(2, 9),
    name,
    email: email.toLowerCase(),
    password, // Demo-grade simple password storage
    role: role || 'participant',
    college: college || '',
    phone: phone || '',
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
  };

  db.users.push(newUser);
  writeDB(db);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Mock Single-Sign On / Social Login
app.post('/api/auth/social', (req, res) => {
  const { email, name, avatar } = req.body;
  const db = readDB();

  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Auto-create
    user = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: 'social-password-placeholder',
      role: 'participant',
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
    };
    db.users.push(user);
    writeDB(db);
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Profile endpoints
app.put('/api/auth/profile', (req, res) => {
  const { userId, name, college, company, phone, department, gender, age } = req.body;
  const db = readDB();

  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    name: name || db.users[userIndex].name,
    college: college !== undefined ? college : db.users[userIndex].college,
    company: company !== undefined ? company : db.users[userIndex].company,
    phone: phone !== undefined ? phone : db.users[userIndex].phone,
    department: department !== undefined ? department : db.users[userIndex].department,
    gender: gender !== undefined ? gender : db.users[userIndex].gender,
    age: age !== undefined ? Number(age) : db.users[userIndex].age,
  };

  writeDB(db);

  const { password: _, ...userWithoutPassword } = db.users[userIndex];
  res.json({ user: userWithoutPassword });
});

// Get users list (for admin dashboard)
app.get('/api/admin/users', (req, res) => {
  const db = readDB();
  const safeUsers = db.users.map(({ password: _, ...u }) => u);
  res.json(safeUsers);
});

// Update role of user (admin action)
app.put('/api/admin/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const db = readDB();

  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  db.users[userIndex].role = role;
  writeDB(db);

  res.json({ success: true, userId: id, role });
});

// -------------------------------------------------------------
// Events Endpoints
// -------------------------------------------------------------
app.get('/api/events', (req, res) => {
  const db = readDB();
  res.json(db.events);
});

app.post('/api/events', (req, res) => {
  const {
    title,
    description,
    category,
    banner,
    logo,
    venue,
    google_map_url,
    date,
    time,
    capacity,
    price,
    registration_deadline,
    contact_number,
    email,
    website,
    faq,
    sponsors,
    speakers,
    created_by,
    customQuestions,
    currency,
    budget,
  } = req.body;

  const db = readDB();

  const newEvent = {
    id: 'evt_' + Math.random().toString(36).substr(2, 9),
    title,
    description,
    category,
    banner: banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    logo: logo || '🔥',
    venue,
    google_map_url: google_map_url || '',
    date,
    time,
    capacity: Number(capacity),
    price: Number(price),
    registration_deadline,
    contact_number,
    email,
    website: website || '',
    faq: faq || [],
    sponsors: sponsors || [],
    speakers: speakers || [],
    created_by,
    status: 'active', // Direct approval for simplicity, but can be managed
    rating: 5.0,
    customQuestions: customQuestions || [],
    currency: currency || 'USD',
    budget: budget || [],
  };

  db.events.push(newEvent);
  writeDB(db);

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const evtIndex = db.events.findIndex((e) => e.id === id);
  if (evtIndex === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  db.events[evtIndex] = {
    ...db.events[evtIndex],
    ...req.body,
    // Keep immutable values
    id,
    created_by: db.events[evtIndex].created_by,
  };

  writeDB(db);
  res.json(db.events[evtIndex]);
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.events = db.events.filter((e) => e.id !== id);
  writeDB(db);

  res.json({ success: true, deletedId: id });
});

// Update event status (e.g. pending/active for Admin approvals)
app.put('/api/events/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();

  const evtIndex = db.events.findIndex((e) => e.id === id);
  if (evtIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  db.events[evtIndex].status = status;
  writeDB(db);
  res.json({ success: true, id, status });
});

// -------------------------------------------------------------
// Registrations & Ticketing & Payments Simulation
// -------------------------------------------------------------
app.get('/api/registrations', (req, res) => {
  const db = readDB();
  res.json(db.registrations);
});

app.post('/api/registrations', (req, res) => {
  const { userId, eventId, fields, paymentGateway, amount } = req.body;
  const db = readDB();

  const event = db.events.find((e) => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  // Create registration
  const regId = 'reg_' + Math.random().toString(36).substr(2, 9);
  const ticketId = 'tkt_' + Math.random().toString(36).substr(2, 9);

  // Generate QR check-in string
  const initials = (fields.name || 'PART').split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const eventSlug = event.title.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z-]/g, '');
  const qrString = `EVN-${eventSlug}-${Math.floor(Math.random() * 900 + 100)}-${initials}`;

  const newTicket = {
    id: ticketId,
    registration_id: regId,
    ticket_type: event.price > 0 ? 'paid' : 'free',
    price: event.price,
    qr_code: qrString,
    seat_number: `S-${Math.floor(Math.random() * 199 + 1)}`,
    status: 'valid' as const,
  };

  const newRegistration = {
    id: regId,
    user_id: userId,
    event_id: eventId,
    ticket_id: ticketId,
    status: 'confirmed' as const,
    registration_date: new Date().toISOString(),
    fields,
  };

  db.registrations.push(newRegistration);
  db.tickets.push(newTicket);

  // Record payment
  const payId = 'pay_' + Math.random().toString(36).substr(2, 9);
  const newPayment = {
    id: payId,
    registration_id: regId,
    user_id: userId,
    amount: Number(amount || event.price),
    status: 'success' as const, // Automatically approved simulation
    gateway: paymentGateway || 'free',
    transaction_id: paymentGateway === 'free' ? 'N/A' : 'ch_sim_' + Math.random().toString(36).substr(2, 10),
    date: new Date().toISOString(),
  };
  db.payments.push(newPayment);

  // Add auto-generated certificate eligibility setup
  const certId = 'cert_' + Math.random().toString(36).substr(2, 9);
  const newCertificate = {
    id: certId,
    registration_id: regId,
    event_id: eventId,
    recipient_name: fields.name,
    certificate_type: 'participation' as const,
    title: `${event.title.toUpperCase()} ACCOMPLISHMENT`,
    issue_date: event.date,
    url: '#',
  };
  db.certificates.push(newCertificate);

  // Send platform notifications
  db.notifications.push({
    id: 'not_' + Math.random().toString(36).substr(2, 9),
    user_id: userId,
    title: 'Registration Secured!',
    message: `You are booked for ${event.title}! Download your digital brutalist pass in My Tickets.`,
    date: new Date().toISOString(),
    read: false,
  });

  writeDB(db);

  res.status(201).json({
    registration: newRegistration,
    ticket: newTicket,
    payment: newPayment,
  });
});

// Ticket check-in (QR Code / ID Scanner) API
app.post('/api/tickets/checkin', (req, res) => {
  const { qrCodeOrId, volunteerId } = req.body;
  const db = readDB();

  // Find ticket either by precise ID or by scanned QR Code
  const ticket = db.tickets.find((t) => t.id === qrCodeOrId || t.qr_code === qrCodeOrId);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket pass not recognized. Scan rejected.' });
  }

  if (ticket.status === 'used') {
    return res.status(400).json({
      error: 'DUPLICATE ENTRY DETECTED!',
      entryTime: ticket.check_in_time,
      status: 'rejected',
    });
  }

  // Update status to checked-in
  ticket.status = 'used';
  ticket.check_in_time = new Date().toISOString();

  // Find associated registration and user
  const registration = db.registrations.find((r) => r.id === ticket.registration_id);
  const attendeeName = registration ? registration.fields.name : 'Unknown';

  writeDB(db);

  res.json({
    success: true,
    message: 'CHECK-IN APPROVED!',
    attendeeName,
    seatNumber: ticket.seat_number,
    ticketType: ticket.ticket_type,
    time: ticket.check_in_time,
  });
});

// -------------------------------------------------------------
// Certificates & Feedback & Volunteers Endpoints
// -------------------------------------------------------------
app.get('/api/tickets', (req, res) => {
  const db = readDB();
  res.json(db.tickets);
});

app.get('/api/payments', (req, res) => {
  const db = readDB();
  res.json(db.payments);
});

app.get('/api/certificates', (req, res) => {
  const db = readDB();
  res.json(db.certificates);
});

app.get('/api/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  const userNotifications = db.notifications.filter((n) => n.user_id === userId);
  res.json(userNotifications);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const notIdx = db.notifications.findIndex((n) => n.id === id);
  if (notIdx !== -1) {
    db.notifications[notIdx].read = true;
    writeDB(db);
  }
  res.json({ success: true });
});

// Feedback APIs
app.get('/api/feedback', (req, res) => {
  const db = readDB();
  res.json(db.feedback);
});

app.post('/api/feedback', (req, res) => {
  const { registrationId, eventId, userId, rating, overallExperience, venueRating, foodRating, speakerRating, comments, suggestions } = req.body;
  const db = readDB();

  const newFeedback = {
    id: 'fb_' + Math.random().toString(36).substr(2, 9),
    registration_id: registrationId,
    event_id: eventId,
    user_id: userId,
    rating: Number(rating),
    overall_experience: Number(overallExperience || rating),
    venue_rating: Number(venueRating || rating),
    food_rating: Number(foodRating || rating),
    speaker_rating: Number(speakerRating || rating),
    comments,
    suggestions: suggestions || '',
    date: new Date().toISOString(),
  };

  db.feedback.push(newFeedback);

  // Recalculate event overall rating average
  const eventFeedbacks = db.feedback.filter((f) => f.event_id === eventId);
  const avg = eventFeedbacks.reduce((sum, f) => sum + f.rating, 0) / eventFeedbacks.length;
  const eventIdx = db.events.findIndex((e) => e.id === eventId);
  if (eventIdx !== -1) {
    db.events[eventIdx].rating = Number(avg.toFixed(1));
  }

  writeDB(db);
  res.status(201).json(newFeedback);
});

// Volunteers Assignment Management
app.get('/api/volunteers', (req, res) => {
  const db = readDB();
  res.json(db.volunteers);
});

app.post('/api/volunteers', (req, res) => {
  const { eventId, userId } = req.body;
  const db = readDB();

  const exists = db.volunteers.find((v) => v.event_id === eventId && v.user_id === userId);
  if (exists) {
    return res.status(400).json({ error: 'Volunteer already assigned to this event.' });
  }

  const assignment = {
    id: 'vol_asg_' + Math.random().toString(36).substr(2, 9),
    event_id: eventId,
    user_id: userId,
    status: 'assigned' as const,
  };

  db.volunteers.push(assignment);
  writeDB(db);
  res.status(201).json(assignment);
});

app.delete('/api/volunteers/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.volunteers = db.volunteers.filter((v) => v.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});


// -------------------------------------------------------------
// AI Services (Google GenAI SDK Integration)
// -------------------------------------------------------------

// AI Event Description Writer
app.post('/api/ai/describe', async (req, res) => {
  const { title, category } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Sandbox default fallback
    return res.json({
      description: `Welcome to ${title}, an elite ${category} gathering! Get ready for a high-intensity, zero-fluff collaborative sprint of code, design, and brutalist aesthetic breakthroughs. Bring your best tools and prepare for pure execution.`,
    });
  }

  try {
    const prompt = `Write a high-impact, energetic, slightly raw and brutalist-styled promotional description for a college/community event named "${title}" of category "${category}". Keep it professional yet bold, direct, and captivating. Keep the length under 80 words. Direct text only, no preamble.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    res.json({ description: response.text?.trim() || '' });
  } catch (err: any) {
    console.error('Gemini error generating description:', err);
    res.status(500).json({ error: 'Failed to generate AI description.' });
  }
});

// AI Poster Banner Typography Writer
app.post('/api/ai/poster', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      posterText: `
+------------------------------------------+
|  [EVENIA COMICS PRESENTS]                |
|  ${title.toUpperCase()}                   |
|                                          |
|  "NO ROUNDED CORNERS, NO SAFE PATHS"     |
|                                          |
|  MIT CAMPUS // JULY 20, 2026 // 09:00AM  |
|  "THE ULTIMATE CODING STORM AWAKENS"     |
+------------------------------------------+
      `.trim(),
    });
  }

  try {
    const prompt = `Generate a creative ASCII-art or stylized magazine cut-out text banner block that can be rendered in monospace font representing a poster for the event "${title}" with description "${description}". Incorporate raw, retro, comic-book, and brutalist text dividers (like +===+, | |, and blocks). Keep it inside 60 columns wide and 12 rows tall. Only output the plain text poster itself, no conversational text or markdown codeblock wrapping around it.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    res.json({ posterText: response.text || '' });
  } catch (err) {
    console.error('Gemini error generating poster:', err);
    res.status(500).json({ error: 'Failed to generate AI poster.' });
  }
});

// AI Chatbot Event Advisor
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, eventContext } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      reply: `Hey! As the Evenia AI Event Assistant, I'm here in sandbox mode. You asked about "${message}". For the event ${eventContext?.title || 'this festival'}, I recommend coming in early, bringing your laptop charger, and wearing comfortable sneakers!`,
    });
  }

  try {
    const contextStr = eventContext
      ? `You are a helpful brutalist-aesthetic AI support assistant for an event named "${eventContext.title}" (Venue: ${eventContext.venue}, Date: ${eventContext.date}, Time: ${eventContext.time}, Price: $${eventContext.price}, Description: ${eventContext.description}).`
      : `You are Evenia's senior AI advisor guiding users through various hackathons, tech fests, conferences, and exhibitions in our system.`;

    const sysInstruction = `${contextStr} Keep replies highly responsive, punchy, bold, engaging, and in a brutalist "less talk, more action" style but super informative.`;

    // Package the conversation history for Gemini standard format
    const formattedContents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((h: any) => {
        formattedContents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }
    formattedContents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: sysInstruction,
      },
    });

    res.json({ reply: response.text?.trim() || '' });
  } catch (err) {
    console.error('Gemini chatbot error:', err);
    res.status(500).json({ error: 'Failed to communicate with Gemini AI Chat.' });
  }
});

// AI Feedback Summarizer
app.post('/api/ai/summarize-feedback', async (req, res) => {
  const { eventId } = req.body;
  const db = readDB();

  const event = db.events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  const feedbacks = db.feedback.filter((f) => f.event_id === eventId);
  if (feedbacks.length === 0) {
    return res.json({
      summary: 'No participant feedback has been collected for this event yet.',
      suggestions: 'No suggestions available yet. Check back once registrations begin checking in.',
    });
  }

  const commentsText = feedbacks
    .map((f, i) => `[Feedback ${i + 1}] Rating: ${f.rating}/5. Comments: "${f.comments}". Suggestions: "${f.suggestions || 'None'}"`)
    .join('\n');

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      summary: `Sandbox Summary: Average score of ${(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)}/5 stars. Participants love the energy, coffee, and brutalist design theme!`,
      suggestions: '- Host physical workshops prior to code sprints.\n- Allocate separate channels for hardware hackers.\n- Increase food options.',
    });
  }

  try {
    const prompt = `Analyze the following attendee feedback comments for the event "${event.title}":\n\n${commentsText}\n\nDeliver an objective, bulleted executive summary of overall sentiments (what they loved, what they criticized) and a separate section of high-impact actionable recommendations. Keep your output very structured and concise.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    // Let's divide response text or send back as complete summary
    res.json({
      summary: response.text || 'No summary generated.',
    });
  } catch (err) {
    console.error('Gemini error summarizing feedback:', err);
    res.status(500).json({ error: 'Feedback summary failed.' });
  }
});

// AI Language Translator
app.post('/api/ai/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Text and target language are required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ translatedText: `[Sandbox Translation to ${targetLanguage}]: ${text}` });
  }

  try {
    const prompt = `Translate the following text into ${targetLanguage}. Preserve the exact meaning, tone, list indicators, and paragraphs. Return ONLY the translation itself, no introductory text, no comments, and no quotation marks around the translation unless they were in the original text:\n\n${text}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    res.json({ translatedText: response.text?.trim() || text });
  } catch (err) {
    console.error('Gemini translation error:', err);
    res.status(500).json({ error: 'Translation failed.' });
  }
});

// AI Networking Recommendations Endpoint
app.post('/api/ai/recommendations', async (req, res) => {
  const { userId, college, department, interests, eventId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const db = readDB();

  // Find all registrations except for the current user's registrations
  // Keep unique other attendees based on email or name
  const seenAttendees = new Set<string>();
  const otherAttendees: any[] = [];

  // If we have current user emails, exclude them
  const currentUserObj = db.users.find(u => u.id === userId);
  const currentUserEmails = new Set<string>();
  if (currentUserObj) {
    currentUserEmails.add(currentUserObj.email.toLowerCase());
  }

  // Also gather current user's registered emails from their registrations
  db.registrations.forEach(r => {
    if (r.user_id === userId) {
      if (r.fields && r.fields.email) {
        currentUserEmails.add(r.fields.email.toLowerCase());
      }
    }
  });

  db.registrations.forEach(r => {
    if (r.user_id === userId) return;
    if (!r.fields || !r.fields.name || !r.fields.email) return;
    
    const emailLower = r.fields.email.toLowerCase();
    if (currentUserEmails.has(emailLower)) return;

    if (!seenAttendees.has(emailLower)) {
      seenAttendees.add(emailLower);
      
      // Find event name
      const event = db.events.find(e => e.id === r.event_id);
      const eventTitle = event ? event.title : 'Evenia Fest';

      otherAttendees.push({
        name: r.fields.name,
        email: r.fields.email,
        college: r.fields.college || 'N/A',
        department: r.fields.department || 'N/A',
        interests: r.fields.interests || 'N/A',
        eventTitle,
        eventId: r.event_id,
      });
    }
  });

  // If requested to match specifically for a certain event, we could sort or filter, but let's provide all relevant ones
  let filteredOthers = otherAttendees;
  if (eventId) {
    // Prioritize or filter attendees registered for this event
    filteredOthers = otherAttendees.filter(o => o.eventId === eventId);
    // If not enough, fill with others
    if (filteredOthers.length < 2) {
      filteredOthers = [...filteredOthers, ...otherAttendees.filter(o => o.eventId !== eventId)];
    }
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Sandbox Simulation Mode fallback
    // We calculate simulated matches based on shared fields!
    const matches = filteredOthers.map(other => {
      let score = 50; // base score
      const factors: string[] = [];

      // Compare colleges
      const targetCol = (college || '').toLowerCase().trim();
      const otherCol = (other.college || '').toLowerCase().trim();
      if (targetCol && otherCol && (targetCol.includes(otherCol) || otherCol.includes(targetCol))) {
        score += 25;
        factors.push(`Both affiliated with ${other.college}`);
      } else if (targetCol && otherCol) {
        // Nearby fallback match
        if ((targetCol.includes('mit') && otherCol.includes('mit')) || (targetCol.includes('boston') && otherCol.includes('boston'))) {
          score += 20;
          factors.push('Geographically close campuses');
        }
      }

      // Compare departments
      const targetDept = (department || '').toLowerCase().trim();
      const otherDept = (other.department || '').toLowerCase().trim();
      if (targetDept && otherDept && (targetDept.includes(otherDept) || otherDept.includes(targetDept))) {
        score += 20;
        factors.push(`Shared focus in ${other.department}`);
      }

      // Compare interests
      const targetInts = (interests || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      const otherInts = (other.interests || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      
      const commonInts = targetInts.filter(i => otherInts.some(oi => oi.includes(i) || i.includes(oi)));
      if (commonInts.length > 0) {
        score += Math.min(commonInts.length * 15, 30);
        factors.push(`Mutual interests: ${commonInts.map(i => i.toUpperCase()).join(', ')}`);
      }

      // Final score capping
      score = Math.min(score, 99);

      // Simple icebreaker template
      const intro = `Hey ${other.name.split(' ')[0]}! I saw we're both attending ${other.eventTitle} and have a background in ${department || 'technology'}. Let's connect!`;

      return {
        name: other.name,
        email: other.email,
        college: other.college,
        department: other.department,
        interests: other.interests,
        score: `${score}%`,
        matchFactors: factors.length > 0 ? factors : ['Attending same Evenia event circle'],
        icebreaker: intro,
      };
    });

    // Sort by score descending
    matches.sort((a, b) => parseInt(b.score) - parseInt(a.score));

    return res.json({ recommendations: matches.slice(0, 3) });
  }

  try {
    // Generate prompt for real Gemini API
    const targetProfileStr = `
- Name: ${currentUserObj ? currentUserObj.name : 'Participant'}
- College/Firm: ${college || 'N/A'}
- Department/Major: ${department || 'N/A'}
- Interests: ${interests || 'N/A'}
`;

    const candidatesStr = filteredOthers.map((c, idx) => `
Candidate #${idx + 1}:
- Name: ${c.name}
- Email: ${c.email}
- College/Firm: ${c.college}
- Department/Major: ${c.department}
- Interests: ${c.interests}
- Event: ${c.eventTitle}
`).join('\n');

    const prompt = `
You are a highly advanced brutalist-aesthetic matchmaker AI for elite university networking hackathons and summits.
Your goal is to suggest the top 2-3 most relevant other attendees to connect with for the following Target User:

TARGET USER PROFILE:
${targetProfileStr}

AVAILABLE CANDIDATES TO MATCH FROM:
${candidatesStr}

Instructions:
- Compare the candidates against the Target User.
- Score them from 0% to 100% based on common interests, academic major alignments, and campus locations.
- Write a short list of bullet points for 'matchFactors' showing precisely why they are a great match.
- Draft a highly punchy, personalized, direct 'icebreaker' message that the Target User can send to start a conversation with the candidate. Make it sound like it was written by a real student/professional attending the event (no AI generic fluff).
- Return the list of matches as a valid JSON array of objects. Do not include any markdown wrap (such as \`\`\`json or \`\`\`), conversational text, or explanation around it.

Expected JSON array structure:
[
  {
    "name": "Candidate Name",
    "email": "candidate@email.com",
    "college": "Candidate College",
    "department": "Candidate Department",
    "interests": "Candidate Interests",
    "score": "95%",
    "matchFactors": ["Both affiliated with MIT", "Shared interest in AI Agents"],
    "icebreaker": "Hey David! Loved your hardware profile..."
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const cleanText = response.text?.trim() || '';
    // Strip any markdown wrappers if generated by the model
    const jsonStr = cleanText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    
    let recommendations = [];
    try {
      recommendations = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini recommendations JSON, falling back to clean text parser', parseErr);
      throw new Error('JSON parsing failed');
    }

    res.json({ recommendations });
  } catch (err) {
    console.error('Gemini recommendations API error:', err);
    res.status(500).json({ error: 'AI recommendation processing encountered an issue.' });
  }
});


// -------------------------------------------------------------
// Vite Dev Server & Client Integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
