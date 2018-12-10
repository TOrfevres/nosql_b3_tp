console.clear();

const fs = require('fs');
const config = require('config');
const mongoose = require('mongoose');

const app = require('express')();

// Set templating engine
app.engine('html', function (filePath, options, callback) {
    fs.readFile(filePath, function (err, content) {
        if(err) return callback(err);
        return callback(null, require('mustache').to_html(content.toString(),options))
    });
});

app.set('views', __dirname + '/views');
app.set('view engine','html');

const models = require('./models');
// * NOS ROUTES ***********************************************************************************
// homepage
app.all('', (req, res) => {
    res.render('index.html', { title: 'Hello world!' });
});
// ************************************************************************************************

// Run app
app.listen(config.get('server.port'), () => {
    console.log(
        'APP READY!:\n',
        '• Listening on localhost:' + config.get('server.port') + '.\n'
    );
});

// Connect to MongoDB database with mongoose
if (config.get('mongoose.url') !== '') {
    mongoose.connect(config.get('mongoose.url'), {useNewUrlParser: true})
        .then(
            () => console.log('Connected to database!'),
            err => console.log('Unable to connect to database...\n', err)
        )
        .catch(err => console.log('Unable to connect to database...\n', err));
}