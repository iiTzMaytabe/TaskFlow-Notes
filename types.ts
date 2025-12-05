export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  todos: TodoItem[];
  createdAt: number;
}

export type ViewMode = 'todos' | 'notes';

export interface AIState {
  isLoading: boolean;
  error: string | null;
}
