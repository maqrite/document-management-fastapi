import { useState, useEffect } from 'react';
import { Button, Form, Input, message, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';

interface AuthResponse {
    access_token: string;
    error?: string;
}

async function loginUser(username: string, password: string): Promise<AuthResponse> {
    console.log(`Logging in user: ${username}`);
    try {
        const body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);

        console.log("Sending logging in request:", body);

        const response = await fetch("http://localhost:8000/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        const data = await response.json();

        console.log("Response status:", response.status);
        console.log("Response data:", data);

        if (response.ok) {
            console.log("Logged in successfully");
            return { access_token: data.access_token };
        } else {
            console.warn("Logging in failed:", data.error || 'unknown_error');
            return { access_token: '', error: data.error || 'unknown_error' };
        }
    } catch (err) {
        console.error("Logging in error:", err);
        return { access_token: '', error: 'network_error' };
    }
}

async function registerUser(email: string, password: string, username: string): Promise<AuthResponse> {

    console.log(`Registering user: ${username}`);

    try {
        const body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);

        const requestBody = {
            username: username,
            password: password,
            email: email,
        };

        console.log("Sending registration request:", requestBody);

        const response = await fetch("http://localhost:8000/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        console.log("Response status:", response.status);
        console.log("Response data:", data);

        if (response.ok) {
            console.log("User registered successfully");
            return { access_token: data.access_token };
        } else {
            console.warn("Registration failed:", data.error || 'unknown_error');
            return { access_token: '', error: data.error || 'unknown_error' };
        }
    } catch (err) {
        console.error("Registration error:", err);
        return { access_token: '', error: 'network_error' };
    }
}


export default function LoginPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            navigate('/documents');
        }
    }, [navigate]);

    const handleAuthSuccess = (token: string) => {
        localStorage.setItem('access_token', token);
        navigate('/documents');
    };

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const { access_token, error } = await loginUser(values.email, values.password);
            if (access_token) {
                message.success('Вход выполнен успешно!');
                handleAuthSuccess(access_token);
            } else {
                handleAuthError(error || 'unknown_error', 'login');
            }
        } catch {
            message.error('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values: { email: string; password: string; name: string }) => {
        setLoading(true);
        try {
            const { access_token, error } = await registerUser(
                values.email,
                values.password,
                values.name
            );

            if (access_token) {
                message.success('Регистрация прошла успешно!');
                handleAuthSuccess(access_token);
            } else {
                handleAuthError(error || 'unknown_error', 'register');
            }
        } catch {
            message.error('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (error: string, mode: 'login' | 'register') => {
        const fieldMap: Record<string, string> = {
            'incorrect_password': 'password',
            'user_not_found': 'email',
            'email_exists': 'email',
            'empty_password': 'password',
            'invalid_email': 'email'
        };

        const messages: Record<string, string> = {
            'incorrect_password': 'Неверный пароль',
            'user_not_found': 'Пользователь с такой почтой не найден',
            'email_exists': 'Пользователь с такой почтой уже существует',
            'empty_password': 'Пароль не может быть пустым',
            'invalid_email': 'Некорректный email'
        };

        if (fieldMap[error]) {
            form.setFields([{
                name: fieldMap[error],
                errors: [messages[error] || 'Ошибка']
            }]);
        }
        message.error(messages[error] || (mode === 'login' ? 'Ошибка при входе' : 'Ошибка при регистрации'));
    };

    return (
        <div className="auth-container">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                items={[
                    { key: 'login', label: 'Вход' },
                    { key: 'register', label: 'Регистрация' },
                ]}
            />

            {activeTab === 'login' ? (
                <Form form={form} onFinish={handleLogin}>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Введите email' },
                            { type: 'email', message: 'Введите корректный email' }
                        ]}
                    >
                        <Input placeholder="Email" size="large" />
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
                        name="name"
                        rules={[
                            { required: true, message: 'Введите ваше имя' },
                            { min: 2, message: 'Имя должно быть не менее 2 символов' }
                        ]}
                    >
                        <Input placeholder="Ваше имя" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Введите email' },
                            { type: 'email', message: 'Введите корректный email' }
                        ]}
                    >
                        <Input placeholder="Email" size="large" />
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