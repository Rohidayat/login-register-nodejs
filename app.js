const express = require("express");
const bodyps = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const database = require("./model/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "view");
app.use(bodyps.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(session({
    secret : "random",
    cookie : {maxAge : 10000},
    saveUninitialized : false,
    resave : false
}))

// GET

app.get("/login", (req, res) => {
    res.render("login", {notif : req.flash("notif")})
});

app.get("/register", (req, res) => {
    res.render("register")
});

// POST

// LOGIN

app.post("/autentikasi", (req, res) => {
    const data = {
        email : req.body.email,
        password : req.body.password
    }

    database.query(`SELECT * FROM admin WHERE email = '${data.email}' AND password = '${data.password}'`, (err, result) => {
        if (result.length > 0) {
            req.flash("notif", `<p class="peringatan hijau">login dengan akun admin</p>`)
            res.redirect("/login")
        }

        if (result.length === 0) {
            database.query(`SELECT * FROM user WHERE email = '${data.email}' AND password = '${data.password}'`, (err, result) => {
                if (result.length > 0) {
                    req.flash("notif", `<p class="peringatan hijau">login dengan akun user</p>`)
                    res.redirect("/login")
                }

                if (result.length === 0) {
                    req.flash("notif", `<p class="peringatan merah">email atau password salah</p>`)
                    res.redirect("/login")
                }
            })
        }
    })
});

// REGISTER

app.post("/insert", (req, res) => {
    const data = {
        nama : req.body.nama,
        email : req.body.email,
        password : req.body.password
    }

    database.query(`SELECT * FROM user WHERE nama = '${data.nama}' AND email = '${data.email}' AND password = '${data.password}'`, (err, result) => {
        if (result.length > 0) {
            req.flash("notif", `<p class="peringatan merah">akun ini sudah di buat silahkan login</p>`)
            res.redirect("/login")
        }

        if (result.length === 0) {
            database.query(`INSERT INTO user (nama, email, password) VALUES ('${data.nama}', '${data.email}', '${data.password}')`, (err, finish) => {
                if (finish) {
                    req.flash("notif", `<p class="peringatan hijau">berhasil mendaftar silahkan Log In</p>`)
                    res.redirect("/login")
                }
        
                if (err) throw err
            })
        }
    })
})

// PORT

app.listen(3000)