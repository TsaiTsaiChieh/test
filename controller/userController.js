const userModel = require('../model/userModel');

function signup(req, res) {
    let { email, password } = req.body;
    email = email.replace(/\s+/g, ""); // 過濾掉電子郵件的空格
    userModel.signup(email, password).then(function (body) {
        res.status(200);
        res.json(body);
    })
        .catch(function (err) {
            res.status(err.code);
            res.send(err.error);
        });
}
function login(req, res) {
    let { email, password, provider, name, picture } = req.body;
    userModel.login(provider, email, password, name, picture).then(function (body) {
        console.log(body);
        res.json(body);
    }).catch(function (err) {
        res.status(err.code);
        res.send(err.error);
    });
}
module.exports = {
    signup, login
}