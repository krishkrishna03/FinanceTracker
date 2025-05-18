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
  Tooltip,
} from 'antd';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Other',
];

// Axios instance with Authorization header
const token = localStorage.getItem('token');
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  },
});

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get<Expense[]>('/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      message.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Show add modal
  const showAddModal = () => {
    setEditingExpense(null);
    setModalVisible(true);
  };

  // Show edit modal
  const showEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setModalVisible(true);
  };

  // Set form values when modal opens and editingExpense changes
  useEffect(() => {
    if (modalVisible) {
      if (editingExpense) {
        form.setFieldsValue({
          ...editingExpense,
          date: dayjs(editingExpense.date),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ category: 'Other' });
      }
    } else {
      // Modal closed, reset everything
      form.resetFields();
      setEditingExpense(null);
    }
  }, [modalVisible, editingExpense, form]);

  const handleCancel = () => {
    setModalVisible(false);
  };

  // Handle form submit for add or update
  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
    };

    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, payload);
        message.success('Expense updated successfully');
      } else {
        await api.post('/expenses', payload);
        message.success('Expense added successfully');
      }
      setModalVisible(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      message.error('Failed to save expense');
    }
  };

  // Handle delete expense
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      message.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      message.error('Failed to delete expense');
    }
  };

  // Filter expenses by search text and category
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      !searchText ||
      expense.description.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = !categoryFilter || expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => dayjs(text).format('MMM D, YYYY'),
      sorter: (a: Expense, b: Expense) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <span
          style={{
            padding: '2px 8px',
            background: '#f5f5f5',
            borderRadius: '4px',
            fontSize: 12,
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Amount ₹',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => `₹${amount.toFixed(2)}`,
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button type="text" icon={<Edit size={16} />} onClick={() => showEditModal(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this expense?"
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
    <div className="animate-fade-in" style={{ padding: 20 }}>
      <div
        className="dashboard-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}
      >
        <Title level={2}>Manage Expenses</Title>
        <Button type="primary" icon={<PlusCircle size={16} />} onClick={showAddModal}>
          Add Expense
        </Button>
      </div>

      <Card>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Input
            placeholder="Search expenses..."
            prefix={<Search size={16} />}
            style={{ width: 250, minWidth: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 200, minWidth: 160 }}
            onChange={(value) => setCategoryFilter(value)}
            value={categoryFilter}
          >
            {expenseCategories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredExpenses}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          summary={(pageData) => {
            const total = pageData.reduce((acc, curr) => acc + curr.amount, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>₹{total.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      <Modal
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ category: 'Other' }}
          preserve={false}
        >
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="category"

            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              {expenseCategories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount (₹)"
            rules={[{ required: true, message: 'Please enter an amount' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter amount"
              formatter={(value) => `₹ ${value}`}
              parser={(value) => (value ? value.replace(/₹\s?|(,*)/g, '') : '')}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingExpense ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Expenses;