const express = require('express');
const mongoose = require('mongoose');
const { Notebook } = require('./Notebook');
const notebooksRouter = express.Router();

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid notebook ID' });
  }
  next();
};

const handleDatabaseOperation = async (operation, res) => {
  try {
    const result = await operation();
    if (!result) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

notebooksRouter.get('/', async (req, res) => {
  handleDatabaseOperation(() => Notebook.find(), res);
});

notebooksRouter.get('/:id', validateObjectId, async (req, res) => {
  handleDatabaseOperation(() => Notebook.findById(req.params.id), res);
});

notebooksRouter.post('/', async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleDatabaseOperation(() => {
    const notebook = new Notebook({ name, description });
    return notebook.save();
  }, res, 'Failed to create notebook');
});

notebooksRouter.put('/:id', validateObjectId, async (req, res) => {
  handleDatabaseOperation(() => Notebook.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ), res);
});

notebooksRouter.delete('/:id', validateObjectId, async (req, res) => {
  handleDatabaseOperation(() => Notebook.findByIdAndDelete(req.params.id), res);
});

module.exports = { notebooksRouter };