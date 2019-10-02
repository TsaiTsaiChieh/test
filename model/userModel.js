/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const modules = require('../util/modules');
const mysql = require('../util/db');
const AWS = require('../private/awsConfig');
const s3 = new AWS.S3();
// for user function: signup, login, profile, update
function signup(user) {
  const {name, email, password} = user;
  return new Promise(function(resolve, reject) {
    // 檢查有無重複註冊
    mysql.con.query(`SELECT id FROM user WHERE email='${email}'`, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 14, `Query Error in user Table: ${err}`));
      } else if (result.length !== 0) {
        reject(new modules.Err(406, 16, 'Email duplication registration'));
      } else {
        mysql.con.query('INSERT INTO user SET ?', {provider: 'native', name, email, password}, function(err, result) {
          if (err) {
            reject(new modules.Err(500, 20, `Insert Error in user Table: ${err}`));
          } else {
            const stringData = email + password + Date.now();
            const accessToken = modules.crypto.createHash('sha256').update(stringData, 'utf8').digest('hex');
            const userId = result.insertId;
            const token = {user_id: userId, access_token: accessToken, access_expired: 3600};
            mysql.con.query('INSERT INTO token SET ?', token, function(err, result) {
              if (err) {
                reject(new modules.Err(500, 28, `Insert Error in token Table: ${err}`));
              } else {
                resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, name, email}});
              }
            });
          }
        });
      }
    });
  });
}

function login(user) {
  const {email, password, provider, name, picture} = user;
  return new Promise(function(resolve, reject) {
    // native 登入
    if (provider === 'native') {
      mysql.con.query(`SELECT * FROM user WHERE provider='${provider}' AND email='${email}' AND password='${password}'`, function(err, result) {
        if (err) {
          reject(new modules.Err(500, 47, `Query Error in user Table: ${err}`));
        } else if (result.length === 0) {
          reject(new modules.Err(406, 49, 'Email or password is wrong'));
        } else {
          const userId = result[0].id;
          const name = result[0].name;
          const picture = result[0].picture;
          const stringData = email + result[0].password + Date.now();
          const accessToken = modules.crypto.createHash('sha256').update(stringData, 'utf8').digest('hex');
          const token = {user_id: userId, access_token: accessToken, access_expired: 3600};
          mysql.con.query('INSERT token SET ?', token, function(err, result) {
            if (err) {
              reject(new modules.Err(500, 59, `Insert Error in token Table: ${err}`));
            } else {
              resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, provider, name, email, picture}});
            }
          });
        }
      });
    } else if (provider === 'facebook') {
      // 搜尋有無使用 FB 註冊過
      mysql.con.query(`SELECT id,picture,name FROM user WHERE provider='${provider}' AND email='${email}'`, function(err, result) {
        if (err) {
          reject(new modules.Err(500, 70, `Query Error in user Table: ${err}`));
        } else if (result.length === 0) {// 代表未使用 FB 註冊過
          mysql.con.query('INSERT INTO user SET ?', {provider, name, picture, email}, function(err, result) {
            if (err) {
              reject(new modules.Err(500, 74, `Insert Error in user Table: ${err}`));
            } else {
              const accessToken = modules.crypto.createHash('sha256').update(email + name + Date.now(), 'utf8').digest('hex');
              const userId = result.insertId;
              const token = {user_id: userId, access_token, access_expired: 3600};
              mysql.con.query('INSERT INTO token SET ?', token, function(err, result) {
                if (err) {
                  reject(new modules.Err(500, 81, `Insert Error in token Table: ${err}`));
                } else {
                  resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, provider, name, email, picture}});
                }
              });
            }
          });
        } else if (result.length !== 0) { // 曾經用過 FB 註冊
          const userId = result[0].id;
          const name_ = result[0].name;
          const picture_ = result[0].picture;
          // 不要登入時每次更新資料庫
          // mysql.con.query(`UPDATE user SET name='${name}',picture='${picture}' WHERE id=${user_id}`, function (err, result) {
          //     if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
          //     else {
          const accessToken = modules.crypto.createHash('sha256').update(email + name + Date.now(), 'utf8').digest('hex');
          const token = {user_id: userId, access_token: accessToken, access_expired: 3600};
          mysql.con.query('INSERT INTO token SET ?', token, function(err, result) {
            if (err) {
              reject(new modules.Err(500, 100, `Insert Error in token Table: ${err}`));
            } else {
              resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, provider, name: name_, email, picture: picture_}});
            }
          });
        }
      });
    }
  });
}

function profile(token) {
  return new Promise(function(resolve, reject) {
    const sqlSearchUser = `SELECT u.*, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
    mysql.con.query(sqlSearchUser, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 116 `Query Error in user&token Table: ${err}`));
      } else if (result.length === 0) { // 非法 token
        reject(new modules.Err(406, 118, 'Invalid token'));
      } else if (result[0].expired_result === 'YES') {
        reject(new modules.Err(408, 120, 'Token expired'));
      } else {
        const body = {};
        body.user = {
          id: result[0].id,
          provider: result[0].provider,
          name: result[0].name,
          email: result[0].email,
          contactMethod: result[0].contactMethod,
          picture: result[0].picture,
        };
        resolve(body);
      }
    });
  });
}

function update(information) {
  const {userId, name, conectMethod, picture, password} = information;
  return new Promise(function(resolve, reject) {
    const updateSql = {};
    if (name) updateSql.name = name;
    if (conectMethod) updateSql.contactMethod = conectMethod;
    if (picture) updateSql.picture = picture;
    if (password) updateSql.password = password;
    mysql.con.query(`UPDATE user SET ? WHERE id=${userId}`, updateSql, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 147, `Update Error in user Table: ${err}`));
      } else {
        resolve('Update user table successful.');
      }
    });
  });
}
// for adoption function: postAdoption, udateAdoption, getAdoptionList, deteletAdoption
function postAdoption(req, petImgs) {
  // console.log('model', petImgs);
  return new Promise(function(resolve, reject) {
    const image = [];
    petImgs.forEach(function(ele) {
      image.push(ele.originalname);
    });
    const {petTitle, userId, kind, sex, age, neuter, county, petColor, petName, description, microchip, limitation, contactName, contactMethod} = req;
    const insertSql = {
      db: 3, status: 0, title: petTitle, user_id: userId, image: JSON.stringify(image),
      kind, sex, age, neuter, county, description: JSON.stringify(description),
      limitation: JSON.stringify(limitation.split(',')), contactName, contactMethod,
    };
    if (petColor) insertSql.color = petColor;
    if (petName) insertSql.petName = petName;
    if (microchip) insertSql.microchip = microchip;
    mysql.con.query('INSERT INTO pet SET ?', insertSql, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 173, `Insert Error in pet Table: ${err}`));
      } else {
        resolve('Insert into pet table successful.');
      }
    });
  });
}
function updateAdoption(req, petImgs) {
  return new Promise(function(resolve, reject) {
    const {status, petTitle, petId, kind, sex, age, neuter, county, petColor, petName, description, microchip, limitation, contactName, contactMethod} = req;
    updateSql = {
      status, title: petTitle, kind, sex, age, neuter, county, color: petColor,
      petName, description: JSON.stringify(description), microchip,
      limitation: JSON.stringify(limitation.split(',')), contactName, contactMethod,
    };
    if (petImgs === undefined) {
      mysql.con.query(`UPDATE pet SET ? WHERE id=${petId}`, updateSql, function(err, result) {
        if (err) {
          reject(new modules.Err(500, 191, `Update Error in pet Table: ${err}`));
        } else {
          resolve('Update pet table successful.');
        }
      });
    } else if (petImgs.length !== 0) {
      mysql.con.query(`SELECT image FROM pet WHERE id=${petId}`, function(err, result) {
        if (err) {
          reject(new modules.Err(500, 199, `Query Error in pet Table: ${err}`));
        } else {
          JSON.parse(result[0].image).forEach(function(ele) {
            const params = {Bucket: 'pethome.bucket', Key: `pet-img/${ele}`};
            s3.deleteObject(params, function(err, data) {
              if (err) console.log(err);
              else;
            });
          });
          updateSql.image = [];
          petImgs.forEach(function(ele) {
            updateSql.image.push(ele.originalname);
          });
          updateSql.image = JSON.stringify(updateSql.image);
          mysql.con.query(`UPDATE pet SET ? WHERE id=${petId}`, updateSql, function(err, result) {
            if (err) {
              reject(new modules.Err(500, 215, `Update Error in pet Table: ${err}`));
            } else {
              resolve('Update pet table successful.');
            }
          });
        }
      });
    }
  });
}

function getAdoptionList(token) {
  const sqlSearchUser = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
  return new Promise(function(resolve, reject) {
    mysql.con.query(sqlSearchUser, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 231, `Query Error in user Table: ${err}`));
      } else {
        if (result.length === 0) {
          reject(new modules.Err(406, 234, 'Invalid token'));
        } else if (result[0].expired_result === 'YES') {
          reject(new modules.Err(408, 236, 'Token expired'));
        } else {
          mysql.con.query(`SELECT pet.* from pet LEFT JOIN user ON pet.user_id=user.id WHERE pet.user_id=${result[0].id} ORDER BY pet.id DESC `, function(err, result) {
            const body = {};
            if (err) {
              reject(new modules.Err(500, 241, `Query Error in user&pet Table: ${err}`));
            } else {
              if (result.length === 0) {
                body.data = [];
              } else {
                body.data = parseResult(result);
              }
              resolve(body);
            }
          });
        }
      }
    });
  });
}

function deleteAdoption(petId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query(`SELECT image FROM pet WHERE id = ${petId}`, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 261, `Query Error in pet Table: ${err}`));
      } else {
        if (result.length === 0); // do nothing
        else {
          JSON.parse(result[0].image).forEach(function(ele) {
            const params = {Bucket: 'pethome.bucket', Key: `pet-img/${ele}`};
            s3.deleteObject(params, function(err, data) {
              if (err) console.log(err);
              else;// do nothing
            });
          });
        }
      }
      mysql.con.query(`DELETE FROM pet WHERE id = ${petId}`, function(err, result) {
        if (err) {
          reject(new modules.Err(500, 276, `Delete Error in pet Table: ${err}`));
        } else {
          resolve('Delete the id in pet&attention table successful.');
        }
      });
    });
  });
}
// for attention function: addAttention, getAttentionList, deleteAttention
function addAttention(petId, userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query(`SELECT * from attention WHERE pet_id = ${petId} AND user_id = ${userId}`, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 289, `Query Error in atttention Table ${err}`));
      } else {
        if (result.length === 0) {
          mysql.con.query(`INSERT INTO attention SET ?`, {pet_id: petId, user_id: userId}, function(err, result) {
            if (err) {
              reject(new modules.Err(500, 294, `Insert Error in atttention Table: ${err}`));
            } else {
              resolve('Insert id in attention table successful.');
            }
          });
        } else {
          mysql.con.query(`DELETE FROM attention WHERE pet_id = ${petId} AND user_id = ${userId}`, function(err, result) {
            if (err) {
              reject(new modules.Err(500, 302, `Delete Error in atttention Table: ${err}`));
            } else {
              resolve('Delete id in attention table successful.');
            }
          });
          // should update, but data is the same, do nothing
        }
      }
    });
  });
}

function getAttentionList(token) {
  const sqlSearchUser = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
  return new Promise(function(resolve, reject) {
    mysql.con.query(sqlSearchUser, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 319, `Query Error in user Table: ${err}`));
      } else {
        if (result.length === 0) {
          reject(new modules.Err(406, 291, 'Invalid token'));
        } else if (result[0].expired_result === 'YES') {
          reject(new modules.Err(408, 293, 'Token expired'));
        } else {
          mysql.con.query(`SELECT attention.*,pet.db,pet.image,pet.title,pet.opendate,pet.status,pet.sex from attention LEFT JOIN pet ON attention.pet_id = pet.id WHERE attention.user_id = ${result[0].id} ORDER BY attention.id DESC`, function(err, result) {
            const body = {};
            if (err) {
              reject(new modules.Err(500, 329, `Query Error in user&pet Table: ${err}`));
            } else {
              if (result.length === 0) {
                body.data = [];
              } else {
                result.forEach(function(ele) {
                  ele.image = JSON.parse(ele.image);
                });
                body.data = result;
              }
              resolve(body);
            }
          });
        }
      }
    });
  });
}

function deleteAttention(petId, userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query(`DELETE FROM attention WHERE pet_id = ${petId} AND user_id=${userId}`, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 352, `Delete Error in attention Table: ${err}`));
      } else {
        resolve('Delete the id in attention table successful.');
      }
    });
  });
}
// for message function: getMessageList, sendMessage, getMessage
function getMessageList(token) {
  const sqlSearchUser = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
  return new Promise(function(resolve, reject) {
    mysql.con.query(sqlSearchUser, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 365, `Query Error in user Table: ${err}`));
      } else {
        if (result.length === 0) {
          reject(new modules.Err(406, 368, 'Invalid token'));
        } else if (result[0].expired_result === 'YES') {
          reject(new modules.Err(408, 370, 'Token expired'));
        } else {
          mysql.con.query(`SELECT message.*,pet.image,pet.title FROM message LEFT JOIN pet ON message.pet_id = pet.id WHERE message.sender_id =${result[0].id} OR message.receiver_id = ${result[0].id} GROUP BY message.pet_id ORDER BY message.id DESC`, function(err, result) {
            const body = {};
            if (err) {
              reject(new modules.Err(500, 375, `Query Error in message&pet Table: ${err}`));
            } else {
              if (result.length === 0) {
                body.data = [];
              } else {
                result.forEach(function(ele) {
                  ele.image = JSON.parse(ele.image);
                  ele.msg = JSON.parse(ele.msg);
                });
                body.data = result;
              }
              resolve(body);
            }
          });
        }
      }
    });
  });
}

function getMessage(token, petId, senderId, receiverId) {
  const sqlSearchUser = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
  return new Promise(function(resolve, reject) {
    mysql.con.query(sqlSearchUser, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 400, `Query Error in user Table: ${err}`));
      } else {
        if (result.length === 0) {
          reject(new modules.Err(406, 403, 'Invalid token'));
        } else if (result[0].expired_result === 'YES') {
          reject(new modules.Err(408, 405, 'Token expired'));
        } else {
          mysql.con.query(`SELECT message.* FROM message WHERE message.pet_id = ${petId} AND (message.receiver_id=${result[0].id} OR message.sender_id = ${result[0].id})`, function(err, result) {
            const body = {};
            if (err) {
              reject(new modules.Err(500, 410, `Query Error in message Table: ${err}`));
            } else {
              if (result.length === 0) {
                body.data = [];
              } else {
                let loaded = 0;
                result.forEach(function(ele) {
                  ele.msg = JSON.parse(ele.msg);
                  mysql.con.getConnection(function(err, connection) {
                    if (err) {
                      reject(new modules.Err(500, 420, `getConnection error:${err}`));
                    } else {
                      connection.query(`SELECT user.picture FROM message LEFT JOIN user ON user.id = message.sender_id WHERE sender_id = ${ele.sender_id} AND pet_id = ${ele.pet_id} 
                      UNION 
                      SELECT user.picture FROM message LEFT JOIN user ON user.id = message.receiver_id WHERE receiver_id = ${ele.receiver_id} AND pet_id = ${ele.pet_id}`,
                      function(err, result2) {
                        if (err) {
                          reject(new modules.Err(500, 390, `Query Error in message&user Table: ${err}`));
                        } else {
                          loaded++;
                          ele.sender_picture = result2[0].picture;
                          ele.receiver_picture = result2[1].picture;
                        }
                        if (loaded === result.length) {
                          body.data = result;
                          resolve(body);
                        }
                        // else if (loaded !== result.length) {
                        //   reject(new modules.Err(501, 400, 'The total number of returned messages is incorrect'));
                        // }
                      });
                    }
                    connection.release();
                  });
                });// end forEach
              }
            }
          });
        }
      }
    });
  });
}

function sendMessage(req) {
  const {senderId, receiverId, petId, senderName, receiverName, message, createTime} = req.body;
  return new Promise(function(resolve, reject) {
    const insertSql = {sender_id: senderId, receiver_id: receiverId, pet_id: petId, sender_name: senderName, receiver_name: receiverName, createTime, msg: JSON.stringify(message)};
    mysql.con.query(`INSERT INTO message SET ?`, insertSql, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 460, `Insert Error in message Table: ${err}`));
      } else {
        resolve('Insert message table successful.');
      }
    });
  });
}

function parseResult(result) {
  for (let i = 0; i < result.length; i++) {
    result[i].image = JSON.parse(result[i].image);
    result[i].description = JSON.parse(result[i].description);
    result[i].habit = JSON.parse(result[i].habit);
    result[i].story = JSON.parse(result[i].story);
    result[i].limitation = JSON.parse(result[i].limitation);
  }
  return result;
}

module.exports = {
  signup, login, profile, update, postAdoption,
  updateAdoption, getAdoptionList, deleteAdoption,
  addAttention, getAttentionList, deleteAttention,
  getMessageList, getMessage, sendMessage,
};
