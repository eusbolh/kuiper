const express = require('express');
const cors = require('cors');
const cache = require('memory-cache');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/*
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection is established')
})

const exerciseRouter = require('./routes/exercises');
const usersRouter = require('./routes/users');

app.use('/exercises', exerciseRouter);
app.use('/users', usersRouter);
*/

// Initialize peers on cache
cache.put('peers', [])

const peersRouter = require('./routes/peers');
app.use('/peers', peersRouter)

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});