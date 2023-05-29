const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ze0g6j8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const menuCollection = client.db('bistro-boss-db').collection('menu');
    const reviewsCollection = client.db('bistro-boss-db').collection('reviews');
    const cartCollection = client.db('bistro-boss-db').collection('carts');
    const userCollection = client.db('bistro-boss-db').collection('users');
    app.get('/menu', async (req, res) => {
        const result = await menuCollection.find().toArray();
        res.send(result);
    })
    app.get('/reviews', async (req, res) => {
        const result = await reviewsCollection.find().toArray();
        res.send(result);
    })
    // carts collection get
    app.get('/carts', async (req, res) => {
      if(!req.query.email){
        res.send([]);
      }
      else{
        const result = await cartCollection.find({email: req.query.email}).toArray();
      res.send(result)
      }
    })
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const existingUser = await userCollection.findOne({email: user.email});
      if(!existingUser){
        const result = await userCollection.insertOne(user);
        res.send(result)
      }
      else{
        res.send({message: 'user already added'})
      }
    })
    app.delete('/carts/:id', async (req, res) => {
      const query = {_id: new ObjectId(req.params.id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })
    app.post('/carts', async (req, res) => {
      const query = req.body;
      const result = await cartCollection.insertOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is listening')
})

app.listen(port, (req, res) => {
    console.log(`Server listening on port ${port}`)
})