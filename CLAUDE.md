# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个微信 Markdown 编辑器项目，采用 pnpm monorepo 架构，主要包含：

- Web 应用：基于 Vue 3 + Vite 的在线编辑器
- VSCode 扩展：编辑器的 VSCode 插件版本
- CLI 工具：命令行版本的编辑器
- 浏览器扩展：Chrome/Firefox 扩展

## 开发环境设置

### Node.js 版本

项目使用 `.nvmrc` 文件锁定 Node.js 版本，确保使用正确的版本：

```bash
nvm i && nvm use
```

### 包管理器

项目使用 pnpm 作为包管理器，支持 workspace 管理：

```bash
pnpm i
```

## 常用开发命令

### 启动开发环境

```bash
# 启动 Web 应用开发服务器
pnpm start
# 或者
pnpm web dev

# 启动 VSCode 扩展开发
pnpm vscode
```

### 构建项目

```bash
# 构建 Web 应用
pnpm web build

# 构建并部署到根目录（Netlify）
pnpm web build:h5-netlify

# 构建 CLI 工具
pnpm build:cli

# 构建浏览器扩展
pnpm web ext:zip
pnpm web firefox:zip
```

### 代码检查和格式化

```bash
# ESLint 检查和修复
pnpm lint

# TypeScript 类型检查
pnpm type-check
```

### 测试和预览

```bash
# 本地预览构建结果
pnpm web preview

# Cloudflare Pages 预览
pnpm web preview:pages
```

## 项目架构

### Monorepo 结构

```
├── apps/
│   ├── web/          # 主要的 Web 应用
│   └── vscode/       # VSCode 扩展
├── packages/
│   ├── core/         # 核心逻辑包
│   ├── shared/       # 共享工具包
│   ├── config/       # 配置包
│   ├── md-cli/       # CLI 工具包
│   └── example/      # 示例代码
├── docs/             # 文档
├── scripts/          # 构建脚本
└── public/           # 静态资源
```

### 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **样式**: TailwindCSS
- **状态管理**: Pinia
- **Markdown 解析**: marked
- **代码高亮**: highlight.js
- **UI 组件**: Radix Vue + Reka UI
- **类型检查**: TypeScript + vue-tsc

### 核心功能模块

- Markdown 编译和渲染
- 主题自定义系统
- 多图床上传支持
- AI 助手集成
- 内容管理和草稿保存
- 浏览器扩展支持

## 开发指南

### Workspace 包管理

使用 pnpm workspace 命令操作特定包：

```bash
# 在 web 包中执行命令
pnpm web <command>

# 在 vscode 包中执行命令
pnpm vscode <command>
```

### 代码风格

项目使用 @antfu/eslint-config 配置，主要规则：

- 使用反引号字符串
- 不使用分号
- 允许 console 和 debugger（开发时）

### 扩展开发

- Chrome 扩展：使用 WXT 框架
- Firefox 扩展：支持单独构建
- VSCode 扩展：独立的 TypeScript 项目

### 部署相关

- 默认部署路径：`/md`
- Netlify 部署：根目录
- CLI 工具：发布到 npm 为 @doocs/md-cli
- Docker 镜像：doocs/md

## 重要配置文件

- `pnpm-workspace.yaml`: Workspace 配置
- `eslint.config.mjs`: ESLint 配置
- `tsconfig.json`: TypeScript 基础配置
- `.nvmrc`: Node.js 版本锁定
- `apps/web/package.json`: Web 应用配置
