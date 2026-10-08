const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Note = require('../models/Note');

const validCategories = ['Study', 'Assignment', 'Project', 'Personal', 'Ideas', 'Other'];

const validateNoteData = (title, content, category) => {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('Title is required.');
  }

  if (!content || !content.trim()) {
    errors.push('Content is required.');
  }

  if (!category || !validCategories.includes(category)) {
    errors.push('Category must be one of: Study, Assignment, Project, Personal, Ideas, Other.');
  }

  return errors;
};

// GET /api/notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notes.', error: error.message });
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID.' });
  }

  try {
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching note.', error: error.message });
  }
});

// POST /api/notes
router.post('/', async (req, res) => {
  const { title, content, category } = req.body;
  const validationErrors = validateNoteData(title, content, category);

  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, message: validationErrors[0] });
  }

  try {
    const newNote = await Note.create({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
    });

    return res.status(201).json({ success: true, message: 'Note created successfully.', data: newNote });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating note.', error: error.message });
  }
});

// PUT /api/notes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID.' });
  }

  const validationErrors = validateNoteData(title, content, category);

  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, message: validationErrors[0] });
  }

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    return res.status(200).json({ success: true, message: 'Note updated successfully.', data: updatedNote });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating note.', error: error.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID.' });
  }

  try {
    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    return res.status(200).json({ success: true, message: 'Note deleted successfully.', data: deletedNote });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting note.', error: error.message });
  }
});

module.exports = router;
