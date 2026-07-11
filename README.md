# 多端应用（uni-app）

Vue3 + Vite + TypeScript 的 **uni-app** 客户端，前后端分离。一套代码可发布：

| 端           | 命令                        | 产物 / 调试                           |
| ------------ | --------------------------- | ------------------------------------- |
| H5           | `npm run dev:h5`            | 浏览器                                |
| 微信小程序   | `npm run dev:mp-weixin`     | `dist/dev/mp-weixin` → 微信开发者工具 |
| 支付宝小程序 | `npm run dev:mp-alipay`     | 支付宝开发者工具                      |
| 抖音小程序   | `npm run dev:mp-toutiao`    | 抖音开发者工具                        |
| 鸿蒙元服务等 | `npm run dev:mp-harmony` 等 | 见 `package.json` scripts             |
| App          | `npm run dev:app` / 云打包  | 建议配合 HBuilderX 或 uni-app 云打包  |

## 目录结构

```
app/
├── src/
│   ├── api/           # 接口模块（只依赖 request，不碰 UI）
│   ├── config/        # 环境 / API 基址
│   ├── pages/         # 页面
│   ├── stores/        # pinia
│   ├── utils/         # request、平台判断
│   ├── static/
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json
│   └── manifest.json  # 各端 appid、权限
├── .env.development
├── .env.production
└── vite.config.ts
```

## 快速开始

```bash
# 安装依赖（推荐 npm / pnpm；uni-app 生态对 npm 兼容最好）
pnpm install

# 终端 ：H5
pnpm run dev:h5
```

浏览器打开控制台提示的地址，点「探测后端」应显示 `ok`。

### 微信小程序

1. `npm run dev:mp-weixin`
2. 用微信开发者工具导入目录：`dist/dev/mp-weixin`
3. 在 `src/manifest.json` → `mp-weixin.appid` 填真实 appid
4. 小程序后台配置 request 合法域名；开发阶段可在开发者工具关闭域名校验
5. 真机调试时在 `.env.development` 把 `VITE_APP_API_BASE_URL` 改成电脑局域网 IP（不能用 `localhost`）

### App

- 本地自定义基座 / 云打包：HBuilderX 打开本项目，或使用 DCloud 云打包
- 也可先 `npm run build:app` 产出 App 资源，再导入原生工程

## 环境变量

| 变量                    | 说明                                             |
| ----------------------- | ------------------------------------------------ |
| `VITE_APP_TITLE`        | 应用标题                                         |
| `VITE_APP_API_BASE_URL` | 真实后端（小程序/App 直连；H5 开发代理目标）     |
| `VITE_APP_BASE_API`     | H5 请求前缀（开发 `/dev-api`，生产 `/prod-api`） |
| `VITE_APP_PORT`         | H5 开发端口，默认 `9527`                         |
| `VITE_APP_CONTEXT_PATH` | H5 部署子路径，默认 `/h5/`                       |
| `VITE_APP_ENV`          | 业务环境标识                                     |

- **H5**：请求走 `BASE_API`，开发时 Vite 代理到 `API_BASE_URL`（并去掉前缀）
- **小程序 / App**：请求直接打到 `API_BASE_URL`
- H5 开发地址一般为 `http://127.0.0.1:9527/h5/`

## 生产构建

```bash
npm run build:h5
npm run build:mp-weixin
npm run build:mp-alipay
npm run build:mp-toutiao
npm run build:app
```

产物在 `dist/build/<平台>`。

## 说明

- 前端只通过 `src/utils/request.ts` 访问后端，不嵌入业务密钥。
- 各端差异用条件编译（`#ifdef MP-WEIXIN` 等）或 `src/utils/platform.ts`。
