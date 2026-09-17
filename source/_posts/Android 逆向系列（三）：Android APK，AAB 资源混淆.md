---
title: Android 逆向系列（三）：Android APK，AAB 资源混淆
date: 2022-12-03 10:22:00
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281515440.jpeg
tags:
- 原创
- Android
- Android 逆向
- 反编译
categories:
- Android
- Android 逆向
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281515440.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们讲了：

1、反编译工具 jadx 的安装与使用

> jadx 相当于是 apktool + dex2jar + jd-gui 的结合体，既能反编译代码也能反编译资源，一定程度上提高了我们的开发效率

2、混淆 APK 代码

> 1、准备了一些类（自定义编写的类，第三方库的类）用于混淆后的效果验证
>
> 2、在 app -> build.gradle -> android 闭包 -> release 闭包将 minifyEnabled 设为 true 开启代码混淆
>
> 3、使用 AndroidStudio 导航栏上 Generate Signed Bundle or APK 的方式打 release 包
>
> 4、在 app 的 build.gradle 文件中配置签名文件，方便后续使用 gradle 命令或 gradle 可视化界面打包
>
> 5、逐行介绍了默认混淆规则文件 proguard-android-optimize.txt 中的配置
>
> 6、Proguard 疑难语法介绍
>
> 7、自定义混淆规则保留类（自定义编写的类，第三方库的类）不被混淆

还没有看过上一篇的朋友，建议先去阅读[Android 逆向系列（二）：Android APK 代码混淆](https://juejin.cn/post/7168086915445424136) 

接下来我们介绍一下 APK，AAB 资源混淆

**注意**：

1、下面演示均是在 mac 下进行

2、AndroidStudio 版本：Android Studio Dolphin | 2021.3.1 Patch 1

3、AGP 版本：7.3.1

4、Gradle 版本：7.4

Github Demo 地址：<https://github.com/sweetying520/codeandnotes/tree/master/Reverse/AndroidReverseDemo>

## 一、APK 资源混淆

上篇文章我们对 APK 的代码进行了混淆，但是 APK 资源还是暴露在他人面前：

![image-20221203180325392.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281515378.png)

可以看到：**资源文件可读性很强，我们可以很轻松的去找到想要的资源**

针对这种情况，可以对 APK 的资源进行混淆。那要如何混淆呢？🤔️

答：使用微信开源的 AndResGuard 框架进行混淆

### 1.1、AndResGuard 介绍

Github 地址：https://github.com/shwenzhang/AndResGuard

1）、AndResGuard 是微信开源的一个资源混淆框架，工作方式类似于我们前面所讲的 APK 代码混淆。

2）、它会对我们的文件进行重命名，例如：activity_main.xml => a.xml，在一定程度上增加了别人窃取你资源的难度，另一方面减小了包体积

### 1.2、AndResGuard 使用

1、在项目的根 build.gradle 添加如下配置：

```groovy
//一、如果是 AGP 7.0 以下，使用如下配置：
buildscript {
    repositories {
      	//添加仓库地址：jcenter 在阿里云的镜像仓库
        maven {
            url 'https://maven.aliyun.com/repository/jcenter'
        }
    }

    dependencies {
        //添加 AndResGuard 依赖
        classpath 'com.tencent.mm:AndResGuard-gradle-plugin:1.2.21'
    }
}

//二、如果是 AGP 7.0 以上，使用如下配置：
//第一步
buildscript {
    repositories {
      	mavenCentral()
    }

    dependencies {
        //添加兼容 AGP 7.0 的 AndResGuard 依赖
      	//Github：https://github.com/Leon406/AndResGuard
        classpath 'io.github.leon406:AndResGuard-gradle-plugin:1.2.22.6'
    }
}

//第二步：在 gradle.properties 添加如下配置
//关闭系统自带的资源压缩
android.enableResourceOptimizations=false
```

**注意：** 

> 1、由于 jcenter 彻底关服，它里面所有的库都访问不了了，因此上面我们添加了 jcenter 在阿里云的镜像仓库
>
> 2、腾讯的 AndResGuard 未做 AGP 7.0 兼容，如果要在 AGP 7.0 上使用，请使用上述配置二

2、在 app 的 build.gradle 中添加相关配置

建议新建一个 gradle 脚本文件，然后在 app 的 build.gradle 中引入该 gradle 脚本，如下图：


![image-20221203114342414.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516184.png)

3、接着我们对 andresguard.gradle 进行配置，里面写了详细的注释

```groovy
apply plugin: 'AndResGuard'

andResGuard {

    //1、启用签名。为 true 时，需要配置 signConfig
    useSign = true
    //2、keepRoot 为 true 时，会 keep 住所有资源的原始路径，只混淆资源的名字
  	//实际测试 keepRoot 为 true 和 false 没啥区别
    keepRoot = true
    //3、白名单，指定不被混淆的资源文件，支持通配符，【+】代表 1 个或多个，【?】代表 0 个或 1 个，【*】代表 0 个或多个
    whiteList = [
           "R.mipmap.ic_launcher"
    ]
    //4、配置需要压缩的文件的匹配规则，一般这里不需要动。支持 ? + * 通配符
    compressFilePattern = [
            "*.png",
            "*.jpg",
            "*.jpeg",
            "*.gif",
    ]

    //5、配置7zip，只需设置 artifact 或 path；支持同时设置，但此时以 path 的值为优先
    //    sevenzip {
    //        //artifact = 'com.tencent.mm:SevenZip:1.2.21'
    //        //path = "/usr/local/bin/7za"
    //    }

    //6、用于 keep 住资源路径的 mapping 文件所在路径不被混淆
    //mappingFile = file("./resource_mapping.txt")

    //7、启用 7zip 压缩。为true时，useSign 必须为 true
    //use7zip = false

    //8、设置这个值，会把 arsc name 列混淆成相同的名字，减少 string 常量池的大小
    //fixedResName = "arg"

    //9、为 true 时会合并所有哈希值相同的资源，但请不要过度依赖这个功能去除去冗余资源
    //mergeDuplicatedRes = true

    //10、可选，指定生成的apk的保存路径
    // finalApkBackupPath = "${project.rootDir}/final.apk"

    //11、可选: 指定v1签名时生成jar文件的摘要算法，默认值为“SHA-1”
    // digestalg = "SHA-256"
}
```

4、同步一下项目，就可以进行 resguard 打包了，方式有二：

1）、使用 Gradle 可视化界面执行相应的任务进行打包：


![image-20221203192409739.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516682.png)

如果想打 debug 包，则执行 resguardDebug 。

如果想打 release 包，则执行 resguardRelease 。

2）、使用 Gradle 命令进行打包

在 Terminal 执行如下命令：

```groovy
//打 debug 包
./gradlew resguardDebug

//打 release 包
./gradlew resguardRelease
```

5、这里我们打 release 包，等待任务执行完成，我们可以在 app的`/build/output/apk/release/AndResGuard_{apk_name}/`文件夹中找到混淆后的Apk，如下图：


![image-20221203193101190.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516549.png)

其中：

1、**app-release_aligned_signed.apk**：为进行对齐混淆并签名过的 apk

2、**app-release_aligned_unsigned.apk**：为进行对齐混淆但未签名过的 apk

3、**app-release_unsigned.apk**：为进行混淆但未签名过的apk

2，3 两个包因为没有签名是不能进行安装的，只有 1 能安装

6、效果展示

这里我们主要对 1 进行反编译查看，如下图：

![image-20221203193839353.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516957.png)

可以看到资源文件按照预期效果混淆了。

另外我们配置的白名单资源没有被混淆，如下图：

![image-20221203194509171.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516242.png)

至此，AndResGuard 混淆 APK 资源就介绍完了，如果有疑问，可以参考我的 demo 工程。

接下来我们介绍一下混淆 AAB 资源，在此之前，我们应该先了解一下 AAB 是什么？

## 二、AAB 介绍

上传过应用到 GooglePlay 的同学肯定知道，现在 GooglePlay 强制要求我们上传 .aab 格式的文件，那你心中是否会有一些疑问呢？

什么是 AAB？AAB 和 APK 有啥区别？

### 2.1、什么是 AAB？

AAB 即 Android App Bundle ，它是 Google 推出的 APK 动态打包，动态组件化的技术，通过一个 .aab 后缀的 bundle 文件组装一个最适合你手机机型的 APK 来为你的设备安装

简介：[Android app bundle](https://developer.android.com/guide/app-bundle)

**Tips：.aab 是一种压缩包的格式（只用于上传 GooglePlay），最终用户下载的时候会通过用户手机机型配置的不同，生成一个最适合该配置的 APK，用户最终安装和下载的是 APK 文件**

### 2.2、AAB 和 APK 区别？

`*.aab` 和 `*.apk` 文件的结构对比如下图所示：

![img](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516668.png)

从图中可以看出，`*.aab` 和 `*.apk` 文件结构明显不同，`*.aab` 文件中的资源索引文件为 `resources.pb`，而 `*.apk` 文件中的资源索引文件为 `resources.arsc` 文件，二者的结构不同，解析自然也不相同，并且 `*.aab` 中的文件包含 `dynamic feature` 目录，所以 `*.aab` 中需要混淆更多的文件内容。

### 2.3、AAB 打包实践

#### 2.3.1、使用 AndroidStudio 打 AAB 包

之前我们介绍了如何使用 AndroidStudio 打一个 APK 包，接下来我们介绍一下如何打 AAB 包，流程其实差不多。

1、选择 AndroidStudio 工具栏的 build，点击 Generate Singed Bundle or Apk


![image-20221203203338084.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516497.png)

然后选择 Android App Bundle，点击 next


![image-20221203203522968.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516220.png)

2、选择签名文件，如果没有则新建一个，我这里已经有了：

![image-20221203203733628.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281516355.png)

点击 next

3、选择打 release 包：

![image-20221203203933035.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281517913.png)

点击 finish

经过上面 3 步，如果没啥问题，我们就能成功打一个 AAB 包，如下图：


![image-20221203204127859.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281517549.png)

在 app/release/ 目录下生成了一个 app-release.aab 文件

#### 2.3.2、将 AAB 安装到手机

AAB 已经有了，接下来我们就把它安装到手机上。

我们知道 APK 能直接安装到手机上，但是 AAB 不行，那如果我将 AAB 转成 APK 然后安装到手机是否可行呢？实践一下。

1、下载 bundletool 工具

要想将 AAB 转成 APK ，这里我们需要借助 Google 提供的 bundletool 工具

下载链接：https://github.com/google/bundletool/releases


![image-20221203205358585.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281517689.png)

2、然后通过 `bundletool` 将 aab 转为一组 apk，也就是 apks，使用如下命令：

```shell
java -jar [ bundletool 文件] build-apks --bundle [ aab 文件] --output [ apks 文件]
 --ks=[签名文件]
 --ks-pass=[pass:签名密码]
 --ks-key-alias=[别名]
 --key-pass=[pass:别名密码]
```

以我的为例：

```shell
java -jar bundletool-all-1.13.1.jar build-apks --bundle=app-release.aab --output=app-output.apks --ks=Certificate --ks-pass=pass:erdai666 --ks-key-alias=key0 --key-pass=pass:erdai666
```

生成的文件如下：

![image-20221203210544108.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281517318.png)

3、使用 bundletool 将生成的 app-output.apks 安装到手机，执行如下命令：

```shell
java -jar [ bundletool 文件] install-apks --apks=[ apks 文件]
```

以我的为例：

```shell
java -jar bundletool-all-1.13.1.jar install-apks --apks=app-output.apks
```

如果没啥问题，你的手机将会收到一个安装的提示，如下图：


![image-20221203211406390.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281517735.png)

点击安装即可

## 三、AAB 资源混淆

上述 AAB 资源是没有经过混淆的，我们把它拖入 jadx-gui 即可验证这一点：


![image-20221203211756626.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281518637.png)

接下来我们使用字节开源的 AabResGuard 框架对 AAB 资源进行混淆。

### 3.1、AabResGuard 使用

Github 地址：https://github.com/bytedance/AabResGuard

AabResGuard 和我们上面介绍的 AndResGuard 原理很类似，只不过一个是针对 AAB ，一个是针对 APK。

它的使用有两种方式：

1、Gradle Plugin

2、命令行支持

#### 3.1.1、Gradle Plugin

**注意： aabresguard-plugin 只发布了 0.1.8 版本，0.1.8 版本依赖的 Kotlin 插件的版本为：1.3.61，而 AGP 7.x 版本支持的 Kotlin 插件版本为：1.5.20 或者更高，因此如果你使用了 AGP 7.x 的版本，建议使用方式二去对 aab 进行资源混淆**

1、在项目的根 build.gradle 添加如下配置：

```groovy
buildscript {
    repositories {
      	mavenCentral()
    }

    dependencies {
        classpath "com.bytedance.android:aabresguard-plugin:0.1.8"
    }
}

```

2、在 app 的 build.gradle 中添加相关配置

建议新建一个 gradle 脚本文件，然后在 app 的 build.gradle 中引入该 gradle 脚本，如下图：


![image-20221203215616463.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281518855.png)

3、接着我们对 aabresguard.gradle 进行配置，里面写了详细的注释

```groovy
apply plugin: "com.bytedance.android.aabResGuard"

aabResGuard {
    whiteList = [ // 白名单规则
                  "R.mipmap.ic_launcher"
    ]
    obfuscatedBundleFileName = "duplicated-app.aab" // 混淆后的文件名称，必须以 `.aab` 结尾
    mergeDuplicatedRes = true // 是否允许去除重复资源
    enableFilterFiles = true // 是否允许过滤文件
    filterList = [ // 文件过滤规则
                   "*/arm64-v8a/*",
                   "META-INF/*"
    ]
    enableFilterStrings = false // 过滤文案
    //mappingFile = file("mapping.txt").toPath() // 用于增量混淆的 mapping 文件
    //unusedStringPath = file("unused.txt").toPath() // 过滤文案列表路径 默认在mapping同目录查找
    //languageWhiteList = ["en", "zh"] // 保留en,en-xx,zh,zh-xx等语言，其余均删除
}
```

4、同步一下项目，使用如下命令进行混淆

```shell
./gradlew clean :app:bundleRelease --stacktrace 
```

5、通过执行 gradle Task 获取混淆后的 bundle 文件路径

```groovy
def aabResGuardPlugin = project.tasks.getByName("aabresguard${VARIANT_NAME}")
Path bundlePath = aabResGuardPlugin.getObfuscatedBundlePath()
```

### 3.1.2、命令行支持

AabResGuard 提供了 jar 包，我们可以使用命令直接执行

```shell
java -jar [AabResGuard Jar 文件] obfuscate-bundle --bundle=[未资源混淆的 aab] --output=[资源混淆后的 aab] --merge-duplicated-res=true --storeFile=[签名文件] --storePassword=[签名密码] --keyAlias=[别名] --keyPassword=[别名密码]
```

以我的为例：

```shell
java -jar AabResGuard-0.1.9.jar obfuscate-bundle --bundle=app-release.aab --output=obfuscated.aab --merge-duplicated-res=true --storeFile=Certificate --storePassword=erdai666 --keyAlias=key0 --keyPassword=erdai666
```

经过上面的操作，aab 资源混淆的效果和之前 apk 资源混淆的效果是一样的，这里就不再进行效果验证了

## 四、总结

本篇文章我们介绍了：

1、使用 AndResGuard 对 APK 进行资源混淆，需要注意的是：

> 腾讯提供的 AndResGuard 不兼容 AGP 7.x ，因此如果在 AGP 7.x 中需使用兼容 AndResGuard 的方案去处理

2、什么是 AAB

> AAB 是 Google 推出的一种动态打包技术，它会根据用户手机的机型动态下发最合适的 APK 进行安装

3、AAB 和 APK 的区别

> 1、AAB 的资源索引文件为 .pb 格式，APK 的资源索引文件为 .arsc 格式
>
> 2、AAB 中包含了 dynamic feture 模块，APK 中没有

4、通过 AndroidStudio 打 AAB 包并安装到手机上

5、通过字节提供的 AabResGuard 对 AAB 进行资源混淆

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**


### 参考和推荐

[AndResGuard](https://github.com/shwenzhang/AndResGuard)

[AndResGuard 7.0 适配](https://github.com/Leon406/AndResGuard)

[AabResGuard](https://github.com/bytedance/AabResGuard)

[开源 | AabResGuard: AAB 资源混淆工具](https://juejin.cn/post/6844904038618628109)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
