import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

interface DocumentUploaderProps {
    onUpload: (file: File) => void;
}

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
    const props: UploadProps<File> = {
        beforeUpload: (file: UploadFile<File>) => {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];

            if (!file.type || !allowedTypes.includes(file.type)) {
                message.error('Можно загружать только PDF, DOC, DOCX или TXT!');
                return Upload.LIST_IGNORE;
            }

            // Правильное преобразование UploadFile в File
            if (file.originFileObj instanceof File) {
                onUpload(file.originFileObj);
            } else {
                message.error('Ошибка при обработке файла');
                return Upload.LIST_IGNORE;
            }

            return false;
        },
        showUploadList: false,
        accept: '.pdf,.doc,.docx,.txt'
    };

    return (
        <Upload {...props}>
            <Button icon={<UploadOutlined />}>Загрузить документ</Button>
        </Upload>
    );
}

export { };