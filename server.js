require('dotenv').config();
const express = require('express');
const router = require('./routes');

const app = express();

const PORT = process.env.PORT || 8000;
app.use(router)

app.get('/', (req, res) => {
    res.send('Hello');
})


app.listen(PORT, () => console.log(`Listing on port ${PORT}`));

