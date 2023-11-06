const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.get('/jobs', async (request, response) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      response.send(result);
    });

    app.get('/jobsCategory/:category', async (request, response) => {
      const category = request.params.category;
      const basedOnCategory = await jobsCollection
        .find({ jobCategory: category })
        .toArray();
      response.send(basedOnCategory);
    });

    app.post('/jobs', async (request, response) => {
      const jobs = request.body;
      const result = await jobsCollection.insertOne(jobs);
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

// const connectDatabase = async () => {
//   try {
//     await mongoose.connect(
//       ``
//     );
//     const jobsDatabase = mongoose.connection.useDb('jobsDB');
//     const jobsCollection = jobsDatabase.collection('job');

//     console.log('mongodb is connected');
//   } catch (error) {
//     console.log('mongodb connection error', error);
//     process.exit(1);
//   }
// };

// app.get('/', async (request, response) => {
//   response.send('successfully connected');
// });

// app.post('/jobs', async (request, response) => {
//   const jobs = request.body;
//   const result = await jobsCollection.insertOne(jobs);
//   response.send(result);
// });

// app.listen(port, async () => {
//   console.log(`server is running at http://localhost:${port}`);
//   await connectDatabase();
// });
