import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { UploadProps, RcFile } from 'antd/es/upload';

const { Dragger } = Upload;

interface DocumentUploaderProps {
    onUpload: (file: File) => Promise<void>;
}

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        showUploadList: false,
        accept: '.pdf,.doc,.docx,.txt,.json',
        customRequest: async ({ file }) => {
            try {
                await onUpload(file as RcFile);
                message.success(`${(file as RcFile).name} успешно загружен`);
            } catch (error) {
                message.error('Ошибка при загрузке файла');
            }
        },
        beforeUpload: (file) => {
            const isValidFormat = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/json',
            ].includes(file.type);

            if (!isValidFormat) {
                message.error('Пожалуйста, выберите файл PDF, DOC, DOCX, TXT или JSON');
                return Upload.LIST_IGNORE;
            }
            return true;
        },
    };

    return (
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p>Нажмите или перетащите документ для загрузки</p>
            <p>Поддерживаемые форматы: PDF, DOC, DOCX, TXT, JSON</p>
        </Dragger>
    );
}