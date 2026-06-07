import { useState } from 'react';
import { Button, Input, List, Popconfirm, Space, Typography, App as AntApp } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { Project } from '../types';

interface Props {
  project: Project;
  onAdd: (name: string) => void;
  onRename: (memberId: string, name: string) => void;
  onDelete: (memberId: string) => void;
}

export function MemberPanel({ project, onAdd, onRename, onDelete }: Props) {
  const { message } = AntApp.useApp();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      message.warning('请输入成员名');
      return;
    }
    onAdd(name);
    setNewName('');
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) {
      message.warning('名称不能为空');
      return;
    }
    onRename(editingId, name);
    setEditingId(null);
  };

  return (
    <div>
      <Space.Compact style={{ width: '100%', maxWidth: 480, marginBottom: 16 }}>
        <Input
          placeholder="新成员名（如：张三）"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleAdd}
          maxLength={20}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加
        </Button>
      </Space.Compact>

      {project.members.length === 0 ? (
        <Typography.Text type="secondary">暂无成员，请先添加。</Typography.Text>
      ) : (
        <List
          bordered
          dataSource={project.members}
          renderItem={(m) => {
            const isEditing = editingId === m.id;
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
                          onClick={() => startEdit(m.id, m.name)}
                        />,
                        <Popconfirm
                          key="del"
                          title="删除该成员？"
                          description={'历史记录中该成员仍会显示为「已删除」，但不会从历史中抹除。'}
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => onDelete(m.id)}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]
                }
              >
                {isEditing ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onPressEnter={commitEdit}
                    autoFocus
                    maxLength={20}
                  />
                ) : (
                  <span>{m.name}</span>
                )}
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}
