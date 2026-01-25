const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
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

const validateNotebookId = async (notebookId, res) => {
  if (notebookId) {
    if (!mongoose.Types.ObjectId.isValid(notebookId)) {
      return res.status(400).json({ error: 'Invalid notebookId: Not a valid MongoDB ObjectId' });
    }

    try {
      const response = await axios.get(`http://nb_server/api/notebooks/${notebookId}`);
      if (!response.data) {
        return res.status(400).json({ error: 'Invalid notebookId: Notebook not found' });
      }
      return notebookId;
    } catch (error) {
      console.error('Error validating notebookId:', error.message);
      return res.status(400).json({ error: 'Invalid notebookId: Notebook not found' });
    }
  }
  return undefined;
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
    return res.status(400).json({ error: 'title and content are required' });
  }

  const validNotebookId = await validateNotebookId(notebookId, res);

  handleDatabaseOperation(() => {
    const note = new Note({ title, content, validNotebookId });
    return note.save();
  }, res, 'Failed to create note');
});

notesRouter.put('/:id', validateObjectId, async (req, res) => {
  const { title, content, notebookId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const validNotebookId = await validateNotebookId(notebookId, res);

  await handleDatabaseOperation(() => 
    Note.findByIdAndUpdate(
      req.params.id,
      { title, content, validNotebookId },
      { new: true, runValidators: true }
    ),
    res
  );
});

notesRouter.delete('/:id', validateObjectId, async (req, res) => {
  handleDatabaseOperation(() => Note.findByIdAndDelete(req.params.id), res);
});

module.exports = { notesRouter };