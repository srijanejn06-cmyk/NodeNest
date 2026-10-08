const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const Note = require('./models/Note');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notenest_db';

const sampleNotes = [
  {
    title: 'Database Lab Revision',
    content:
      'Review the MongoDB CRUD commands, schema design, and REST API examples before the practical exam.',
    category: 'Study',
  },
  {
    title: 'Mini Project Plan',
    content:
      'Finalize the dashboard layout, select the backend endpoints, and prepare a short demo script for the lab review.',
    category: 'Project',
  },
  {
    title: 'Assignment Ideas',
    content:
      'Add a search feature, responsive CSS, and validation messages for empty fields before submitting the final assignment.',
    category: 'Assignment',
  },
  {
    title: 'Weekend Goals',
    content:
      'Complete the notes app, test search functionality, and spend time practicing the final viva questions with confidence.',
    category: 'Personal',
  },
  {
    title: 'Innovation Spark',
    content:
      'Idea: create a note dashboard with tags, reminders, and dark mode in a future version of the product.',
    category: 'Ideas',
  },
];

const seedSampleNotes = async () => {
  try {
    const count = await Note.countDocuments();
    if (count === 0) {
      await Note.insertMany(sampleNotes);
      console.log('Sample notes inserted into MongoDB for demo.');
    }
  } catch (error) {
    console.error('Sample note seeding failed:', error.message);
  }
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/notes', require('./routes/noteRoutes'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully.');

    await seedSampleNotes();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});
