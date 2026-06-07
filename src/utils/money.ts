/**
 * 金额工具。所有内部金额以"分"为单位的整数运算可避免浮点误差，
 * 但为了简单，本项目直接以 number（元）存储，并在展示时统一格式化。
 */

/** 格式化金额为 "¥1,234.56"。空值返回 "—"。 */
export function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const fixed = Math.round(value * 100) / 100;
  return (
    '¥' +
    fixed
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
}

/** 格式化百分比，保留 1 位小数，例如 "12.3%"。 */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(1) + '%';
}

/** 安全地将任意输入转成保留 2 位小数的 number，无法转换则返回 0。 */
export function toMoney(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}
