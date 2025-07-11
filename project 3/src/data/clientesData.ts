import { Cliente } from '../types/customer';

export const clientes: Cliente[] = [
  {
    id: '1',
    nome: 'Carlos Mendes',
    cpfCnpj: '12345678901',
    email: 'carlos.mendes@email.com',
    telefone: '(11) 99999-1111',
    dataNascimento: new Date('1980-05-15'),
    tipo: 'pessoa_fisica',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  {
    id: '2',
    nome: 'Empresa Nova Tech',
    cpfCnpj: '12345678000195',
    email: 'contato@novatech.com.br',
    telefone: '(11) 3333-4444',
    dataNascimento: new Date('2010-03-20'),
    tipo: 'pessoa_juridica',
    endereco: {
      cep: '04567-890',
      logradouro: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    criadoEm: new Date('2024-01-05'),
    atualizadoEm: new Date('2024-01-05')
  },
  {
    id: '3',
    nome: 'Família Silva',
    cpfCnpj: '98765432100',
    email: 'familia.silva@gmail.com',
    telefone: '(11) 98888-2222',
    dataNascimento: new Date('1975-12-10'),
    tipo: 'pessoa_fisica',
    endereco: {
      cep: '02345-678',
      logradouro: 'Rua dos Jardins',
      numero: '456',
      bairro: 'Jardim América',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    criadoEm: new Date('2024-01-10'),
    atualizadoEm: new Date('2024-01-10')
  },
  {
    id: '4',
    nome: 'José Pereira',
    cpfCnpj: '11122233344',
    email: 'jose.pereira@hotmail.com',
    telefone: '(11) 97777-3333',
    dataNascimento: new Date('1990-08-25'),
    tipo: 'pessoa_fisica',
    endereco: {
      cep: '03456-789',
      logradouro: 'Rua da Liberdade',
      numero: '789',
      bairro: 'Liberdade',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    criadoEm: new Date('2024-01-12'),
    atualizadoEm: new Date('2024-01-12')
  },
  {
    id: '5',
    nome: 'Loja do João',
    cpfCnpj: '98765432000123',
    email: 'contato@lojadojoao.com.br',
    telefone: '(11) 96666-4444',
    dataNascimento: new Date('2005-11-30'),
    tipo: 'pessoa_juridica',
    endereco: {
      cep: '05678-901',
      logradouro: 'Rua do Comércio',
      numero: '321',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  {
    id: '6',
    nome: 'Consultório Médico',
    cpfCnpj: '11223344000156',
    email: 'consultorio@medico.com.br',
    telefone: '(11) 95555-5555',
    dataNascimento: new Date('2015-07-18'),
    tipo: 'pessoa_juridica',
    endereco: {
      cep: '06789-012',
      logradouro: 'Av. dos Médicos',
      numero: '654',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    criadoEm: new Date('2024-01-20'),
    atualizadoEm: new Date('2024-01-20')
  }
];