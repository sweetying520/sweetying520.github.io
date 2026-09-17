---
title: Gradle 系列 （四）、Gradle 插件实战应用
date: 2022-10-11 10:17:26
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617558.jpeg
tags: 
- 原创
- Android
- Gradle
categories:
- Android
- Gradle
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617558.jpeg)

## 前言

很高兴遇见你~

关于 Gradle 学习，我所理解的流程如下图：

![Gradle_learning](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617510.png)

在本系列的上一篇文章中，我们讲了自定义 Gradle 插件相关的内容，完成了第三个环节。还没有看过上一篇文章的朋友，建议先去阅读 [Gradle 系列 （三）、Gradle 插件开发](https://juejin.cn/post/6988051489306443789)。

今天我们介绍的还是环节三：Gradle 插件实战应用

[Github Demo 地址](https://github.com/sweetying520/GradleDemo) , 大家可以结合 demo 一起看，效果杠杠滴🍺

## 一、回顾

之前在讲 [Android APT 系列 （四）：APT 实战应用](https://juejin.cn/post/6979191724983713805) 的时候，我们做了一次布局优化，Android 中少量的系统控件是通过 `new` 的方式创建出来的，而大部分控件如 `androidx.appcompat.widget` 下的控件，自定义控件，第三方控件等等，都是通过反射创建的。大量的反射创建多多少少会带来一些性能问题，因此我们需要去解决反射创建的问题，我的解决思路是：

> 1、通过编写 Android 插件获取 Xml 布局中的所有控件
>
> 2、拿到控件后，通过 APT 生成用 `new` 的方式创建 View 的类
>
> 3、最后通过反射获取当前类并在基类里面完成替换

其中 1 的具体流程是：通过 Android 插件获取所有 Xml 布局中的控件名称，并写入到一个`.txt`文件中。因 Gradle 系列还没讲，当时只是假设这么一个文件已经存在，那么现在我们已经会了如何自定义 Gradle 插件，我们就来实现一下它。

在此之前，我们需要先了解 Extension 和 Variants ，后续会用到

## 二、Extension 介绍

### 1）、什么是 Extension ？

Extension 中文意思即扩展。它的作用就是通过实现自定义的 Extension，可以在 Gradle 脚本文件中增加类似 android 这样命名的空间配置，Gradle 可以识别这种配置，并读取里面的配置内容。以一段我们熟悉的 Android 配置为例，如下：

```groovy
android {
    compileSdkVersion 30

    defaultConfig {
        applicationId 'com.dream.gradledemo'
        minSdkVersion 19
        targetSdkVersion 30
        versionCode 1
        versionName '1.0'

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

上述代码之所以能够这样配置，是因为 Android Gradle Plugin 定义了这些 Extension 

那么如何去自定义 Extension 呢？

答：通过 ExtensionContainer

### 2）、通过 ExtensionContainer 自定义 Extension

ExtensionContainer 和 TaskContainer 很类似，上篇文章我们讲到 TaskContainer 就是管理 Task 的一个容器，我们可以通过 TaskContainer 去对 Task 进行相应的操作。同理，ExtensionContainer 是管理 Extension 的一个容器，我们可以通过 ExtensionContainer 去对 Extension 进行相应的操作，ExtensionContainer 同样可以通过 Project 对象获取到：

```groovy
//当前在 app 的 build.gradle 文件中

//下面这 4 种方式拿到的都是同一个实例
//方式1
extensions
//方式2
project.extensions
//方式3
getExtensions()
//方式4
project.getExtensions()
```

通过 ExtensionContainer 创建扩展的方式有两种：

1、通过 ExtensionContainer 的 create 系列方法创建 Extension

2、通过 ExtensionContainer 的 add 系列方法创建 Extension

### 3）、通过 ExtensionContainer 的 create 系列方法创建 Extension

首先看一眼 ExtensionContainer 提供的 create 系列方法：

![image-20210725182159725](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281617798.png)

上述截图可以看到它有三个重载方法，我们一一介绍下

#### 1、第一个重载方法

**参数介绍：**

> s：要创建的 Extension 的名字，可以是任意符合命名规则的字符串，不能与已有的重复，否则会抛异常
>
> aClass：该 Extension 的 Class 类型对象
>
> objects：当前类的构造函数参数值，该参数为可选项，不填则取默认值

#### 2、第二个重载方法

**参数介绍：**

> aClass：创建的 Extension 实例暴露出来的 Class 类型对象，一般这里我们会指定父类的 Class 类型对象
>
> s：要创建的 Extension 的名字，可以是任意符合命名规则的字符串，不能与已有的重复，否则会抛异常
>
> aClass1：该 Extension 具体的实现 Class 类型对象
>
> objects：具体实现类的构造函数参数值，该参数为可选项，不填则取默认值

#### 3、第三个重载方法

**参数介绍：**

> typeOf：创建的 Extension 实例暴露出来的 TypeOf 类型对象，一般这里我们会指定父类的 TypeOf 类型对象
>
> s：要创建的 Extension 的名字，可以是任意符合命名规则的字符串，不能与已有的重复，否则会抛异常
>
> aClass：该 Extension 具体的实现 Class 类型对象
>
> objects：具体实现类的构造函数参数值，该参数为可选项，不填则取默认值

#### 4、具体使用

```groovy
//当前在 app 的 build.gradle 文件中

//第一步：增加实体类配置
class Animal{

    String animalName
    int legs

    Animal(){

    }

    Animal(String animalName) {
        this.animalName = animalName
    }

    String toString() {
        return "This animal is $animalName, it has $legs legs."
    }
}

class Dog extends Animal{
    int age = 5

    Dog(){
      
    }

    Dog(int age) {
        this.age = age
    }

    String toString() {
        return super.toString() + " Its age is $age."
    }
}

//第二步：创建 Extension
//=================== ExtensionContainer create 第一个重载方法 =========================
project.extensions.create('animal1',Dog)

//=================== ExtensionContainer create 第二个重载方法 =========================
project.extensions.create(Animal,'animal2',Dog,10)

//=================== ExtensionContainer create 第三个重载方法 =========================
project.extensions.create(TypeOf.typeOf(Animal),'animal3',Dog,15)

//第三步：进行语句块配置
animal1{
    animalName '大黄'
    legs 4
}

animal2{
    animalName '二黄'
    legs 4
}

animal3{
    animalName '三黄'
    legs 4
}

//第四步：编写 Task 进行测试
project.task('testTask'){
    doLast {
        println project.animal1
        println project.animal2
        println project.animal3
    }
}

//执行 testTask
./gradlew testTask

//打印结果
> Task :app:testTask
This animal is 大黄, it has 4 legs. Its age is 5.
This animal is 二黄, it has 4 legs. Its age is 10.
This animal is 三黄, it has 4 legs. Its age is 15.
```

**注意：** Groovy 语法规定，当传入 Class 对象作为参数的时候，`.class` 后缀可省略，如：`Animal.class` 可以写成 `Animal`，对 Groovy 语法还不熟的可以查看我这篇文章 [传送门](https://juejin.cn/post/6939662617224937503)

### 4）、通过 ExtensionContainer 的 add 系列方法创建 Extension

首先还是先看一眼 ExtensionContainer 提供的 add 系列方法：

![image-20210725181835083](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281618781.png)

可以看到它也有三个重载方法，我们一一介绍下

#### 1、第一个重载方法

**参数介绍：**

> s：要创建的 Extension 的名字，可以是任意符合命名规则的字符串，不能与已有的重复，否则会抛异常
>
> o：Object 类型，可以是实例对象或 Class 对象

#### 2、第二个重载方法

**参数介绍：**

> aClass：创建的 Extension 实例暴露出来的 Class 类型对象，一般这里我们会指定父类的 Class 类型对象
>
> s：要创建的 Extension 的名字，可以是任意符合命名规则的字符串，不能与已有的重复，否则会抛异常
>
> t：Object 类型，具体的 Class 对象或实例对象

#### 3、第三个重载方法

**参数介绍：**

> typeOf：创建的 Extension 实例暴露出来的 TypeOf 类型对象，一般这里我们会指定父类的 TypeOf 类型对象
>
> s：要创建的 Extension 的名字，可以是任意符合命名规则的字符串，不能与已有的重复，否则会抛异常
>
> t：Object 类型，具体的 Class 对象或实例对象

#### 4、具体使用

我们修改上述代码的第二步和第三步实现与之前一样的打印效果

```groovy
//当前在 app 的 build.gradle 文件中

//=================== ExtensionContainer add 第一个重载方法 =========================
project.extensions.add('animal1',Dog)

//=================== ExtensionContainer add 第二个重载方法 =========================
project.extensions.add(Animal,'animal2',new Dog(10))

//=================== ExtensionContainer add 第三个重载方法 =========================
project.extensions.add(TypeOf.typeOf(Animal),'animal3',new Dog(15))

animal1{
    animalName '大黄'
    legs 4
}

//注意这里使用了 = 号
animal2{
    animalName = '二黄'
    legs = 4
}

//注意这里使用了 = 号
animal3{
    animalName = '三黄'
    legs = 4
}
```

**注意：** 上述 add 系列第二个和第三个重载方法，当我们显示的创建了类实例，那么在进行 Extension 配置的时候，需要加上 **=** 号，否则会报错

### 5）、定义属性同名的方法去掉 = 号

如果想去掉上述使用 add 系列第二个和第三个重载方法配置语句的 **=** 号，我们可以定义和属性同名的方法，如下：

```groovy
class Animal{

    String animalName
    int legs

    void animalName(String animalName){
        this.animalName = animalName
    }

    void legs(int legs){
        this.legs = legs
    }
    //...
}

//那么这个时候就可以这样写了
animal2{
    animalName '二黄'
    legs 4
}

animal3{
    animalName = '三黄'
    legs = 4
}
```

### 6）、create 系列方法和 add 系列方法比较

#### 相同点：

> 1、都可以通过键值对的方式进行配置，也可以使用 **=** 进行配置，最终调用的都是属性的 setter 方法
>
> 2、都会抛异常：当需要创建的 Extension 已经存在的时候，即 Extension 重复，则会抛异常

#### 不同点：

> 1、create 系列方法会将传入的泛型 T 作为返回值。add 系列方法并不会
>
> 2、add 系列第二个和第三个重载方法，当我们显示的创建了类实例，在进行 Extension 配置的时候需加上 **=** ，create 系列方法不需要

### 7）、通过 ExtensionContainer getByName 和 findByName 系列方法查找 Extension

```groovy
//1、find 系列方法
Object findByName(String name)
<T> T findByType(Class<T> type)

//2、get 系列方法
Object getByName(String name)
<T> T getByType(Class<T> type)

//3、find 系列方法和 get 系列方法区别
//get 系列方法找不到会抛异常，find 系列方法不会

//4、具体使用
println project.extensions.getByName("animal1")
println project.extensions.getByName("animal2")
println project.extensions.getByName("animal3")

println project.extensions.findByName("animal1")
println project.extensions.findByName("animal2")
println project.extensions.findByName("animal3")

//打印结果均为
This animal is 大黄, it has 4 legs. Its age is 5.
This animal is 二黄, it has 4 legs. Its age is 10.
This animal is 三黄, it has 4 legs. Its age is 15.
```

### 8）、配置嵌套 Extension

##### 1、通过定义方法配置嵌套 Extension

我们经常在 android 配置块看到这种嵌套 Extension ，如下：

```groovy
android {
    compileSdkVersion 30
    defaultConfig {
        applicationId 'com.dream.gradledemo'
        minSdkVersion 19
        targetSdkVersion 30
        versionCode 1
        versionName '1.0'
    }
    //...
}
```

我们实现一个类似的：

```groovy
//当前在 app 的 build.gradle 文件中

//第一步：增加实体类配置
class AndroidExt{
    int compileSdkVersionExt

    DefaultConfigExt defaultConfigExt = new DefaultConfigExt()

    /**
     * 方式1:
     * 通过 Action 创建内部 Extension，名称为方法名 defaultConfig
     *
     * @param action 可执行的动作，实质上是一个代码块
     */
    void defaultConfigExt(Action<DefaultConfigExt> action) {
        action.execute(defaultConfigExt)
    }

    /**
     * 方式2:
     * 通过 ConfigureUtil 创建内部 Extension，名称为方法名 defaultConfig
     *
     * @param closure 闭包，实质上是一个代码块
     */
    void defaultConfigExt(Closure<DefaultConfigExt> closure) {
        org.gradle.util.ConfigureUtil.configure(closure, defaultConfigExt)
    }

}

class DefaultConfigExt{
    String applicationIdExt
    int minSdkVersionExt
    int targetSdkVersionExt
    int versionCodeExt
    String versionNameExt
}

//第二步：创建 Extension
project.extensions.create('androidExt',AndroidExt)

//第三步：进行语句块配置
androidExt {
    compileSdkVersionExt 30
    defaultConfigExt {
        applicationIdExt = 'com.dream.gradledemo'
        minSdkVersionExt = 19
        targetSdkVersionExt = 30
        versionCodeExt = 1
        versionNameExt = '1.0'
    }
}

//第四步：编写 Task 进行测试
project.tasks.create('extensionNested'){
    doLast {
        println project.androidExt.compileSdkVersionExt
        println project.androidExt.defaultConfigExt.applicationIdExt
        println project.androidExt.defaultConfigExt.minSdkVersionExt
        println project.androidExt.defaultConfigExt.targetSdkVersionExt
        println project.androidExt.defaultConfigExt.versionCodeExt
        println project.androidExt.defaultConfigExt.versionNameExt
    }
}

//执行 extensionNested
./gradlew extensionNested

//打印结果
> Task :app:extensionNested
30
com.dream.gradledemo
19
30
1
1.0
```

上述代码我们实现了一个和 android 配置块类似的配置，关键代码在于：

```groovy
DefaultConfigExt defaultConfigExt = new DefaultConfigExt()

/**
 * 方式1:
 * 通过 Action 创建内部 Extension，名称为方法名 defaultConfig
 *
 * @param action 可执行的动作，实质上是一个代码块
 */
void defaultConfigExt(Action<DefaultConfigExt> action) {
    action.execute(defaultConfigExt)
}

/**
 * 方式2:
 * 通过 ConfigureUtil 创建内部 Extension，名称为方法名 defaultConfig
 *
 * @param closure 闭包，实质上是一个代码块
 */
void defaultConfigExt(Closure<DefaultConfigExt> closure) {
    org.gradle.util.ConfigureUtil.configure(closure, defaultConfigExt)
}
```

上面俩个方法是用来创建内部 Extension，实际使用只需要其中一个方法就行，**需要注意的是方法的名字尽量和属性的名字保持一致**

不知你有没有发现，上述我的 defaultConfigExt 配置块中都加了 **=** 号，它和我们实际的 android 配置块还是有点区别，可能你会问，我能不能把 **=** 号给去掉呢？

答：不能。如果想去掉：

1、使用 ExtensionContainer 系列 API 创建嵌套 Extension

2、创建与属性同名的方法

创建与属性同名的方法已经演示过，我们主要演示一下使用 ExtensionContainer 系列 API 创建嵌套 Extension

##### 2、通过 ExtensionContainer 系列创建 Extension API 配置嵌套 Extension

通过 ExtensionContainer 创建 Extension 我们都讲过了，这里直接上代码：

```groovy
class AndroidExt{
    int compileSdkVersionExt
  
    AndroidExt(){
      	//注意：这里的 extensions 是属于 AndroidExt 的，并不是 project 对象的
        extensions.create('defaultConfigExt',DefaultConfigExt)
    }
}


extensions.create('defaultConfigExt',DefaultConfigExt)
//上面这句配置等同于下面
project.extensions.create('androidExt',AndroidExt)
project.androidExt.extensions.create('defaultConfigExt',DefaultConfigExt)
```

上述代码在 AndroidExt 的构造方法里面创建了一个 DefaultConfigExt 的扩展，这样就能实现把 defaultConfigExt 配置块中的 **=** 给去掉

### 9）、配置不固定数量 Extension

我们经常在 android 配置块看到这种不固定数量的 Extension ，如下：

```groovy
buildTypes {
    release {
        //开启混淆
        minifyEnabled true
        //资源对齐
        zipAlignEnabled true
        //是否开启 debug 模式
        debuggable false
        //...
    }
    debug {
        minifyEnabled false
        zipAlignEnabled false
        debuggable true
        //...
    }
}
```

这种类型可以用于在代码块中创建新的指定类型的对象。

先来看一下 buildTypes 对应的源码：

```groovy
public void buildTypes(Action<? super NamedDomainObjectContainer<BuildType>> action) {
    this.checkWritability();
    action.execute(this.buildTypes);
}
```

它传入的是一个 BuildType 类型列表的 Action，其中可以看到 NamedDomainObjectContainer ，这个东西很重要，我们来介绍一下它

##### 1、NamedDomainObjectContainer 介绍

NamedDomainObjectContainer 中文翻译即命名领域对象容器，追根溯源它继承自 `Collection<T>`。它的作用是在脚本文件中创建对象，且创建的对象必须要有 name 这个属性作为容器内元素的标识，我们可以通过 Project 对象的 container 系列方法获取 NamedDomainObjectContainer 对象：

![image-20210725223142994](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281618669.png)

下面我们来实现一个 buildTypes 配置块类似的配置

##### 2、类似 buildTypes 配置块多 Extension 实现

```groovy
//当前在 app 的 build.gradle 中

//第一步：增加实体类配置
class BuildTypesConfigExt{
    //注意：必须要有 name 属性进行标识
    String name
    boolean minifyEnabledExt
    boolean zipAlignEnabled
    boolean debuggableExt

    BuildTypesConfigExt(String name) {
        this.name = name
    }
		
    //=====================配置与属性同名的方法================
    void minifyEnabledExt(boolean minifyEnabledExt) {
        this.minifyEnabledExt = minifyEnabledExt
    }

    void zipAlignEnabled(boolean zipAlignEnabled) {
        this.zipAlignEnabled = zipAlignEnabled
    }

    void debuggableExt(boolean debuggableExt) {
        this.debuggableExt = debuggableExt
    }
}

//第二步：构建命名领域对象容器，并添加到 Extension
NamedDomainObjectContainer<BuildTypesConfigExt> container = project.container(BuildTypesConfigExt)
project.extensions.add('buildTypesExt',container)

//第三步：进行语句块配置
buildTypesExt {
    release {
        minifyEnabledExt true
        zipAlignEnabled true
        debuggableExt false
    }

    debug {
        minifyEnabledExt false
        zipAlignEnabled false
        debuggableExt true
    }
}

//第四步：编写 Task 进行测试
project.tasks.create("buildTypesTask"){
    doLast {
        project.buildTypesExt.each{
            println "$it.name: $it.minifyEnabledExt $it.zipAlignEnabled $it.debuggableExt"
        }
    }
}

//执行 buildTypesTask
./gradlew buildTypesTask

//打印结果
> Task :app:buildTypesTask
debug: false false true
release: true true false
```

到这里，关于 Extension 我们就介绍完了，接下来我们介绍一下变体（Variants）

## 三、变体 (Variants) 介绍

变体属于 Android Gradle Plugin（后续统称 AGP） 里面需要介绍的知识点，后续等我们讲到  AGP 的时候在做详细介绍。这里暂时先介绍一些接下来会用到的

 AGP 给 android 对象提供了三种类型变体（Variants）：

> 1、applicationVariants：只适用于 app plugin
>
> 2、libraryVariants：只适用于 library plugin
>
> 3、testVariants：在 app plugin 与 libarary plugin 中都适用，这个一般很少用

其中我们最常用的便是 applicationVariants，我们来介绍一下它

### 1）、applicationVariants 使用

我们可以通过 Project 对象获取 android 这个属性，然后通过 android 在去获取变体如下：

```groovy
//当前在 app 的 build.gradle 文件中
//方式1
android.applicationVariants
//方式2
project.android.applicationVariants
//方式3
project.property('android').applicationVariants
```

上述 3 种方式获取的都是同一个变体

为了更好的演示，我们在 app 的 build.gradle 增加如下内容：

```groovy
android {
    //...

    buildTypes {
        debug{

        }

        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }



    productFlavors{

        flavorDimensions 'isFree'

        baidu{
            dimension 'isFree'
        }

        google{
            dimension 'isFree'
        }

        winxin{
            dimension 'isFree'
        }
    }
}
```

上述配置会产生 6 个变体，**实际上变体是通过 buildTypes 和 productFlavors 的排列组合所产生的**，我们遍历打印一下每个变体的 name 和 baseName

**注意**：

1、从 AGP 3.0 开始，必须至少明确指定一个 flavor dimension

2、通过 android 对象获取的 applicationVariants 或 libraryVariants 是所有的变体，我们可以通过遍历取出每一个变体

3、关于变体能够操作的属性和方法，大家可以去查阅 AGP 官方文档，这里提供一个中文版的，[传送门](https://chaosleong.gitbooks.io/gradle-for-android/content/advanced_build_customization/manipulating_tasks.html)

```groovy
//当前在 app 的 build.gradle 文件中
afterEvaluate {
    project.android.applicationVariants.all{ variant ->
        println "$variant.name $variant.baseName"
    }
}
//打印结果
> Configure project :app
baiduDebug baidu-debug
googleDebug google-debug
winxinDebug winxin-debug
baiduRelease baidu-release
googleRelease google-release
winxinRelease winxin-release
```

从上面我们就能看到 name 和 baseName 的一个区别

### 2）、对 applicationVariants 中的 Task 进行 Hook

通常我们会使用变体来对构建过程中的 Task 进行 hook，如下：

```groovy
//当前在 app 的 build.gradle 文件中
afterEvaluate {
    project.android.applicationVariants.all{ variant ->
        def task = variant.mergeResources
        println "$task.name"
    }
}


//打印结果
> Configure project :app
mergeBaiduDebugResources
mergeGoogleDebugResources
mergeWinxinDebugResources
mergeBaiduReleaseResources
mergeGoogleReleaseResources
mergeWinxinReleaseResources
```

上述操作我们拿到了所有变体对应的 mergeResources Task 并打印了它的名称

### 3）、使用 applicationVariants 对 APK 进行重命名

applicationVariants 中每一个变体对应的输出文件便是一个 APK，因此我们可以通过 applicationVariants 对 APK 进行重命名，如下：

```groovy
//当前在 app 的 build.gradle 文件中

project.android.applicationVariants.all{ variant ->
    variant.outputs.all{
        outputFileName = "${variant.baseName}" + ".apk"
        println outputFileName
    }
}

//打印结果
> Configure project :app
baidu-debug.apk
google-debug.apk
winxin-debug.apk
baidu-release.apk
google-release.apk
winxin-release.apk
```

关于变体我们暂时就介绍到这

## 四、获取 App 中所有 Xml 控件实战应用

Ok，了解了 Extension 和 Variants ，接下来我们正式进入 Gradle 插件实战应用，关于如何自定义 Gradle 插件，参考我的上一篇文章[传送门](https://juejin.cn/post/6988051489306443789)，一些细节我们就略过了

### 1）、思路分析

在 Android 打包构建流程中，`merge...Resources` 这个 Task 会对所有的资源文件进行合并，而 `merge...Resources` 中间的 `...` 会根据变体的不同而变化，同时对输出的文件目录也有一定的影响，例如：

1、如果当前运行的是 debug 环境，那么变体即 debug，在 Android 打包构建流程中，就会通过 **mergeDebugResources** 这个 Task 对所有的资源进行合并，并将合并的文件输出到：/build/intermediates/incremental/mergeDebugResources/merger.xml

2、如果当前运行的是 release 环境，那么变体即 release，在 Android 打包构建流程中，就会通过 **mergeReleaseResources** 这个 Task 对所有的资源进行合并，并将合并的文件输出到：/build/intermediates/incremental/mergeReleaseResources/merger.xml

那么我们是否可以：**自定义 Gradle 插件，将自己编写的 Task 挂接到 merge...Resources 后面，然后遍历 merger.xml 这个文件，把它里面所有 Xml 中的 View 输出到一个 .txt 文件中**

嗯，感觉可行，干就完了

### 2）、实战应用

首先看一眼初始状态下，我们的项目结构：

![init_plugin_constructor](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281618367.png)

#### 1、第一步：自定义插件，将自定义 Task 挂接到  merge...Resources

```groovy
package com.dream.xmlviewscanplugin

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.Task

/**
 * 扫描 Xml Plugin
 */
class XmlViewScanPlugin implements Plugin<Project>{

    @Override
    void apply(Project project) {
        println 'Hello XmlViewScanPlugin'
        //添加黑名单扩展配置
        project.extensions.create('ignore',IgnoreViewExtension)

        project.afterEvaluate {
            //是否是 Android 插件
            def isAppPlugin = project.plugins.hasPlugin('com.android.application')

            //获取变体
            def variants
            if(isAppPlugin){
                variants = project.android.applicationVariants
            }else {
                variants = project.android.libraryVariants
            }

            variants.each{ variant ->
                //通过变体获取对应的 merge...Resources
                Task mergeResourcesTask = variant.mergeResources

                //定义自定义 Task 扩展前缀
                def prefix = variant.name
                //获取我们自定义的 Task
                Task xmlViewScanTask = project.tasks.create("${prefix}XmlViewScanTask", XmlViewScanTask,variant)

                //将我们自定义的 Task 挂接到 mergeResourcesTask
                mergeResourcesTask.finalizedBy(xmlViewScanTask)
            }
        }
    }
}
```

#### 2、第二步：编写自定义 Task ，将扫描出来的控件写入到文件中

```groovy
package com.dream.xmlviewscanplugin

import com.android.build.gradle.api.BaseVariant
import groovy.util.slurpersupport.GPathResult
import groovy.util.slurpersupport.Node
import org.gradle.api.DefaultTask
import org.gradle.api.Task
import org.gradle.api.tasks.TaskAction
import javax.inject.Inject
import java.util.function.Consumer
import java.util.function.Predicate
import java.util.stream.Stream

/**
 * 扫描 Xml Task
 */
class XmlViewScanTask extends DefaultTask {

    /**
     * Xml 布局中被添加进来的 View
     */
    private Set<String> mXmlScanViewSet = new HashSet<>()
    /**
     * 当前变体
     */
    private BaseVariant variant

    @Inject
    XmlViewScanTask(BaseVariant variant) {
        this.variant = variant
    }


    /**
     * 执行 xml 扫描 Task
     */
    @TaskAction
    void performXmlScanTask() {
        try {
            println 'performXmlScanTask start...'

            //创建需要输出 View 的文件路径
            File outputFile = new File(project.buildDir.path + "/${variant.name}_xml_scan_view/xml_scan_view.txt")
            if (!outputFile.parentFile.exists()) {
                outputFile.parentFile.mkdirs()
            }
            if (outputFile.exists()) {
                outputFile.delete()
            }
            outputFile.createNewFile()
            println 'file create success...'
            mXmlScanViewSet.clear()

            //获取 merger.xml 文件
            Task mergeResourcesTask = variant.mergeResources
            String mergerPath = "${project.buildDir.path}/intermediates/incremental/${mergeResourcesTask.name}/merger.xml"
            File mergerFile = new File(mergerPath)

            //开始解析  merger.xml
            XmlSlurper xmlSlurper = new XmlSlurper()
            GPathResult result = xmlSlurper.parse(mergerFile)
            if (result.children()) {
                result.childNodes().forEachRemaining(new Consumer() {
                    @Override
                    void accept(Object o) {
                        parseNode(o)
                    }
                })
            }
            println 'merger.xml parsing success...'


            //到这里，所有的 xml 控件都被添加到了mXmScanViewSet
            //接下来我们就需要读取黑名单中的 View 并给过滤掉
            Stream<String> viewNameStream
            //是否开启黑名单过滤功能
            if(project.ignore.isEnable){
                println 'blacklist enable...'
                viewNameStream = filterXmlScanViewSet()

                //如果此时没有配置黑名单 viewNameStream 还是会为 null
                if(viewNameStream == null){
                    viewNameStream = mXmlScanViewSet.stream()
                }
            }else {
                println 'blacklist disable...'
                viewNameStream = mXmlScanViewSet.stream()
            }

            //将 viewName 写入文件中
            PrintWriter printWriter = new PrintWriter(new FileWriter(outputFile))
            viewNameStream.forEach(new Consumer<String>() {
                @Override
                void accept(String viewName) {
                    printWriter.println(viewName)
                }
            })
            printWriter.flush()
            printWriter.close()
            println 'write all viewName to file success...'
        } catch (Exception e) {
            e.printStackTrace()
        }
    }

    /**
     * 过滤黑名单中的 viewName
     * @return Stream<String>
     */
    private Stream<String> filterXmlScanViewSet() {
        List<String> ignoreViewList = project.ignore.ignoreViewList
        Stream<String> viewNameStream = null
        if (ignoreViewList) {
            println "ignoreViewList: $ignoreViewList"
            viewNameStream = mXmlScanViewSet.stream().filter(new Predicate<String>() {
                @Override
                boolean test(String viewName) {
                    for (String ignoreViewName : ignoreViewList) {
                        if (viewName == ignoreViewName) {
                            return false
                        }
                    }
                    return true
                }
            })
        }else {
            println 'ignoreViewList is null, no filter...'
        }
        return viewNameStream
    }


    /**
     * 递归解析 merger.xml 中的 Node 节点
     * 
     * merger.xml 文件中的布局文件标签如下：
     * <file name="activity_main"
     *       path="/Users/zhouying/learning/GradleDemo/app/src/main/res/layout/activity_main.xml"
     *       qualifiers=""
     *       type="layout"/>
     */
    private void parseNode(Object obj) {
        if (obj instanceof Node) {
            Node node = obj

            if (node) {
                if ("file" == node.name() && "layout" == node.attributes().get("type")) {
                    //获取布局文件
                    String layoutPath = node.attributes().get("path")
                    File layoutFile = new File(layoutPath)

                    //开始解析布局文件
                    XmlSlurper xmlSlurper = new XmlSlurper()
                    GPathResult result = xmlSlurper.parse(layoutFile)
                    String viewName = result.name()
                    mXmlScanViewSet.add(viewName)

                    if (result.children()) {
                        result.childNodes().forEachRemaining(new Consumer() {
                            @Override
                            void accept(Object o) {
                              	//递归解析子节点
                                parseLayoutNode(o)
                            }
                        })
                    }
                } else {
                    //如果不是布局文件，递归调用
                    node.childNodes().forEachRemaining(new Consumer() {
                        @Override
                        void accept(Object o) {
                            parseNode(o)
                        }
                    })

                }
            }
        }
    }


    /**
     * 递归解析 layout 布局子节点
     */
    private void parseLayoutNode(Object obj) {
        if (obj instanceof Node) {
            Node node = obj
            if (node) {
                mXmlScanViewSet.add(node.name())
                node.childNodes().findAll {
                    parseLayoutNode(it)
                }
            }
        }
    }

}
```

**注意：** 

1、上述这种通过创建一个类自定义 Task 方式，构造方法必须使用 ` @javax.inject.Inject` 注解标识，如果属性没有使用 `private`修饰符修饰，也需要使用 ` @javax.inject.Inject` 注解标识，否则 Gradle 会报错

2、自定义一个方法，方法名随意取，然后使用 `@TaskAction` 注解标识，那么这个方法就会在 Gradle 的执行阶段去执行

3、使用一些类时，注意包名别导错了

#### 3、第三步：将插件发布到本地仓库进行引用

```groovy
//1、执行发布插件的 Task 或通过 Gradle 可视化界面进行发布

//2、插件依赖引用
//根 build.gradle 中
buildscript {
    repositories {
      	//...
        //本地 Maven 仓库
        maven{
            url uri('XmlViewScanPlugin')
        }
    }
    dependencies {
      	//...
        //引入插件依赖
        classpath 'com.dream:xmlviewscanplugin:1.0.2'
    }
}

//app build.gradle 中
apply plugin: 'XmlViewScanPlugin'
```

经过上面 3 步之后，我们就可以进行一个效果验证了

#### 4、效果验证

1、先看一下我们的布局文件 activity_main.xml：

![image-20210728130458228](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281618417.png)

2、接下来运行项目看一下我们的 view 是否被输出到 `.txt`文件中

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281618708.png" alt="image-20210728130807224" style="zoom:50%;" />

上述截图可以看到，所有的 View 被输出到了`.txt`文件中。接下来我们在验证一下黑名单功能

3、在 app 的 build.gradle 添加黑名单配置

```groovy
ignore {
    ignoreViewList = [
            'TextView'
    ]
}
```

我们把 TextView 加入了黑名单，运行项目，可以看到我们生成的 `.txt`文件没有 TextView 了

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281619857.png" alt="image-20210728141118681" style="zoom:50%;" />

至此，关于 Gradle 插件实战应用就讲完了

## 五、总结

本篇文章讲的一些重点内容：

1、Extension 的详细介绍，重点掌握：

> 1、定义 Extension 的几种方法，参数区别
>
> 2、如何定义 Extension 能够去掉 = 号
>
> 3、如何定义嵌套 Extension 和 多个不固定数量的 Extension

2、通过变体对构建流程中的 Task 进行 Hook

3、自定义 Gradle 插件将所有 Xml 中的 View 输出到一个`.txt`文件中

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝 

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会讲自定义 Gradle Transform，敬请期待吧😄

### 参考和推荐

[深度探索 Gradle 自动化构建技术（四、自定义 Gradle 插件)](https://juejin.cn/post/6844904135314128903)

[Android Gradle学习(五)：Extension详解](https://www.jianshu.com/p/58d86b4c0ee5)

[Gradle 创建扩展属性详解](https://juejin.cn/post/6986806041618939917)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
