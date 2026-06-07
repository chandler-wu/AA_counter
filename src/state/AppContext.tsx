import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import type { AppState, Project } from '../types';
import { loadState, saveState } from '../storage';
import { emptyState } from '../seed';
import { reducer, type Action } from './reducer';
import { LoadingScreen } from '../components/LoadingScreen';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** 通过 id 查找项目；找不到返回 undefined。 */
  getProject: (id: string) => Project | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

/** 写入节流延迟（毫秒）。将短时间内多次 dispatch 合并为一次 IO。 */
const WRITE_THROTTLE_MS = 200;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => emptyState());
  const [loaded, setLoaded] = useState(false);
  /** 标记首次加载是否完成，避免把空状态写回 DB 覆盖已有数据。 */
  const hydratedRef = useRef(false);
  /** 写入防抖定时器。 */
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 启动时从 IndexedDB 加载，完成后再渲染业务页面
  useEffect(() => {
    let cancelled = false;
    loadState()
      .then((loadedState) => {
        if (cancelled) return;
        dispatch({ type: 'INIT', payload: loadedState });
        hydratedRef.current = true;
        setLoaded(true);
      })
      .catch((err) => {
        console.error('[AppProvider] 加载失败：', err);
        if (!cancelled) {
          // 即使失败也允许渲染，避免白屏
          hydratedRef.current = true;
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 监听 state 变化，节流写回 IndexedDB
  useEffect(() => {
    if (!hydratedRef.current) return; // 启动加载阶段不写
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(() => {
      saveState(state);
    }, WRITE_THROTTLE_MS);
    return () => {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    };
  }, [state]);

  // 卸载时若还有未写入的数据，立即落盘
  useEffect(() => {
    return () => {
      if (writeTimerRef.current) {
        clearTimeout(writeTimerRef.current);
        // 卸载时强制同步保存一次
        saveState(state).catch(() => {
          /* noop */
        });
      }
    };
  }, [state]);

  const value: AppContextValue = {
    state,
    dispatch,
    getProject: (id: string) => state.projects.find((p) => p.id === id),
  };

  if (!loaded) {
    return <LoadingScreen message="正在加载历史数据…" />;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** 在组件中使用全局 state。必须在 AppProvider 内部使用。 */
export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState 必须在 <AppProvider> 内部使用');
  }
  return ctx;
}

/** 兼容默认空状态，便于在未挂载 Provider 时类型安全 */
export { emptyState };
