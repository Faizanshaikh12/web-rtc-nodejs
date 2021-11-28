require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const DbConnnect = require('./db');
const cors = require('cors');

const corsOptions = {
    origin: ['http://localhost:3000']
}
app.use(cors(corsOptions));
const PORT = process.env.PORT || 8000;
DbConnnect();
app.use(express.json());
app.use(router)

app.get('/', (req, res) => {
    res.send('Hello');
})


app.listen(PORT, () => console.log(`Listing on port ${PORT}`));

