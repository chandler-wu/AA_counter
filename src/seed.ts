import type { AppState, Project } from './types';
import { newId } from './utils/id';

/** 创建一个空的应用状态。 */
export function emptyState(): AppState {
  return { version: 1, projects: [] };
}

/** 默认分类：交通、餐饮、住宿、其他。 */
export const DEFAULT_CATEGORIES = [
  { name: '交通', color: '#1890ff' },
  { name: '餐饮', color: '#fa8c16' },
  { name: '住宿', color: '#52c41a' },
  { name: '其他', color: '#8c8c8c' },
];

/** 默认示例成员。 */
export const DEFAULT_MEMBERS = ['成员1', '成员2', '成员3'];

/**
 * 创建一个新项目，自动填充默认分类与示例成员。
 */
export function createProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: name.trim() || '未命名项目',
    createdAt: now,
    updatedAt: now,
    members: DEFAULT_MEMBERS.map((n) => ({ id: newId(), name: n })),
    categories: DEFAULT_CATEGORIES.map((c) => ({ id: newId(), ...c })),
    expenses: [],
  };
}
