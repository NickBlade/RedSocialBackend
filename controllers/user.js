'use strict'

const bcrypt = require('bcrypt-nodejs');
const { reset } = require('nodemon');
var User = require('../models/user');
const jwt = require('../services/jwt');

exports.home = function(req, res){
    return res.status(200).send({message: 'Home page'});
}

exports.registerUser = function(req, res){
    const params = req.body;
    const user = new User();

    if(params.name && params.surname && params.nickname && params.password && params.email){

        user.name = params.name;
        user.surname = params.surname;
        user.nickname = params.nickname;
        user.email = params.email;
        user.rank = 'RANK_USER';
        user.image = null;

        // Duplicated users
        User.find({ $or: [
                {email: user.email.toLowerCase()},
                {nickname: user.nickname.toLowerCase()}
                ]}).exec((err, users) => {
                    if(err) res.status(404).send({message: 'Error'});
                
                    if(users && users.length >= 1) {
                        return res.status(200).send({message: 'The nickname or email is taked.'});
                    }else{

                        // Save data
                        bcrypt.hash(params.password, null, null, (err, hash) => {
                            user.password = hash;
                            
                            user.save((err, userRegistered) => {
                                if(err){ return res.status(500).send({message: 'Error to register the user.'})};
                
                                if(userRegistered){
                                    res.status(200).send({user: userRegistered});
                                }else{
                                    res.status(404).send({message: 'Error'});
                                }
                            });
                        });
                    }
                });

    }else{
        res.status(200).send({message: 'Error: Missing fields'});
    }
}

exports.loginUser = function(req, res){

    var params = req.body;
    
    const password = params.password;
    const email = params.email;

    User.findOne({email: email}, (err, user) => {
        if(err){ return res.status(500).send({message: 'Error'})};

        if(user){
            bcrypt.compare(password, user.password, (err, check) => {
                if(err){ return res.status(500).send({message: 'Error'})};

                if(check){ 
                    if(params.gettoken){
                        // Generate and Return token
                        
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        user.password = undefined; // Remove property cause is encripted
                        return res.status(200).send({user})
                    }
                };
            });
        }else{
            return res.status(500).send({message: 'Error'})
        };
    });
}

exports.getUser = function(req, res){
    var userId = req.params.id; // Params for the data of url, body for the data of post and put

    User.findById(userId, (err, user) => {
        if(err) return res.status(500).send({message: 'Error: ' + err});

        if(!user) return res.status(404).send({message: 'Error: The user doesn´t exist'});
       
        return res.status(200).send({user});
    });
}

