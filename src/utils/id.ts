/** 生成一个唯一 ID。优先使用 crypto.randomUUID，回退到简易实现。 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // 简易回退
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
