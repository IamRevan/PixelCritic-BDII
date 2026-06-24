// Script de prueba de conexion a MongoDB
// Uso: node test-mongo.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';

async function testConnection() {
  let client;
  try {
    console.log('Conectando a:', uri);
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();

    const admin = client.db().admin();
    const info = await admin.serverInfo();

    console.log('Conexion exitosa!');
    console.log('Version de MongoDB:', info.version);
    console.log('Base de datos actual:', client.db().databaseName || 'Ninguna');

    // Listar bases de datos
    const dbs = await admin.listDatabases();
    console.log('\nBases de datos disponibles:');
    dbs.databases.forEach(db => {
      console.log('  -', db.name, '(' + (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB)');
    });

    // Verificar si PixelCriticDB existe y listar colecciones
    const pixelcritic = client.db('PixelCriticDB');
    const collections = await pixelcritic.listCollections().toArray();
    if (collections.length > 0) {
      console.log('\nColecciones en PixelCriticDB:');
      for (const col of collections) {
        const count = await pixelcritic.collection(col.name).countDocuments();
        console.log('  -', col.name, '(' + count + ' documentos)');
      }
    } else {
      console.log('\nPixelCriticDB existe pero no tiene colecciones.');
    }

  } catch (err) {
    console.error('Error de conexion:', err.message);
    console.error('\nPosibles causas:');
    console.error('  1. MongoDB no esta corriendo');
    console.error('  2. La URI es incorrecta');
    console.error('  3. Firewall bloqueando la conexion');
    console.error('  4. Servicio de MongoDB no instalado');
    process.exit(1);
  } finally {
    if (client) await client.close();
    console.log('\nConexion cerrada.');
  }
}

testConnection();
