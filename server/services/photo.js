require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const app = express();
// Middleware do CORS
app.use(cors());
const port = 7500;

// Configurar o Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Rota para o formulário de upload
app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

// Função para lidar com o upload de arquivos
const handleUpload = async (req, res) => {
  if (!req.file) {
    res.status(400).send('Nenhum arquivo foi enviado.');
    return;
  }

  const { token } = req.body;

  // Verificar se o token é válido
  if (!await verifyToken(token)) {
    res.status(401).send('Token inválido.');
    return;
  }

  try {
    // Fazer o upload da foto diretamente para o Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads', // Pasta no Cloudinary onde a foto será armazenada
    });

    // Obter a URL da foto do Cloudinary
    const photoUrl = result.secure_url;

    // Atualizar o usuário na tabela 'users'
    await knex('users').where('token', token).update({ avatar: photoUrl });

    // Excluir o arquivo temporário
    await deleteTempFile(req.file.path);

    res.send(JSON.stringify({ avatar: photoUrl }));
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao fazer o upload da foto.');
  }
};

// Função para lidar com o upload de arquivos
const handleUploadBanner = async (req, res) => {
  if (!req.file) {
    res.status(400).send('Nenhum arquivo foi enviado.');
    return;
  }

  const { token } = req.body;

  // Verificar se o token é válido
  if (!await verifyToken(token)) {
    res.status(401).send('Token inválido.');
    return;
  }

  try {
    // Fazer o upload da foto diretamente para o Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads', // Pasta no Cloudinary onde a foto será armazenada
    });

    // Obter a URL da foto do Cloudinary
    const photoUrl = result.secure_url;

    // Atualizar o usuário na tabela 'users'
    await knex('users').where('token', token).update({ banner: photoUrl });

    // Excluir o arquivo temporário
    await deleteTempFile(req.file.path);

    res.send(JSON.stringify({ banner: photoUrl }));
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao fazer o upload da foto.');
  }
};


// Configurar o upload de arquivos com Multer
const upload = multer({ dest: 'temp/' });

// Rota para lidar com o upload de arquivos
app.post('/uploadAvatar', upload.single('photo'), handleUpload);
// Rota para lidar com o upload de arquivos
app.post('/uploadCover', upload.single('photo'), handleUploadBanner);

// Função para verificar se o token é válido
async function verifyToken(token) {
  try {
    const user = await knex('users').where('token', token).first();
    if(user.id){
        return true;
    }
  } catch (error) {
    return false;
  }
}

// Função para excluir um arquivo temporário
const deleteTempFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Signaling Server Photo running on port: ${port}`);
});