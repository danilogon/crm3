export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  dataNascimento?: Date;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ClienteHistorico {
  cliente: Cliente;
  renovacoes: any[];
  segurosNovos: any[];
  totalComissaoGerada: number;
  ultimaInteracao: Date;
}