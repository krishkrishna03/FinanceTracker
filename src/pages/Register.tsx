import React from 'react';
import { Form, Input, Button, Typography, Card, message, Divider } from 'antd';
import { LockIcon, MailIcon, UserIcon, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const Register: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      await register(values.name, values.email, values.password);
      message.success('Registration successful');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <DollarSign size={48} color="#1890ff" />
          <Title level={2}>Create an Account</Title>
          <Paragraph>Join FinTrack to start managing your finances</Paragraph>
        </div>
        <Divider />
        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={handleSubmit}
          className="auth-form"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input 
              prefix={<UserIcon size={16} className="site-form-item-icon" />} 
              placeholder="Full Name" 
              size="large"
            />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password 
              prefix={<LockIcon size={16} className="site-form-item-icon" />} 
              placeholder="Password" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockIcon size={16} className="site-form-item-icon" />} 
              placeholder="Confirm Password" 
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
              Register
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Paragraph>
            Already have an account? <Link to="/login">Log in now</Link>
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default Register;