const Categoria = require('../models/Categoria');

const criarCategoria = async(req, res) => {

  try{

    const {nome, descricao} = req.body;

    const categoriaExistente = await Categoria.findOne({nome});

    if(categoriaExistente) {
      return res.status(400).json({
        success:false,
        message: 'Já existe uma categoria com este nome,'
      });
    }

    const categoria = await Categoria.create({nome, descricao});
    
    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso.',
      data: {categoria}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar categoria.',
      error: erro.message
    });
  }
}

const listarCategorias = async(req, res) => {

  try{

    const categorias = await Categoria.find({isAtivo: true}).select('-__v');

    res.json({
      success: true,
      data: {categorias}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar categorias.',
      error: erro.message
    });
  }
}

const obterCategoria = async(req, res) => {

  try{

    const categoria = await Categoria.findById(req.params.id).select('-__v');

    if(!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada.'
      })
    }

    res.json({
      success: true,
      data: { categoria }
    });

  } catch (erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter categoria.',
      error: erro.message
    });
  }
}

const atualizarCategoria = async(req, res) => {

  try{

    const {nome, descricao, isAtivo} = req.body;

    const dadosAtualizacao = {};

    if(nome !== undefined) {
      dadosAtualizacao.nome = nome;
    }
    if(descricao !== undefined) {
      dadosAtualizacao.descricao = descricao;
    }
    if(isAtivo !== undefined) {
      dadosAtualizacao.isAtivo = isAtivo;
    }

    const categoria = await Categoria.findByIdAndUpdate(req.params.id, dadosAtualizacao,
      {
        new:true, runValidators:true
      }).select('-__v');

    if(!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada.'
      });
    }

    return res.json({
      success: true, 
      message: 'Categoria atualizada com sucesso.',
      data: {categoria}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar categoria.',
      error: erro.message
    });
  }
}

const deletarCategoria = async(req, res) => {

  try{

    const categoria = await Categoria.findByIdAndDelete(req.params.id);

    if(!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada.',
      });
    }

    return res.json({
      success: true,
      message: 'Categoria deletada com sucesso.'
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar categoria.',
      error: erro.message
    });
  }
}

module.exports = {
  criarCategoria,
  listarCategorias,
  obterCategoria,
  atualizarCategoria,
  deletarCategoria
}