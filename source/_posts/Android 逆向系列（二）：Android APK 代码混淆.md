---
title: Android 逆向系列（二）：Android APK 代码混淆
date: 2022-10-30 23:53:23
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281522332.jpeg
tags:
- 原创
- Android
- Android 逆向
- 反编译
categories:
- Android
- Android 逆向
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281522332.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们讲了：

> 1、使用 apktool 反编译 app 中的资源
>
> 2、使用 dex2jar + jd-gui 反编译 app 中的代码
>
> 3、基于一个 app 打造一个新的 app，主要通过 apktool 反编译后，修改资源，然后进行重新打包，签名，对齐，最后安装展示了预期的效果。当然这里你有能力看懂 `.smali`格式的代码，那么你可以做的事情就更加多

还没有看过上一篇的朋友，建议先去阅读[Android 逆向系列（一）：反编译 APK 技术完全解析](https://juejin.cn/post/7158107697907236878) 

你能攻击我的 app，那我肯定有防守的策略，接下来我们介绍一下 Android 中的混淆技术

**注意**：下面演示均是在 mac 下进行

Github Demo 地址：https://github.com/sweetying520/codeandnotes/tree/master/Reverse/AndroidReverseDemo

## 一、jadx 介绍

在此之前，我想介绍另外一款反编译工具：jadx，它相当于是 apktool + dex2jar + jd-gui 的结合体，既能反编译代码也能反编译资源，关键使用起来还特别简单，你只需要将文件拖进来即可，一定程度上提高了我们的开发效率

Github 地址：https://github.com/skylot/jadx

### 1.1、jadx 特点

1、能将 APK，AAR，JAR，DEX，AAB，ZIP 等文件中的代码反编译为 Java 类

2、能反编译 APK，AAR，AAB，ZIP 中的资源

### 1.2、jadx 安装

1、安装 jadx，推荐使用 brew 去安装，执行如下命令：

```shell
brew install jadx
```

使用 brew 安装的好处就是 mac 会给你自动配置好环境变量，你只需要专注软件的使用即可，等待安装完成在验证一下

2、jadx 验证

在 Terminal 输入如下命令：

```shell
jadx --version
```

如果打印出了版本号就证明安装成功了：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281522547.png" alt="image-20221120114904120.png" width="100%" />

### 1.3、jadx 使用

这里我们直接使用 jadx 提供的可视化界面进行操作

1、在 Terminal 输入如下命令：

```shell
jadx-gui
```

此时就会打开 jadx 的可视化界面了：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281522032.png" alt="image-20221120115550128.png" width="100%" />

2、将你需要反编译的文件拖入即可查看反编译的代码和资源了，如下图：


![image-20221120120509515.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281522702.png)

## 二、混淆 APK 代码

### 2.1、准备工作

首先我们先做一些准备工作

1、添加一些类：

```java
//1、新建 Utils.java 文件，创建 Utils 类
public class Utils {

    public void methodNormal(){
        String logMessage = "this is normal method";
        logMessage = logMessage.toLowerCase();
        System.out.println(logMessage);
    }

    public void methodUnused(){
        String logMessage = "this is unused method";
        logMessage = logMessage.toLowerCase();
        System.out.println(logMessage);
    }
}

//2、新建 NativeUtils.java 文件，创建 NativeUtils 类
public class NativeUtils {

    public static native void methodNative();

    public static void methodNotNative(){
        String logMessage = "this is not native method";
        logMessage = logMessage.toLowerCase();
        System.out.println(logMessage);
    }
}

//3、新建 MyFragment.java 文件，创建 MyFragment 类
public class MyFragment extends Fragment {

    private String toastTips = "toast in MyFragment";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_layout,container,false);
        methodWithGlobalVariable();
        methodWithLocalVariable();
        return rootView;
    }

    private void methodWithGlobalVariable() {
        Toast.makeText(getActivity(), toastTips, Toast.LENGTH_SHORT).show();
    }

    private void methodWithLocalVariable() {
        String logMessage = "log in MyFragment";
        logMessage = logMessage.toLowerCase();
        System.out.println(logMessage);
    }
}
```

2、接着在 MainActivity 中进行引用

```java
public class MainActivity extends AppCompatActivity {

    String toastTips = "toast in MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getSupportFragmentManager().beginTransaction().add(R.id.flFragmentContainer,new MyFragment()).commit();
        //1、Utils 下的方法调用
        Utils utils = new Utils();
        utils.methodNormal();
        //2、NativeUtils 下的方法调用
        try {
            NativeUtils.methodNative();
            NativeUtils.methodNotNative();
        } catch (Throwable e) {
            e.printStackTrace();
        }
        //3、第三方库下工具类的方法调用
        int result = StringUtils.getLength("erdai666");
        System.out.println(result);
        //4、MainActivity 下的 methodWithGlobalVariable 方法调用
        methodWithGlobalVariable();
        //5、MainActivity 下的 methodWithLocalVariable 方法调用
        methodWithLocalVariable();
    }

    private void methodWithGlobalVariable() {
        Toast.makeText(this, toastTips, Toast.LENGTH_SHORT).show();
    }

    private void methodWithLocalVariable() {
        String logMessage = "log in MainActivity";
        logMessage = logMessage.toLowerCase();
        System.out.println(logMessage);
    }
}
```

好的，到这里准备工作已经基本完成，接下来我们对 APK 中的代码进行混淆

### 2.2、开启混淆打 APK 包

1、在 app 的 build.gradle 文件中的 android 闭包下 的 release 闭包中开启代码混淆：

```groovy
android {
    buildTypes {
        release {
            //开启代码混淆
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

上述我们仅是把 minifyEnabled 改为 true 即开启了代码混淆，非常的简单

**另外需要注意**： 这里是在 release 闭包内进行配置的，因此只有打出正式版的 APK 才会进行混淆，debug 版的 APK 是不会混淆的。当然这也是非常合理的，因为 debug 版的 APK 文件我们只会用来内部测试，不用担心被人破解。

2、接下来打一个正式的 APK 包

>  1、在 Android Studio 导航栏中点击 Build -> Generate Signed Bundle or APK，选择 APK
>
>  2、然后选择签名文件并输入密码，如果没有签名文件就创建一个
>
>  3、点击 next 选择打 release 包，最终点击 Finish 完成打包
>
>  4、生成的 APK 会自动存放在 app/release/ 目录下

**Tips**： 我们可以在 app 的 build.gradle 文件中添加签名文件配置，后续就可以直接通过 `./gradlew assembleRelease` 命令或者 AndroidStudio 右侧的 Gradle 可视化界面去操作：

```groovy
android {
    //1、声明签名文件
    signingConfigs{
        release{
            storeFile file('../Certificate')
            storePassword 'erdai666'
            keyAlias 'key0'
            keyPassword 'erdai666'
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            //2、配置签名文件
            signingConfig signingConfigs.release
        }
    }
}
```

**需要注意**：

1、使用 AndroidStudio 导航栏 Generate Signed Bundle or APK 方式生成的 APK 在：app/release/ 目录下

2、使用 `./gradlew assembleRelease` 命令或者 AndroidStudio 右侧的 Gradle 可视化界生成的 APK 在：app/build/outputs/apk/ 目录下

3、接着使用 jadx 打开当前 APK，如下图所示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523156.png" alt="image-20221120155231247.png" width="50%" />

很明显我们代码混淆的功能已经生效了。

### 2.3、混淆文件介绍

下面我们尝试来阅读一下混淆后之前准备的那些类：

**MainActivity**：

![image-20221120155602155.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523150.png)

可以看到：

1、MyFragment 被混淆了

2、Utils 下的方法调用：直接是把方法里面的内容拷贝到了方法的调用处

3、NativeUtils 下的方法调用：1、Native 方法还是正常的调用 2、非 Native 方法则是把方法里面的内容拷贝到了方法的调用处

4、第三方库下工具类的方法调用：直接是将方法的结果填充到了调用处

5、MainActivity 中的成员方法：直接是把成员方法里面的内容拷贝到了方法的调用处

6、MainActivity 类名是没有混淆的，onCreate 方法也没有被混淆，但定义的成员变量，局部变量被混淆了

**Utils**：

Utils 类直接没有了

**NativeUtils**：


![image-20221120161144262.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523753.png)

可以看到：

1、NativeUtils 类名没有被混淆，其中声明成 native 的方法也没有被混淆

2、非 Native 方法直接没有了，方法的内容拷贝到了方法的调用处

**MyFragment**：

![image-20221120161641862.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523114.png)

可以看到：

1、所有的方法名，成员变量，局部变量都被混淆了

2、MyFragment 中的成员方法：直接是把成员方法里面的内容拷贝到了方法的调用处

接下来在**分析一下上面的混淆结果**：

> 1、Utils 直接没有了，因为它被调用的方法内容直接拷贝到了方法的调用处。另外一个方法没有被调用，会被认为是多余的代码，在打包的时候就给移除掉了，不仅仅是方法，没有调用的资源同样会被移除，这样的好处是可以减少 APK 的体积
>
> 2、NativeUtils 类名没有被混淆，这是由于它有一个声明成 native 的方法。只要一个类中有存在 native 方法，它的类名就不会被混淆，native 方法的方法名也不会被混淆，因为 C 或 C++ 代码要通过`包名+类名+方法名来`进行交互。 但是类中别的代码还是会被混淆，它的非 Native 方法直接没有了，因为方法里面的内容拷贝到了方法的调用处
>
> 3、MyFragment 是混淆的比较彻底的，基本没有任何保留，连生命周期方法也被混淆了，Fragment 怎么说也算是一个系统组件吧，搞的一点面子都没有😂
>
> 4、MainActivity 的保留程度就比 MyFragment 好多了，至少像类名，生命周期方法都没有被混淆，这是因为：**凡是需要在 AndroidManifest.xml 中注册的所有类的类名以及从父类重写的方法名都不会被混淆。**  因此，除了 Activity 之外，这份规则同样适用于：Service，BroadcastReceiver 和 ContentProvider
>
> 5、引入的第三方库也被混淆了，上述可以看到直接是把方法调用的结果给填充了进来

### 2.4、默认混淆规则介绍

那么这些混淆规则是在哪里定义的呢？其实就是刚才在 build.gradle 的 release 闭包下配置的 proguard-android-optimize.txt 文件，这个文件存放于`Android SDK/tools/proguard/`目录下：


![image-20221120165304203.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523422.png)

看一眼它的具体内容：

```xml
# This is a configuration file for ProGuard.
# http://proguard.sourceforge.net/index.html#manual/usage.html
#
# This file is no longer maintained and is not used by new (2.2+) versions of the
# Android plugin for Gradle. Instead, the Android plugin for Gradle generates the
# default rules at build time and stores them in the build directory.

# Optimizations: If you don't want to optimize, use the
# proguard-android.txt configuration file instead of this one, which
# turns off the optimization flags.  Adding optimization introduces
# certain risks, since for example not all optimizations performed by
# ProGuard works on all versions of Dalvik.  The following flags turn
# off various optimizations known to have issues, but the list may not
# be complete or up to date. (The "arithmetic" optimization can be
# used if you are only targeting Android 2.0 or later.)  Make sure you
# test thoroughly if you go this route.
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# The remainder of this file is identical to the non-optimized version
# of the Proguard configuration file (except that the other file has
# flags to turn off optimization).

-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

-keepattributes *Annotation*
-keep public class com.google.vending.licensing.ILicensingService
-keep public class com.android.vending.licensing.ILicensingService

# For native methods, see http://proguard.sourceforge.net/manual/examples.html#native
-keepclasseswithmembernames class * {
    native <methods>;
}

# keep setters in Views so that animations can still work.
# see http://proguard.sourceforge.net/manual/examples.html#beans
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}

# We want to keep methods in Activity that could be used in the XML attribute onClick
-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}

# For enumeration classes, see http://proguard.sourceforge.net/manual/examples.html#enumerations
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-keepclassmembers class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator CREATOR;
}

-keepclassmembers class **.R$* {
    public static <fields>;
}

# The support library contains references to newer platform versions.
# Don't warn about those in case this app is linking against an older
# platform version.  We know about them, and they are safe.
-dontwarn android.support.**

# Understand the @Keep support annotation.
-keep class android.support.annotation.Keep

-keep @android.support.annotation.Keep class * {*;}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <methods>;
}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <fields>;
}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <init>(...);
}

```

这个就是默认的混淆配置文件了，我们来逐行解释一下：

```xml
# 启动优化相关的一些配置
# 指定更精细级别的优化
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
# 表示对代码优化的次数，一般为 5
-optimizationpasses 5
# 允许改变作用域
-allowaccessmodification
# 关闭预验证
-dontpreverify

# 表示混淆时不使用大小写混合类名
-dontusemixedcaseclassnames

# 表示不跳过 library 中的非 public 类
-dontskipnonpubliclibraryclasses

# 表示打印混淆的详细信息
-verbose

#表示对注解中的参数进行保留
-keepattributes *Annotation*

# 表示不混淆如下声明的两个类，这两个类基本上也用不上，是接入 Google 原生的一些服务时使用的
-keep public class com.google.vending.licensing.ILicensingService
-keep public class com.android.vending.licensing.ILicensingService

# 表示不混淆任何包含 native 方法的类名以及 native 方法名，这个和刚才验证的结果是一致的
-keepclasseswithmembernames class * {
    native <methods>;
}
      
# 表示不混淆 View 中的 setXXX() 和 getXXX() 方法，因为属性动画需要有相应的 setter 和 getter 方法实现
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}
      
# 表示不混淆 Activity 中参数是 View 的方法，因为有这么一种用法，在 XML 中配置 android:onClick="btnClick" 属性，混淆就找
# 不到了
-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}
      
# 表示不混淆枚举的 values() 和 valueOf() 方法
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
      
# 表示不混淆 Parcelable 实现类中的 CREATOR 字段，毫无疑问，CREATOR 字段是绝对不能改变的，包括大小写都不能变，不然整个
# Parcelable 工作机制都会失效
-keepclassmembers class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator CREATOR;
}
      
# 表示不混淆 R 文件中的所有静态字段，我们都知道 R 文件是通过字段来记录每个资源 id ，字段名如果被混淆，id 就找不到了
-keepclassmembers class **.R$* {
    public static <fields>;
}
      
# 表示对 android.support 包下的代码不警告，因为 support 包中的所有代码都在兼容性上做了足够的判断，因此不用担心代码会出问题
# 所以直接忽略警告就可以了
-dontwarn android.support.**
      
# 表示不混淆 android.support.annotation.Keep 这个注解类的所有东西
-keep class android.support.annotation.Keep
      
# 表示不混淆使用了 class android.support.Keep 注解的类的所有东西
-keep @android.support.annotation.Keep class * {*;}
      
# 表示不混淆类名和类中使用了 class android.support.Keep 注解的方法
-keepclasseswithmembers class * {
    @android.support.annotation.Keep <methods>;
}
      
# 表示不混淆类名和类中使用了 class android.support.Keep 注解的属性
-keepclasseswithmembers class * {
    @android.support.annotation.Keep <fields>;
}
      
# 表示不混淆类名和类中使用了 class android.support.Keep 注解的构造方法
-keepclasseswithmembers class * {
    @android.support.annotation.Keep <init>(...);
}
```

#### 2.4.1、proguard-android-optimize.txt 和 proguard-android.txt 区别

之前一些 AGP 老版本，我们新建工程默认使用的是：proguard-android.txt，那么它和 proguard-android-optimize.txt 有啥区别呢？

从字面的维度看，就多了一个 optimize（优化）这个单词，实际就是多了优化这一部分，proguard-android-optimize.txt 相对于 proguard-android.txt 开启了优化相关的配置：

```xml
# proguard-android-optimize.txt 新增了以下优化规则
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# proguard-android-optimize.txt 删除了关闭优化指令的配置
# -dontoptimize
```

好了，上述就是 proguard-android-optimize.txt 文件中所有的默认配置，而我们混淆代码也是按照这些配置的规则来进行混淆的。经过上面的讲解，相信大家对这些配置的内容基本都能理解了。不过 Proguard 语法中还真有几处非常难理解的地方，下面和大家分享一下这些难懂的语法部分

### 2.5、Proguard 疑难语法介绍

Proguard 中一共有三组六个 keep 关键字，很多人搞不清楚他们的区别，我们通过一个表格直观的来看一下：

| 关键字                     | 描述                                                         |
| -------------------------- | ------------------------------------------------------------ |
| keep                       | 保留类和类中的成员不被混淆或移除                             |
| keepnames                  | 在 keep 的基础上，如果成员没有被引用，则会被移除             |
| keepclassmembers           | 保留类成员不被混淆或移除                                     |
| keepclassmembernames       | 在 keepclassmembers 基础上，如果成员没有被引用，则会被移除   |
| keepclasseswithmembers     | 保留类和类中的成员不被混淆或移除，前提是类中的成员必须存在，否则还是会被混淆 |
| keepclasseswithmembernames | 在 keepclasseswithmembers 基础上，如果成员没有被引用，则会被移除 |

除此之外，Proguard 的通配符也比较让人难懂，proguard-android-optimize.txt 中就使用到了很多通配符，我们来看一下它们之间的区别：

| 通配符     | 描述                                                         |
| ---------- | ------------------------------------------------------------ |
| `<field>`  | 匹配类中所有的字段                                           |
| `<method>` | 匹配类中所有的方法                                           |
| `<init>`   | 匹配类中所有的构造方法                                       |
| `*`        | 匹配任意长度字符，但不包含分隔符`.`，例如我们完成类名是：com.dream.androidreversedemo.MainActivity，使用 com.* 或者 com.dream.* 是无法匹配的，因为 * 无法匹配报名中的分隔符，正确的匹配方式是`com.dream.*.*`或者`com.dream.androidreversedemo.*` |
| `**`       | 匹配任意长度字符，包含分隔符`.`，上面匹配规则我们可以使用`com.**`或者`com.dream.**`来进行匹配 |
| `***`      | 匹配任意参数类型。例如`void set*(***)`就能匹配传入任意的参数类型，`***get(*)`就能匹配任意返回值的类型 |
| `...`      | 匹配任意长度的任意类型参数，例如`void test(...)`就能匹配`void test(String str)`或者`void test(int a,double b)`这些方法 |

ok，学习了疑难语法，下面我们来一道练习题🤔：保留实现了 com.dream.test.BaseJsonData 接口的类的所有信息不被混淆？

一个清晰的思路很重要，仔细分析一下：

1、首先我们要保证  com.dream.test.BaseJsonData 接口不被混淆

2、然后保证实现 com.dream.test.BaseJsonData 接口的类不被混淆

3、最后就是匹配类中所有的成员不被混淆，可以使用通配符 *

我们可以这么写：

```xml
# 保证  com.dream.test.BaseJsonData 接口不被混淆
-keep class com.dream.test.BaseJsonData
# 保证实现 com.dream.test.BaseJsonData 接口的类不被混淆
# 匹配类中所有的成员不被混淆，可以使用通配符 *
-keep class * implements com.dream.test.BaseJsonData{
    *;
}
```

### 2.6、自定义混淆规则

回到项目中，刚才打出的 APK 虽然已经成功混淆了，但是混淆的规则是按照 proguard-android-optimize.txt 中默认的规则来的，当然我们可以修改 proguard-android-optimize.txt 中的规则，但是这样做会对本机上所有项目的混淆规则都生效，那么有没有什么好的办法只针对当前项目做混淆规则修改呢？

答：对 proguard-rules.pro 文件进行自定义混淆规则编写

可以看到 android 闭包下 release 闭包的配置，实际上配置了两个混淆文件，一个就是我们前面介绍的默认混淆规则，另外一个就是自定义混淆规则：

```groovy
android {
  
    buildTypes {
        release {
            minifyEnabled true
            //proguard-android-optimize.txt：默认混淆规则 proguard-rules.pro：自定义混淆规则
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

proguard-rules.pro 文件位于 app 目录下，接下来我们就使用刚才学习的 Proguard 相关知识对混淆规则做修改吧

这里先列出我们要实现的目标：

> 1、对 MyFragment 类进行完全保留，不混淆其任何信息
>
> 2、对 MainActivity 类进行完全保留，不混淆其任何信息
>
> 3、对 Utils 中的方法进行保留，防止其被混淆或移除
>
> 4、对 NativeUtils 中的非 Native 方法进行保留，防止其被混淆或移除
>
> 5、对第三方库进行保留，防止其被混淆或移除

实现如下：

```xml
# 对 MyFragment 类进行完全保留，不混淆其任何信息
-keep class com.dream.androidreversedemo.MyFragment{
    *;
}

# 对 MainActivity 类进行完全保留，不混淆其任何信息
-keep class com.dream.androidreversedemo.MainActivity{
    *;
}

# 对 Utils 中的方法进行保留，防止其被混淆或移除
-keep class com.dream.androidreversedemo.Utils{
    *;
}

# 对 NativeUtils 中的非 Native 方法进行保留，防止其被移除
-keepclassmembers class com.dream.androidreversedemo.NativeUtils{
    public static void methodNotNative();
}

# 对第三方库进行保留，防止其被混淆或移除
-keep class com.dream.androidutils.*{
    *;
}
```

编写好了自定义规则，现在我们重新打一个正式版的 APK 文件，然后在反编译看效果：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523747.png" alt="image-20221120195728116.png" width="50%" />

可以看到我们自己编写的类和引入的第三方库中所有的的代码都被保留了下来，不管是包名，类名都没有被混淆

接着看一下具体的类：

**MainActivity**：


![image-20221120200151678.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523298.png)

**Utils**：


![image-20221120200226987.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281523885.png)

**NativeUtils**：

![image-20221120200312209.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281524269.png)

**MyFragment**：

![image-20221120200408565.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281524906.png)

可以看到，上面的这些类基本上按照我们的要求保留了下来

ok，经过上面的例子，相信大家已经对 Proguard 的用法有相当不错的理解了，那么根据自己的业务需求去编写混淆配置相信也不是什么难事了吧？

关于混淆 APK 代码就讲这么多，如果你还想了解更多关于 Proguard 的用法，可以参考这篇文章：https://juejin.cn/post/6844903457380384782

## 三、总结

本篇文章我们主要介绍了：

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

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**


### 参考和推荐

[Android安全攻防战，反编译与混淆技术完全解析（下）](https://blog.csdn.net/guolin_blog/article/details/50451259?spm=1001.2014.3001.5501)

[深入学习ProGuard之：ProGuard简介与android的应用](https://juejin.cn/post/6844903457380384782)

[jadx github](https://github.com/skylot/jadx)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
