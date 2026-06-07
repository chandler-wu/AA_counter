// 共享类型定义

export interface Member {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // 6 位 HEX，例如 "#1890ff"
}

export interface Expense {
  id: string;
  amount: number; // 人民币，单位：元，保留 2 位小数
  categoryId: string;
  payerId: string;
  participantIds: string[];
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO 字符串
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: Member[];
  categories: Category[];
  expenses: Expense[];
}

export interface AppState {
  version: 1;
  projects: Project[];
}
