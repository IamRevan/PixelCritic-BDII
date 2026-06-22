import { MongoClient } from 'mongodb';

// URI de conexion desde variable de entorno
const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const options = {};

let client;
let clientPromise;

// Patron de singleton para reconexion eficiente en entornos serverless
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Funcion que retorna el cliente conectado y la base de datos PixelCriticDB
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db("PixelCriticDB");
  return { client, db };
}
