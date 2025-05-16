import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface Props {
    onUpload: (file: File) => void;
}

export default function DocumentUploader({ onUpload }: Props) {
    const beforeUpload = (file: File) => {
        onUpload(file);
        return false; // Отменяем стандартное поведение Upload
    };

    return (
        <Upload
            beforeUpload={beforeUpload}
            showUploadList={false}
            accept=".pdf,.doc,.docx"
        >
            <Button icon={<UploadOutlined />}>Загрузить документ</Button>
        </Upload>
    );
}