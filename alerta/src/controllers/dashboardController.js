const Reporte = require('../models/Reporte');

const obterEstatisticas = async(req, res) => {

  try{

    const estatisticas = await Reporte.aggregate([
      {
        $group: {
          _id: '$status',
          quantidade: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          _id: 1
        }
      },
    ]);

    const total = estatisticas.reduce((soma, item) => soma + item.quantidade, 0);

    res.json({
      success: true,
      data: {
        total,                  
        porStatus: estatisticas 
      },
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: erro.message,
    });
  }
}

const obterPorCategoria = async (req, res) => {

  try {

    const porCategoria = await Reporte.aggregate([
      {
        $group: {
          _id: '$categoria',
          quantidade: {
            $sum: 1
          }
        }
      },

      {
        $lookup: {
          from: 'categorias',        
          localField: '_id',         
          foreignField: '_id',       
          as: 'categoria',           
        },
      },

      {
        $unwind: '$categoria'
      },

      {
        $project: {
          _id: 0,
          categoria: {
            _id: '$categoria._id',
            nome: '$categoria.nome',
          },
          quantidade: 1,  
        },
      },

      {
        $sort: {
          quantidade: -1
        }
      },
    ]);

    res.json({
      success: true,
      data: {porCategoria},
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar reportes por categoria.',
      error: erro.message,
    });
  }
};

const obterPorPeriodo = async (req, res) => {

  try {

    const dias = parseInt(req.query.dias) || 30;

    const dataInicio = new Date();

    dataInicio.setDate(dataInicio.getDate() - dias);

    const porPeriodo = await Reporte.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dataInicio
          }
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          quantidade: {
            $sum: 1
          },
        },
      },

      {
        $sort: {
          _id: 1
        }
      },

      {
        $project: {
          _id: 0,
          data: '$_id',
          quantidade: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        periodo: `${dias} dias`,                               
        dataInicio: dataInicio.toISOString().split('T')[0],    
        dataFim: new Date().toISOString().split('T')[0],       
        porPeriodo,                                             
      },
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar reportes por período.',
      error: erro.message,
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterPorCategoria,
  obterPorPeriodo,
};