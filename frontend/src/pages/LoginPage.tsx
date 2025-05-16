import { useState } from 'react';
import { Button, Form, Input, message, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';

// Заглушки функций (в реальном приложении это будут API-вызовы)
async function blackbox(username: string, password: string): Promise<string> {
    // Здесь должен быть реальный вызов API
    // Пример реализации для тестирования:
    if (username === "admin" && password === "admin123") return "success";
    if (username === "admin") return "failure_password";
    return "failure_username";
}

async function register(username: string, password: string): Promise<string> {
    // Здесь должен быть реальный вызов API
    // Пример реализации для тестирования:
    if (username === "admin") return "failure_username";
    if (!password) return "failure_password";
    return "success";
}

export default function LoginPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const result = await blackbox(values.username, values.password);

            if (result === "success") {
                message.success('Добро пожаловать!');
                navigate('/documents');
            } else if (result === "failure_password") {
                message.error('Неверный пароль');
                form.setFields([{ name: 'password', errors: ['Неверный пароль'] }]);
            } else {
                message.error('Пользователь не найден');
                form.setFields([{ name: 'username', errors: ['Пользователь не найден'] }]);
            }
        } catch (err) {
            message.error('Ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const result = await register(values.username, values.password);

            if (result === "success") {
                message.success('Регистрация успешна!');
                navigate('/documents');
            } else if (result === "failure_username") {
                message.error('Пользователь уже существует');
                form.setFields([{ name: 'username', errors: ['Пользователь уже существует'] }]);
            } else {
                message.error('Пароль не может быть пустым');
                form.setFields([{ name: 'password', errors: ['Пароль не может быть пустым'] }]);
            }
        } catch (err) {
            message.error('Ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: 400,
            margin: '100px auto',
            padding: 24,
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                items={[
                    {
                        key: 'login',
                        label: 'Вход',
                    },
                    {
                        key: 'register',
                        label: 'Регистрация',
                    },
                ]}
            />

            {activeTab === 'login' ? (
                <Form form={form} onFinish={handleLogin}>
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <Form form={form} onFinish={handleRegister}>
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Зарегистрироваться
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
}