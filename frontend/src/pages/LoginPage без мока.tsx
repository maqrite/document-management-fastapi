import { useState } from 'react';
import { Button, Form, Input, message, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';

interface AuthResponse {
    access_token: string;
    error?: string;
}

async function loginUser(username: string, password: string): Promise<AuthResponse> {
    try {
        const body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        const data = await response.json();
        
        if (response.ok) {
            return { access_token: data.access_token };
        } else {
            return { access_token: '', error: data.error || 'unknown_error' };
        }
    } catch (err) {
        return { access_token: '', error: 'network_error' };
    }
}

async function registerUser(username: string, password: string): Promise<AuthResponse> {
    try {
        const body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);

        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        const data = await response.json();
        
        if (response.ok) {
            return { access_token: data.access_token };
        } else {
            return { access_token: '', error: data.error || 'unknown_error' };
        }
    } catch (err) {
        return { access_token: '', error: 'network_error' };
    }
}

export default function LoginPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleAuthSuccess = (token: string) => {
        // Сохраняем токен (например, в localStorage или контексте приложения)
        localStorage.setItem('access_token', token);
        // Перенаправляем пользователя
        navigate('/documents');
    };

    const handleLogin = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const { access_token, error } = await loginUser(values.username, values.password);

            if (access_token) {
                message.success('Добро пожаловать!');
                handleAuthSuccess(access_token);
            } else {
                switch (error) {
                    case 'incorrect_password':
                        message.error('Неверный пароль');
                        form.setFields([{ name: 'password', errors: ['Неверный пароль'] }]);
                        break;
                    case 'user_not_found':
                        message.error('Пользователь не найден');
                        form.setFields([{ name: 'username', errors: ['Пользователь не найден'] }]);
                        break;
                    default:
                        message.error('Ошибка при входе');
                }
            }
        } catch (err) {
            message.error('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const { access_token, error } = await registerUser(values.username, values.password);

            if (access_token) {
                message.success('Регистрация успешна!');
                handleAuthSuccess(access_token);
            } else {
                switch (error) {
                    case 'username_exists':
                        message.error('Пользователь уже существует');
                        form.setFields([{ name: 'username', errors: ['Пользователь уже существует'] }]);
                        break;
                    case 'empty_password':
                        message.error('Пароль не может быть пустым');
                        form.setFields([{ name: 'password', errors: ['Пароль не может быть пустым'] }]);
                        break;
                    case 'invalid_username':
                        message.error('Некорректное имя пользователя');
                        form.setFields([{ name: 'username', errors: ['Некорректное имя пользователя'] }]);
                        break;
                    default:
                        message.error('Ошибка при регистрации');
                }
            }
        } catch (err) {
            message.error('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: 400,
            margin: '100px auto',
            padding: 24,
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: 8,
            backgroundColor: '#fff'
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
                        <Input placeholder="Логин" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Введите пароль' }]}
                    >
                        <Input.Password placeholder="Пароль" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                        >
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <Form form={form} onFinish={handleRegister}>
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: 'Введите логин' },
                            { min: 3, message: 'Логин должен быть не менее 3 символов' },
                            { max: 20, message: 'Логин должен быть не более 20 символов' }
                        ]}
                    >
                        <Input placeholder="Логин" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Введите пароль' },
                            { min: 6, message: 'Пароль должен быть не менее 6 символов' }
                        ]}
                    >
                        <Input.Password placeholder="Пароль" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                        >
                            Зарегистрироваться
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
}