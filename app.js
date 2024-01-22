const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta GET para devolver una página web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta GET para devolver un JSON con las canciones registradas en el repertorio
app.get('/canciones', async (req, res) => {
  try {
    const data = await readJsonFile('repertorio.json');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el archivo repertorio.json' });
  }
});

// Ruta POST para agregar una canción al repertorio
app.post('/canciones', async (req, res) => {
  try {
    const newSong = req.body;
    const data = await readJsonFile('repertorio.json');

    newSong.id = generateId(data);
    data.push(newSong);

    await writeJsonFile('repertorio.json', data);
    res.json({ message: 'Canción agregada exitosamente', id: newSong.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar la canción al repertorio' });
  }
});

// Ruta PUT para actualizar una canción en el repertorio por su id
app.put('/canciones/:id', async (req, res) => {
  try {
    const songId = req.params.id;
    const updatedSong = req.body;
    let data = await readJsonFile('repertorio.json');

    const index = data.findIndex(song => song.id === songId);
    if (index === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    data[index] = { ...data[index], ...updatedSong };

    await writeJsonFile('repertorio.json', data);
    res.json({ message: 'Canción actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la canción en el repertorio' });
  }
});

// Ruta DELETE para eliminar una canción del repertorio por su id
app.delete('/canciones/:id', async (req, res) => {
  try {
    const songId = req.params.id;
    let data = await readJsonFile('repertorio.json');

    const filteredData = data.filter(song => song.id !== songId);

    await writeJsonFile('repertorio.json', filteredData);
    res.json({ message: 'Canción eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la canción del repertorio' });
  }
});

// Función auxiliar para generar un ID único para cada canción
function generateId(data) {
  const ids = data.map(song => song.id);
  const newId = Math.max(0, ...ids) + 1;
  return newId.toString();
}

// Función auxiliar para leer un archivo JSON
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, filename);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Función auxiliar para escribir en un archivo JSON
async function writeJsonFile(filename, data) {
  const filePath = path.join(__dirname, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Iniciar el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
