import { connectToDatabase } from '@/lib/mongodb';

// ============================================
// GET /api/desarrolladoras - Obtener todas las desarrolladoras
// ============================================
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const desarrolladoras = await db.collection("desarrolladoras").find({}).toArray();
    return Response.json(desarrolladoras);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST /api/desarrolladoras - Crear nueva desarrolladora
// ============================================
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    if (!body.nombre) {
      return Response.json({ error: "Nombre de desarrolladora requerido" }, { status: 400 });
    }

    const nueva = {
      nombre: body.nombre,
      pais: body.pais || "",
      anioFundacion: parseInt(body.anioFundacion) || new Date().getFullYear(),
      sitioWeb: body.sitioWeb || "",
    };

    const result = await db.collection("desarrolladoras").insertOne(nueva);
    return Response.json({ insertedId: result.insertedId, ...nueva }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
