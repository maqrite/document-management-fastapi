import { useState } from 'react';
import { Table, Button, Space } from 'antd';
import DocumentUploader from '../components/DocumentUploader';
import { uploadDocument } from '../api/documents';

interface Document {
    id: string;
    name: string;
    status: string;
}


export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([
        { id: '1', name: 'Договор №1', status: 'На подписании' },
        { id: '2', name: 'Акт выполненных работ', status: 'Подписан' },
    ]);

    const handleUpload = async (file: File) => {
        try {
            const uploadedDoc = await uploadDocument(file);
            setDocuments([...documents, {
                id: uploadedDoc.id,
                name: file.name,
                status: 'На подписании'
            }]);
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const columns = [
        { title: 'Название', dataIndex: 'name' },
        { title: 'Статус', dataIndex: 'status' },
        {
            title: 'Действия',
            render: (_: any, record: Document) => (
                <Space>
                    <Button type="primary">Подписать</Button>
                    <Button danger>Отклонить</Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>Мои документы</h2>
            <DocumentUploader onUpload={handleUpload} />
            <Table
                dataSource={documents}
                columns={columns}
                rowKey="id"
                style={{ marginTop: 24 }}
            />
        </div>
    );
}