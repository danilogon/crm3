export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'usuario' | 'gestor';
  acessoRenovacoes: boolean;
  acessoSegurosNovos: boolean;
  acessoClientes: boolean;
  recebeRemuneracaoRenovacoes: boolean; // Se recebe bônus pelas metas de renovação
  recebeRemuneracaoSegurosNovos: boolean; // Se recebe bônus pelas metas de seguros novos
}

export interface Seguradora {
  id: string;
  nome: string;
  ativa: boolean;
}

export interface Ramo {
  id: string;
  nome: string;
  ativo: boolean;
  percentualComissaoSeguroNovo: number; // Percentual da comissão que vai para o vendedor
  valorFixoSeguroNovo: number; // Valor fixo por seguro novo fechado
  tipoComissaoSeguroNovo: 'percentual' | 'valor_fixo'; // Tipo de comissão para seguros novos
}

export type StatusRenovacao = 
  | 'a_trabalhar'
  | 'em_orcamento'
  | 'em_negociacao'
  | 'vencidas'
  | 'a_transmitir'
  | 'pendente'
  | 'renovado'
  | 'nao_renovada';

export type StatusSeguroNovo = 
  | 'a_trabalhar'
  | 'em_orcamento'
  | 'em_negociacao'
  | 'vencidas'
  | 'a_transmitir'
  | 'pendente'
  | 'fechado'
  | 'perdido';

export type MotivoPerda = 'vendido' | 'nao_renovado' | 'outros';

export interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  dataUpload: Date;
}

export interface Observacao {
  id: string;
  texto: string;
  data: Date;
  usuario: string;
  anexos: Anexo[];
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  dataAgendamento: Date;
  concluida: boolean;
  usuario: string;
}

export interface RenovacaoSeguro {
  id: string;
  // Cliente obrigatório
  clienteId: string; // OBRIGATÓRIO - referência ao cliente master
  responsavel: string;
  fimVigencia: Date;
  ramo: Ramo;
  seguradoraAnterior: Seguradora;
  premioLiquidoAnterior: number;
  percentualComissaoAnterior: number;
  comissaoAnterior: number; // calculado automaticamente
  
  // Campos editáveis pelo usuário
  seguradoraNova?: Seguradora;
  premioLiquidoNovo?: number;
  percentualComissaoNova?: number;
  comissaoNova?: number; // calculado automaticamente
  resultado?: number; // calculado automaticamente
  
  // Controle
  status: StatusRenovacao;
  motivoPerda?: MotivoPerda;
  motivoOutros?: string;
  observacoes: Observacao[];
  tarefas: Tarefa[];
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface SeguroNovo {
  id: string;
  // Cliente obrigatório
  clienteId: string; // OBRIGATÓRIO - referência ao cliente master
  responsavel: string;
  inicioVigencia: Date;
  ramo: Ramo;
  seguradoraNova: Seguradora;
  premioLiquidoNovo: number;
  percentualComissaoNova: number;
  comissaoNova: number; // calculado automaticamente
  comissaoAReceber: number; // comissão que o vendedor vai receber baseada na regra do ramo
  
  // Controle
  status: StatusSeguroNovo;
  motivoPerda?: MotivoPerda;
  motivoOutros?: string;
  observacoes: Observacao[];
  tarefas: Tarefa[];
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface MetricasDashboard {
  mes: string;
  ano: number;
  responsavel?: string;
  taxaConversao: number;
  aumentoComissao: number;
  comissaoTaxaConversao: number;
  comissaoAumento: number;
  comissaoTotal: number;
  totalRenovados: number;
  totalNaoRenovados: number;
  totalComissaoNova: number;
  totalResultado: number;
}

export interface FiltrosDashboard {
  mes: number;
  ano: number;
  responsavel?: string;
}

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'usuario' | 'gestor';
  acessoRenovacoes: boolean;
  acessoSegurosNovos: boolean;
  acessoClientes: boolean;
  recebeRemuneracaoRenovacoes: boolean;
  recebeRemuneracaoSegurosNovos: boolean;
}

export interface MetaTaxaConversao {
  id: string;
  faixaMinima: number;
  faixaMaxima: number | null; // null para "acima de X%"
  tipoRemuneracao: 'percentual' | 'valor_fixo';
  percentualComissao?: number; // usado quando tipoRemuneracao = 'percentual'
  valorFixo?: number; // usado quando tipoRemuneracao = 'valor_fixo'
  descricao: string;
}

export interface MetaAumentoComissao {
  id: string;
  faixaMinima: number;
  faixaMaxima: number | null; // null para "acima de X%"
  tipoRemuneracao: 'percentual' | 'valor_fixo';
  percentualComissao?: number; // usado quando tipoRemuneracao = 'percentual'
  valorFixo?: number; // usado quando tipoRemuneracao = 'valor_fixo'
  descricao: string;
}

export interface MetaSeguroNovo {
  id: string;
  tipo: 'comissao_gerada' | 'taxa_conversao';
  faixaMinima: number;
  faixaMaxima: number | null; // null para "acima de X"
  tipoRemuneracao: 'percentual' | 'valor_fixo';
  percentualComissao?: number; // usado quando tipoRemuneracao = 'percentual'
  valorFixo?: number; // usado quando tipoRemuneracao = 'valor_fixo'
  descricao: string;
}
export interface ConfiguracoesMetas {
  metasTaxaConversao: MetaTaxaConversao[];
  metasAumentoComissao: MetaAumentoComissao[];
  metasSegurosNovos: MetaSeguroNovo[];
}

export interface MotivoPerda {
  id: string;
  nome: string;
  icone: string;
  ativo: boolean;
  tipo: 'renovacao' | 'seguro_novo' | 'ambos';
  ordem: number;
}

export interface ConfiguracoesMotivos {
  motivosRenovacao: MotivoPerda[];
  motivosSeguroNovo: MotivoPerda[];
}

export interface Card {
  id: string;
  numero: string;
  clienteId: string;
  dataCriacao: Date;
  status: 'pendente' | 'em_analise' | 'aprovado' | 'recusado';
  valorTotal: number;
  descricao?: string;
  observacoes?: string;
  responsavel: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface InteracaoCliente {
  id: string;
  clienteId: string;
  tipo: 'ligacao' | 'email' | 'reuniao' | 'proposta' | 'contrato' | 'outros';
  descricao: string;
  data: Date;
  responsavel: string;
  observacoes?: string;
}

export interface ClienteDetalhado extends Cliente {
  cards: Card[];
  interacoes: InteracaoCliente[];
  totalComissaoGerada: number;
  ultimaInteracao?: Date;
  statusAtivo: boolean;
}