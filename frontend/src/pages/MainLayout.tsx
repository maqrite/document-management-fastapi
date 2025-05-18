// ЗДЕСЬ НЕТ ПРОВЕРКИ АВТОРИЗАЦИИ
import { Layout, Menu, Button } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FileOutlined, InfoCircleOutlined, LogoutOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;

export default function MainLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const items = [
        {
            key: '1',
            icon: <FileOutlined />,
            label: <Link to="/documents">Мои документы</Link>
        },
        {
            key: '2',
            icon: <InfoCircleOutlined />,
            label: <Link to="/about">О проекте</Link>
        },
        {
            key: '3',
            icon: <LogoutOutlined />,
            label: (
                <Button
                    type="text"
                    onClick={handleLogout}
                    style={{ padding: 0, width: '100%', textAlign: 'left' }}
                >
                    Выйти
                </Button>
            ),
            style: { marginTop: 'auto', borderTop: '1px solid #f0f0f0' }
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200} theme="light">
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: 0
                    }}
                    items={items}
                />
            </Sider>
            <Layout>
                <Content style={{ padding: '24px' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}