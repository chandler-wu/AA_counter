import { useState } from 'react';
import { Navigate, useParams, useNavigate, Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Space, Typography, App as AntApp } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppState } from '../state/AppContext';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseTable } from '../components/ExpenseTable';
import type { Expense } from '../types';

export default function ExpenseList() {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, dispatch } = useAppState();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();

  const project = projectId ? getProject(projectId) : undefined;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const canAdd = project.members.length > 0 && project.categories.length > 0;

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${project.id}`)}>
          返回项目
        </Button>
      </Space>
      <Breadcrumb
        items={[
          { title: <Link to="/">项目</Link> },
          { title: <Link to={`/projects/${project.id}`}>{project.name}</Link> },
          { title: '记账管理' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          记账管理
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            if (!canAdd) {
              message.warning('请先在项目主页添加至少 1 名成员和 1 个分类');
              return;
            }
            setEditing(null);
            setFormOpen(true);
          }}
        >
          新增记账
        </Button>
      </Space>

      <Card>
        <ExpenseTable
          project={project}
          onEdit={(e) => {
            setEditing(e);
            setFormOpen(true);
          }}
          onDelete={(expenseId) => {
            dispatch({ type: 'DELETE_EXPENSE', projectId: project.id, expenseId });
            message.success('已删除');
          }}
        />
      </Card>

      <ExpenseForm
        open={formOpen}
        project={project}
        initial={editing}
        onCancel={() => setFormOpen(false)}
        onSubmit={(data) => {
          if (editing) {
            dispatch({
              type: 'UPDATE_EXPENSE',
              projectId: project.id,
              expense: { ...editing, ...data },
            });
            message.success('已更新');
          } else {
            dispatch({ type: 'ADD_EXPENSE', projectId: project.id, expense: data });
            message.success('已记录');
          }
          setFormOpen(false);
        }}
      />
    </div>
  );
}
