const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {Client} = require('pg');
const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));

const session = driver.session();
console.log('Neo4j connected');

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

app.post('/add_landmark', async (req,res) => {

  const l_name = req.body.landmark_name;

  // check if the landmark exists

  const l_type = req.body.landmark_type;

  const village = req.body.village;

  const l_latitude = req.body.latitude;

  const l_longitude = req.body.longitude;

  console.log(l_name);
  console.log(village);
  const result = await session.run(
      'match (v:Village {name: $vi ,state:"Maharastra"}) create (l:Landmark {name: $l_n,type: $l_t,latitude:$l_lat,longitude:$l_long}) - [r:Located_in] -> (v) return l',
      { 
          vi: village,
          l_n : l_name,
          l_t : l_type,
          l_lat : l_latitude,
          l_long : l_longitude
      }
  );

  const singleRecord = result.records[0];

  const node = singleRecord.get(0);
  
  console.log(node.properties.name);

  await session.close();
  
  res.status(201).send("landmark added successfully");
 
});

app.post('/add_route', async (req,res) => {

    
  const route_coordinates = req.body.route;
  console.log(route_coordinates);
  

  const landmark_1 = req.body.start_landmark;

  const landmark_2 = req.body.end_landmark;

  const village_1 = req.body.startVillage;

  const village_2 = req.body.terminalVillage;

  const landmark_1_type = req.body.start_landmark_type;

  const landmark_2_type = req.body.end_landmark_type;


  var coordinates = eval(route_coordinates);

  const nodes = coordinates.length;
  const straight_line_distance = (route_coordinates[nodes-1][0]-route_coordinates[0][0])*(route_coordinates[nodes-1][0]-route_coordinates[0][0])+(route_coordinates[nodes-1][1]-route_coordinates[0][1])*(route_coordinates[nodes-1][1]-route_coordinates[0][1]);
  var route_string = '[';
  route_coordinates.forEach(e=>{
    route_string = route_string + '[' +e[0] + ',' + e[1] + '],'; 
  });
  route_string = route_string.slice(0,route_string.length-1) + ']'
  console.log(route_string);
  console.log(route_coordinates[0][0]);
  console.log(route_coordinates[coordinates.length-1][0]);
  console.log(nodes)
  console.log(landmark_1);
  console.log(landmark_2);
  console.log(village_1);
  console.log(landmark_1_type);
  // await session.run(
  //     "MATCH (v:Village {name: $vi, state: 'Maharastra'}) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)",
  //     { 
  //         vi: village_1,
  //         l_n : landmark_1,
  //         l_t : landmark_1_type,
  //         l_lat : coordinates[0][0],
  //         l_long : coordinates[0][1]
  //     }
  // );

  // await session.run(
  //     "MATCH (v:Village {name: $vi, state: 'Maharastra'}) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)",
  //     { 
  //         vi: village_2,
  //         l_n : landmark_2,
  //         l_t : landmark_2_type,
  //         l_lat : coordinates[nodes-1][0],
  //         l_long : coordinates[nodes-1][1]
  //     }
  // );
  
  // await session.run(
  //     'MATCH (l1:Landmark), (l2:Landmark) WHERE l1.name = $l_1 AND l2.name = $l_2 AND l1.village = $v_1 AND l2.village = $v_2 MERGE (l1)-[r:connected {route_coordinates: $route_coor, straight_line_distance: $straight_dist, nodes: $nodes}]->(l2)',
  //     { 
  //         l_1 : landmark_1,
  //         l_2 : landmark_2,
  //         v_1 : village_1,
  //         v_2 : village_2,
  //         nodes : nodes,
  //         route_coor : route_string,
  //         straight_dist : straight_line_distance,
  //     }
  // );
  
  // res.status(201).send("route stored successfully");
});





app.listen(5000,()=>{
    console.log('App listening at port 5000...')
});