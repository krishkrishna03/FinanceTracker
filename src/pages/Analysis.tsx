import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Select,
  Spin,
  Empty,
  Alert,
  DatePicker,
  Statistic,
  Tabs
} from 'antd';
import {
  TrendingUp
} from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  
  Filler
} from 'chart.js';
import axios from 'axios';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CategoryData {
  category: string;
  total: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface AnalysisData {
  expenseByCategory: CategoryData[];
  incomeBySource: CategoryData[];
  monthlyData: MonthlyData[];
  savingsRate: number;
}

const timeRanges = [
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

const Analysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('3m');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      let endpoint = `http://localhost:5000/api/analysis?timeRange=${timeRange}`;

      if (timeRange === 'custom' && dateRange) {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        endpoint = `http://localhost:5000/api/analysis?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setAnalysisData(response.data);
    } catch (err: any) {
      console.error('Error fetching analysis data:', err);
      setError('Failed to load analysis data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeRange !== 'custom' || (timeRange === 'custom' && dateRange)) {
      fetchAnalysisData();
    }
  }, [timeRange, dateRange]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setShowCustomRange(value === 'custom');
    if (value !== 'custom') {
      setDateRange(null);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  const monthlyChart = analysisData ? {
    labels: analysisData.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: analysisData.monthlyData.map(d => d.income),
        backgroundColor: 'rgba(82, 196, 26, 0.2)',
        borderColor: '#52c41a',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: analysisData.monthlyData.map(d => d.expense),
        backgroundColor: 'rgba(245, 34, 45, 0.2)',
        borderColor: '#f5222d',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ],
  } : null;

  const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (tickValue: string | number) => {
          return typeof tickValue === 'number' ? tickValue.toString() : tickValue;
        }
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

  const expenseCategoryChart = analysisData && analysisData.expenseByCategory.length > 0 ? {
    labels: analysisData.expenseByCategory.map(d => d.category),
    datasets: [
      {
        data: analysisData.expenseByCategory.map(d => d.total),
        backgroundColor: [
          '#1890ff',
          '#f5222d',
          '#52c41a',
          '#faad14',
          '#722ed1',
          '#13c2c2',
          '#fa8c16',
          '#eb2f96',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const incomeCategoryChart = analysisData && analysisData.incomeBySource.length > 0 ? {
    labels: analysisData.incomeBySource.map(d => d.category),
    datasets: [
      {
        data: analysisData.incomeBySource.map(d => d.total),
        backgroundColor: [
          '#52c41a',
          '#1890ff',
          '#faad14',
          '#722ed1',
          '#13c2c2',
          '#fa8c16',
          '#eb2f96',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const totalIncome = analysisData?.monthlyData.reduce((sum, month) => sum + month.income, 0) || 0;
  const totalExpenses = analysisData?.monthlyData.reduce((sum, month) => sum + month.expense, 0) || 0;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = analysisData?.savingsRate || 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin tip="Loading...">
    {/* You can put a placeholder or empty div if nothing else */}
    <div style={{ height: 200 }} />
  </Spin>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  const tabItems = [
    {
      key: '1',
      label: 'Income vs. Expenses',
      children: (
        <div style={{ height: 400 }}>
          {monthlyChart ? (
            <Line data={monthlyChart} options={lineChartOptions} />
          ) : (
            <Empty description="No monthly data available" />
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Expense Breakdown',
      children: (
        <div style={{ height: 400 }}>
          {expenseCategoryChart ? (
            <Pie data={expenseCategoryChart} options={pieChartOptions} />
          ) : (
            <Empty description="No expense category data available" />
          )}
        </div>
      ),
    },
    {
      key: '3',
      label: 'Income Sources',
      children: (
        <div style={{ height: 400 }}>
          {incomeCategoryChart ? (
          <Pie data={incomeCategoryChart} options={pieChartOptions} />
          ) : (
          <Empty description="No income source data available" />
)}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Financial Analysis</Title>


      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <Select value={timeRange} onChange={handleTimeRangeChange} style={{ width: 160 }}>
            {timeRanges.map(tr => (
              <Option key={tr.value} value={tr.value}>
                {tr.label}
              </Option>
            ))}
          </Select>
        </Col>
        {showCustomRange && (
          <Col>
            <RangePicker
              allowClear={false}
              value={dateRange}
              onChange={handleDateRangeChange}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Col>
        )}
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Income"
              value={totalIncome}
              precision={2}
              prefix={<TrendingUp style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={totalExpenses}
              precision={2}
              prefix={<TrendingUp style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Net Savings"
              value={netSavings}
              precision={2}
              prefix={<TrendingUp />}
              valueStyle={{ color: netSavings >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Statistic
          title="Savings Rate"
          value={savingsRate * 100}
          precision={2}
          suffix="%"
        />
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>
    </div>
  );
};

export default Analysis;