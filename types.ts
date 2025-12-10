export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  reminder?: number;
}

export interface Category {
  id: string;
  name: string;
  todos: TodoItem[];
  createdAt: number;
}

export interface DeletedTodoItem extends TodoItem {
  originalCategoryId: string;
  deletedAt: number;
}

export type ViewMode = 'todos' | 'notes' | 'trash';

export type Theme = 'nature' | 'sunset' | 'botanic' | 'celestial' | 'volcano' | 'earth';

export interface AIState {
  isLoading: boolean;
  error: string | null;
}