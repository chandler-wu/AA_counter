import { useState } from 'react';
import {
  Button,
  Empty,
  Input,
  Modal,
  Space,
  Typography,
  App as AntApp,
  Flex,
} from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAppState } from '../state/AppContext';
import { ProjectCard } from '../components/ProjectCard';
import { calcTotal } from '../utils/stats';

export default function ProjectList() {
  const { state, dispatch } = useAppState();
  const { message } = AntApp.useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    const n = name.trim();
    if (!n) {
      message.warning('请输入项目名');
      return;
    }
    dispatch({ type: 'CREATE_PROJECT', name: n });
    setName('');
    setOpen(false);
    message.success('项目已创建');
  };

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <ThunderboltOutlined /> 我的项目
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          新建项目
        </Button>
      </Flex>

      {state.projects.length === 0 ? (
        <Empty description="还没有任何项目，点击右上角创建你的第一个项目（如：北京旅行）" />
      ) : (
        <Flex wrap="wrap" gap="middle">
          {state.projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              total={calcTotal(p.expenses)}
              onDelete={() => {
                dispatch({ type: 'DELETE_PROJECT', projectId: p.id });
                message.success(`项目"${p.name}"已删除`);
              }}
            />
          ))}
        </Flex>
      )}

      <Modal
        title="新建项目"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        okText="创建"
        cancelText="取消"
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text>项目名称</Typography.Text>
          <Input
            placeholder="例如：北京旅行、季度聚餐"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={handleCreate}
            maxLength={30}
            autoFocus
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            创建后将自动添加 4 个默认分类（交通、餐饮、住宿、其他）和 3 个示例成员（成员1/2/3），后续可自由修改。
          </Typography.Text>
        </Space>
      </Modal>
    </div>
  );
}
