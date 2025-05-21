import { useState, useEffect } from 'react';
import { Button, Upload, Table, message, Space, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
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
      const files = await getFiles(token);
      setDocuments(files);
    } catch (err) {
      message.error('Ошибка при загрузке документов');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (name: string, file: File) => {
    try {
      const success = await addFile(token, name,file);
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
      dataIndex: 'name',
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
      title: 'Размер (КБ)',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => (size / 1024).toFixed(2),
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'uploaded_at',
      key: 'uploaded_at',
    },
    {
      title: 'Владелец',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (name: string, record: Document) => `${name} (${record.owner_email})`
    },
  ];

  return (
    <div className="documents-container">
      <Title level={2}>Мои документы</Title>

      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
        <Upload
          accept="*"
          showUploadList={false}
          customRequest={({ file }) => {
            // file is RcFile → has .name
            const rcFile = file as RcFile;          // (optional) satisfy TypeScript
            handleUpload(rcFile.name, rcFile);      // pass the name + the file
          }}
        >
          <Button icon={<UploadOutlined />} type="primary">
            Загрузить документ
          </Button>
        </Upload>
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