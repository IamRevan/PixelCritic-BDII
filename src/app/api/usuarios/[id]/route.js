import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ============================================
// PUT /api/usuarios/[id] - Actualizar un usuario
// ============================================
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    const camposActualizables = {};
    if (body.username !== undefined) camposActualizables.username = body.username;
    if (body.email !== undefined) camposActualizables.email = body.email;
    if (body.edad !== undefined) camposActualizables.edad = parseInt(body.edad);
    if (body.activo !== undefined) camposActualizables.activo = body.activo;
    if (body.rol !== undefined) camposActualizables.rol = body.rol;

    const result = await db.collection("usuarios").updateOne(
      { _id: new ObjectId(id) },
      { $set: camposActualizables }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return Response.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// DELETE /api/usuarios/[id] - Eliminar un usuario
// ============================================
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    const result = await db.collection("usuarios").deleteOne(
      { _id: new ObjectId(id) }
    );

    if (result.deletedCount === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return Response.json({ deletedCount: result.deletedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
