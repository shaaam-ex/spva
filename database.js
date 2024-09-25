const creds   = require('./credentials.js');
const sys     = require('./settings.js');
const mysql   = require('mysql');
const moment = require('moment');
const date = require('date-and-time') 
moment().format();

// establish database connection
const con = mysql.createPool({
  host: '127.0.0.1',
  user: creds.MYSQL_USERNAME,
  password: creds.MYSQL_PASSWORD,
  database: sys.DB_NAME,
  multipleStatements: true
});




module.exports = {
  connection: con,

  lookUpUser: (email, cb) => {
    // retrieve user information associated with this email
    con.query('SELECT * FROM users WHERE email = ?;', [email], (err, rows) => {
      if (!err && rows !== undefined && rows.length > 0) {
        // callback on retrieved profile
        cb(err, rows[0]);
      } else {
        cb(err || "Failed to find a user with the given email.");
      }
    });
  },

  /*  Add a new system user account, given the user's Google info.
      Callback on profile of created user. */
  addUserFromGoogle: (user, cb) => {

    // make insert and retrieve inserted profile data (assumes default role is 1)
    con.query('INSERT INTO users (email, name, user_type) VALUES (?, ?, 1); SELECT * FROM users WHERE uid = LAST_INSERT_ID();', [user._json.email, user._json.name], (err, rows) => {
      if (!err && rows !== undefined && rows.length > 1 && rows[1].length > 0) {
        // callback on generated profile
        cb(err, rows[1][0]);
      } else {
        cb(err || "Failed to add a new user from Google account.");
      }
    });
  },

  summaryAllTakeoffs: function (callback) {
    con.query('SELECT * FROM takeoffs;', function (err, takeoffs) {
      if (err) return callback(err);
      callback(null, takeoffs);
    });
  },


  // loads results with is an array with the headers into the table subjects in the database

  loadTakeoffData: function (takeoff_id, results, headers, cb){

      
 [
  'Take out of walls',
  'A-201 - EXTERIOR ELEVATIONS',
  '9/13/2024 8:37',
  '',
  '#80FFFF',
  '59.76',
  `ft' in"`,
  '223.2',
  'sf',
  '507.96',
  'sf',
  '8.5',
  `ft' in"`,
  '0',
  '223.2',
  'sf'
]

    for (var i = 1; i < results.length; i++) {
 
      // format all values in the row and set blank values to zero
      for (var j = 0; j < results[i].length; j++) {
        if (results[i][j] === undefined || results[i][j] === null || results[i][j] === '') {
          results[i][j] = 0;
        } else {
          results[i][j] = results[i][j].trim();
        }
      }

      results[i][2] = moment(results[i][2]).format('YYYY-MM-DD HH:mm:ss');


      //console.log(results[i]);
      console.log("subject: ", results[i][0]);
      console.log("page_label: ", results[i][1]);
      console.log("date: " ,results[i][2]);
      console.log("layer: ", results[i][3]);
      console.log("color: " ,results[i][4]);
      console.log("length: " ,results[i][5]);
      console.log("length_unit: ", results[i][6]);
      console.log("area: ",  results[i][7]);
      console.log("area_unit: " ,results[i][8]);
      console.log("wall_area: " ,parseFloat(results[i][9]));
      console.log("wall_area_unit: " ,results[i][10]);
      console.log("depth: " ,results[i][11]);
      console.log("depth_unit: " ,results[i][12]);
      console.log("count: " ,results[i][13]);
      console.log("measurement: " ,results[i][14]);
      console.log("measurement_unit: " ,results[i][15]);


      con.query('INSERT INTO subjects (takeoff_id, subject, page_label, layer, color, length, length_unit, area, area_unit, wall_area, wall_area_unit, depth, depth_unit, count, measurement, measurement_unit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', 
        [takeoff_id, results[i][0], results[i][1],  results[i][3], results[i][4], 0.0 , results[i][6], results[i][7].trim(2), results[i][8], results[i][9], results[i][10], results[i][11], results[i][12], results[i][13], results[i][14], results[i][15]], function (err) {
        if (err) {
          console.log(err);
          //return cb(err);
        }
      });
      
      }
      //console.log("values", values);


  },




  createNewTakeoff: function (req, res, cb) {
    con.query('INSERT INTO takeoffs (creator_id, name) VALUES (?, ?); SELECT LAST_INSERT_ID() as last;', [req.user.local.id, req.body.takeoffName], function (err, result) {
      if (err) {
        return cb(err);
      }
      console.log("created takeoff", result[1][0].last);
      cb(null, result[1][0].last);
    });
  },

  getTakeoff: function (takeoff_id, callback) {
    con.query('SELECT * FROM takeoffs WHERE id = ?;', [takeoff_id], function (err, takeoff_info) {
      if (err) return callback(err);
          con.query('SELECT * FROM applied_materials WHERE takeoff_id = ?;', [takeoff_id], function (err, measure) {
            if (err){

            } else {        
              callback(null, takeoff_info, measure);
            }
          });
    });
  },

  generateTakeoffMaterials: function (takeoff_id, callback) {
    con.query('SELECT DISTINCT subject from subjects where takeoff_id = ?;', [takeoff_id], function (err, results) {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  sumSFMaterial: function (material_id, takeoff_id, callback) {
    con.query('SELECT subject as material, SUM(measurement) as measurement, measurement_unit  FROM subjects WHERE takeoff_id = ? AND name = ?;', [material, takeoff_id], function (err, results) {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  query: function (sql, args, callback) {
    con.query(sql, args, function (err, results) {
      if (err) return callback(err);
      callback(results);
    });
  },

	
}
