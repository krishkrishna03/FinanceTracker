import React from 'react';
import { Form, Input, Button, Typography, Card, message, Divider } from 'antd';
import { LockIcon, MailIcon, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <DollarSign size={48} color="#1890ff" />
          <Title level={2}>Welcome to FinTrack</Title>
          <Paragraph>Log in to manage your finances</Paragraph>
        </div>
        <Divider />
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
          className="auth-form"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailIcon size={16} className="site-form-item-icon" />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password 
              prefix={<LockIcon size={16} className="site-form-item-icon" />} 
              placeholder="Password" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={isSubmitting}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Paragraph>
            Don't have an account? <Link to="/register">Create one now</Link>
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default Login;