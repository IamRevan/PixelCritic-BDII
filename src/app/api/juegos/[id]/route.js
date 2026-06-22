import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ============================================
// GET /api/juegos/[id] - Obtener un juego por ID
// ============================================
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    const juego = await db.collection("juegos").findOne({ _id: new ObjectId(id) });

    if (!juego) {
      return Response.json({ error: "Juego no encontrado" }, { status: 404 });
    }

    return Response.json(juego);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// PUT /api/juegos/[id] - Actualizar un juego
// ============================================
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    const camposActualizables = {};
    if (body.titulo !== undefined) camposActualizables.titulo = body.titulo;
    if (body.precio !== undefined) camposActualizables.precio = parseFloat(body.precio);
    if (body.categoria !== undefined) camposActualizables.categoria = body.categoria;
    if (body.anioLanzamiento !== undefined) camposActualizables.anioLanzamiento = parseInt(body.anioLanzamiento);
    if (body.desarrolladora !== undefined) camposActualizables.desarrolladora = body.desarrolladora;
    if (body.descripcion !== undefined) camposActualizables.descripcion = body.descripcion;
    if (body.calificacion !== undefined) camposActualizables.calificacion = parseFloat(body.calificacion);
    if (body.imagen !== undefined) camposActualizables.imagen = body.imagen;
    if (body.favorito !== undefined) camposActualizables.favorito = body.favorito;

    if (Object.keys(camposActualizables).length === 0) {
      return Response.json({ error: "No se enviaron campos para actualizar" }, { status: 400 });
    }

    const result = await db.collection("juegos").updateOne(
      { _id: new ObjectId(id) },
      { $set: camposActualizables }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Juego no encontrado" }, { status: 404 });
    }

    return Response.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// DELETE /api/juegos/[id] - Eliminar un juego
// ============================================
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    const result = await db.collection("juegos").deleteOne(
      { _id: new ObjectId(id) }
    );

    if (result.deletedCount === 0) {
      return Response.json({ error: "Juego no encontrado" }, { status: 404 });
    }

    return Response.json({ deletedCount: result.deletedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
