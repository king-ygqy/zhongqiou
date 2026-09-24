# 月下游园会

一个可以直接打开的中秋互动网页：30 秒接月饼小游戏，以及可以更换和复制的中秋祝福。

## 在本地打开

双击 `index.html` 即可。无需安装软件或运行构建命令。手机体验可以在上传到 GitHub Pages 后打开链接查看。

## 改成你的版本

- 修改页面文字：打开 `index.html`。
- 修改颜色、排版和装饰：打开 `style.css`，顶部的 `:root` 是主要配色。
- 修改祝福语：打开 `script.js`，编辑 `wishes` 列表。
- 修改游戏时长、分数和掉落频率：打开 `script.js`，编辑文件顶部的常量和 `spawnItem()`。

修改后保存，再刷新浏览器即可看到变化。

## 分享到 GitHub Pages

1. 登录 GitHub，创建一个 **Public** 仓库，例如 `moon-festival`。创建时先不用勾选添加 README，因为这里已经有一份。
2. 在空仓库中点击 **uploading an existing file**；如果显示文件列表，则选择 **Add file → Upload files**。上传此目录中的 `index.html`、`style.css`、`script.js`、`favicon.svg` 和 `README.md`，写一句提交说明，然后提交。
3. 进入仓库的 **Settings → Pages**，在 **Build and deployment** 下选择 **Deploy from a branch**，分支选 `main`、目录选 `/ (root)`，保存。
4. GitHub Pages 启用后，页面地址通常是 `https://你的用户名.github.io/moon-festival/`。稍等部署完成，再打开该地址。

之后可以直接在 GitHub 编辑文件，或者在本地修改后重新上传。这个网页没有服务器端代码，也没有外部依赖。

**顺手认识三个词：**仓库（repository）是放项目文件的地方；提交（commit）是一次带说明的版本记录；GitHub Pages 会把仓库里的静态网页发布成网址。

可以对照 [GitHub Pages 官方设置说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) 操作。
