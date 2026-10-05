const Reporte = require('../models/Reporte');

const StatusHistorico = require('../models/StatusHistorico');

const criarReporte = async(req, res) => {

  try{

    const {titulo, descricao, categoria, localizacao, endereco} = req.body;

    let imagens = [];

    if(req.files && req.files.length > 0) {
      imagens = req.files.map((arquivo) => `/uploads/${arquivo.filename}`);
    }
    else if (req.body.imagens) {
      imagens = req.body.imagens;
    }

    const reporte = await Reporte.create({titulo, descricao, categoria, autor: req.usuario._id, localizacao, endereco, imagens});

    await reporte.populate('categoria autor', 'nome email');

    res.status(201).json({
      success: true,
      message: 'Reporte criado com sucesso.',
      data: {reporte}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar reporte.',
      error: erro.message
    });
  }
}

const listarReportes = async(req, res) => {

  try{

    const {status, categoria, dataInicio, dataFim, pagina = 1, limite = 10} = req.query;
 
    const filtro = {};

    if(status) {
      filtro.status = status;
    }

    if(categoria) {
      filtro.categoria = categoria;
    }

    if(dataInicio || dataFim) {
      filtro.createdAt = {};

      if(dataInicio) {
        filtro.createdAt.$gte = new Date(dataInicio);
      }

      if(dataFim) {
        filtro.createdAt.$lte = new Date(dataFim);
      }
    }

    const pular = (parseInt(pagina) - 1) * parseInt(limite);

    const [reportes, total] = await Promise.all([
      Reporte.find(filtro).populate('categoria', 'nome').populate('autor', 'nome email').sort({createdAt: -1})                 
        .skip(pular).limit(parseInt(limite)).select('-__v'),                       
      Reporte.countDocuments(filtro)            
    ]);

    res.json({
      success: true,
      data: {
        reportes,
        paginacao: {
          total,                                    
          pagina: parseInt(pagina),                 
          limite: parseInt(limite),                 
          paginas: Math.ceil(total / parseInt(limite)) 
        }
      }
    })
    
  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar reportes.',
      error: erro.message,
    });
  }
}

const meusReportes = async(req, res) => {

  try{

    const reportes = await Reporte.find({autor: req.usuario._id})
      .populate('categoria', 'nome').sort({createdAt: -1}).select('-__v');

      res.json({
        success: true,
        data: {reportes}
      });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar seus reportes.',
      error: erro.message
    });
  }
}

const obterReporte = async(req, res) => {

  try{

    const reporte = await Reporte.findById(req.params.id).populate('categoria', 'nome')
      .populate('autor', 'nome email');

    if(!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte não encontrado.'
      });
    }

    res.json({
      success: true,
      data: {reporte}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter reporte.',
      error: erro.message
    });
  }
}

const atualizarReporte = async(req, res) => {

  try{

    const reporte = await Reporte.findById(req.params.id);

    if(!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte não encontrado.'
      });
    }

    if(reporte.autor.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o autor pode editar este reporte.'
      });
    }

    const {titulo, descricao, categoria, localizacao, endereco, imagens} = req.body;

    if(titulo !== undefined) {
      reporte.titulo = titulo;
    }

    if(descricao !== undefined) {
      reporte.descricao = descricao;
    }

    if(categoria !== undefined) {
      reporte.categoria = categoria;
    }

    if(localizacao !== undefined) {
      reporte.localizacao = localizacao;
    }

    if(endereco !== undefined) {
      reporte.endereco = endereco;
    }

    if(imagens !== undefined) {
      reporte.imagens = imagens;
    }

    await reporte.save();

    await reporte.populate('categoria autor', 'nome email');

    res.json({
      success: true,
      message: 'Reporte atualizado com sucesso.',
      data: {reporte}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar reporte.',
      error: erro.message
    });
  }
}

const deletarReporte = async(req, res) => {

  try{

    const reporte = await Reporte.findById(req.params.id);

    if(!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte não encontrado.'
      });
    }

    await Reporte.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Reporte deletado com sucesso.'
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar reporte.',
      error: erro.message
    });
  }
}

const alterarStatusReporte = async(req, res) => {

  try{

    const {status, observacao} = req.body;

    if(!['aberto', 'em_andamento', 'resolvido', 'fechado'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Use: aberto, em_andamento, resolvido ou fechado.'
      });
    }

    const reporte = await Reporte.findById(req.params.id);

    if(!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte não encontrado.'
      });
    }

    const statusAnterior = reporte.status;

    reporte.status = status;

    await reporte.save();

    await StatusHistorico.create({
      reporte: reporte._id,
      statusAnterior,
      statusAtual: status,
      mudadoPor: req.usuario._id, 
      observacao: observacao || '', 
    });

    await reporte.populate('categoria autor', 'nome email');

    res.json({
      success: true,
      message: `Status alterado de "${statusAnterior}" para "${status}".`,
      data: { reporte },
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status do reporte.',
      error: erro.message
    });
  }
}

const obterHistorico = async(req, res) => {

  try{

     const historico = await StatusHistorico.find({reporte: req.params.id}).populate('mudadoPor', 'nome email').sort({ dataMudanca: -1 }).select('-__v');

    res.json({
      success: true,
      data: {historico}
    })
    
  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico.',
      error: erro.message
    })
  }
}

module.exports = {criarReporte, listarReportes, meusReportes, obterReporte, atualizarReporte, deletarReporte, alterarStatusReporte, obterHistorico};