const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
app.use(express.json())
app.use(cors())


// mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://doctorvai:jw2qo5wJHsPivPy9@cluster0.szfaclu.mongodb.net/?retryWrites=true&w=majority";

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
    // await client.connect();

    // Database
    const Database = client.db('doctor_vai');

    // Collections
    const userCollection = Database.collection('users');
    const bannerCollection = Database.collection('banners');
    const testCollection = Database.collection('tests');
    const reservationCollection = Database.collection('reservations');
    const recommendationCollection = Database.collection('recommendations');


    // -----------------------------------USER------------------------------------
    // Users Api
    app.get('/users', async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })
    // post user
    app.post('/users', async (req, res) => {
      console.log('hitted post api')
      console.log('new user data', req.body)
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    // const NewDistrict = form.district.value;
    // update user 
    app.patch('/users/:email', async (req, res) => {
      const emailP = req.params.email;
      const newInfo = req.body;
      const filter = { email: emailP };
      const updatedDoc = {
        $set: {
          name: newInfo.NewName,
          avatar: newInfo.NewAvatar,
          blood_group: newInfo.NewBlood,
          upazila: newInfo.NewUpazila,
          district: newInfo.NewDistrict
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    // make user status block
    app.patch('/users/block/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: 'blocked'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    //  find status with email
    app.get('/users/block/:email', async (req, res) => {
      const email = req.params.email;

      // if (email !== req.decoded.email) {
      //   return res.status(403).send({ message: 'forbidden access' })
      // }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let blocked = false;
      if (user) {
        blocked = user?.status === 'blocked';
      }
      res.send({ blocked });
    })

    // make user admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    // find admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;

      // if (email !== req.decoded.email) {
      //   return res.status(403).send({ message: 'forbidden access' })
      // }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    // --------------------------------BANNER------------------------------------- 

    // post banner
    app.post('/banners', async (req, res) => {
      const newBanner = req.body;
      const result = await bannerCollection.insertOne(newBanner);
      res.send(result);
    })
    // get all banners
    app.get('/banners', async (req, res) => {
      const result = await bannerCollection.find().toArray();
      res.send(result);
    })
    // delete a banner 
    app.delete('/banners/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bannerCollection.deleteOne(query);
      res.send(result);
    })

    // set a banner for home
    app.patch('/banners/select/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // making all false
      await bannerCollection.updateMany({}, { $set: { isActive: false } });
      const updatedBanner = await bannerCollection.findOneAndUpdate(query, { $set: { isActive: true } }, { new: true })
      res.send(updatedBanner);
    })

    // -----------------------------------TEST------------------------------------

    // get a single test
    app.get('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testCollection.findOne(query);
      res.send(result)
    })
    // post test
    app.post('/tests', async (req, res) => {
      const newTest = req.body;
      const result = await testCollection.insertOne(newTest);
      res.send(result);
    })
    // get all test
    app.get('/tests', async (req, res) => {
      const result = await testCollection.find().toArray();
      res.send(result);
    })
    // // sort all test by date
    // app.get('/tests/sort',async(req,res)=>{
    //   const currentDate = new Date();
    //   const result = await testCollection
    //   .find({ date: { $gte: currentDate.toISOString().split('T')[0] } }) // Filter out records with dates that have already passed
    //   .sort({ date: 1 }) // Sort by date in ascending order
    //   .toArray();
    //   res.send(result)
    // })

    // decrement slot by 1
    app.patch('/tests/slots/:id', async (req, res) => {
      const id = req.params.id;
      const updatedTest = await testCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { slots: -1 } },
        { returnDocument: 'after' });
      res.send({ status: 'Done' })
    })

    // delete a test
    app.delete('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testCollection.deleteOne(query);
      res.send(result);
    })

    // update a test 
    app.patch('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedTest = req.body;
      const updatedDoc = {
        $set: {
          testName: updatedTest.NewTestName,
          imageUrl: updatedTest.NewImageUrl,
          details: updatedTest.NewDetails,
          price: updatedTest.NewPrice,
          date: updatedTest.NewDate,
          slots: updatedTest.NewSlots
        }
      }
      const result = await testCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })



    // ----------------- Pagination part

    app.get('/testsCount', async (req, res) => {
      const count = await testCollection.estimatedDocumentCount();
      res.send({ count });
    })
    app.get('/testsPagination', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      console.log('pagination query', page, size);
      const result = await testCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    })

    // -----------------------------------RESERVATION------------------------------------
    // get all reservations and with email
    app.get('/reservations', async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await reservationCollection.find(query).toArray();
      res.send(result);
    })
    // post a reservation
    app.post('/reservations', async (req, res) => {
      const newReservation = req.body;
      const result = await reservationCollection.insertOne(newReservation);
      res.send(result);
    })
    // cancel or delete a reservation 
    app.delete('/reservations/cancel/:id', async (req, res) => {
      console.log('cancel')
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reservationCollection.deleteOne(query);
      res.send(result);
    })
    // make test status delivered
    app.patch('/reservations/delivered/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          report_status: 'delivered'
        }
      }
      const result = await reservationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    // --------------------------------Recommentions-------------------------------------
    app.get('/recommendations', async (req, res) => {
      const result = await recommendationCollection.find().toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Yeah now the hell MongoDB is connected");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Doctor is sleeping !')
})

app.listen(port, () => {
  console.log(`Yo bro this is working no tension ${port}`)
})