import { connectToDatabase } from '@/lib/mongodb';

// ============================================
// GET /api/categorias - Obtener todas las categorias
// ============================================
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const categorias = await db.collection("categorias").find({}).toArray();
    return Response.json(categorias);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST /api/categorias - Crear nueva categoria
// ============================================
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    if (!body.nombre) {
      return Response.json({ error: "Nombre de categoria requerido" }, { status: 400 });
    }

    const nueva = {
      nombre: body.nombre,
      descripcion: body.descripcion || "",
      popularidad: body.popularidad || "Media",
      aptaParaNinos: body.aptaParaNinos !== undefined ? body.aptaParaNinos : true,
    };

    const result = await db.collection("categorias").insertOne(nueva);
    return Response.json({ insertedId: result.insertedId, ...nueva }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
