# AA 记账 - 团队记账工具

> 一个纯前端的团队记账 SPA，数据保存在浏览器 LocalStorage。

## 技术栈

- React 18 + Vite 5 + TypeScript
- Ant Design 5（中文 UI）
- React Router 6
- LocalStorage 持久化
- 包管理：npm

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run build` | 生产构建（输出到 dist/） |
| `npm run preview` | 本地预览构建产物 |

## 功能一览

- **多项目并行**：每个项目（如"北京旅行"）独立管理成员/分类/记账
- **成员管理**：增删改，重命名（删除成员不会从历史中抹除，会标记为"已删除"）
- **分类管理**：自定义名称 + 颜色（提供 4 个默认分类）
- **记账管理**：金额、日期、分类、付款人、参与人（可多选）、备注
- **消费统计**：
  - 总额 / 笔数 / 分类数 / 人均消费
  - 各分类消费（金额、笔数、占比）
  - 个人消费排行榜（按参与金额降序）

## 数据

- 全部数据保存在 `localStorage.aa_counter_v1`
- 关闭浏览器 / 重启电脑数据不丢失
- 清空浏览器数据会丢失全部记账（开发中可执行 `localStorage.clear()`）
- 单设备方案，不支持多端同步

## 目录结构

```
src/
├── main.tsx            # 入口
├── App.tsx             # 路由 + 全局 Provider
├── types.ts            # 类型定义
├── storage.ts          # LocalStorage 读写
├── seed.ts             # 默认分类/成员
├── utils/              # 工具：id / money / stats
├── state/              # 状态：reducer + Context
├── pages/              # 页面：列表/主页/记账/统计
└── components/         # 共享组件
```

## 相关文档

- 需求文档：[项目需求.md](项目需求.md)
- 开发计划：[项目开发计划.md](项目开发计划.md)
