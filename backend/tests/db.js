// Shared in-memory MongoDB lifecycle for route tests
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connect = async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
};

const disconnect = async () => {
    await mongoose.disconnect();
    await mongod.stop();
};

const clear = async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
};

module.exports = { connect, disconnect, clear };
