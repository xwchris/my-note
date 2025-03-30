import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/app/data' : __dirname;
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Initialize files
async function initializeFiles() {
  try {
    await fs.access(NOTES_FILE);
  } catch {
    await fs.writeFile(NOTES_FILE, JSON.stringify([]));
  }

  try {
    await fs.access(STATS_FILE);
  } catch {
    await fs.writeFile(STATS_FILE, JSON.stringify({ activityData: [], totalDays: 0 }));
  }
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

async function readNotes() {
  const data = await fs.readFile(NOTES_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeNotes(notes) {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
}

async function readStats() {
  const data = await fs.readFile(STATS_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeStats(stats) {
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
}

async function updateActivityStats(notes) {
  const days = 14;
  const today = new Date();
  const activityData = [];
  const uniqueDays = new Set();

  notes.forEach(note => {
    if (note.deleted === 0) {
      uniqueDays.add(new Date(note.createdAt).toISOString().split('T')[0]);
    }
  });

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const count = notes.filter(note => {
      const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
      return noteDate === dateStr && note.deleted === 0;
    }).length;

    activityData.push({ date: dateStr, count });
  }

  const stats = {
    activityData,
    totalDays: uniqueDays.size
  };

  await writeStats(stats);
  return stats;
}

// Authentication routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});

app.get('/api/ping', authenticateToken, async (req, res) => {
  res.status(200).json({ ping: true });
});

app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await readNotes();
    res.status(200).json(notes);
  } catch (error) {
    console.error('Failed to get notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const notes = await readNotes();
    const stats = await updateActivityStats(notes);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.post('/api/notes/sync', authenticateToken, async (req, res) => {
  try {
    const note = req.body;
    const notes = await readNotes();

    const existingNote = notes.find(n => n.uuid === note.uuid);

    if (existingNote) {
      if (existingNote.version > note.version) {
        return res.status(409).json({
          conflict: true,
          serverVersion: existingNote
        });
      }
      Object.assign(existingNote, note);
    } else {
      notes.push(note);
    }

    await writeNotes(notes);
    await updateActivityStats(notes);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

async function start() {
  await initializeFiles();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();