import { RenovacaoSeguro, SeguroNovo, Seguradora, Ramo, Usuario } from '../types';
import { ConfiguracoesMetas, ConfiguracoesMotivos } from '../types';

export const usuarios: Usuario[] = [
  { id: '1', nome: 'João Silva', email: 'joao@empresa.com', role: 'usuario', acessoRenovacoes: true, acessoSegurosNovos: true, acessoClientes: true, recebeRemuneracaoRenovacoes: true, recebeRemuneracaoSegurosNovos: true },
  { id: '2', nome: 'Maria Santos', email: 'maria@empresa.com', role: 'usuario', acessoRenovacoes: true, acessoSegurosNovos: false, acessoClientes: true, recebeRemuneracaoRenovacoes: true, recebeRemuneracaoSegurosNovos: false },
  { id: '3', nome: 'Pedro Costa', email: 'pedro@empresa.com', role: 'usuario', acessoRenovacoes: false, acessoSegurosNovos: true, acessoClientes: true, recebeRemuneracaoRenovacoes: false, recebeRemuneracaoSegurosNovos: false },
  { id: '4', nome: 'Ana Oliveira', email: 'ana@empresa.com', role: 'admin', acessoRenovacoes: true, acessoSegurosNovos: true, acessoClientes: true, recebeRemuneracaoRenovacoes: true, recebeRemuneracaoSegurosNovos: true },
  { id: '5', nome: 'Carlos Gestor', email: 'carlos@empresa.com', role: 'gestor', acessoRenovacoes: true, acessoSegurosNovos: true, acessoClientes: true, recebeRemuneracaoRenovacoes: true, recebeRemuneracaoSegurosNovos: true }
];

export const seguradoras: Seguradora[] = [
  { id: '4', nome: 'Allianz', ativa: true },
  { id: '1', nome: 'Bradesco Seguros', ativa: true },
  { id: '6', nome: 'Itaú Seguros', ativa: true },
  { id: '5', nome: 'Mapfre', ativa: true },
  { id: '3', nome: 'Porto Seguro', ativa: true },
  { id: '2', nome: 'SulAmérica', ativa: true }
];

export const ramos: Ramo[] = [
  { id: '1', nome: 'Auto', ativo: true, percentualComissaoSeguroNovo: 15, valorFixoSeguroNovo: 100, tipoComissaoSeguroNovo: 'percentual' },
  { id: '3', nome: 'Empresarial', ativo: true, percentualComissaoSeguroNovo: 10, valorFixoSeguroNovo: 200, tipoComissaoSeguroNovo: 'percentual' },
  { id: '2', nome: 'Residencial', ativo: true, percentualComissaoSeguroNovo: 20, valorFixoSeguroNovo: 80, tipoComissaoSeguroNovo: 'percentual' },
  { id: '5', nome: 'Saúde', ativo: true, percentualComissaoSeguroNovo: 12, valorFixoSeguroNovo: 150, tipoComissaoSeguroNovo: 'valor_fixo' },
  { id: '4', nome: 'Vida', ativo: true, percentualComissaoSeguroNovo: 18, valorFixoSeguroNovo: 120, tipoComissaoSeguroNovo: 'percentual' },
  { id: '6', nome: 'Viagem', ativo: true, percentualComissaoSeguroNovo: 25, valorFixoSeguroNovo: 50, tipoComissaoSeguroNovo: 'valor_fixo' }
];

export const segurosNovos: SeguroNovo[] = [
  {
    id: '1',
    clienteId: '2', // Empresa Nova Tech
    responsavel: 'João Silva',
    inicioVigencia: new Date('2024-02-01'),
    ramo: ramos[2], // Empresarial
    seguradoraNova: seguradoras[0], // Bradesco Seguros
    premioLiquidoNovo: 8500,
    percentualComissaoNova: 15,
    comissaoNova: 1275,
    comissaoAReceber: 127.5, // 10% da comissão gerada (ramo empresarial)
    status: 'fechado',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-30')
  },
  {
    id: '2',
    clienteId: '2', // Startup Digital (mesmo cliente)
    responsavel: 'Maria Santos',
    inicioVigencia: new Date('2024-02-15'),
    ramo: ramos[2], // Empresarial
    seguradoraNova: seguradoras[1], // SulAmérica
    premioLiquidoNovo: 12000,
    percentualComissaoNova: 18,
    comissaoNova: 2160,
    comissaoAReceber: 216, // 10% da comissão gerada (ramo empresarial)
    status: 'em_negociacao',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-20'),
    atualizadoEm: new Date('2024-02-01')
  },
  {
    id: '3',
    clienteId: '6', // Consultório Médico
    responsavel: 'Pedro Costa',
    inicioVigencia: new Date('2024-03-01'),
    ramo: ramos[2], // Empresarial
    seguradoraNova: seguradoras[2], // Porto Seguro
    premioLiquidoNovo: 6500,
    percentualComissaoNova: 16,
    comissaoNova: 1040,
    comissaoAReceber: 104, // 10% da comissão gerada (ramo empresarial)
    status: 'a_trabalhar',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-02-10'),
    atualizadoEm: new Date('2024-02-10')
  },
  {
    id: '4',
    clienteId: '3', // Família Silva
    responsavel: 'Ana Oliveira',
    inicioVigencia: new Date('2024-02-20'),
    ramo: ramos[0], // Auto
    seguradoraNova: seguradoras[3], // Allianz
    premioLiquidoNovo: 4200,
    percentualComissaoNova: 20,
    comissaoNova: 840,
    comissaoAReceber: 126, // 15% da comissão gerada (ramo auto)
    status: 'pendente',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-02-05'),
    atualizadoEm: new Date('2024-02-15')
  },
  {
    id: '5',
    clienteId: '5', // Loja do João
    responsavel: 'João Silva',
    inicioVigencia: new Date('2024-03-15'),
    ramo: ramos[2], // Empresarial
    seguradoraNova: seguradoras[4], // Mapfre
    premioLiquidoNovo: 9800,
    percentualComissaoNova: 14,
    comissaoNova: 1372,
    comissaoAReceber: 137.2, // 10% da comissão gerada (ramo empresarial)
    status: 'em_orcamento',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-02-20'),
    atualizadoEm: new Date('2024-02-20')
  }
];

export const renovacoes: RenovacaoSeguro[] = [
  {
    id: '1',
    clienteId: '1', // Carlos Mendes
    responsavel: 'João Silva',
    fimVigencia: new Date('2024-01-15'),
    ramo: ramos[0],
    seguradoraAnterior: seguradoras[0],
    premioLiquidoAnterior: 2500,
    percentualComissaoAnterior: 15,
    comissaoAnterior: 375,
    seguradoraNova: seguradoras[1],
    premioLiquidoNovo: 2800,
    percentualComissaoNova: 18,
    comissaoNova: 504,
    resultado: 129,
    status: 'renovado',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-15')
  },
  {
    id: '2',
    clienteId: '2', // Empresa ABC Ltda
    responsavel: 'Maria Santos',
    fimVigencia: new Date('2024-01-20'),
    ramo: ramos[2],
    seguradoraAnterior: seguradoras[2],
    premioLiquidoAnterior: 15000,
    percentualComissaoAnterior: 12,
    comissaoAnterior: 1800,
    seguradoraNova: seguradoras[3],
    premioLiquidoNovo: 16500,
    percentualComissaoNova: 14,
    comissaoNova: 2310,
    resultado: 510,
    status: 'em_negociacao',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-05'),
    atualizadoEm: new Date('2024-01-18')
  },
  {
    id: '3',
    clienteId: '3', // Família Silva
    responsavel: 'Pedro Costa',
    fimVigencia: new Date('2024-01-25'),
    ramo: ramos[1],
    seguradoraAnterior: seguradoras[1],
    premioLiquidoAnterior: 800,
    percentualComissaoAnterior: 20,
    comissaoAnterior: 160,
    status: 'a_trabalhar',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-10'),
    atualizadoEm: new Date('2024-01-10')
  },
  {
    id: '4',
    clienteId: '4', // José Pereira
    responsavel: 'Ana Oliveira',
    fimVigencia: new Date('2024-01-30'),
    ramo: ramos[0],
    seguradoraAnterior: seguradoras[4],
    premioLiquidoAnterior: 3200,
    percentualComissaoAnterior: 16,
    comissaoAnterior: 512,
    seguradoraNova: seguradoras[5],
    premioLiquidoNovo: 3000,
    percentualComissaoNova: 18,
    comissaoNova: 540,
    resultado: 28,
    status: 'pendente',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-12'),
    atualizadoEm: new Date('2024-01-20')
  },
  {
    id: '5',
    clienteId: '5', // Loja do João
    responsavel: 'João Silva',
    fimVigencia: new Date('2024-02-05'),
    ramo: ramos[2],
    seguradoraAnterior: seguradoras[0],
    premioLiquidoAnterior: 5500,
    percentualComissaoAnterior: 14,
    comissaoAnterior: 770,
    status: 'em_orcamento',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  {
    id: '6',
    clienteId: '6', // Consultório Médico
    responsavel: 'Maria Santos',
    fimVigencia: new Date('2024-02-10'),
    ramo: ramos[2],
    seguradoraAnterior: seguradoras[3],
    premioLiquidoAnterior: 12000,
    percentualComissaoAnterior: 10,
    comissaoAnterior: 1200,
    status: 'vencidas',
    observacoes: [],
    tarefas: [],
    criadoEm: new Date('2024-01-20'),
    atualizadoEm: new Date('2024-02-11')
  }
];

export const configuracoesMetas: ConfiguracoesMetas = {
  metasTaxaConversao: [
    {
      id: '1',
      faixaMinima: 0,
      faixaMaxima: 90,
      tipoRemuneracao: 'percentual',
      percentualComissao: 3,
      descricao: 'Até 90%'
    },
    {
      id: '2',
      faixaMinima: 90.01,
      faixaMaxima: 95,
      tipoRemuneracao: 'percentual',
      percentualComissao: 4,
      descricao: '90,01% - 95%'
    },
    {
      id: '3',
      faixaMinima: 95.01,
      faixaMaxima: null,
      tipoRemuneracao: 'valor_fixo',
      valorFixo: 500,
      descricao: 'Acima de 95%'
    }
  ],
  metasAumentoComissao: [
    {
      id: '1',
      faixaMinima: 10,
      faixaMaxima: 14.99,
      tipoRemuneracao: 'percentual',
      percentualComissao: 1,
      descricao: '10% - 14,99%'
    },
    {
      id: '2',
      faixaMinima: 15,
      faixaMaxima: 19.99,
      tipoRemuneracao: 'percentual',
      percentualComissao: 1.5,
      descricao: '15% - 19,99%'
    },
    {
      id: '3',
      faixaMinima: 20,
      faixaMaxima: null,
      tipoRemuneracao: 'valor_fixo',
      valorFixo: 300,
      descricao: 'Acima de 20%'
    }
  ],
  metasSegurosNovos: [
    {
      id: '1',
      tipo: 'comissao_gerada',
      faixaMinima: 5000,
      faixaMaxima: 9999,
      tipoRemuneracao: 'percentual',
      percentualComissao: 2,
      descricao: 'R$ 5.000 - R$ 9.999 em comissão'
    },
    {
      id: '2',
      tipo: 'comissao_gerada',
      faixaMinima: 10000,
      faixaMaxima: null,
      tipoRemuneracao: 'valor_fixo',
      valorFixo: 800,
      descricao: 'Acima de R$ 10.000 em comissão'
    },
    {
      id: '3',
      tipo: 'taxa_conversao',
      faixaMinima: 80,
      faixaMaxima: 89.99,
      tipoRemuneracao: 'percentual',
      percentualComissao: 3,
      descricao: '80% - 89,99% de conversão'
    },
    {
      id: '4',
      tipo: 'taxa_conversao',
      faixaMinima: 90,
      faixaMaxima: null,
      tipoRemuneracao: 'valor_fixo',
      valorFixo: 600,
      descricao: 'Acima de 90% de conversão'
    }
  ]
};

export const configuracoesMotivos: ConfiguracoesMotivos = {
  motivosRenovacao: [
    {
      id: '1',
      nome: 'Cliente contratou com outra corretora',
      icone: '🏢',
      ativo: true,
      tipo: 'renovacao',
      ordem: 1
    },
    {
      id: '2',
      nome: 'Cliente decidiu não renovar',
      icone: '❌',
      ativo: true,
      tipo: 'renovacao',
      ordem: 2
    },
    {
      id: '3',
      nome: 'Preço muito alto',
      icone: '💰',
      ativo: true,
      tipo: 'renovacao',
      ordem: 3
    },
    {
      id: '4',
      nome: 'Problemas com a seguradora anterior',
      icone: '⚠️',
      ativo: true,
      tipo: 'renovacao',
      ordem: 4
    },
    {
      id: '5',
      nome: 'Outros motivos',
      icone: '📝',
      ativo: true,
      tipo: 'renovacao',
      ordem: 999
    }
  ],
  motivosSeguroNovo: [
    {
      id: '6',
      nome: 'Cliente contratou com outra corretora',
      icone: '🏢',
      ativo: true,
      tipo: 'seguro_novo',
      ordem: 1
    },
    {
      id: '7',
      nome: 'Cliente desistiu da contratação',
      icone: '❌',
      ativo: true,
      tipo: 'seguro_novo',
      ordem: 2
    },
    {
      id: '8',
      nome: 'Preço muito alto',
      icone: '💰',
      ativo: true,
      tipo: 'seguro_novo',
      ordem: 3
    },
    {
      id: '9',
      nome: 'Não aprovou a proposta',
      icone: '📋',
      ativo: true,
      tipo: 'seguro_novo',
      ordem: 4
    },
    {
      id: '10',
      nome: 'Outros motivos',
      icone: '📝',
      ativo: true,
      tipo: 'seguro_novo',
      ordem: 999
    }
  ]
};