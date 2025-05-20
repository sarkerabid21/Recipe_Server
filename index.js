const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');




app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gc9ahnr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb+srv://<db_username>:<db_password>@cluster0.gc9ahnr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const recipesCollection = client.db('recipeDB').collection('recipes')

    app.get('/recipes',async(req,res)=>{
       const cursor = recipesCollection.find();
       const result = await cursor.toArray();
       res.send(result);
    })


app.post('/recipes',async(req,res)=>{
    const newRecipe = req.body;
    console.log(newRecipe)
    const result = await recipesCollection.insertOne(newRecipe);
    res.send(result);
})


// Get recipe by ID
app.get('/recipes/:id', async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  res.json(recipe);
});

// Update like count
app.patch('/recipes/:id/like', async (req, res) => {
  const updated = await Recipe.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  res.json(updated);
});





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
  res.send('Food food foooooood.')
})

app.listen(port, () => {
  console.log(`Food app listening on port ${port}`)
})