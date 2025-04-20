import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();

    const onFinish = () => {
        message.success('Вход выполнен!');
        navigate('/documents');
    };

    return (
        <div style={{ maxWidth: 400, margin: '100px auto' }}>
            <h2>Вход в систему</h2>
            <Form onFinish={onFinish}>
                <Form.Item name="username" rules={[{ required: true }]}>
                    <Input placeholder="Логин" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true }]}>
                    <Input.Password placeholder="Пароль" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                    Войти
                </Button>
            </Form>
        </div>
    );
}