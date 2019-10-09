/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');
const bodyparser = require('body-parser');
const crypto = require('crypto');
const multer = require('multer');
const schedule = require('node-schedule');
const mysql = require('../util/db');
const path = require('path');
const aws = require('aws-sdk');
const multer3 = require('multer-s3');
const redis = require('redis');
const axios = require('axios');

function errorInsert(fileName, err, line) {
  error = {
    line,
    code: err.code,
    errno: Number.parseInt(err.errno),
    sqlMessage: err.sqlMessage,
    command: err.sql,
  };
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
  express,
  cheerio,
  fs,
  bodyparser,
  crypto,
  multer,
  schedule,
  path,
  errorInsert,
  aws,
  multer3,
  redis,
  Err,
  axios,
};
