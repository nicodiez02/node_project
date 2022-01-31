import bcrypt from 'bcryptjs';
import Stripe from 'stripe';
import { connector } from '../../public/js/mysql_connector.js'

const controller = {};

const stripe = new Stripe('sk_test_51K6zu2DHYsd1tSWCtdiYRbpauyGvW7h7oWioff9wrUzGKTVedETNkjlvLI6mtJdZSrbypjq6A53V26saHMtczaJV00kuQU89vK');
let price_list, product;
let array = [];

controller.login_redirect = async (req, res) => {
    if (req.session.loggedin && req.session.rol == 'User') {

        price_list = await stripe.prices.list({
            limit: 3
        })

        for (let i = 0; i < price_list.data.length; i++) {
            product = await stripe.prices.retrieve(price_list.data[i].id,
                {
                    expand: ['product']
                });
            array[i] = { name: product.product.name, price: product.unit_amount, price_id: product.id }
        }

        res.render('products',
            {
                Rol: req.session.rol,
                Username: req.session.username,
                Loggedin: true,
                Productos: array
            }
        );



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
}

controller.login_auth = async (req, res) => {
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
}

controller.register_createUser = async (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    var password_confirm = req.body.password_confirm;
    var email = req.body.email;
    var rol = req.body.rol;
    var route = req.body.route;
    var check = req.body.check;

    if (route == undefined) {
        route = 'register';
    }

    if (rol == null || rol == undefined) {
        rol = 'User';
    }

    if (check == null || check == undefined) {
        check = false;
    }

    if (username && password && email && password_confirm && rol) {
        if (password == password_confirm) {

            const SQL_CHECK = "SELECT Username, Password, Rol FROM users_nodejs WHERE Email = ?";

            connector.query(SQL_CHECK, [email], async (error, result, fields) => {

                switch (result.length) {
                    case 0:
                        let password_hash = await bcrypt.hash(password, 8);
                        const SQL_SENTENCE = "INSERT INTO users_nodejs SET ?";
                        connector.query(SQL_SENTENCE, { Username: username, Password: password_hash, Email: email, Rol: rol },
                            async (err, results) => {

                                if (error) {
                                    throw error;
                                } else if (check) {

                                    res.render('products',
                                        {
                                            Loggedin: true,
                                            Username: result[0].username
                                        });

                                } else {
                                    res.json(
                                        {
                                            auth: true
                                        }
                                    );
                                }
                            })
                        break;
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
}

controller.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
}

controller.products_noLogin = (req, res) => {
    const SQL = "SELECT product_key, name, price, stock FROM products";

    connector.query(SQL, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.render('products', { query: result })
        }
    })
}

controller.register_view = (req, res) => {
    res.render('register');
}

controller.tables_view = (req, res) => {
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
}

controller.charts_view = (req, res) => {
    if (req.session.loggedin) {
        res.render('charts', {
            Rol: req.session.rol,
            Username: req.session.username,
            Loggedin: true
        });
    } else {
        res.render('logout');
    }
}

controller.create_checkout = async (req, res) => {
    let values = req.body;
    let items = [];

    if(values.price_id instanceof Array){
        for(let i = 0; i < values.price_id.length; i ++){
            items[i] = {price: values.price_id[i], quantity: values.quantity[i]}
        }
    }else{
        items = [{price: values.price_id, quantity: values.quantity}];
    }

    const session = await stripe.checkout.sessions.create({ 
        line_items: items,
        mode: 'payment',
        success_url: 'http://localhost:3001/success',
        cancel_url: 'http://localhost:3001/'
    });
    
    res.redirect(303, session.url);
}

controller.get_success = (req,res) =>{
    res.render('succes');
}

controller.get_cancel = (req,res) =>{
    res.render('cancel');
}

export { controller }