console.clear();

const fs = require('fs');
const config = require('config');
const mongoose = require('mongoose');

const app = require('express')();

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
app.all('/teacher/:id', (req, res) => {

});

app.all('/class/:id', (req, res) => {

});

app.all('/subject/:id', (req, res) => {

});

app.get('/student', (req, res) => {
    models.user.find({roles: ['student']}, (err, students) => {
        if (err) {
            console.error(err);
            res.status(500).send('something bad happened :(');
        } else {
            res.render('students.html', {students: students});
        }
    })
});

app.get('/student/:id', (req, res) => {
    models.user.findById(
        req.params.id,
        (error, user) => {
            if (error) {
                console.error(error);
                res.status(500).send('something bad happened :(');
            } else {
                models.mark.find(
                    {student: user._id},
                    (error, marks) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send('something bad happened :(');
                        } else {
                            res.render('student.html', {user: user, marks: marks});
                        }
                    }
                );
            }
        }
    );
    // let newUser = new models.user({
    //     first_name: "Kirian",
    //     name: "Caumes",
    //     pwd: "oui",
    //     mail: "kiki@mail.com",
    //     roles: ["student"]
    // });
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