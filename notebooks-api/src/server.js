const express = require('express');
const mongoose = require('mongoose');
const { notebooksRouter } = require('./routes');

const app = express();

const port = process.env.PORT;
const dbUrl = process.env.DB_URL;

app.use(express.json());

console.log('Connecting to DB!');
console.log('dburl', dbUrl);

mongoose.connect(process.env.DB_URL)
.then(() => {
    console.log('Connected to DB');
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })
})
.catch((err) => {
    console.log('Something went wrong');
    console.error(err);
})

app.use('/api/notebooks', notebooksRouter);

// app.get('/api/notebooks', (req, res) => {
//     res.send('Hello from Notebooks!');
// });
