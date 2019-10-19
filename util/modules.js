/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const dotenv = require('dotenv').config();
const express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');
const bodyparser = require('body-parser');
const crypto = require('crypto');
const schedule = require('node-schedule');
const mysql = require('../util/db');
const path = require('path');
const aws = require('aws-sdk');
const multer = require('multer');
const multer3 = require('multer-s3');
const redis = require('redis');
const axios = require('axios');


function errorInsert(fileName, err, line) {
  if (Number.isInteger(err.errno)) errno = err.error;
  else errno = 0;
  error = {
    line,
    code: err.code,
    errno,
    sqlMessage: err.sqlMessage,
  };
  if (err.sql) error['command'] = err.sql.substring(0, 255);
  mysql.con.query(`INSERT INTO crawlerError SET ?`, error, function(err, result) {
    if (err) console.log(err);
  });
}

class Err extends Error {
  constructor(code, error) {
    super(code, error);
    this.code = code;
    this.error = error;
  }
}
module.exports = {
  dotenv,
  express,
  cheerio,
  fs,
  bodyparser,
  crypto,
  schedule,
  path,
  errorInsert,
  aws,
  multer,
  multer3,
  redis,
  Err,
  axios,
};
