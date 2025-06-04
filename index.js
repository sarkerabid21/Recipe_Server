const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gc9ahnr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    
    // await client.connect();

    const recipesCollection = client.db('recipeDB').collection('recipes')
    const userCollection = client.db('recipeDB').collection('users');


app.get('/recipes', async (req, res) => {
  const { userEmail } = req.query;
  const filter = userEmail ? { userEmail } : {};
  const recipes = await recipesCollection.find(filter).toArray();
  res.send(recipes);
});

app.get('/recipes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const recipe = await recipesCollection.findOne({ _id: new ObjectId(id) });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.send(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});



app.post('/recipes', async (req, res) => {
  const newRecipe = {
    ...req.body,
    likes: 0,
    likedBy: [],
  };

  const result = await recipesCollection.insertOne(newRecipe);
  res.send(result);
});






app.patch('/recipes/:id/like', async (req, res) => {
  const recipeId = req.params.id;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "User email is required" });
  }

  try {
    const recipe = await recipesCollection.findOne({ _id: new ObjectId(recipeId) });

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    
    if (recipe.userEmail === userEmail) {
      return res.status(403).json({ error: "You cannot like your own recipe" });
    }

    
    if (recipe.likedBy && recipe.likedBy.includes(userEmail)) {
      return res.status(200).json({ message: "Already liked" });
    }

    const updated = await recipesCollection.updateOne(
      { _id: new ObjectId(recipeId) },
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userEmail }
      }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update like' });
  }
});


app.get('/top-recipes', async (req, res) => {
  try {
    const topRecipes = await recipesCollection
      .find()
      .sort({ likes: -1 }) 
      .limit(6)
      .toArray();
    res.send(topRecipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top recipes' });
  }
});
app.delete('/recipes/:id', async (req, res) => {
  const id = req.params.id;
  const result = await recipesCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
app.put('/recipes/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const result = await recipesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
    );
    res.send(result);
});


app.get('/users',async(req,res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
})

app.post('/users', async(req, res) => {
    const userProfile = req.body;
    console.log(userProfile)
    const result = await userCollection.insertOne(userProfile)
    res.send(result)
})





  
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Food food foooooood.')
})

app.listen(port, () => {
  console.log(`Food app listening on port ${port}`)
})