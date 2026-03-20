const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const viewSsdRouter = require('./routes/viewssd');
const viewCpuRouter = require('./routes/viewcpu');
const viewRamRouter = require('./routes/viewram');
const viewGpuRouter = require('./routes/viewgpu');
const viewGraphRouter = require('./routes/graphView');
const fastMovingRouter = require('./routes/fastmoving');
const viewFastGraphRouter = require('./routes/graphFastmoving');
const viewVisitorAnalyticsRouter = require('./routes/visitoranalytics');

const app = express();
const port = process.env.PORT || 3500;

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html')); 
});

// Serve htmls at respective path
app.get('/ssd', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewssd.html'));
});
app.get('/cpu', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewcpu.html'));
});
app.get('/ram', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewram.html'));
});
app.get('/gpu', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewgpu.html'));
});

app.get('/fssd', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewfastmovingssd.html'));
});
app.get('/fcpu', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewfastmovingcpu.html'));
});
app.get('/fram', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewfastmovingram.html'));
});
app.get('/fgpu', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/viewfastmovinggpu.html'));
});


// Change the base path to their own for API routes
app.use('/ssd', viewSsdRouter);
app.use('/cpu', viewCpuRouter);
app.use('/ram', viewRamRouter);
app.use('/gpu', viewGpuRouter);
app.use('/graphview', viewGraphRouter);
app.use('/fastmoving', fastMovingRouter);
app.use('/graphfastmoving', viewFastGraphRouter);
app.use('/analytics', viewVisitorAnalyticsRouter);

// Error handling
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => console.log(`Listening on port ${port}`));