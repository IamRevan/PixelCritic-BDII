import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ============================================
// PUT /api/resenas/[id] - Actualizar una resena
// Recalcula la calificacion promedio del juego
// ============================================
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    if (!body.calificacion || !body.comentario) {
      return Response.json({ error: "Faltan campos requeridos: calificacion, comentario" }, { status: 400 });
    }

    const calificacion = parseInt(body.calificacion);
    if (calificacion < 1 || calificacion > 5) {
      return Response.json({ error: "La calificacion debe ser entre 1 y 5" }, { status: 400 });
    }

    const resena = await db.collection("resenas").findOne({ _id: new ObjectId(id) });
    if (!resena) {
      return Response.json({ error: "Resena no encontrada" }, { status: 404 });
    }

    const juegoTitulo = resena.juego;

    await db.collection("resenas").updateOne(
      { _id: new ObjectId(id) },
      { $set: { calificacion: calificacion, comentario: body.comentario } }
    );

    // Recalcular calificacion promedio del juego
    const todasResenas = await db.collection("resenas").find({ juego: juegoTitulo }).toArray();
    const promedio = todasResenas.reduce((s, r) => s + r.calificacion, 0) / todasResenas.length;
    await db.collection("juegos").updateOne(
      { titulo: juegoTitulo },
      { $set: { calificacion: Math.round(promedio * 10) / 10 } }
    );

    return Response.json({ message: "Resena actualizada" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// DELETE /api/resenas/[id] - Eliminar una resena
// Recalcula la calificacion promedio del juego
// ============================================
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    // Obtener el juego antes de eliminar para recalcular
    const resena = await db.collection("resenas").findOne({ _id: new ObjectId(id) });
    if (!resena) {
      return Response.json({ error: "Resena no encontrada" }, { status: 404 });
    }

    const juegoTitulo = resena.juego;

    const result = await db.collection("resenas").deleteOne(
      { _id: new ObjectId(id) }
    );

    // Recalcular calificacion promedio del juego
    const todasResenas = await db.collection("resenas").find({ juego: juegoTitulo }).toArray();
    const promedio = todasResenas.length > 0
      ? Math.round((todasResenas.reduce((s, r) => s + r.calificacion, 0) / todasResenas.length) * 10) / 10
      : 0;
    await db.collection("juegos").updateOne(
      { titulo: juegoTitulo },
      { $set: { calificacion: promedio } }
    );

    return Response.json({ deletedCount: result.deletedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
