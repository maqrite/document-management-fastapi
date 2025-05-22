import { useState, useEffect } from 'react';
import { Button, Upload, Table, message, Space, Typography } from 'antd';
import { UploadOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFiles, addFile, Document } from '../pages/documentService';
import type { RcFile } from 'antd/es/upload/interface';

const { Title } = Typography;

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('access_token') || '';

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const rawFiles = await getFiles(token);
      setDocuments(rawFiles);
    } catch (err) {
      console.error('Error fetching documents:', err);
      message.error('Ошибка при загрузке документов');
    } finally {
      setLoading(false);
    }
  };

  // Пустая функция для кнопки фильтра
  const handleFilterClick = () => {
    // Ничего не делаем
  };

  const handleUpload = async (name: string, file: File) => {
    try {
      const success = await addFile(token, name, file);
      if (success) {
        message.success('Файл успешно загружен');
        fetchDocuments();
      } else {
        message.error('Ошибка загрузки файла');
      }
    } catch (err) {
      message.error('Ошибка загрузки файла');
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'original_filename',
      key: 'name',
      render: (name: string, record: Document) => (
        <Button
          type="link"
          onClick={() => navigate(`/documents/${record.id}`)}
        >
          {name}
        </Button>
      ),
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'upload_date',
      key: 'uploaded_at',
    },
    {
      title: 'Владелец',
      dataIndex: 'owner',
      key: 'owner',
      render: (_: any, record: Document) => {
        const name = record.owner?.full_name ?? '—';
        const email = record.owner?.email ?? '—';
        return `${name} (${email})`;
      }
    },
  ];

  return (
    <div className="documents-container">
      <Title level={2}>Мои документы</Title>

      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
        <Space>
          <Upload
            accept="*"
            showUploadList={false}
            customRequest={({ file }) => {
              const rcFile = file as RcFile;
              handleUpload(rcFile.name, rcFile);
            }}
          >
            <Button icon={<UploadOutlined />} type="primary">
              Загрузить документ
            </Button>
          </Upload>

          {/* Кнопка фильтра */}
          <Button
            icon={<FilterOutlined />}
            onClick={handleFilterClick}
          >
            Фильтр
          </Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        loading={loading}
        bordered
      />
    </div>
  );
}