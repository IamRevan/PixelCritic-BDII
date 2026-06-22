import { connectToDatabase } from '@/lib/mongodb';
import { seedUsuarios, seedCategorias, seedDesarrolladoras, seedJuegos, seedResenas } from '@/lib/seed-data';

// ============================================
// POST /api/login - Autenticar usuario
// Si la BD esta vacia, la auto-puebla COMPLETA
// (usuarios, categorias, desarrolladoras,
// juegos y resenas) para que todo funcione
// desde el primer login.
// ============================================
export async function POST(request) {
  try {
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
    } catch (connErr) {
      return Response.json({
        error: "No se puede conectar a MongoDB. Verifica que el servicio este corriendo (mongod)."
      }, { status: 503 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "Usuario y contrasena requeridos" }, { status: 400 });
    }

    // Auto-poblar la BD completa si esta vacia
    const gameCount = await db.collection("juegos").countDocuments();

    if (gameCount === 0) {
      try {
        await db.collection("usuarios").insertMany(seedUsuarios);
        await db.collection("categorias").insertMany(seedCategorias);
        await db.collection("desarrolladoras").insertMany(seedDesarrolladoras);
        await db.collection("juegos").insertMany(seedJuegos);
        await db.collection("resenas").insertMany(seedResenas);
      } catch (seedErr) {
        // Si ya se insertaron en otro request, ignorar
      }
    }

    // Buscar el usuario
    const usuario = await db.collection("usuarios").findOne({ username });

    if (!usuario) {
      return Response.json({
        error: "Usuario no encontrado. Usa: admin / admin123"
      }, { status: 401 });
    }

    if (usuario.password !== password) {
      return Response.json({ error: "Contrasena incorrecta" }, { status: 401 });
    }

    if (!usuario.activo) {
      return Response.json({ error: "Cuenta desactivada. Contacte al administrador." }, { status: 403 });
    }

    const { password: _, ...userData } = usuario;
    return Response.json({ ...userData });
  } catch (error) {
    return Response.json({ error: "Error interno: " + error.message }, { status: 500 });
  }
}
