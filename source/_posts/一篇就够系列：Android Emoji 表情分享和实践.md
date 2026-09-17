---
title: 一篇就够系列：Android Emoji 表情分享和实践
date: 2022-10-11 10:50:54
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281529196.jpeg
tags: 
- 原创
- Android
- 一篇就够
categories:
- Android
- 一篇就够
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281529196.jpeg)

## 前言

很高兴遇见你~

最近开发了一个 LiveChat 客服聊天的模块，里面涉及到 Emoji 表情，遇到了一些问题，分享下自己的一个解决过程以及关于 Android Emoji 的相关知识点

## 一、Emoji 表情介绍

下面大概介绍一下关于 Emoji 表情：

1、Emoji 是可以被插入文字中的图形符号，它是一个日本语，e 表示"绘"，moji 表示 "文字" ，连在一起就是 “绘文字”，它最早是用于我们发短信来增强用户的一个体验，2007 年，Apple 在 iPhone 中支持了 Emoji，才让它在全球范围内流行起来。

2、在 2010 年以前，Emoji 的实现是将一些特殊的符号组合替换成图片表情，例如 `:)` 替换成 😊 ，这样的解决方案导致 Emoji 表情很难标准化，而且表达范围有限

3、从 2010 年开始，Unicode 开始为 Emoji 分配固定的码点，也就是说，在这之后，每一个 Unicode 字符对应一个字体，它会被渲染为图片显示

4、Emoji 表情由于其表达情绪的特点，被广受欢迎。Emoji 表情的国际标准在 2015 年出台，到目前为止已经是 V13.1 版本的标准了，具体关于 Unicode 字符和 Emoji 表情的一个映射关系以及其他的一些细节，可以从这个网站中去查询：http://www.unicode.org/emoji/charts/full-emoji-list.html 

## 二、需求

对 Emoji 表情有了一个大概的了解之后，下面讲下产品给我提的一个需求，大概就是：**从 http://www.unicode.org/emoji/charts/full-emoji-list.html 这个网站中，筛选一些常用的 Emoji 表情，然后根据 UI 设计稿，实现表情包功能即可**

了解了需求之后，我们就要去思考如何去实现这个功能🤔？

首先打开这个网站看看，如下图：

![image-20210521105455542](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281529360.png)

从上图我们可以看到：

1、每个表情的 Unicode 字符

这里解释一下 Unicode：Unicode 就是统一的字符编码标准，当需要表示一个 Unicode 字符时，通常会用 U+ 然后紧接着一个十六进制的数字来表示，如上图所列举的这些

2、每个 Unicode 字符对应的 Emoji 表情在各个平台展示的样式都不太一样，因为 Unicode 只是规定了 Emoji 的码点和含义，并没有规定它的样式，每个平台都有自己的 Emoji 实现

## 三、Unicode 使用

到这里我心里会有个疑问：我如何将这些 Unicode 字符如 U+1F600 在 Android 中使用呢？

Unicode 允许我们使用 Code、UTF-8、Surrogates 等这些形式来表示一个字符，那其实这就是一个突破口

以 code 形式举例：例如说我的一个 Emoji 表情的 code 形式是 1F600，那么我就可以经过一系列 Api 的转换，让他能够使用 Android 控件去加载

```java
//将当前 code 转换为 16 进制数
int hex = Integer.parseInt("1F600", 16);
//将当前 16 进制数转换成字符数组
char[] chars = Character.toChars(hex);
//将当前字符数组转换成 TextView 可加载的 String 字符串
String mEmojiString = new String(chars);
```

经过上述转换，将生成的 String 对象，传递给 TextView，如果是当前设备支持的 Emoji，就可以正常显示了

## 四、Emoji 表情实践

有了思路，就开始撸起柚子干，把筛选出的表情 code 放到一个集合中，然后通过 ViewPager + Fragment + RecyclerView 等一系列控件的配合，实现了 UI 需要的效果，如下图：

![image-20210510130326366](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281529478.png)

从上图可以发现一个问题：**有些 Emoji 表情显示出来像一个信封**

原因是当前设备不支持，上面我讲到每一个 Unicode 字符对应一个字体，它会被渲染为图片显示，但是如果当前系统不支持这种字体，那么就会显示出一个信封，而且随着 Android 版本越来越低，这种情况越来越多，这种效果肯定是不行的

知道了出现的问题和原因，我们就要去想解决方法，这个时候 EmojiCompat 就来了

## 五、EmojiCompat 介绍

### 1、什么是 EmojiCompat ？

EmojiCompat 是 Google 官方给我们提供的一个 Emoji 表情兼容库，最低支持到 Android 4.4(Api Level 19) 的系统设备，它可以防止应用中，出现以信封的形式来显示 Emoji，虽然它仅仅只是因为你当前的设备没有这个字体而已。通过 EmojiCompat ，你的设备无需等待 Android 系统更新，就可以获得最新的 Emoji 表情显示效果。

EmojiCompat 的运行原理如下图所示：

![image-20210510142708101](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281529628.png)

从上图我们可以知道：EmojiCompat 会判断当前设备是否支持这个 Emoji，如果支持则还是使用系统内置的字体加载，如果不支持，则使用 EmojiSpan 来进行替换，从而达到替换渲染的效果

### 2、如何使用 EmojiCompat ？

要使用 EmojiCompat ，我们需要先对其进行初始化，如下：

```java
EmojiCompat.init(config);
//EmojiCompat 的 init 方法
public static EmojiCompat init(@NonNull final Config config) {
    if (sInstance == null) {
        synchronized (sInstanceLock) {
            if (sInstance == null) {
                sInstance = new EmojiCompat(config);
            }
        }
    }
    return sInstance;
}
```

上述代码可以看到， EmojiCompat 是一个单例对象，初始化方法就是传入了一个 config 即配置，因此构建配置是 EmojiCompat 初始化能否成功的重点所在，Google 给我们提供了两种配置 ，他们分别是：

1、可下载的字体配置

2、本地捆绑的字体配置

根据 Google 官方介绍：

##### 1）、可下载的字体配置

原理：可下载的字体的方式会在首次启动 app 的时候检查本地是否有该字体，没有的话会从网上下载最新的 Emoji 字体，然后遇到不支持的 Emoji，就会从这个字体文件中，加载资源并且渲染

缺点：可下载字体的方式，完全依赖 GMS 服务，在没有 GMS 服务的手机上并不可用

##### 2）、本地捆绑的字体配置

原理：本地捆绑的方式会在 App 打包的过程中，植入一个最新的 Emoji 字体文件，然后遇到不支持的 Emoji，就会从这个字体文件中，加载资源并且渲染

缺点：本地捆绑的方式会嵌入一个约 9M+ 的字体文件，无形中增大了 Apk 安装包的体积

目前官方使用的是 NotoColorEmojiCompat.ttf 字体文件，文件大小约 9M+

下面先讲下如何使用这两种方式去进行初始化

#### 1、可下载的字体配置

1）、添加 Gradle 依赖

```java
implementation 'androidx.emoji:emoji:1.1.0'
```

2）、构建可下载字体配置初始化 EmojiCompat ，构建相关信息参照 **[android-EmojiCompat](https://github.com/googlearchive/android-EmojiCompat)** 这个项目

```java
FontRequest fontRequest = new FontRequest(
                "com.google.android.gms.fonts",
                "com.google.android.gms",
                "Noto Color Emoji Compat",
                R.array.chat_com_google_android_gms_fonts_certs);
EmojiCompat.Config config = new FontRequestEmojiCompatConfig(mContext, fontRequest);
config.setReplaceAll(true);
config.registerInitCallback(new EmojiCompat.InitCallback() {
     @Override
     public void onInitialized() {
     	 //初始化成功回调  
     }

     @Override
     public void onFailed(@Nullable Throwable throwable) {
 	 //初始化失败回调
     }
});
EmojiCompat.init(config);
```

#### 2、本地捆绑的字体配置

1）、添加 Gradle 依赖

```java
implementation 'androidx.emoji:emoji-bundled:1.1.0'
```

2）、构建本地捆绑字体配置初始化 EmojiCompat

```java
EmojiCompat.Config config = new BundledEmojiCompatConfig(mContext, fontRequest);
config.setReplaceAll(true);
config.registerInitCallback(new EmojiCompat.InitCallback() {
     @Override
     public void onInitialized() {
         //初始化成功回调      
     }

     @Override
     public void onFailed(@Nullable Throwable throwable) {
 	 //初始化失败回调
     }
});
EmojiCompat.init(config);
```

到这里，EmojiCompat 的初始化工作就完成了，我们可以发现这两种方式其实都是去构建一个字体配置即 config 去初始化

那我会想：是否可以构建一个自定义的字体配置去完成 EmojiCompat 的初始化呢？

这个问题我们先留着，继续往下看

#### 3、EmojiCompat 实践

现在我们清楚了：

1、构建字体配置

2、两种字体配置的原理和缺点

3、初始化 EmojiCompat

因为本地捆绑字体配置的方式会使我们的 app 包体积增大 9M+，这是完全不能接受的，而且我们的 app 主要是面向国外的用户，国外用户手机一般都有 GMS 服务，因此我选用了**可下载字体配置**来完成 EmojiCompat 的初始化

初始化成功后，我们就可以使用 EmojiCompat 提供的功能了，之前我们是通过如下方式进行表情包加载的：

```java
//将当前 code 转换为 16 进制数
int hex = Integer.parseInt("1F600", 16);
//将当前 16 进制数转换成字符数组
char[] chars = Character.toChars(hex);
//将当前字符数组转换成 TextView 可加载的 String 字符串
String mEmojiString = new String(chars);
```

现在只需要对当前 mEmojiString 通过 EmojiCompat 处理一下即可，如下：

```java
//判断当前 EmojiCompat 是否初始化成功
public static boolean isEmojiCompatInit(){
    return EmojiCompat.get().getLoadState() == EmojiCompat.LOAD_STATE_SUCCEEDED;
}

//获取可兼容的 emoji 字符串
public static CharSequence getCompatEmojiString(String code) {
    //将当前 code 转换为 16 进制数
    int hex = Integer.parseInt(code, 16);
    //将当前 16 进制数转换成字符数组
    char[] chars = Character.toChars(hex);
    //将当前字符数组转换成 TextView 可加载的 String 字符串
    String mEmojiString = new String(chars);
    //判断当前系统是否大于等于 19，并且 EmojiCompat 初始化成功
    if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && isEmojiCompatInit()){
        return EmojiCompat.get().process(mEmojiString);
    }
    return mEmojiString;
}
```

上述代码我们使用 EmojiCompat 的 process 方法对之前的  emoji 字符串做了兼容处理，现在显示出来的表情就不会有啥问题了，这个库使用起来还是很简单的

#### 4、 EmojiCompat 提供的控件

这里我们在延伸一下，假设之前的代码我都不想动，也就是说 getCompatEmojiString 这个方法我都不想写，还是使用之前的方式去实现表情包的兼容，可以做到么？

答：可以的，使用 EmojiCompat 提供的控件

EmojiCompat 里面提供了如：EmojiTextView，EmojiButton，EmojiEditText等控件：

```java
<androidx.emoji.widget.EmojiTextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
      
<androidx.emoji.widget.EmojiButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<androidx.emoji.widget.EmojiEditText
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

实际上这些控件的源码里面最终还是会调用 EmojiCompat 的 process 方法对之前的 emoji 字符串做兼容处理，如果 EmojiCompat 初始化失败，这些 EmojiCompat 提供的控件和它继承的控件功能是一样的，仅此而已

最终我的实现方案就是：**使用可下载字体配置初始化 EmojiCompat，在使用 EmojiCompat 提供的控件替换之前的控件实现了表情包的兼容**，效果如下：

![image-20210526145027221](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281530063.png)

可能你会发现这张效果图和之前那张一些能显示出来的 Emoji 表情效果不一样，这是啥情况呢？

之前我讲过：EmojiCompat 会判断当前设备是否支持这个 Emoji，如果支持则还是使用系统内置的字体加载，如果不支持，则使用 EmojiSpan 来进行替换，从而达到替换渲染的效果。这是在你没设置 config.setReplaceAll(true) 的情况下，而如果你设置了  config.setReplaceAll(true) ，那么所有的 Emoji 表情都会使用 EmojiSpan 替换并渲染

## 六、新的问题 

好了，到了这里似乎就要结束了，我也觉得要结束了，然而测试那边发现还是会有显示问题，原因其实我也猜到了，那就是当前设备没有 GMS 服务

我讲过国外的手机一般都会有 GMS 服务，但是近些年中美贸易战，很多华为手机没有 GMS 服务了，而我们的用户存在很大一部分用户用的就是华为手机，因此担心出现一些问题，所以必须得去解决这个问题

捋一捋现在的问题：可下载的字体配置完全依赖 GMS 服务，如果没有  GMS 服务，则会导致字体下载失败，相应的 EmojiCompat 就会初始化失败，EmojiCompat 初始化失败，则看当前系统是否支持该 emoji，如果不支持，那就会显示成信封状。之前本地捆绑字体配置的方式因为会使我们的 app 包体积增大，直接被 pass 掉了

如果还要继续使用 EmojiCompat，问题到了这里似乎无解了，别着急，办法总比困难多，当时我心里有两个想法：

1、推到目前的实现方案进行重构

2、继续研究 EmojiCompat ，看是否有新的解决思路

我这个人比较喜欢偷懒，1 因为感觉需要花费很多时间和精力被我 pass 掉了，2 如果能研究解决，那改动就非常的小了

抱着试一试的心态，我选择了 2，继续研究 EmojiCompat

## 七、EmojiCompat 源码分析

建议你配合源码跟着我的思路往下走

我们从 EmojiCompat 初始化开始分析，如下：

```java
public static EmojiCompat init(@NonNull final Config config) {
    if (sInstance == null) {
        synchronized (sInstanceLock) {
            if (sInstance == null) {
                sInstance = new EmojiCompat(config);
            }
        }
    }
    return sInstance;
}
```

可以看到，上面就是把 config 传进来，通过双重校验的方式创建了一个单例对象，接着看 EmojiCompat 的这个构造方法：

```java
private EmojiCompat(@NonNull final Config config) {
    //...
    mHelper = Build.VERSION.SDK_INT < 19 ? new CompatInternal(this) : new CompatInternal19(this);
    loadMetadata();
}
```

上述代码实际上就是做了一些属性初始化的工作，mHelper 在系统版本小于 19 和 系统版本大于等于 19 创建的实例有所不同，我们看下这两个类，因为代码太长就不贴代码了：

CompatInternal 类：里面都是一些默认实现

CompatInternal19 类：继承 CompatInternal，并重父类的方法从而达到实现功能的效果

我们主要跟进最后一行代码 loadMetadata 方法，见名知意，loadMetadata 就是加载元数据即拉取字体文件：

```java
private void loadMetadata() {
    mInitLock.writeLock().lock();
    try {
        if (mMetadataLoadStrategy == LOAD_STRATEGY_DEFAULT) {
            mLoadState = LOAD_STATE_LOADING;
        }
    } finally {
        mInitLock.writeLock().unlock();
    }

    if (getLoadState() == LOAD_STATE_LOADING) {
        mHelper.loadMetadata();
    }
}
```

上述代码步骤：

1、将 mLoadState 置为 LOAD_STATE_LOADING 进行上锁操作，防止多线程并发，导致重复初始化

2、如果当前状态为 LOAD_STATE_LOADING , 则调用 mHelper.loadMetadata()

接着分析 mHelper.loadMetadata()

当系统版本小于 19 的时候，会走如下代码：

```java
void loadMetadata() {
    // Moves into LOAD_STATE_SUCCESS state immediately.
    mEmojiCompat.onMetadataLoadSuccess();
}
```

跟进 mEmojiCompat.onMetadataLoadSuccess 方法看下：

```java
void onMetadataLoadSuccess() {
    //...
    mInitLock.writeLock().lock();
    try {
        mLoadState = LOAD_STATE_SUCCEEDED;
    } finally {
        mInitLock.writeLock().unlock();
    }

    mMainHandler.post(new ListenerDispatcher(initCallbacks, mLoadState));
}
```

上述代码步骤：

1、将 mLoadState 置为LOAD_STATE_SUCCEEDED （即初始化成功）进行上锁操作，防止多线程并发

2、通过主线程 mMainHandler 将消息发送到主线程处理

3、通过 ListenerDispatcher 进行监听的分发，最终会回调到我们之前初始化配置的监听

可以看到，当系统版本小于 19  就直接回调成功了，并没有任何拉取字体的操作，实际当系统版本小于 19 的时候都是一些默认实现，感兴趣的可以看看源码。因此当系统版本小于 19 的时候，EmojiCompat 支持库并不会起作用

接着看当系统版本大于等于 19 的时候：

```java
@Override
void loadMetadata() {
    try {
        final MetadataRepoLoaderCallback callback = new MetadataRepoLoaderCallback() {
            @Override
            public void onLoaded(@NonNull MetadataRepo metadataRepo) {
                onMetadataLoadSuccess(metadataRepo);
            }

            @Override
            public void onFailed(@Nullable Throwable throwable) {
                mEmojiCompat.onMetadataLoadFailed(throwable);
            }
        };
        mEmojiCompat.mMetadataLoader.load(callback);
    } catch (Throwable t) {
        mEmojiCompat.onMetadataLoadFailed(t);
    }
}
```

上述代码步骤：

1、创建了一个 MetadataRepoLoaderCallback 的 callback

2、如果 callback 回调 onLoaded 方法，则会调 onMetadataLoadSuccess ，那么就直接初始化成功了

3、如果 callback 回调 onFailed 方法，则会调 mEmojiCompat.onMetadataLoadFailed(throwable)，那么就会初始化失败

4、最终会通过 mEmojiCompat.mMetadataLoader 的 load 方法去加载这个 callback

到这里我们还是没有看到拉取字体的操作，而是把这个 callback 传入到了 load 方法中

接下来我们继续分析 load 方法，load 方法是 mMetadataLoader 的，mMetadataLoader 是 EmojiCompat 的一个属性，而且在 EmojiCompat 的构造方法里做了赋值操作：

```java
private EmojiCompat(@NonNull final Config config) {
    //...
    mMetadataLoader = config.mMetadataLoader;
    //...
}
```

可以看到，EmojiCompat 的 mMetadataLoader 是从我们传进来的 config 中拿的，现在问题就转变到了我们配置的 config 中，我们看一眼可下载字体配置的 config，看主要流程的一些代码，其他的给省略了：

```java
public class FontRequestEmojiCompatConfig extends EmojiCompat.Config {
    //...
    private static class FontRequestMetadataLoader implements EmojiCompat.MetadataRepoLoader {
        @Override
        @RequiresApi(19)
        public void load(@NonNull final EmojiCompat.MetadataRepoLoaderCallback loaderCallback) {
            Preconditions.checkNotNull(loaderCallback, "LoaderCallback cannot be null");
            synchronized (mLock) {
                if (mHandler == null) {
                    mThread = new HandlerThread("emojiCompat", Process.THREAD_PRIORITY_BACKGROUND);
                    mThread.start();
                    mHandler = new Handler(mThread.getLooper());
                }
                mHandler.post(new Runnable() {
                    @Override
                    public void run() {
                        mCallback = loaderCallback;
                        createMetadata();
                    }
                });
            }
        }

        @RequiresApi(19)
        void createMetadata() {
            try {
              	//...
              	final FontsContractCompat.FontInfo font = retrieveFontInfo();
                final Typeface typeface = mFontProviderHelper.buildTypeface(mContext, font);
                final ByteBuffer buffer = TypefaceCompatUtil.mmap(mContext, null, font.getUri());
                if (buffer == null) {
                    throw new RuntimeException("Unable to open file.");
                }
                mCallback.onLoaded(MetadataRepo.create(typeface, buffer));
                cleanUp();
            } catch (Throwable t) {
                mCallback.onFailed(t);
                cleanUp();
            }
        }
    }
}
```

1、FontRequestMetadataLoader 实现了 EmojiCompat.MetadataRepoLoader 接口，它是 FontRequestEmojiCompatConfig 的一个静态内部类，并重写了 load 方法

2、load 方法主要做的事情是：通过 HandlerThread 配合 Handler 把线程切换到子线程，将传进来的 loaderCallback(也就是我们前面分析的那个 callback) 赋值给了 mCallBack，并执行  createMetadata 方法

接着看 createMetadata 方法，它里面做的主要事情就是：

1、通过 GMS 服务拉取字体信息，终于看到了这个操作

2、通过拉取的字体信息构建一个 Typeface 对象

3、通过拉取的字体信息构建一个 ByteBuffer 流对象

4、通过 typeface 和 buffer 构建一个 MetadataRepo 对象并最终回调 onLoaded 方法，初始化成功

MetadataRepo 解释：实际上 MetadataRepo 就是 EmojiCompat 处理和绘制表情的一个数据仓库，我们可以使用三种方式去构建它：

![image-20210526191217511](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281530822.png)

从截图中我们可以看到它有三个重载方法：

1、方式一：传入一个 Typeface 对象和一个 InputStream 流对象

2、方式二：传入一个  Typeface 对象和一个 ByteBuffer 流对象

3、方式三：传入一个 AssetManager 对象和一个 assetPath 路径

实际上，可下载字体配置用的就是方式二，本地捆绑字体配置用的是方式三，**我们还有方式一可以用，这也是后续解决问题的一个突破口**

4、如果流程有任何异常，走到 catch 里面，最终回调 onFailed 方法，初始化失败

通过上面流程的一个分析我们可以知道：EmojiCompat 会通过传入的 config 中的 MetadataRepoLoader 的 load 方法切换到子线程去拉取字体文件，如果拉取成功并成功构建 MetadataRepo 对象，则能初始化成功，如果拉取失败，则会初始化失败

源码分析到了这里，你心里是否有了新的思路了呢？还记得上面我预留的一个问题吗？

我们是否可以构建一个自定义的字体配置去完成 EmojiCompat 的初始化呢？

当时只是猜想，我们现在理性分析一波：

1、上面我们使用的可下载的字体配置是通过 GMS 服务拉取的字体文件，然后通过上述方式二去构建 MetadataRepo，最终初始化成功

2、本地捆绑字体配置是通过从本地 assets 文件夹下拉取字体文件，然后通过方式三去构建 MetadataRepo，最终初始化成功

那么依葫芦画瓢：我是否可以构建一个自定义的字体配置，把字体存到我们自己的服务器，在从服务器上去拉取字体，拉取成功后，通过方式一去构建 MetadataRepo，那么这样是否也能初始化成功呢？

嗯，感觉方案可行，干就完了

## 八、新方案实践

通过上面的分析，我们有了新的思路，下面是我实践的一个过程，因代码太多，贴出部分关键代码，主要关注解决问题的思路：

1、将 Google 官方提供的 NotoColorEmojiCompat.ttf 字体文件，上传到我们自己的服务器

2、针对没有 GMS 的手机，EmojiCompat 会初始化失败，那么在 EmojiCompat 首次初始化失败后，在它失败的回调里面启动一个下载任务去下载 NotoColorEmojiCompat.ttf 这个字体

3、若下载成功，则构造一个自定义的字体配置重新初始化 EmojiCompat

下面是一些关键的代码，仅供参考：

```java
//初始化 EmojiCompat
public static void initEmotionCompat(Context mContext) {
    FontRequest fontRequest = new FontRequest(
            "com.google.android.gms.fonts",
            "com.google.android.gms",
            "Noto Color Emoji Compat",
            R.array.chat_com_google_android_gms_fonts_certs);
    EmojiCompat.Config config = new FontRequestEmojiCompatConfig(mContext, fontRequest);
    config.setReplaceAll(true);
    config.registerInitCallback(new EmojiCompat.InitCallback() {
        @Override
        public void onInitialized() {
            Log.e(TAG, "loadEmojiFontFromNetwork()->onInitialized()");
        }

        @Override
        public void onFailed(@Nullable Throwable throwable) {
            Log.e(TAG, "loadEmojiFontFromNetwork()->onFailed():" + throwable.getMessage());
            //若初始化失败则执行下载字体操作
            downloadFont(mContext,"你的字体下载 url ");
        }
    });
    EmojiCompat.init(config);
}

//下载字体
public static void downloadFont(Context mContext,String fontUrl){
    EmojiFontDownloadUtils.downloadFont(fontUrl,new EmojiFontPreloadUtils.OnEmojiFontDownloadListener() {
        @Override
        public void onSuccess(File file) {
            //下载成功，重新初始化 EmojiCompat
            resetConfig(mContext);
        }

        @Override
        public void onFailed(Throwable throwable) {
            Log.e(TAG, "onFailed: " + throwable.getMessage());
        }
    });
}

//重新初始化
private static void resetConfig(Context mContext) {
    //构建自定义字体配置
    final EmojiCompat.Config config = new LocalEmojiCompatConfig(mContext);
    config.registerInitCallback(new EmojiCompat.InitCallback() {
        @Override
        public void onInitialized() {
            Log.e(TAG, "reInit success...");
        }

        @Override
        public void onFailed(@Nullable Throwable throwable) {
            Log.e(TAG, "reInit failed:" + throwable.getMessage());
        }
    });
    //重置初始化配置进行重新初始化
    EmojiCompat.reset(config);
}
```

 可能大家想看看我构建的自定义字体配置长啥样？安排😄：

```java
public class LocalEmojiCompatConfig extends EmojiCompat.Config {

    public LocalEmojiCompatConfig(@NonNull Context context) {
        super(new LocalEmojiCompatConfig.LocalMetadataLoader(context));
    }

    private static class LocalMetadataLoader implements EmojiCompat.MetadataRepoLoader {
        private final Context mContext;

        LocalMetadataLoader(@NonNull Context context) {
            mContext = context.getApplicationContext();
        }

        @Override
        @RequiresApi(19)
        public void load(@NonNull EmojiCompat.MetadataRepoLoaderCallback loaderCallback) {
            Preconditions.checkNotNull(loaderCallback, "loaderCallback cannot be null");
            //开启子线程执行任务
            final LocalEmojiCompatConfig.InitRunnable runnable = new LocalEmojiCompatConfig.InitRunnable(mContext, loaderCallback);
            final Thread thread = new Thread(runnable);
            thread.setDaemon(false);
            thread.start();
        }
    }

    @RequiresApi(19)
    private static class InitRunnable implements Runnable {
        private final EmojiCompat.MetadataRepoLoaderCallback mLoaderCallback;
        private final Context mContext;

        InitRunnable(Context context, EmojiCompat.MetadataRepoLoaderCallback loaderCallback) {
            mContext = context;
            mLoaderCallback = loaderCallback;
        }

        @Override
        public void run() {
            try {
              	//构建 MetadataRepo 
                final Typeface typeface = Typeface.createFromFile(EmojiFontPreloadUtils.getFile());
                final InputStream inputStream = new FileInputStream(EmojiFontPreloadUtils.getFile());
                final MetadataRepo metadataRepo = MetadataRepo.create(typeface, inputStream);
                mLoaderCallback.onLoaded(metadataRepo);
            } catch (Throwable t) {
                mLoaderCallback.onFailed(t);
            }
        }
    }
}
```

其实这个自定义的字体配置很简单，就是仿照之前我们分析的那个源码流程，结合可下载字体配置的思路写出来的，上述自定义的字体配置主要做的事情：

1、在 load 方法里面开启一个子线程执行任务

2、在可执行的任务里面通过方式一构建 MetadataRepo 最终完成初始化操作

最终经过实践，发现这种方案能够初始化成功，问题解决

## 九、总结

梳理一下这篇文章我们所讲的一些东西：

首先介绍了 Emoji 表情，讲了下我接到的需求，然后对 Emoji 表情方案进行了实践，发现有显示问题，于是引入  EmojiCompat 支持库解决了显示问题，但是发现在没有 GMS 服务的手机上显示仍然会出现一些显示问题，于是我们通过将字体文件上传到自己的服务器，并拉取构建自定义的字体文件配置初始化 EmojiCompat 解决了该问题

好了，如果你看到这里，相信你一定收获满满，如果有啥问题，欢迎评论区一起交流🤝

**感谢你阅读这篇文章**

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
