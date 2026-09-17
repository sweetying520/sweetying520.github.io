---
title: Android 逆向系列（一）：反编译 APK 技术完全解析
date: 2022-10-21 15:42:55
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281542784.jpeg
tags:
- 原创
- Android
- Android 逆向
- 反编译
categories:
- Android
- Android 逆向
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281542784.jpeg)

## 前言

很高兴遇见你~

日常开发中，我们可能需要反编译 apk 去查看或分析一些问题，如：

1、这个 app 效果挺酷的啊，怎么实现的呢？此时你就可以反编译看下它的布局和代码实现

2、这个 app 里面的资源挺多的啊，我想拿过来用，此时你就可以反编译去拿这个 app 里面的资源

3、使用 aop 在一个类里面插入了一些代码，想验证一下，此时你就可以反编译查看是否按照你的预期插入了代码

4、我想改吧改吧这个 app ，例如替换它的 app icon，替换里面的翻译，app 汉化等等，此时你就可以反编译修改，然后打成一个新的 apk 发布（这种大家知道就好，千万别去做啥坏事）

上面列举的 4 种场景基本可以覆盖我们日常开发中遇到的问题了，接下来我们就正式进入 APK 反编译技术的讲解

**注意**：下面演示均是在 mac 下进行

## 一、反编译工具介绍

如果我们只是需要 app 中的图片资源，可以直接修改 `xxx.apk`的后缀为 `xxx.zip`，解压后的文件目录如下：

![image-20221022210917119.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281542473.png)

所有的代码处于 `classes.dex` 中，图片布局等资源处于 res 目录下。此时你可以直接去 res 目录下复制图片资源使用，但是你去打开 AndroidManifest.xml 文件和 activity_main.xml 文件，会发现看不懂

AndroidManifest.xml 文件：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281542492.png" alt="image-20221022175713114.png" width="50%" />

activity_main.xml 文件：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281542276.png" alt="image-20221022175816393.png" width="50%" />

就是一推整齐排列的 16 进制数，那如果我想看懂要怎么办呢？

答：使用 apktool

### 1.1、apktool

作用：反编译 APK 中的资源

下载链接：https://ibotpeaches.github.io/Apktool/install/

打开下载链接会出现如下界面：

![image-20221021173948270.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281542428.png)

mac 建议使用红框中的 Homebrew 去安装，执行 `brew install apktool` 命令一键安装，它会自动给你配置好环境变量以及增加文件的操作权限

安装完成后，输入`apktool`命令 ，如果展示了 apktool 相关信息证明你配置成功了，如下图：

![image-20221021174740419.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281542252.png)

#### 1.1.1、apktool 使用

接下来我们通过 apktool 来反编译 apk 中的资源

1、先准备一个 apk 文件

2、执行 `apktool d xxx.apk` 命令

其中 d 是 decode 的意思，表示我们要对 xxx.apk 进行解码，我们还可以再加上一些附加参数来控制 decode 的更多行为：

> -f ：如果目标文件夹已存在，则强制删除现有文件夹（默认如果目标文件夹已存在，则解码失败）
>
> -o ：指定解码目标文件夹的名称（默认使用 APK 文件的名字来命名目标文件夹）
>
> -s ：不反编译dex文件，也就是说 classes.dex 文件会被保留（默认会将 dex 文件解码成 smali 文件）
>
> -r ：不反编译资源文件，也就是说 resources.arsc 文件会被保留（默认会将 resources.arsc 解码成具体的资源文件）

常用的用法就这么多，上述命令的执行结果如下图所示：

![image-20221022172954424.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543144.png)

这就说明反编译资源成功了

**需要注意的是**：

1、上述 `app-debug.apk`，mac 的 terminal 会自动添加 `.zip` 后缀，大家别给误导了哈

2、另外生成的文件夹会在 `apk-debug.apk.zip` 的基础上在增加 `.out` 后缀：

![image-20221022173342679.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543595.png)

这种现象和 windows 系统表现不太一样，大家注意一下，如果看着不爽，可以使用上述讲的附加参数`-o` ，来对输出的文件夹进行重命名

3、建议大家新建一个文件夹来进行反编译的操作，例如上面我新建了一个 apktool_reverse 的文件夹，然后将 apk 资源放到下面，通过 terminal cd 到这个目录，最后执行解码的命令

4、如果我们执行解码命令 `apktool d xxx.apk` 成功后，想添加附加参数继续执行，如：`apktool d -s -r xxx.apk`，此时会报错：

![image-20221022174758839.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543463.png)

报错提示我们该文件夹已经存在了，因此在这种文件夹已经存在的情况下，大家应该加上附加参数`-f`强制删除现有文件夹

ok，看一下 apktool 反编译后生成的一些具体文件：

![image-20221022180713615.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543278.png)

> 1、AndroidManifest.xml：经过反编译还原后的 manifest 文件
>
> 2、original 文件夹：存放了未经反编译过、原始的 AndroidManifest.xml 文件
>
> 3、res 文件夹：存放了反编译出来的所有资源
>
> 4、smali 文件夹：存放了反编译出来的所有代码，只不过格式都是`.smali`类型的

看一眼反编译后的 AndroidManifest.xml 文件和 activity_main.xml 文件

AndroidManifest.xml 文件：

![image-20221022180343979.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543394.png)

activity_main.xml 文件：

![image-20221022180428331.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543477.png)

已经还原成我们看得懂的文件了，格式差点意思，你可以将内容复制出来放到 AndroidStudio 里面格式化一下就完美了，这样我们就把反编译资源的方法给掌握了

另外使用 apktool 反编译后的代码处于 smali 文件夹下，且都是`.smali`格式的，我们简单截取一段 MainActivity.smali 文件的代码：

![image-20221022205951161.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543994.png)

嗯，看不懂😂，如果你能看得懂，那么做的事情就多了，你可以随意修改应用程序内的逻辑，将其进行破解发布。

那怎么才能转换成能看懂的 Java 代码呢？

答：使用 dex2jar + jd-gui

### 1.2、dex2jar

作用：将 dex 文件转换成 jar 文件

下载地址：https://sourceforge.net/projects/dex2jar/files/

#### 1.1.1、dex2jar 使用

将下载的 dex2jar 压缩包解压，可以看到如下内容：

![image-20221021165416847.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543803.png)

在 mac 中使用 `d2j-dex2jar.sh` 文件就 ok 了

1、将需要转换的 dex 文件复制到当前 dex2jar 目录：

![image-20221021165712150.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543369.png)

2、执行如下命令：

```sh
sh d2j-dex2jar.sh classes.dex
```

此时 terminal 会报错：**Permission denied** 

这是因为文件权限不足导致的，执行如下命令提权即可：

```sh
chmod 777 d2j_invoke.sh
```

接着在执行上述反编译命令，过程如下：

![image-20221021170548196.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281543530.png)

我们可以看到 dex2jar 多了两个压缩包：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544429.png" alt="image-20221021170810169.png" width="30%" />

其中代码都处于 classes-dex2jar.jar 中， dex2jar 已经完成它的使命，接下来我们需要通过 jd-gui 去查看 jar 包下的内容

### 1.2、jd-gui

作用：查看 jar 包里面的具体类容

下载地址：http://java-decompiler.github.io/

打开下载链接如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544952.png" alt="image-20221022212449198.png" width="50%" />

根据自己的操作系统下载不同的压缩包即可，这里我下载的是 `jd-gui-osx-1.6.6.tar`，解压后你会看到下面 4 个文件：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544914.png" alt="image-20221022212625065.png" width="50%" />

双击打开 JD-GUI ，你会发现系统给我们报了个错误：

> ERROR launching 'JD-GUI'
>
> No suitable Java version found on your system!
>  This program requires Java 1.8+
>  Make sure you install the required Java version.

这是因为 `universalJavaApplicationStub.sh` 脚本在 Mac Big Sur 及以上版本有兼容性问题，我们需要对这个脚本的内容进行替换

1、双击 JD-GUI 显示包内容

![image-20221022213637572.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544932.png)

2、根据截图找到 `universalJavaApplicationStub.sh`

![image-20221022213535766.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544531.png)

3、将此文件内容替换为   [https://github.com/tofi86/universalJavaApplicationStub/blob/v3.0.6/src/universalJavaApplicationStub](https://github.com/tofi86/universalJavaApplicationStub/blob/v3.0.6/src/universalJavaApplicationStub) 这个链接中的内容

**注意**：安装之前你要保证系统已经安装了 JDK 1.8 及以上版本

经过上面 3 步，你就可以正确的打开 JD-GUI 了：

![image-20221022214020602.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544346.png)

接着将需要打开的 jar 包给拖进去，查看 MainActivity：

![image-20221022214433643.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544378.png)

上述 MainActivity 我使用 AspectJ 在 onCreate 方法中插入了一些代码，效果符合我的预期

至此，我们就学会了如何反编译代码和资源了，简单的小结一下：

**1、如果要反编译 app 的代码，就使用 dex2jar + jd-gui**

**2、如果要反编译 app 的资源，就使用 apktool**

ok，还没结束，现在你还只会我在前言中提到的 1，2，3 点，对于第 4 点：**反编译一个 app，将它打包成一个新的 app** 你还不会，跟着我的步伐继续往下走

## 二、基于一个 app 打造一个新的 app

**提醒**：这里大家就站在一个技术的角度去学习，千万别干坏事

我们基于上述使用 apktool 反编译后的文件夹去做修改，先再看一眼：

![image-20221022180713615.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544609.png)

未修改前 activity_main.xml 文件的代码如下：

![image-20221023094920363.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544606.png)

我们这里就简单的对 activity_main.xml 文件进行一些修改然后打包，修改如下：

![image-20221023095336625.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281544947.png)

接着使用 apktool 将我们反编译的`app-debug.apk.zip.out`文件夹重新打包成 apk，使用如下命令：

```shell
apktool b app-debug.apk.zip.out -o new_app_debug.apk
```

执行过程如下图：

![image-20221023100440147.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281545487.png)

现在你会发现同级目录有了一个新的 apk 文件：

![image-20221023100528479.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281545756.png)

结果猴急猴急的拿去安装，你会发现安装报错了：

> adb: failed to install xxx/new_app_debug.apk: Failure [INSTALL_PARSE_FAILED_NO_CERTIFICATES: Failed to collect certificates from /data/app/vmdl2142334632.tmp/base.apk: Attempt to get length of null array]

还是我们高兴的太早了，目前这个新 apk 是不能安装的，因为它还没有进行签名，那么如果这是别人的 app，我们从哪儿去整一个签名文件呢？很显然，拿别人的是不可能，因此我们需要自己去生成，使用 AndroidStudio 可以非常简单的生成一个签名文件，这里就不展开说了，不懂得自己去查一下

有了签名文件之后再 terminal 执行如下签名命令：

```shell
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore 签名文件名 -storepass 签名密码 待签名的APK文件名 签名的别名
```

其中 jarsigner 命令文件是存放在 JDK 的 bin 目录下，需要将 bin 目录配置在系统的环境变量当中才可以在任何位置执行此命令

以我的为例：

```shell
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore certificate -storepass erdai666 new_app_debug.apk key0
```

如果执行过程中没啥问题，就证明签名成功了，此时我们就可以把它安装到手机上了，不过在此之前，Android 还极度建议我们对签名后的 apk 文件进行一次对齐操作，因为这样可以使得我们的程序在 Android 系统中运行得更快。对齐操作使用的是 zipalign 工具，该工具存放于`<Android SDK>/build-tools/<version>`目录下，将这个目录配置到系统环境变量当中就可以在任何位置执行此命令了

```shell
 zipalign 4 new_app_debug.apk new_app_debug_aligned.apk
```

其中 4 是固定的值，后面指定待对齐的 apk 文件名和对齐后的 apk 文件名，运行这段命令之后，会生成一个`new_app_debug_aligned.apk`文件，如下所示：

![image-20221023102830691.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281545850.png)

接下来我们把这个签名对齐后的 apk 安装到手机上，效果如下图所示：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281545159.gif" alt="ezgif.com-gif-maker.gif" width="30%" />

可以看到，当我们打开 app 后，页面的布局变成我们修改后的了，说明我们基于一个 app 打造一个新的 app 成功了

## 三、总结

本篇文章我讲了：

1、反编译资源，主要通过 apktool

2、反编译代码，主要通过 dex2jar + jd-gui

3、基于一个 app 打造一个新的 app，主要通过 apktool 反编译后，修改 activity_main.xml 文件，然后进行重新打包，签名，对齐，最后安装展示了预期的效果。当然这里你有能力看懂 `.smali`格式的代码，那么你可以做的事情就更加多

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**


### 参考和推荐

[Android安全攻防战，反编译与混淆技术完全解析（上）](https://blog.csdn.net/guolin_blog/article/details/49738023)

[MAC下反编译APK的工具ApkTool,dex2jar,JD-GUI安装与使用方法](http://www.feiyunjs.com/2581.html)

[Mac Big Sur 升级后 JD-GUI 无法打开的问题修复](https://www.jianshu.com/p/ee2932b46d80)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！

