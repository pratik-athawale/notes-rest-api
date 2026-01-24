const mongoose = require('mongoose');

const notebookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false,
            default: null
        }
    }, 
    { timestamps: true }
);

const Notebook = mongoose.model('Notebook', notebookSchema);

module.exports = { 
    Notebook, 
};