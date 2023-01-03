'use strict;'
const crypto = require('crypto');
const hasher = {};
hasher.generateSalt = (rounds)=>{
    if(rounds >= 15) throw 'Rounds must be less then 15;';
    if(typeof rounds != 'number') throw 'Rounds must be a number';
    if(!rounds) rounds = 12;
    return crypto.randomBytes(Math.ceil(rounds/2)).toString('hex').slice(0,rounds);
};
hasher.generate = (password, salt)=>{
    if(!password || !salt) throw 'Password and salt must be provided';
    if(typeof password != 'string' || typeof salt !='string') throw 'Password and salt must be string';
    let hash =crypto.createHmac('sha512',salt);
    hash.update(password);
    let value = hash.digest('hex');
    return{
        salt:salt,
        hashedpassword:value
    }
};

module.exports = hasher;