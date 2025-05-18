import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
    return (
        <div className="about-container">
            <Title level={2}>О проекте</Title>
            <Paragraph>
                Это веб-приложение разработано для работы с документами.
            </Paragraph>
            <Paragraph>
                Здесь вы можете хранить, просматривать и управлять своими документами,
                а также предоставлять доступ другим пользователям.
            </Paragraph>
        </div>
    );
}