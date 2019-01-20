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

//Teacher Routes (By Antoine)
// app.get('/teacher/:id', (req, res) => {
//     models.user.findById(
//         {
//             _id: req.params.id
//         }, (error, user) => {
//             if (error) {
//                 console.error(error);
//                 res.status(500).send('something bad happened :(');
//             } else {
//                 res.render('teacher.html', { user: user, roles: user.roles })
//             }
//         }
//     )
// });

// app.get('/teachers', (req, res) => {
//     models.user.find(
//         { roles: ['teacher'] },
//         (error, user) => {
//             if (error) {
//                 console.error(error);
//                 res.status(500).send('something bad happened :(');
//             } else {
//                 res.render('teachers.html', { teachers: user })
//             }
//         }
//     )
// });

// app.post('/teacher', (req, res) => {
//     models.user.create(
//         {
//             first_name: req.body.first_name,
//             name: req.body.name,
//             pwd: req.body.pwd,
//             mail: req.body.mail,
//             roles: ["teacher"],
//         }, (error, user) => {
//             if (error) {
//                 console.error(error);
//                 res.status(500).send('something bad happened :(');
//             } else {
//                 res.render('teacher.html', { user: user, roles: user.roles })
//             }
//         }
//     )
// });
// app.delete('/teacher', (req, res) => {
//     models.user.deleteOne(
//         { name: req.body.name, roles: req.body.roles },
//         (error, user) => {
//             if (error) {
//                 console.error(error);
//                 res.status(500).send('something bad happened :(');
//             } else {
//                 res.render('teacher.html', { user: user, roles: user.roles })
//             }
//         }
//     )
// });

// app.all('/teacher/:id', (req, res) => {

// });

// app.all('/class/:id', (req, res) => {

// });

// app.all('/subject/:id', (req, res) => {

// });

//Notes Routes 
app.all('/notes', (req, res) => {
    let new_marks = [];
    for (let i = 0; i < 10; i++) {
        new_marks.push(new models.mark({
            student: {
                ref: '5c0fa37afb18884a04f07ba2',
                name: 'Théodore Orfèvres'
            },
            teacher: null,
            subject: null,
            score: Math.round(Math.random() * 20),
            score_max: 20,
            coefficient: Math.round(Math.random() * 2 + 1),
            date: Date.now()
        }));
    }
    new_marks.forEach(m => {
        m.save(err => {
            if (err) console.error(err);
        });
    });
    res.send('OK')
});

//Students Routes 
app.get('/student', (req, res) => {
    models.user.find({ roles: ['student'] }, (err, students) => {
        if (err) {
            res.status(500).send('something bad happened :(');
        } else {
            models.mark.aggregate([
                {
                    $project: {
                        _id: '$student.ref',
                        coefficient: true,
                        score: {
                            $multiply: [
                                {
                                    $divide: [
                                        {
                                            $multiply: [
                                                20,
                                                '$score'
                                            ]
                                        },
                                        '$score_max'
                                    ]
                                },
                                '$coefficient'
                            ]
                        }
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        sum_score: {
                            $sum: '$score'
                        },
                        sum_coefficient: {
                            $sum: '$coefficient'
                        }
                    }
                }, {
                    $project: {
                        _id: true,
                        average: {
                            $divide: [
                                {
                                    $trunc: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    '$sum_score',
                                                    '$sum_coefficient'
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                },
                                100
                            ]
                        }
                    }
                }
            ], (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('something bad happened :(');
                } else {
                    results.forEach(r => {
                        let index = students.findIndex(s => s._id.toString() === r._id);
                        if (index !== -1) students[index].average = r.average;
                    });
                    console.log(students)
                    res.render('students.html', { students: students });
                }
            });
        }
    })
});

app.get('/student/:id?', (req, res) => {
    if (req.params.id) {
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
    }
});

app.post('/student/:id?', (req, res) => {
    if (req.body.action === "UPDATE" || req.body.action === "CREATE") {
        let tempId = req.params.id ? req.params.id : new ObjectId()
        models.user.findOneAndUpdate(
            {
                _id: tempId
            }, {
                $set: {
                    first_name: req.body.first_name,
                    name: req.body.name,
                    pwd: req.body.pwd,
                    mail: req.body.mail,
                    roles: ["student"],
                }
            },
            { upsert: true },
            (error, user) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/student/' + tempId)
                }
            }
        );
    } else if (req.body.action == "DELETE") {
        models.user.remove(
            {
                _id: req.params.id
            }, (error) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/student/')
                }
            }
        );
    }
});


//Teachers Routes 
app.get('/teacher', (req, res) => {
    //TODO : link to subjects
    models.user.find(
        { roles: ['teacher'] },
        (error, user) => {
            if (error) {
                console.error(error);
                res.status(500).send('something bad happened :(');
            } else {
                res.render('teachers.html', { teachers: user })
            }
        }
    )
});

app.get('/teacher/:id?', (req, res) => {
    if (req.params.id) {
        models.user.findById(
            req.params.id,
            (error, user) => {
                if (error) {
                    res.status(500).send('something bad happened :(');
                } else {
                    models.mark.find(
                        { teacher: user._id },
                        (error, marks) => {
                            if (error) {
                                res.status(500).send('something bad happened :(');
                            } else {
                                res.render('teacher.html', { user: user, marks: marks });
                            }
                        }
                    );
                }
            }
        );
    }
});

app.post('/teacher/:id?', (req, res) => {
    if (req.body.action === "UPDATE" || req.body.action === "CREATE") {
        let tempId = req.params.id ? req.params.id : new ObjectId();
        models.user.findOneAndUpdate(
            {
                _id: tempId
            }, {
                $set: {
                    first_name: req.body.first_name,
                    name: req.body.name,
                    pwd: req.body.pwd,
                    mail: req.body.mail,
                    roles: ["teacher"],
                }
            },
            { upsert: true },
            (error, user) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/teacher/' + tempId)
                }
            }
        );
    } else if (req.body.action == "DELETE") {
        models.user.remove(
            {
                _id: req.params.id
            }, (error) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/teacher/')
                }
            }
        );
    }
});

//Subjects Routes 
app.get('/subject', (req, res) => {
    //TODO : link to teachers
    models.subject.find(
        {},
        (error, user) => {
            if (error) {
                console.error(error);
                res.status(500).send('something bad happened :(');
            } else {
                res.render('subjects.html', { subjects: user })
            }
        }
    )
});

app.get('/subject/:id?', (req, res) => {
    if (req.params.id) {
        models.subject.findById(
            req.params.id,
            (error, subject) => {
                if (error) {
                    res.status(500).send('something bad happened :(');
                } else {
                    res.render('subject.html', { subject: subject });
                }
            }
        );
    }
});

app.post('/subject/:id?', (req, res) => {
    if (req.body.action === "UPDATE" || req.body.action === "CREATE") {
        let tempId = req.params.id ? req.params.id : new ObjectId();
        models.subject.findOneAndUpdate(
            {
                _id: tempId
            }, {
                $set: {
                    name: req.body.name,
                }
            },
            { upsert: true },
            (error, user) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/subject/' + tempId)
                }
            }
        );
    } else if (req.body.action == "DELETE") {
        models.subject.remove(
            {
                _id: req.params.id
            }, (error) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/subject/')
                }
            }
        );
    }
});


// Classes Routes
app.get('/class', (req, res) => {
   models.class.find(
       {},
       (error, _class) => {
           if (error) {
               console.error(error);
               res.status(500).send('something bad happened :(');
           } else {
               res.render('classes.html', { classes: _class })
           }
       }
   )
});

app.get('/class/:id?', (req, res) => {
    if (req.params.id) {
        models.class.findById(
            req.params.id,
            (error, _class) => {
                if (error) {
                    res.status(500).send('something bad happened :(');
                } else {
                    res.render('class.html', { class: _class });
                }
            }
        );
    }
});

app.post('/class/:id?', (req, res) => {
    if (req.body.action === "UPDATE" || req.body.action === "CREATE") {
        let tempId = req.params.id ? req.params.id : new ObjectId();
        models.class.findOneAndUpdate(
            {
                _id: tempId
            }, {
                $set: {
                    name: req.body.name,
                    level: req.body.level,
                }
            },
            { upsert: true },
            (error, _class) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/class/' + tempId)
                }
            }
        );
    } else if (req.body.action == "DELETE") {
        models.class.remove(
            {
                _id: req.params.id
            }, (error) => {
                if (error) {
                    res.status(500).send("something bad happened :'(")
                } else {
                    res.redirect('/class/')
                }
            }
        );
    }
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
    mongoose.connect(config.get('mongoose.url'), { useNewUrlParser: true })
        .then(
            () => console.log('Connected to database!'),
            err => console.log('Unable to connect to database...\n', err)
        )
        .catch(err => console.log('Unable to connect to database...\n', err));
}