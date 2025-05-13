import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import DocumentsPage from './pages/DocumentsPage';
import LoginPage from './pages/LoginPage';

const { Header, Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ color: 'white', fontSize: '18px' }}>
          Система документооборота
        </Header>
        <Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;