import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Space, Typography, Card, Input, message, Tag, Upload, Modal } from 'antd';
import { UploadOutlined, EyeOutlined, SafetyOutlined } from '@ant-design/icons';
import { getFile, getFileUsers, addFileUser, Document, FileUser, deleteFile, replaceFile, signFile } from './documentService';
import type { RcFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

const FileDetailsPage: React.FC = () => {
    const { fileId } = useParams<{ fileId: string }>();
    const navigate = useNavigate();
    const [file, setFile] = useState<Document | null>(null);
    const [users, setUsers] = useState<FileUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [replacing, setReplacing] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [viewerContent, setViewerContent] = useState('');
    const token = localStorage.getItem('access_token') || '';

    useEffect(() => {
        if (fileId) {
            fetchFileData();
        }
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

    const handleViewDocument = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/documents/${fileId}/download/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                message.error(`Не удалось получить документ. Ошибка: ${response.statusText}`);
                return;
            }

            const blob = await response.blob();
            const fileURL = URL.createObjectURL(blob);
            const contentType = response.headers.get('Content-Type');

            if (contentType?.startsWith('application/pdf')) {
                setViewerContent(`<iframe src="${fileURL}" width="100%" height="600px" style="border:none;"></iframe>`);
            } else if (contentType?.startsWith('image/')) {
                setViewerContent(`<img src="${fileURL}" style="max-width:100%;height:auto;" />`);
            } else if (contentType?.startsWith('text/')) {
                const text = await blob.text();
                setViewerContent(`<pre style="white-space:pre-wrap;">${text}</pre>`);
            } else {
                message.warning('Формат файла не поддерживается для прямого просмотра. Скачайте файл для просмотра.');
                return;
            }

            setIsViewerVisible(true);
        } catch (err) {
            message.error('Произошла ошибка при попытке просмотреть документ');
        } finally {
            setLoading(false);
        }
    };

    const handleElectronicSignature = () => {
        message.warning('Вам нужна подтвержденная подпись для использования этой функции');
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
                        <Button
                            icon={<EyeOutlined />}
                            onClick={handleViewDocument}
                            loading={loading}
                        >
                            Просмотреть
                        </Button>

                        {!file.is_signed && (
                            <Button
                                type="primary"
                                onClick={handleSign}
                                loading={loading}
                            >
                                Подписать
                            </Button>
                        )}

                        <Button
                            type="primary"
                            icon={<SafetyOutlined />}
                            onClick={handleElectronicSignature}
                            loading={loading}
                            disabled={loading}
                        >
                            Электронная подпись
                        </Button>

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
                title={`Просмотр документа: ${file.original_filename}`}
                open={isViewerVisible}
                onCancel={() => setIsViewerVisible(false)}
                footer={null}
                width="80%"
                style={{ top: 20 }}
            >
                <div dangerouslySetInnerHTML={{ __html: viewerContent }} />
            </Modal>
        </div>
    );
};

export default FileDetailsPage;