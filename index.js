const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@task-manager.tingwyi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const tasksCollection = client.db('taskManager').collection('tasks');

        app.get('/myTask',  async (req, res) => {
            const email=req.query.email;  
            const status=req.query.status;                    
            const result = await tasksCollection.find({email, status}).toArray();
            res.send(result);   
        });

        app.get('/completedTask',  async (req, res) => {
            const email=req.query.email;  
            const status=req.query.status;                    
            const result = await tasksCollection.find({email, status}).toArray();
            res.send(result);   
        });

        app.post('/addTask',  async (req, res) => {
            const task= req.body;
            const result = await tasksCollection.insertOne(task);
            res.send(result); 
        });

        app.put('/myTask/:id', async (req,res) =>{
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

        app.put('/completedTask/:id', async (req,res) =>{
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

        app.put('/myTaskModal/:id', async (req,res) =>{
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

        app.delete('/myTask/:id', async (req,res) =>{
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