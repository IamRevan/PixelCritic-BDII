import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ============================================
// PUT /api/desarrolladoras/[id] - Actualizar desarrolladora
// DELETE /api/desarrolladoras/[id] - Eliminar desarrolladora
// ============================================

export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const update = {};

    if (body.nombre !== undefined) update.nombre = body.nombre;
    if (body.pais !== undefined) update.pais = body.pais;
    if (body.anioFundacion !== undefined) update.anioFundacion = parseInt(body.anioFundacion);
    if (body.sitioWeb !== undefined) update.sitioWeb = body.sitioWeb;

    const result = await db.collection("desarrolladoras").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Desarrolladora no encontrada" }, { status: 404 });
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

    const result = await db.collection("desarrolladoras").deleteOne(
      { _id: new ObjectId(id) }
    );

    if (result.deletedCount === 0) {
      return Response.json({ error: "Desarrolladora no encontrada" }, { status: 404 });
    }

    return Response.json({ deletedCount: result.deletedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
