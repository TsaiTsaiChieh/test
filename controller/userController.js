const userModel = require('../model/userModel');
const modules = require('../util/modules');
const AWS = require('../private/awsConfig');
const s3 = new AWS.S3();
function signup(req, res) {
    let { name, email, password } = req.body;
    email = email.replace(/\s+/g, ""); // 過濾掉電子郵件的空格
    userModel.signup(name, email, password).then(function (body) {
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
    // let upload = modules.multer({
    //     storage: modules.multer.diskStorage({
    //         destination: "./public/user-pic",
    //         filename: function (req, files, cb) {
    //             cb(null, files.originalname);
    //         }
    //     })
    // }); // 設定添加到 multer 對象
    // AWS S3 setting
    let upload = modules.multer({
        storage: modules.multer3({
            s3: s3,
            bucket: 'pethome.bucket',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                let path = `user-pic/${file.originalname}`;
                cb(null, path);
            }
        })
    });
    let imageLoad = upload.fields([{ name: 'upload-img', maxCount: 1 }]);
    imageLoad(req, res, function (err) {
        let { inputName, inputContactMethod, password, userId } = req.body;
        if (JSON.stringify(req.files) === JSON.stringify({})) inputPiture = null;
        else {
            // inputPiture = req.files['upload-img'][0].filename;
            inputPiture = req.files['upload-img'][0].originalname;
        }
        userModel.update(userId, inputName, inputContactMethod, inputPiture, password).then(function (body) {
            res.send(body);
        }).catch(function (err) {
            res.status(err.code);
            res.send(err.error);
        });
    });
}
function postAdoption(req, res) {
    // let upload = modules.multer({
    //     storage: modules.multer.diskStorage({
    //         destination: './public/pet-img',
    //         filename: function (req, files, cb) {
    //             cb(null, files.originalname);
    //         }
    //     })
    // });
    // AWS S3 setting
    let upload = modules.multer({
        storage: modules.multer3({
            s3: s3,
            bucket: 'pethome.bucket',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                let path = `pet-img/${file.originalname}`;
                cb(null, path);
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
                // userModel.postAdoption(req.body, req.files['petImgs']).then(function (body) {
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
        res.send(body);

    }).catch(function (err) {
        res.status(err.code);
        res.send(err.error);
    })
}
function updateAdoption(req, res) {
    // let upload = modules.multer({
    //     storage: modules.multer.diskStorage({
    //         destination: './public/pet-img',
    //         filename: function (req, files, cb) {
    //             cb(null, files.originalname);
    //         }
    //     })
    // });
    let upload = modules.multer({
        storage: modules.multer3({
            s3: s3,
            bucket: 'pethome.bucket',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                let path = `pet-img/${file.originalname}`;
                cb(null, path);
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
                res.status(err.code);
                res.send(err.error);
            });
        }

    });

}
function sendMessage(req, res) {
    let { senderId, receiverId, petId, senderName, receiverName, message, createTime } = req.body;
    userModel.sendMessage(senderId, receiverId, petId, senderName, receiverName, message, createTime).then(function (body) {
        res.send(body)

    }).catch(function (err) {
        res.status(err.code);
        res.send(err.error);
    });
}
function getMessageList(req, res) {
    let { authorization } = req.headers;
    if (authorization) {
        let token = authorization.replace('Bearer ', '');
        userModel.getMessageList(token).then(function (body) {
            res.json(body);
        })
            .catch(function (err) {
                res.status(err.code);
                res.send(err.error);
            });

    }
}
function getMessage(req, res) {
    let { authorization } = req.headers;
    let { petId, senderId, receiverId } = req.query;
    if (authorization) {
        let token = authorization.replace('Bearer ', '');
        userModel.getMessage(token, petId, senderId, receiverId).then(function (body) {
            res.json(body);
        })
            .catch(function (err) {
                res.status(err.code);
                res.send(err.error);
            });
    }
    else {
        // 重登
    }


}
function addAttention(req, res) {
    let { petId, userId } = req.body;
    userModel.addAttention(petId, userId).then(function (body) {
        res.send(body);
    })
}
function getAttentionList(req, res) {
    let { authorization } = req.headers;
    if (authorization) {
        let token = authorization.replace('Bearer ', '');
        userModel.getAttentionList(token).then(function (body) {
            res.json(body)
        })
            .catch(function (err) {
                res.status(err.code);
                res.send(err.error);
            });

    }
}
function deleteAttention(req, res) {
    let { petId, userId } = req.body;
    userModel.deleteAttention(petId, userId).then(function (body) {
        res.send(body);

    }).catch(function (err) {
        res.status(err.code);
        res.send(err.error);
    })
}

module.exports = {
    signup, login, profile, update, postAdoption,
    getAdoptionList, deleteAdoption, updateAdoption,
    sendMessage, getMessageList, addAttention,
    getAttentionList, getMessage, deleteAttention
}