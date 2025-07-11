import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2, Target, TrendingUp, Award, Shield } from 'lucide-react';
import { formatarMoeda } from '../utils/calculations';
import { seguradoras as mockSeguradoras, ramos as mockRamos } from '../data/mockData';
import { configuracoesMetas as mockConfiguracoesMetas, configuracoesMotivos as mockConfiguracoesMotivos } from '../data/mockData';
import { Seguradora, Ramo, ConfiguracoesMetas, ConfiguracoesMotivos, MetaTaxaConversao, MetaAumentoComissao, MetaSeguroNovo, MotivoPerda } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import SeguradoraModal from '../components/Modals/SeguradoraModal';
import RamoModal from '../components/Modals/RamoModal';
import MetaModal from '../components/Modals/MetaModal';
import MotivoModal from '../components/Modals/MotivoModal';

const Configuracoes: React.FC = () => {
  const { isAdmin, usuario } = useAuth();
  const [activeTab, setActiveTab] = useState<'seguradoras' | 'ramos' | 'metas' | 'motivos'>('seguradoras');
  const [seguradoras, setSeguradoras] = useLocalStorage<Seguradora[]>('seguradoras', mockSeguradoras);
  const [ramos, setRamos] = useLocalStorage<Ramo[]>('ramos', mockRamos);
  const [configuracoesMetas, setConfiguracoesMetas] = useLocalStorage<ConfiguracoesMetas>('configuracoesMetas', mockConfiguracoesMetas);
  const [configuracoesMotivos, setConfiguracoesMotivos] = useLocalStorage<ConfiguracoesMotivos>('configuracoesMotivos', mockConfiguracoesMotivos);
  
  // Modais
  const [showSeguradoraModal, setShowSeguradoraModal] = useState(false);
  const [showRamoModal, setShowRamoModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [editingSeguradora, setEditingSeguradora] = useState<Seguradora | undefined>();
  const [editingRamo, setEditingRamo] = useState<Ramo | undefined>();
  const [editingMeta, setEditingMeta] = useState<MetaTaxaConversao | MetaAumentoComissao | MetaSeguroNovo | undefined>();
  const [editingMotivo, setEditingMotivo] = useState<MotivoPerda | undefined>();
  const [tipoMeta, setTipoMeta] = useState<'taxa_conversao' | 'aumento_comissao' | 'seguros_novos'>('taxa_conversao');
  const [tipoSeguroNovo, setTipoSeguroNovo] = useState<'comissao_gerada' | 'taxa_conversao'>('comissao_gerada');
  const [tipoMotivo, setTipoMotivo] = useState<'renovacao' | 'seguro_novo'>('renovacao');

  // Verificar se o usuário é admin
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Acesso Restrito</h2>
            <p className="text-red-600">
              Apenas administradores podem acessar as configurações do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'seguradoras', label: 'Seguradoras' },
    { id: 'ramos', label: 'Ramos' },
    { id: 'metas', label: 'Metas de Comissionamento' },
    { id: 'motivos', label: 'Motivos das Perdas' }
  ];

  // Handlers para Seguradoras
  const handleAddSeguradora = () => {
    setEditingSeguradora(undefined);
    setShowSeguradoraModal(true);
  };

  const handleEditSeguradora = (seguradora: Seguradora) => {
    setEditingSeguradora(seguradora);
    setShowSeguradoraModal(true);
  };

  const handleSaveSeguradora = (seguradoraData: Omit<Seguradora, 'id'>) => {
    if (editingSeguradora) {
      // Editar
      setSeguradoras(prev => prev.map(s => 
        s.id === editingSeguradora.id 
          ? { ...editingSeguradora, ...seguradoraData }
          : s
      ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    } else {
      // Adicionar
      const newSeguradora: Seguradora = {
        id: Date.now().toString(),
        ...seguradoraData
      };
      setSeguradoras(prev => [...prev, newSeguradora].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    }
  };

  const handleDeleteSeguradora = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta seguradora?')) {
      setSeguradoras(prev => prev.filter(s => s.id !== id));
    }
  };

  // Handlers para Ramos
  const handleAddRamo = () => {
    setEditingRamo(undefined);
    setShowRamoModal(true);
  };

  const handleEditRamo = (ramo: Ramo) => {
    setEditingRamo(ramo);
    setShowRamoModal(true);
  };

  const handleSaveRamo = (ramoData: Omit<Ramo, 'id'>) => {
    if (editingRamo) {
      // Editar
      setRamos(prev => prev.map(r => 
        r.id === editingRamo.id 
          ? { ...editingRamo, ...ramoData }
          : r
      ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    } else {
      // Adicionar
      const newRamo: Ramo = {
        id: Date.now().toString(),
        ...ramoData
      };
      setRamos(prev => [...prev, newRamo].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    }
  };

  const handleDeleteRamo = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ramo?')) {
      setRamos(prev => prev.filter(r => r.id !== id));
    }
  };

  // Handlers para Metas
  const handleAddMeta = (tipo: 'taxa_conversao' | 'aumento_comissao' | 'seguros_novos', tipoSeguroNovoParam?: 'comissao_gerada' | 'taxa_conversao') => {
    setTipoMeta(tipo);
    if (tipoSeguroNovoParam) {
      setTipoSeguroNovo(tipoSeguroNovoParam);
    }
    setEditingMeta(undefined);
    setShowMetaModal(true);
  };

  const handleEditMeta = (meta: MetaTaxaConversao | MetaAumentoComissao | MetaSeguroNovo, tipo: 'taxa_conversao' | 'aumento_comissao' | 'seguros_novos') => {
    setTipoMeta(tipo);
    if (tipo === 'seguros_novos' && 'tipo' in meta) {
      setTipoSeguroNovo(meta.tipo);
    }
    setEditingMeta(meta);
    setShowMetaModal(true);
  };

  const handleSaveMeta = (metaData: Omit<MetaTaxaConversao | MetaAumentoComissao | MetaSeguroNovo, 'id'>) => {
    if (editingMeta) {
      // Editar
      if (tipoMeta === 'taxa_conversao') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasTaxaConversao: prev.metasTaxaConversao.map(m => 
            m.id === editingMeta.id 
              ? { ...editingMeta, ...metaData } as MetaTaxaConversao
              : m
          )
        }));
      } else if (tipoMeta === 'aumento_comissao') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasAumentoComissao: prev.metasAumentoComissao.map(m => 
            m.id === editingMeta.id 
              ? { ...editingMeta, ...metaData } as MetaAumentoComissao
              : m
          )
        }));
      } else if (tipoMeta === 'seguros_novos') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasSegurosNovos: prev.metasSegurosNovos.map(m => 
            m.id === editingMeta.id 
              ? { ...editingMeta, ...metaData } as MetaSeguroNovo
              : m
          )
        }));
      }
    } else {
      // Adicionar
      const newMeta = {
        id: Date.now().toString(),
        ...metaData
      };
      
      if (tipoMeta === 'taxa_conversao') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasTaxaConversao: [...prev.metasTaxaConversao, newMeta as MetaTaxaConversao]
        }));
      } else if (tipoMeta === 'aumento_comissao') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasAumentoComissao: [...prev.metasAumentoComissao, newMeta as MetaAumentoComissao]
        }));
      } else if (tipoMeta === 'seguros_novos') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasSegurosNovos: [...prev.metasSegurosNovos, newMeta as MetaSeguroNovo]
        }));
      }
    }
  };

  const handleDeleteMeta = (id: string, tipo: 'taxa_conversao' | 'aumento_comissao' | 'seguros_novos') => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      if (tipo === 'taxa_conversao') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasTaxaConversao: prev.metasTaxaConversao.filter(m => m.id !== id)
        }));
      } else if (tipo === 'aumento_comissao') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasAumentoComissao: prev.metasAumentoComissao.filter(m => m.id !== id)
        }));
      } else if (tipo === 'seguros_novos') {
        setConfiguracoesMetas(prev => ({
          ...prev,
          metasSegurosNovos: prev.metasSegurosNovos.filter(m => m.id !== id)
        }));
      }
    }
  };

  // Handlers para Motivos
  const handleAddMotivo = (tipo: 'renovacao' | 'seguro_novo') => {
    setTipoMotivo(tipo);
    setEditingMotivo(undefined);
    setShowMotivoModal(true);
  };

  const handleEditMotivo = (motivo: MotivoPerda) => {
    setTipoMotivo(motivo.tipo as 'renovacao' | 'seguro_novo');
    setEditingMotivo(motivo);
    setShowMotivoModal(true);
  };

  const handleSaveMotivo = (motivoData: Omit<MotivoPerda, 'id'>) => {
    if (editingMotivo) {
      // Editar
      if (tipoMotivo === 'renovacao') {
        setConfiguracoesMotivos(prev => ({
          ...prev,
          motivosRenovacao: prev.motivosRenovacao.map(m => 
            m.id === editingMotivo.id 
              ? { ...editingMotivo, ...motivoData }
              : m
          ).sort((a, b) => a.ordem - b.ordem)
        }));
      } else {
        setConfiguracoesMotivos(prev => ({
          ...prev,
          motivosSeguroNovo: prev.motivosSeguroNovo.map(m => 
            m.id === editingMotivo.id 
              ? { ...editingMotivo, ...motivoData }
              : m
          ).sort((a, b) => a.ordem - b.ordem)
        }));
      }
    } else {
      // Adicionar
      const newMotivo: MotivoPerda = {
        id: Date.now().toString(),
        ...motivoData
      };
      
      if (tipoMotivo === 'renovacao') {
        setConfiguracoesMotivos(prev => ({
          ...prev,
          motivosRenovacao: [...prev.motivosRenovacao, newMotivo].sort((a, b) => a.ordem - b.ordem)
        }));
      } else {
        setConfiguracoesMotivos(prev => ({
          ...prev,
          motivosSeguroNovo: [...prev.motivosSeguroNovo, newMotivo].sort((a, b) => a.ordem - b.ordem)
        }));
      }
    }
  };

  const handleDeleteMotivo = (id: string, tipo: 'renovacao' | 'seguro_novo') => {
    if (confirm('Tem certeza que deseja excluir este motivo?')) {
      if (tipo === 'renovacao') {
        setConfiguracoesMotivos(prev => ({
          ...prev,
          motivosRenovacao: prev.motivosRenovacao.filter(m => m.id !== id)
        }));
      } else {
        setConfiguracoesMotivos(prev => ({
          ...prev,
          motivosSeguroNovo: prev.motivosSeguroNovo.filter(m => m.id !== id)
        }));
      }
    }
  };

  const getRemuneracaoText = (meta: MetaTaxaConversao | MetaAumentoComissao | MetaSeguroNovo) => {
    if (meta.tipoRemuneracao === 'valor_fixo') {
      return formatarMoeda(meta.valorFixo || 0);
    } else {
      return `${meta.percentualComissao}% sobre comissão`;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Configurações</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'seguradoras' | 'ramos' | 'metas' | 'motivos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'seguradoras' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Seguradoras</h2>
                <button 
                  onClick={handleAddSeguradora}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Seguradora
                </button>
              </div>

              <div className="space-y-3">
                {seguradoras.map((seguradora) => (
                  <div key={seguradora.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        seguradora.ativa ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">{seguradora.nome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditSeguradora(seguradora)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSeguradora(seguradora.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metas' && (
            <div className="space-y-8">
              {/* Metas de Taxa de Conversão */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-medium text-gray-900">Metas de Taxa de Conversão de Renovação</h2>
                  </div>
                  <button 
                    onClick={() => handleAddMeta('taxa_conversao')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Meta
                  </button>
                </div>

                <div className="space-y-3">
                  {configuracoesMetas.metasTaxaConversao.map((meta) => (
                    <div key={meta.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">{meta.descricao}</span>
                          <span className="text-sm font-semibold text-blue-700">{getRemuneracaoText(meta)}</span>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Faixa: {meta.faixaMinima}% {meta.faixaMaxima ? `- ${meta.faixaMaxima}%` : 'ou mais'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          onClick={() => handleEditMeta(meta, 'taxa_conversao')}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMeta(meta.id, 'taxa_conversao')}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metas de Aumento de Comissão */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-medium text-gray-900">Metas de Aumento de Comissão das Renovações</h2>
                  </div>
                  <button 
                    onClick={() => handleAddMeta('aumento_comissao')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Meta
                  </button>
                </div>

                <div className="space-y-3">
                  {configuracoesMetas.metasAumentoComissao.map((meta) => (
                    <div key={meta.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-orange-900">{meta.descricao}</span>
                          <span className="text-sm font-semibold text-orange-700">{getRemuneracaoText(meta)}</span>
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          Faixa: {meta.faixaMinima}% {meta.faixaMaxima ? `- ${meta.faixaMaxima}%` : 'ou mais'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          onClick={() => handleEditMeta(meta, 'aumento_comissao')}
                          className="text-orange-600 hover:text-orange-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMeta(meta.id, 'aumento_comissao')}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metas de Seguros Novos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-medium text-gray-900">Metas de Seguros Novos</h2>
                  </div>
                </div>

                {/* Metas por Comissão Gerada */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-700">Por Comissão Gerada</h3>
                    <button 
                      onClick={() => handleAddMeta('seguros_novos', 'comissao_gerada')}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Nova Meta
                    </button>
                  </div>
                  <div className="space-y-2">
                    {configuracoesMetas.metasSegurosNovos
                      .filter(meta => meta.tipo === 'comissao_gerada')
                      .map((meta) => (
                      <div key={meta.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-900">{meta.descricao}</span>
                            <span className="text-sm font-semibold text-green-700">{getRemuneracaoText(meta)}</span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Faixa: {formatarMoeda(meta.faixaMinima)} {meta.faixaMaxima ? `- ${formatarMoeda(meta.faixaMaxima)}` : 'ou mais'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleEditMeta(meta, 'seguros_novos')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMeta(meta.id, 'seguros_novos')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metas por Taxa de Conversão */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-700">Por Taxa de Conversão</h3>
                    <button 
                      onClick={() => handleAddMeta('seguros_novos', 'taxa_conversao')}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Nova Meta
                    </button>
                  </div>
                  <div className="space-y-2">
                    {configuracoesMetas.metasSegurosNovos
                      .filter(meta => meta.tipo === 'taxa_conversao')
                      .map((meta) => (
                      <div key={meta.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-900">{meta.descricao}</span>
                            <span className="text-sm font-semibold text-green-700">{getRemuneracaoText(meta)}</span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Faixa: {meta.faixaMinima}% {meta.faixaMaxima ? `- ${meta.faixaMaxima}%` : 'ou mais'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleEditMeta(meta, 'seguros_novos')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMeta(meta.id, 'seguros_novos')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'motivos' && (
            <div className="space-y-8">
              {/* Motivos para Renovações */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">R</span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">Motivos para Renovações Não Efetivadas</h2>
                  </div>
                  <button 
                    onClick={() => handleAddMotivo('renovacao')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Motivo
                  </button>
                </div>

                <div className="space-y-3">
                  {configuracoesMotivos.motivosRenovacao
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((motivo) => (
                    <div key={motivo.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{motivo.icone}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-red-900">{motivo.nome}</span>
                            <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full">
                              Ordem: {motivo.ordem}
                            </span>
                            {!motivo.ativo && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                Inativo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditMotivo(motivo)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMotivo(motivo.id, 'renovacao')}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivos para Seguros Novos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">S</span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">Motivos para Seguros Novos Perdidos</h2>
                  </div>
                  <button 
                    onClick={() => handleAddMotivo('seguro_novo')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Motivo
                  </button>
                </div>

                <div className="space-y-3">
                  {configuracoesMotivos.motivosSeguroNovo
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((motivo) => (
                    <div key={motivo.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{motivo.icone}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-900">{motivo.nome}</span>
                            <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                              Ordem: {motivo.ordem}
                            </span>
                            {!motivo.ativo && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                Inativo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditMotivo(motivo)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMotivo(motivo.id, 'seguro_novo')}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informações sobre uso */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Como usar os motivos:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Os motivos aparecerão automaticamente quando o status for alterado para "Não Renovada" ou "Perdido"</p>
                  <p>• A ordem define a sequência de exibição no modal de seleção</p>
                  <p>• Motivos inativos não aparecerão para seleção, mas dados históricos são preservados</p>
                  <p>• O motivo "Outros" permite texto livre e deve ter ordem alta (ex: 999)</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'ramos' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Ramos</h2>
                <button 
                  onClick={handleAddRamo}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Ramo
                </button>
              </div>

              <div className="space-y-3">
                {ramos.map((ramo) => (
                  <div key={ramo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        ramo.ativo ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{ramo.nome}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Bônus Seg. Novo: {ramo.tipoComissaoSeguroNovo === 'valor_fixo' 
                            ? `${formatarMoeda(ramo.valorFixoSeguroNovo)} por seguro`
                            : `${ramo.percentualComissaoSeguroNovo}% da comissão`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditRamo(ramo)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRamo(ramo.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <SeguradoraModal
        isOpen={showSeguradoraModal}
        onClose={() => setShowSeguradoraModal(false)}
        onSave={handleSaveSeguradora}
        seguradora={editingSeguradora}
      />

      <RamoModal
        isOpen={showRamoModal}
        onClose={() => setShowRamoModal(false)}
        onSave={handleSaveRamo}
        ramo={editingRamo}
      />

      <MetaModal
        isOpen={showMetaModal}
        onClose={() => setShowMetaModal(false)}
        onSave={handleSaveMeta}
        meta={editingMeta}
        tipo={tipoMeta}
        tipoSeguroNovo={tipoSeguroNovo}
      />

      <MotivoModal
        isOpen={showMotivoModal}
        onClose={() => setShowMotivoModal(false)}
        onSave={handleSaveMotivo}
        motivo={editingMotivo}
        tipo={tipoMotivo}
      />
    </div>
  );
};

export default Configuracoes;