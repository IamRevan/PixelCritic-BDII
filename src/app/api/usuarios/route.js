import { connectToDatabase } from '@/lib/mongodb';

// ============================================
// GET /api/usuarios - Obtener todos los usuarios
// ============================================
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    // No devolver el campo password por seguridad
    const usuarios = await db.collection("usuarios").find({}).project({ password: 0 }).toArray();
    return Response.json(usuarios);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST /api/usuarios - Crear un nuevo usuario
// ============================================
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    if (!body.username || !body.email || !body.password) {
      return Response.json({ error: "Faltan campos requeridos: username, email, password" }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existente = await db.collection("usuarios").findOne({ username: body.username });
    if (existente) {
      return Response.json({ error: "El nombre de usuario ya existe" }, { status: 409 });
    }

    const nuevoUsuario = {
      username: body.username,
      email: body.email,
      edad: parseInt(body.edad) || 18,
      activo: body.activo !== undefined ? body.activo : true,
      rol: body.rol || "user",
      password: body.password,
    };

    const result = await db.collection("usuarios").insertOne(nuevoUsuario);
    return Response.json({ insertedId: result.insertedId, username: nuevoUsuario.username, rol: nuevoUsuario.rol }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
