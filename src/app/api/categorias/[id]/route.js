import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ============================================
// PUT /api/categorias/[id] - Actualizar categoria
// DELETE /api/categorias/[id] - Eliminar categoria
// ============================================

export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const update = {};

    if (body.nombre !== undefined) update.nombre = body.nombre;
    if (body.descripcion !== undefined) update.descripcion = body.descripcion;
    if (body.popularidad !== undefined) update.popularidad = body.popularidad;
    if (body.aptaParaNinos !== undefined) update.aptaParaNinos = body.aptaParaNinos;

    const result = await db.collection("categorias").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Categoria no encontrada" }, { status: 404 });
    }

    return Response.json({ updated: result.modifiedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    const result = await db.collection("categorias").deleteOne(
      { _id: new ObjectId(id) }
    );

    if (result.deletedCount === 0) {
      return Response.json({ error: "Categoria no encontrada" }, { status: 404 });
    }

    return Response.json({ deletedCount: result.deletedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
