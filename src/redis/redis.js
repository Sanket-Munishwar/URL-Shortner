const redis = require('redis');
const {promisify} = require('util');
// require('dotenv').config();

//interacting with redis redis server

const redisClient = redis.createClient({
    host:'redis-16989.c301.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 16989,
    password: 'NNSB1fp1kaaHVI4O47umQyvJUXtn9vW4'
});

redisClient.on('connect', () => {
    console.log('connected to redis');
});

const SET_ASYNC = promisify(redisClient.set).bind(redisClient);
const GET_ASYNC = promisify(redisClient.get).bind(redisClient);

module.exports = {SET_ASYNC, GET_ASYNC};

