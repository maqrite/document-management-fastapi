import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Space, Typography, Card, Input, message, Tag, Upload, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getFile, getFileUsers, addFileUser, Document, FileUser, deleteFile, replaceFile, signFile } from './documentService';
import type { RcFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

export default function FileDetailsPage() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState<Document | null>(null);
    const [users, setUsers] = useState<FileUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [replacing, setReplacing] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const token = localStorage.getItem('access_token') || '';

    const showSignatureModal = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        setIsModalVisible(false);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        if (fileId) fetchFileData();
    }, [fileId]);

    const fetchFileData = async () => {
        setLoading(true);
        try {
            const [fileData, fileUsers] = await Promise.all([
                getFile(token, fileId!),
                getFileUsers(token, fileId!)
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
            const success = await addFileUser(token, fileId!, newUserEmail);
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

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот документ?')) {
            setLoading(true);
            try {
                const success = await deleteFile(token, fileId!);
                if (success) {
                    message.success('Документ удален');
                    navigate('/documents');
                } else {
                    message.error('Не удалось удалить документ');
                }
            } catch (err) {
                message.error('Ошибка при удалении документа');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSign = async () => {
        setLoading(true);
        try {
            const success = await signFile(token, fileId!);
            if (success) {
                message.success('Документ подписан');
                fetchFileData();
            } else {
                message.error('Не удалось подписать документ');
            }
        } catch (err) {
            message.error('Ошибка при подписании документа');
        } finally {
            setLoading(false);
        }
    };

    const handleReplace = async (file: File) => {
        setReplacing(true);
        try {
            const success = await replaceFile(token, fileId!, file);
            if (success) {
                message.success('Файл успешно заменен');
                fetchFileData();
            } else {
                message.error('Ошибка замены файла');
            }
        } catch (err) {
            message.error('Ошибка замены файла');
        } finally {
            setReplacing(false);
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
            dataIndex: 'full_name',
            key: 'name',
            render: (name: string | null) => name || '—',
        },
        {
            title: 'Уровень доступа',
            dataIndex: 'access_level',
            key: 'access_level',
            render: (level: string) => level === 'edit' ? 'Редактирование' : 'Просмотр и подпись'
        },
    ];

    if (!file) return null;

    return (
        <div className="file-details-container">
            <Button onClick={() => navigate('/documents')} style={{ marginBottom: 16 }}>
                Назад к документам
            </Button>

            <Card
                title={
                    <Space>
                        <Title level={3}>{file.original_filename}</Title>
                        <Tag color={file.is_signed ? 'green' : 'orange'}>
                            {file.is_signed ? 'Подписан' : 'Не подписан'}
                        </Tag>
                    </Space>
                }
                loading={loading}
                extra={
                    <Space>
                        {!file.is_signed && (
                            <Button
                                type="primary"
                                onClick={handleSign}
                                loading={loading}
                            >
                                Подписать
                            </Button>
                        )}
                        <Upload
                            accept="*"
                            showUploadList={false}
                            customRequest={({ file }) => {
                                const rcFile = file as RcFile;
                                handleReplace(rcFile);
                            }}
                        >
                            <Button icon={<UploadOutlined />} loading={replacing}>
                                Заменить
                            </Button>
                        </Upload>
                        <Button
                            danger
                            onClick={handleDelete}
                            loading={loading}
                        >
                            Удалить
                        </Button>
                    </Space>
                }
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Владелец:</Text> {file.owner.full_name} ({file.owner.email})
                    </div>
                    <div>
                        <Text strong>Дата загрузки:</Text> {new Date(file.upload_date).toLocaleString()}
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

            <Modal
                title="Электронная подпись"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <p>Вам нужна подтвержденная подпись для использования этой функции</p>
            </Modal>
        </div>
    );
}