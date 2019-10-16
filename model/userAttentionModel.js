/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const modules = require('../util/modules');
const mysql = require('../util/db');

// for attention function: addAttention, getAttentionList, deleteAttention
function addAttention(petId, userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query('SELECT * from attention WHERE pet_id = ? AND user_id = ?', [petId, userId], function(err, result) {
      if (err) {
        reject(new modules.Err(500, `Query Error in atttention Table ${err}`));
        return;
      }
      if (result.length === 0) {
        mysql.con.query('INSERT INTO attention SET ?', {pet_id: petId, user_id: userId}, function(err, result) {
          if (err) {
            reject(new modules.Err(500, `Insert Error in atttention Table: ${err}`));
            return;
          }
          resolve('Insert id in attention table successful.');
        });
      } else {
        mysql.con.query('DELETE FROM attention WHERE pet_id = ? AND user_id = ?', [petId, userId], function(err, result) {
          if (err) {
            reject(new modules.Err(500, `Delete Error in atttention Table: ${err}`));
            return;
          }
          resolve('Delete id in attention table successful.');
        });
        // should update, but data is the same, do nothing
      }
    });
  });
}

function getAttentionList(userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query('SELECT attention.*,pet.db,pet.image,pet.title,pet.opendate,pet.status,pet.sex from attention LEFT JOIN pet ON attention.pet_id = pet.id WHERE attention.user_id = ? ORDER BY attention.id DESC', userId, function(err, result) {
      const body = {};
      if (err) {
        reject(new modules.Err(500, `Query Error in attention&pet Table: ${err}`));
        return;
      }
      if (result.length === 0) {
        body.data = [];
      } else {
        result.forEach(function(ele) {
          ele.image = JSON.parse(ele.image);
        });
        body.data = result;
      }
      resolve(body);
    });
  });
}

function deleteAttention(petId, userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query('DELETE FROM attention WHERE pet_id = ? AND user_id = ?', [petId, userId], function(err, result) {
      if (err) {
        reject(new modules.Err(500, `Delete Error in attention Table: ${err}`));
        return;
      }
      resolve('Delete the id in attention table successful.');
    });
  });
}

module.exports = {
  addAttention, getAttentionList, deleteAttention,
};
