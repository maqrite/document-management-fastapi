import { useState } from 'react';
import { Table, Button, Space, Card } from 'antd';
import DocumentUploader from '../components/DocumentUploader';
import { uploadDocument } from '../api/documents';

interface Document {
    id: string;
    name: string;
    status: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([
        { id: '1', name: 'Пример документа.docx', status: 'На подписании' },
    ]);

    const handleUpload = async (file: File) => {
        try {
            const response = await uploadDocument(file);
            setDocuments(prev => [...prev, {
                id: response.id || Date.now().toString(),
                name: file.name,
                status: 'На подписании'
            }]);
        } catch (error) {
            throw new Error('Не удалось загрузить файл');
        }
    };

    const columns = [
        { title: 'Название документа', dataIndex: 'name', key: 'name' },
        { title: 'Статус', dataIndex: 'status', key: 'status' },
        {
            title: 'Действия',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="primary">Подписать</Button>
                    <Button danger>Отклонить</Button>
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
                style={{ marginTop: 24 }}
                pagination={false}
            />
        </Card>
    );
}