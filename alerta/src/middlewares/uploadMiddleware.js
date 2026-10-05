const multer = require('multer');

const path = require('path');

const armazenamento = multer.diskStorage({

  destination: (req, arquivo, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },

  filename: (req, arquivo, cb) => {
    const nomeUnico = Date.now() + '-' + arquivo.originalname;
    cb(null, nomeUnico);
  },
});

const filtroArquivo = (req, arquivo, cb) => {

  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];

  if (tiposPermitidos.includes(arquivo.mimetype)) {
    cb(null, true);
  }
  else {
    cb(new Error('Tipo de arquivo não permitido. Use: JPEG, JPG ou PNG.'), false);
  }
};

const upload = multer({
  storage: armazenamento,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
