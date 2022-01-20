import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';

import MySQLStore from 'express-mysql-session';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Swal from 'sweetalert2';
import { readdirSync } from 'fs';
import bcryptjs from 'bcryptjs';
import { connect } from 'http2';
import { connector } from './public/mysql_connector.js'

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
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

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

app.post('/auth', async (req, res) => {
    var username = req.body.user;
    var password = req.body.pass;

    let passwordHash = await bcrypt.hash(password, 8);

    const SQL = 'SELECT Username, Password, Rol FROM users_nodejs WHERE Username = ?';

    if (username && password) {
        connector.query(SQL, [username], async (error, result, fields) => {
            if (result.length == 0 || !(await bcrypt.compare(password, result[0].Password))) {
                res.render('login',
                    {
                        alert: true,
                        alertTitle: 'User error',
                        alertMessage: 'User not found, please check yours credentials',
                        alertIcon: 'warning',
                        showConfirmButton: true,
                        time: false,
                        ruta: '/'
                    }
                );
            } else {
                req.session.loggedin = true;
                req.session.username = result[0].Username;
                req.session.rol = result[0].Rol;
                res.render('login',
                    {
                        alert: true,
                        alertTitle: 'Welcome!',
                        alertMessage: 'Logged succesfuly',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        time: 1500,
                        ruta: '/'
                    }
                );
            }
        })
    }
})

app.post('/create_user', async (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    var password_confirm = req.body.password_confirm;
    var email = req.body.email;
    var rol = req.body.rol;
    var route = req.body.route;
    

    if (route == undefined) {
        route = 'register';
    }
    if (rol == null) {
        rol = 'User';
    }

    if (username && password && email && password_confirm && rol) {
        if (password == password_confirm) {

            const SQL_CHECK = "SELECT Username, Password, Rol FROM users_nodejs WHERE Email = ?";

            connector.query(SQL_CHECK, [email], async (error, result, fields) => {

                switch (result.length) {
                    case 0:
                        let password_hash = await bcrypt.hash(password, 8);
                        const SQL_SENTENCE = "INSERT INTO users_nodejs SET ?";
                        connector.query(SQL_SENTENCE, { Username: username, Password: password_hash, Email: email, Rol: rol }, async (err, results) => {
                            if (err) {
                                throw err;
                            } else {
                                res.json(
                                    {
                                       auth: true
                                    }
                                );
                            }
                        })
                        break
                    case 1:
                        res.json({
                            auth: false,
                            username: result[0].Username
                        })
                        break;
                }

            });
        } else {
            res.json({
                password: false
            })
        }
    } else {
        res.json({
            fields: false
        })
    }
});

app.get('/layout-sidenav-light', (req, res) => {
    res.render('layout-sidenav-light');
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
})

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/', (req, res) => {
    if (req.session.loggedin && req.session.rol == 'User') {

        const SQL = "SELECT product_key, name, price, stock FROM products";

        connector.query(SQL, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render('products',
                    {
                        Rol: req.session.rol,
                        Username: req.session.username,
                        Loggedin: true,
                        query: result
                    }
                );
            }
        });

    } else if (req.session.loggedin) {
        res.render('index',
            {
                Rol: req.session.rol,
                Username: req.session.username,
                Loggedin: true
            }
        );

    } else {
        res.render('login',
            {
                Loggedin: false
            }
        );

    }
});

app.get('/charts', (req, res) => {
    if (req.session.loggedin) {
        res.render('charts', {
            Rol: req.session.rol,
            Username: req.session.username,
            Loggedin: true
        });
    } else {
        res.render('logout');
    }
})

app.get('/tables_ajax', (req, res) => {
    connector.query("SELECT ID, Username, Email, Rol FROM users_nodejs", (err, result) => {
        if (err) {
            throw err;
        } else {
            res.send(result);

        }
    })
});

app.put('/tables_ajax/:id', (req, res) => {
    let username = req.body.Username;
    let email = req.body.Email;
    let rol = req.body.Rol;
    let id = req.params.id;

    const SQL = "UPDATE users_nodejs SET Username = ?, Email = ?, Rol = ? WHERE ID = ?";

    connector.query(SQL, [username, email, rol, id], (err, result) => {
        if (err) {
            throw err;
        } else {
            res.send(result);
        }
    })
})

app.delete('/tables_ajax/:id', (req, res) => {
    let id = req.params.id;
    const SQL = "DELETE FROM users_nodejs WHERE ID = ?";

    connector.query(SQL, [id], (err, result) => {
        if (err) {
            throw err;
        } else {
            res.send(result);
        }
    })
})

app.get('/tables', (req, res) => {
    if (req.session.loggedin) {
        res.render('tables',
            {
                Rol: req.session.rol,
                Username: req.session.username,
                Loggedin: true,
            }
        );
    } else {
        res.render('login',
            {
                Loggedin: false
            }
        );

    }
});

app.get('/products', (req, res) => {
    const SQL = "SELECT product_key, name, price, stock FROM products";

    connector.query(SQL, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.render('products', { query: result })
        }
    })


})


