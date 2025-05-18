import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusCircle,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface Income {
  _id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
}

const incomeSources = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Rental',
  'Dividends',
  'Interest',
  'Other'
];

const Income: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [searchText, setSearchText] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  // Helper to get auth headers with token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/income', {
        headers: getAuthHeaders()
      });
      setIncomes(response.data);
    } catch (error) {
      console.error('Error fetching income records:', error);
      message.error('Failed to fetch income records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const showAddModal = () => {
    form.resetFields();
    setEditingIncome(null);
    setModalVisible(true);
  };

  const showEditModal = (income: Income) => {
    setEditingIncome(income);
    form.setFieldsValue({
      ...income,
      date: dayjs(income.date)
    });
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingIncome) {
        await axios.put(
          `http://localhost:5000/api/income/${editingIncome._id}`,
          {
            ...values,
            date: values.date.format('YYYY-MM-DD'),
          },
          { headers: getAuthHeaders() }
        );
        message.success('Income record updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/income',
          {
            ...values,
            date: values.date.format('YYYY-MM-DD'),
          },
          { headers: getAuthHeaders() }
        );
        message.success('Income record added successfully');
      }
      setModalVisible(false);
      fetchIncomes();
    } catch (error) {
      console.error('Error saving income record:', error);
      message.error('Failed to save income record');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/income/${id}`, {
        headers: getAuthHeaders(),
      });
      message.success('Income record deleted successfully');
      fetchIncomes();
    } catch (error) {
      console.error('Error deleting income record:', error);
      message.error('Failed to delete income record');
    }
  };

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch =
      searchText === '' ||
      income.description.toLowerCase().includes(searchText.toLowerCase()) ||
      income.source.toLowerCase().includes(searchText.toLowerCase());

    const matchesSource = sourceFilter === null || income.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => dayjs(text).format('MMM D, YYYY'),
      sorter: (a: Income, b: Income) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (text: string) => (
        <span
          style={{
            padding: '2px 8px',
            background: '#f6ffed',
            borderRadius: '4px',
            color: '#52c41a',
            fontSize: '12px',
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount.toFixed(2)}`,
      align: 'right' as const,
      sorter: (a: Income, b: Income) => a.amount - b.amount,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Income) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button type="text" icon={<Edit size={16} />} onClick={() => showEditModal(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this income record?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<Trash2 size={16} />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Manage Income</Title>
        <Button type="primary" icon={<PlusCircle size={16} />} onClick={showAddModal}>
          Add Income
        </Button>
      </div>

      <Card variant="outlined">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search income records..."
            prefix={<Search size={16} />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filter by source"
            allowClear
            style={{ width: 200 }}
            onChange={(value: string | null) => setSourceFilter(value)}
            value={sourceFilter}
          >
            {incomeSources.map(source => (
              <Option key={source} value={source}>
                {source}
              </Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredIncomes}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          summary={pageData => {
            const total = pageData.reduce((acc, curr) => acc + curr.amount, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>₹{total.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      <Modal
        title={editingIncome ? 'Edit Income' : 'Add New Income'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ source: 'Other' }}>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="Where did this income come from?" />
          </Form.Item>

          <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true, message: 'Please enter an amount' }]}>
            <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} precision={2} placeholder="0.00" />
          </Form.Item>

          <Form.Item name="source" label="Source" rules={[{
            required: true, message: 'Please select a source'
          }]}>
            <Select>
              {incomeSources.map(source => (
                <Option key={source} value={source}>
                  {source}
                </Option>
              ))}
            </Select>
          </Form.Item>

        
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingIncome ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Income;