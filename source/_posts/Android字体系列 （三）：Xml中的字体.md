---
title: Android字体系列 （三）：Xml中的字体
date: 2022-10-11 10:30:56
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281549693.jpeg
tags: 
- 原创
- Android
- Android Font
categories:
- Android
- Font
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281549693.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们对 Typeface 进行了深入的解析，还没有看过上一篇文章的朋友，建议先去阅读 [Android字体系列 （二）：Typeface完全解析](https://juejin.cn/post/6973553157326503943)。接下来我们看下 Google 推出的 Xml 中使用字体

## 一、Xml 中字体介绍

Google 在 Android Support Library 26 引入了 Xml 中设置字体这项新功能，它可以让你将字体当成资源去使用，你可以在 res/font/ 文件夹中添加 font 文件，将字体捆绑为资源。这些字体会在 R 文件中编译，可直接在 Android Studio 中使用，如:

```xml
@font/myfont 
R.font.myfont
```

**注意**：要使用 Xml 字体功能，需引入 Android Support Library 26 及更高版本且要在 Android 4.1 及更高版本的设备

## 二、使用步骤

1、右键点击 **res** 文件夹，然后转到 **New > Android resource directory**

2、在 **Resource type** 列表中，选择 **font**，然后点击 **OK**

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281549945.png" alt="image-20210616203615018" style="zoom:50%;" />

3、在 **font** 文件夹中添加字体文件

> 关于字体，推荐两个免费下载的网站
>
> https://fonts.google.com/
>
> https://www.1001freefonts.com/

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281549024.png" alt="image-20210616203940427" style="zoom:50%;" />

添加之后就会生成 R.font.ma_shan_zhenng_regular 和 R.font.noto_sans_bold

4、双击字体文件可预览当前字体

![image-20210616204148155](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281549158.png)

以上 4 个步骤完成后我们就可以在 Xml 中使用字体了

5、创建 font family

1）、右键点击 font 文件夹，然后转到 **New > Font resource file**。此时将显示 **New Resource File** 窗口。

2）、输入文件名，然后点击 **OK**。新的字体资源 Xml 会在编辑器中打开。

3）、将各个字体文件、样式和粗细属性都封装在 `<font>` 元素中。如下：

```xml
<?xml version="1.0" encoding="utf-8"?>
<font-family xmlns:tools="http://schemas.android.com/tools"
    xmlns:android="http://schemas.android.com/apk/res/android"
    tools:ignore="UnusedAttribute">

    <font
        android:fontStyle="normal"
        android:fontWeight="400"
        android:font="@font/ma_shan_zheng_regular"
        tools:ignore="UnusedAttribute" />

    <font
        android:fontStyle="normal"
        android:fontWeight="400"
        android:font="@font/noto_sans_bold"
         />
</font-family>
```
实践发现使用 font family 存在一些坑：

1、例如我上面添加了两个 font 标签，这个时候在 Xml 里面引用将不会有任何效果，而且设置的 fontStyle 等属性不会生效。

2、当只添加了一个 font 标签，此时字体会生效，但是设置的 fontStyle 等属性还是不会生效

因此我们在使用的时候建议直接对字体资源进行引用，样式粗细这些在进行单独的设置

## 三、在 XML 布局中使用字体

直接在布局 Xml 中使用 fontFamily 属性进行引用，如下图：

![image-20210616205129045](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281549409.png)

## 四、在样式中添加并使用字体

1、在 style.xml 中添加样式

```xml
<style name="customfontstyle" parent="Theme.ChangeDefaultFontDemo">
    <item name="android:fontFamily">@font/noto_sans_bold</item>
</style>
```

2、在布局 Xml 中使用，如下图：

![image-20210616205611588](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281550042.png)

## 五、在代码中使用字体

在代码中，我们可以通过 ResourcesCompat 或 Resource 的 gontFont 方法拿到 Typeface 对象，然后调用相关的 Api 去设置就行了，例如：

```kotlin
//方式1
val typeface = ResourcesCompat.getFont(context, R.font.myfont)
//方式2
val typeface = resources.getFont(R.font.myfont)
//设置字体
textView.typeface = typeface
```

为了方便在代码中使用，我们可以进行合理的封装：

```kotlin
object FontUtil {

    const val NOTO_SANS_BOLD = R.font.noto_sans_bold
    const val MA_SHAN_ZHENG_REGULAR = R.font.ma_shan_zheng_regular

    /**缓存字体 Map*/
    private val cacheTypeFaceMap: HashMap<Int,Typeface> = HashMap()

    /**
     * 设置 NotoSanUIBold 字体
     */
    fun setNotoSanUIBold(mTextView: TextView){
        try {
            mTextView.typeface = getTypeface(NOTO_SANS_BOLD)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * 设置 MaShanZhengRegular 字体
     */
    fun setMaShanZhengRegular(mTextView: TextView){
        try {
            mTextView.typeface = getTypeface(MA_SHAN_ZHENG_REGULAR)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * 获取字体 Typeface 对象
     */
    fun getTypeface(fontResName: Int): Typeface? {
        val cacheTypeface = cacheTypeFaceMap[fontResName]
        if (cacheTypeface != null) {
            return cacheTypeface
        }
        return try {
            val typeface: Typeface? = ResourcesCompat.getFont(MyApplication.mApplication, fontResName)
            cacheTypeFaceMap[fontResName] = typeface!!
            typeface
        } catch (e: Exception) {
            e.printStackTrace()
            Typeface.DEFAULT
        }
    }
}
```

那么后续我们在代码中使用字体，就只需调一行代码就 Ok 了

```kotlin
FontUtil.setMaShanZhengRegular(mTextView1)
FontUtil.setNotoSanUIBold(mTextView2)
```

## 六、项目需求实践

回顾一下我接到的项目需求：**全局替换当前项目中的默认字体，并引入 UI 设计师提供的一些新字体**

在学习本篇文章之前，我们引入字体都是放在 assets 文件目录下，这个目录下的字体文件，我们只能在代码中获取并使用。那么通过本篇文章的讲解，我们不仅可以在代码中进行使用，还可以在 Xml 中进行使用。现在我们解决了一半的需求，关于全局替换默认字体还需等到下一篇文章😄

## 七、总结

回顾下本篇文章我们讲的一些重点内容：

1、将字体放在 res 的 font 目录下，这样我们就可以在 Xml 中使用字体了

2、通过字体 R 资源索引获取字体文件，封装相应的字体工具类，在代码中优雅的使用

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝 

[Github Demo 地址](https://github.com/sweetying520/ChangeDefaultFontDemo)

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会讲 Android 全局替换字体的几种方式，敬请期待吧 😄

### 参考和推荐

[XML 中的字体](https://developer.android.com/guide/topics/ui/look-and-feel/fonts-in-xml#kotlin)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
