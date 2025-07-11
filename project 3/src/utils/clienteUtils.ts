import { Cliente } from '../types/customer';
import { RenovacaoSeguro, SeguroNovo } from '../types';

/**
 * Utilitários para trabalhar com dados normalizados do cliente
 */

export const obterClientePorId = (clienteId: string, clientes: Cliente[]): Cliente | undefined => {
  return clientes.find(cliente => cliente.id === clienteId);
};

export const obterDadosClienteParaRenovacao = (renovacao: RenovacaoSeguro, clientes: Cliente[]) => {
  const cliente = obterClientePorId(renovacao.clienteId, clientes);
  if (!cliente) {
    console.warn(`Cliente não encontrado para renovação ${renovacao.id}`);
    return {
      nomeCliente: 'Cliente não encontrado',
      emailCliente: '',
      telefoneCliente: '',
      cpfCnpjCliente: ''
    };
  }
  
  return {
    nomeCliente: cliente.nome,
    emailCliente: cliente.email,
    telefoneCliente: cliente.telefone,
    cpfCnpjCliente: cliente.cpfCnpj
  };
};

export const obterDadosClienteParaSeguroNovo = (seguroNovo: SeguroNovo, clientes: Cliente[]) => {
  const cliente = obterClientePorId(seguroNovo.clienteId, clientes);
  if (!cliente) {
    console.warn(`Cliente não encontrado para seguro novo ${seguroNovo.id}`);
    return {
      nomeCliente: 'Cliente não encontrado',
      emailCliente: '',
      telefoneCliente: '',
      cpfCnpjCliente: ''
    };
  }
  
  return {
    nomeCliente: cliente.nome,
    emailCliente: cliente.email,
    telefoneCliente: cliente.telefone,
    cpfCnpjCliente: cliente.cpfCnpj
  };
};

export const validarIntegridadeCliente = (clienteId: string, clientes: Cliente[]): boolean => {
  return clientes.some(cliente => cliente.id === clienteId);
};

export const obterClientesComCartoes = (clientes: Cliente[], renovacoes: RenovacaoSeguro[], segurosNovos: SeguroNovo[]) => {
  return clientes.map(cliente => {
    const clienteRenovacoes = renovacoes.filter(r => r.clienteId === cliente.id);
    const clienteSegurosNovos = segurosNovos.filter(s => s.clienteId === cliente.id);
    
    return {
      ...cliente,
      totalRenovacoes: clienteRenovacoes.length,
      totalSegurosNovos: clienteSegurosNovos.length,
      totalCartoes: clienteRenovacoes.length + clienteSegurosNovos.length
    };
  });
};