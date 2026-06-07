import type { Category, Expense, Member } from '../types';

export interface CategoryStat {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  count: number;
  percent: number; // 0~100
}

export interface PersonStat {
  memberId: string;
  name: string;
  amount: number; // 参与金额（所有该成员参与的 expense 之和）
  count: number; // 参与的笔数
}

/** 项目总消费。 */
export function calcTotal(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + (Number.isFinite(e.amount) ? e.amount : 0), 0);
}

/** 人均消费（总消费 / 成员数）。成员数为 0 时返回 0。 */
export function calcPerCapita(total: number, memberCount: number): number {
  if (memberCount <= 0) return 0;
  return Math.round((total / memberCount) * 100) / 100;
}

/**
 * 各分类消费统计。已删除的分类归入"未分类"项。
 * 返回结果按金额降序。
 */
export function calcCategoryStats(
  expenses: Expense[],
  categories: Category[],
): CategoryStat[] {
  const byCat = new Map<string, { amount: number; count: number }>();
  for (const e of expenses) {
    const cur = byCat.get(e.categoryId) ?? { amount: 0, count: 0 };
    cur.amount += e.amount;
    cur.count += 1;
    byCat.set(e.categoryId, cur);
  }
  const total = calcTotal(expenses);
  const stats: CategoryStat[] = [];
  // 已知分类
  for (const c of categories) {
    const cur = byCat.get(c.id);
    if (!cur) continue;
    stats.push({
      categoryId: c.id,
      name: c.name,
      color: c.color,
      amount: cur.amount,
      count: cur.count,
      percent: total > 0 ? (cur.amount / total) * 100 : 0,
    });
  }
  // 孤立分类（已被删除）
  for (const [cid, cur] of byCat.entries()) {
    if (categories.some((c) => c.id === cid)) continue;
    stats.push({
      categoryId: cid,
      name: '（已删除）',
      color: '#bfbfbf',
      amount: cur.amount,
      count: cur.count,
      percent: total > 0 ? (cur.amount / total) * 100 : 0,
    });
  }
  stats.sort((a, b) => b.amount - a.amount);
  return stats;
}

/**
 * 个人排行榜（按参与金额）。一笔 expense 中所有 participantIds 各计一次。
 * 已删除成员归入"（已删除）"组。
 */
export function calcPersonStats(
  expenses: Expense[],
  members: Member[],
): PersonStat[] {
  const byMember = new Map<string, { amount: number; count: number }>();
  for (const e of expenses) {
    for (const mid of e.participantIds) {
      const cur = byMember.get(mid) ?? { amount: 0, count: 0 };
      cur.amount += e.amount;
      cur.count += 1;
      byMember.set(mid, cur);
    }
  }
  const stats: PersonStat[] = [];
  for (const m of members) {
    const cur = byMember.get(m.id);
    if (!cur) {
      // 即便没有参与记录，也列出成员，金额 0
      stats.push({ memberId: m.id, name: m.name, amount: 0, count: 0 });
    } else {
      stats.push({ memberId: m.id, name: m.name, amount: cur.amount, count: cur.count });
    }
  }
  // 孤立成员
  for (const [mid, cur] of byMember.entries()) {
    if (members.some((m) => m.id === mid)) continue;
    stats.push({ memberId: mid, name: '（已删除）', amount: cur.amount, count: cur.count });
  }
  // 按金额降序；并列时按笔数降序
  stats.sort((a, b) => b.amount - a.amount || b.count - a.count);
  return stats;
}
