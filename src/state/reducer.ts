import type { AppState, Category, Expense, Member, Project } from '../types';
import { newId } from '../utils/id';
import { createProject } from '../seed';

/** 所有可派发的 action。 */
export type Action =
  | { type: 'INIT'; payload: AppState }
  | { type: 'CREATE_PROJECT'; name: string }
  | { type: 'DELETE_PROJECT'; projectId: string }
  | { type: 'RENAME_PROJECT'; projectId: string; name: string }
  | { type: 'ADD_MEMBER'; projectId: string; name: string }
  | { type: 'RENAME_MEMBER'; projectId: string; memberId: string; name: string }
  | { type: 'DELETE_MEMBER'; projectId: string; memberId: string }
  | { type: 'ADD_CATEGORY'; projectId: string; name: string; color: string }
  | { type: 'RENAME_CATEGORY'; projectId: string; categoryId: string; name: string; color: string }
  | { type: 'DELETE_CATEGORY'; projectId: string; categoryId: string }
  | { type: 'ADD_EXPENSE'; projectId: string; expense: Omit<Expense, 'id' | 'createdAt'> }
  | { type: 'UPDATE_EXPENSE'; projectId: string; expense: Expense }
  | { type: 'DELETE_EXPENSE'; projectId: string; expenseId: string };

/** 工具：在数组中按 id 找到项目下标。 */
function findProjectIndex(state: AppState, projectId: string): number {
  return state.projects.findIndex((p) => p.id === projectId);
}

/** 工具：更新指定项目，返回新数组（不可变更新）。 */
function updateProject(
  state: AppState,
  projectId: string,
  updater: (p: Project) => Project,
): AppState {
  const idx = findProjectIndex(state, projectId);
  if (idx < 0) return state;
  const projects = state.projects.slice();
  projects[idx] = { ...updater(projects[idx]), updatedAt: new Date().toISOString() };
  return { ...state, projects };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'CREATE_PROJECT': {
      const p = createProject(action.name);
      return { ...state, projects: [...state.projects, p] };
    }

    case 'DELETE_PROJECT': {
      const idx = findProjectIndex(state, action.projectId);
      if (idx < 0) return state;
      const projects = state.projects.filter((_, i) => i !== idx);
      return { ...state, projects };
    }

    case 'RENAME_PROJECT':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        name: action.name.trim() || p.name,
      }));

    case 'ADD_MEMBER':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        members: [...p.members, { id: newId(), name: action.name.trim() || '新成员' }],
      }));

    case 'RENAME_MEMBER':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        members: p.members.map((m: Member) =>
          m.id === action.memberId ? { ...m, name: action.name.trim() || m.name } : m,
        ),
      }));

    case 'DELETE_MEMBER':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        members: p.members.filter((m) => m.id !== action.memberId),
      }));

    case 'ADD_CATEGORY':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        categories: [
          ...p.categories,
          { id: newId(), name: action.name.trim() || '新分类', color: action.color },
        ],
      }));

    case 'RENAME_CATEGORY':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        categories: p.categories.map((c: Category) =>
          c.id === action.categoryId
            ? { ...c, name: action.name.trim() || c.name, color: action.color }
            : c,
        ),
      }));

    case 'DELETE_CATEGORY':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        categories: p.categories.filter((c) => c.id !== action.categoryId),
      }));

    case 'ADD_EXPENSE':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        expenses: [
          ...p.expenses,
          {
            ...action.expense,
            id: newId(),
            createdAt: new Date().toISOString(),
          },
        ],
      }));

    case 'UPDATE_EXPENSE':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        expenses: p.expenses.map((e) => (e.id === action.expense.id ? action.expense : e)),
      }));

    case 'DELETE_EXPENSE':
      return updateProject(state, action.projectId, (p) => ({
        ...p,
        expenses: p.expenses.filter((e) => e.id !== action.expenseId),
      }));

    default:
      return state;
  }
}
