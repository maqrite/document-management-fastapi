import { Modal, Button } from 'antd';
import { useState } from 'react';

export default function DocumentViewer({ document }: { document: any }) {
    const [isOpen, setIsOpen] = useState(false);

    const renderContent = () => {
        if (document.fileType === 'pdf') {
            return <iframe src={`/api/documents/${document.id}/view`} width="100%" height="500px" />;
        }
        return <pre>{document.content}</pre>; // Для текстовых файлов
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Просмотреть</Button>
            <Modal
                title={document.name}
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                footer={null}
                width="80%"
            >
                {renderContent()}
            </Modal>
        </>
    );
}