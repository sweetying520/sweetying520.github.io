---
title: Flutter系列（一）：运行你的第一个Flutter应用
date: 2022-09-05 14:21:00
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281609819.png
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281609819.png)

## 前言

Flutter 是 Google 推出并开源的移动端开发框架，主打跨平台、高保真、高性能。开发者可以通过 Dart 语言开发 App，一套代码可以同时运行在 iOS 和 Android平台。

2018 年 12 月，Google 发布 Flutter 1.0。从那时候开始，Flutter 以迅雷不及掩耳之势，迅速崛起，并稳固了其在市场上的地位。

如今，Flutter 相关资源和社区都已渐渐成熟，得到了很多开发者和企业的信任。另外因为公司业务扩张，准备引入 Flutter 开发项目，所以学习 Flutter 势在必行，下面就跟着我的脚步进行 Flutter 的学习吧

## 一、Flutter 开发环境搭建

**注意**：本文以 macOS 系统为例

### 1）、使用镜像

由于在国内访问 Flutter 有时可能会受到限制， Flutter 官方为中国开发者搭建了临时镜像，我们只需将如下环境变量配置到用户环境变量中即可：

```dart
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```

### 2）、下载 Flutter SDK

方式有 2：

#### 1、直接去 Flutter 官网下载最新的安装包即可

下载地址：https://docs.flutter.dev/development/tools/sdk/releases?tab=macos#macos

#### 2、通过 git clone 下载

```dart
git clone -b master https://github.com/flutter/flutter.git
```

上述这句命令会将仓库克隆下来并切换到 master 分支

**注意**：上述两种方式第一种需要解压，第二种不需要，总之将它们放置到您想放的地方即可

### 3）、配置 Flutter 环境变量

将 Flutter 环境变量配置到你的用户环境，下面以我个人的为例：

```dart
# flutter 环境变量
export FLUTTER_HOME=/Users/zhouying/Library/flutter
export PATH=${PATH}:${FLUTTER_HOME}/bin
```

### 4）、验证 Flutter 是否安装成功

通过`flutter doctor`来检查是否需要安装其它依赖项来完成安装，这个过程第一次可能需要耗费一段时间，下次就会快很多


![202201261529488.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610880.png)

从上面诊断信息我们可以看出：

1、Flutter 版本和渠道号 ok

2、Flutter运行所需的 Android 工具链 ok

3、Flutter 所需的 iOS 开发环境不 ok

4、Chrome ok

5、AndroidStudio ok

6、连接的设备 ok

7、HTTP 主机可用性 ok

### 5）、一些额外常用的 Flutter 命令

1、通过`flutter --help`查看所安装 Flutter 需要的帮助

2、通过`flutter --version`查看 Flutter 版本

3、通过`flutter devices`查看当前可用的设备

4、通过`flutter run`运行启动你的应用程序

## 二、平台设置

**注意**：这里主要讲 Android 平台

### 1）、安装并配置你的 Android Studio

1、下载并安装 [Android Studio](https://developer.android.com/studio/index.html).

**注意**：Android Studio 需要 3.0 或更高版本

2、启动 Android Studio，然后执行 Android Studio 安装向导，这将安装最新的 Android SDK，Android SDK 平台工具和 Android SDK 构建工具，这是 Flutter 为 Android 开发时所必需的

### 2）、设置你的 Android 设备

**注意**：Android 设备需要 Android 4.1（API level 16）或更高版本

#### 1、真机

> 1、在您的设备上启用 **开发人员选项** 和 **USB调试**
>
> 2、使用USB将手机插入电脑。如果您的设备出现提示，请授权您的计算机访问您的设备
>
> 3、在终端中，运行 `flutter devices` 命令以验证Flutter识别您连接的Android设备
>
> 4、运行启动您的应用程序 `flutter run`

#### 2、模拟器

> 1、在您的机器上启用 [VM acceleration](https://developer.android.com/studio/run/emulator-acceleration.html) 
>
> 2、启动 **Android Studio>Tools>Android>AVD Manager** 并选择 **Create Virtual Device**
>
> 3、选择一个设备并选择 **Next**
>
> 4、为要模拟的 Android 版本选择一个或多个系统映像，然后选择 **Next**. 建议使用 *x86* 或 *x86_64* image 
>
> 5、在 Emulated Performance下, 选择 **Hardware - GLES 2.0** 以启用 [硬件加速](https://developer.android.com/studio/run/emulator-acceleration.html)
>
> 6、验证AVD配置是否正确，然后选择 **Finish**
>
> 7、在 Android Virtual Device Manager 中, 点击工具栏的 **Run**。模拟器启动并显示所选操作系统版本或设备的启动画面.
>
> 8、运行 `flutter run` 启动您的设备. 连接的设备名是 `Android SDK built for <platform>`，其中 *platform* 是芯片系列，如 x86

### 3）、在 AndroidStudio 上安装 Flutter 和 dart 插件

- `Flutter`插件： 支持Flutter开发工作流 (运行、调试、热重载等)
- `Dart`插件： 提供代码分析 (输入代码时进行验证、代码补全等)

要安装这些:

1. 启动 Android Studio
2. 打开插件首选项 **Preferences > Plugins**
3. 选择 **Browse repositories…**, 选择 Flutter 插件并点击 `install`
4. 重启 Android Studio 后插件生效

**注意**：当你安装 Flutter 插件后，会自动安装 Dart 插件

## 三、创建并运行你的第一个 Flutter 应用

### 1）、创建新应用

1、选择 **File > New Flutter Project**

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610086.png" alt="image-20220112220116827" style="zoom:50%;" />

2、选择 **Flutter** 作为 project 类型, 然后点击 Next

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610138.png" alt="image-20220112220159083" style="zoom:50%;" />

3、输入项目名称 (如 `myapp`)，然后点击 Next

**注意**：Project name 字母必须都是小写，否则会提示你不能创建应用

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610342.png" alt="image-20220112220309504" style="zoom:50%;" />

4、点击 **Finish**

5、等待 Android Studio 安装 SDK 并创建项目

### 2）、Flutter 工程结构解析

如下图就是我们创建好的一个 Flutter 项目工程结构：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610618.png" alt="image-20220113145050564" style="zoom:50%;" />

简单的解释一下：

| 文件                   | 描述                                                         |
| ---------------------- | ------------------------------------------------------------ |
| myapp                  | 项目工程名称                                                 |
| .dart_tool             | Dart 工具开发相关配置                                        |
| .idea                  | Flutter 开发环境配置                                         |
| android                | Android 平台相关代码                                         |
| ios                    | iOS 平台相关代码                                             |
| lib                    | 跨平台代码，也是 Flutter 项目主要关心的目录                  |
| test                   | 测试相关代码                                                 |
| .gitignore             | git 提交仓库忽略文件                                         |
| .metadata              | 对当前工程的配置记录                                         |
| .packages              | 以 lib 结尾的文件绝对路径                                    |
| analysis_options.yaml  | 静态分析文件                                                 |
| myapp.iml              | 工程文件的本地路径配置                                       |
| pubspec.lock           | 当前项目依赖所生成的文件                                     |
| pubspec.yaml           | 项目描述文件，包含了项目的描述信息以及所需要的依赖的库       |
| README.md              | 项目描述信息                                                 |
| External Libraries     | Android 开发包，资源文件、Dart SDK 文件、工程开发依赖插件 API 等等 |
| Scratches and Consoles | 创建的临时文件和缓冲区列表                                   |

### 3）、运行应用

1、定位到 Android Studio 工具栏，选择运行应用的 Android 设备，我这里选择的是真机

![image-20220112220957667](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610835.png)

2、在工具栏中点击 **Run 图标**，或者调用菜单项 **Run > Run**，或者使用`flutter run` 命令来运行你的应用

3、如果一切正常, 你应该在你的设备或模拟器上会看到启动的应用：


![202201261600172.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610445.png)

### 4）、体验热重载

> Flutter 可以通过 *热重载（hot reload）* 实现快速效果预览，热重载就是无需重启应用程序就能实时加载修改后的代码，并且不会丢失状态（这和 webpack 的热重载是一样的）。简单的对代码进行更改，然后告诉 IDE 或命令行工具你需要重新加载（点击reload按钮），你就会在你的设备或模拟器上看到更改

1、将字符串`You have pushed the button this many times:'` 更改为`You have clicked the button this many times:'`

2、不要按`Stop`按钮，让你的应用继续运行

3、要查看你的更改, 只需调用`command + s`，或点击 **热重载按钮** (带有闪电⚡️图标的按钮) 即可


![202201261539133.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281610924.png)

## 四、总结

本篇文章讲的一些重点内容：

1、Flutter 开发环境搭建

2、Flutter 在 Android 平台相关设置

3、创建并运行你的第一个 Flutter 项目，Flutter 工程结构解析

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝 

**感谢你阅读这篇文章**

### 下篇预告

因为 Flutter 是基于 Dart 语言开发的，所以下篇文章我会讲 Dart 语言相关的内容，敬请期待吧😄

### 参考和推荐

[Flutter 官方文档](https://flutterchina.club/setup-macos/)

[《Flutter实战·第二版》- Preview](https://book.flutterchina.club/chapter1/flutter_intro.html)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
