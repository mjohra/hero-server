const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//
//Database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vamyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("connected to database");
    const database = client.db("hero_rider");

    const usersCollection = database.collection("rider");
    const learnerCollection = database.collection("learner");
    //add rider
    app.post("/rider", async (req, res) => {
      const user = req.body;

      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //add learner
    app.post("/learner", async (req, res) => {
      const user1 = req.body;
      console.log("hit the post api", user1);
      const result1 = await learnerCollection.insertOne(user1);
      console.log(result1);
      res.json(result1);
    });

    //get rider
    app.get("/rider", async (req, res) => {
      const cursor = usersCollection.find({});
      const order = await cursor.toArray();
      res.send(order);
    });
    //get learner
    app.get("/learner", async (req, res) => {
      const cursor = learnerCollection.find({});
      const order = await cursor.toArray();
      res.send(order);
    });

    //stripe
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    });
  } finally {
    //await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running product server");
});

app.listen(port, () => {
  console.log("running niche product server on port", port);
});
