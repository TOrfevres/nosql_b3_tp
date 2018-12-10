let mongoose = require('mongoose');

module.exports = {
    user: mongoose.model(
        'user',
        new mongoose.Schema({
            first_name: String,
            name: String,
            pwd: String,
            mail: String,
            roles: [String]
        })
    ),
    class: mongoose.model(
        'class',
        new mongoose.Schema({
            name: String,
            level: String,
            students: [String]
        })
    ),
    subject: mongoose.model(
        'subject',
        new mongoose.Schema({
            name: String,
            level: String,
            teachers: [String]
        })
    ),
    mark: mongoose.model(
        'mark',
        new mongoose.Schema({
            student: String,
            teacher: String,
            subject: String,
            score: Number,
            scoreMax: Number,
            coefficient: Number,
            date: Date
        })
    )
};