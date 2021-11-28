const mongoose = require('mongoose')

function DbConnect() {
    const DB_URL = process.env.DB_URL;

    //Database Connection
    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection failed', console.error));
    db.once('open', () => {
        console.log('DB Connected....')
    })
}

module.exports = DbConnect;
