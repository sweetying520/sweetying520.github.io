---
title: 一篇就够系列：发布开源库到JitPack，JCenter详细教程
date: 2022-10-11 10:50:45
author: sweetying
tags: 
- 原创
- Android
- 一篇就够
categories:
- Android
- 一篇就够
---

## 前言

- JCenter解释: JCenter是一个Java/Android工程的包管理Maven仓库,由[bintray.com](https://bintray.com/)维护,是目前世界上最大的Java仓库
- [JitPack](https://jitpack.io/)官方解释: 易于为JVM和Android库使用包存储库，JitPack根据需要构建GitHub项目，并发布随时可用的包

- 在我们的日常开发当中,经常会引入一些第三方的库来实现一些功能,如下

方式1: 发布到JCenter的库进行如下依赖:

```
//在app的build.gradle或者module的build.gradle下添加如下代码
dependencies {
    implementation 'org.greenrobot:eventbus:3.2.0'
}
```

方式2: 发布到JitPack的库进行如下依赖

```
//在project的build.gradle中添加如下代码
allprojects {
    repositories {
       	//...
        maven { url 'https://jitpack.io' }
    }
}
```

```
//在app的build.gradle或者module的build.gradle下添加如下代码
dependencies {
    implementation 'com.github.sweetying520:AndroidUtils:1.0.1'
}
```

经过上面的操作,我们就可以使用这些第三方库的功能了

**注意:**

>JitPack和JCenter都是第三方的代码仓库,在我们使用AndroidStudio新建一个项目的时候默认引入了JCenter,因此我们发布到Jcenter的库就可以直接在app的build.gradle或者module的build.gradle添加依赖即可,而JitPack没有引入,因此在添加app的build.gradle或者module的build.gradle的依赖的时候,需在project中的build.gradle中引入JitPack的仓库,添加其他第三方库下的依赖也是如此

-  问题: 我们如何将自己写的Android库被别人优雅的引用呢？

   答案: 将我们编写好的Android库发布到JCenter或者JitPack仓库或者自己的本地仓库,在按照如上方式引用

## 方式一: 发布Android库到JCenter

### 步骤1: 注册Bintray账号  

- [注册地址](https://bintray.com/signup/oss)

> **注意:**
>
> 1. 不要在官网注册，因为官网注册的是企业版，我们需要的是个人版
> 2. （建议）直接关联 `Github`账号进行注册 & 登录

![944365-93dd43c47e0ffa59](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281525521.png)

### 步骤2: 在Bintray上创建仓库

1. 点击红框中的Add New Repository创建一个仓库

   ![image-20210110140256826](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281525869.png)

### 步骤3: 按步骤填写相关配置

**注意**

填写仓库名的时候,这里我们填写maven就好，这个地方遇到坑就是,当我们填写上传到Bintray的配置信息的时候,如果没有指定repoName,那么默认的repoName就为maven,如果指定了就填写你创建的仓库名即可

```
publish {
    userOrg = 'sweetying520'  //Bintray用户名
    repoName = 'maven' //Bintray上创建的仓库名,如果你创建的是maven,则可以干掉这一行,否则需要指定仓库名
    groupId = 'com.github.sweetying520' //依赖名implementation 'x:y:z'中的x
    artifactId = 'AndroidUtils' //依赖名implementation 'x:y:z'中的y
    publishVersion = '1.0.0' //依赖名implementation 'x:y:z'中的z
    desc = 'AndroidUtils is a library of tools to help developers improve their productivity' //对这个库的描述
    website = 'https://github.com/sweetying520/AndroidUtils' //VCS地址,填写该项目的Github地址就好
}
```

![image-20210110140857448](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281525883.png)

### 步骤4: 在代码项目中创建`Module`，并将项目上传到Github

**注意**

Module我已经创建好了,这里只是演示过程

1. 新建Module

   ![image-20210110144659112](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281525603.png)

2. 选择Android Library

   ![image-20210110145022512](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526120.png)

3. 在Module中编写一些测试代码,方便上传成功后验证

4. 将自己的这个项目上传到Github,如何上传到Github不懂的自己上网查一下

### 步骤5: 配置上传插件并上传到JCenter

> **注意**
>
> 网上大部分教程推荐我们使用[bintray-release插件](https://github.com/novoda/bintray-release)上传,但是这个插件不支持Gradle版本为6.+的,因此这里我推荐大家使用另外一个插件[传送门](https://github.com/panpf/bintray-publish),它是基于[bintray-release插件](https://github.com/novoda/bintray-release)做了一些改造,然后支持Gradle版本为6.+上传



1. 在你module的build.gradle下配置如下代码即可

```
//================================bintray 上传插件配置 start=========================================
apply plugin: 'com.github.panpf.bintray-publish'

//防止中文注释出现错误
allprojects {
    tasks.withType(Javadoc) {
        options.addStringOption('Xdoclint:none', '-quiet')
        options.addStringOption('encoding', 'UTF-8')
    }
}

buildscript {
    repositories {
        jcenter()
    }
    dependencies {
      	//上传插件
        classpath 'com.github.panpf.bintray-publish:bintray-publish:1.0.0'
    }
}

//下面这些配置换成你自己的即可
publish {
    userOrg = 'sweetying520'  //Bintray用户名
    repoName = 'maven' //Bintray上创建的仓库名,如果你创建的是maven,则可以干掉这一行,否则需要指定仓库名
    groupId = 'com.github.sweetying520' //依赖名implementation 'x:y:z'中的x
    artifactId = 'AndroidUtils' //依赖名implementation 'x:y:z'中的y
    publishVersion = '1.0.0' //依赖名implementation 'x:y:z'中的z
    desc = 'AndroidUtils is a library of tools to help developers improve their productivity' //对这个库的描述
    website = 'https://github.com/sweetying520/AndroidUtils' //VCS地址,填写该项目的Github地址就好
}
//================================bintray 上传插件配置 end=========================================
```

2. 上传项目到JCenter

   1. 在你的AndroidStudio的Terminal中执行如下命令:
	  ```
      如果是Windows系统:
      
      gradlew clean build bintrayUpload -PbintrayUser="Bintray用户名" -PbintrayKey="Binary得到的API Key" -PdryRun=false
   
      如果是Mac系统:

      ./gradlew clean build bintrayUpload -PbintrayUser="Bintray用户名" -PbintrayKey="Binary得到的API Key" -PdryRun=false
     ```

      上面**PbintrayUser**代表注册的用户名，**PbintrayKey**就是需要在Binary得到的API Key，PdryRun是一个配置参数，为true的时候，会运行所有的环节，但是不会上传

   2. 如何获取Binary得到的API Key?

      1. 点击1的Edit Profile

      2. 点击2的API Key

      3. 输入3的密码即可获取API Key

         ![image-20210110152109989](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526420.png)

   

   

3. 至此,已经将项目上传到JCenter上面去了,我们可以查看库相关信息

   ![image-20210110152638520](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526089.png)

   但是这个时候,我们的库还不能被外界给引用到

### 步骤6: 添加到JCenter

1. 从Bintray上打开查看该库的信息,点击添加Add to JCenter按钮

   ![image-20210110153737396](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526823.png)

2. 填写一些对library的描述，然后发送，等待审核,审核时间一般几分钟到几个小时,工作日会快点,审核通过后会邮件通知你，这个时候就可以愉快的通过依赖使用这个库了

   ![image-20210110154334641](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526983.png)

3. 在你的App或者Module的build.gradle中添加如下代码就可以使用了

   ```
   dependencies {
       implementation 'com.github.sweetying520:AndroidUtils:1.0.0'
   }
   ```

4. 验证效果,我的Demo中是用Toast显示一句"二代666"

   ![image-20210110172426166](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526370.png)
   
### 关于后续版本更新

1. 修改module中build.gradle的配置版本号

   ![image-20210111103047291](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526249.png)

2. 在你的AndroidStudio的Terminal中执行如下命令:

   ```
   //如果是Windows系统:
   gradlew clean build bintrayUpload -PbintrayUser="Bintray用户名" -PbintrayKey="Binary得到的API Key" -PdryRun=false
   
   如果是Mac系统:
   ./gradlew clean build bintrayUpload -PbintrayUser="Bintray用户名" -PbintrayKey="Binary得到的API Key" -PdryRun=false
   ```

   执行完之后,等待一段时间,你就可以去Bintray上看到你更新的版本了

## 方式二: 发布Android库到JitPack

还是以上面这个编写的库为例

### 步骤1：创建好项目并编写Android库

### 步骤2：配置上传插件并上传至Github

> **注意**
>
> 插件版本可以使用最新的,以官网为主 [传送门](https://github.com/dcendents/android-maven-gradle-plugin)

1. 在你module的build.gradle中进行如下配置:

   ```
   //==============================JitPack 上传插件配置 start=====================
   apply plugin: 'com.github.dcendents.android-maven'
   //组名 com.github是固定的,后面的sweetying520是我Github的用户名,替换成你自己的就可以了
   group='com.github.sweetying520'
   
   buildscript {
       repositories {
           jcenter()
       }
       dependencies {
       		//这里我写的时候是这个版本
           classpath 'com.github.dcendents:android-maven-gradle-plugin:2.1'
       }
   }
   //==============================JitPack 上传插件配置 end=======================
   ```

2. 将项目上传到Github,不懂如何上传的自己上网查一下

### 步骤3：打开项目的github主页，创建一个Release或Tag

1. 点击如下图指示

   ![image-20210110161833850](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526501.png)

2. 创建一个Release或者Tag

   **注意**

   1. 首次进来是这样子的

      ![image-20210110162350536](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281526272.png)

   2. 创建过版本之后,进来是这样子的

      ![image-20210110162314370](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281527533.png)

   3. 创建版本

      ![image-20210110163349014](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281527646.png)

### 步骤4: 将项目的仓库提交到[JitPack](https://jitpack.io/)

1. 打开[JitPack](https://jitpack.io/),并登陆(使用的是你的Github账号登陆即可)

2. 将你的项目Github地址放入搜索栏,点击look up,这个时候就会进行编译,等待编译完成即可,下面的Version是我之前生成的一些版本

   ![image-20210110165357849](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281527049.png)

   编译完成后JitPack会自动给你生成相关的配置信息,按照如下配置,配置你的项目即可 

   ![image-20210110165537556](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281527281.png)

   最后就可以愉快的进行使用了!!!
   
### 关于后续版本更新

1. 将修改好的东西上传到Github
2. 打开项目的github主页，创建一个Release或Tag(这个步骤就是重复步骤3)
3. 将项目的仓库提交到[JitPack](https://jitpack.io/)(这个步骤就是重复步骤4)

## 总结

到这里,两种引用方式就都介绍完了,对比下这两种上传库的方式:

上传到JitPack: 简单,省时,项目依赖的时候,需引入JitPack仓库

上传到JCenter: 流程相对JitPack复杂一点,项目依赖的时候,直接引用即可,但是上传的过程中可能会遇到一些坑,文中都已经做了说明,因此按照我的步骤走,应该就没啥问题

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
