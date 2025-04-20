import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DocumentsPage from './pages/DocumentsPage';
import { Layout } from 'antd';

const { Header, Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Header style={{ color: 'white' }}>Система документооборота</Header>
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