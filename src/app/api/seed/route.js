import { connectToDatabase } from '@/lib/mongodb';
import {
  seedUsuarios,
  seedCategorias,
  seedDesarrolladoras,
  seedJuegos,
  seedResenas,
} from '@/lib/seed-data';

// ============================================
// POST /api/seed - Poblar la BD con datos iniciales
// Elimina la BD actual y recrea todo desde cero
// ============================================
export async function POST() {
  try {
    const { db } = await connectToDatabase();

    // Eliminar la base de datos completa para evitar duplicados
    await db.dropDatabase();

    // Insertar datos de semilla en las 5 colecciones
    const usuariosResult = await db.collection("usuarios").insertMany(seedUsuarios);
    const categoriasResult = await db.collection("categorias").insertMany(seedCategorias);
    const desarrolladorasResult = await db.collection("desarrolladoras").insertMany(seedDesarrolladoras);
    const juegosResult = await db.collection("juegos").insertMany(seedJuegos);
    const resenasResult = await db.collection("resenas").insertMany(seedResenas);

    return Response.json({
      mensaje: "Base de datos PixelCriticDB poblada exitosamente",
      colecciones: {
        usuarios: usuariosResult.insertedCount,
        categorias: categoriasResult.insertedCount,
        desarrolladoras: desarrolladorasResult.insertedCount,
        juegos: juegosResult.insertedCount,
        resenas: resenasResult.insertedCount,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
