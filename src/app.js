import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import bodyParser from 'body-parser';

import MySQLStore from 'express-mysql-session';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { router } from './routes/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = "3001";

var options =
{
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'dashboard'
}

var sessionStore = new MySQLStore(options)

app.listen(PORT, () => {
    console.log("SERVER WORKING");
})

app.engine('hbs', engine
    ({
        extname: ".hbs",
        helpers:
        {
            conditional_helpdesk: (rol) => {
                if (rol == 'Help Desk') {
                    return true;
                } else {
                    return false;
                }
            },
            conditional_admin: (rol) => {
                if (rol == "Administrador") {
                    return true;
                } else {
                    return false;
                }
            }

        }
    }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
    key: 'session_info',
    secret: 'secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(router);









