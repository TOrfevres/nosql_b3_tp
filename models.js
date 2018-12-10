let mongoose = require('mongoose');

module.exports = {
    user: mongoose.model(
        'user',
        new mongoose.Schema({
            name: String,
            pwd: String
        })
    )
};