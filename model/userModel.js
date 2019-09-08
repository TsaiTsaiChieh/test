const modules = require('../util/modules');
const mysql = require('../util/db')

function signup(email, password) {
    return new Promise(function (resolve, reject) {
        // 檢查有無重複註冊
        mysql.con.query(`SELECT id FROM user WHERE email='${email}'`, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
            else if (result.length != 0) reject({ code: 406, error: 'Email duplication registration' });
            // mysql.con.beginTransaction(function(err)) {
            else {
                mysql.con.query('INSERT INTO user SET ?', { provider: 'native', email, password }, function (err, result) {
                    if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
                    else {
                        let string_data = email + password + Date.now();
                        let access_token = modules.crypto.createHash('sha256').update(string_data, 'utf8').digest('hex');
                        let user_id = result.insertId;
                        let token = { user_id, access_token, access_expired: 3600 };
                        mysql.con.query('INSERT INTO token SET ?', token, function (err, result) {
                            if (err) reject({ code: 500, error: `Query Error in token Table: ${err}` });
                            else resolve({ token: { access_token, access_expired: 3600 }, user: { user_id, email } });
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
                        if (err) throw reject({ code: 500, error: `Query Error in token Table: ${err}` });
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
                resolve({
                    user: {
                        id: result[0].id,
                        provider: result[0].provider,
                        name: result[0].name,
                        email: result[0].email,
                        phone: result[0].phone,
                        picture: result[0].picture
                    }
                });
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
            else resolve('Update into user table successful.');
        });
    });
}
function postPet(req, petImgs) {
    return new Promise(function (resolve, reject) {
        let image = [];
        for (let i = 0; i < petImgs.length; i++) image.push(petImgs[i].filename);
        let { petTitle, userId, kind, sex, age, neuter, county, petColor, petName, description, microchip, limitation, contactName, contactMethod } = req;
        let insert_sql = {
            db: 3, title: petTitle, user_id: userId, image: JSON.stringify(image),
            kind, sex, age, neuter, county, description: JSON.stringify(description),
            limitation: JSON.stringify(limitation.split(',')), contactName, contactMethod
        };
        if (petColor) insert_sql.color = petColor;
        if (petName) insert_sql.petName = petName;
        if (microchip) insert_sql.microchip = microchip;

        mysql.con.query('INSERT INTO pet SET ?', insert_sql, function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in pet Table: ${err}` });
            else resolve('Insert into pet table successful.');
        });

    });
}
module.exports = { signup, login, profile, update, postPet }