import { useMemo } from 'react';
import { Navigate, useParams, useNavigate, Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Col, Row, Space, Statistic, Typography, Empty } from 'antd';
import { ArrowLeftOutlined, CrownOutlined } from '@ant-design/icons';
import { useAppState } from '../state/AppContext';
import { CategoryStatTable } from '../components/CategoryStatTable';
import { PersonRanking } from '../components/PersonRanking';
import {
  calcCategoryStats,
  calcPerCapita,
  calcPersonStats,
  calcTotal,
} from '../utils/stats';
import { formatMoney } from '../utils/money';

export default function StatsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useAppState();
  const navigate = useNavigate();

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
  const personStats = useMemo(
    () => (project ? calcPersonStats(project.expenses, project.members) : []),
    [project],
  );
  const topCategory = categoryStats[0];
  const topPerson = personStats[0];

  if (!project) {
    return <Navigate to="/" replace />;
  }

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
          { title: '消费统计' },
        ]}
        style={{ marginBottom: 16 }}
      />
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        消费统计
      </Typography.Title>

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
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="人均消费"
              value={perCapita}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              总消费 / 成员数
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="分类数"
              value={project.categories.length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card title="消费最多分类">
            {topCategory ? (
              <Space direction="vertical">
                <Typography.Text>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      background: topCategory.color,
                      marginRight: 8,
                    }}
                  />
                  <Typography.Text strong style={{ fontSize: 18 }}>
                    {topCategory.name}
                  </Typography.Text>
                </Typography.Text>
                <Statistic
                  value={topCategory.amount}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ fontSize: 24, color: '#fa8c16' }}
                />
                <Typography.Text type="secondary">
                  共 {topCategory.count} 笔，占总消费 {topCategory.percent.toFixed(1)}%
                </Typography.Text>
              </Space>
            ) : (
              <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title={<Space><CrownOutlined style={{ color: 'gold' }} /> 消费榜首</Space>}>
            {topPerson ? (
              <Space direction="vertical">
                <Typography.Text strong style={{ fontSize: 18 }}>
                  {topPerson.name}
                </Typography.Text>
                <Statistic
                  value={topPerson.amount}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ fontSize: 24, color: '#d4380d' }}
                />
                <Typography.Text type="secondary">
                  参与 {topPerson.count} 笔记账（按参与金额排名）
                </Typography.Text>
              </Space>
            ) : (
              <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="各分类消费" style={{ marginBottom: 16 }}>
        <CategoryStatTable stats={categoryStats} />
      </Card>

      <Card title="个人消费排行榜（按参与金额）">
        <PersonRanking stats={personStats} />
      </Card>
    </div>
  );
}
