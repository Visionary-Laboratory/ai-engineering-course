# AI 工程学课程首页（空壳）

这是独立于 `AI工程学/` 的静态课程首页，不会修改原课程源码。

## 本地预览

在本目录启动任意静态文件服务器，例如：

```sh
python3 -m http.server 8080
```

然后打开 <http://127.0.0.1:8080/>。

也可以直接打开 `index.html` 查看页面；使用静态服务器时，PDF 的预览与下载兼容性更好。

## 上传课件

将 PDF 放进 `pdf/`。当前前三讲使用实际文件名：

```text
Fundamentals of Artificial Neural Networks.pdf
CNNs and Image Recognition.pdf
RNNs and LSTMs.pdf
```

第四、第五讲尚未上传时，对应按钮只会显示提示，不会打开或下载文件。后续可使用以下文件名：

```text
04-transformers.pdf
05-self-supervised.pdf
```

首页每一讲下方和 `downloads.html` 的预览 / 下载按钮会直接使用这些文件。课程讲义入口目前保留为可点击的占位入口，点击会提示“本讲课程讲义未上传”。
