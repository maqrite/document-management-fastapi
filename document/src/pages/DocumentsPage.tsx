import { useState, useEffect } from 'react';
import { Table, Button, Space, Card, message, Popconfirm, Select, Modal, Form, Input } from 'antd';
import DocumentUploader from '../components/DocumentUploader';
import { rejectDocument } from '../api/documents';

const { Option } = Select;

interface Document {
  id: string;
  name: string;
  status: 'На подписании' | 'Подписан' | 'Отклонён';
  signedAt?: string;
  owner?: string;
  recipient?: string;
  rejectedReason?: string;
}

// Временные реализации API-функций (замените их на реальные вызовы API)
const fetchDocuments = async (): Promise<Document[]> => {
  // Заглушка - в реальном приложении заменить на вызов API
  return [
    { id: '1', name: 'Документ 1', status: 'На подписании' },
    { id: '2', name: 'Документ 2', status: 'Подписан', signedAt: new Date().toISOString() },
  ];
};

const fetchUsers = async (): Promise<string[]> => {
  // Заглушка - в реальном приложении заменить на вызов API
  return ['user1', 'user2', 'user3'];
};

const uploadDocument = async (file: File): Promise<void> => {
  // Заглушка - в реальном приложении заменить на вызов API
  console.log('Uploading file:', file.name);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const sendDocument = async (docId: string, recipient: string): Promise<void> => {
  // Заглушка - в реальном приложении заменить на вызов API
  console.log(`Sending document ${docId} to ${recipient}`);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const signDocument = async (docId: string): Promise<void> => {
  // Заглушка - в реальном приложении заменить на вызов API
  console.log(`Signing document ${docId}`);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, userList] = await Promise.all([
        fetchDocuments(),
        fetchUsers()
      ]);
      setDocuments(docs);
      setUsers(userList);
    } catch (err) {
      message.error('Ошибка загрузки данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadDocument(file);
      message.success('Документ загружен!');
      loadData();
    } catch (err) {
      message.error('Ошибка загрузки');
      console.error(err);
    }
  };

  const handleSend = async (docId: string) => {
    setSelectedDocId(docId);
    setSendModalVisible(true);
  };

  const confirmSend = async (values: { recipient: string }) => {
    if (!selectedDocId) return;
    
    try {
      setLoadingIds(prev => [...prev, selectedDocId]);
      await sendDocument(selectedDocId, values.recipient);
      message.success('Документ отправлен на подпись!');
      loadData();
      setSendModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error('Ошибка отправки документа');
      console.error(err);
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== selectedDocId));
    }
  };

  const handleSign = async (id: string) => {
    try {
      setLoadingIds(prev => [...prev, id]);
      await signDocument(id);
      message.success('Документ подписан!');
      loadData();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Ошибка подписания');
      console.error(err);
    } finally {
      setLoadingIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      setLoadingIds(prev => [...prev, id]);
      await rejectDocument(id, reason);
      message.success('Документ отклонён');
      loadData();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Ошибка отклонения');
      console.error(err);
    } finally {
      setLoadingIds(prev => prev.filter(item => item !== id));
    }
  };

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string, record: Document) => (
        <span style={{ 
          color: status === 'Подписан' ? 'green' : 
                status === 'Отклонён' ? 'red' : 'orange',
          fontWeight: 500
        }}>
          {status}
          {record.signedAt && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {new Date(record.signedAt).toLocaleString()}
            </div>
          )}
          {record.recipient && (
            <div style={{ fontSize: 12, color: '#666' }}>
              Для: {record.recipient}
            </div>
          )}
        </span>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Document) => (
        <Space>
          {record.status === 'На подписании' && !record.recipient && (
            <Button 
              onClick={() => handleSend(record.id)}
              loading={loadingIds.includes(record.id)}
            >
              Отправить на подпись
            </Button>
          )}
          
          {record.status === 'На подписании' && record.recipient && (
            <>
              <Button 
                type="primary" 
                onClick={() => handleSign(record.id)}
                loading={loadingIds.includes(record.id)}
              >
                Подписать
              </Button>
              
              <Popconfirm
                title="Укажите причину отклонения"
                description={
                  <Input.TextArea 
                    placeholder="Причина" 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      (record.rejectedReason = e.target.value)
                    }
                  />
                }
                onConfirm={() => handleReject(record.id, record.rejectedReason || '')}
                okText="Отклонить"
                cancelText="Отмена"
              >
                <Button 
                  danger 
                  loading={loadingIds.includes(record.id)}
                >
                  Отклонить
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="Документооборот" bordered={false}>
      <DocumentUploader onUpload={handleUpload} />
      
      <Table
        dataSource={documents}
        columns={columns}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 24 }}
        pagination={false}
      />
      
      <Modal
        title="Отправить документ на подпись"
        open={sendModalVisible}
        onCancel={() => {
          setSendModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={confirmSend}>
          <Form.Item
            name="recipient"
            label="Получатель"
            rules={[{ required: true, message: 'Выберите получателя' }]}
          >
            <Select placeholder="Выберите пользователя">
              {users.map(user => (
                <Option key={user} value={user}>{user}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingIds.includes(selectedDocId || '')}>
              Отправить
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}