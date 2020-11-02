"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var express = require('express');

var bodyParser = require('body-parser');

var cors = require('cors');

var _require = require('pg'),
    Client = _require.Client;

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
          console.log(req.body);
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
          console.log(_typeof(route_s));
          client.query(insert_query, [start_landmark, start_landmark_type, end_landmark, end_landmark_type, route_s], function (error) {
            if (error) {
              console.log(error);
            }

            res.status(201).send("route added");
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  });
});
app.listen(5000, function () {
  console.log('App listening at port 5000...');
});