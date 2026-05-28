const mongoose = require('mongoose');

let connecting = null;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connecting) {
    return connecting;
  }

  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/chatsystem';

  connecting = mongoose.connect(uri).then(() => {
    console.log(`MongoDB connected (${uri})`);
    return mongoose.connection;
  });

  return connecting;
}

module.exports = { connectDatabase };
