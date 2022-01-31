import bcrypt from 'bcryptjs';
import mercadopago from 'mercadopago'
import { connector } from '../../public/js/mysql_connector.js'

const controller = {};
mercadopago.configure({
    access_token: "APP_USR-1725543642332146-013116-e23cf9999e57ccd3775190d0a50ecf0c-1066155748",
  });


controller.login_redirect = async (req, res) => {
    if (req.session.loggedin && req.session.rol == 'User') {

        const SQL = "SELECT * FROM products";
        connector.query(SQL, (err,result) =>{
            if(err){
                throw err;
            }else{
                res.render('products',
                {
                    Rol: req.session.rol,
                    Username: req.session.username,
                    Loggedin: true,
                    Productos: result
                }
            );
            }
        })


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
    const SQL = "SELECT * FROM products";

    connector.query(SQL, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.render('products', { Products: result })
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

controller.buy = async (req, res) => {
    let data = req.body;
    let items_array = [];

    for(let i = 0; i < data.length; i++){
        let title = data[i].title;
        let price = Number(data[i].unit_price.replace('$', ''));
        let quantity = Number(data[i].quantity);
        items_array[i] = {title: title, unit_price: price, quantity: quantity};
    }

    let preference = {
		items: items_array,
		back_urls: {
			"success": "http://localhost:3001/products",
			"failure": "http://localhost:3001/products",
			"pending": "http://localhost:3001/products"
		},
		auto_return: "approved",
	};

    mercadopago.preferences.create(preference).then(function (response) {
        res.send(response.body.id)
        // res.json({
        //     id: response.body.id
        // });
    }).catch(function (error) {
        console.log(error);
    });

}

controller.get_success = (req,res) =>{
    res.render('succes');
}

controller.get_cancel = (req,res) =>{
    res.render('cancel');
}

export { controller }