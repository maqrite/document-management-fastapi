import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();

    const onFinish = () => {
        message.success('Добро пожаловать!');
        navigate('/documents');
    };

    return (
        <div style={{
            maxWidth: 400,
            margin: '100px auto',
            padding: 24,
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ textAlign: 'center' }}>Вход в систему</h2>
            <Form onFinish={onFinish}>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Введите логин' }]}
                >
                    <Input placeholder="Логин" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль' }]}
                >
                    <Input.Password placeholder="Пароль" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Войти
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}