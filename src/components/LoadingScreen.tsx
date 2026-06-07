import { Spin, Typography } from 'antd';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = '加载中…' }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        gap: 16,
        zIndex: 9999,
      }}
    >
      <Spin size="large" />
      <Typography.Text type="secondary">{message}</Typography.Text>
    </div>
  );
}
