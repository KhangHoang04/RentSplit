import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error(
    "Please define the mongoURI environment variable inside .env"
  );
}

let cachedMongoObject = global.mongoose;

if (!cachedMongoObject) {
  cachedMongoObject = global.mongoose = { connection: null, promise: null };
}

async function connectToDB() {
  if (cachedMongoObject.connection) {
    return cachedMongoObject.connection;
  }

  if (!cachedMongoObject.promise) {
    const opts = {
      bufferCommands: false,
    };
    try {
      cachedMongoObject.promise = mongoose
        .connect(mongoUri, opts)
        .then((mongoose) => {
          return mongoose;
        });
      cachedMongoObject.connection = await cachedMongoObject.promise;
      console.log("Success");
      return cachedMongoObject.connection;
    } catch {
      throw new Error("No Connection");
    }
  }
}

export default connectToDB;