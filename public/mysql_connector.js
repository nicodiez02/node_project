import mysql from 'mysql';

const connector = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "",
        database: "dashboard"
    }
);

connector.connect(err => {
    if (err) throw err;
})

export { connector };