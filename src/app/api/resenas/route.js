import { connectToDatabase } from '@/lib/mongodb';

// ============================================
// GET /api/resenas - Obtener todas las resenas
// ============================================
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const resenas = await db.collection("resenas").find({}).toArray();
    return Response.json(resenas);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST /api/resenas - Crear una nueva resena
// ============================================
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    if (!body.autor || !body.juego || !body.calificacion || !body.comentario) {
      return Response.json({ error: "Faltan campos requeridos: autor, juego, calificacion, comentario" }, { status: 400 });
    }

    const calificacion = parseInt(body.calificacion);
    if (calificacion < 1 || calificacion > 5) {
      return Response.json({ error: "La calificacion debe ser entre 1 y 5" }, { status: 400 });
    }

    const nuevaResena = {
      autor: body.autor,
      juego: body.juego,
      calificacion: calificacion,
      comentario: body.comentario,
      fecha: new Date().toISOString(),
    };

    const result = await db.collection("resenas").insertOne(nuevaResena);

    // Recalcular calificacion promedio del juego
    const todasResenas = await db.collection("resenas").find({ juego: body.juego }).toArray();
    const promedio = todasResenas.reduce((s, r) => s + r.calificacion, 0) / todasResenas.length;
    await db.collection("juegos").updateOne(
      { titulo: body.juego },
      { $set: { calificacion: Math.round(promedio * 10) / 10 } }
    );

    return Response.json({ insertedId: result.insertedId, ...nuevaResena }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
