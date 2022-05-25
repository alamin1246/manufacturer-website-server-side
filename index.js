const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x9k6n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



const run = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDb Successfully");
    const database = client.database("computerPartsManufacturer");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");
    const blogsCollection = database.collection("blogs");
    const adminsCollection = database.collection("admins");


  } finally {
    // client.close();
  }
};

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Listening Computer Parts Manufacturer on port ${port}`);
})
