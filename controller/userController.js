const userModel = require('../model/userModel');
const modules = require('../util/modules');

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
        res.json(body);
    }).catch(function (err) {
        res.status(err.code);
        res.send(err.error);
    });
}
function profile(req, res) {
    let { authorization } = req.headers;
    if (authorization) {
        let token = authorization.replace('Bearer ', '');
        userModel.profile(token).then(function (body) {
            console.log(body);
            res.json(body);
        })
            .catch(function (err) {
                res.status(err.code);
                res.send(err.error);
            });
    } else {
        res.status(406);
        res.send('Null token');
    }
}

function update(req, res) {
    let upload = modules.multer({
        storage: modules.multer.diskStorage({
            destination: "./public/user-pic",
            filename: function (req, files, cb) {
                cb(null, files.originalname);
            }
        })
    }); // 設定添加到 multer 對象
    let imageLoad = upload.fields([{ name: 'upload-img', maxCount: 1 }]);
    imageLoad(req, res, function (err) {
        let { inputName, inputPhone, userId } = req.body;
        console.log(inputName, inputPhone, userId);

        if (JSON.stringify(req.files) === JSON.stringify({})) inputPiture = 'null';
        // else console.log('::::', req.files['upload-img'][0].filename);
        else inputPiture = req.files['upload-img'][0].filename;
        userModel.update(userId, inputName, inputPhone, inputPiture).then(function (body) {
            res.send(body);
        }).catch(function (err) {
            res.status(err.code);
            res.send(err.error);
        });
    });


}

module.exports = {
    signup, login, profile, update
}