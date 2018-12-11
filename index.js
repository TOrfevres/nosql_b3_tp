console.clear();

const fs = require('fs');
const config = require('config');
const mongoose = require('mongoose');

const app = require('express')();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const ObjectId = require('mongodb').ObjectID;

// Set templating engine
app.engine('html', function (filePath, options, callback) {
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(err);
        return callback(null, require('mustache').to_html(content.toString(), options))
    });
});

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

const utils = require('./utils');
const models = require('./models');
// * NOS ROUTES ***********************************************************************************
app.all('/', (req, res) => {
    res.render('home.html', {});
});
app.all('/teacher/:id', (req, res) => {

});

app.all('/class/:id', (req, res) => {

});

app.all('/subject/:id', (req, res) => {

});

app.get('/students', (req, res) => {
    models.user.find({ roles: ['student'] }, (err, students) => {
        if (err) {
            res.status(500).send('something bad happened :(');
        } else {
            res.render('students.html', { students: students });
        }
    })
});

app.get('/student/:id?', (req, res) => {
    if (req.params.id){
        models.user.findById(
            req.params.id,
            (error, user) => {
                if (error) {
                    res.status(500).send('something bad happened :(');
                } else {
                    models.mark.find(
                        { student: user._id },
                        (error, marks) => {
                            if (error) {
                                res.status(500).send('something bad happened :(');
                            } else {
                                res.render('student.html', { user: user, marks: marks });
                            }
                        }
                    );
                }
            }
        ); 
    } else {
        res.render('student.html', { user: {}, marks: {} });
    }
    
});
app.post('/student/:id?', (req, res) => {
    if (req.body.action == "UPDATE") {
        let tempId = req.params.id ? req.params.id : new ObjectId()
        models.user.findOneAndUpdate(
            {
                _id: tempId
            },
            {
                $set:
                {
                    first_name: req.body.first_name,
                    name: req.body.name,
                    pwd: req.body.pwd,
                    mail: req.body.mail
                }
            },
            { upsert: true },
            (error, user) => {
                if (error) {
                    res.status(500).send("something bad happend :'(")
                } else {
                    res.redirect('/student/' + tempId)
                }
            }
        );
    } else if (req.body.action == "DELETE") {
        models.user.remove(
            {
                _id: req.params.id
            },
            (error, user) => {
                if (error) {
                    res.status(500).send("something bad happend :'(")
                } else {
                    res.redirect('/students/')
                }
            }
        );
    }

})


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
    mongoose.connect(config.get('mongoose.url'), { useNewUrlParser: true })
        .then(
            () => console.log('Connected to database!'),
            err => console.log('Unable to connect to database...\n', err)
        )
        .catch(err => console.log('Unable to connect to database...\n', err));
}