require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// ============================================
// PixelCritic - Modulo CRUD (CLI)
// Base de Datos II - Uneti
// Equipo Tecno Capibara
//
// Opera sobre PixelCriticDB. Si la BD esta
// vacia, la auto-puebla con los mismos datos
// que usa la aplicacion web (seed-data.js).
//
// Operaciones CRUD:
//   CREATE  -> Inserta 2 juegos de prueba
//   READ    -> Muestra TODOS los juegos en tabla
//   UPDATE  -> Modifica precio de un juego real
//   DELETE  -> Elimina solo los juegos de prueba
//   CONSULTA -> $gt (precio > $50) + sort descendente
// ============================================

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("=== PixelCritic - Base de Datos II ===");
    console.log("Equipo Tecno Capibara");
    console.log("Conexion exitosa a MongoDB!\n");

    const db = client.db("PixelCriticDB");

    const usuariosCol = db.collection("usuarios");
    const categoriasCol = db.collection("categorias");
    const desarrolladorasCol = db.collection("desarrolladoras");
    const juegosCol = db.collection("juegos");
    const resenasCol = db.collection("resenas");

    // Verificar si la BD ya tiene datos
    const gameCount = await juegosCol.countDocuments();
    console.log("Juegos existentes en PixelCriticDB: " + gameCount);

    // ==========================================
    // AUTO-SEED: Si la BD esta vacia, poblarla
    // con los mismos datos de la aplicacion web
    // ==========================================
    if (gameCount === 0) {
      console.log("\n=== AUTO-SEED: Poblando base de datos ===");
      console.log("Usando datos de seed-data.js (compartidos con la web)...\n");

      // Importar datos de semilla (ESM dinámico)
      const seedData = await import('./src/lib/seed-data.js');

      await usuariosCol.insertMany(seedData.seedUsuarios);
      console.log("[usuarios] " + seedData.seedUsuarios.length + " insertados.");

      await categoriasCol.insertMany(seedData.seedCategorias);
      console.log("[categorias] " + seedData.seedCategorias.length + " insertadas.");

      await desarrolladorasCol.insertMany(seedData.seedDesarrolladoras);
      console.log("[desarrolladoras] " + seedData.seedDesarrolladoras.length + " insertadas.");

      await juegosCol.insertMany(seedData.seedJuegos);
      console.log("[juegos] " + seedData.seedJuegos.length + " insertados.");

      await resenasCol.insertMany(seedData.seedResenas);
      console.log("[resenas] " + seedData.seedResenas.length + " insertadas.\n");

      console.log("Base de datos poblada exitosamente. Lista para usar desde la web!\n");
    } else {
      console.log("La BD ya tiene datos. Usando los existentes...\n");
    }

    // ==========================================
    // 1. CREATE (Insertar 2 juegos de prueba)
    // ==========================================
    console.log("=== 1. CREATE (Insercion de datos) ===");

    const juegosPrueba = [
      {
        titulo: "[CLI] Half-Life 3",
        precio: 69.99,
        categoria: "Shooter",
        anioLanzamiento: 2026,
        desarrolladora: "Valve",
        descripcion: "Juego de prueba creado por el CLI. Demostracion de CREATE.",
        imagen: "https://placehold.co/400x225/1a1a2e/ef5350?text=Half-Life+3"
      },
      {
        titulo: "[CLI] The Last of Us Part III",
        precio: 59.99,
        categoria: "Accion",
        anioLanzamiento: 2026,
        desarrolladora: "Naughty Dog",
        descripcion: "Juego de prueba creado por el CLI. Demostracion de CREATE.",
        imagen: "https://placehold.co/400x225/1a1a2e/ff8a65?text=The+Last+of+Us+III"
      }
    ];

    const idsPrueba = [];
    for (const juego of juegosPrueba) {
      const result = await juegosCol.insertOne(juego);
      idsPrueba.push(result.insertedId);
      console.log("Creado: " + juego.titulo + " ($" + juego.precio + ")");
    }
    console.log("2 juegos de prueba insertados.\n");

    // ==========================================
    // 2. READ (Leer TODOS los juegos)
    // ==========================================
    console.log("=== 2. READ (Lectura de datos) ===");
    const todosLosJuegos = await juegosCol.find().toArray();
    console.log("Total de juegos en la BD: " + todosLosJuegos.length);
    console.log("(Incluye datos de la web + los 2 de prueba del CLI)\n");
    console.table(todosLosJuegos.map(j => ({
      _id: j._id.toString().substring(0, 8) + '...',
      titulo: j.titulo,
      precio: j.precio,
      categoria: j.categoria,
      desarrolladora: j.desarrolladora
    })));

    // ==========================================
    // 3. UPDATE (Actualizar precio de un juego
    //    real usando operador $set)
    // ==========================================
    console.log("\n=== 3. UPDATE (Actualizacion) ===");
    const actualizacion = await juegosCol.updateOne(
      { titulo: "EAFC 26" },
      { $set: { precio: 49.99 } }
    );
    if (actualizacion.modifiedCount > 0) {
      console.log("EAFC 26 actualizado: $59.99 -> $49.99 (operador $set)");
    } else {
      console.log("EAFC 26 no encontrado o ya tenia ese precio.");
    }

    // Leer el juego actualizado para confirmar
    const eafcActualizado = await juegosCol.findOne({ titulo: "EAFC 26" });
    if (eafcActualizado) {
      console.log("Precio actual de EAFC 26: $" + eafcActualizado.precio + "\n");
    }

    // ==========================================
    // 4. DELETE (Eliminar SOLO los juegos de
    //    prueba, los datos de la web se
    //    conservan intactos)
    // ==========================================
    console.log("=== 4. DELETE (Eliminacion) ===");
    const borrado = await juegosCol.deleteMany({
      _id: { $in: idsPrueba }
    });
    console.log("Juegos de prueba eliminados: " + borrado.deletedCount);
    console.log("Los juegos originales de la web NO fueron afectados.\n");

    // ==========================================
    // 5. CONSULTA SENCILLA (Operador $gt + sort)
    // ==========================================
    console.log("=== 5. CONSULTA SENCILLA ===");
    console.log("Juegos con precio > $50 (operador $gt)");
    console.log("Ordenados de mayor a menor (sort descendente):\n");

    const juegosCaros = await juegosCol
      .find({ precio: { $gt: 50 } })
      .sort({ precio: -1 })
      .toArray();

    if (juegosCaros.length > 0) {
      console.table(juegosCaros.map(j => ({
        titulo: j.titulo,
        precio: "$" + j.precio.toFixed(2),
        categoria: j.categoria,
        ano: j.anioLanzamiento
      })));
      console.log("\nTotal de juegos premium encontrados: " + juegosCaros.length);
    } else {
      console.log("No se encontraron juegos con precio mayor a $50.");
    }

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    const totalFinal = await juegosCol.countDocuments();
    console.log("\n=== RESUMEN DEL PROCESO CRUD ===");
    console.log("CREATE: 2 juegos de prueba insertados (Half-Life 3, The Last of Us Part III)");
    console.log("READ:   " + todosLosJuegos.length + " juegos leidos y mostrados en tabla");
    console.log("UPDATE: EAFC 26 actualizado con operador $set (precio reducido)");
    console.log("DELETE: 2 juegos de prueba eliminados (solo los creados por el CLI)");
    console.log("QUERY:  " + juegosCaros.length + " juegos con precio > $50 encontrados usando $gt + sort");
    console.log("\nJuegos en BD antes: " + gameCount + " | Despues: " + totalFinal);
    console.log("(Los datos de la aplicacion web estan intactos)");

  } finally {
    await client.close();
    console.log("\nConexion a MongoDB cerrada.");
  }
}

run().catch(console.dir);
