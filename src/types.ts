import { MaterialCommunityIcons } from '@expo/vector-icons';

export type RespostaValor = 'Sim' | 'Não';
export type CategoriaIcone = keyof typeof MaterialCommunityIcons.glyphMap;

export interface Categoria {
  id: string;
  nome: string;
  icone: CategoriaIcone;
  cor: string;
  corFundo: string;
  ordem: number;
}

export interface Questao {
  id: string;
  categoriaId: string;
  categoria: string;
  pergunta: string;
  ativo: boolean;
  ordem: number;
}

export interface Setor {
  id: string;
  nome: string;
  ordem: number;
}

export interface Pessoa {
  id: string;
  nome: string;
  setorId: string;
  setorNome: string;
  pushToken?: string | null;
}

export interface RespostaDetalhe {
  comentario: string;
  fotoUri: string | null;
  atribuidoAId: string | null;
  atribuidoANome: string | null;
}

export interface RespostaChecklist {
  perguntaId: string;
  categoria: string;
  pergunta: string;
  resposta: RespostaValor;
  fotoUri?: string | null;
  comentario?: string | null;
  atribuidoAId?: string | null;
  atribuidoANome?: string | null;
}

export interface ChecklistPayload {
  checklistId: string;
  responsavelId: string;
  data: string;
  responsavel: string;
  turno: string;
  observacoes: string;
  respostas: RespostaChecklist[];
}

export interface ChecklistRegistro {
  id: string;
  data: string;
  responsavel: string;
  turno: string;
  observacoes: string;
  criadoEm: string;
  totalPerguntas: number;
  totalSim: number;
  totalNao: number;
  totalFotos: number;
}

export interface ChecklistDetalhe extends ChecklistRegistro {
  respostas: RespostaChecklist[];
}

export type NotificacaoTipo = 'tarefa' | 'checklist_finalizado';

export interface Notificacao {
  id: string;
  destinatarioId: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  checklistId?: string | null;
  perguntaId?: string | null;
  lida: boolean;
  criadoEm: string;
}

export type RootStackParamList = {
  Cadastro: undefined;
  Checklist: undefined;
  Notificacoes: undefined;
  AdminLogin: undefined;
  Admin: undefined;
  AdminQuestionForm: { questao?: Questao } | undefined;
  AdminCategoryForm: { categoria?: Categoria } | undefined;
  AdminSetorForm: { setor?: Setor } | undefined;
};
