import { useMemo } from 'react';
import { Button, Popconfirm, Space, Table, Tag, Typography, Empty } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Expense, Project } from '../types';
import { formatMoney } from '../utils/money';

interface Props {
  project: Project;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

interface Row {
  key: string;
  date: string;
  amount: number;
  categoryName: string;
  categoryColor: string;
  payerName: string;
  participantNames: string;
  description: string;
  expense: Expense;
}

export function ExpenseTable({ project, onEdit, onDelete }: Props) {
  const memberMap = useMemo(
    () => new Map(project.members.map((m) => [m.id, m.name])),
    [project.members],
  );
  const categoryMap = useMemo(
    () => new Map(project.categories.map((c) => [c.id, c])),
    [project.categories],
  );

  const rows: Row[] = useMemo(() => {
    const sorted = [...project.expenses].sort((a, b) =>
      a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
    );
    return sorted.map((e) => {
      const cat = categoryMap.get(e.categoryId);
      const payer = memberMap.get(e.payerId) ?? '（已删除）';
      const participants = e.participantIds
        .map((id) => memberMap.get(id) ?? '（已删除）')
        .join('、');
      return {
        key: e.id,
        date: e.date,
        amount: e.amount,
        categoryName: cat?.name ?? '（已删除）',
        categoryColor: cat?.color ?? '#bfbfbf',
        payerName: payer,
        participantNames: participants,
        description: e.description,
        expense: e,
      };
    });
  }, [project.expenses, memberMap, categoryMap]);

  const columns: ColumnsType<Row> = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 110,
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 110,
      align: 'right',
      render: (v: number) => (
        <Typography.Text strong style={{ color: '#d4380d' }}>
          {formatMoney(v)}
        </Typography.Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      width: 100,
      render: (name: string, row) => (
        <Tag color={row.categoryColor} style={{ minWidth: 56, textAlign: 'center' }}>
          {name}
        </Tag>
      ),
    },
    {
      title: '付款人',
      dataIndex: 'payerName',
      width: 100,
    },
    {
      title: '参与人',
      dataIndex: 'participantNames',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'description',
      ellipsis: true,
      render: (v: string) =>
        v ? <Typography.Text type="secondary">{v}</Typography.Text> : <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: '操作',
      width: 130,
      align: 'center',
      render: (_v, row) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(row.expense)}>
            编辑
          </Button>
          <Popconfirm
            title="删除该笔记账？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(row.expense.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (rows.length === 0) {
    return <Empty description={'还没有任何记账，点击右上角「新增记账」开始记录'} />;
  }

  return (
    <Table<Row>
      dataSource={rows}
      columns={columns}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      size="middle"
      scroll={{ x: 760 }}
    />
  );
}
