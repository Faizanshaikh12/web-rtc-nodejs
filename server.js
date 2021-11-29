require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const DbConnnect = require('./db');
const cors = require('cors');
const cookieParser = require('cookie-parser')

app.use(cookieParser())
const corsOptions = {
    credentials: true,
    origin: ['http://localhost:3000']
}
app.use(cors(corsOptions));
app.use('/storage', express.static('storage'));
const PORT = process.env.PORT || 8000;
DbConnnect();
app.use(express.json({limit: '120mb'}));
app.use(router)

app.get('/', (req, res) => {
    res.send('Hello');
})


app.listen(PORT, () => console.log(`Listing on port ${PORT}`));
