import { Table, Tag, Typography, Progress, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CategoryStat } from '../utils/stats';
import { formatMoney, formatPercent } from '../utils/money';

interface Props {
  stats: CategoryStat[];
}

interface Row {
  key: string;
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  count: number;
  percent: number;
}

export function CategoryStatTable({ stats }: Props) {
  if (stats.length === 0) {
    return <Empty description="暂无消费数据" />;
  }
  const rows: Row[] = stats.map((s) => ({
    key: s.categoryId,
    categoryId: s.categoryId,
    name: s.name,
    color: s.color,
    amount: s.amount,
    count: s.count,
    percent: s.percent,
  }));

  const columns: ColumnsType<Row> = [
    {
      title: '分类',
      dataIndex: 'name',
      width: 140,
      render: (name: string, row) => (
        <Tag color={row.color} style={{ minWidth: 80, textAlign: 'center' }}>
          {name}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 130,
      align: 'right',
      render: (v: number) => <Typography.Text strong>{formatMoney(v)}</Typography.Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '笔数',
      dataIndex: 'count',
      width: 80,
      align: 'right',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: '占比',
      dataIndex: 'percent',
      render: (v: number, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={Math.min(100, Math.round(v))}
            size="small"
            strokeColor={row.color}
            showInfo={false}
            style={{ flex: 1, minWidth: 80, marginBottom: 0 }}
          />
          <Typography.Text type="secondary" style={{ width: 48, textAlign: 'right' }}>
            {formatPercent(v)}
          </Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <Table<Row>
      dataSource={rows}
      columns={columns}
      pagination={false}
      size="middle"
    />
  );
}
