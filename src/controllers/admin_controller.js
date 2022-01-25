import bcrypt from 'bcryptjs';
import { connector } from '../../public/js/mysql_connector.js'

const admin_controller = {}

admin_controller.ajax_table_show = (req, res) => {
    connector.query("SELECT ID, Username, Email, Rol FROM users_nodejs", (err, result) => {
        if (err) {
            throw err;
        } else {
            res.send(result);
        }
    })
}

admin_controller.ajax_table_edit = (req, res) => {
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
}

admin_controller.ajax_table_delete = (req, res) => {
    let id = req.params.id;
    const SQL = "DELETE FROM users_nodejs WHERE ID = ?";

    connector.query(SQL, [id], (err, result) => {
        if (err) {
            throw err;
        } else {
            res.send(result);
        }
    })
}

export { admin_controller }