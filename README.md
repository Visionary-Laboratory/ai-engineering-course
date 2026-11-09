# AI 工程学课程网站

上海创智学院 AI 工程学课程网站，提供连续阅读、演示模式、分层目录和课程资源。

访问课程：<https://visionary-laboratory.github.io/ai-engineering-course/>

## 课程内容

- **模型原理**：人工神经网络基础、CNN 与图像识别、RNN 与 LSTM、Transformer 模型、自监督学习、生成模型。
- **并行计算**：01 理解并行计算（并行基础与性能模型、并行硬件与执行模型、并行程序设计思想、缓存一致性与同步实现）；02 走进 CUDA 编程（CUDA 编程入门、CUDA 内存层次、CUDA 基础算子模式）。

共 13 讲。模型原理和并行计算共用 AI 工程学课程框架；章节使用 `01`、`02` 编号，小节使用罗马数字。生成模型包含 Part I 与 Part II，提供 43 个阅读主题和 114 个演示步骤。

## 源码与本地开发

`site/` 保存当前网站源码、课程内容、教学图解和嵌入课件。需要 Node.js 22.13 或以上版本及 pnpm：

```sh
cd site
pnpm install --frozen-lockfile
pnpm dev
```

打开 <http://127.0.0.1:3001/>。`pnpm check` 检查类型，`pnpm build` 进行常规生产编译。

## 发布

仓库根目录保留可供 GitHub Pages 直接使用的静态页面。更新源码后，从仓库根目录执行：

```sh
cd site
pnpm build:pages
cd ..
rsync -a --exclude=.vite --exclude=.assetsignore --exclude=_headers site/dist/client/ ./
```

确认页面后提交源码与静态产物，推送至 `main`。GitHub Pages 沿用 `main` 分支根目录发布，网址保持不变。静态产物包含 `.nojekyll`，无需服务器或数据库。

源码保留教学素材；本地缓存、依赖目录和原页截图归档不上传。原版课件生成脚本和 PDF 仍保留在仓库中，历史维护说明见 [LEGACY_MAINTENANCE.md](LEGACY_MAINTENANCE.md)。
