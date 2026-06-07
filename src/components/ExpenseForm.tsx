import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  DatePicker,
  Button,
  Space,
  App as AntApp,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { Expense, Project } from '../types';
import { toMoney } from '../utils/money';

interface Props {
  open: boolean;
  project: Project;
  initial?: Expense | null;
  onCancel: () => void;
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
}

interface FormShape {
  amount: number;
  categoryId: string;
  payerId: string;
  participantIds: string[];
  description?: string;
  date: Dayjs;
}

export function ExpenseForm({ open, project, initial, onCancel, onSubmit }: Props) {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<FormShape>();
  const isEdit = !!initial;
  const [participants, setParticipants] = useState<string[]>([]);

  const memberOptions = useMemo(
    () => project.members.map((m) => ({ label: m.name, value: m.id })),
    [project.members],
  );
  const categoryOptions = useMemo(
    () =>
      project.categories.map((c) => ({
        label: c.name,
        value: c.id,
        // 颜色信息以额外数据形式返回
      })),
    [project.categories],
  );

  useEffect(() => {
    if (open) {
      if (initial) {
        form.setFieldsValue({
          amount: initial.amount,
          categoryId: initial.categoryId,
          payerId: initial.payerId,
          participantIds: initial.participantIds,
          description: initial.description,
          date: dayjs(initial.date),
        });
        setParticipants(initial.participantIds);
      } else {
        const today = dayjs();
        const defaultPayer = project.members[0]?.id;
        const defaultCategory = project.categories[0]?.id;
        const allIds = project.members.map((m) => m.id);
        form.setFieldsValue({
          amount: undefined as unknown as number,
          categoryId: defaultCategory,
          payerId: defaultPayer,
          participantIds: allIds,
          description: '',
          date: today,
        });
        setParticipants(allIds);
      }
    }
  }, [open, initial, project, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.participantIds || values.participantIds.length === 0) {
        message.warning('请至少选择一位参与人');
        return;
      }
      const amount = toMoney(values.amount);
      if (amount <= 0) {
        message.warning('金额必须大于 0');
        return;
      }
      onSubmit({
        amount,
        categoryId: values.categoryId,
        payerId: values.payerId,
        participantIds: values.participantIds,
        description: (values.description ?? '').trim(),
        date: values.date.format('YYYY-MM-DD'),
      });
    } catch {
      // 校验失败，antd 会自动展示
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑记账' : '新增记账'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label="金额"
          name="amount"
          rules={[{ required: true, message: '请输入金额' }]}
        >
          <InputNumber
            prefix="¥"
            min={0.01}
            step={1}
            precision={2}
            style={{ width: '100%' }}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item
          label="日期"
          name="date"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="分类"
          name="categoryId"
          rules={[{ required: true, message: '请选择分类' }]}
        >
          <Select
            options={categoryOptions}
            placeholder="选择分类"
            optionRender={(option) => {
              const cat = project.categories.find((c) => c.id === option.value);
              return (
                <Space>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      background: cat?.color ?? '#999',
                    }}
                  />
                  {option.label}
                </Space>
              );
            }}
          />
        </Form.Item>

        <Form.Item
          label="付款人"
          name="payerId"
          rules={[{ required: true, message: '请选择付款人' }]}
        >
          <Select options={memberOptions} placeholder="谁付的钱" />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <span>参与人</span>
              <Space.Compact size="small">
                <Button
                  size="small"
                  onClick={() => {
                    const all = project.members.map((m) => m.id);
                    form.setFieldValue('participantIds', all);
                    setParticipants(all);
                  }}
                >
                  全选
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    form.setFieldValue('participantIds', []);
                    setParticipants([]);
                  }}
                >
                  清空
                </Button>
              </Space.Compact>
            </Space>
          }
          name="participantIds"
          rules={[{ required: true, message: '请选择参与人' }]}
        >
          <Select
            mode="multiple"
            options={memberOptions}
            placeholder="哪些人参与了这次花销"
            value={participants}
            onChange={(v) => setParticipants(v)}
            maxTagCount="responsive"
          />
        </Form.Item>

        <Form.Item label="备注" name="description">
          <Input.TextArea
            rows={2}
            placeholder="可选：比如「出租车到机场」"
            maxLength={100}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
