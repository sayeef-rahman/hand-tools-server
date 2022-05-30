const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//App Express
const app = express();
const port = process.env.PORT || 5000;

//Middlewear
app.use(cors());
app.use(express.json());


//MongoDb URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z6zmp.mongodb.net/?retryWrites=true&w=majority`;

//MongoDb Client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//Function Starts
async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('hand_tools').collection('products');
        const usersCollection = client.db('hand_tools').collection('users');
        const ordersCollection = client.db('hand_tools').collection('orders');
        const reviewCollection = client.db('hand_tools').collection('reviews');

        //get all products from database
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        //get single product information using ID
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singleProduct = await productsCollection.findOne(query);
            res.send(singleProduct);
        });

        //POST to Products collection
        app.post('/products', async (req, res) => {
            const product = req.body;
            const query = { name: product.name };
            const exists = await productsCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, product: exists })
            }
            const result = await productsCollection.insertOne(product);
            return res.send({ success: true, result });
        });

        //Delete single product information using ID
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singleProduct = await productsCollection.deleteOne(query);
            res.send(singleProduct);
        });

        //POST to orders collection
        app.post('/orders', async (req, res) => {
            const orderDetails = req.body;
            const query = { customerEmail: orderDetails.customerEmail, customerMobile: orderDetails.customerMobile, subTotal: orderDetails.subTotal, productID: orderDetails.productID };
            const exists = await ordersCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, orderDetails: exists })
            }
            const result = await ordersCollection.insertOne(orderDetails);
            return res.send({ success: true, result });
        });

        //GET all orders collection
        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders);
        });

        //POST to users collection
        app.post('/users', async (req, res) => {
            const userDetails = req.body;
            const query = { customerEmail: userDetails.customerEmail };
            const exists = await usersCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, userDetails: exists })
            }
            const result = await usersCollection.insertOne(userDetails);
            return res.send({ success: true, result });
        });

        //GET all users collection
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query);
            const myProfile = await cursor.toArray();
            res.send(myProfile);
        });

        //PUT
        // update User Info
        app.put('/users', async (req, res) => {
            const updatedUserInfo = req.body;
            const filter = { customerEmail: updatedUserInfo.customerEmail };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    customerAddress: updatedUserInfo.customerAddress,
                    zipCode: updatedUserInfo.zipCode,
                    customerMobile: updatedUserInfo.customerMobile
                }
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        });

        //get all reviews from database
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //post user review
        app.post('/reviews', async (req, res) => {
            const reviewDetails = req.body;
            const query = { customerEmail: reviewDetails.customerEmail };
            const exists = await reviewCollection.findOne(query);
            if (exists) {
                console.log('already existes');
                return res.send({ success: false, reviewDetails: exists });
            }
            const result = await reviewCollection.insertOne(reviewDetails);
            return res.send({ success: true, result });
        });
    }

    finally {

    }
}

//Class Function
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello From HandTool!')
})

app.listen(port, () => {
    console.log(`Hand Tools App listening on port ${port}`)
})