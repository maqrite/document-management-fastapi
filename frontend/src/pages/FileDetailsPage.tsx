import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Space, Typography, Card, Input, message } from 'antd';
import { getFile, getFileUsers, addFileUser, Document, FileUser } from '../pages/documentService';

const { Title, Text } = Typography;

export default function FileDetailsPage() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState<Document | null>(null);
    const [users, setUsers] = useState<FileUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const token = localStorage.getItem('access_token') || '';

    useEffect(() => {
        if (fileId) fetchFileData();
    }, [fileId]);

    const fetchFileData = async () => {
        setLoading(true);
        try {
            const [fileData, fileUsers] = await Promise.all([
                getFile(fileId!),
                getFileUsers(fileId!)
            ]);

            if (fileData) {
                setFile(fileData);
                setUsers(fileUsers);
            } else {
                message.error('Файл не найден');
                navigate('/documents');
            }
        } catch (err) {
            message.error('Ошибка загрузки данных файла');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUserEmail.trim()) return;

        setLoading(true);
        try {
            const success = await addFileUser(fileId!, newUserEmail);
            if (success) {
                message.success('Пользователь добавлен');
                setNewUserEmail('');
                fetchFileData();
            } else {
                message.error('Не удалось добавить пользователя');
            }
        } catch (err) {
            message.error('Ошибка при добавлении пользователя');
        } finally {
            setLoading(false);
        }
    };

    const userColumns = [
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Уровень доступа',
            dataIndex: 'access_level',
            key: 'access_level',
            render: (level: string) => level === 'edit' ? 'Редактирование' : 'Просмотр'
        },
    ];

    if (!file) return null;

    return (
        <div className="file-details-container">
            <Button onClick={() => navigate('/documents')} style={{ marginBottom: 16 }}>
                Назад к документам
            </Button>

            <Card title={<Title level={3}>{file.name}</Title>} loading={loading}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Владелец:</Text> {file.owner_name} ({file.owner_email})
                    </div>
                    <div>
                        <Text strong>Дата загрузки:</Text> {new Date(file.uploaded_at).toLocaleString()}
                    </div>
                    <div>
                        <Text strong>Размер:</Text> {(file.size / 1024).toFixed(2)} КБ
                    </div>

                    <Title level={4}>Пользователи с доступом</Title>
                    <Table
                        columns={userColumns}
                        dataSource={users}
                        rowKey="id"
                        pagination={false}
                    />

                    <Space.Compact style={{ width: '100%', marginTop: 16 }}>
                        <Input
                            placeholder="Email пользователя"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            type="email"
                        />
                        <Button
                            type="primary"
                            onClick={handleAddUser}
                            loading={loading}
                        >
                            Добавить пользователя
                        </Button>
                    </Space.Compact>
                </Space>
            </Card>
        </div>
    );
}