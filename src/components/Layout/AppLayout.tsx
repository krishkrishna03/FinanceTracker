import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Typography, Space } from 'antd';
import { 
  CreditCard, 
  Home, 
  TrendingUp, 
  LogOut, 
  User,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && collapsed) {
        setCollapsed(false);
      } else if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const avatarMenu = [
    {
      key: 'logout',
      label: (
        <Button type="text" icon={<LogOut size={16} />} onClick={logout}>
          Logout
        </Button>
      ),
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <Home size={18} />,
      label: 'Dashboard',
      onClick: () => handleMenuClick('/'),
    },
    {
      key: '/expenses',
      icon: <CreditCard size={18} />,
      label: 'Expenses',
      onClick: () => handleMenuClick('/expenses'),
    },
 {
  key: '/income',
  icon: <span style={{ fontWeight: 'bold', fontSize: 18 }}>₹</span>,
  label: 'Income',
  onClick: () => handleMenuClick('/income'),
},

    {
      key: '/analysis',
      icon: <TrendingUp size={18} />,
      label: 'Analysis',
      onClick: () => handleMenuClick('/analysis'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 999,
          transition: 'all 0.2s',
          transform: isMobile && collapsed ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        <div className="logo-container">
          <span style={{ fontWeight: 'bold', fontSize: 24 }}>₹</span>
          {!collapsed && <span>FinTrack</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 250),
        transition: 'margin-left 0.2s'
      }}>
        <Header className="app-header">
          <Button
            type="text"
            icon={collapsed ? <MenuIcon size={20} /> : <X size={20} />}
            onClick={toggleSidebar}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ marginLeft: 'auto' }}>
            <Space>
              <Dropdown menu={{ items: avatarMenu }} placement="bottomRight">
                <Space>
                  <Badge dot>
                    <Avatar icon={<User size={24} />} />
                  </Badge>
                  <Text style={{ marginLeft: 8 }}>{user?.name}</Text>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;