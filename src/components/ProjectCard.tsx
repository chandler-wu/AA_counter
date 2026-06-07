import { Card, Button, Popconfirm, Typography, Space, Statistic, Tag } from 'antd';
import { DeleteOutlined, RightOutlined, TeamOutlined, AppstoreOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import { formatMoney } from '../utils/money';

interface Props {
  project: Project;
  total: number;
  onDelete: () => void;
}

export function ProjectCard({ project, total, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{ width: 320 }}
      actions={[
        <Button
          key="open"
          type="link"
          icon={<RightOutlined />}
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          打开
        </Button>,
        <Popconfirm
          key="del"
          title="删除项目？"
          description="此项目下所有记账数据将一并删除，且不可恢复。"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete();
          }}
          onCancel={(e) => e?.stopPropagation()}
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => e.stopPropagation()}
          >
            删除
          </Button>
        </Popconfirm>,
      ]}
    >
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {project.name}
        </Typography.Title>
        <Statistic
          title="总消费"
          value={total}
          precision={2}
          prefix="¥"
          valueStyle={{ color: '#1677ff', fontSize: 22 }}
        />
        <Space size="small" wrap>
          <Tag icon={<TeamOutlined />} color="blue">
            {project.members.length} 人
          </Tag>
          <Tag icon={<AppstoreOutlined />} color="green">
            {project.categories.length} 分类
          </Tag>
          <Tag icon={<FileTextOutlined />} color="purple">
            {project.expenses.length} 笔
          </Tag>
        </Space>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          更新于 {new Date(project.updatedAt).toLocaleString('zh-CN')}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          总额：{formatMoney(total)}
        </Typography.Text>
      </Space>
    </Card>
  );
}
