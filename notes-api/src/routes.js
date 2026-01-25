const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const { Note } = require('./note');
const notesRouter = express.Router();

// 'http://reverse-proxy/api/notebooks'; should work too
const NOTEBOOKS_API_URL = process.env.NOTEBOOKS_API_URL || 'http://nb_server/api/notebooks';

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

const validateNotebookId = async (notebookId) => {
  if (notebookId) {
    if (!mongoose.Types.ObjectId.isValid(notebookId)) {
      throw new Error('Invalid notebookId: Not a valid MongoDB ObjectId');
    }

    try {
      const response = await axios.get(`${NOTEBOOKS_API_URL}/${notebookId}`);
      if (!response.data) {
        throw new Error('Invalid notebookId: Notebook not found');
      }
    } catch (error) {
      console.error('Error validating notebookId:', error.message);
      throw new Error('Invalid notebookId: Notebook not found');
    }
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
    return res.status(400).json({ error: 'title and content are required' });
  }

  try {
    await validateNotebookId(notebookId);
    handleDatabaseOperation(() => {
      const note = new Note({ title, content, notebookId });
      return note.save();
    }, res, 'Failed to create note');
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

notesRouter.put('/:id', validateObjectId, async (req, res) => {
  const { title, content, notebookId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  try {
    await validateNotebookId(notebookId);
    await handleDatabaseOperation(() => 
      Note.findByIdAndUpdate(
        req.params.id,
        { title, content, notebookId },
        { new: true, runValidators: true }
      ),
      res
    );
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

notesRouter.delete('/:id', validateObjectId, async (req, res) => {
  handleDatabaseOperation(() => Note.findByIdAndDelete(req.params.id), res);
});

module.exports = { notesRouter };