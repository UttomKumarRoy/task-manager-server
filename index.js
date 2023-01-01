const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@task-manager.tingwyi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const tasksCollection = client.db('taskManager').collection('tasks');

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token})
        })  

        app.get('/myTask', verifyJWT,  async (req, res) => {
            const email=req.query.email;  
            const status=req.query.status; 
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }                   
            const result = await tasksCollection.find({email, status}).toArray();
            res.send(result);   
        });

        app.get('/completedTask', verifyJWT,  async (req, res) => {
            const email=req.query.email;  
            const status=req.query.status; 
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }                    
            const result = await tasksCollection.find({email, status}).toArray();
            res.send(result);   
        });

        app.post('/addTask', verifyJWT, async (req, res) => {
            const task= req.body;
            const result = await tasksCollection.insertOne(task);
            res.send(result); 
        });

        app.put('/myTask/:id', verifyJWT, async (req,res) =>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'completed'
                }
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.put('/completedTask/:id', verifyJWT, async (req,res) =>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'incomplete'
                }
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.put('/comment/:id', verifyJWT, async (req,res) =>{
            const id = req.params.id;
            const task=req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    comment: task.comment
                }
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.put('/myTaskModal/:id', verifyJWT, async (req,res) =>{
            const id = req.params.id;
            const task=req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    taskTitle: task.taskTitle
                }
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.delete('/myTask/:id', verifyJWT, async (req,res) =>{
            const id=req.params.id;
            const result= await tasksCollection.deleteOne({_id:ObjectId(id)});
            res.send(result);
        })

    }
    finally {

    }

}

run().catch(err => console.error(err));

app.get('/', async (req, res) => {
    res.send('Task Manager Server is running');
})

app.listen(port, () => console.log(`Task Manager Server running on ${port}`))

