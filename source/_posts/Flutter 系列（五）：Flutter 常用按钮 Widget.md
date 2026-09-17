---
title: Flutter 系列（五）：Flutter 常用按钮 Widget
date: 2022-10-10 16:54:23
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607145.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607145.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们通过：效果展示 -> Widget 介绍 -> 代码实现的方式对 Image，ListView，GridView，Stack 进行了介绍，并穿插讲解了一些其它 Widget ，最后通过一个综合案例对学习的 Widget 进行了组合使用。还没有看过上一篇文章的朋友，建议先去阅读 [Flutter 系列（四）：Flutter 常用 Widget 二](https://juejin.cn/post/7135827895993237541)。接下来我们对 Flutter 按钮 Widget 进行学习

Flutter 中的按钮 Widget 有很多，常见的按钮 Widget 有：RaisedButton，FlatButton，IconButton，OutlineButton，ButtonBar，FloatingActionButton 等，下面就介绍一下这些常用的 Widget

## 一、Flutter 常用按钮 Widget 介绍

### 1.1、Flutter 按钮 Widget 通用属性

首先介绍一下，按钮 Widget 都有的一些属性：

| 属性名称          | 属性类型           | 说明                                                         |
| ----------------- | ------------------ | ------------------------------------------------------------ |
| onPressed         | VoidCallback       | 此项为必填参数，按下按钮时触发的回调，接收一个方法作为参数，传 null 表示按钮禁用，会显示禁用相关样式 |
| child             | Widget             | 子控件，一般我们会使用文本 Widget 来填充                     |
| textColor         | Color              | 文本颜色                                                     |
| color             | Color              | 按钮背景颜色                                                 |
| disabledColor     | Color              | 按钮禁用时的背景颜色                                         |
| disabledTextColor | Color              | 按钮禁用时的文本颜色                                         |
| splashColor       | Color              | 点击按钮时的水波纹颜色                                       |
| highlightColor    | Color              | 长按按钮后按钮的背景颜色                                     |
| elevation         | double             | 按钮阴影的范围，值越大阴影范围越大                           |
| padding           | EdgeInsetsGeometry | 內边距                                                       |
| shape             | ShapeBorder        | 设置按钮的形状，ShapeBorder 实现类有：<br>RoundedRectangleBorder：圆角形状<br>CircleBorder：圆形形状 |

介绍完了按钮 Widget 的通用属性，接下来我们看下每个按钮初始形态的一个效果，在结合这些按钮做一个综合案例

### 1.2、RaisedButton

RaisedButton 见名知意：凸起的按钮，其实就是 Flutter 给我们提供的 Material Design 风格的按钮：

运行如下代码：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Button Widget"), //设置标题栏标题
        ),
        body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    //使用 ListView 让按钮自适应屏幕宽度
    return ListView(
      //内间距 20
      padding: EdgeInsets.all(20),
      children: [
        //RaisedButton 凸起按钮
        RaisedButton(
          onPressed:(){},
          child: Text("RaisedButton"),
        )
      ],
    );
  }
}
```

效果展示：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608462.png" alt="image-20220828103722122" width="50%" />

默认情况下是一个灰色背景的凸起按钮

### 1.3、FlatButton

FlatButton 见名知意：扁平的按钮，和 RaiseButton 刚好相反，没有凸起的效果。将上述 RaiseButton 换成 FlatButton 效果如下：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608853.png" alt="image-20220828110640212" width="50%" />

可以看到，它没有背景，就像一个文本 Widget 一样

### 1.4、OutlineButton

OutlineButton 见名知意：带线框的按钮，它就像是 FlatButton 加了一个边框。将上述 RaiseButton 换成 OutlineButton 效果如下：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608180.png" alt="outlinebutton.png" width="50%" />

### 1.5、IconButton

IconButton 见名知意：带 Icon 的按钮。将上述 RaiseButton 换成 IconButton 并做属性的调整：

```dart
IconButton(
   icon: Icon(Icons.home),
   onPressed:(){},
)
```

效果如下：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608231.png" alt="image-20220828111723913" width="50%" />

### 1.6、ButtonBar

ButtonBar 是一个按钮组，我们可以在它的 children 属性中放入多个按钮，如下代码：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Button Widget"), //设置标题栏标题
        ),
        body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ButtonBar(
      //按钮组
      children: [
        RaisedButton( //RaisedButton
          onPressed: () {},
          child: Text("RaisedButton"),
        ),
        FlatButton( //FlatButton
          onPressed: () {},
          child: Text("FlatButton"),
        ),
        OutlineButton( //OutlineButton
          onPressed: () {},
          child: Text("OutlineButton"),
        ),
        IconButton( //IconButton
          icon: Icon(Icons.home),
          onPressed: () {},
        )
      ],
    );
  }
}
```

效果：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608004.png" alt="image-20220828112553805" width="50%" />

### 1.7、FloatingActionButton

FloatingActionButton 简称 FAB，可以实现浮动按钮。它常用的一些属性：

| 属性名称           | 属性类型     | 说明                                                         |
| ------------------ | ------------ | ------------------------------------------------------------ |
| onPressed          | VoidCallback | 此项为必填参数，按下按钮时触发的回调，接收一个方法作为参数，传 null 表示按钮禁用，会显示禁用相关样式 |
| child              | Widget       | 子控件，一般为 Icon，不推荐使用文字                          |
| backgroundColor    | Color        | 背景颜色                                                     |
| elevation          | double       | 未点击时候的阴影                                             |
| highlightElevation | double       | 点击时的阴影值，默认为：12.0                                 |
| shape              | ShapeBorder  | 定义 FAB 的形状                                              |
| mini               | bool         | 是否是 mini 类型，默认为：false                              |

如下代码：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Button Widget"), //设置标题栏标题
        ),
        body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(20),
      children: [
        FloatingActionButton( //FloatingActionButton 按钮
          onPressed: (){},
          child: Icon(Icons.search),
          backgroundColor: Colors.lightGreen,
          elevation: 20,
        )
      ],
    );
  }
}
```

效果：



<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608977.png" alt="floatingactionbutton.png" width="50%" />

## 二、Flutter 2.x 按钮 Widget 的变化

如果你是 Flutter 2.x 的版本，你会发现之前的一些按钮 Widget 被废弃了：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608833.png" alt="image-20220828114616994" style="zoom:70%;" width="50%"/>

主要是上面这三个按钮的变化，取而代之的是：

| Flutter 1.x 中的按钮 Widget | Flutter 2.x 中的按钮 Widget |
| --------------------------- | --------------------------- |
| RaisedButton 凸起按钮       | ElevatedButton 凸起按钮     |
| FlatButton 扁平按钮         | TextButton 扁平按钮         |
| OutlinedButton 线框按钮     | OutlinedButton 线框按钮     |

另外在 1.x 中设置的一系列属性，如：color，textColor，elevation，shape等在 2.x 中都被封装到了 style 属性中，style 属性接收一个 ButtonStyle 类型的对象，介绍一下 ButtonStyle 中的常用属性：

| 属性名称        | 属性类型                                  | 说明                                                  |
| --------------- | ----------------------------------------- | ----------------------------------------------------- |
| textStyle       | MaterialStateProperty<TextStyle>          | 文本的样式 但是对于颜色是不起作用的                   |
| backgroundColor | MaterialStateProperty<Color>              | 按钮背景色                                            |
| foregroundColor | MaterialStateProperty<Color>              | 文本及图标颜色                                        |
| overlayColor    | MaterialStateProperty<Color>              | 高亮色，按钮处于 focused，hovered or pressed 时的颜色 |
| shadowColor     | MaterialStateProperty<Color>              | 阴影颜色                                              |
| elevation       | MaterialStateProperty<double>             | 按钮阴影的范围，值越大阴影范围越大                    |
| padding         | MaterialStateProperty<EdgeInsetsGeometry> | 按钮内边距                                            |
| minimumSize     | MaterialStateProperty<Size>               | 按钮最小值                                            |
| fixedSize       | MaterialStateProperty<Size>               | 按钮大小                                              |
| maximumSize     | MaterialStateProperty<Size>               | 按钮最大值                                            |
| side            | MaterialStateProperty<BorderSide>         | 边框                                                  |
| shape           | MaterialStateProperty<OutlinedBorder>     | 设置按钮的形状                                        |
| alignment       | AlignmentGeometry                         | 按钮子 Widget 对齐方式                                |

实践对比：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Button Widget"), //设置标题栏标题
        ),
        body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(20),
      children: [
        RaisedButton( //RaisedButton
          onPressed: (){},
          child: Text("RaisedButton"),
          textColor: Colors.white, //文本颜色
          color: Colors.green, //按钮背景颜色
          splashColor: Colors.red, //水波纹颜色
          elevation: 20, //阴影的范围
          shape: RoundedRectangleBorder( //设置 20 的圆角
            borderRadius: BorderRadius.circular(20)
          )
        ),
        SizedBox(height: 40),
        ElevatedButton( //ElevatedButton
            onPressed: (){},
            child: Text("ElevatedButton"),
            style: ButtonStyle(
              foregroundColor: MaterialStateProperty.all(Colors.white), //文本颜色
              backgroundColor: MaterialStateProperty.all(Colors.green), //按钮背景颜色
              overlayColor: MaterialStateProperty.all(Colors.red), //水波纹颜色
              elevation: MaterialStateProperty.all(20), //阴影的范围
              shape: MaterialStateProperty.all(//设置 20 的圆角
                  RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20)
                  )
              )
            ),
        )
      ],
    );
  }
}
```

效果：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608456.png" alt="image-20220828134202212" width="50%" />

## 三、按钮 Widget 组合之综合案例

在讲综合案例之前我们先学习下 BottomNavigationBar ，一会会用到

### 3.1、BottomNavigationBar 介绍

BottomNavigationBar 是 Flutter 给我们提供的底部导航栏 Widget，一般用在 Scaffold 的 bottomNavigationBar 属性中

BottomNavigationBar 常用属性介绍：

| 属性名称            | 属性类型                      | 说明                                                         |
| ------------------- | ----------------------------- | ------------------------------------------------------------ |
| items               | List<BottomNavigationBarItem> | 必须属性，最少要有两个子 Widget                              |
| onTap               | ValueChanged                  | Widget 点击事件                                              |
| currentIndex        | int                           | 当前显示的是哪个 Widget                                      |
| elevation           | double                        | 阴影范围                                                     |
| type                | BottomNavigationBarType       | BottomNavigationBarType.fixed：固定<br>BottomNavigationBarType.shifting：可滑动 |
| fixedColor          | Color                         | 相当于 selectedItemColor，但是不能跟 selectedItemColor 同时存在 |
| backgroundColor     | Color                         | 背景颜色                                                     |
| iconSize            | double                        | 设置图标大小                                                 |
| selectedItemColor   | Color                         | 设置 Widget 选中的颜色                                       |
| unselectedItemColor | Color                         | 设置 Widget 未选中的颜色                                     |
| selectedFontSize    | double                        | 设置 Widget 选中时文字的大小                                 |
| unselectedFontSize  | double                        | 设置 Widget 未选中时文字的大小                               |

运行下面代码：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Button Widget"), //设置标题栏标题
        ),
        bottomNavigationBar: MyBottomNavigationBar(),
    ),
  ));
}

class MyBottomNavigationBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
        iconSize: 35, //图标大小 35
        fixedColor: Colors.green, //图片颜色绿色
        type: BottomNavigationBarType.fixed, //item 固定显示
        items: [ //设置了 3 个 子 item
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "首页"),
          BottomNavigationBarItem(icon: Icon(Icons.category), label: "分类"),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: "设置")
        ]);
  }
}
```

效果：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281608350.png" width="30%"/>

### 3.2、综合案例

接下来我们就使用按钮 Widget 组合来实现如下效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281609826.png" alt="button_together.png" width="30%" />

简单的分析下这个页面：最外层有个内间距（Padding），接下来就是一个从上往下排列的垂直布局（Column），垂直布局里面有一系列使用 button 实现的按钮，简单起见，我们这里使用 Flutter 1.x 系列的 Button 去实现，最后底部有一个 BottomNavigationBar，BottomNavigationBar 中间有一个凸起的 FloatingActionButton，类似咸鱼中间发布按钮的效果。

接下来，我们就用代码实现一下：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Button Practice"), //设置标题栏标题
      ),
      body: MyBodyPage(), //自定义 body Wdiget
      bottomNavigationBar: MyBottomNavigationBar(), //自定义 bottomNavigationBar Widget
      floatingActionButton: MyFloatingActionButton(), //自定义 floatingActionButton Widget
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked, //floatingActionButton 在底部中心停靠
    ),
  ));
}

//自定义 BottomNavigationBar
class MyBottomNavigationBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
        iconSize: 35, //图标大小 35
        fixedColor: Colors.green, //选中颜色为绿色
        type: BottomNavigationBarType.fixed, //item 固定显示
        items: [ //设置了 3 个 子 item
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "首页"),
          BottomNavigationBarItem(icon: Icon(Icons.category), label: "分类"),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: "设置")
        ]);
  }
}

//自定义 FloatingActionButton
class MyFloatingActionButton extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    //使用 Container 包裹 FloatingActionButton 在外层加一个白色的边框
    return  Container(
      width: 80,
      height: 80,
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(40)
      ),
      child: FloatingActionButton(
        backgroundColor: Colors.yellow,
        onPressed: (){},
        child: Icon(Icons.add),
      ),
    );
  }
}

class MyBodyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(//Padding 实现内间距 20
      padding: EdgeInsets.all(20),
      child: Column(
        children: [
          Row( //第一排：普通按钮 + 红色按钮 + 带阴影的按钮
            children: [
              RaisedButton(
                onPressed: (){},
                child: Text("普通按钮"),
              ),
              SizedBox(width: 20),
              RaisedButton(
                onPressed: (){},
                child: Text("红色按钮"),
                color: Colors.red,
                textColor: Colors.white,
              ),
              SizedBox(width: 20),
              RaisedButton(
                onPressed: (){},
                child: Text("带阴影的按钮"),
                color: Colors.blue,
                textColor: Colors.white,
                elevation: 20,
              )
            ],
          ),
          SizedBox(height: 20),
          Container( //第二排：自适应按钮
            height: 60,
            width: double.infinity,
            child: RaisedButton(
              onPressed: () {},
              child: Text("自适应按钮"),
              textColor: Colors.white,
              color: Colors.blue,
            ),
          ),
          SizedBox(height: 20),
          Row(children: [ //第三排：icon 按钮 + 有宽高的按钮
            RaisedButton.icon(
              onPressed: (){},
              icon: Icon(Icons.home),
              label: Text(" Icon 按钮"),
              color: Colors.yellow,
              textColor: Colors.green,
            ),
            SizedBox(width: 20),
            Container(
              height: 60,
              width: 200,
              child: RaisedButton(
                onPressed: () {},
                child: Text("有宽高的按钮"),
                textColor: Colors.white,
                color: Colors.orange,
              ),
            )
          ]),
          SizedBox(height: 20),
          Container( //第四排：自适应带圆角的按钮
            height: 60,
            width: double.infinity,
            child: RaisedButton(
              onPressed: () {},
              child: Text("自适应带圆角的按钮"),
              textColor: Colors.white,
              color: Colors.blue,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(100)
              ),
            ),
          ),
          SizedBox(height: 20),
          Container( //第五排：圆形按钮
            height: 100,
            width: 150,
            child: RaisedButton(
              onPressed: () {},
              child: Text('圆形按钮'),
              textColor: Colors.white,
              color: Colors.lightGreen,
              elevation: 20,
              splashColor: Colors.green,
              shape: CircleBorder(side: BorderSide(color: Colors.white)),
            ),
          ),
          SizedBox(height: 20),
          Container( //第六排：注册按钮
            width: double.infinity,
            height: 50,
            margin: EdgeInsets.fromLTRB(20, 0, 20, 0),
            child:  OutlineButton(
              child: Text("注册"),
              onPressed: (){},
              borderSide: BorderSide(
                  width: 1,
                  color: Colors.red
              ),
            ),
          ),
          SizedBox(height: 20),
          Container( //第七排：登陆按钮
            width: double.infinity,
            height: 50,
            margin: EdgeInsets.fromLTRB(20, 0, 20, 0),
            child:  RaisedButton(
              child: Text("登陆"),
              onPressed: (){},
              color: Colors.blue,
              textColor: Colors.white,
            ),
          )
        ],
      ),
    );
  }
}
```

## 四、总结

本篇我们讲了：

1、Flutter 中常用的按钮 Widget ：RaisedButton，FlatButton，IconButton，OutlineButton，ButtonBar，FloatingActionButton

2、介绍了 Flutter 1.x 和 Flutter 2.x 按钮相关的变化及使用

>Flutter 2.x 中常用的属性都被封装到了 style 属性中

3、介绍了 BottomNavigationBar，并通过 Flutter 1.x 相关 Button + BottomNavigationBar + FloatingActionButton 实现了一个综合案例

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会介绍 Flutter 表单相关 Widget ，尽请期待吧😄


### 参考和推荐

[Flutter 教程](https://www.bilibili.com/video/BV1S4411E7LY?p=19&vd_source=d0b24cb21c438ff4a9ac2e589eacb3d9)：通俗易懂的 Flutter 入门教程

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
