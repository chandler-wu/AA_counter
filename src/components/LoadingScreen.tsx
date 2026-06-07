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
        // 透明背景，让背景的星空能透过来
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        gap: 16,
        zIndex: 9999,
      }}
    >
      <Spin size="large" />
      <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.75)' }}>{message}</Typography.Text>
    </div>
  );
}
