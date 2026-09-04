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

export interface RespostaChecklist {
  perguntaId: string;
  categoria: string;
  pergunta: string;
  resposta: RespostaValor;
  fotoUri?: string | null;
}

export interface ChecklistPayload {
  checklistId: string;
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

export type RootStackParamList = {
  Checklist: undefined;
  AdminLogin: undefined;
  Admin: undefined;
  AdminQuestionForm: { questao?: Questao } | undefined;
  AdminCategoryForm: { categoria?: Categoria } | undefined;
};
