# DuoChords Live 🎸🎤🎤

Aplicación web moderna y responsiva orientada a músicos y cantantes para visualizar, transponer y gestionar repertorios con letras y acordes para **dúos vocales y guitarra**.

Diseñada especialmente para su uso en directo, atril y pantallas táctiles (tablets/iPads) en modo oscuro de alto contraste.

---

## 🚀 Características Principales

### 1. Modo Dúo (Diferenciación Vocal Cromática)
- **Barra Lateral de Atril**: Indicador visual lateral continuo con los colores asignados para identificar el rol vocal a más de 1.5 metros de distancia.
- **Roles Vocales Flexibles**:
  - **Voz 1 (Cantante 1)**: Color personalizable de alto contraste (ej. Neón Cyan `#00E5FF`).
  - **Voz 2 (Cantante 2)**: Color personalizable (ej. Ámbar Cálido `#FFB300`).
  - **Ambos / Armonía**: Color unificado para coros y unísonos (ej. Magenta Eléctrico `#E040FB`).
- **Soporte de Bloques e Inline**: Permite alternar estrofas completas o pequeños diálogos/respuestas palabra por palabra dentro del mismo verso.

### 2. Formato Enriquecido "Duo-ChordPro"
Sintaxis estándar compatible con ChordPro con extensiones para asignación de voces:
```chordpro
{title: Shallow}
{artist: Lady Gaga & Bradley Cooper}
{key: Em}
{tempo: 96}

{v1}
{comment: Estrofa 1 - Voz 1}
[Em]Tell me [D/F#]something, [G]girl
[C]Are you happy in this [G]modern [D]world?
{/v1}

{v2}
{comment: Estrofa 2 - Voz 2}
[Em]Tell me [D/F#]something, [G]boy
{/v2}

{both}
{comment: Coro - Armonía a dos voces}
[Am]I'm off the deep end, [D/F#]watch as I dive in
{/both}

<v1>[Am]In the shallow, </v1><v2>[D]shallow </v2><both>[G]now[/both]
```

### 3. Motor Musical en Tiempo Real
- **Transposición Instantánea**: Subir/bajar semitonos (+/-) con cálculo de notas enarmónicas y acordes con bajo invertido (ej: `D/F#` -> `Eb/G`).
- **Notación Anglo y Latina**: Alterna entre notación americana (`C, D, E, F...`) y latina (`Do, Re, Mi, Fa...`) con un solo clic.
- **Inspección de Acordes**: Al tocar cualquier acorde se abre una ficha rápida de referencia.

### 4. Modo Escenario (Atril en Vivo)
- **Auto-Scroll Sub-Pixel**: Desplazamiento vertical ultra-fluido impulsado por `requestAnimationFrame` para evitar saltos o tirones visuales.
- **HUD Flotante Táctil**:
  - Botón gigante de Play / Pausa.
  - Ajuste de velocidad milimétrica en px/s.
  - **Tap Tempo**: Pulsa al ritmo de la música para sincronizar el scroll automáticamente con el tempo real del tema.
  - Botón de retorno al inicio.
- **Screen Wake Lock**: Mantiene la pantalla encendida de tablets y móviles de manera activa durante el ensayo o concierto.
- **Soporte para Pedaleras Bluetooth y Teclado**:
  - `Espacio`: Play/Pausa de auto-scroll.
  - `Flecha Derecha / Flecha Izquierda`: Siguiente / Anterior canción del setlist.
  - `+` / `-`: Transponer tono.

### 5. Gestión de Repertorio y Setlists
- **Biblioteca con Búsqueda y Filtros**: Busca por título, artista, tono o letra.
- **Gestor de Setlists para Conciertos**:
  - Crea listas temáticas para presentaciones o eventos.
  - Reordena canciones con flechas arriba/abajo.
  - Añade notas de atril específicas para el concierto (ej: *"Capo 3"*, *"Voz 1 empieza acapella"*).
  - **Modo Show**: Inicia el concierto y navega consecutivamente entre los temas sin volver al menú.
- **Exportación en JSON**: Copia de seguridad y migración instantánea de canciones.

### 6. Backend y Persistencia en Dublyobase
- Conectado a colecciones en **Dublyobase / PostgreSQL**:
  - `duo_songs`: Canciones maestras con ChordPro enriquecido.
  - `duo_setlists`: Listas de directos y eventos.
  - `duo_setlist_items`: Posicionamiento y notas por actuación.
  - `duo_configs`: Configuración personalizada de nombres y colores del dúo.
- Soporte offline local sincronizado con caché `localStorage`.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4.
- **Iconografía**: Lucide React.
- **Música y Parser**: Tokenizador Léxico ChordPro a AST y motor de teoría musical nativo.
- **Backend / BD**: Dublyobase (PostgreSQL / REST API).
- **Control de Versiones**: Git / GitHub.

---

## 💻 Instalación y Ejecución Local

1. Clonar el repositorio:
```bash
git clone https://github.com/Oslo8/duo-chords-app.git
cd duo-chords-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Compilar para producción:
```bash
npm run build
```

---

Desarrollado con ❤️ para dúos vocales y guitarristas en directo.
