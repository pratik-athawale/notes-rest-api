const express = require('express');
const mongoose = require('mongoose');
const { Note } = require('./note');
const notesRouter = express.Router();

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }
  next();
};

const handleDatabaseOperation = async (operation, res) => {
  try {
    const result = await operation();
    if (!result) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

notesRouter.get('/', async (req, res) => {
  handleDatabaseOperation(() => Note.find(), res);
});

notesRouter.get('/:id', validateObjectId, async (req, res) => {
  handleDatabaseOperation(() => Note.findById(req.params.id), res);
});

notesRouter.post('/', async (req, res) => {
  const { title, content, notebookId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content is required' });
  }

  handleDatabaseOperation(() => {
    const note = new Note({ title, content, notebookId });
    return note.save();
  }, res, 'Failed to create note');
});

notesRouter.put('/:id', validateObjectId, async (req, res) => {
  const { title, content, notebookId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  await handleDatabaseOperation(() => 
    Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    ),
    res
  );
});


notesRouter.delete('/:id', validateObjectId, async (req, res) => {
  handleDatabaseOperation(() => Note.findByIdAndDelete(req.params.id), res);
});

module.exports = { notesRouter };