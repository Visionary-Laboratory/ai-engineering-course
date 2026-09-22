# AI 工程学课程网站

上海创智学院 AI 工程学课程网站，提供课程概览、课程讲义目录及课件资源。

课程负责人：钟志航。前五讲由杨学老师主讲。

## 网站访问

课程网站地址：

<https://visionary-laboratory.github.io/ai-engineering-course/>

## 网站内容

| 页面 | 内容 |
| --- | --- |
| [课程概览](index.html) | 课程介绍、前五讲主题、考核方式与授课团队 |
| [课程讲义](lectures.html) | 前五讲讲义目录与上传状态 |
| [下载课件](downloads.html) | PDF 课件的预览、下载与上传状态 |

目前第一至第三讲的 PDF 课件已提供；第四、第五讲课件及前五讲讲义尚未上传。未上传的资源会显示相应状态，点击对应入口不会打开或下载文件。

## 本地预览

本站为静态网站，无需安装依赖。在仓库根目录运行：

```sh
python3 -m http.server 8080
```

在浏览器打开 <http://127.0.0.1:8080/>。结束预览时按 `Ctrl+C`。

## 内容维护

课程概览、讲义目录和课件目录分别位于 `index.html`、`lectures.html` 与 `downloads.html`；页面样式和交互逻辑分别位于 `styles.css` 与 `script.js`。

已上传的 PDF 位于 `pdf/`：

- `Fundamentals of Artificial Neural Networks.pdf`
- `CNNs and Image Recognition.pdf`
- `RNNs and LSTMs.pdf`

新增或更换课件时，请同步更新首页及下载页中的文件链接与上传状态。讲义发布后，请同步更新讲义目录及相应入口。
