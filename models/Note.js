const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: ['Study', 'Assignment', 'Project', 'Personal', 'Ideas', 'Other'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', noteSchema);
