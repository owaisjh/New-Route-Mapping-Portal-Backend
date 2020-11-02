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
    host:'localhost',
    database:'MapifyDb',
    password: 'Vjti@1234',
    port:5432,
});

client.connect();

app.get('/',(req,res)=>{
   res.send('<h1>Hello World!</h1>')
})

app.post('/storeLandmark', async (req,res) => {
    // console.log(req.body);
    // const data = JSON.parse(req.body);
    const l_name = req.body.landmark_name;

    const l_type = req.body.landmark_type;

    const l_latitude = req.body.latitude;

    const l_longitude = req.body.longitude;

    // console.log(l_name);
    // console.log(l_type);
    // console.log(l_latitude);
    // console.log(l_longitude);
    const insert_query = 'INSERT INTO landmark(landmark_name,landmark_type,landmark_location) VALUES($1,$2,Point($3,$4))'

    client.query(insert_query,[l_name,l_type,l_latitude,l_longitude],
        (error) => {
            if (error) {
              console.log(error);
            }
            res.status(201).send("landmark added");
          });
    });


app.post('/storeRoutes',async (req,res)=>{

    // function point (e) {
    //     return (e[0], e[1]);
    // }
    // console.log(req.body);
    const route = req.body.route;
    // const temp = '{"(1,2)","(2,3)"}';
    // console.log(typeof(route));
    const end_landmark = req.body.end_landmark;
    const end_landmark_type = req.body.end_landmark_type;
    const start_landmark = req.body.start_landmark;
    const start_landmark_type = req.body.start_landmark_type;
    const insert_query = 'INSERT INTO routes(start_landmark,start_landmark_type,end_landmark,end_landmark_type,route) VALUES($1,$2,$3,$4,$5)'
    let route_s = '{';
    route.forEach(element => {
        route_s = route_s + '"(' + element[0] + ','+ element[1] + ')",';
    });
    
    route_s = route_s.slice(0,route_s.length-1) + '}';

    
    client.query(insert_query,[start_landmark,start_landmark_type,end_landmark,end_landmark_type,route_s],
        (error) => {
            if (error) {
              console.log(error);
            }
            res.status(201).send("route added");
          });
});



app.listen(5000,()=>{
    console.log('App listening at port 5000...')
});