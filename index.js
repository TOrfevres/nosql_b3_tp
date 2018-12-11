console.clear();

const fs = require('fs');
const config = require('config');
const mongoose = require('mongoose');

const app = require('express')();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// homepage
app.all('/', (req, res) => {
    res.render('login_register.html', { title: 'Hello world!' });
});

// profile
app.all('/profile', (req, res) => {
    res.render('profile.html', {});
});

// admin panel
app.all('admin', (req, res) => {
    res.render('admin.html', {});
});

// ************************************************************************************************


// * NOSQL ROUTES *********************************************************************************
app.all('/teacher/:id', (req, res) => {

})
app.all('/class/:id', (req, res) => {

})
app.all('/subject/:id', (req, res) => {

})
app.get('/student/:id', (req, res) => {
    models.user.findById(
        req.params.id,
        (error, user) => {
            if (error) {
                console.error(error)
                res.status(500).send("something bad happend :'(")
            } else {
                models.mark.find(
                    {
                        student: user._id
                    },
                    (error, marks) => {
                        if (error) {
                            console.error(error)
                            res.status(500).send("something bad happend :'(")
                        } else {
                            res.render('student.html', { user: user, marks: marks })
                            //res.send(data)  
                        }
                    })
            }
        }
    );
    // let newMark = new mongoose.mark({
    //     student: String,
    //     teacher: String,
    //     subject: String,
    //     score: Number,
    //     scoreMax: Number,
    //     coefficient: Number,
    //     date: Date
    // })
    // newUser.save((error) => {
    //     if (error) console.error(error);
    //     else models.user.findById(
    //         req.params.id,
    //         (error, data) => {
    //             if (error) console.error(error)
    //             else res.send(data);
    //         }
    //     );
    // })

    // models.user.find({},
    //     (error, data) => {
    //         if (error) console.error(error)
    //         else res.send(data);
    //     }
    // );

});
app.post('/student/:id', (req, res) => {
    console.log("OUI", req.body);
    console.log("non", req.body.action);
    if (req.body.action == "UPDATE") {
        console.log("update");
        models.user.findOneAndUpdate(
            {
                _id: req.params.id
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
            {},
            (error, user) => {
                if (error) {
                    console.error(error)
                    res.status(500).send("something bad happend :'(")
                } else {
                    res.redirect('/student/'+req.params.id)
                }
            }
        );
    } else if (req.body.action == "DELETE") {
        console.log("del")
        models.user.remove(
            {
                _id: req.params.id
            },
            (error, user) => {
                if (error) {
                    console.error(error)
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