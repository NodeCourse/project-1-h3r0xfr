const fs = require('fs');
const formidable = require('formidable');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const express = require('express');
require('express-group-routes');
const app = express();

const db = require('./database');
const auth = require('./auth');

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static("public"));

app.locals.moment = require('moment');
app.locals.moment.locale('fr');

app.use(cookieParser(auth.secret));
app.use(session({
    secret: auth.secret,
    resave: false,
    saveUninitialized: false
}));

app.use(auth.passport.initialize())
app.use(auth.passport.session());

function render(req, res, view, params) {
    let data = params;

    if(!params)
        data = {};

    if(req.user) {
        if(auth.routes.noLogin.includes(view))
            return res.redirect('/');
        data.user = req.user;
    }
    else if(auth.routes.needLogin.includes(view)) {
        return res.redirect('/login');
    }

    res.render(view, data);
}

function showError(res, view, message) {
    render(req, res, view, {
        error: message
    });
}

app.get('/', (req, res) => {
    db.Poll.findAll({ include: [db.User] }).then((data) => {
        render(req, res, 'home', {
            polls: data
        });
    });
});

app.get('/poll/:id(\\d+)/', (req, res) => {
    let id = req.params.id;

    db.Poll.findOne({
        where: {id: id},
        include: [db.Answer]
    }).then(function(data) {
        if(!data) {
            res.redirect('/');
        } else {
            render(req, res, 'poll', {
                poll: data
            });
        }
    });
});

app.get('/create', (req, res) => {
    render(req, res, 'create');
});

app.post('/create', (req, res) => {
    let origin = req.headers.origin;
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        let data = JSON.parse(fields.data);
        let url = origin + '/poll/' + data.id;

        render(req, res, 'create_success', {
            poll: data,
            url: url
        });
    });
});

app.get('/login', (req, res) => {
    render(req, res, 'login');
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/register', (req, res) => {
    render(req, res, 'register');
});

app.post('/login', (req, res, next) => {
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {

        req.body = {
            username: fields.username,
            password: fields.password
        };

        auth.passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        })(req, res, next);

    });
});

app.post('/register', (req, res) => {
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        let uFirstname = fields.firstname;
        let uLastname = fields.lastname;
        let uEmail = fields.email;
        let uPassword = fields.password;

        if(uFirstname !== '' && uLastname !== '' && uEmail !== '' && uPassword !== '')
        {
            auth.bcrypt.hash(uPassword, 12, (err, hash) => {
                if(err)
                    return showError(res, 'register', 'Une erreur est survenue lors de la création.');

                db.User.create({
                    firstname: uFirstname,
                    lastname: uLastname,
                    email: uEmail,
                    password: hash
                }).then((result) => {
                    res.redirect('/login?newUser');
                });
            });
        }
        else
            return showError(res, 'register', 'Vous devez compléter tous les champs.');
    });
});

// API endpoint
app.group('/api', (router) => {
    router.group('/poll', (router) => {

        router.post('/:id/answer', (req, res) => {
            let id = req.params.id;
            let form = new formidable.IncomingForm();

            form.parse(req, function (err, fields, files) {
                db.Result.create({
                    answerId: fields.answer,
                    pollId: id
                }).then((result) => {
                    db.Answer.findAll({
                        where: {pollId: result.pollId},
                        include: [db.Result]
                    }).then((results) => {
                        res.json(results);
                    });
                });
            });
        });

        router.post('/new', (req, res) => {
            if(req.user) {
                let form = new formidable.IncomingForm();

                form.parse(req, function (err, fields, files) {
                    db.Poll.create({
                        question: fields.question,
                        description: fields.description,
                        userId: req.user.id
                    }).then((poll) => {
                        if(poll) {
                            let answers = JSON.parse(fields.answers);
                            answers.forEach(function(element) { element.pollId = poll.id; });
                            db.Answer.bulkCreate(answers);
                            res.json(poll);
                        }
                    });
                });
            } else {
                res.json({ error: 'Authentication required' });
            }
        });

    });
});

app.listen(3000);
