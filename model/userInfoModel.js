/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const modules = require('../util/modules');
const mysql = require('../util/db');

// for user function: signup, login, profile, update
function signup(user) {
  const {name, email, password} = user;
  return new Promise(function(resolve, reject) {
    mysql.con.getConnection(function(err, connection) {
      if (err) {
        reject(new modules.Err(500, `Get connection Error: ${err}`));
        return;
      }
      connection.beginTransaction(function(err) {
        if (err) {
          reject(new modules.Err(500, `Transcaction Error: ${err}`));
          return;
        }
        // Check email for duplicates
        connection.query(`SELECT id FROM user WHERE email = ? AND provider = 'native'`, email, function(err, result) {
          if (err) {
            reject(new modules.Err(500, `Query Error in user Table: ${err}`));
            return;
          }
          if (result.length !== 0) {
            reject(new modules.Err(406, 'Email duplication registration'));
            return;
          }
          connection.query('INSERT INTO user SET ?', {provider: 'native', name, email, password}, function(err, result) {
            if (err) {
              reject(new modules.Err(500, `Insert Error in user Table: ${err}`));
              connection.rollback(function() {});
              return;
            }
            const stringData = email + password + Date.now();
            const accessToken = modules.crypto.createHash('sha256').update(stringData, 'utf8').digest('hex');
            const userId = result.insertId;
            const token = {user_id: userId, access_token: accessToken, access_expired: 3600};
            connection.query('INSERT INTO token SET ?', token, function(err, result) {
              if (err) {
                reject(new modules.Err(500, `Insert Error in token Table: ${err}`));
                connection.rollback(function() {});
                return;
              }
              connection.commit(function(err) {
                if (err) {
                  reject(new modules.Err(500, `Commit Error: ${err}`));
                  return;
                }
                resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, name, email}});
              });
            });
          });
        });
      });
      connection.release();
    }); // get connection
  });
}

function login(user) {
  const {email, password, provider, name, picture} = user;
  return new Promise(function(resolve, reject) {
    mysql.con.getConnection(function(err, connection) {
      if (err) {
        reject(new modules.Err(500, `Get connection Error: ${err}`));
        return;
      }
      connection.beginTransaction(function(err) {
        if (err) {
          reject(new modules.Err(500, `Transcaction Error: ${err}`));
          return;
        }
        // native login
        if (provider === 'native') {
          connection.query(`SELECT * FROM user WHERE provider = ? AND email = ? AND password = ?`, [provider, email, password], function(err, result) {
            if (err) {
              reject(new modules.Err(500, `Query Error in user Table: ${err}`));
              return;
            }
            if (result.length === 0) {
              reject(new modules.Err(406, 'Email or password is wrong'));
              return;
            }
            const userId = result[0].id;
            const name = result[0].name;
            const picture = result[0].picture;
            const stringData = email + result[0].password + Date.now();
            const accessToken = modules.crypto.createHash('sha256').update(stringData, 'utf8').digest('hex');
            const token = {user_id: userId, access_token: accessToken, access_expired: 3600};
            connection.query('INSERT token SET ?', token, function(err, result) {
              if (err) {
                reject(new modules.Err(500, `Insert Error in token Table: ${err}`));
                connection.rollback(function() {});
                return;
              }
              connection.commit(function(err) {
                if (err) {
                  reject(new modules.Err(500, `Commit Error: ${err}`));
                  return;
                }
                resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, provider, name, email, picture}});
              });
            });
          });
        } else if (provider === 'facebook') {
          // Search for FB registered
          connection.query(`SELECT id, picture, name FROM user WHERE provider = ? AND email = ?`, [provider, email], function(err, result) {
            if (err) {
              reject(new modules.Err(500, `Query Error in user Table: ${err}`));
              return;
            }
            if (result.length === 0) { // Represented not registered with FB
              connection.query('INSERT INTO user SET ?', {provider, name, picture, email}, function(err, result) {
                if (err) {
                  reject(new modules.Err(500, `Insert Error in user Table: ${err}`));
                  connection.rollback(function() {});
                  return;
                }
                const accessToken = modules.crypto.createHash('sha256').update(email + name + Date.now(), 'utf8').digest('hex');
                const userId = result.insertId;
                const token = {user_id: userId, access_token, access_expired: 3600};
                mconnection.query('INSERT INTO token SET ?', token, function(err, result) {
                  if (err) {
                    reject(new modules.Err(500, `Insert Error in token Table: ${err}`));
                    connection.rollback(function() {});
                    return;
                  }
                  connection.commit(function(err) {
                    if (err) {
                      reject(new modules.Err(500, `Commit Error: ${err}`));
                      return;
                    }
                    resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, provider, name, email, picture}});
                  });
                });
              });
            }
            if (result.length !== 0) { // Represented registered with FB
              const userId = result[0].id;
              const name_ = result[0].name;
              const picture_ = result[0].picture;
              const accessToken = modules.crypto.createHash('sha256').update(email + name + Date.now(), 'utf8').digest('hex');
              const token = {user_id: userId, access_token: accessToken, access_expired: 3600};
              connection.query('INSERT INTO token SET ?', token, function(err, result) {
                if (err) {
                  reject(new modules.Err(500, `Insert Error in token Table: ${err}`));
                  return;
                }
                connection.commit(function(err) {
                  if (err) {
                    reject(new modules.Err(500, `Commit Error: ${err}`));
                    return;
                  }
                  resolve({token: {access_token: accessToken, access_expired: 3600}, user: {id: userId, provider, name: name_, email, picture: picture_}});
                });
              });
            }
          });
        }
      }); // beginTransaction
      connection.release();
    }); // get connection
  });
}

function profile(userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query('SELECT * FROM user WHERE id = ?', userId, function(err, result) {
      if (err) {
        reject(new modules.Err(500, `Query Error in user&token Table: ${err}`));
        return;
      }
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
    });
  });
}

function update(information) {
  const {userId, name, contactMethod, picture, password} = information;
  return new Promise(function(resolve, reject) {
    const updateSql = {};
    if (name) updateSql.name = name;
    if (contactMethod) updateSql.contactMethod = contactMethod;
    if (picture) updateSql.picture = picture;
    if (password) updateSql.password = password;
    mysql.con.query(`UPDATE user SET ? WHERE id = ?`, [updateSql, userId], function(err, result) {
      if (err) {
        reject(new modules.Err(500, `Update Error in user Table: ${err}`));
        return;
      }
      resolve('Update user table successful.');
    });
  });
}

module.exports = {
  signup, login, profile, update,
};
