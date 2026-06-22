import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ============================================
// GET /api/juegos - Obtener todos los juegos
// ============================================
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const juegos = await db.collection("juegos").find({}).toArray();
    return Response.json(juegos);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST /api/juegos - Crear un nuevo juego
// ============================================
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Validar campos requeridos
    if (!body.titulo || !body.precio || !body.categoria) {
      return Response.json({ error: "Faltan campos requeridos: titulo, precio, categoria" }, { status: 400 });
    }

    const nuevoJuego = {
      titulo: body.titulo,
      precio: parseFloat(body.precio),
      categoria: body.categoria,
      anioLanzamiento: parseInt(body.anioLanzamiento) || new Date().getFullYear(),
      calificacion: body.calificacion || 0,
      desarrolladora: body.desarrolladora || "Sin asignar",
      descripcion: body.descripcion || "",
      imagen: body.imagen || "",
      favorito: body.favorito !== undefined ? body.favorito : false,
    };

    const result = await db.collection("juegos").insertOne(nuevoJuego);
    return Response.json({ insertedId: result.insertedId, ...nuevoJuego }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
