/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const modules = require('../util/modules');
const mysql = require('../util/db');
const AWS = require('../private/awsConfig');
const s3 = new AWS.S3();

// for adoption function: postAdoption, udateAdoption, getAdoptionList, deteletAdoption
function postAdoption(req, petImgs) {
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
        reject(new modules.Err(500, `Insert Error in pet Table: ${err}`));
        return;
      }
      resolve('Insert into pet table successful.');
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
      mysql.con.query(`UPDATE pet SET ? WHERE id = ?`, [updateSql, petId], function(err, result) {
        if (err) {
          reject(new modules.Err(500, `Update Error in pet Table: ${err}`));
          return;
        }
        resolve('Update pet table successful.');
      });
    } else if (petImgs.length !== 0) {
      mysql.con.query(`SELECT image FROM pet WHERE id = ?`, petId, function(err, result) {
        if (err) {
          reject(new modules.Err(500, `Query Error in pet Table: ${err}`));
          return;
        }
        JSON.parse(result[0].image).forEach(function(ele) {
          const params = {Bucket: 'pethome.bucket', Key: `pet-img/${ele}`};
          s3.deleteObject(params, function(err, data) {
            if (err) console.log(err);
          });
        });
        updateSql.image = [];
        petImgs.forEach(function(ele) {
          updateSql.image.push(ele.originalname);
        });
        updateSql.image = JSON.stringify(updateSql.image);
        mysql.con.query(`UPDATE pet SET ? WHERE id = ?`, [updateSql, petId], function(err, result) {
          if (err) {
            reject(new modules.Err(500, `Update Error in pet Table: ${err}`));
            return;
          }
          resolve('Update pet table successful.');
        });
      });
    }
  });
}

function getAdoptionList(userId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query(`SELECT pet.* from pet LEFT JOIN user ON pet.user_id=user.id WHERE pet.user_id = ? ORDER BY pet.id DESC `, userId, function(err, result) {
      const body = {};
      if (err) {
        reject(new modules.Err(500, `Query Error in user&pet Table: ${err}`));
        return;
      }
      if (result.length === 0) {
        body.data = [];
      } else {
        body.data = parseResult(result);
      }
      resolve(body);
    });
  });
}

function deleteAdoption(petId) {
  return new Promise(function(resolve, reject) {
    mysql.con.query(`SELECT image FROM pet WHERE id = ?`, petId, function(err, result) {
      if (err) {
        reject(new modules.Err(500, `Query Error in pet Table: ${err}`));
        return;
      }
      if (result.length === 0); // do nothing
      else {
        JSON.parse(result[0].image).forEach(function(ele) {
          const params = {Bucket: 'pethome.bucket', Key: `pet-img/${ele}`};
          s3.deleteObject(params, function(err, data) {
            if (err) console.log(err);
          });
        });
      }
      mysql.con.query(`DELETE FROM pet WHERE id = ?`, petId, function(err, result) {
        if (err) {
          reject(new modules.Err(500, `Delete Error in pet Table: ${err}`));
          return;
        }
        resolve('Delete the id in pet&attention table successful.');
      });
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
  postAdoption, updateAdoption, getAdoptionList, deleteAdoption,

};
