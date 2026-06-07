import { useMemo, useState } from 'react';
import { Navigate, useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  App as AntApp,
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Statistic,
  Tabs,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAppState } from '../state/AppContext';
import { MemberPanel } from '../components/MemberPanel';
import { CategoryPanel } from '../components/CategoryPanel';
import { ExpenseForm } from '../components/ExpenseForm';
import { calcCategoryStats, calcPerCapita, calcTotal } from '../utils/stats';
import { formatMoney } from '../utils/money';

export default function ProjectHome() {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, dispatch } = useAppState();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const TAB_KEYS = ['overview', 'members', 'categories'] as const;
  type TabKey = (typeof TAB_KEYS)[number];
  const rawTab = searchParams.get('tab');
  const activeTab: TabKey =
    rawTab && (TAB_KEYS as readonly string[]).includes(rawTab) ? (rawTab as TabKey) : 'overview';

  const project = projectId ? getProject(projectId) : undefined;

  const total = useMemo(
    () => (project ? calcTotal(project.expenses) : 0),
    [project],
  );
  const perCapita = useMemo(
    () => (project ? calcPerCapita(total, project.members.length) : 0),
    [project, total],
  );
  const categoryStats = useMemo(
    () => (project ? calcCategoryStats(project.expenses, project.categories) : []),
    [project],
  );

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const recent = [...project.expenses]
    .sort((a, b) =>
      a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
    )
    .slice(0, 5);

  const memberMap = new Map(project.members.map((m) => [m.id, m.name]));
  const categoryMap = new Map(project.categories.map((c) => [c.id, c]));

  // 是否满足新增记账的前置条件
  const canAdd = project.members.length > 0 && project.categories.length > 0;

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          返回
        </Button>
      </Space>
      <Breadcrumb
        items={[
          { title: <Link to="/">项目</Link> },
          { title: project.name },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {project.name}
        </Typography.Title>
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            const next = window.prompt('修改项目名', project.name);
            if (next == null) return;
            const trimmed = next.trim();
            if (!trimmed) return;
            dispatch({ type: 'RENAME_PROJECT', projectId: project.id, name: trimmed });
          }}
        >
          重命名
        </Button>
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总消费"
              value={total}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatMoney(total)}
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="笔数"
              value={project.expenses.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="成员数"
              value={project.members.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="分类数"
              value={project.categories.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            if (!canAdd) {
              message.warning('请先添加至少 1 名成员和 1 个分类');
              return;
            }
            setFormOpen(true);
          }}
        >
          新增记账
        </Button>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => navigate(`/projects/${project.id}/expenses`)}
        >
          记账管理
        </Button>
        <Button
          icon={<BarChartOutlined />}
          onClick={() => navigate(`/projects/${project.id}/stats`)}
        >
          消费统计
        </Button>
      </Space>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          if (key === 'overview') {
            // 默认 tab 不写入 URL，保持 URL 干净
            searchParams.delete('tab');
            setSearchParams(searchParams, { replace: true });
          } else {
            setSearchParams({ tab: key }, { replace: true });
          }
        }}
        items={[
          {
            key: 'overview',
            label: '概览',
            children: (
              <div>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12}>
                    <Card title="人均消费">
                      <Statistic
                        value={perCapita}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#722ed1' }}
                      />
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        计算方式：总消费 / 成员数
                      </Typography.Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card title="分类 Top 3">
                      {categoryStats.length === 0 ? (
                        <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {categoryStats.slice(0, 3).map((s) => (
                            <Space key={s.categoryId} style={{ width: '100%', justifyContent: 'space-between' }}>
                              <span>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    background: s.color,
                                    marginRight: 6,
                                  }}
                                />
                                {s.name}
                              </span>
                              <Typography.Text strong>{formatMoney(s.amount)}</Typography.Text>
                            </Space>
                          ))}
                        </Space>
                      )}
                    </Card>
                  </Col>
                </Row>

                <Card title="最近 5 笔">
                  {recent.length === 0 ? (
                    <Empty description="还没有任何记账" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {recent.map((e) => {
                        const cat = categoryMap.get(e.categoryId);
                        return (
                          <Space
                            key={e.id}
                            style={{ width: '100%', justifyContent: 'space-between' }}
                          >
                            <Space>
                              <Typography.Text type="secondary" style={{ width: 90 }}>
                                {e.date}
                              </Typography.Text>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  background: cat?.color ?? '#bfbfbf',
                                }}
                              />
                              <span>{cat?.name ?? '（已删除）'}</span>
                              <Typography.Text type="secondary">
                                · 付款 {memberMap.get(e.payerId) ?? '（已删除）'}
                              </Typography.Text>
                            </Space>
                            <Typography.Text strong style={{ color: '#cf1322' }}>
                              {formatMoney(e.amount)}
                            </Typography.Text>
                          </Space>
                        );
                      })}
                    </Space>
                  )}
                </Card>
              </div>
            ),
          },
          {
            key: 'members',
            label: `成员管理（${project.members.length}）`,
            children: (
              <Card>
                <MemberPanel
                  project={project}
                  onAdd={(n) => dispatch({ type: 'ADD_MEMBER', projectId: project.id, name: n })}
                  onRename={(memberId, n) =>
                    dispatch({ type: 'RENAME_MEMBER', projectId: project.id, memberId, name: n })
                  }
                  onDelete={(memberId) =>
                    dispatch({ type: 'DELETE_MEMBER', projectId: project.id, memberId })
                  }
                />
              </Card>
            ),
          },
          {
            key: 'categories',
            label: `分类管理（${project.categories.length}）`,
            children: (
              <Card>
                <CategoryPanel
                  project={project}
                  onAdd={(n, c) =>
                    dispatch({ type: 'ADD_CATEGORY', projectId: project.id, name: n, color: c })
                  }
                  onRename={(categoryId, n, c) =>
                    dispatch({
                      type: 'RENAME_CATEGORY',
                      projectId: project.id,
                      categoryId,
                      name: n,
                      color: c,
                    })
                  }
                  onDelete={(categoryId) =>
                    dispatch({ type: 'DELETE_CATEGORY', projectId: project.id, categoryId })
                  }
                />
              </Card>
            ),
          },
        ]}
      />

      <ExpenseForm
        open={formOpen}
        project={project}
        initial={null}
        onCancel={() => setFormOpen(false)}
        onSubmit={(data) => {
          dispatch({ type: 'ADD_EXPENSE', projectId: project.id, expense: data });
          message.success('已记录');
          setFormOpen(false);
        }}
      />
    </div>
  );
}
