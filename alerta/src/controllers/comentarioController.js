const Comentario = require('../models/Comentario');

const Reporte = require('../models/Reporte');

const criarComentario = async (req, res) => {

  try {

    const conteudo = req.body.conteudo;

    const reporteId = req.params.id;

    const reporte = await Reporte.findById(reporteId);

    if(!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte não encontrado.',
      });
    }
    
    const comentario = await Comentario.create({
      reporte: reporteId,
      autor: req.usuario._id,
      conteudo,
    });

    await comentario.populate('autor', 'nome email');

    res.status(201).json({
      success: true,
      message: 'Comentário adicionado com sucesso.',
      data: {comentario},
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar comentário.',
      error: erro.message
    });
  }
}

const listarComentarios = async(req, res) => {

  try {

    const comentarios = await Comentario.find({ reporte: req.params.id }).populate('autor', 'nome email').sort({ createdAt: -1 })          
      .select('-__v');                   

    res.json({
      success: true,
      data: {comentarios}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar comentários.',
      error: erro.message
    });
  }
}

const deletarComentario = async(req, res) => {

  try{

    const comentario = await Comentario.findById(req.params.id);

    if(!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado.',
      });
    }

    if(comentario.autor.toString() !== req.usuario._id.toString() && req.usuario.perfil !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este comentário.',
      });
    }

    await Comentario.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comentário deletado com sucesso.',      
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar comentário.',
      error: erro.message
    });
  }
}

module.exports = {criarComentario, listarComentarios, deletarComentario}