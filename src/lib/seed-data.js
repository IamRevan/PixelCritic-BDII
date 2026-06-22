// ============================================
// Datos de semilla para Poblar PixelCriticDB
// Juegos y datos completamente reales
// ============================================

export const seedUsuarios = [
  { username: "admin", email: "admin@pixelcritic.com", edad: 30, activo: true, rol: "admin", password: "admin123" },
  { username: "MariangelO", email: "mari@correo.com", edad: 21, activo: true, rol: "editor", password: "mari123" },
  { username: "SamuelJ", email: "samuel@correo.com", edad: 22, activo: true, rol: "admin", password: "samuel123" },
  { username: "FabianaR", email: "fabi@correo.com", edad: 20, activo: true, rol: "editor", password: "fabi123" },
  { username: "YeismarR", email: "yeismar@correo.com", edad: 21, activo: true, rol: "user", password: "yeismar123" },
  { username: "AdminCapibara", email: "admin@capibara.ve", edad: 25, activo: true, rol: "admin", password: "capibara2025" },
];

export const seedCategorias = [
  { nombre: "RPG", descripcion: "Juegos de rol con desarrollo de personajes y narrativa profunda", popularidad: "Alta", aptaParaNinos: false },
  { nombre: "Accion", descripcion: "Juegos intensos con combates y reflejos rapidos", popularidad: "Muy Alta", aptaParaNinos: false },
  { nombre: "Aventura", descripcion: "Exploracion, puzzles y narrativa envolvente", popularidad: "Alta", aptaParaNinos: true },
  { nombre: "Deportes", descripcion: "Simulaciones deportivas realistas", popularidad: "Media", aptaParaNinos: true },
  { nombre: "Estrategia", descripcion: "Planificacion y toma de decisiones tacticas", popularidad: "Media", aptaParaNinos: true },
  { nombre: "Shooter", descripcion: "Disparos en primera y tercera persona", popularidad: "Alta", aptaParaNinos: false },
];

export const seedDesarrolladoras = [
  { nombre: "Capibara Studios", pais: "Venezuela", anioFundacion: 2023, sitioWeb: "www.capibarastudios.ve" },
  { nombre: "Atlus", pais: "Japon", anioFundacion: 1986, sitioWeb: "www.atlus.com" },
  { nombre: "Warhorse Studios", pais: "Republica Checa", anioFundacion: 2011, sitioWeb: "www.warhorsestudios.cz" },
  { nombre: "Eidos Montreal", pais: "Canada", anioFundacion: 2007, sitioWeb: "www.eidosmontreal.com" },
  { nombre: "Asobo Studio", pais: "Francia", anioFundacion: 2002, sitioWeb: "www.asobostudio.com" },
  { nombre: "Rockstar Games", pais: "EEUU", anioFundacion: 1998, sitioWeb: "www.rockstargames.com" },
  { nombre: "FromSoftware", pais: "Japon", anioFundacion: 1986, sitioWeb: "www.fromsoftware.jp" },
  { nombre: "CD Projekt Red", pais: "Polonia", anioFundacion: 2002, sitioWeb: "www.cdprojektred.com" },
  { nombre: "EA Sports", pais: "EEUU", anioFundacion: 1991, sitioWeb: "www.ea.com" },
  { nombre: "Square Enix", pais: "Japon", anioFundacion: 1975, sitioWeb: "www.square-enix.com" },
  { nombre: "Nintendo", pais: "Japon", anioFundacion: 1889, sitioWeb: "www.nintendo.com" },
  { nombre: "Epic Games", pais: "EEUU", anioFundacion: 1991, sitioWeb: "www.epicgames.com" },
  { nombre: "Larian Studios", pais: "Belgica", anioFundacion: 1996, sitioWeb: "www.larian.com" },
  { nombre: "BioWare", pais: "Canada", anioFundacion: 1995, sitioWeb: "www.bioware.com" },
];

// URLs de imagenes por categoria usando placehold.co
// Cada juego obtiene una imagen con su nombre y color de categoria
const img = (name, cat) => {
  const colors = { RPG: 'ddb7ff', Accion: 'ff8a65', Aventura: '4ae176', Deportes: '64b5f6', Estrategia: 'ffd54f', Shooter: 'ef5350' };
  return `https://placehold.co/400x225/1a1a2e/${colors[cat] || 'ddb7ff'}?text=${encodeURIComponent(name)}`;
};

export const seedJuegos = [
  { titulo: "Persona 3 Reload", precio: 69.99, categoria: "RPG", anioLanzamiento: 2024, calificacion: 4.8, desarrolladora: "Atlus", descripcion: "El clasico renovado con graficos modernos y mecanicas mejoradas. Una historia de vida, muerte y amistad.", imagen: img("Persona 3 Reload", "RPG"), favorito: true },
  { titulo: "Persona 5 Royal", precio: 59.99, categoria: "RPG", anioLanzamiento: 2022, calificacion: 4.9, desarrolladora: "Atlus", descripcion: "La version definitiva del aclamado RPG. Una experiencia vibrante y estilizada sobre rebeldes y corazones robados.", imagen: img("Persona 5 Royal", "RPG"), favorito: true },
  { titulo: "Kingdom Come: Deliverance II", precio: 69.99, categoria: "Aventura", anioLanzamiento: 2025, calificacion: 4.6, desarrolladora: "Warhorse Studios", descripcion: "La secuela del RPG medieval mas realista. Continua la historia de Henry en un mundo abierto detallado.", imagen: img("Kingdom Come II", "Aventura"), favorito: true },
  { titulo: "Kingdom Come: Deliverance", precio: 29.99, categoria: "Aventura", anioLanzamiento: 2018, calificacion: 4.3, desarrolladora: "Warhorse Studios", descripcion: "RPG medieval hiperrealista con combate autentico y una historia de venganza y redencion.", imagen: img("Kingdom Come", "Aventura"), favorito: true },
  { titulo: "Deus Ex: Mankind Divided", precio: 19.99, categoria: "Accion", anioLanzamiento: 2016, calificacion: 4.0, desarrolladora: "Eidos Montreal", descripcion: "Cyberpunk y conspiracy thriller. Adam Jensen regresa en un mundo dividido entre humanos y aumentados.", imagen: img("Deus Ex MD", "Accion"), favorito: false },
  { titulo: "Deus Ex: Human Revolution", precio: 14.99, categoria: "Accion", anioLanzamiento: 2011, calificacion: 4.2, desarrolladora: "Eidos Montreal", descripcion: "El origen de Adam Jensen. Un thriller cibernetico sobre conspiraciones y el futuro de la humanidad.", imagen: img("Deus Ex HR", "Accion"), favorito: false },
  { titulo: "A Plague Tale: Requiem", precio: 49.99, categoria: "Aventura", anioLanzamiento: 2022, calificacion: 4.6, desarrolladora: "Asobo Studio", descripcion: "La desgarradora continuacion de la saga de Amicia y Hugo. Una aventura emocional en la Francia medieval asolada por la peste.", imagen: img("Plague Tale Requiem", "Aventura"), favorito: true },
  { titulo: "A Plague Tale: Innocence", precio: 39.99, categoria: "Aventura", anioLanzamiento: 2019, calificacion: 4.4, desarrolladora: "Asobo Studio", descripcion: "Una conmovedora historia de dos hermanos sobreviviendo en un mundo devastado por la Inquisicion y la peste.", imagen: img("Plague Tale Innocence", "Aventura"), favorito: false },
  { titulo: "The Legend of Capibara", precio: 19.99, categoria: "Aventura", anioLanzamiento: 2025, calificacion: 5.0, desarrolladora: "Capibara Studios", descripcion: "Una epica aventura donde guias a un capibara legendario a traves de mundos fantasticos llenos de secretos.", imagen: img("The Legend of Capibara", "Aventura"), favorito: true },
  { titulo: "Grand Theft Auto VI", precio: 69.99, categoria: "Accion", anioLanzamiento: 2025, calificacion: 4.7, desarrolladora: "Rockstar Games", descripcion: "El regreso definitivo de la saga mas iconica. Una historia sin precedentes en un mundo abierto revolucionario.", imagen: img("GTA VI", "Accion"), favorito: true },
  { titulo: "Elden Ring", precio: 59.99, categoria: "RPG", anioLanzamiento: 2022, calificacion: 4.9, desarrolladora: "FromSoftware", descripcion: "La obra maestra de FromSoftware. Un mundo abierto epico creado en colaboracion con George R.R. Martin.", imagen: img("Elden Ring", "RPG"), favorito: true },
  { titulo: "Cyberpunk 2077", precio: 49.99, categoria: "Accion", anioLanzamiento: 2020, calificacion: 4.2, desarrolladora: "CD Projekt Red", descripcion: "RPG de mundo abierto en la metropoli futurista de Night City. Una historia de poder y transformacion.", imagen: img("Cyberpunk 2077", "Accion"), favorito: false },
  { titulo: "The Witcher 3: Wild Hunt", precio: 39.99, categoria: "RPG", anioLanzamiento: 2015, calificacion: 4.8, desarrolladora: "CD Projekt Red", descripcion: "El aclamado RPG de mundo abierto. Geralt de Rivia en una busqueda epica a traves de reinos fantasticos.", imagen: img("The Witcher 3", "RPG"), favorito: true },
  { titulo: "EAFC 26", precio: 59.99, categoria: "Deportes", anioLanzamiento: 2026, calificacion: 3.5, desarrolladora: "EA Sports", descripcion: "La nueva entrega del simulador de futbol con mejoras en fisicas e inteligencia artificial.", imagen: img("EAFC 26", "Deportes"), favorito: false },
  { titulo: "Final Fantasy XVII", precio: 79.99, categoria: "RPG", anioLanzamiento: 2026, calificacion: 4.0, desarrolladora: "Square Enix", descripcion: "Una nueva saga de fantasia con graficos de proxima generacion y un sistema de combate completamente reimaginado.", imagen: img("Final Fantasy XVII", "RPG"), favorito: false },
  { titulo: "Baldur's Gate 3", precio: 59.99, categoria: "RPG", anioLanzamiento: 2023, calificacion: 4.9, desarrolladora: "Larian Studios", descripcion: "El RPG del ano. Una aventura epica basada en Dungeons & Dragons con libertad total y consecuencias reales.", imagen: img("Baldur's Gate 3", "RPG"), favorito: true },
  { titulo: "Baldur's Gate II: Shadows of Amn", precio: 9.99, categoria: "RPG", anioLanzamiento: 2000, calificacion: 4.7, desarrolladora: "BioWare", descripcion: "El clasico del RPG occidental. Una historia de venganza y redencion con personajes inolvidables.", imagen: img("Baldur's Gate II", "RPG"), favorito: false },
];

export const seedResenas = [
  { autor: "MariangelO", juego: "Persona 5 Royal", calificacion: 5, comentario: "La obra maestra del JRPG moderno. Mas de 100 horas de pura excelencia." },
  { autor: "SamuelJ", juego: "Elden Ring", calificacion: 5, comentario: "El mejor juego de la decada. Dificil pero gratificante en cada esquina." },
  { autor: "FabianaR", juego: "A Plague Tale: Requiem", calificacion: 5, comentario: "Una experiencia cinematografica desgarradora. Los graficos son increibles." },
  { autor: "YeismarR", juego: "Kingdom Come: Deliverance II", calificacion: 4, comentario: "El realismo medieval es impresionante. La historia mejora mucho respecto al primero." },
  { autor: "MariangelO", juego: "Persona 3 Reload", calificacion: 5, comentario: "Revivieron el clasico perfectamente. La banda sonora sigue siendo epica." },
  { autor: "SamuelJ", juego: "Cyberpunk 2077", calificacion: 4, comentario: "Despues de las actualizaciones, es el juego que debio ser desde el inicio." },
  { autor: "FabianaR", juego: "The Witcher 3: Wild Hunt", calificacion: 5, comentario: "Sigue siendo el rey de los RPG. Las misiones secundarias son mejores que la mayoria de juegos completos." },
  { autor: "YeismarR", juego: "Deus Ex: Mankind Divided", calificacion: 3, comentario: "Buen juego pero muy corto. Deja con ganas de mas." },
  { autor: "MariangelO", juego: "The Legend of Capibara", calificacion: 5, comentario: "Obra maestra 10/10. Una experiencia que no olvidaras jamas." },
  { autor: "AdminCapibara", juego: "EAFC 26", calificacion: 2, comentario: "Mas de lo mismo cada ano. Sin innovacion real." },
  { autor: "UsuarioBaneado", juego: "The Legend of Capibara", calificacion: 1, comentario: "No me gusto, aburrido." },
  { autor: "SamuelJ", juego: "Grand Theft Auto VI", calificacion: 5, comentario: "Rockstar lo ha vuelto a hacer. El mundo abierto mas detallado de la historia." },
  { autor: "FabianaR", juego: "Deus Ex: Human Revolution", calificacion: 4, comentario: "Un clasico del cyberpunk. La historia y la ambientacion son fantasticas." },
  { autor: "YeismarR", juego: "Kingdom Come: Deliverance", calificacion: 5, comentario: "El RPG mas autentico jamas creado. El combate requiere maestria real." },
  { autor: "SamuelJ", juego: "Baldur's Gate 3", calificacion: 5, comentario: "El RPG definitivo. Larian Studios se supero a si mismos con esta obra maestra." },
  { autor: "MariangelO", juego: "Baldur's Gate 3", calificacion: 5, comentario: "Horas y horas de contenido de calidad. Cada decision importa." },
  { autor: "FabianaR", juego: "Baldur's Gate II: Shadows of Amn", calificacion: 4, comentario: "Un clasico que todo amante de los RPG debe jugar al menos una vez." },
];
