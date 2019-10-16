/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const modules = require('../util/modules');
const mysql = require('../util/db');

// for message function: getMessageList, sendMessage, getMessage
function getMessageList(userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query('SELECT message.*,pet.image,pet.title FROM message LEFT JOIN pet ON message.pet_id = pet.id WHERE message.sender_id = ? OR message.receiver_id = ? GROUP BY message.pet_id ORDER BY message.id DESC', [userId, userId], function(err, result) {
      const body = {};
      if (err) {
        reject(new modules.Err(500, `Query Error in message&pet Table: ${err}`));
        return;
      }
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
    });
  });
}

function getMessage(userId, petId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query('SELECT message.* FROM message WHERE message.pet_id = ? AND (message.receiver_id = ? OR message.sender_id = ?)', [petId, userId, userId], function(err, result) {
      const body = {};
      if (err) {
        reject(new modules.Err(500, `Query Error in message Table: ${err}`));
        return;
      }
      if (result.length === 0) {
        body.data = [];
      }
      let loaded = 0;
      result.forEach(function(ele) {
        ele.msg = JSON.parse(ele.msg);
        mysql.con.getConnection(function(err, connection) {
          if (err) {
            reject(new modules.Err(500, `getConnection error:${err}`));
            return;
          }
          connection.query(`SELECT user.picture FROM message LEFT JOIN user ON user.id = message.sender_id WHERE sender_id = ? AND pet_id = ? 
                      UNION 
                      SELECT user.picture FROM message LEFT JOIN user ON user.id = message.receiver_id WHERE receiver_id = ? AND pet_id = ?`,
          [ele.sender_id, ele.pet_id, ele.receiver_id, ele.pet_id], function(err, result2) {
            if (err) {
              reject(new modules.Err(500, `Query Error in message&user Table: ${err}`));
              return;
            }
            loaded++;
            ele.sender_picture = result2[0].picture;
            ele.receiver_picture = result2[1].picture;
            if (loaded === result.length) {
              body.data = result;
              resolve(body);
            }
          });
          connection.release();
        });
      });
    });
  });
}

function sendMessage(req) {
  const {senderId, receiverId, petId, senderName, receiverName, message, createTime} = req.body;
  return new Promise(function(resolve, reject) {
    const insertSql = {sender_id: senderId, receiver_id: receiverId, pet_id: petId, sender_name: senderName, receiver_name: receiverName, createTime, msg: JSON.stringify(message)};
    mysql.con.query(`INSERT INTO message SET ?`, insertSql, function(err, result) {
      if (err) {
        reject(new modules.Err(500, `Insert Error in message Table: ${err}`));
        return;
      }
      resolve('Insert message table successful.');
    });
  });
}

module.exports = {
  getMessageList, getMessage, sendMessage,
};
