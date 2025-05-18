import  { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, Button, Divider, Spin, Empty, Alert, Tag } from 'antd';
import { TrendingUp, TrendingDown, PlusCircle, Calendar } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import dayjs from 'dayjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title } = Typography;

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

interface CategoryTotal {
  category: string;
  total: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<CategoryTotal[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authorization token not found.');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [summaryRes, transactionsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/summary', config),
        axios.get('http://localhost:5000/api/dashboard/recent-transactions', config),
        axios.get('http://localhost:5000/api/dashboard/expense-categories', config),
      ]);

      setTotalIncome(summaryRes.data.totalIncome);
      setTotalExpense(summaryRes.data.totalExpense);
      setRecentTransactions(transactionsRes.data);
      setExpenseByCategory(categoriesRes.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const chartData = {
    labels: expenseByCategory.map(item => item.category),
    datasets: [
      {
        data: expenseByCategory.map(item => item.total),
        backgroundColor: [
          '#1890ff', '#52c41a', '#faad14', '#f5222d',
          '#722ed1', '#13c2c2', '#fa8c16', '#eb2f96',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const balance = totalIncome - totalExpense;

  if (loading) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Spin size="large" />  {/* Removed the tip prop */}
    </div>
  );
}

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Financial Dashboard</Title>
        <div>
          <Button type="primary" icon={<PlusCircle size={16} />} href="/expenses">
            Add Expense
          </Button>
          <Button type="primary" icon={<PlusCircle size={16} />} style={{ marginLeft: 16 }} href="/income">
            Add Income
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={8}>
          <Card variant="outlined" className="stats-card">
            <Statistic
              title="Total Balance"
              value={balance}
              precision={2}
              valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
              prefix="₹"
              suffix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card variant="outlined" className="stats-card">
            <Statistic
              title="Total Income"
              value={totalIncome}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TrendingUp size={20} />}
              suffix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card variant="outlined" className="stats-card">
            <Statistic
              title="Total Expenses"
              value={totalExpense}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<TrendingDown size={20} />}
              suffix="₹"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Expense Breakdown" variant="outlined">
            {expenseByCategory.length > 0 ? (
              <div className="chart-container" style={{ height: 300 }}>
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            ) : (
              <Empty description="No expense data to display" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Transactions" variant="outlined">
            {recentTransactions.length > 0 ? (
              <div>
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>{transaction.description}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#8c8c8c', fontSize: 12 }}>
                          <Calendar size={14} />
                          <span>{dayjs(transaction.date).format('MMM D, YYYY')}</span>
                          <Tag color={transaction.type === 'income' ? 'green' : 'red'}>
                            {transaction.category}
                          </Tag>
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 500,
                          color: transaction.type === 'income' ? '#52c41a' : '#f5222d',
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                    <Divider style={{ margin: '0' }} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No recent transactions" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
