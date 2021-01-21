'use strict'

const express = require('express');
const UserController = require('../controllers/user');
const api = express.Router();

//Middlewares
const md_auth = require('../middlewares/authenticated');

api.get('/home', md_auth.ensureAuth, UserController.home); // Only works if they are logged
api.post('/register', UserController.registerUser);
api.get('/login', UserController.loginUser);

module.exports = api;