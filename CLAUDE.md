# UniPulse 项目概览

> 整理日期：2026-07-11  
> 用途：快速熟悉本仓库定位、结构与当前状态。

## 项目定位

**UniPulse** 是一个基于 **uni-app** 的多端客户端脚手架（仓库名 UniPulse，`package.json` 里仍叫 `app`）。技术栈：

- **Vue 3 + Vite 5 + TypeScript**
- **Pinia 3** + 持久化（`uni` 本地存储）
- **@qiun/ucharts** 图表
- 前后端分离，前端不嵌入业务密钥

目标平台：H5、微信/支付宝/抖音等小程序、App、鸿蒙等。

---

## 目录结构

```
src/
├── api/           # 接口层（目前只有 health）
├── config/        # 环境 / API 基址
├── pages/         # 三个演示页：首页、Pinia、Chart
├── components/    # uCharts 封装组件
├── stores/        # Pinia（counter 示例）
├── utils/         # request、platform
├── App.vue / main.ts / pages.json / manifest.json
```

路径别名：`@` → `src`。

---

## 核心能力

| 模块                 | 作用                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `utils/request.ts`   | 统一请求：Bearer Token、业务码 `0/200`、401 清 token、全局 loading 计数、`http.get/post/put/delete` |
| `config/env.ts`      | H5 开发用 `/api`；小程序/App 开发默认 `http://127.0.0.1:3000/api`；生产读 `VITE_API_BASE_URL`       |
| `utils/platform.ts`  | 条件编译识别端（H5 / 各小程序 / App）                                                               |
| `components/uCharts` | 微信用 Canvas 2D 高清，其它端固定 `pixelRatio: 1`；支持数据更新与 ECharts 风格 pie 数据转换         |

---

## 三个页面

1. **首页** `pages/index`：展示编译端、系统信息、API 地址；可跳转 Pinia / Chart；「探测后端」目前是 **mock 成 ok**（`fetchHealth` 被注释）
2. **Pinia** `pages/pinia`：计数器演示，带持久化
3. **Chart** `pages/chart`：折线 / 柱状 / 面积 / 饼图 / 环图 / 雷达图看板（本地假数据）

---

## 工程状态

- 分支：`dev`（与 `origin/dev` 同步）
- 远程：`https://github.com/alva-cui/UniPulse.git`
- 近期提交：初始化 → 图表 → 修复 canvas → 请求封装优化
- **仍偏脚手架阶段**：真实业务页、登录流、后端联调（健康检查）尚未接上
- H5 端口：`9527`，路由 base：`/h5/`（hash）
- `vite.config.ts` 里代理配置已注释，H5 的 `/api` 代理目前未启用
- 微信 `appid` 为空；生产 `VITE_API_BASE_URL` 也未配置

---

## 常用命令

```bash
pnpm install
pnpm run dev:h5          # H5 开发
pnpm run dev:mp-weixin   # 微信小程序 → dist/dev/mp-weixin
pnpm run type-check      # vue-tsc
```

| 端           | 命令                        | 产物 / 调试                           |
| ------------ | --------------------------- | ------------------------------------- |
| H5           | `pnpm run dev:h5`           | 浏览器（端口 9527）                   |
| 微信小程序   | `pnpm run dev:mp-weixin`    | `dist/dev/mp-weixin` → 微信开发者工具 |
| 支付宝小程序 | `pnpm run dev:mp-alipay`    | 支付宝开发者工具                      |
| 抖音小程序   | `pnpm run dev:mp-toutiao`   | 抖音开发者工具                        |
| App          | `pnpm run dev:app` / 云打包 | 建议配合 HBuilderX 或 uni-app 云打包  |

生产构建产物在 `dist/build/<平台>`。

---

## 环境变量

| 变量                | 说明                                          |
| ------------------- | --------------------------------------------- |
| `VITE_API_BASE_URL` | 后端 API 前缀（生产必填完整 HTTPS 域名）      |
| `VITE_PROXY_TARGET` | H5 开发代理目标，默认 `http://127.0.0.1:3000` |

---

## 设计约定

- 前端只通过 `src/utils/request.ts` 访问后端，不嵌入业务密钥。
- 各端差异用条件编译（`#ifdef MP-WEIXIN` 等）或 `src/utils/platform.ts`。
- 后端响应约定：`{ code: number, message?: string, data?: T }`，业务成功码为 `0` 或 `200`。
- 小程序真机调试不能使用 `127.0.0.1`，需改为电脑局域网 IP。

---

## 总体判断

这是一套**可多端发布的 uni-app 工程底座**，基础设施（请求、环境、状态、图表、平台判断）已搭好，业务功能还在起点。
