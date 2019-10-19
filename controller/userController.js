/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const userInfoModel = require('../model/userInfoModel');
const userMessageModel = require('../model/userMessageModel');
const userAdoptModel = require('../model/userAdoptModel');
const userAttentionModel = require('../model/userAttentionModel');
const modules = require('../util/modules');
const AWS = require('../util/aws');
const s3 = new AWS.S3();

// for user function: signup, login, profile, update
function signup(req, res) {
  const user = {
    name: req.body.name.replace(/\s+/g, ''),
    email: req.body.email.replace(/\s+/g, ''),
    password: req.body.password.replace(/\s+/g, ''),
  };
  userInfoModel
      .signup(user)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
}

function login(req, res) {
  const user = {
    email: req.body.email.replace(/\s+/g, ''),
    password: `${req.body.password ? req.body.password.replace(/\s+/g, ''):''}`,
    provider: req.body.provider,
    name: req.body.name,
    picture: req.body.picture,
  };
  userInfoModel
      .login(user)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
}

function profile(req, res) {
  userInfoModel
      .profile(req.userId) // get from middleware
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
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
  const upload = modules.multer({
    storage: modules.multer3({
      s3: s3,
      bucket: 'pethome.bucket',
      cacheControl: 'max-age=0', // update immediately
      metadata: function(req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function(req, file, cb) {
        const path = `user-pic/${file.originalname}`;
        cb(null, path);
      },
    }),
  });
  const imageLoad = upload.fields([{name: 'upload-img', maxCount: 1}]);
  imageLoad(req, res, function(err) {
    if (err) {
      res.status(500);
      res.send('S3 server error, please try again later.');
    } else {
      if (JSON.stringify(req.files) === JSON.stringify({})) inputPiture = '';
      else {
      // inputPiture = req.files['upload-img'][0].filename;
        inputPiture = req.files['upload-img'][0].originalname;
      }
      const information = {
        userId: Number.parseInt(req.body.userId),
        name: `${req.body.inputName ? req.body.inputName.replace(/\s+/g, ''):''}`,
        contactMethod: req.body.inputContactMethod,
        picture: inputPiture,
        password: `${req.body.password ? req.body.password.replace(/\s+/g, ''):''}`,
      };
      userInfoModel
          .update(information)
          .then(function(body) {
            res.send(body);
          })
          .catch(function(err) {
            res.status(err.code);
            res.send(err.error);
          });
    }
  });
}
// for adoption function: postAdoption, udateAdoption, getAdoptionList, deteletAdoption
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
  const upload = modules.multer({
    storage: modules.multer3({
      s3: s3,
      bucket: 'pethome.bucket',
      metadata: function(req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function(req, file, cb) {
        const path = `pet-img/${file.originalname}`;
        cb(null, path);
      },
    }),
  });
  const imageLoad = upload.fields([{name: 'petImgs', maxCount: 3}]);
  imageLoad(req, res, function(err) {
    if (err) {
      res.status(500);
      res.send('S3 server error, please try again later.');
    } else {
      userAdoptModel
          .postAdoption(req.body, req.files.petImgs)
          .then(function(body) {
            res.send(body);
          })
          .catch(function(err) {
            res.status(err.code);
            res.send(err.error);
          });
    }
  });
}
function updateAdoption(req, res) {
  const upload = modules.multer({
    storage: modules.multer3({
      s3: s3,
      bucket: 'pethome.bucket',
      metadata: function(req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function(req, file, cb) {
        const path = `pet-img/${file.originalname}`;
        cb(null, path);
      },
    }),
  });
  const imageLoad = upload.fields([{name: 'petImgs', maxCount: 3}]);
  imageLoad(req, res, function(err) {
    if (err) {
      res.status(500);
      res.send('S3 server error, please try again later.');
    } else {
      userAdoptModel
          .updateAdoption(req.body, req.files.petImgs)
          .then(function(body) {
            res.send(body);
          }).catch(function() {
            res.status(err.code);
            res.send(err.error);
          });
    }
  });
}

function getAdoptionList(req, res) {
  // const {authorization} = req.headers;
  // if (authorization) {
  //   const token = authorization.replace('Bearer ', '');
  userAdoptModel
      .getAdoptionList(req.userId)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
  // } else {
  //   res.status(406);
  //   res.send('Null token');
  // }
}

function deleteAdoption(req, res) {
  const {petId} = req.body;
  userAdoptModel
      .deleteAdoption(petId)
      .then(function(body) {
        res.send(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
}
// for attention function: addAttention, getAttentionList, deleteAttention
function addAttention(req, res) {
  const {petId, userId} = req.body;
  userAttentionModel
      .addAttention(petId, userId)
      .then(function(body) {
        res.send(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
}

function getAttentionList(req, res) {
  // const {authorization} = req.headers;
  // if (authorization) {
  //   const token = authorization.replace('Bearer ', '');
  userAttentionModel
      .getAttentionList(req.userId)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
  // } else {
  //   res.status(406);
  //   res.send('Null token');
  // }
}

function deleteAttention(req, res) {
  const {petId, userId} = req.body;
  userAttentionModel
      .deleteAttention(petId, userId)
      .then(function(body) {
        res.send(body);
      }).catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
}
// for message function: getMessageList, sendMessage, getMessage
function getMessageList(req, res) {
  // const {authorization} = req.headers;
  // if (authorization) {
  //   const token = authorization.replace('Bearer ', '');
  userMessageModel
      .getMessageList(req.userId)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
  // } else {
  //   res.status(406);
  //   res.send('Null token');
  // }
}

function getMessage(req, res) {
  // const {authorization} = req.headers;
  // const {petId} = req.query;
  // if (authorization) {
  //   const token = authorization.replace('Bearer ', '');
  userMessageModel
      .getMessage(req.userId, req.query.petId)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
  // } else {
  //   res.status(406);
  //   res.send('Null token');
  // }
}

function sendMessage(req, res) {
  userMessageModel
      .sendMessage(req)
      .then(function(body) {
        res.send(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(err.error);
      });
}

module.exports = {
  signup, login, profile, update, postAdoption,
  updateAdoption, getAdoptionList, deleteAdoption,
  addAttention, getAttentionList, deleteAttention,
  getMessageList, getMessage, sendMessage,
};
