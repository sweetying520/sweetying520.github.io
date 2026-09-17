---
title: Flutter 系列（三）：Flutter 特点及常用 Widget 介绍
date: 2022-10-10 16:50:00
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281605495.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281605495.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们全面介绍了 Dart 语法，内容很多，文字+代码有三万多字，如果你能够耐心看完并手敲里面的示例，你一定会收获很大。还没有看过上一篇文章的朋友，建议先去阅读 [Flutter 系列（二）：Dart 语法筑基](https://juejin.cn/post/7130647339294785549#heading-0)。接下来我们进入 Flutter 的学习。

## 一、Flutter 特点介绍

学习一个框架，我们首先要了解这个框架的特点，就好比你学开车一样，你要知道这个车有什么特点，你才能快速的去上手它。Flutter 特点介绍：

### 1.1、在 Flutter 中，万物皆 Widget（组件）

我们在写 Flutter 时，一定要有这样的意识。这样我们才能更好地上手学习。在 Flutter 中，几乎任何东西都是 Widget，不仅是常见的 UI 组件，甚至是布局方式，样式，动画等都是 Widget

### 1.2、Widget 嵌套

写 Android 时，我们会在 Xml 文件中编写布局及 View 嵌套，然后在 Java 或 Kotlin 文件中进行 View 逻辑编写。但写 Flutter，无论是 Widget 嵌套，还是 Widget 逻辑编写，都是在 Dart 文件中进行处理，这样就会产生一些问题：

>1、复杂界面出现各种深层 Widget 嵌套
>
>2、代码逻辑混乱，可读性差

作为 Android 开发，我一开始真的很不习惯，但是随着你学习的深入，对项目进行合理的架构设计，包结构设计，清晰的代码注释，上面的问题在一定程度上得到了解决

### 1.3、Widget 状态

在 Flutter 中，Widget 分为两种：

> 1、无状态 Widget
>
> 2、有状态 Widget

无状态 Widget (继承自 StatelessWidget)：初始化后无法修改其状态和 UI，如：Text，ScrollView

有状态 Widget (继承自 StatefulWidget)：其状态可能在 Widget 生命周期中发生变化。如 Image， Scrollable 等。在调用 setState 方法后，Widget 会重新绘制，创建其新的 Widget

StatelessWidget 和 StatefulWidget 都继承自Widget

**小 Tips**：

1、在你编写自定义 Widget 时，你首先判断它是有状态的还是无状态的，如果 Widget 需要根据用户交互或其他因素进行更改，则该 Widget 是有状态的，否则就是无状态的

2、当你需要改变 Widget 状态时，必须调用 setState 方法来通知 Flutter 来更新创建新的 Widget

**注意**：上面一些特点可能一开始不能理解，接着往下看，有些问题随着你知识的积累便迎刃而解了

## 二、Flutter 常用 Widget 介绍

先看一张效果图：


![1661082533405.jpg](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281606996.jpeg)

问题：上面的效果怎么实现的呢🤔️？

如果你是小白，那么就跟着我的步伐继续往下学习。如果不是，你可以想一下可以使用哪些 Widget 嵌套来实现，以及实现的一些细节。

待我们学习完下面的 Widget 后，在来解决这个问题

### 2.1、MaterialApp

见名知义，MaterialApp 就是一个带 Material Design 设计风格的 Widget，一般作为顶层 Widget 来使用

#### 2.1.1、属性

我们如果要查看一个 Widget 有哪些属性，可以通过 IDE 直接点击这个 Widget 的源码去查看，你会发现每个 Widget 都包含许多属性，这么多属性不可能每个都去看，我的建议是：**掌握基础常用的，其它用到时，看源码按需去取**

MaterialApp 构造方法：
```dart
const MaterialApp({
    Key? key,
    this.navigatorKey,
    this.scaffoldMessengerKey,
    this.home,
    Map<String, WidgetBuilder> this.routes = const <String, WidgetBuilder>{},
    this.initialRoute,
    this.onGenerateRoute,
    this.onGenerateInitialRoutes,
    this.onUnknownRoute,
    List<NavigatorObserver> this.navigatorObservers = const <NavigatorObserver>[],
    this.builder,
    this.title = '',
    this.onGenerateTitle,
    this.color,
    this.theme,
    this.darkTheme,
    this.highContrastTheme,
    this.highContrastDarkTheme,
    this.themeMode = ThemeMode.system,
    this.locale,
    this.localizationsDelegates,
    this.localeListResolutionCallback,
    this.localeResolutionCallback,
    this.supportedLocales = const <Locale>[Locale('en', 'US')],
    this.debugShowMaterialGrid = false,
    this.showPerformanceOverlay = false,
    this.checkerboardRasterCacheImages = false,
    this.checkerboardOffscreenLayers = false,
    this.showSemanticsDebugger = false,
    this.debugShowCheckedModeBanner = true,
    this.shortcuts,
    this.actions,
    this.restorationScopeId,
    this.scrollBehavior,
    this.useInheritedMediaQuery = false,
  }) : assert(routes != null),
       assert(navigatorObservers != null),
       assert(title != null),
       assert(debugShowMaterialGrid != null),
       assert(showPerformanceOverlay != null),
       assert(checkerboardRasterCacheImages != null),
       assert(checkerboardOffscreenLayers != null),
       assert(showSemanticsDebugger != null),
       assert(debugShowCheckedModeBanner != null),
       routeInformationProvider = null,
       routeInformationParser = null,
       routerDelegate = null,
       backButtonDispatcher = null,
       super(key: key);
```

**注意**：下面介绍的属性仅是用于实现上面的效果图

MaterialApp 常用属性：

| 属性 | 作用          |
| ---- | ------------- |
| home | 配置 App 主页 |

MaterialApp 更多属性介绍：https://segmentfault.com/a/1190000040552453

### 2.2、Scaffold

Scaffold 是一个 Material Design 设计风格的脚手架 Widget，一般嵌套在 MaterialApp 的 home 属性中

#### 2.2.1、属性

Scaffold 构造方法：

```dart
const Scaffold({
    Key? key,
    this.appBar,
    this.body,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.floatingActionButtonAnimator,
    this.persistentFooterButtons,
    this.drawer,
    this.onDrawerChanged,
    this.endDrawer,
    this.onEndDrawerChanged,
    this.bottomNavigationBar,
    this.bottomSheet,
    this.backgroundColor,
    this.resizeToAvoidBottomInset,
    this.primary = true,
    this.drawerDragStartBehavior = DragStartBehavior.start,
    this.extendBody = false,
    this.extendBodyBehindAppBar = false,
    this.drawerScrimColor,
    this.drawerEdgeDragWidth,
    this.drawerEnableOpenDragGesture = true,
    this.endDrawerEnableOpenDragGesture = true,
    this.restorationId,
  }) : assert(primary != null),
       assert(extendBody != null),
       assert(extendBodyBehindAppBar != null),
       assert(drawerDragStartBehavior != null),
       super(key: key);
```

| 属性   | 作用                                |
| ------ | ----------------------------------- |
| appBar | 配置显示在界面顶部的一个 AppBar     |
| body   | 配置当前界面所显示的主要内容 Widget |

Scaffold 更多属性介绍：https://segmentfault.com/a/1190000040554948

以上两个 Widget 就能搭建起页面的基本框架了，但是看到的会是一个空白的页面。回到上面那张图，我们看到顶部有一个标题栏，而且还有阴影，Flutter 给我们提供了 AppBar 来实现

### 2.3、AppBar

AppBar 是基于 Material Design 设计风格的标题栏 Widget，一般在 Scaffold 的 appBar 属性中使用，作为顶部标题栏

#### 2.3.1、属性

AppBar 构造方法：


```dart
AppBar({
    Key? key,
    this.leading,
    this.automaticallyImplyLeading = true,
    this.title,
    this.actions,
    this.flexibleSpace,
    this.bottom,
    this.elevation,
    this.shadowColor,
    this.shape,
    this.backgroundColor,
    this.foregroundColor,
    @Deprecated(
      'This property is no longer used, please use systemOverlayStyle instead. '
      'This feature was deprecated after v2.4.0-0.0.pre.',
    )
    this.brightness,
    this.iconTheme,
    this.actionsIconTheme,
    @Deprecated(
      'This property is no longer used, please use toolbarTextStyle and titleTextStyle instead. '
      'This feature was deprecated after v2.4.0-0.0.pre.',
    )
    this.textTheme,
    this.primary = true,
    this.centerTitle,
    this.excludeHeaderSemantics = false,
    this.titleSpacing,
    this.toolbarOpacity = 1.0,
    this.bottomOpacity = 1.0,
    this.toolbarHeight,
    this.leadingWidth,
    @Deprecated(
      'This property is obsolete and is false by default. '
      'This feature was deprecated after v2.4.0-0.0.pre.',
    )
    this.backwardsCompatibility,
    this.toolbarTextStyle,
    this.titleTextStyle,
    this.systemOverlayStyle,
  }) : assert(automaticallyImplyLeading != null),
       assert(elevation == null || elevation >= 0.0),
       assert(primary != null),
       assert(toolbarOpacity != null),
       assert(bottomOpacity != null),
       preferredSize = _PreferredAppBarSize(toolbarHeight, bottom?.preferredSize.height),
       super(key: key);
```

| 属性      | 作用                     |
| --------- | ------------------------ |
| title     | 配置标题栏的标题         |
| elevation | 配置标题栏下方的阴影大小 |


AppBar 更多属性介绍：https://segmentfault.com/a/1190000040562147

标题栏实现了，接下来就是 body 主体部分，我们在来分析一下：可以看到，主体部分是一个**居中**显示的**圆形**图像，背景是蓝色，有个红色的边框。圆形图像里面有一行**文本**，文本的颜色是白色，字体有点倾斜，字间距偏大，只显示了一行，超出部分 ... ，而且文本的中间有一个红色的虚删除线

上面加粗的文字就是用于实现该效果的 Widget：Center，Container，Text

### 2.4、Center

Center 就是将子 Widget 进行一个居中展示的 Widget，它继承自 Align，因为 Align 默认的对齐方式是居中的，所以它能实现居中效果，如果 Center 的尺寸没有受到限制，那么它将充满整个屏幕

#### 2.4.1、属性

Center 构造方法：

```dart
const Center({ Key? key, double? widthFactor, double? heightFactor, Widget? child })
    : super(key: key, widthFactor: widthFactor, heightFactor: heightFactor, child: child);
```

| 属性  | 作用                    |
| ----- | ----------------------- |
| child | 配置居中显示的子 Widget |


### 2.5、Container

Container 是 Flutter 给我们提供的一个多功能 Widget，如果子 Widget 需要一些背景样式、形状、尺寸限制等，我们就可以利用 Container 来进行包裹，上面的圆形图像就是使用 Container 来实现的

#### 2.5.1、属性

Container 构造方法：


```dart
Container({
    Key? key,
    this.alignment,
    this.padding,
    this.color,
    this.decoration,
    this.foregroundDecoration,
    double? width,
    double? height,
    BoxConstraints? constraints,
    this.margin,
    this.transform,
    this.transformAlignment,
    this.child,
    this.clipBehavior = Clip.none,
  }) : assert(margin == null || margin.isNonNegative),
       assert(padding == null || padding.isNonNegative),
       assert(decoration == null || decoration.debugAssertIsValid()),
       assert(constraints == null || constraints.debugAssertIsValid()),
       assert(clipBehavior != null),
       assert(decoration != null || clipBehavior == Clip.none),
       assert(color == null || decoration == null,
         'Cannot provide both a color and a decoration\n'
         'To provide both, use "decoration: BoxDecoration(color: color)".',
       ),
       constraints =
        (width != null || height != null)
          ? constraints?.tighten(width: width, height: height)
            ?? BoxConstraints.tightFor(width: width, height: height)
          : constraints,
       super(key: key);
```

| 属性       | 作用                      |
| ---------- | ------------------------- |
| child      | 配置显示的子 Widget       |
| color      | 配置 Container 背景颜色   |
| width      | 配置 Container 显示的宽度 |
| height     | 配置 Container 显示的高度 |
| alignment  | 配置子 Widget 的对齐方式  |
| padding    | 配置 Container 內边距     |
| decoration | 配置 Container 装饰       |

decoration 接收一个 Decoration 类型的参数，其实现类：BoxDecoration，BoxDecoration 的属性：

| 属性         | 作用                      |
| ------------ | ------------------------- |
| color        | 配置 Container 背景颜色   |
| border       | 配置 Container 显示的边框 |
| borderRadius | 配置 Container 显示的圆角 |

**注意**：如果 BoxDecoration 设置了 color 属性，就不能设置 Container 的 color 属性，否则会报错，此时在 BoxDecoration 中设置 color 即可

Container 更多属性介绍：https://www.liujunmin.com/flutter/container.html

### 2.6、Text

Text 是 Flutter 给我们提供的文本 Widget，最常用的 Widget 之一，我们可以使用它来实现各种文本效果

#### 2.6.1、属性

Text 构造方法：


```dart
const Text(
    String this.data, {
    Key? key,
    this.style,
    this.strutStyle,
    this.textAlign,
    this.textDirection,
    this.locale,
    this.softWrap,
    this.overflow,
    this.textScaleFactor,
    this.maxLines,
    this.semanticsLabel,
    this.textWidthBasis,
    this.textHeightBehavior,
  }) : assert(
         data != null,
         'A non-null String must be provided to a Text widget.',
       ),
       textSpan = null,
       super(key: key);
```

TextStyle 构造方法：


```dart
const TextStyle({
    this.inherit = true,
    this.color,
    this.backgroundColor,
    this.fontSize,
    this.fontWeight,
    this.fontStyle,
    this.letterSpacing,
    this.wordSpacing,
    this.textBaseline,
    this.height,
    this.leadingDistribution,
    this.locale,
    this.foreground,
    this.background,
    this.shadows,
    this.fontFeatures,
    this.decoration,
    this.decorationColor,
    this.decorationStyle,
    this.decorationThickness,
    this.debugLabel,
    String? fontFamily,
    List<String>? fontFamilyFallback,
    String? package,
    this.overflow,
  }) : fontFamily = package == null ? fontFamily : 'packages/$package/$fontFamily',
       _fontFamilyFallback = fontFamilyFallback,
       _package = package,
       assert(inherit != null),
       assert(color == null || foreground == null, _kColorForegroundWarning),
       assert(backgroundColor == null || background == null, _kColorBackgroundWarning);
```


| 属性     | 作用                                                         |
| -------- | ------------------------------------------------------------ |
| data     | 配置 Text 要显示的字符串，必须配置                           |
| maxLines | 配置 Text 能显示的最大行数                                   |
| overflow | 配置 Text 文字超出屏幕后的处理方式（clip：裁剪，fade：渐隐，ellipsis：...省略） |
| style    | 配置 Text 显示的样式                                         |

style 接收一个 TextStyle 类型的参数，它的属性：

| 属性            | 作用                                                         |
| --------------- | ------------------------------------------------------------ |
| fontSize        | 配置 Text 显示的字体大小                                     |
| fontWeight      | 配置 Text 显示的字体粗细（bold：粗体，normal：正常体）       |
| color           | 配置 Text 显示的文字颜色                                     |
| decoration      | 配置 text 显示的装饰线（none：没有线，lineThrough：删除线，overline：上划线，underline：下划线） |
| decorationColor | 配置 Text 显示的装饰线颜色                                   |
| decorationStyle | 配置 Text 显示的装饰线风格（dashed：长虚线，dotted：点虚线，double：两根线，solid：一根实线，wavy：波浪线） |
| wordSpacing     | 配置 Text 显示的单词间隙                                     |
| letterSpacing   | 配置 Text 显示的字母间隙                                     |
| fontStyle       | 配置 Text 显示的文字样式（italic：斜体，normal：正常体）     |

Text 更多属性介绍：https://juejin.cn/post/6844903724846972942

上面介绍的 Widget 就可以实现效果图了，接下来我们来实现一下它吧

## 三、效果图实现

一个清晰的思路很重要，我们先捋一捋：

1、使用 MaterialApp 和 Scaffold 搭建页面的基本框架

2、使用 AppBar 实现带阴影的顶部标题栏

3、使用 Center 嵌套一个 Container 居中显示，然后通过 Container 属性配置将 Container 设置为带红色边框的圆形图像，Container 嵌套一个 Text ，在对 Text 进行属性配置即可

代码实现如下：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Widget Learning"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: Center(
        child: Container( // Center 嵌套一个 Container
          width: 300, //设置 Container 宽度为 300
          height: 300, //设置 Container 高度为 300
          alignment: Alignment.center, //设置子 Widget 居中
          padding: EdgeInsets.all(20), //设置 Container 內边距为 20
          decoration: BoxDecoration( //设置 Container 装饰
            color: Colors.blue, //设置 Container 背景颜色为蓝色
            border: Border.all(
              color: Colors.red, //设置 Container 边框颜色为红色
              width: 2 //设置 Container 边框的宽度为 2
            ),
            borderRadius: BorderRadius.all(Radius.circular(200)), //设置 Container 的形状为一个圆形
          ),
          child: Text( //Container 嵌套一个 Text
            "Hello erdai str", // 设置 Text 要显示的字符串
            maxLines: 1, //设置 Text 最大显示一行
            overflow: TextOverflow.ellipsis, //设置 Text 文本超过一行 ... 显示
            style: TextStyle( //配置 Text 样式
                fontSize: 28, //设置 Text 的字体大小为 28
                fontWeight: FontWeight.bold, //设置 Text 显示为粗体
                color: Colors.white, //设置 Text 文字颜色为白色
                decoration: TextDecoration.lineThrough, //设置 Text 删除线
                decorationColor: Colors.red, //设置 Text 删除线颜色为红色
                decorationStyle: TextDecorationStyle.dashed, //设置 Text 删除线为虚线
                wordSpacing: 20, //设置 Text 单词之间间距为 20
                letterSpacing: 6, //设置 Text 字母间距为 6
                fontStyle: FontStyle.italic //设置 Text 字体样式为斜体
            ),
          ),
        ),
      ),
    ),
  ));
}
```
上述代码就实现了我们想要的效果，但是有一点点瑕疵，那就是代码都写在 main 方法中，导致 main 方法比较臃肿，那是否有办法对 main 方法中的逻辑进行抽离呢？

答：有的，自定义 Widget 对 main 方法逻辑进行抽离优化

## 四、自定义 Widget

上面讲过，自定义 Widget 先要对 Widget 的状态进行判断，我们这里无需用户交互以及其他因素进行更改，因此是无状态的，继承 StatelessWidget 即可

接下来我们对 body 部分的逻辑进行抽离，封装为一个自定义 Widget，如下：


```dart
class MyBodyPage extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container( // Center 嵌套一个 Container
        width: 300, //设置 Container 宽度为 300
        height: 300, //设置 Container 高度为 300
        alignment: Alignment.center, //设置子 Widget 居中
        padding: EdgeInsets.all(20), //设置 Container 內边距为 20
        decoration: BoxDecoration( //设置 Container 装饰
          color: Colors.blue, //设置 Container 背景颜色为蓝色
          border: Border.all(
              color: Colors.red, //设置 Container 边框颜色为红色
              width: 2 //设置 Container 边框的宽度为 2
          ),
          borderRadius: BorderRadius.all(Radius.circular(200)), //设置 Container 的形状为一个圆形
        ),
        child: Text( //Container 嵌套一个 Text
          "Hello erdai str", // 设置 Text 要显示的字符串
          maxLines: 1, //设置 Text 最大显示一行
          overflow: TextOverflow.ellipsis, //设置 Text 文本超过一行 ... 显示
          style: TextStyle( //配置 Text 样式
              fontSize: 28, //设置 Text 的字体大小为 28
              fontWeight: FontWeight.bold, //设置 Text 显示为粗体
              color: Colors.white, //设置 Text 文字颜色为白色
              decoration: TextDecoration.lineThrough, //设置 Text 删除线
              decorationColor: Colors.red, //设置 Text 删除线颜色为红色
              decorationStyle: TextDecorationStyle.dashed, //设置 Text 删除线为虚线
              wordSpacing: 20, //设置 Text 单词之间间距为 20
              letterSpacing: 6, //设置 Text 字母间距为 6
              fontStyle: FontStyle.italic //设置 Text 字体样式为斜体
          ),
        ),
      ),
    );
  }
}
```
实则就是将 body 部分的代码移过来😂，掌握自定义 Widget 的思路即可，那么 main 方法的代码就简化了很多，如下：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Widget Learning"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: MyBodyPage() //自定义 Widget
    ),
  ));
}
```
## 五、总结

本文重点内容：

1、Flutter 的特点，了解它，能帮助我们更好的学习 Flutter

2、介绍了实现效果图用到的 Widget：MaterialApp，Scaffold，AppBar，Center，Container，Text

3、学习 Widget 实则就是要重点掌握它有哪些属性，我的建议是：掌握常用的，其它的用到时查看源码即
可。另外一个问题：当你不知道属性怎么赋值，也可以通过查看源码了解属性的类型，然后进行相应的赋值

4、介绍了自定义属性，根据状态判断是继承 StatelessWidget 还是 StatefulWidget

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 下篇预告

Flutter Widget 有很多，今天我们只是学习了简单的几个，接下来我还会继续对 Flutter Widget 进行介绍


### 参考和推荐
[Flutter 教程](https://www.bilibili.com/video/BV1S4411E7LY?p=19&vd_source=d0b24cb21c438ff4a9ac2e589eacb3d9)：通俗易懂的 Flutter 入门教程

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
