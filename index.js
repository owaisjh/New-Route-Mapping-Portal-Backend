const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {Client} = require('pg');
const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://4.tcp.ngrok.io:18603', neo4j.auth.basic('neo4j', '12345678')
);

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
    user:'sqxjeczjouzsvi',
    host:'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
    database:'d5fq2297lv7h5a',
    password: '19e7d820cf0070214dcc0dff6f0071cb1ba1803674984aa5712631174fe18de8',
    port:5432,
    ssl:{ rejectUnauthorized: false }
});
client.connect();


app.get('/',(req,res)=>{
   res.send('<h1>Hello World!</h1>')
})

app.post('/storeLandmark', async (req,res) => {
    // console.log(req.body);
    // const data = JSON.parse(req.body);
    console.log(req.body);
    const l_name = req.body.landmark_name;

    const l_type = req.body.landmark_type;

    const l_latitude = req.body.latitude;

    const l_longitude = req.body.longitude;

    // console.log(l_name);
    // console.log(l_type);
    // console.log(l_latitude);
    // console.log(l_longitude);
    const insert_query = 'INSERT INTO landmark(landmark_name,landmark_type,landmark_location,geom) VALUES($1,$2,Point($4,$3),ST_SetSRID(ST_MakePoint($4,$3),4326))';

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
    console.log(route);
    // const temp = '{"(1,2)","(2,3)"}';
    // console.log(typeof(route));
    const end_landmark = req.body.end_landmark;
    const end_landmark_type = req.body.end_landmark_type;
    const start_landmark = req.body.start_landmark;
    const start_landmark_type = req.body.start_landmark_type;
    const insert_query = 'INSERT INTO routes(start_landmark,start_landmark_type,end_landmark,end_landmark_type,route,geom) VALUES($1,$2,$3,$4,$5,ST_GeomFromText( $6 ,4326))';
    let route_s = '{';
    let route_l = 'LINESTRING('
    route.forEach(element => {
        route_s = route_s + '"(' + element[0] + ','+ element[1] + ')",';
        route_l = route_l + element[1] + ' ' + element[0] + ','

    });
        // LINESTRING(19.20 13.40 , 19.21 13.41, )
    route_l = route_l.slice(0,route_l.length-1) + ')'
    console.log(route_l);
    route_s = route_s.slice(0,route_s.length-1) + '}';
  
 
    client.query(insert_query,[start_landmark,start_landmark_type,end_landmark,end_landmark_type,route_s,route_l],
        (error) => {
            if (error) {
              console.log(error);
            }
            res.status(201).send("route added");
          });
});

app.get('/getLandmark', async(req,res)=>{
console.log(req);
const name = req.query.landmark_name;
console.log(name);
console.log('connected');
const select_query = 'SELECT id,landmark_name, ST_AsGeoJSON(geom)::json AS geometry FROM landmark WHERE landmark.landmark_name = $1' ; 
client.query(select_query,[name],(err, result) => {
  if (err) {
      console.error(err);
      return;
  }
  res.json(result.rows);
  // for (let row of result.rows) {
  //     console.log(row);
  //{type:'Feature',
    //properties:{},
  // geometry:{
      //type:'Linetsring',
      //coordinate:{
          //[[lat ,long]]
      });
  
});


app.get('/getAllLandmark', async(req,res)=>{
  
  const select_query = "SELECT row_to_json(fc) AS data FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, row_to_json((id,landmark_name,'false')) As properties,ST_AsGeoJSON(lg.geom)::json As geometry FROM landmark As lg ) As f ) As fc" ; 
  client.query(select_query,[],(err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    res.json(result.rows);
    // for (let row of result.rows) {
    //     console.log(row);
        
    // }
    
  });
});

app.get('/getRoute', async(req,res)=>{

  start_name = req.query.start_name;
  end_name = req.query.end_name;

  const select_query = "SELECT 'Feature' AS type, row_to_json(row(id, start_landmark,start_landmark_type, end_landmark, end_landmark_type)) AS properties , ST_AsGeoJSON(geom)::json AS geometry FROM routes WHERE routes.start_landmark = $1 AND routes.end_landmark = $2"; 
  client.query(select_query,[start_name,end_name],(err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    // console.log(result.rows);
    res.json(result.rows);
    // for (let row of result.rows) {
    //     // console.log(row);
    //     // res.status(201).send(row);
    // }
  });
});


//GraphDB APIs
app.post('/add_landmark', async (req,res) => {

  console.log(req.body);
  const l_name = req.body.landmark_name;
  
  const l_type = req.body.landmark_type;

  const village = req.body.village;

  const l_latitude = req.body.latitude;

  const l_longitude = req.body.longitude;

  console.log(l_name);
  console.log(l_latitude);
  const check_landmark_exists = await session.run(
     "MATCH (l:Landmark {name: $l_n, village: $vi, type: $l_t}) RETURN CASE WHEN l IS NOT NULL THEN true ELSE false END",
    // 'CREATE(p:Person{name:"Owais"}) '
      { 
          l_n : l_name,
          l_t : l_type,
          vi : village
      }
  );

   if (check_landmark_exists.records[0] === undefined){

      await session.run(
          "MATCH (v:Village {name: $vi }) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)",
        //   'CREATE(p:Person{name:"Owais"}) '
          { 
              vi: village,
              l_n : l_name,
              l_t : l_type,
              l_lat : l_latitude,
              l_long : l_longitude
          }
      );

      res.status(201).send("landmark added successfully");
  }
  else{
      res.status(201).send("landmark already added");
  }
  
 
});

app.post('/add_route', async (req,res) => {

  
  const route_coordinates = req.body.route;

  const landmark_1 = req.body.start_landmark;
  
  const landmark_2 = req.body.end_landmark;
      
  const village_1 = req.body.startVillage;
  
  const village_2 = req.body.terminalVillage;
  
  const landmark_1_type = req.body.start_landmark_type;
      
  const landmark_2_type = req.body.end_landmark_type;

  const nodes = route_coordinates.length;

  const straight_line_distance = (route_coordinates[nodes - 1][0] - route_coordinates[0][0]) * (route_coordinates[nodes - 1][0] - route_coordinates[0][0]) + (route_coordinates[nodes - 1][1] - route_coordinates[0][1]) * (route_coordinates[nodes - 1][1] - route_coordinates[0][1]);
  
  route_coordinates_string = '[';
  
  route_coordinates.forEach(function (e) {
      
      route_coordinates_string = route_coordinates_string + '[' + e[0] + ',' + e[1] + '],';
  
  });
  
  route_coordinates_string = route_coordinates_string.slice(0, route_coordinates_string.length - 1) + ']';

  var check_landmark_exists = await session.run(
      "MATCH (l:Landmark {name: $l_n, village: $vi, type: $l_t}) RETURN CASE WHEN l IS NOT NULL THEN true ELSE false END",
      { 
          l_n : landmark_1,
          l_t : landmark_1_type,
          vi : village_1
      }
  );

  if (check_landmark_exists.records[0] === undefined){

      await session.run(
          "MATCH (v:Village {name: $vi}) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)",
          { 
              l_n : landmark_1,
              l_t : landmark_1_type,
              vi : village_1,
              l_lat : route_coordinates[0][0],
              l_long : route_coordinates[0][1]
          }
      );
  }

  check_landmark_exists = await session.run(
      "MATCH (l:Landmark {name: $l_n, village: $vi, type: $l_t}) RETURN CASE WHEN l IS NOT NULL THEN true ELSE false END",
      { 
          l_n : landmark_2,
          l_t : landmark_2_type,
          vi : village_2
      }
  );

  if (check_landmark_exists.records[0] === undefined){

      await session.run(
          "MATCH (v:Village {name: $vi}) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)",
          { 
              l_n : landmark_2,
              l_t : landmark_2_type,
              vi: village_2,
              l_lat : route_coordinates[nodes-1][0],
              l_long : route_coordinates[nodes-1][0]
          }
      );
  }

  await session.run(
      'MATCH (l1:Landmark), (l2:Landmark) WHERE l1.name = $l_1 AND l2.name = $l_2 AND l1.village = $v_1 AND l2.village = $v_2 MERGE (l1)-[r:connected {route_coordinates: $route_coor, straight_line_distance: $straight_dist, nodes: $nodes}]->(l2)',
      { 
          l_1 : landmark_1,
          l_2 : landmark_2,
          v_1 : village_1,
          v_2 : village_2,
          nodes : nodes,
          route_coor : route_coordinates_string,
          straight_dist : straight_line_distance,
      }
  );
  
  res.status(201).send("route stored successfully");
});




app.listen(5000,()=>{
    console.log('App listening at port 5000...')
});