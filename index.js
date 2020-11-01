const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {Client} = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


const client = new Client({
    user:'postgres',
    host:'0.tcp.ngrok.io',
    database:'MapifyDb',
    password: 'Vjti@1234',
    port:16434,
});

client.connect();

app.get('/',(req,res)=>{
    console.log('Hello World!')
    res.send('<h1>Hello World!</h1>')
})

app.post('/storeLandmark', async (req,res) => {
    console.log(req.body);
    // const data = JSON.parse(req.body);
    const l_name = req.body.landmark_name;

    const l_type = req.body.landmark_type;

    const l_latitude = req.body.latitude;

    const l_longitude = req.body.longitude;

    console.log(l_name);
    console.log(l_type);
    console.log(l_latitude);
    console.log(l_longitude);
    const insert_query = 'INSERT INTO landmark(landmark_name,landmark_type,landmark_location) VALUES($1,$2,Point($3,$4))'

    client.query(insert_query,[l_name,l_type,l_latitude,l_longitude],
        (error, results) => {
            if (error) {
              console.log(error);
            }
            res.status(201).send("landmark added");
          });
    });


app.listen(5000,()=>{
    console.log('App listening at port 5000...')
});