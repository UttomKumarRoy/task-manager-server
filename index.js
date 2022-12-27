const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion} = require('mongodb');
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
        



        

        app.post('/addTask',  async (req, res) => {
            const task= req.body;
           
            const result = await tasksCollection.insertOne(task);
            res.send(result);
            
           
        });

       
    
        
    }
    finally {

    }

}

run().catch(err => console.error(err));

app.get('/', async (req, res) => {
    res.send('Task Manager Server is running');
})

app.listen(port, () => console.log(`Task Manager Server running on ${port}`))