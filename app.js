process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const index = require('./routes/index');
const login = require('./routes/login');
const jogos = require('./routes/jogos');
// const { networkInterfaces } = require('os');

const app = express();

pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mega'
});

app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use('/login', login);
app.use('/jogos', jogos);
app.use('/home', index);
app.listen(3000);