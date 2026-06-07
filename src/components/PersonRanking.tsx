import { Progress, Table, Tag, Typography, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrownOutlined } from '@ant-design/icons';
import type { PersonStat } from '../utils/stats';
import { formatMoney } from '../utils/money';

interface Props {
  stats: PersonStat[];
}

interface Row {
  key: string;
  rank: number;
  memberId: string;
  name: string;
  amount: number;
  count: number;
  percent: number; // 占最大金额的百分比，用于进度条
}

function rankColor(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return '#cd7f32'; // 铜
  return 'default';
}

export function PersonRanking({ stats }: Props) {
  if (stats.length === 0) {
    return <Empty description="暂无数据" />;
  }
  const max = stats.reduce((m, s) => Math.max(m, s.amount), 0);
  const rows: Row[] = stats.map((s, i) => ({
    key: s.memberId,
    rank: i + 1,
    memberId: s.memberId,
    name: s.name,
    amount: s.amount,
    count: s.count,
    percent: max > 0 ? (s.amount / max) * 100 : 0,
  }));

  const columns: ColumnsType<Row> = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 90,
      align: 'center',
      render: (rank: number) => {
        if (rank <= 3) {
          return (
            <Tag color={rankColor(rank)} style={{ minWidth: 36 }}>
              {rank === 1 ? <CrownOutlined /> : null} #{rank}
            </Tag>
          );
        }
        return <Tag style={{ minWidth: 36 }}>#{rank}</Tag>;
      },
    },
    {
      title: '成员',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '参与金额',
      dataIndex: 'amount',
      width: 140,
      align: 'right',
      render: (v: number) => <Typography.Text strong>{formatMoney(v)}</Typography.Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '参与笔数',
      dataIndex: 'count',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: '相对值',
      dataIndex: 'percent',
      render: (v: number) => (
        <Progress
          percent={Math.min(100, Math.round(v))}
          size="small"
          showInfo={false}
          style={{ marginBottom: 0 }}
        />
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
