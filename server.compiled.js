"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var express = require('express');

var port = 5000;

var bodyParser = require('body-parser');

var path = require('path');

var app = express();

var server = require('http').createServer(app);

var DataFetcher = require('./models/DataFetcher');

var NewsFetcher = require('./models/NewsFetcher');

var Predictor = require('./models/Predictor');

var cookieParser = require('cookie-parser');

var session = require('express-session');

var User = require('./models/User');

var Stock = require('./models/Stock');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

require('dotenv').config();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'moolians',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}));
app.use(express["static"](path.join(__dirname, 'frontend', 'build')));

if (process.env.NODE_ENV == 'development') {
  app.use('/', express["static"](path.join(__dirname, 'frontend/public')));
} else if (process.env.NODE_ENV == 'production') {
  app.use('/', express["static"](path.join(__dirname, 'frontend/build')));
} // USERS


app.post("/users/register",
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res) {
    var username, firstName, lastName, email, password, user;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            username = req.body.username;
            firstName = req.body.firstName;
            lastName = req.body.lastName;
            email = req.body.email;
            password = req.body.password;
            _context.next = 8;
            return User.create(username, firstName, lastName, email, password);

          case 8:
            user = _context.sent;

            if (user.username != null) {
              req.session.user = user;
              jwt.sign({
                user: user
              }, 'moolians', {
                expiresIn: '30m'
              }, function (err, token) {
                res.status(200).json({
                  // return authentication object back to client
                  user: user,
                  sessionId: req.session.id,
                  token: token,
                  message: "Sign Up Successful!"
                });
              });
            } else {
              res.status(401).send(user);
            }

            _context.next = 15;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);
            res.status(401).send();

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 12]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
app.post("/users/authenticate",
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res) {
    var user;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return User.authenticate(req.body.email, req.body.password);

          case 3:
            user = _context2.sent;

            if (user instanceof User) {
              jwt.sign({
                user: user
              }, 'moolians', {
                expiresIn: '30m'
              }, function (err, token) {
                res.status(200).json({
                  user: user,
                  sessionId: req.session.id,
                  token: token,
                  message: "Sign in Successful!"
                });
              });
            } else {
              res.status(401).send('failed');
            }

            _context2.next = 10;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            res.status(500).send("not a valid user");

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 7]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); // Protected Route - Replace with route for portfolio

app.post("/api/post", verifyToken, function (req, res) {
  jwt.verify(req.token, 'moolians', function (err, data) {
    if (err) {
      res.sendStatus(403);
    } else res.json({
      message: "This Route is protected",
      user: data.user
    });
  });
}); // MiddleWare for Protected Route

function verifyToken(req, res, next) {
  console.log("Verifying");
  var bearerHeader = req.headers['authorization'];

  if (bearerHeader != undefined) {
    var bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    console.log("Sending");
    res.sendStatus(403);
  }
} // ROOT


app.get('/', function (req, res) {
  try {
    res.sendFile(path.join(__dirname + '/frontend/public/index.html'));

    if (process.env.NODE_ENV == 'development') {
      res.sendFile(path.join(__dirname + '/frontend/public/index.html'));
    } else if (process.env.NODE_ENV == 'production') {
      res.sendFile(path.join(__dirname + '/frontend/build/index.html'));
    }
  } catch (err) {
    console.log(err);
  }
}); // FINANCE

app.get('/api/finance/:symbol',
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(req, res) {
    var symbol;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            symbol = req.params.symbol;
            _context3.t0 = res;
            _context3.next = 5;
            return DataFetcher.fetchQuote(symbol);

          case 5:
            _context3.t1 = _context3.sent;

            _context3.t0.json.call(_context3.t0, _context3.t1);

            _context3.next = 12;
            break;

          case 9:
            _context3.prev = 9;
            _context3.t2 = _context3["catch"](0);
            console.log(_context3.t2);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 9]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
app.get('/api/week/:symbol',
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(req, res) {
    var symbol, timeSeries;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            symbol = req.params.symbol;
            _context4.next = 4;
            return DataFetcher.fetchTimeSeriesDaily(symbol, 7);

          case 4:
            timeSeries = _context4.sent;
            res.json(timeSeries);
            _context4.next = 11;
            break;

          case 8:
            _context4.prev = 8;
            _context4.t0 = _context4["catch"](0);
            console.log(_context4.t0);

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 8]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
app.get('/api/prediction/:symbol',
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(req, res) {
    var symbol, data, movingAverage;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            symbol = req.params.symbol;
            _context5.next = 4;
            return DataFetcher.fetchTimeSeriesDaily(symbol, 50);

          case 4:
            data = _context5.sent;
            movingAverage = Predictor.movingAverage(data);
            res.send(movingAverage);
            _context5.next = 12;
            break;

          case 9:
            _context5.prev = 9;
            _context5.t0 = _context5["catch"](0);
            console.log(_context5.t0);

          case 12:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 9]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); // IEX

app.get('/api/company/:symbol',
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(req, res) {
    var symbol, details;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            symbol = req.params.symbol;
            _context6.next = 4;
            return DataFetcher.fetchCompanyDetails(symbol);

          case 4:
            details = _context6.sent;
            res.status(200).json(details);
            _context6.next = 11;
            break;

          case 8:
            _context6.prev = 8;
            _context6.t0 = _context6["catch"](0);
            console.log(_context6.t0);

          case 11:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 8]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); // NEWS

app.get('/api/news/:symbol',
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(req, res) {
    var symbol, details, name, result, articles;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            symbol = req.params.symbol;
            _context7.next = 4;
            return DataFetcher.fetchCompanyDetails(symbol);

          case 4:
            details = _context7.sent;
            name = DataFetcher.getEncodedName(details);
            _context7.next = 8;
            return NewsFetcher.fetchArticles(name);

          case 8:
            result = _context7.sent;
            articles = NewsFetcher.parseArticles(result.articles);
            res.status(200).send(articles);
            _context7.next = 17;
            break;

          case 13:
            _context7.prev = 13;
            _context7.t0 = _context7["catch"](0);
            console.log(_context7.t0);
            res.status(404).send(_context7.t0);

          case 17:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 13]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); // STOCKS

app.get('/api/stocks/:user',
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8(req, res) {
    var userId, result;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            userId = req.params.user;
            console.log(req.params);
            _context8.next = 5;
            return Stock.findByUserId(userId);

          case 5:
            result = _context8.sent;
            console.log("result :", result);
            res.status(200).send(result);
            _context8.next = 13;
            break;

          case 10:
            _context8.prev = 10;
            _context8.t0 = _context8["catch"](0);
            res.statusCode(400);

          case 13:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 10]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}());
app.post('/api/stocks/new',
/*#__PURE__*/
function () {
  var _ref9 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9(req, res) {
    var symbol, amount, userId;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            try {
              symbol = req.body.symbol;
              amount = parseInt(req.body.amount);
              userId = parseInt(req.body.userId);
              Stock.create(symbol, userId, amount);
            } catch (err) {
              console.log("Cannot Add");
            }

          case 1:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); // ERROR?

app.get('*', function (req, res) {
  try {
    if (process.env.NODE_ENV == 'development') {
      res.sendFile(path.join(__dirname + '/frontend/public/index.html'));
    } else if (process.env.NODE_ENV == 'production') {
      res.sendFile(path.join(__dirname + '/frontend/build/index.html'));
    }
  } catch (err) {
    console.log(err);
  }
}); // STOCKS

server.listen(port, function () {
  return console.log("Listening on port: ".concat(port));
});
