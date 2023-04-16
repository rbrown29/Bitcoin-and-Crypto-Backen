
import express from 'express';
import methodOverride from 'method-override';
import session from 'express-session';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import corsAnywhere from 'cors-anywhere';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
const db = mongoose.connection;
const app = express();

app.use(cors());

app.get('/api/news', async (req, res) => {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=bitcoin&apiKey=${process.env.NEWS_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching news data' });
    }
});

app.use(morgan('dev'));

const corsProxy = corsAnywhere.createServer({
    originWhitelist: ['http://localhost:3000', 'https://localhost:3004'],
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
});

app.use('/proxy', (req, res) => {
    req.url = req.url.replace('/proxy/', '/');
    corsProxy.emit('request', req, res);
});

dotenv.config();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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

import commentsController from './controllers/comments.js';
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