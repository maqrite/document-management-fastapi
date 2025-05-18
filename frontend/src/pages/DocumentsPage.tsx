import { useState, useEffect } from 'react';
import { Table, Button, Card, message, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'active' | 'archived';
}

// Заглушка API
const getFiles = async (token: string): Promise<Document[]> => {
  console.log('[DEBUG] Вызов getFiles с токеном:', token);
  return [
    { id: '1', name: 'Тестовый файл.pdf', size: '2.4 MB', uploadedAt: new Date().toISOString(), status: 'active' },
  ];
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[DEBUG] Монтирование DocumentsPage');
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    console.log('[DEBUG] Запуск loadDocuments');
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('[DEBUG] Токен из localStorage:', token);
      
      if (!token) {
        console.warn('[DEBUG] Токен не найден, перенаправление на /login');
        navigate('/login');
        return;
      }

      const files = await getFiles(token);
      console.log('[DEBUG] Полученные файлы:', files);
      setDocuments(files);
    } catch (err) {
      console.error('[DEBUG] Ошибка загрузки:', err);
      message.error('Ошибка загрузки документов');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Имя файла',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
    },
  ];

  return (
    <Card 
      title="Мои документы" 
      bordered={false}
      style={{ margin: 20, border: '2px solid #1890ff' }}
    >
      <h3 style={{ color: '#1890ff' }}>Компонент документов</h3>
      <Button 
        type="primary" 
        onClick={() => console.log('Документы:', documents)}
      >
        Показать данные в консоли
      </Button>
      
      <Table
        dataSource={documents}
        columns={columns}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: 'Нет документов' }}
        style={{ marginTop: 20 }}
      />
    </Card>
  );
}