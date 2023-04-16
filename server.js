const express = require('express');
const app = express();
const methodOverride = require('method-override');
const session = require('express-session');
const mongoose = require('mongoose');
const db = mongoose.connection;
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use(cors());

app.use(
    '/newsapi',
    createProxyMiddleware({
      target: 'https://newsapi.org',
      changeOrigin: true,
      pathRewrite: {
        '^/newsapi': '',
      },
    })
  );

const morgan = require('morgan');
app.use(morgan('dev'));

const corsAnywhere = require('cors-anywhere');
const corsProxy = corsAnywhere.createServer({
    originWhitelist: ['http://localhost:3000', 'https://localhost:3004'], 
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
});

app.use('/proxy', (req, res) => {
    req.url = req.url.replace('/proxy/', '/');
    corsProxy.emit('request', req, res);
});

require('dotenv').config();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true});

db.on('error', (err) => console.log(err.message + ' is Mongod not running?'));
db.on('connected', () => console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', () => console.log('mongo disconnected'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

const commentsController = require('./controllers/comments.js');
app.use('/comments', commentsController);

app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Something broke!');
    next();
});

app.use((req, res, next) => {
    console.log('Incoming ${req.method} request to ${req.path}');
    next();
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});