---
title: Gradle 系列 （三）、Gradle 插件开发
date: 2022-10-11 10:17:23
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614631.jpeg
tags: 
- 原创
- Android
- Gradle
categories:
- Android
- Gradle
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614631.jpeg)

## 前言

很高兴遇见你~

关于 Gradle 学习，我所理解的流程如下图：

![Gradle_learning](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615207.png)

在本系列的上一篇文章中，我们讲了 Gradle 的生命周期及一些常用 API，了解了 Settings，Project，Task 等等，完成了第二个环节。还没有看过上一篇文章的朋友，建议先去阅读 [Gradle 系列 （二）、Gradle 技术探索](https://juejin.cn/post/6986191903888769032)。

今天我们主要介绍环节三：熟悉自定义 Gradle 插件

Gradle 给我们提供了构建应用的核心功能，但是如果要编译构建 Android 工程，就需要通过 Gradle 插件来实现了，Google 开发了一套 Android Gradle Plugin 插件专门来编译构建 Android 工程。我们在日常开发中也可以自定义 Gradle 插件去完成一些特定的功能

[Github Demo 地址](https://github.com/sweetying520/GradleDemo) , 大家可以结合 demo 一起看，效果杠杠滴🍺

## 一、Gradle 插件介绍

### 1）、什么是 Gradle 插件？

简单的理解：Gradle 插件就是封装了一系列 Task 并执行

### 2）、插件分类

Android 下的 Gradle 插件分为两种：

1)、脚本插件

脚本插件就是在 Android 工程中创建一个 `.gradle`为后缀的文件，然后通过 `apply from` 的方式去引用这个插件

2)、对象插件

对象插件就是实现了  `org.gradle.api.plugins` 接口的插件，Gradle 本身就给我们提供了一系列对象插件，如：`java` ，`groovy` ，`maven-publish` 等等。而如果我们要自定义对象插件，则有以下三种编写形式：

1、在 build.gradle 文件中直接编写

2、在 buildSrc 默认插件目录下编写

3、在自定义项目下编写

然后通过 `apply plugin` 的方式去引用这个插件

下面我们就来一一演示一下

## 二、脚本插件

1）、创建一个以 `.gradle` 为后缀的文件，名字随意取。这里我在根目录下创建了一个 script.gradle 的文件并随意编写了一些逻辑

![image-20210721213439960](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615078.png)

2）、在 build.gradle 中通过 `apply from` 进行插件的引用，我们可以传入一个绝对路径，也可以传入一个相对路径，如下：

```groovy
//当前在 app 的 build.gradle 中

//相对路径
apply from: '../script.gradle'

//绝对路径
apply from: rootDir.path + '/script.gradle'
```

**注意**：上述方式的引用实际上是调用了project 对象的 apply 方法，方法中传入一个 map。map 的 key 是 `from`，value 是 `../script.gradle` 。`apply plugin: '...'` 也是同样的道理

3）、使用插件提供的功能

```groovy
//当前在 app 的 build.gradle 中

//1、打印扩展属性
println property1
println property2

//2、执行 scriptTask
./gradlew scriptTask

//执行结果
> Configure project :app
erdai
666

> Task :app:scriptTask
Hello, I am Script Plugin
```

## 三、对象插件

上面讲到对象插件就是实现了 `org.gradle.api.plugin` 接口的插件，自定义对象插件主要有以下三种编写形式：

**注意：** 下面演示的插件都是通过 groovy 语法编写的

### 1）、build.gradle 文件中直接编写

```groovy
//当前在 app 的 build.gradle 中

//1、通过 apply plugin 引用当前插件
apply plugin: Method1Plugin

//2、自定义对象插件
class Method1Plugin implements Plugin<Project> {

    @Override
    void apply(Project project) {
        println '我是自定义 Method1Plugin '

        project.task("Method1PluginTask"){
            doLast {
                println 'Method1PluginTask exec success...'
            }
        }
    }
}

//3、执行 Method1PluginTask
./gradlew Method1PluginTask

//打印结果
> Configure project :app
I am Method1Plugin 

> Task :app:Method1PluginTask
Method1PluginTask exec success...
```

但这种方式有一个很大的缺点：**只能在当前 build.gradle 脚本文件下使用，其他的  build.gradle 用不了，局限性很强**

那么这个时候我们就可以考虑使用 buildSrc 的方式来编写插件

### 2）、buildSrc 默认插件目录下编写

在 Android 工程中，buildSrc 是 Gradle 默认的插件目录，编译 Gradle 的时候会自动识别这个目录，因此在 buildSrc 下编写的插件，我们可以直接进行引用。**通常我们会使用这种方式进行插件的调试**

buildSrc 方式具体使用步骤如下：

#### 1、步骤一

首先创建一个名为 **buildSrc** 的 Java Module (建立 Android Module 也可以，但是删除的东西多😂)，只保留 **build.gradle** 文件和 **src/main** 目录，其余的全部删除

**注意**：

1、创建的 Module 名字一定要是 buildSrc , 不然会找不到插件

2、buildSrc 的执行时机不仅早于任何⼀个 project（build.gradle），而且也早于 settings.gradle

3、当你创建一个 buildSrc Module 后（无论是 Java Module 还是 Android Module），Gradle 构建的时候会在 settings.gradle 文件中引入当前 module， 因此它会被执行两遍，这个时候 Gradle 会报如下错误：

![image-20210722104436027](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615163.png)

大致意思是：'buildSrc' 不能用作项目名，因为它是保留名。因此我们需要删除 settings.gradle 文件中引入的 buildSrc 配置

#### 2、步骤二

修改 build.gradle 文件中的内容

```groovy
//依赖 groovy 插件，这个是 Gradle 内置的插件
apply plugin: 'groovy'

//引入相关的依赖
dependencies {
    //Groovy DSL
    implementation gradleApi()
    //Gradle DSL
    implementation localGroovy()
}

//引入相关的仓库
repositories {
    mavenCentral()
}

//指定好相关资源目录，实际上也可以不用指定，AndroidStudio 能够自动识别出来
sourceSets {
    main {
        groovy {
            srcDir 'src/main/groovy'
        }
      
      	resources {
            srcDir 'src/main/resources'
        }
    }
}
```

修改好后， build 一下项目，这个时候你就能看到 Gradle 把它识别为一个插件目录了

#### 3、步骤三

在 src/main 下创建 groovy 目录，然后根据自己喜好创建插件代码存放的包路径，编写插件即可，我编写的插件代码如下截图：

![image-20210722160741350](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615181.png)

**注意：**

1、我这里是用 groovy 语法写的，因此我们需要创建一个 `.groovy` 为后缀的文件编写插件代码，我创建的是： BuildSrcPlugin.groovy

2、创建的 groovy 文件里面啥都没有，需要我们手动引入包路径，然后进行相关逻辑编写

#### 4、步骤四

这一步实际上就是注册我们编写的插件类，方便外部引用，介绍两种注册方式：

1、创建一系列文件夹进行插件注册

2、通过 Gradle 配置进行插件注册

##### 1、创建一系列文件夹进行插件注册

在  src/main 下创建 resources 目录，在  resources 目录下创建 META-INF 目录，在 META-INF 目录下创建 gradle-plugins 目录，在 gradle-plugins 目录下创建 `.properties` 为后缀的文件，名字可以根据自己的喜好取，最后在创建的 properties 文件下标识该插件对应的类路径即可完成插件的注册，如下：

```groovy
implementation-class=com.dream.plugin.BuildSrcPlugin
```

**注意**：

1、上面的目录名称都是固定的，别写错了，不然引用的时候会找不到插件

2、你创建的这个 properties 文件的名字很重要，后续引用插件就是根据这个名称来的，例如我创建的名称为 **BuildSrcPlugin.properties** , 那么引用插件的时候就是这样：

```groovy
apply plugin: 'BuildSrcPlugin'
```

上面三，四步骤完成后，项目结构如下图：

![image-20210722143609118](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615629.png)

这种注册方式比较固定，容易出错，不推荐使用，下面介绍另外一种注册方式

##### 2、通过 Gradle 配置进行插件注册

在插件的 build.gradle 中进行如下配置：

```groovy
//...
//1、引入 java-gradle-plugin 插件
apply plugin: 'java-gradle-plugin'


//2、进行插件注册相关的配置
gradlePlugin {
    plugins {
        greeting {
            // 插件id
            id = 'BuildSrcPlugin'
            // 插件实现类
            implementationClass = 'com.dream.plugin.BuildSrcPlugin'
        }
    }
}
```

这种方式比较简单，不容易出错，推荐使用

ok, 经过上面 4 个步骤，我们的插件就编写完成了，接下来直接引用即可，在需要的 build.gradle 进行引用：

```groovy
//当前在 app 的 build.gradle 下

apply plugin: 'BuildSrcPlugin'

//因为当前插件中的 Task 挂接到了构建流程中的 Task，我们直接运行项目就可以看到打印结果，如下截图
```

![image-20210722142743405](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615563.png)

buildSrc 方式的缺点：**只能在当前工程中使用，其他的项目工程使用不了，那如果我希望编写的插件其他项目也能用，这种方式就做不到了**

### 3）、在自定义项目下编写

前面我们讲到，buildSrc 方式的缺点就是只能在当前项目工程下使用，如果要在其他的工程使用，则使用不了。那么这个时候我们就可以采用自定义项目下编写插件，然后把当前插件发布到远程仓库，最后对插件进行引用即可

类似于 Android Gradle Plugin 的插件引用，如下：

1、在根 build.gradle 中添加如下代码:

```groovy
buildscript {
    //配置插件的仓库地址
    repositories {
        google()
        mavenCentral()
    }
    //配置插件的依赖
    dependencies {
        classpath "com.android.tools.build:gradle:4.2.1"
    }
}
```

2、在子 build.gradle 中引用插件

```groovy
//1、如果是 Android 应用工程
apply plugin: 'com.android.application'

//2、如果是 Android 库工程
apply plugin: 'com.android.library'
```

依葫芦画瓢，我们也来实现一个类似于 Android Gradle Plugin 的插件引用

**注意：** 这种方式编写插件和 buildSrc 方式非常的类似，区别就在于：

> 1、自定义了项目名称
>
> 2、增加了上传到远程仓库的配置

因此如果你不想通过自定义项目的方式编写插件，你可以把上传到远程仓库的配置写在 buildSrc 的 build.gradle 里面，然后进行上传

下面我们就通过自定义项目的方式去编写一个插件

#### 1、自定义一个 Java Module，名字任意取

我这里自定义了一个 customplugin 的 Java Module，其余步骤和 buildSrc 方式基本一样，唯一的不同就是 build.gradle 这个文件中新增了上传到 Maven 的配置，这里我是上传到本地 Maven

![image-20210723155621390](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615312.png)

看一眼我们的 build.gradle 文件：

```groovy
apply plugin: 'groovy'
apply plugin: 'java-gradle-plugin'
apply plugin: 'maven'


//引入相关的依赖
dependencies {
    //Groovy DSL
    implementation gradleApi()
    //Gradle DSL
    implementation localGroovy()
}

//引入相关的仓库
repositories {
    mavenCentral()
}

//Gradle 配置的方式注册插件
gradlePlugin {
    plugins {
        greeting {
            // 插件id
            id = 'CustomPlugin'
            // 插件实现类
            implementationClass = 'com.dream.plugin.CustomPlugin'
        }
    }
}


//将插件打包上传到本地maven仓库
uploadArchives {
    repositories {
        mavenDeployer {
            //指定 maven 发布三剑客
            pom.groupId = 'com.dream'
            pom.artifactId = 'customplugin'
            pom.version = '1.0.0'
            //指定本地 maven 仓库的路径，这里我指定的就是当前 Module 目录下
            repository(url: uri('../customplugin'))
        }
    }
}
```

上述配置文件新增的内容：

1、采用了 Gradle 配置的方式进行插件的注册

2、增加了上传到 maven 本地仓库的配置

接着看一眼我们的项目结构和编写的插件：

![image-20210722201238241](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615399.png)

#### 2、将当前插件发布到本地 Maven 仓库

我们可以通过两种方式去操作：

> 1、执行 `./gradlew uploadArchives` 命令
>
> 2、在 AndroidStudio 找到 Gradle 可视化界面的 uploadArchives Task 点击发布

如果上传成功，你将看到如下一些文件：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281615127.png" alt="image-20210722203228840"  />

上传到本地 Maven 仓库成功后，我们就可以像使用 Android Gradle Plugin 那样使用插件了

#### 3、插件依赖配置

**注意**：插件依赖就是我们在上传到 Maven 仓库配置的那三剑客，格式为：

```groovy
classpath '[groupId]:[artifactId]:[version]' 
```

如下：

```groovy
//在根 build.gradle 中引入本地仓库和插件依赖
buildscript {
    repositories {
        google()
        mavenCentral()
        jcenter()
      	//引入本地 Maven 仓库
        maven{
            url uri('customplugin')
        }
    }
    dependencies {
        classpath "com.android.tools.build:gradle:4.2.1"
      	//引入插件依赖
        classpath "com.dream:customplugin:1.0.0"
    }
}
```

上述步骤完成之后，我们就可以使用插件了，在需要的 build.gradle 进行引用：

```groovy
//当前在 app 的 build.gradle 下

apply plugin: 'CustomPlugin'

//因为当前插件中的 Task 挂接到了构建流程中的 Task，我们直接运行项目就可以看到打印结果，如下截图
```

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281616263.png" alt="image-20210722204535977"  />

至此，关于对象插件的编写及应用就讲的差不多了，接下来讲下如何发布插件到远程仓库

## 四、发布插件到远程仓库

我们常用的远程仓库有：Jcenter，mavenCentral，Maven 私服仓库，JitPack等等

**关于 Jcenter**

Jcenter 官方在 2021.2.3 发布声明即将停止 Jcenter 的运营

> 自 2021.3.31后不在接受任何新的提交，在2022.2.1前，你还是可以正常拉取2021.3.31前提交的库

因此这里就不讲如何发布插件到 Jcenter

**关于 mavenCentral**

自 Jcenter 宣布即将停止服务后，很多第三方库和插件都迁移到了 mavenCentral ，但是发布 mavenCentral 流程相对比较复杂，这里不做过多赘述，后续我会专门写一遍文章教大家如何上传到 mavenCentral

### 1）、发布插件到 Maven 私服仓库

如果有 Maven 私服仓库，那发布插件将会变得异常简单，你只需要将 build.gradle 里面的本地仓库改成远程仓库地址，并验证用户名密码即可，如下：

```groovy
//引入 maven 插件
apply plugin: 'maven'

//将插件打包上传到远程 maven 仓库
uploadArchives {
    repositories {
        mavenDeployer {
            //指定 maven 发布三剑客
            pom.groupId = 'com.dream'
            pom.artifactId = 'customplugin'
            pom.version = '1.0.0'
            //指定远程仓库
            repository(url: '你的远程仓库地址'){
              	authentication(userName: '用户名', password: "密码")
            }
        }
    }
}
```

**注意：** 一般公司都会搭建自己的 Maven 仓库

### 2）、发布插件到 JitPack

之前我写过一篇文章教大家如何上传第三方库到 JitPack [传送门](https://juejin.cn/post/6916061679079915528#heading-9) ，实际上上传插件也是同样的操作

#### 1、创建好项目并编写 Gradle 插件

这一步我们已经完成，但是有一个需要注意的地方：

**你的项目名称（根工程的名称）将会作为插件依赖的 artifactId，因此我们在创建项目的时候尽量取一个好点的名字**

![image-20210723155739473](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281616721.png)

#### 2、配置好上传插件并将项目上传至 Github

上传 JitPack 插件 [传送门](https://github.com/dcendents/android-maven-gradle-plugin)

在根 build.gradle 文件下添加如下插件依赖：

```groovy
buildscript {
    //...
    dependencies {
      	//...
        //上传 JitPack 插件依赖
        classpath 'com.github.dcendents:android-maven-gradle-plugin:2.1'
    }
}
```

在插件的 build.gradle 进行如下配置：

```groovy
apply plugin: 'com.github.dcendents.android-maven'
//组名 com.github 是固定的，后面的 sweetying520 是我 Github 的用户名，替换成你自己的就可以了
group = 'com.github.sweetying520'
```

**注意：** 

1、实际测试发现，上面的 group 你配置成其他的或不写出来都无所谓，最终的 groupId 都会是：`com.github.sweetying520`

2、另外我们上传的插件在 Github 被说明为废弃了，并推荐我们使用 `maven-publish` 插件 [传送门](https://developer.android.com/studio/build/maven-publish-plugin) 去上传，但在实际测试过程中，我发现使用  `maven-publish` 插件上传到 JitPack 会使得插件的依赖地址特别长，这里就不介绍了。虽然之前的插件被标识为废弃，但是并不妨碍我们使用

经过上面的两步，我们就有了 groupId 和 artifactId，因为我的项目名称叫：GradleDemo，那么此时的依赖如下：

```groovy
com.github.sweetying520:GradleDemo
```

那么现在就还差 version 了，要获取 version ，我们就先要把项目上传至 Github，上传成功后，接着进行下一步

#### 3、打开项目的 Github 主页，创建一个 Release 或 Tag

这一步建议参考我之前写的那篇文章  [传送门](https://juejin.cn/post/6916061679079915528#heading-9) 

#### 4、将项目仓库 Github 地址提交到 [JitPack](https://link.juejin.cn/?target=https%3A%2F%2Fjitpack.io%2F)

> 1、打开 [JitPack](https://link.juejin.cn/?target=https%3A%2F%2Fjitpack.io%2F) ，并登陆（使用你自己的 Github 账号登陆即可）
>
> 2、将你项目仓库 Github 地址放入搜索栏，点击look up，这个时候就会进行编译，如果编译成功，那么就证明你成功的将插件上传到 JitPack 了

下面的 Version 是我之前生成的一些版本

![image-20210723115443338](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281616322.png)

编译完成后 JitPack 会自动给你生成相关的配置信息，按照如下配置，配置你的项目即可

![image-20210723115812720](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281616837.png)

**注意：** 上述截图是教我们如何引用第三方库，而我们上传的是插件，因此按照插件的依赖引入规则即可，如下：

```groovy
//当前在根 build.gradle 下

buildscript {
    repositories {
      	//...

        //远程 JitPack 仓库地址
        maven {
            url 'https://jitpack.io'
        }
    }
    dependencies {
      	//...
      
        //引入插件依赖
        classpath 'com.github.sweetying520:GradleDemo:1.0.1'
    }
}
```

接下来我们就可以愉快的使用插件了

#### 5、关于后续版本更新

1、将修改好的东西上传到 Github

2、打开项目的 Github 主页，创建一个 Release 或 Tag（这个步骤就是重复步骤3）

3、将项目的仓库提交到 [JitPack](https://link.juejin.cn/?target=https%3A%2F%2Fjitpack.io%2F)（这个步骤就是重复步骤4）

## 五、插件调试

我们在开发插件的过程中可能会遇到各种问题，那么这个时候对插件调试就显得尤为重要了。**最简单的方式就是打印 Log 日志**，但是打印 Log 日志功能比较有限，满足不了我们的日常开发。接下来介绍一下强大的 debug 方式

以上面编写的 buildSrc 方式为例，我们对它进行一个 debug，插件的调试分为如下两种：

1、简单版调试：直接在 AndroidStudio 提供的 Gradle 可视化界面，找到需要调试的 Task，打开可选项，选择 debug 即可

2、复杂版调试：通过 Gradle 命令结合一些相关的配置开启调试功能

### 1）、简单版调试

直接在 AndroidStudio 提供的 Gradle 可视化界面，找到需要调试的 Task，打开可选项，选择 debug 即可


![debug_gradle_simple_use.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281616778.png)

接下来的步骤就和我们调试 Java 代码是一样的

**注意：** 提前打好断点

这种方式使用极其简单，推荐使用

### 2）、复杂版调试

通过 Gradle 命令结合一些相关的配置开启调试功能

#### 1、新增一个 Remote 类型的 Configuration

第一步：点击图中的 Edit Configurations...

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281616022.png" alt="image-20210722150428439" style="zoom:50%;" />

第二步：点击图中 1 的 + 号，选择 2 

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281616520.png" alt="image-20210722150750481" style="zoom:50%;" />

第三步：1 中的名字随意取，然后点击 2 ，即可完成  Remote 类型 Configuration 的创建

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617073.png" alt="image-20210722151029556" style="zoom:50%;" />

第四步：切换到刚才创建的 erdai Configuration

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617019.png" alt="image-20210722151407226" style="zoom:50%;" />

#### 2、执行 Gradle 命令：`./gradlew 需要执行的Task -Dorg.gradle.debug=true --no-daemon`

以执行 assembleDebug 这个 task 为例：

```groovy
./gradlew assembleDebug -Dorg.gradle.debug=true --no-daemon
```

此时我们的命令会进入一个锁定状态，等待我们进行下一步操作，如下图：

![image-20210722152335257](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617631.png)

#### 3、打好图中 1 的断点，点击 2 的 debug 按钮，就可以进行愉快的调试了

![image-20210722152553072](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617823.png)

接下来的步骤就和我们调试 Java 代码是一样的。这种方式稍微复杂一点

## 六、总结

本篇文章讲的一些重点内容：

1、脚本插件的定义与使用

2、对象插件定义的三种方式及具体使用，注意文中提到的一些细节点

3、发布 Gradle 插件到远程仓库：具体介绍了如何发布 Gradle 插件到 JitPack

4、如何调试插件，简单版调试效率高

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝 

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会讲自定义第三方插件实战应用，敬请期待吧😄

### 参考和推荐

[深度探索 Gradle 自动化构建技术（四、自定义 Gradle 插件)](https://juejin.cn/post/6844904135314128903)

[Gradle学习系列（三）：Gradle插件](https://juejin.cn/post/6937940389496094751)

[补齐Android技能树 - 玩转Gradle插件 ](https://juejin.cn/post/6956517422606057479#heading-1)

[我想调试下build.gradle | Gradle 调试](https://juejin.cn/post/6985188709356273701)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
