import express from 'express';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import { log } from 'console';

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const publicpath = path.resolve('./public');
app.use(express.static(publicpath));

const dbName = 'node_todo';
const collectionName = 'todo';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url)

const connection = async () => {
  const connect = await client.connect()
  return await connect.db(dbName)
}

app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.find().toArray();
  // console.log(result);
  res.render('listTask', {result});
});

app.get('/add', (req, res) => {
  res.render('addTask');
});

app.post('/add', async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = collection.insertOne(req.body);

  if(result) {
    // res.send('Task added successfully');
    res.redirect('/');
  } else {
    // res.send('Error adding task');
    res.redirect('/add');
  }
}); 

app.get('/update', (req, res) => {
  res.render('updateTask');
}); 

// app.post('/update', (req, res) => {
//   res.redirect('/');
// }); 


app.get('/delete/:id', async (req,res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const id = req.params.id;
  const deleteResult =  collection.deleteOne({_id : new ObjectId(id)})
  if(deleteResult) {
    res.redirect('/');
  } else {
    res.send('Error deleting task');
  }
})

app.get('/update/:id', async (req,res) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  const id = req.params.id;
  const getResult = await collection.findOne({_id : new ObjectId(id)})
  console.log(getResult);
  if(getResult){
    res.render('updateTask', {getResult});
  } else {
    res.send('Error finding task');
  }
  // res.send(getResult)
})

app.post('/update/:id', async (req,res) => {

  const db = await connection();
  const collection = db.collection(collectionName);

  const id = req.params.id;
  const filter = {_id : new ObjectId(id)}
  const updateData = {$set: {title: req.body.title, description : req.body.description}}
  const updateResult = await collection.updateOne(filter, updateData)

  if(updateResult) {
    res.redirect('/');
  } else {
    res.send('Error updating task');
  }
})

app.post('/multi-delete', async (req,res) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  let selectedTask;   
  // console.log(req.body.selectedTask);
 if(Array.isArray(req.body.selectedTask)){
     selectedTask = req.body.selectedTask.map((id) => new ObjectId(id))
    console.log(selectedTask);
 } else {
     selectedTask = [new ObjectId(req.body.selectedTask)]
 }

  const deleteMeny = await collection.deleteMany({_id: {$in: selectedTask}})
  // res.send("ok")

  if(deleteMeny) {
    res.redirect('/');
  } else {
    res.send('Error deleting tasks');
  }
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});