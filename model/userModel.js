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
            mysql.con.query(`SELECT id FROM user WHERE provider = '${provider}' AND email='${email}'`, function (err, result) {
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
                    mysql.con.query(`UPDATE user SET name='${name}',picture='${picture}' WHERE id=${user_id}`, function (err, result) {
                        if (err) reject({ code: 500, error: `Query Error in user Table: ${err}` });
                        else {
                            let access_token = modules.crypto.createHash('sha256').update(email + name + Date.now(), 'utf8').digest('hex');
                            let token = { user_id, access_token, access_expired: 3600 };
                            mysql.con.query('INSERT INTO token SET ?', token, function (err, result) {
                                if (err) reject({ code: 500, error: `Query Error in token Table: ${err}` });
                                else resolve({ token: { access_token, access_expired: 3600 }, user: { id: user_id, provider, name, email, picture } });
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports = { signup, login }