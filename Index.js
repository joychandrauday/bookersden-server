const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsswhi9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const bookCollection=client.db('booksden').collection('allBooks');
    const borrowedBookCollection=client.db('booksden').collection('borrowedBooks');
    const genreCollection=client.db('booksden').collection('genre');



    app.get('/allbooks',async(req,res)=>{
      const cursor=bookCollection.find()
      const result=await cursor.toArray();
      res.send(result)
    })
    app.get('/book/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result= await bookCollection.findOne(query)
      res.send(result)
    })

    app.get('/genre',async(req,res)=>{
      const cursor=genreCollection.find();
      const result=await cursor.toArray()
      res.send(result);
    })
    app.get('/genre/:name', async (req, res) => {
      try {
        const genreName = req.params.name;
        const query = { genre: genreName };
        const result = await bookCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/allbooks',async(req,res)=>{
      const newBook=req.body;
      console.log(newBook)
      const result=await bookCollection.insertOne(newBook);
      res.send(result)
    })
    app.get('/borrowed-books',async(req,res)=>{
      const result=await borrowedBookCollection.find().toArray()
      res.send(result)
    })
    app.get('/borrowed-book/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result= await borrowedBookCollection.findOne(query)
      res.send(result)
    })
    app.get('/borrowed-books',async(req,res)=>{
      let query={};
      if(req.query?.email){
        query={email: req.query.email}
      }
      const result=await borrowedBookCollection.find(query).toArray();
      res.send(result)
    })
    app.post('/borrowed-books',async(req,res)=>{
      const borrowedBook=req.body;
      const result=await borrowedBookCollection.insertOne(borrowedBook);
      res.send(result)
    })
    app.patch("/book/:id", async (req, res) => {
    
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const {book_numbers}=req.body
      // const result=await bookingCollection.deleteOne(query)
      const updateDoc={
        $set:{
          book_numbers
        },
      };
      const result=await bookCollection.updateOne(query,updateDoc)
      res.send(result)
    });
    app.put("/book/update/:id", async (req, res) => {
    
      const id=req.params.id;
      const filter={_id: new ObjectId(id)}
      const options={upsert:true}
      const updatedDes=req.body;
      const book={
        $set:{
          image: updatedDes.image,
          book_name: updatedDes.book_name,
          genre: updatedDes.genre,
          book_numbers: updatedDes.book_numbers,
          short_description: updatedDes.short_description,
          author: updatedDes.author,
          rating: updatedDes.rating,
        }
      }
      const result=await bookCollection.updateOne(filter,book,options);
      res.send(result);
    });
    
    app.delete('/borrowed-book/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result=await borrowedBookCollection.deleteOne(query)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get('/',async(req,res)=>{
    res.send('Bookersden Library server is running...')
})
app.listen(port,()=>{
    console.log(`Library server ins running in port ${port}`)
})