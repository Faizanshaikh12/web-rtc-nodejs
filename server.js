require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const DbConnnect = require('./db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
const PORT = process.env.PORT || 8000;
DbConnnect();
app.use(express.json());
app.use(router)

app.get('/', (req, res) => {
    res.send('Hello');
})


app.listen(PORT, () => console.log(`Listing on port ${PORT}`));

