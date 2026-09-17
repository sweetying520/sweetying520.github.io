---
title: Web 系列（二）：Web 开发工具介绍
date: 2022-10-24 15:53:11
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281628218.jpeg
tags:
- 原创
- Web
categories:
- Web
- Web 快速入门
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281628218.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们介绍了 HTML 的基础语法，常用标签和属性，最后使用学习到的标签做了一些综合案例，还没有看过上一篇文章的朋友建议先去阅读[Web 系列（一）：HTML 常用标签和属性](https://juejin.cn/post/7157713551786934302) 。

接下来我们介绍 Web 中的开发工具

工欲善其事，必先利其器，一个好的开发工具能让我们事半功倍，提升开发效率，下面介绍的这些工具简直不要太好用，让你有一种能瞬间起飞的感觉😄

## 一、Web 编辑器：VS Code

### 1.1、VS Code 介绍

1、VS Code 全称： Visual Studio Code ，是微软一款开源的、免费的、跨平台的、高性能的、轻量级的代码编辑器，功能非常的强大，是开发 Web 的神兵利器。另外我们还可以使用它进行 Markdown 创作，文本编辑等等

2、VS Code 的定位是**编辑器**，注意是编辑器，它不是 IDE（Integrated Development Environment，集成开发环境） ，IDE 相对来说是比较重量级的，比如：AndroidStudio，Webstorm（这两款都是基于 IntelliJ IDEA 定制的），性能不好的电脑使用起来会很卡，但是 VS Code 就不会，因为它非常的轻巧，而且它还能给你带来拥有 IDE 的开发体验，爱了

3、VS Code 拥有功能强大，生态完善的插件系统，一些 IDE 上没有的插件它有，我觉得这一点是它能够爆火的重要原因

4、VS Code 自带 emmet：支持代码自动补全，快速地生成简单的语法结构。要知道，这个功能在 Sublime Text中，得先安装插件才行

5、VS Code 自带 HTML，CSS，JavaScript，TypeScript 和 Node.js 的语法支持。也就是说，你在书写这些时，是自带智能提示的。当然，其他的语言，你可以安装相应的**扩展包**插件，也会有智能提示

6、VS code 跨平台支持，你可以在 MacOS，Windows 和 Linux 等多个平台使用它

这么好用的一款编辑器，让我们赶紧来使用它吧

### 1.2、VS Code 安装

下载链接：https://code.visualstudio.com/

打开下载链接如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281628334.png" alt="image-20221024192258131.png" width="100%" />

VS Code 的安装很简单，下载压缩包后，解压你会发现就 VS Code 这一个文件，打开就能用，哈哈，相比 IDE 的安装过程真的是异常简单。前面也说了 VS code  自带 HTML，CSS，JavaScript，TypeScript 和 Node.js 的语法支持，因此你现在可以直接进行 Web 开发了。

### 1.3、VS Code 常用快捷键

对快捷键的使用在一定程度上能看出你是否熟悉这款编辑器或 IDE。下面是我在学习实践过程中觉得非常实用的一些快捷键

| Mac 快捷键                   | 作用                                   |
| ---------------------------- | -------------------------------------- |
| Cmd + Shift + P              | 显示命令面板                           |
| Cmd + B                      | 显示/隐藏侧边栏                        |
| Cmd + J                      | 显示/隐藏控制台                        |
| Cmd + \                      | 新开一个编辑器                         |
| Cmd + 1、2                   | 切换 1、2 编辑器                       |
| Cmd + N                      | 新建一个文件                           |
| Cmd + Shift + N              | 新开一个 VS Code                       |
| Cmd + W                      | 关闭当前文件                           |
| Cmd + +                      | 放大工作区（包括代码字体，左侧导航栏） |
| Cmd + -                      | 缩小工作区（包括代码字体，左侧导航栏） |
| Cmd + Option + 左右方向键    | 在多个文件之间切换                     |
| Option +  左右方向键         | 在单词之间移动光标                     |
| Cmd +  左右方向键            | 在整行之间移动光标                     |
| Option + Shift +  左右方向键 | 在单词之间移动光标并复制               |
| Cmd + Shift +  左右方向键    | 在整行之间移动光标并复制               |
| Cmd + Enter                  | 在当前行下方新增一行                   |
| Cmd + Shift + Enter          | 在当前行上方新增一行                   |
| Option + 上/下方向键         | 将代码向上/下移动                      |
| Option + Shift + 上/下方向键 | 将代码向上/下复制一行                  |
| Cmd + Shift + Backspace      | 删除光标之前的整行内容                 |
| Cmd + /                      | 添加注释                               |
| Option + Shift + F           | 代码格式化                             |
| Cmd + Shift + F              | 全局搜索代码                           |
| Cmd + F                      | 当前文件内搜索                         |

另外一个好用的点：将光标点击到某一行的任意位置，默认就是选中整行，此时可以直接复制或剪切

### 1.4、VS Code 常见快捷操作

#### 1.4.1、输入 `!` 或 `html:5` 生成 HTML 骨架

如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281628062.gif" alt="ezgif.com-gif-maker.gif" width="100%" />

#### 1.4.2、使用 code 命令启动 VS Code

1、使用快捷键 `Cmd + Shift + P`打开命令面板，输入 code ，如下图：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281628816.png" alt="image-20221025170748336.png" width="50%" />

选择第一项：Install 'code' command in PATH ，这样 code 命令就被添加到了系统环境变量，接下来就可以在任意位置使用 code 命令了

2、code 命令使用

> 1、在 Terminal 输入 `code` 即可启动 VS Code
>
> 2、在 Terminal 输入 `code pathName/fileName`即可通过 VS Code 打开指定目录/指定文件

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281628602.gif" alt="ezgif.com-gif-maker (1).gif" width="100%" />

### 1.5、VS Code 常见配置

#### 1.5.1、git 版本管理

VS Code 自带了 Git 版本管理，如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281628278.png" alt="image-20221025191932575.png" width="50%" />

此时在配合 `Gitlens`插件，直接起飞

#### 1.5.2、Emmet in VS Code

Emmet 能辅助我们快速的去生成一些语法，例如我们要实现如下的有序列表：

```html
<ol>
  <li>111</li>
  <li>111</li>
  <li>111</li>
  <li>111</li>
  <li>111</li>
  <li>111</li>
</ol>
```

我们只需要在 VS Code 中输入 `ol>li{111}*6`即可自动生成

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281629983.gif" alt="ezgif.com-gif-maker (2).gif" width="100%" />

### 1.6、VS Code 常用插件

VS Code 的插件管理如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281629251.png" alt="image-20221025194519856.png" width="50%" />

在应用商店中搜索你要安装的插件安装即可，下面推荐我觉得非常好用的插件给你们

#### 1.6.1、Chinese (Simplified) (简体中文) Language Pack for Visual Studio Code

让你的 VS Code 显示为简体中文语言

#### 1.6.2、Live Server 

在本地启动一个服务器，代码写完后可实现热更新，实时的在网页中看到运行效果，真的很好用

使用方式：将写好的代码，右键选择 Open with Live Server （当然你也可以使用快捷键）打开即可，后续更新代码保存即可预览

效果展示：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281629125.gif" alt="ezgif.com-gif-maker (3).gif" width="100%" />

#### 1.6.3、Auto Rename Tag

自动对标签重命名

效果展示：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281629779.gif" alt="ezgif.com-gif-maker (4).gif" width="100%" />

#### 1.6.4、htmltagwrap

快速的对一段内容进行标签包裹

使用方式：选择一段内容，使用快捷键 `Option + W` ，即可实现标签包裹

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281629905.gif" alt="ezgif.com-gif-maker (5).gif" width="100%" />

#### 1.6.5、Gitlens

它是 VS Code 中非常好用的 Git 管理插件，码农必备

GitLens 在 Git 管理上有很多强大的功能，比如：

> 1、将光标放置在代码的当前行，可以看到这样代码的提交者是谁，以及提交时间。这一点，是 GitLens 最便捷的功能。
>
> 2、查看某个 commit 的代码改动记录
>
> 3、查看不同的分支
>
> 4、可以将两个 commit 进行代码对比
>
> 5、甚至可以将两个 branch 分支进行整体的代码对比。这一点，简直是 GitLens 最强大的功能。当我们在不同分支 review 代码的时候，就可以用到这一招

打开 VS Code 的 Git 管理，未安装 Gitlens 时是这样的：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630717.png" alt="image-20221025202301457.png" width="50%" />

安装后是这样的：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630145.png" alt="image-20221025202352760.png" width="50%" />

可以看到下面多了很多选项，这些都是 Gitlens 的功能

#### 1.6.6、Image Preview

图片预览，当鼠标移动到图片 url 上的时候，会自动显示图片的预览和图片尺寸

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630726.gif" alt="ezgif.com-gif-maker (6).gif" width="100%" />

ok，好用的插件就推荐这么多

### 1.7、VS Code 配置云同步

1、使用快捷键 `Cmd + Shift + P`打开命令面板，输入设置：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630182.png" alt="image-20221025203732645.png" width="50%" />

选择第一项：设置同步: 打开...

2、选择需要同步的配置

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630323.png" alt="image-20221025203828081.png" width="50%" />

3、通过 Microsoft 或者 GitHub 账号登录。 上图中，点击`登录并打开`，会弹出如下界面：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630523.png" alt="image-20221025203901427.png" width="50%" />

4、登录成功并授权，如果收到如下提示，则证明你已经开启了云同步

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630694.png" alt="image-20221025204213860.png" width="50%" />

5、此时你换另外一台电脑，登录相同的账号，即可完成 VS Code 配置云同步

## 二、Web 浏览器：Chrome

我认为 Chrome 是世界上最好的浏览器，没有之一，使用的人非常多，尤其是程序员。简单的介绍一下它的优势：

1、界面简洁，清爽干净，没有广告，加载速度快

2、插件资源丰富，生态完善

3、全面支持 HTML5 以及兼容问题。前端程序员之所以那么喜欢 chrome，就是因为它兼容起来最简单，而且 HTML5 和 CSS3 可以给用户带来更高层次的视觉和体验

4、开发者工具好用，方便调试

### 2.1、Chrome 快捷键

掌握好 Chrome 快捷键，让你对 Chrome 爱不释手

| Mac Chrome 快捷键            | 作用                               |
| ---------------------------- | ---------------------------------- |
| Cmd + N                      | 打开新窗口                         |
| Cmd + Shift + N              | 在无痕模式下打开新窗口             |
| Cmd + T                      | 打开新标签页，并跳转到新标签页     |
| Cmd + Option + 左右箭头      | 切换左右标签页                     |
| Cmd + 1～8                   | 切换 1～8 标签页                   |
| Cmd + 9                      | 切换到最后一个标签页               |
| Cmd + W                      | 关闭当前标签页                     |
| Cmd + M                      | 最小化窗口                         |
| Cmd + H                      | 隐藏 Chrome 浏览器                 |
| Cmd + Q                      | 退出 Chrome 浏览器                 |
| Cmd + Shift + B              | 显示或隐藏书签栏                   |
| Cmd + Option + B             | 打开书签管理器                     |
| Cmd + ,                      | 打开设置页                         |
| Cmd + Y                      | 在新标签页打开历史记录             |
| Cmd + Shift + J              | 在新标签页打开下载记录             |
| Cmd + F                      | 在当前网页打开搜索栏               |
| Cmd + Option + i 或 Fn + F12 | 打开开发者工具                     |
| Cmd + Shift + Backspace      | 打开`清除浏览数据选项`             |
| Cmd + Enter                  | 在新的标签页打开网址               |
| Cmd + L                      | 跳转到地址栏                       |
| Cmd + Shift + R              | 重新加载当前网页                   |
| Cmd + O                      | 从本地选择文件用 Chrome 打开       |
| Cmd + Option + U             | 显示当前网页不可修改的 HTML 源代码 |
| Cmd + Option + J             | 打开 JavaScript 控制台             |
| Cmd + D                      | 将当前网页保存为书签               |
| Cmd + Ctrl + F               | 开启或关闭全屏模式                 |
| Cmd + +                      | 放大网页内容                       |
| Cmd + -                      | 缩小网页内容                       |
| Cmd + 0                      | 将网页内容恢复默认大小             |
| Cmd + Option + F             | 使用 Google 进行搜索               |
| Cmd + Shift + H              | 在当前标签页中打开主页             |
| Cmd + Shift + T              | 恢复上一个被关闭的标签页           |

### 2.2、Chrome 常用插件

掌握好下面这些插件，让你的 Chrome 浏览器变为浏览神器

#### 2.2.1、AdBlock

链接：https://chrome.google.com/webstore/detail/adblock-%E2%80%94-best-ad-blocker/gighmmpiobklfepjocnamgkkbiglidom?utm_source=chrome-ntp-icon

屏蔽网页广告的神器，如果存在漏网之鱼，也可手动添加到屏蔽列表，还你一个干净的网络环境

#### 2.2.2、OneTab

链接：https://chrome.google.com/webstore/detail/onetab/chphlpgkkbolifaimnlloiipkdnihall?utm_source=chrome-ntp-icon

将打开的诸多网页合并在一个页面

#### 2.2.3、Octotree - GitHub code tree

链接：https://chrome.google.com/webstore/detail/octotree-github-code-tree/bkhaagjahfmjljalopjnoealnfndnagc?utm_source=chrome-ntp-icon

让你像在 IDE 中浏览 Github 上的代码，非常实用

#### 2.2.4、GitZip for github

链接：https://chrome.google.com/webstore/detail/gitzip-for-github/ffabmkklhbepgcgfonabamgnfafbdlkn?utm_source=chrome-ntp-icon

让你可以下载 Github 上的某个文件夹或文件

#### 2.2.5、Google 翻译

链接：https://chrome.google.com/webstore/detail/gitzip-for-github/ffabmkklhbepgcgfonabamgnfafbdlkn?utm_source=chrome-ntp-icon

Google 翻译功能非常强大，极力推荐

#### 2.2.6、稀土掘金

链接：https://reurl.cc/eO0jdb

掘金的网页插件，里面还有很多实用的工具，非常赞

#### 2.2.7、Evernote Web Clipper

链接：https://chrome.google.com/webstore/detail/evernote-web-clipper/pioclpoplcdbaefihamjohnefbikjilc?utm_source=chrome-ntp-icon

插件版印象笔记，当你想保存一个网页的时候，用它吧

#### 2.2.8、Infinity New Tab (Pro)

链接：https://chrome.google.com/webstore/detail/infinity-new-tab-pro/nnnkddnnlpamobajfibfdgfnbcnkgngh?utm_source=chrome-ntp-icon

美观实用的新建标签页，不过我还是更喜欢稀土掘金

## 三、Web 文档笔记：Markdown 语法 and Typora

我认为 Typora 是非常好用的写作 app，搭配上 Markdown 语法，简直不要太爽，我平时写博客都是用的它。

### 3.1、Markdown 语法介绍

### 3.2、Typora

#### 3.2.1、Typora showtime

#### 3.2.2、Typora 快捷键

#### 3.2.3、其他细节

## 四、总结

本篇文章主要介绍了 Web 开发中一些非常好用的开发工具：

1、VS Code：最适合 Web 开发的编辑器

2、Chrome：最适合 Web 开发的浏览器

3、Markdown 语法 + Typora：最适合写作的黄金组合

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 参考和推荐

[第一次使用VS Code时你应该知道的一切配置](https://juejin.cn/post/6844903826063884296#heading-98)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！