const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '..', '..', 'uploads'), // Salva na pasta 'uploads' na raiz do projeto
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Substitui espaços por underscores e adiciona timestamp para evitar nomes duplicados
    const name = path.basename(file.originalname, ext).replace(/\s/g, '_');
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

module.exports = multer({ storage });