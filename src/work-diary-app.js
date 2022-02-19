const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()

app.use('/public/', express.static(path.join(__dirname + '/public')))

app.use('/plugins', require('./router/plugin.js'))

app.get('/', function (req, res) {
        console.log(getNow() + "$" + req.ip + "#login")
        fs.readFile(path.join(__dirname, "./views/index.html"), (err, data) => {
                if (err) {
                        res.status = 404;
                        res.setHeader('content-type', 'text/plain;charset=utf-8');
                        res.send("404")
                } else {
                        res.status = 200;
                        res.setHeader('content-type', 'text/html;charset=utf-8');
                        res.send(data);
                }
        });
})

app.listen(3000);



function getNow() {
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        if (month < 10) {
                month = "0" + month;
        }
        let day = now.getDate();
        if (day < 10) {
                day = "0" + day;
        }
        let hour = now.getHours();
        let minute = now.getMinutes();
        if (minute < 10) {
                minute = "0" + minute;
        }
        let second = now.getSeconds();
        if (second < 10) {
                second = "0" + second;
        }
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}