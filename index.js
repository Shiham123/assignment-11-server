const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      // 'http://localhost:5173',
      'https://assignment-11-26ced.web.app',
      'https://assignment-11-26ced.firebaseapp.com',
    ],
    credentials: true,
  })
);
// app.use(cors());
app.use(express.json());
app.use(cookieParser());

// const uri = 'mongodb://localhost:27017';

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-assignment-11.m6efgmp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// custom middleware
// const logger = async (request, response, next) => {
//   console.log('called', request.hostname, 'url', request.originalUrl);
//   next();
// };

// const verifyToken = async (request, response, next) => {
//   const token = request.cookies?.token;

//   if (!token) {
//     return response.status(401).send({ message: 'token not found' });
//   }

//   jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
//     if (error) {
//       return response.status(402).send({ message: 'not authorized' });
//     }

//     request.customUser = decoded;
//     next();
//   });
// };

const run = async () => {
  try {
    // await client.connect();
    const jobsDatabase = client.db('jobsDB');
    const jobsCollection = jobsDatabase.collection('job');
    const jobBidCollection = jobsDatabase.collection('bidJob');

    // token json web token ----------------
    app.post('/jwt', async (request, response) => {
      const user = request.body;

      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: '365d',
      });

      response
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    app.post('/jwtLogout', async (request, response) => {
      const user = request.body;
      console.log(user);
      response
        .clearCookie('token', {
          maxAge: 0,
          secure: process.env.NODE_ENV === 'production' ? true : false,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ message: 'logout' });
    });

    // Global get method ----------
    app.get('/jobs', async (request, response) => {
      const cursor = jobsCollection.find();
      console.log(request.cookies);
      const result = await cursor.toArray();
      response.send(result);
    });

    app.get('/jobs/:id', async (request, response) => {
      const id = request.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
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

    // email based get method ----------
    app.get('/jobPosted', async (request, response) => {
      let query = {};
      if (request.query?.email) {
        query = { employerEmail: request.query.email };
      }
      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();
      response.send(result);
    });

    app.get('/bidJob', async (request, response) => {
      let query = {};
      if (request.query?.email) {
        query = { loginUserEmail: request.query.email };
      }
      const sortBaseOnPrice = { status: 1 };
      const cursor = jobBidCollection.find(query).sort(sortBaseOnPrice);
      const result = await cursor.toArray();
      response.send(result);
    });

    app.get('/bidJob/bid', async (request, response) => {
      let query = {};
      if (request.query?.email) {
        query = { employerEmail: request.query.email };
      }
      const cursor = jobBidCollection.find(query);
      const result = await cursor.toArray();
      response.send(result);
    });

    // Put method ----------
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

    // patch method ----------
    app.patch('/bidJob/bid/:id', async (request, response) => {
      const id = request.params.id;
      const query = { _id: new ObjectId(id) };

      const updateStatue = {
        $set: {
          status: request.body.status,
        },
      };
      const result = await jobBidCollection.updateOne(query, updateStatue);
      response.send(result);
    });

    // post method ----------
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

    // delete method ----------
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
