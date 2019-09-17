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
        if (JSON.stringify(req.files) === JSON.stringify({})) inputPiture = 'null';
        else inputPiture = req.files['upload-img'][0].filename;
        userModel.update(userId, inputName, inputPhone, inputPiture).then(function (body) {
            res.send(body);
        }).catch(function (err) {
            res.status(err.code);
            res.send(err.error);
        });
    });
}

function postAdoption(req, res) {
    let upload = modules.multer({
        storage: modules.multer.diskStorage({
            destination: './public/pet-img',
            filename: function (req, files, cb) {
                cb(null, files.originalname);
            }
        })
    });
    let imageLoad = upload.fields([{ name: 'petImgs', maxCount: 3 }]);
    imageLoad(req, res, function (err) {
        if (err) {
            res.status(500);
            res.send('Server error, please try again later.');
        }
        else {
            userModel.postAdoption(req.body, req.files.petImgs).then(function (body) {
                res.send(body);
            })
                .catch(function (err) {
                    res.status(err.code);
                    res.send(err.error);
                });
        }
    });

}
function getAdoptionList(req, res) {
    let { authorization } = req.headers;
    if (authorization) {
        let token = authorization.replace('Bearer ', '');
        userModel.getAdoptionList(token).then(function (body) {
            res.json(body)
        })
            .catch(function (err) {
                res.status(err.code);
                res.send(err.error);
            });

    }
}
function deleteAdoption(req, res) {
    let { petId } = req.body;
    userModel.deleteAdoption(petId).then(function (body) {

        console.log(body);
        res.send(body);

    }).catch(function (err) {
        res.status(err.code);
        res.send(err.error);
    })
}
function updateAdoption(req, res) {
    let upload = modules.multer({
        storage: modules.multer.diskStorage({
            destination: './public/pet-img',
            filename: function (req, files, cb) {
                cb(null, files.originalname);
            }
        })
    });
    let imageLoad = upload.fields([{ name: 'petImgs', maxCount: 3 }]);
    imageLoad(req, res, function (err) {
        if (err) {
            res.status(500);
            res.send('Server error, please try again later.');
        }
        else {
            userModel.updateAdoption(req.body, req.files.petImgs).then(function (body) {
                res.send(body);
            }).catch(function () {

            });
        }
        // console.log('controller',req.body);
        // console.log('controller',req.files);

    });

}
module.exports = {
    signup, login, profile, update, postAdoption, getAdoptionList, deleteAdoption, updateAdoption
}