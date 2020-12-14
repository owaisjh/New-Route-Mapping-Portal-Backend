"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var cors = require('cors');

var _require = require('pg'),
    Client = _require.Client;

var neo4j = require('neo4j-driver');

var driver = neo4j.driver('bolt://4.tcp.ngrok.io:18603', neo4j.auth.basic('neo4j', '12345678'));
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
  user: 'sqxjeczjouzsvi',
  host: 'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
  database: 'd5fq2297lv7h5a',
  password: '19e7d820cf0070214dcc0dff6f0071cb1ba1803674984aa5712631174fe18de8',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
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
          console.log(req.body);
          l_name = req.body.landmark_name;
          l_type = req.body.landmark_type;
          l_latitude = req.body.latitude;
          l_longitude = req.body.longitude; // console.log(l_name);
          // console.log(l_type);
          // console.log(l_latitude);
          // console.log(l_longitude);

          insert_query = 'INSERT INTO landmark(landmark_name,landmark_type,landmark_location,geom) VALUES($1,$2,Point($4,$3),ST_SetSRID(ST_MakePoint($4,$3),4326))';
          client.query(insert_query, [l_name, l_type, l_latitude, l_longitude], function (error) {
            if (error) {
              console.log(error);
            }

            res.status(201).send("landmark added");
          });

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.post('/storeRoutes', function _callee2(req, res) {
  var route, end_landmark, end_landmark_type, start_landmark, start_landmark_type, insert_query, route_s, route_l;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // function point (e) {
          //     return (e[0], e[1]);
          // }
          // console.log(req.body);
          route = req.body.route;
          console.log(route); // const temp = '{"(1,2)","(2,3)"}';
          // console.log(typeof(route));

          end_landmark = req.body.end_landmark;
          end_landmark_type = req.body.end_landmark_type;
          start_landmark = req.body.start_landmark;
          start_landmark_type = req.body.start_landmark_type;
          insert_query = 'INSERT INTO routes(start_landmark,start_landmark_type,end_landmark,end_landmark_type,route,geom) VALUES($1,$2,$3,$4,$5,ST_GeomFromText( $6 ,4326))';
          route_s = '{';
          route_l = 'LINESTRING(';
          route.forEach(function (element) {
            route_s = route_s + '"(' + element[0] + ',' + element[1] + ')",';
            route_l = route_l + element[1] + ' ' + element[0] + ',';
          }); // LINESTRING(19.20 13.40 , 19.21 13.41, )

          route_l = route_l.slice(0, route_l.length - 1) + ')';
          console.log(route_l);
          route_s = route_s.slice(0, route_s.length - 1) + '}';
          client.query(insert_query, [start_landmark, start_landmark_type, end_landmark, end_landmark_type, route_s, route_l], function (error) {
            if (error) {
              console.log(error);
            }

            res.status(201).send("route added");
          });

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
});
app.get('/getLandmark', function _callee3(req, res) {
  var name, select_query;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log(req);
          name = req.query.landmark_name;
          console.log(name);
          console.log('connected');
          select_query = 'SELECT id,landmark_name, ST_AsGeoJSON(geom)::json AS geometry FROM landmark WHERE landmark.landmark_name = $1';
          client.query(select_query, [name], function (err, result) {
            if (err) {
              console.error(err);
              return;
            }

            res.json(result.rows); // for (let row of result.rows) {
            //     console.log(row);
            //{type:'Feature',
            //properties:{},
            // geometry:{
            //type:'Linetsring',
            //coordinate:{
            //[[lat ,long]]
          });

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app.get('/getAllLandmark', function _callee4(req, res) {
  var select_query;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          select_query = "SELECT row_to_json(fc) AS data FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, row_to_json((id,landmark_name,'false')) As properties,ST_AsGeoJSON(lg.geom)::json As geometry FROM landmark As lg ) As f ) As fc";
          client.query(select_query, [], function (err, result) {
            if (err) {
              console.error(err);
              return;
            }

            res.json(result.rows); // for (let row of result.rows) {
            //     console.log(row);
            // }
          });

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app.get('/getRoute', function _callee5(req, res) {
  var select_query;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          start_name = req.query.start_name;
          end_name = req.query.end_name;
          select_query = "SELECT 'Feature' AS type, row_to_json(row(id, start_landmark,start_landmark_type, end_landmark, end_landmark_type)) AS properties , ST_AsGeoJSON(geom)::json AS geometry FROM routes WHERE routes.start_landmark = $1 AND routes.end_landmark = $2";
          client.query(select_query, [start_name, end_name], function (err, result) {
            if (err) {
              console.error(err);
              return;
            } // console.log(result.rows);


            res.json(result.rows); // for (let row of result.rows) {
            //     // console.log(row);
            //     // res.status(201).send(row);
            // }
          });

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
}); //GraphDB APIs

app.post('/add_landmark', function _callee6(req, res) {
  var l_name, l_type, village, l_latitude, l_longitude, check_landmark_exists;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          console.log(req.body);
          l_name = req.body.landmark_name;
          l_type = req.body.landmark_type;
          village = req.body.village;
          l_latitude = req.body.latitude;
          l_longitude = req.body.longitude;
          console.log(l_name);
          console.log(l_latitude);
          _context6.next = 10;
          return regeneratorRuntime.awrap(session.run("MATCH (l:Landmark {name: $l_n, village: $vi, type: $l_t}) RETURN CASE WHEN l IS NOT NULL THEN true ELSE false END", // 'CREATE(p:Person{name:"Owais"}) '
          {
            l_n: l_name,
            l_t: l_type,
            vi: village
          }));

        case 10:
          check_landmark_exists = _context6.sent;

          if (!(check_landmark_exists.records[0] === undefined)) {
            _context6.next = 17;
            break;
          }

          _context6.next = 14;
          return regeneratorRuntime.awrap(session.run("MATCH (v:Village {name: $vi }) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)", //   'CREATE(p:Person{name:"Owais"}) '
          {
            vi: village,
            l_n: l_name,
            l_t: l_type,
            l_lat: l_latitude,
            l_long: l_longitude
          }));

        case 14:
          res.status(201).send("landmark added successfully");
          _context6.next = 18;
          break;

        case 17:
          res.status(201).send("landmark already added");

        case 18:
        case "end":
          return _context6.stop();
      }
    }
  });
});
app.post('/add_route', function _callee7(req, res) {
  var route_coordinates, landmark_1, landmark_2, village_1, village_2, landmark_1_type, landmark_2_type, nodes, straight_line_distance, check_landmark_exists;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          route_coordinates = req.body.route;
          landmark_1 = req.body.start_landmark;
          landmark_2 = req.body.end_landmark;
          village_1 = req.body.startVillage;
          village_2 = req.body.terminalVillage;
          landmark_1_type = req.body.start_landmark_type;
          landmark_2_type = req.body.end_landmark_type;
          nodes = route_coordinates.length;
          straight_line_distance = (route_coordinates[nodes - 1][0] - route_coordinates[0][0]) * (route_coordinates[nodes - 1][0] - route_coordinates[0][0]) + (route_coordinates[nodes - 1][1] - route_coordinates[0][1]) * (route_coordinates[nodes - 1][1] - route_coordinates[0][1]);
          route_coordinates_string = '[';
          route_coordinates.forEach(function (e) {
            route_coordinates_string = route_coordinates_string + '[' + e[0] + ',' + e[1] + '],';
          });
          route_coordinates_string = route_coordinates_string.slice(0, route_coordinates_string.length - 1) + ']';
          _context7.next = 14;
          return regeneratorRuntime.awrap(session.run("MATCH (l:Landmark {name: $l_n, village: $vi, type: $l_t}) RETURN CASE WHEN l IS NOT NULL THEN true ELSE false END", {
            l_n: landmark_1,
            l_t: landmark_1_type,
            vi: village_1
          }));

        case 14:
          check_landmark_exists = _context7.sent;

          if (!(check_landmark_exists.records[0] === undefined)) {
            _context7.next = 18;
            break;
          }

          _context7.next = 18;
          return regeneratorRuntime.awrap(session.run("MATCH (v:Village {name: $vi}) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)", {
            l_n: landmark_1,
            l_t: landmark_1_type,
            vi: village_1,
            l_lat: route_coordinates[0][0],
            l_long: route_coordinates[0][1]
          }));

        case 18:
          _context7.next = 20;
          return regeneratorRuntime.awrap(session.run("MATCH (l:Landmark {name: $l_n, village: $vi, type: $l_t}) RETURN CASE WHEN l IS NOT NULL THEN true ELSE false END", {
            l_n: landmark_2,
            l_t: landmark_2_type,
            vi: village_2
          }));

        case 20:
          check_landmark_exists = _context7.sent;

          if (!(check_landmark_exists.records[0] === undefined)) {
            _context7.next = 24;
            break;
          }

          _context7.next = 24;
          return regeneratorRuntime.awrap(session.run("MATCH (v:Village {name: $vi}) MERGE (l:Landmark {name: $l_n,type: $l_t,village :$vi,latitude: $l_lat,longitude: $l_long}) MERGE (l) - [r:Located_in] -> (v)", {
            l_n: landmark_2,
            l_t: landmark_2_type,
            vi: village_2,
            l_lat: route_coordinates[nodes - 1][0],
            l_long: route_coordinates[nodes - 1][0]
          }));

        case 24:
          _context7.next = 26;
          return regeneratorRuntime.awrap(session.run('MATCH (l1:Landmark), (l2:Landmark) WHERE l1.name = $l_1 AND l2.name = $l_2 AND l1.village = $v_1 AND l2.village = $v_2 MERGE (l1)-[r:connected {route_coordinates: $route_coor, straight_line_distance: $straight_dist, nodes: $nodes}]->(l2)', {
            l_1: landmark_1,
            l_2: landmark_2,
            v_1: village_1,
            v_2: village_2,
            nodes: nodes,
            route_coor: route_coordinates_string,
            straight_dist: straight_line_distance
          }));

        case 26:
          res.status(201).send("route stored successfully");

        case 27:
        case "end":
          return _context7.stop();
      }
    }
  });
});
app.listen(5000, function () {
  console.log('App listening at port 5000...');
});