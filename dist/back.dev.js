"use strict";

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
  host: '0.tcp.ngrok.io',
  database: 'MapifyDb',
  password: 'Vjti@1234',
  port: 16434
});
client.connect();
app.get('/', function (req, res) {
  console.log('Hello World!');
  res.send('<h1>Hello World!</h1>');
});
app.post('/storeLandmark', function _callee(req, res) {
  var l_name, l_type, l_latitude, l_longitude, insert_query;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(req.body); // const data = JSON.parse(req.body);

          l_name = req.body.landmark_name;
          l_type = req.body.landmark_type;
          l_latitude = req.body.latitude;
          l_longitude = req.body.longitude;
          console.log(l_name);
          console.log(l_type);
          console.log(l_latitude);
          console.log(l_longitude);
          insert_query = 'INSERT INTO landmark(landmark_name,landmark_type,landmark_location) VALUES($1,$2,Point($3,$4))';
          client.query(insert_query, [l_name, l_type, l_latitude, l_longitude], function (error, results) {
            if (error) {
              console.log(error);
            }

            res.status(201).send("landmark added");
          });

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.listen(5000, function () {
  console.log('App listening at port 5000...');
});