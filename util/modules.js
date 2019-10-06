/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const express = require('express');
// const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const xmlhttprequest = require('xmlhttprequest');
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
/**
 * @param  {Object} err
 * @param  {int} line
 */
function errorInsert(err, line) {
  error = {
    fileName: path.basename(__filename),
    line,
    code: err.code,
    errno: err.errno,
    sqlMessage: err.sqlMessage,
    command: err.sql,
  };
  mysql.con.query(`INSERT INTO crawlerError SET ?`, error, function(err, result) {
    if (err) console.log(err);
  });
}
/**
 * @param  {int} code
 * @param  {String} error
 */
class Err extends Error {
  constructor(code, error) {
    super(code, error);
    this.code = code;
    this.error = error;
  }
}
module.exports = {
  express,
  // request,
  cheerio,
  async,
  xmlhttprequest,
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
