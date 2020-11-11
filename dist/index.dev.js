"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var cors = require('cors');

var _require = require('pg'),
    Client = _require.Client;

var neo4j = require('neo4j-driver');

var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
var session = driver.session();
console.log('Neo4j connected');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
var client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'MapifyDb',
  password: 'Vjti@1234',
  port: 5432
});
client.connect();
app.get('/', function (req, res) {
  res.send('<h1>Hello World!</h1>');
});
app.post('/storeLandmark', function _callee(req, res) {
  var l_name, l_type, l_latitude, l_longitude, insert_query;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // console.log(req.body);
          // const data = JSON.parse(req.body);
          l_name = req.body.landmark_name;
          l_type = req.body.landmark_type;
          l_latitude = req.body.latitude;
          l_longitude = req.body.longitude; // console.log(l_name);
          // console.log(l_type);
          // console.log(l_latitude);
          // console.log(l_longitude);

          insert_query = 'INSERT INTO landmark(landmark_name,landmark_type,landmark_location) VALUES($1,$2,Point($3,$4))';
          client.query(insert_query, [l_name, l_type, l_latitude, l_longitude], function (error) {
            if (error) {
              console.log(error);
            }

            res.status(201).send("landmark added");
          });

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.post('/storeRoutes', function _callee2(req, res) {
  var route, end_landmark, end_landmark_type, start_landmark, start_landmark_type, insert_query, route_s;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // function point (e) {
          //     return (e[0], e[1]);
          // }
          // console.log(req.body);
          route = req.body.route; // const temp = '{"(1,2)","(2,3)"}';
          // console.log(typeof(route));

          end_landmark = req.body.end_landmark;
          end_landmark_type = req.body.end_landmark_type;
          start_landmark = req.body.start_landmark;
          start_landmark_type = req.body.start_landmark_type;
          insert_query = 'INSERT INTO routes(start_landmark,start_landmark_type,end_landmark,end_landmark_type,route) VALUES($1,$2,$3,$4,$5)';
          route_s = '{';
          route.forEach(function (element) {
            route_s = route_s + '"(' + element[0] + ',' + element[1] + ')",';
          });
          route_s = route_s.slice(0, route_s.length - 1) + '}';
          client.query(insert_query, [start_landmark, start_landmark_type, end_landmark, end_landmark_type, route_s], function (error) {
            if (error) {
              console.log(error);
            }

            res.status(201).send("route added");
          });

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  });
});
app.post('/add_landmark', function _callee3(req, res) {
  var l_name, l_type, village, l_latitude, l_longitude, result, singleRecord, node;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          l_name = req.body.landmark_name; // check if the landmark exists

          l_type = req.body.landmark_type;
          village = req.body.village;
          l_latitude = req.body.latitude;
          l_longitude = req.body.longitude;
          console.log(l_name);
          console.log(village);
          _context3.next = 9;
          return regeneratorRuntime.awrap(session.run('match (v:Village {name: $vi ,state:"Maharastra"}) create (l:Landmark {name: $l_n,type: $l_t,latitude:$l_lat,longitude:$l_long}) - [r:Located_in] -> (v) return l', {
            vi: village,
            l_n: l_name,
            l_t: l_type,
            l_lat: l_latitude,
            l_long: l_longitude
          }));

        case 9:
          result = _context3.sent;
          singleRecord = result.records[0];
          node = singleRecord.get(0);
          console.log(node.properties.name);
          _context3.next = 15;
          return regeneratorRuntime.awrap(session.close());

        case 15:
          res.status(201).send("landmark added successfully");

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app.post('/add_route', function _callee4(req, res) {
  var route_coordinates, landmark_1, landmark_2, village_1, village_2, landmark_1_type, landmark_2_type, coordinates, nodes, straight_line_distance, route_string;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          route_coordinates = req.body.route;
          console.log(route_coordinates);
          landmark_1 = req.body.start_landmark;
          landmark_2 = req.body.end_landmark;
          village_1 = req.body.startVillage;
          village_2 = req.body.terminalVillage;
          landmark_1_type = req.body.start_landmark_type;
          landmark_2_type = req.body.end_landmark_type;
          coordinates = eval(route_coordinates);
          nodes = coordinates.length;
          straight_line_distance = (route_coordinates[nodes - 1][0] - route_coordinates[0][0]) * (route_coordinates[nodes - 1][0] - route_coordinates[0][0]) + (route_coordinates[nodes - 1][1] - route_coordinates[0][1]) * (route_coordinates[nodes - 1][1] - route_coordinates[0][1]);
          route_string = '[';
          route_coordinates.forEach(function (e) {
            route_string = route_string + '[' + e[0] + ',' + e[1] + '],';
          });
          route_string = route_string.slice(0, route_string.length - 1) + ']';
          console.log(route_string);
          console.log(route_coordinates[0][0]);
          console.log(route_coordinates[coordinates.length - 1][0]);
          console.log(nodes);
          console.log(landmark_1);
          console.log(landmark_2);
          console.log(village_1);
          console.log(landmark_1_type); // await session.run(
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

        case 22:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app.listen(5000, function () {
  console.log('App listening at port 5000...');
});