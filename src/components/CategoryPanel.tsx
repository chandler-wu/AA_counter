import { useState } from 'react';
import { Button, ColorPicker, Input, List, Popconfirm, Space, Tag, Typography, App as AntApp } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { Project } from '../types';

interface Props {
  project: Project;
  onAdd: (name: string, color: string) => void;
  onRename: (categoryId: string, name: string, color: string) => void;
  onDelete: (categoryId: string) => void;
}

const DEFAULT_COLOR = '#1677ff';

function toHex(c: any, fallback = DEFAULT_COLOR): string {
  if (!c) return fallback;
  if (typeof c === 'string') return c;
  if (typeof c.toHexString === 'function') return c.toHexString();
  if (typeof c.toRgbString === 'function') return c.toRgbString();
  return fallback;
}

export function CategoryPanel({ project, onAdd, onRename, onDelete }: Props) {
  const { message } = AntApp.useApp();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(DEFAULT_COLOR);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState<string>(DEFAULT_COLOR);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      message.warning('请输入分类名');
      return;
    }
    onAdd(name, newColor);
    setNewName('');
    setNewColor(DEFAULT_COLOR);
  };

  const startEdit = (id: string, name: string, color: string) => {
    setEditingId(id);
    setEditingName(name);
    setEditingColor(color);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) {
      message.warning('名称不能为空');
      return;
    }
    onRename(editingId, name, editingColor);
    setEditingId(null);
  };

  return (
    <div>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="新分类名（如：购物）"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleAdd}
          style={{ width: 240 }}
          maxLength={12}
        />
        <ColorPicker
          value={newColor}
          onChange={(c) => setNewColor(toHex(c))}
          showText
          format="hex"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加分类
        </Button>
      </Space>

      {project.categories.length === 0 ? (
        <Typography.Text type="secondary">暂无分类，请先添加。</Typography.Text>
      ) : (
        <List
          bordered
          dataSource={project.categories}
          renderItem={(c) => {
            const isEditing = editingId === c.id;
            return (
              <List.Item
                actions={
                  isEditing
                    ? [
                        <Button
                          key="save"
                          type="link"
                          icon={<CheckOutlined />}
                          onClick={commitEdit}
                        />,
                        <Button
                          key="cancel"
                          type="link"
                          icon={<CloseOutlined />}
                          onClick={() => setEditingId(null)}
                        />,
                      ]
                    : [
                        <Button
                          key="edit"
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => startEdit(c.id, c.name, c.color)}
                        />,
                        <Popconfirm
                          key="del"
                          title="删除该分类？"
                          description={'历史记账中该分类仍会显示为「已删除」，但不会从历史中抹除。'}
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => onDelete(c.id)}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]
                }
              >
                <Space>
                  <Tag color={c.color} style={{ width: 60, textAlign: 'center' }}>
                    {c.name}
                  </Tag>
                  {isEditing ? (
                    <Space>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onPressEnter={commitEdit}
                        autoFocus
                        maxLength={12}
                        style={{ width: 160 }}
                      />
                      <ColorPicker
                        value={editingColor}
                        onChange={(c) => setEditingColor(toHex(c))}
                        showText
                        format="hex"
                      />
                    </Space>
                  ) : (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      #{c.color.replace('#', '').toUpperCase()}
                    </Typography.Text>
                  )}
                </Space>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}
