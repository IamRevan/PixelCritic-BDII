# PixelCritic - Base de Datos II (Uneti)

**PixelCritic** es una plataforma de catalogos y resenas de videojuegos desarrollada como proyecto academico para la unidad curricular **Base de Datos II** en la **Universidad Nacional Experimental de las Telecomunicaciones e Informatica (Uneti)**.

## Equipo Tecno Capibara

- Mariangel Ortiz
- Samuel Jimenez
- Fabiana Rodriguez
- Yeismar Ruiz
- Roiner Martinez

## Descripcion del Proyecto

El proyecto consta de dos modos de ejecucion que comparten la misma base de datos `PixelCriticDB` sin interferir entre si:

1. **Modulo CRUD (CLI)**: Script en Node.js puro (`index.js`) que ejecuta operaciones Create, Read, Update, Delete y una consulta sencilla con operadores de MongoDB (`$gt`, `$set`, `sort`). Opera directamente sobre `PixelCriticDB` creando un unico documento temporal que luego elimina, sin afectar los datos de la web.

2. **Aplicacion Web (Next.js + Tailwind CSS)**: Interfaz grafica con autenticacion de usuarios (roles: admin, editor, user), panel de administracion con CRUD completo (juegos, usuarios, categorias, desarrolladoras, resenas), catalogo interactivo con filtros y busqueda, pagina de detalle de juegos con formulario de resenas, y pagina premium con juegos mejor calificados.

## Estructura de la Base de Datos

El sistema utiliza MongoDB con la base de datos `PixelCriticDB` que contiene **5 colecciones**:

### Coleccion: usuarios
| Campo    | Tipo    | Descripcion                         |
|----------|---------|-------------------------------------|
| username | String  | Nombre de usuario (unico)           |
| email    | String  | Correo electronico                  |
| edad     | Number  | Edad del usuario                    |
| activo   | Boolean | Estado de la cuenta                 |
| rol      | String  | Rol: admin, editor, user            |
| password | String  | Contrasena de acceso                |

### Coleccion: categorias
| Campo         | Tipo    | Descripcion                    |
|---------------|---------|--------------------------------|
| nombre        | String  | Nombre de la categoria         |
| descripcion   | String  | Descripcion del genero         |
| popularidad   | String  | Nivel: Baja, Media, Alta       |
| aptaParaNinos | Boolean | Indicador de contenido infantil|

### Coleccion: desarrolladoras
| Campo         | Tipo   | Descripcion                      |
|---------------|--------|----------------------------------|
| nombre        | String | Nombre de la empresa             |
| pais          | String | Pais de origen                   |
| anioFundacion | Number | Ano de fundacion                 |
| sitioWeb      | String | Sitio web oficial                |

### Coleccion: juegos
| Campo           | Tipo   | Descripcion                      |
|-----------------|--------|----------------------------------|
| titulo          | String | Nombre del juego                 |
| precio          | Number | Precio en USD                    |
| categoria       | String | Genero del juego                 |
| anioLanzamiento | Number | Ano de lanzamiento               |
| desarrolladora  | String | Empresa desarrolladora           |
| descripcion     | String | Descripcion del juego            |
| calificacion    | Number | Calificacion promedio (0-5)      |

### Coleccion: resenas
| Campo        | Tipo   | Descripcion                      |
|--------------|--------|----------------------------------|
| autor        | String | Usuario que escribio la resena   |
| juego        | String | Titulo del juego reseñado        |
| calificacion | Number | Puntuacion del 1 al 5            |
| comentario   | String | Texto de la resena               |
| fecha        | String | Fecha de publicacion (ISO)       |

## Requisitos Previos

- Node.js v18 o superior
- MongoDB corriendo en `localhost:27017` (o instancia remota via MONGO_URI)
- npm (incluido con Node.js)
- Git (para clonar el repositorio)

## Instrucciones de Instalacion y Ejecucion

### 1. Clonar el Repositorio

Abre tu terminal y ejecuta:

```bash
git clone https://github.com/tu-usuario/PixelCritic-TecnoCapibara.git
cd PixelCritic-TecnoCapibara
```

### 2. Instalar las Dependencias

```bash
npm install
```

Este comando instalara todas las dependencias necesarias listadas en `package.json`:

- `mongodb` - Driver nativo de MongoDB para Node.js
- `dotenv` - Manejo de variables de entorno
- `next` - Framework web React
- `react` / `react-dom` - Librerias de interfaz de usuario
- `tailwindcss` / `postcss` / `autoprefixer` - Estilos CSS

### 3. Configurar Variables de Entorno

Crea un archivo llamado `.env` en la raiz del proyecto con el siguiente contenido:

```
MONGO_URI=mongodb://127.0.0.1:27017
```

Si utilizas MongoDB Atlas, reemplaza la URI por la cadena de conexion de tu cluster.

Nota: El archivo `.env` no debe subirse al repositorio (ya esta incluido en `.gitignore`).

### 4. Ejecutar el Modulo CRUD (CLI - Modo Academico)

Este comando ejecuta el script `index.js` que demuestra paso a paso las operaciones CRUD:

```bash
npm start
```

Lo que hara el script (sin afectar los datos creados por la web):

1. **AUTO-SEED** (solo si la BD esta vacia): Pobla automaticamente las 5 colecciones con los mismos datos de `seed-data.js` que usa la web. Asi ambos modos comparten la misma informacion.
2. **CREATE**: Insertara 2 juegos de prueba temporales (`[CLI] Half-Life 3` y `[CLI] The Last of Us Part III`) para demostrar la insercion multiple
3. **READ**: Consultara y mostrara TODOS los juegos en formato de tabla en la consola (los de la web + los temporales)
4. **UPDATE**: Actualizara el precio de `EAFC 26` usando el operador `$set` (de $59.99 a $49.99)
5. **DELETE**: Eliminara SOLO los 2 juegos de prueba, dejando los datos originales intactos
6. **CONSULTA**: Filtrara juegos con precio mayor a $50 (operador `$gt`) y los ordenara de forma descendente con `sort()`

Salida esperada en consola:

```
=== PixelCritic - Base de Datos II ===
Equipo Tecno Capibara
Conexion exitosa a MongoDB!

Juegos existentes en PixelCriticDB: 0

=== AUTO-SEED: Poblando base de datos ===
Usando datos de seed-data.js (compartidos con la web)...

[usuarios] 6 insertados.
[categorias] 6 insertadas.
[desarrolladoras] 14 insertadas.
[juegos] 17 insertados.
[resenas] 18 insertadas.

Base de datos poblada exitosamente.

=== 1. CREATE (Insercion de datos) ===
Creado: [CLI] Half-Life 3 ($69.99)
Creado: [CLI] The Last of Us Part III ($59.99)

=== 2. READ (Lectura de datos) ===
Total de juegos en la BD: 19
(tabla con todos los juegos)

=== 3. UPDATE (Actualizacion) ===
EAFC 26 actualizado: $59.99 -> $49.99 (operador $set)

=== 4. DELETE (Eliminacion) ===
Juegos de prueba eliminados: 2

=== 5. CONSULTA SENCILLA ===
Juegos con precio > $50 (operador $gt) ordenados de mayor a menor:
(tabla con juegos filtrados)
```

**Nota:** Si la base de datos esta vacia, el CLI la pobla automaticamente con 17 juegos, usuarios, categorias, desarrolladoras y resenas. Si ya tiene datos (por ejemplo, porque usaste la web antes), los conserva y solo agrega 2 juegos temporales para la demostracion.

### Script de Prueba de Conexion MongoDB

Para verificar rapidamente que MongoDB esta accesible y listar las bases de datos/colecciones disponibles:

```bash
node test-mongo.js
```

Salida esperada:

```
Conectando a: mongodb://127.0.0.1:27017
Conexion exitosa!
Version de MongoDB: 7.0.0

Bases de datos disponibles:
  - admin (0.00 MB)
  - PixelCriticDB (0.50 MB)
  - local (0.00 MB)

Colecciones en PixelCriticDB:
  - usuarios (6 documentos)
  - categorias (6 documentos)
  - desarrolladoras (14 documentos)
  - juegos (17 documentos)
  - resenas (18 documentos)
```

### 5. Ejecutar la Aplicacion Web (Next.js)

Para iniciar el servidor web con interfaz grafica:

```bash
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 6. Construir para Produccion (Opcional)

```bash
npm run build
npm run web
```

### Credenciales de Acceso (Web)

| Usuario       | Contrasena    | Rol    |
|---------------|---------------|--------|
| admin         | admin123      | admin  |
| SamuelJ       | samuel123     | admin  |
| AdminCapibara | capibara2025  | admin  |
| MariangelO    | mari123       | editor |
| FabianaR      | fabi123       | editor |

## Paginas de la Aplicacion Web

- `/` - Catalogo de juegos con busqueda, filtros por categoria y ordenamiento multiple (precio, nombre, rating, año)
- `/juego/[id]` - Pagina de detalle del juego con formulario para dejar/editar resenas
- `/admin` - Panel de administracion protegido (solo admin/editor) con CRUD completo
- `/perfil` - Perfil del usuario con todas sus resenas (editar/eliminar)
- `/premium` - Juegos favoritos del equipo, resenas destacadas y metricas
- `/login` - Pagina de inicio de sesion con toggle de visibilidad de contrasena
- `/*` - Pagina 404 personalizada

## Estructura del Proyecto

```
PixelCritic-TecnoCapibara/
  index.js                  - Modulo CRUD en Node.js (CLI) - punto de entrada npm start
  test-mongo.js             - Script de prueba de conexion a MongoDB
  package.json              - Configuracion del proyecto y dependencias
  .env                      - Variables de entorno (NO subir a GitHub)
  .gitignore                - Archivos ignorados por Git
  next.config.js            - Configuracion de Next.js
  tailwind.config.js        - Configuracion de Tailwind CSS (tema gamer dark-neon)
  postcss.config.js         - Configuracion de PostCSS
  jsconfig.json             - Configuracion de alias de rutas
  README.md                 - Este archivo
  public/
    index.html              - Diseno de referencia original (Catalogo)
    admin.html              - Diseno de referencia original (Admin)
    premium.html            - Diseno de referencia original (Premium)
  src/
    app/
      layout.js             - Layout principal con sidebar, topbar y AuthProvider
      page.js               - Pagina Catalogo (grid de tarjetas + modal crear juego)
      globals.css           - Estilos globales (glass-morphism, animaciones, scrollbar)
      login/
        page.js             - Pagina de inicio de sesion con credenciales visibles
      admin/
        page.js             - Panel de administracion con CRUD completo
      perfil/
        page.js             - Pagina de perfil del usuario con sus resenas
      not-found.js          - Pagina 404 personalizada
      premium/
        page.js             - Pagina de juegos premium (calificacion >= 4)
      juego/
        [id]/
          page.js           - Pagina de detalle de juego con resenas
      api/
        login/
          route.js          - POST: autenticacion de usuarios
        seed/
          route.js          - POST: poblar base de datos con datos iniciales
        juegos/
          route.js          - GET: listar juegos, POST: crear juego
          [id]/route.js     - GET: obtener juego, PUT: actualizar, DELETE: eliminar
        usuarios/
          route.js          - GET: listar usuarios, POST: crear usuario
          [id]/route.js     - PUT: actualizar usuario, DELETE: eliminar
        categorias/
          route.js          - GET: listar categorias, POST: crear categoria
          [id]/route.js     - PUT: actualizar categoria, DELETE: eliminar
        desarrolladoras/
          route.js          - GET: listar desarrolladoras, POST: crear desarrolladora
          [id]/route.js     - PUT: actualizar desarrolladora, DELETE: eliminar
        resenas/
          route.js          - GET: listar resenas, POST: crear resena
          [id]/route.js     - PUT: actualizar resena, DELETE: eliminar resena
    components/
      ConfirmModal.js       - Modal de confirmacion reutilizable para eliminaciones
      ImageWithFallback.js  - Componente de imagen con fallback en caso de error
      SkeletonCard.js       - Esqueletos de carga para catalogos (GameCard, Premium, Detail)
    hooks/
      useDebounce.js        - Hook para debounce en busquedas (300ms)
    context/
      AuthContext.js        - Contexto de autenticacion (login/logout, localStorage)
    lib/
      mongodb.js            - Conexion singleton a MongoDB
      seed-data.js          - Datos de semilla para la aplicacion web
```

## Licencia

Proyecto academico desarrollado para la asignatura Base de Datos II - Uneti.
