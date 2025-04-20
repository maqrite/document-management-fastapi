import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { UploadProps, RcFile } from 'antd/es/upload';

type DocumentUploaderProps = {
    onUpload: (file: File) => Promise<void>;
};

const { Dragger } = Upload;

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        customRequest: async ({ file }) => {
            try {
                const uploadFile = file as RcFile;
                await onUpload(uploadFile);
                message.success(`${uploadFile.name} успешно загружен`);
            } catch (error) {
                message.error('Ошибка при загрузке файла');
            }
        },
        beforeUpload: (file) => {
            const isAllowedFormat = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/json',
            ].includes(file.type);

            if (!isAllowedFormat) {
                message.error('Недопустимый формат файла');
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
            <p>Нажмите или перетащите файл для загрузки</p>
            <p>Поддерживаемые форматы: PDF, DOC, DOCX, TXT, JSON</p>
        </Dragger>
    );
}