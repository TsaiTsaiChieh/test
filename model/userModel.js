const modules = require('../util/modules');
const mysql = require('../util/db');

function signup(name, email, password) {
    return new Promise(function (resolve, reject) {
        // 檢查有無重複註冊
        mysql.con.query(`SELECT id FROM user WHERE email='${email}'`, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
            else if (result.length != 0) reject({ code: 406, error: 'Email duplication registration' });
            // mysql.con.beginTransaction(function(err)) {
            else {
                mysql.con.query('INSERT INTO user SET ?', { provider: 'native', name, email, password }, function (err, result) {
                    if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
                    else {
                        let string_data = email + password + Date.now();
                        let access_token = modules.crypto.createHash('sha256').update(string_data, 'utf8').digest('hex');
                        let user_id = result.insertId;
                        let token = { user_id, access_token, access_expired: 3600 };
                        mysql.con.query('INSERT INTO token SET ?', token, function (err, result) {
                            if (err) reject({ code: 500, error: `Query Error in token Table: ${err}` });
                            else resolve({ token: { access_token, access_expired: 3600 }, user: { id: user_id, name, email } });
                        });
                    }
                });
            }
        });
    });
}
function login(provider, email, password, name, picture) {
    return new Promise(function (resolve, reject) {
        // native 登入
        if (provider === 'native') {
            mysql.con.query(`SELECT * FROM user WHERE provider='${provider}' AND email='${email}' AND password='${password}'`, function (err, result) {
                if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
                else if (result.length === 0) reject({ code: 406, error: 'Email or password is wrong.' });
                else {
                    let user_id = result[0].id;
                    let name = result[0].name;
                    let picture = result[0].picture;
                    let string_data = email + result[0].password + Date.now();
                    let access_token = modules.crypto.createHash('sha256').update(string_data, 'utf8').digest('hex');
                    let token = { user_id, access_token, access_expired: 3600 };
                    mysql.con.query('INSERT token SET ?', token, function (err, result) {
                        if (err) reject({ code: 500, error: `Query Error in token Table: ${err}` });
                        else {
                            resolve({ token: { access_token, access_expired: 3600 }, user: { id: user_id, provider, name, email, picture } });
                        }
                    });
                }
            });
        }
        else if (provider === 'facebook') {
            // 搜尋有無使用 FB 註冊過
            mysql.con.query(`SELECT id,picture,name FROM user WHERE provider='${provider}' AND email='${email}'`, function (err, result) {
                if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
                // 代表未使用 FB 註冊過
                else if (result.length === 0) {
                    mysql.con.query('INSERT INTO user SET ?', { provider, name, picture, email }, function (err, result) {
                        if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
                        else {
                            let access_token = modules.crypto.createHash('sha256').update(email + name + Date.now(), 'utf8').digest('hex');
                            let user_id = result.insertId;
                            let token = { user_id, access_token, access_expired: 3600 };
                            mysql.con.query('INSERT INTO token SET ?', token, function (err, result) {
                                if (err) reject({ code: 500, error: `Query Error in token Table: ${err}` });
                                else resolve({ token: { access_token, access_expired: 3600 }, user: { id: user_id, provider, name, email, picture } });
                            });
                        }
                    });
                }
                else if (result.length !== 0) { // 曾經用過 FB 註冊
                    let user_id = result[0].id;
                    let name_ = result[0].name;
                    let picture_ = result[0].picture;
                    // 不要登入時每次更新資料庫
                    // mysql.con.query(`UPDATE user SET name='${name}',picture='${picture}' WHERE id=${user_id}`, function (err, result) {
                    //     if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
                    //     else {
                    let access_token = modules.crypto.createHash('sha256').update(email + name + Date.now(), 'utf8').digest('hex');
                    let token = { user_id, access_token, access_expired: 3600 };
                    mysql.con.query('INSERT INTO token SET ?', token, function (err, result) {
                        if (err) reject({ code: 500, error: `Query Error in token Table: ${err}` });
                        else resolve({ token: { access_token, access_expired: 3600 }, user: { id: user_id, provider, name: name_, email, picture: picture_ } });
                    });
                    // }
                    // });
                }
            });
        }
    });
}
function profile(token) {
    let sql_search_user = `SELECT u.*, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
    return new Promise(function (resolve, reject) {
        mysql.con.query(sql_search_user, function (err, result) {
            if (err) {
                reject({ code: 500, error: `Query Error in user&token Table: ${err}` });
            }
            else if (result.length === 0) { // 非法 token
                reject({ code: 406, error: 'Invalid token.' });
            }
            else if (result[0].expired_result === 'YES') {
                reject({ code: 408, error: 'Token expired.' });
            }
            else {
                let body = {};
                body.user = {
                    id: result[0].id,
                    provider: result[0].provider,
                    name: result[0].name,
                    email: result[0].email,
                    phone: result[0].phone,
                    picture: result[0].picture
                };
                resolve(body);
            }
        });
    });
}
function update(userId, inputName, inputPhone, inputPicture) {
    return new Promise(function (resolve, reject) {
        let update_sql = {};
        if (inputName) update_sql.name = inputName;
        if (inputPhone) update_sql.phone = inputPhone;
        if (inputPicture !== 'null') update_sql.picture = inputPicture;

        mysql.con.query(`UPDATE user SET ? WHERE id=${userId}`, update_sql, function (err, result) {
            if (err)
                reject({ code: 500, error: `Query Error in user Table: ${err}` });
            else resolve('Update user table successful.');
        });
    });
}
function postAdoption(req, petImgs) {
    // console.log('model', petImgs);

    return new Promise(function (resolve, reject) {
        let image = [];
        for (let i = 0; i < petImgs.length; i++) image.push(petImgs[i].filename);
        let { petTitle, userId, kind, sex, age, neuter, county, petColor, petName, description, microchip, limitation, contactName, contactMethod } = req;
        let insert_sql = {
            db: 3, status: 0, title: petTitle, user_id: userId, image: JSON.stringify(image),
            kind, sex, age, neuter, county, description: JSON.stringify(description),
            limitation: JSON.stringify(limitation.split(',')), contactName, contactMethod
        };
        if (petColor) insert_sql.color = petColor;
        if (petName) insert_sql.petName = petName;
        if (microchip) insert_sql.microchip = microchip;

        mysql.con.query('INSERT INTO pet SET ?', insert_sql, function (err, result) {
            if (err) {
                reject({ code: 500, error: `Query Error in pet Table: ${err}` });
                throw err;
            }
            else resolve('Insert into pet table successful.');
        });

    });
}
function getAdoptionList(token) {
    let sql_search_user = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
    return new Promise(function (resolve, reject) {
        mysql.con.query(sql_search_user, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in user Table, line number is 160: ${err}` });
            else {
                if (result.length === 0) reject({ code: 406, error: 'Invalid token.' });
                else if (result[0].expired_result === 'YES') reject({ code: 408, error: 'Token expired.' });
                else {
                    mysql.con.query(`SELECT pet.* from pet LEFT JOIN user ON pet.user_id=user.id WHERE pet.user_id=${result[0].id} ORDER BY pet.id DESC `, function (err, result) {
                        let body = {};
                        if (err) reject({ code: 500, error: `Query Error in user&pet Table, line number is 166: ${err}` });
                        else {
                            if (result.length === 0) body.data = [];
                            else body.data = parseResult(result);
                            resolve(body);
                        }
                    });
                }
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

function deleteAdoption(petId) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`SELECT image FROM pet WHERE id = ${petId}`, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in pet Table, line number is 193: ${err}` });
            else {
                if (result.length === 0); // do nothing
                else {
                    JSON.parse(result[0].image).forEach(function (ele) {
                        modules.fs.unlink(`./public/pet-img/${ele}`, function (err) {
                            if (err) console.log(err);
                        });
                    });
                }
            }
            mysql.con.query(`DELETE FROM pet WHERE id = ${petId}`, function (err, result) {
                if (err) reject({ code: 500, error: `DELETE Error in pet Table, line number is 208: ${err}` });
                else {
                    mysql.con.query(`DELETE FROM attention WHERE pet_id=${petId}`, function (err, result) {
                        if (err) reject({ code: 500, error: `DELETE Error in attention Table, line number is 211: ${err}` });
                        resolve('Delete the id in pet&attention table successful.');
                    });

                }
            });
        });

    });
}
function updateAdoption(req, petImgs) {
    return new Promise(function (resolve, reject) {
        let { status, petTitle, petId, kind, sex, age, neuter, county, petColor, petName, description, microchip, limitation, contactName, contactMethod } = req;
        update_sql = {
            status, title: petTitle, kind, sex, age, neuter, county, color: petColor,
            petName, description: JSON.stringify(description), microchip,
            limitation: JSON.stringify(limitation.split(',')), contactName, contactMethod
        };
        if (petImgs === undefined) {
            mysql.con.query(`UPDATE pet SET ? WHERE id=${petId}`, update_sql, function (err, result) {
                if (err) {
                    reject({ code: 500, error: `UPDATE Error in pet Table: ${err}` });
                    throw err;
                }
                else resolve('Update pet table successful.');
            });
        }
        else if (petImgs.length !== 0) {
            mysql.con.query(`SELECT image FROM pet WHERE id=${petId}`, function (err, result) {
                if (err) reject({ code: 500, error: `Query Error in pet Table, line number is 231: ${err}` });
                else {
                    JSON.parse(result[0].image).forEach(function (ele) {
                        modules.fs.unlink(`./public/pet-img/${ele}`, function (err) { if (err) console.log(err); });
                    });
                    update_sql.image = [];
                    petImgs.forEach(function (ele) { update_sql.image.push(ele.filename) });
                    update_sql.image = JSON.stringify(update_sql.image);
                    mysql.con.query(`UPDATE pet SET ? WHERE id=${petId}`, update_sql, function (err, result) {
                        if (err)
                            reject({ code: 500, error: `UPDATE Error in pet Table, line number is 240: ${err}` });
                        else resolve('Update pet table successful.');
                    });
                }
            });
        }
    });
}
function sendMessage(senderId, receiverId, petId, senderName, receiverName, message, createTime) {
    return new Promise(function (resolve, reject) {
        let insert_sql = { sender_id: senderId, receiver_id: receiverId, pet_id: petId, sender_name: senderName, receiver_name: receiverName, createTime, msg: JSON.stringify(message) };
        mysql.con.query(`INSERT INTO message SET ?`, insert_sql, function (err, result) {
            if (err) {
                reject({ code: 500, error: `INSERT Error in message Table, line number is 253: ${err}` });
                throw err;
            }
            else resolve('Insert message table successful.');
        });
    });

}
function getMessageList(token) {
    let sql_search_user = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
    return new Promise(function (resolve, reject) {
        mysql.con.query(sql_search_user, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in user Table, line number is 266: ${err}` });
            else {
                if (result.length === 0) reject({ code: 406, error: 'Invalid token.' });
                else if (result[0].expired_result === 'YES') reject({ code: 408, error: 'Token expired.' });
                else {
                    mysql.con.query(`SELECT message.*,pet.image,pet.title FROM message LEFT JOIN pet ON message.pet_id = pet.id WHERE message.sender_id =${result[0].id} OR message.receiver_id = ${result[0].id} GROUP BY message.pet_id ORDER BY message.id DESC`, function (err, result) {
                        let body = {};
                        if (err) reject({ code: 500, error: `Query Error in message&pet Table, line number is 272: ${err}` });
                        else {
                            if (result.length === 0) body.data = [];
                            else {
                                result.forEach(function (ele) {
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
    let sql_search_user = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
    return new Promise(function (resolve, reject) {
        mysql.con.query(sql_search_user, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in user Table, line number is 295: ${err}` });
            else {
                if (result.length === 0) reject({ code: 406, error: 'Invalid token.' });
                else if (result[0].expired_result === 'YES') reject({ code: 408, error: 'Token expired.' });
                else {
                    // mysql.con.query(`SELECT * FROM message WHERE pet_id = ${petId} AND (receiver_id=${result[0].id} OR sender_id = ${result[0].id})`, function (err, result) { 
                    // mysql.con.query(`SELECT message.*,user.picture FROM message LEFT JOIN user ON user.id = ${senderId} OR user.id = ${receiverId} WHERE message.pet_id = ${petId} AND (message.receiver_id=${result[0].id} OR message.sender_id = ${result[0].id})`, function (err, result) {
                    mysql.con.query(`SELECT message.* FROM message WHERE message.pet_id = ${petId} AND (message.receiver_id=${result[0].id} OR message.sender_id = ${result[0].id})`, function (err, result) {
                        let body = {};
                        if (err) {
                            reject({ code: 500, error: `Query Error in message Table, line number is 307: ${err}` });
                            throw err;
                        }
                        else {
                            if (result.length === 0) body.data = [];
                            else {
                                let loaded = 0;
                                result.forEach(function (ele) {
                                    ele.msg = JSON.parse(ele.msg);
                                    mysql.con.getConnection(function (err, connection) {
                                        if (err) reject({ code: 500, error: `getConnection error, line number is 319: ${err}` });
                                        else {
                                            connection.query(`SELECT user.picture FROM message LEFT JOIN user ON user.id = message.sender_id WHERE sender_id = ${ele.sender_id} AND pet_id = ${ele.pet_id}
                                                              UNION
                                                              SELECT user.picture FROM message LEFT JOIN user ON user.id = message.receiver_id WHERE receiver_id = ${ele.receiver_id} AND pet_id = ${ele.pet_id}`,
                                                function (err, result2) {
                                                    if (err) {
                                                        reject({ code: 500, error: `Query Error in message&user Table, line number is 324: ${err}` });
                                                        throw err;
                                                    }
                                                    else {
                                                        loaded++;
                                                        ele.sender_picture = result2[0].picture;
                                                        ele.receiver_picture = result2[1].picture;
                                                    }
                                                    if (loaded === result.length) {
                                                        body.data = result;
                                                        resolve(body);
                                                    }
                                                    // else reject({ code: 501, error: 'The total number of returned messages is incorrect.' });

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
function addAttention(petId, userId) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`SELECT * from attention WHERE pet_id = ${petId} AND user_id = ${userId}`, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in atttention Table, line number is 356: ${err}` });
            else {
                if (result.length === 0) {
                    mysql.con.query(`INSERT INTO attention SET ?`, { pet_id: petId, user_id: userId }, function (err, result) {
                        if (err) reject({ code: 500, error: `Insert Error in atttention Table, line number is 360: ${err}` });
                        else {
                            resolve('.insert');
                        }
                    });
                }
                else {
                    mysql.con.query(`DELETE FROM attention WHERE pet_id = ${petId} AND user_id = ${userId}`, function (err, result) {
                        if (err) reject({ code: 500, error: `Delete Error in atttention Table, line number is 368: ${err}` });
                        else {
                            resolve('.delete');
                        }
                    });
                    // should update, but data is the same, do nothing
                }
            }
        });
    });
}
function getAttentionList(token) {
    let sql_search_user = `SELECT u.id, IF(TIMESTAMPDIFF(SECOND, t.created, CURRENT_TIMESTAMP)>t.access_expired,'YES','NO') AS expired_result FROM user AS u LEFT JOIN token AS t ON u.id = t.user_id WHERE t.access_token = '${token}'`;
    return new Promise(function (resolve, reject) {
        mysql.con.query(sql_search_user, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in user Table, line number is 160: ${err}` });
            else {
                if (result.length === 0) reject({ code: 406, error: 'Invalid token.' });
                else if (result[0].expired_result === 'YES') reject({ code: 408, error: 'Token expired.' });
                else {
                    mysql.con.query(`SELECT attention.*,pet.db,pet.image,pet.title,pet.opendate,pet.status,pet.sex from attention LEFT JOIN pet ON attention.pet_id = pet.id WHERE attention.user_id = ${result[0].id} ORDER BY attention.id DESC`, function (err, result) {
                        let body = {};
                        if (err) reject({ code: 500, error: `Query Error in user&pet Table, line number is 166: ${err}` });
                        else {
                            if (result.length === 0) body.data = [];
                            else {
                                result.forEach(function (ele) {
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
    return new Promise(function (resolve, reject) {
        mysql.con.query(`DELETE FROM attention WHERE pet_id = ${petId} AND user_id=${userId}`, function (err, result) {
            if (err) reject({ code: 500, error: `DELETE Error in attention Table, line number is 410: ${err}` });
            else resolve('Delete the id in attention table successful.');
        });
    });
}
module.exports = {
    signup, login, profile, update, postAdoption,
    getAdoptionList, deleteAdoption, updateAdoption,
    sendMessage, getMessageList, addAttention,
    getAttentionList, getMessage, deleteAttention
}