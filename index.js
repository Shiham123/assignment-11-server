const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const connectDatabase = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-assignment-11.m6efgmp.mongodb.net/?retryWrites=true&w=majority`
    );
    console.log('mongodb is connected');
  } catch (error) {
    console.log('mongodb connection error', error);
    process.exit(1);
  }
};

app.get('/', async (request, response) => {
  response.send('successfully connected');
});

app.listen(port, async () => {
  console.log(`server is running at http://localhost:${port}`);
  await connectDatabase();
});
