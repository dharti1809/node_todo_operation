import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import multer from 'multer';
import { profile } from 'console';

 const app = express();
 app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const url = 'mongodb://localhost:27017';
const dbName = 'node_todo'; 
const collectionName = 'users_master';
const client = new MongoClient(url);

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'public/img');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
})

const upload = multer({storage})

const connection = async () => {
    const connect = await client.connect();
    return await connect.db(dbName);
}

app.get('/register', (req, res) => {
    res.render('userRegistrationForm');
    // res.send("hio");
});

app.post('/registerData', upload.single('profile_photo'), async (req, res) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    
    console.log(req.file);
    console.log(req.body);

    const userData = {
        fullname: req.body.fullname,
        email: req.body.email,
        mobile_no: req.body.mobile_no,
        gender: req.body.gender,
        dob: req.body.dob,
        address: req.body.address,
        password: req.body.password,
        hobbies: req.body.hobbies,
        profile_photo: req.file ? req.file.filename : null
    };

     const result = await collection.insertOne(userData);
    // const result = await collection.insertOne(req.body);

    if(result) {
        res.redirect('/');
        // res.send('User registered successfully');
    } else {
        res.send('Error registering user');
    }

    // res.send('hio');
});

app.get('/', async (req, res) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const users = await collection.find().toArray();
    res.render('userList', {users});
});

app.get('/delete/:id', async (req, res) => {

    const db =  await connection();
    const collection = db.collection(collectionName);

    const deleteUser = collection.deleteOne({_id : new ObjectId(req.params.id)});

    if(deleteUser) {
        res.redirect('/');
    } else {
        res.send('Error deleting user');
    }
});

app.get('/update/:id', async (req, res) => {

   const db = await connection();
   const collection = await db.collection(collectionName);

   const userData = await collection.findOne({_id : new ObjectId(req.params.id)});

//    console.log(userData);
   if(userData) {
    res.render('updateUserRegistration', {userData});
   } else {
    res.send('Error fetching user data');
   }
// res.send('hio');
}); 

app.post('/updateUser/:id', upload.single('profile_photo'), async (req, res) => {
    
    const db = await connection();
    const collection = db.collection(collectionName);
    
    const id = req.params.id;

    const updateData = {
        fullname: req.body.fullname,
        email: req.body.email,
        mobile_no: req.body.mobile_no,
        gender: req.body.gender,
        dob: req.body.dob,
        address: req.body.address,
        password: req.body.password,
        hobbies: req.body.hobbies,
        profile_photo: req.file ? req.file.filename : null

    }
    const filter = {_id: new ObjectId(id)}

    const updateUser = await collection.updateOne(filter, {$set: updateData});
    
    if(updateUser) {
        res.redirect('/');
    } else {
        res.send('Error updating user');    
    }
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});