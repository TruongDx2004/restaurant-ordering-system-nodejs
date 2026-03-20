var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const corsConfig = require("./config/cors");

var indexRouter = require('./routes/index');
var authRouter = require("./routes/authRoute");
var userRouter = require("./routes/userRoute");
var categoryRouter = require("./routes/categoryRoute");
var dishRouter = require("./routes/dishRoute");


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(corsConfig);

app.use(logger('dev'));
app.use(express.json({
  strict: false
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/dishes", dishRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {

  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });

});

module.exports = app;
