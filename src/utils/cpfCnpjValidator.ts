export const formatarCpfCnpj = (valor: string): string => {
  // Remove tudo que não é dígito
  const numeros = valor.replace(/\D/g, '');
  
  if (numeros.length <= 11) {
    // CPF: 000.000.000-00
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    // CNPJ: 00.000.000/0000-00
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
};

export const limparCpfCnpj = (valor: string): string => {
  return valor.replace(/\D/g, '');
};

export const validarCPF = (cpf: string): boolean => {
  const numeros = limparCpfCnpj(cpf);
  
  // Debug: log para verificar o que está sendo validado
  console.log('Validando CPF:', cpf, 'Números limpos:', numeros, 'Comprimento:', numeros.length);
  
  if (numeros.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numeros)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros.charAt(10))) return false;
  
  return true;
};

export const validarCNPJ = (cnpj: string): boolean => {
  const numeros = limparCpfCnpj(cnpj);
  
  // Debug: log para verificar o que está sendo validado
  console.log('Validando CNPJ:', cnpj, 'Números limpos:', numeros, 'Comprimento:', numeros.length);
  
  if (numeros.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(numeros)) return false;
  
  // Validação do primeiro dígito verificador
  let tamanho = numeros.length - 2;
  let numeros_validacao = numeros.substring(0, tamanho);
  let digitos = numeros.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros_validacao = numeros.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};

export const validarCpfCnpj = (valor: string): boolean => {
  const numeros = limparCpfCnpj(valor);
  
  // Debug: log para verificar o processo completo
  console.log('Validando CPF/CNPJ:', valor, 'Números limpos:', numeros, 'Comprimento:', numeros.length);
  
  if (numeros.length === 11) {
    return validarCPF(valor);
  } else if (numeros.length === 14) {
    return validarCNPJ(valor);
  }
  
  return false;
};

export const obterTipoDocumento = (valor: string): 'pessoa_fisica' | 'pessoa_juridica' | null => {
  const numeros = limparCpfCnpj(valor);
  
  if (numeros.length === 11) {
    return 'pessoa_fisica';
  } else if (numeros.length === 14) {
    return 'pessoa_juridica';
  }
  
  return null;
};