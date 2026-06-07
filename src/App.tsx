import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { App as AntApp, ConfigProvider, Layout, Typography } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import { AppProvider } from './state/AppContext';
import ProjectList from './pages/ProjectList';
import ProjectHome from './pages/ProjectHome';
import ExpenseList from './pages/ExpenseList';
import StatsPage from './pages/StatsPage';

const { Header, Content, Footer } = Layout;

// 静态部署（file://）时使用 HashRouter；本地开发或 http 服务用 BrowserRouter
const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
const Router = isFileProtocol ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <AppProvider>
          <Router>
            <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
              <Header
                style={{
                  background: '#fff',
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: '#1677ff' }}>
                  💰 AA 记账
                </Typography.Title>
                <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                  团队记账小工具
                </Typography.Text>
              </Header>
              <Content
                style={{
                  padding: '24px',
                  maxWidth: 1200,
                  width: '100%',
                  margin: '0 auto',
                }}
              >
                <Routes>
                  <Route path="/" element={<ProjectList />} />
                  <Route path="/projects/:projectId" element={<ProjectHome />} />
                  <Route path="/projects/:projectId/expenses" element={<ExpenseList />} />
                  <Route path="/projects/:projectId/stats" element={<StatsPage />} />
                  <Route path="*" element={<ProjectList />} />
                </Routes>
              </Content>
              <Footer style={{ textAlign: 'center', background: 'transparent', color: '#999' }}>
                AA 记账 · 数据保存在你的浏览器本地
              </Footer>
            </Layout>
          </Router>
        </AppProvider>
      </AntApp>
    </ConfigProvider>
  );
}
