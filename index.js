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



function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}


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

    //Verify Admin Role
    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await adminsCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "Forbidden" });
      }
    };

    //API to post a user
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log("user", user);
      const query = {
        email: email
      };
      const options = {
        upsert: true,
      };
      const updatedDoc = {
        $set: {
          email: user?.email,
          role: user?.role,
        },
      };
      const result = await usersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //API to update a user
    app.put("/update/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log("user", user);
      const query = {
        email: email
      };
      const options = {
        upsert: true,
      };
      const updatedDoc = {
        $set: {
          displayName: user?.displayName,
          institution: user?.institution,
          phoneNumber: user?.phoneNumber,
          address: user?.address,
          dateOfBirth: user?.dateOfBirth
        },
      };
      const result = await usersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //API to make Admin
    app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          email: email,
          role: "admin"
        },
      };
      const result = await adminsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //API to remove admin
    app.delete("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await adminsCollection.deleteOne(filter);
      res.send(result);
    }
    );

    //API to get admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await adminsCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });

    //API to get all admin
    app.get("/admin", async (req, res) => {
      const admins = await adminsCollection.find({}).toArray();
      res.send(admins);
    });

    //API to get all users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find({}).toArray();
      res.send(users);
    });

    //API to get single user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      res.send(user);
    });

    //Authentication API
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // API to Run Server
    app.get("/", async (req, res) => {
      res.send('Hello,Running Computer Parts Manufacturer Server');
    });

    //API to get all products
    app.get("/products", async (req, res) => {
      const products = await productsCollection.find({}).toArray();
      res.send(products);
    });

    //API to get single products
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = await productsCollection.findOne({ _id: ObjectId(id) });
      res.send(product);
    });

    ////API to get all orders
    app.get("/orders", async (req, res) => {
      const orders = await ordersCollection.find({}).toArray();
      res.send(orders);
    });

    //API to update a order
    app.put("/orders/:id", async (req, res) => {
      const orderId = req.params.id;
      const order = req.body;
      console.log("order", order);
      const query = { _id: ObjectId(orderId) };
      const options = { upsert: true };
      const updatedOrder = await ordersCollection.updateOne(
        query,
        {
          $set: order,
        },
        options
      );
      res.send(updatedOrder);
    });


    //API to get all reviews
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsCollection.find({}).toArray();
      res.send(reviews);
    });

    //API to post a review
    app.post("/review", verifyJWT, async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // const email = req.headers.email;
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
      // if (email === decodedEmail) {

      // } else {
      //   res.send("Unauthorized access");
      // }
    });

    //API to post a product
    app.post("/product", async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // const email = req.headers.email;
      const product = req.body;
      console.log("product", product);
      await productsCollection.insertOne(product);
      res.send(product);
    });

    //API delete a product
    app.delete("/product/:id", verifyJWT, async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // const email = req.headers.email;
      const id = req.params.id;
      const result = await productsCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);

    });

    //API to update a tool
    app.put("/product/:id", verifyJWT, async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // const email = req.headers.email;
      const id = req.params.id;
      const product = req.body;
      console.log("product", product);
      const options = { upsert: true };
      const result = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: product },
        options
      );
      res.send(result);

    });

    //API to get blogs

    app.get("/blogs", async (req, res) => {
      const query = {};
      const blogs = await blogsCollection.find(query).toArray();
      res.send(blogs);
    });
  } finally {
    // client.close();
  }
};

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Listening Computer Parts Manufacturer on port ${port}`);
})
