const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-assignment-11.m6efgmp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    // await client.connect();
    const jobsDatabase = client.db('jobsDB');
    const jobsCollection = jobsDatabase.collection('job');
    const jobBidCollection = jobsDatabase.collection('bidJob');

    app.get('/jobs', async (request, response) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      response.send(result);
    });

    app.get('/bidJob', async (request, response) => {
      const cursor = jobBidCollection.find();
      const result = await cursor.toArray();
      response.send(result);
    });

    app.get('/jobs/:id', async (request, response) => {
      const id = request.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      response.send(result);
    });

    app.put('/jobs/:id', async (request, response) => {
      const id = request.params.id;
      const query = { _id: new ObjectId(id) };
      const updateJob = {
        $set: {
          jobTitle: request.body.title,
          jobDeadline: request.body.deadline,
          jobDescription: request.body.description,
          jobCategory: request.body.category,
          jobMaxPrice: request.body.lowPrice,
          jobMinPrice: request.body.highPrice,
        },
      };
      const result = await jobsCollection.updateOne(query, updateJob);
      response.send(result);
    });

    app.get('/jobsCategory/:category', async (request, response) => {
      const category = request.params.category;
      const basedOnCategory = await jobsCollection
        .find({ jobCategory: category })
        .toArray();
      response.send(basedOnCategory);
    });

    app.get('/jobDetails/:id', async (request, response) => {
      const id = request.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      response.send(result);
    });

    app.get('/jobPosted', async (request, response) => {
      let query = {};
      if (request.query?.email) {
        query = { employerEmail: request.query.email };
      }
      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();
      response.send(result);
    });

    app.post('/jobs', async (request, response) => {
      const jobs = request.body;
      const result = await jobsCollection.insertOne(jobs);
      response.send(result);
    });

    app.post('/bidJob', async (request, response) => {
      const bidJob = request.body;
      const result = await jobBidCollection.insertOne(bidJob);
      response.send(result);
    });

    app.delete('/jobPosted/id/:id', async (request, response) => {
      const id = request.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      response.send(result);
    });

    await client.db('admin').command({ ping: 1 });
    console.log('You successfully connected to MongoDB!');
  } catch (error) {
    console.log(error);
  }
};
run();

app.get('/', (request, response) => {
  response.send('database is connected');
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});

// http://localhost:5000/jobPosted?employerEmail=personone@mail.com
// http://localhost:5000/jobPosted?employerEmail=persontwo@mail.com

// http://localhost:5000/jobPosted?employerEmail=personTwo@mail.com
// http://localhost:5000/jobPosted?employerEmail=personOne@mail.com
