const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const processarUpload = async (upload) => {
  const { createReadStream, filename, mimetype } = await upload;
  
  if (!createReadStream) return null;

  const extensao = path.extname(filename);
  const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
  const caminhoCompleto = path.join(uploadDir, nomeArquivo);

  const stream = createReadStream();

  return new Promise((resolve, reject) => {
    stream
      .pipe(fs.createWriteStream(caminhoCompleto))
      .on('finish', () => resolve(`/uploads/${nomeArquivo}`))
      .on('error', reject);
  });
};

module.exports = {
  processarUpload
};
