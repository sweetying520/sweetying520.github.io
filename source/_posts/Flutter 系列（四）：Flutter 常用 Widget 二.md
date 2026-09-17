---
title: Flutter 系列（四）：Flutter 常用 Widget 二
date: 2022-10-10 16:54:15
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281606296.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281606296.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们介绍了 Flutter 特点以及一些常用的 Widget：MaterialApp，Scaffold，AppBar，Center，Container，Text。还没有看过上一篇文章的朋友，建议先去阅读 [Flutter 系列（三）：Flutter 特点及常用 Widget 介绍](https://juejin.cn/post/7134343543975313445)。接下来我们继续对 Flutter Widget 进行学习

下面我会通过：效果展示 -> Widget 讲解 -> 代码实现的方式对 Widget 进行介绍，最后在通过 Widget 组合编写一个综合的案例

## 一、Flutter Widget 之 Image

Image 是 Flutter 给我们提供显示图片的 Widget

先看一眼使用 Image 实现的效果

### 1.1、Image 效果展示

![flutter_01 (2).png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281606333.png)


刘亦菲的圆形图片😄，美爆了。言归正传，大家可以先想一下怎么去实现？

### 1.2、Image 介绍

Image 组件有很多构造方法，这里给大家讲两个常用的：

1、Image.network ：加载远程图片

2、Image.asset ：加载本地图片

上面这两个属于 Image 的命名构造方法，对命名构造方法还不熟悉的赶紧先去看一下我的另一篇文章[传送门](https://juejin.cn/post/7130647339294785549#heading-0)

#### 1.2.1、Image.network 加载远程图片

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Image Widget"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Image.network("https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg");
  }
}
```

上述代码很简单，就是使用 Image.network 传入一张图片 url ，这样就可以将这张网络图片显示出来了：


![flutter_02.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281606526.png)

#### 1.2.2、Image.asset 加载本地图片

加载本地图片稍微复杂一些

1、新建图片目录，引入图片资源


![flutter_03 (2).png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281606032.png)

我们新建了 images 文件夹，并在 images 下放入了图片资源，又新建了 2.0x 和 3.0x 文件夹分别对应 2 倍图和 3 倍图，这样就能保证不同手机分辨率的手机加载对应文件夹下的图片资源

2、打开 pubspec.yaml 配置文件声明一下我们添加的图片


![flutter_04 (1).png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281606655.png)

3、最后在代码中使用就可以了

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Image Widget"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Image.asset("images/ic_launcher_round.png");
  }
}
```

效果如下：


![flutter_05.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607201.png)

#### 1.2.3、Image 常用属性

| 名称                    | 类型      | 说明                                                         |
| ----------------------- | --------- | ------------------------------------------------------------ |
| alignment               | Alignment | 图片的对齐方式                                               |
| color 和 colorBlendMode |           | 设置图片的背景颜色，通常和 colorBlendMode 配合一起使用，这样可以使图片颜色和背景色混合 |
| fit                     | BoxFit    | fit 属性用来控制图片的拉伸和挤压，这都是根据父容器来的：<br/>BoxFit.fill：全图显示，图片会被拉伸，并充满父容器<br/>BoxFit.contain：全图显示，显示原比例，可能会有空隙<br/>BoxFit.cover：显示可能拉伸，可能裁切，充满（图片要充满整个容器，还不变形）<br/>BoxFit.fitWidth：宽度充满(横向充满)，显示可能拉伸， 可能裁切<br/>BoxFit.fitHeight：高度充满(竖向充满),显示可能拉 伸，可能裁切<br/>BoxFit.scaleDown：效果和 contain 差不多，但是此属性不允许显示超过原图片大小，可小不可大 |
| width                   |           | 宽度，一般结合 ClipOval Widget 才能看到效果                  |
| height                  |           | 高度，一般结合 ClipOval Widget 才能看到效果                  |

更多属性参考：https://api.flutter.dev/flutter/widgets/Image-class.html

**PS**：ClipOval 是一个裁剪子 Widget 为椭圆的 Widget，常用于圆形，圆角图片等

### 1.3、效果实现

回顾 1.1 的效果：其实就是一个居中展示的圆形图片

这里我们可以使用 Center 进行居中，然后使用 Image + ClipOval 配合相关属性实现圆形图片：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Image Widget"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Center(
      child: ClipOval(
        child: Image.network(
          "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
          width: 300, //设置图片的宽度为 300
          height: 300, //设置图片的高度为 300
          fit: BoxFit.cover, //设置图片等比放大，充满父容器
        ),
      ),
    );
  }
}
```

上述代码就实现了我们想要的效果

## 二、Flutter Widget 之 ListView

列表是我们项目开发中最常用的一种布局方式，Flutter 给我们提供了 ListView 来定义列表，它支持垂直和水平方向展示，通过一个属性就可以控制列表的显示方向

### 2.1、效果展示


![flutter_06.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607604.png)

### 2.2、ListView 介绍

#### 2.2.1、常用属性介绍

| 名称            | 类型               | 说明                                                 |
| --------------- | ------------------ | ---------------------------------------------------- |
| scrollDirection | Axis               | Axis.horizontal 水平列表 <br/>Axis.vertical 垂直列表 |
| padding         | EdgeInsetsGeometry | 內边距                                               |
| resolve         | bool               | 组件反向排序                                         |
| children        | List<Widget>       | 列表元素                                             |

更多属性参考：https://api.flutter.dev/flutter/widgets/ListView-class.html

ListView 的 children 能嵌套各种 Widget 去实现列表 UI 效果

#### 2.2.2、ListTile 介绍

ListTile 是一个列表 item Widget ，通常用于各种列表中，其常用的属性有：

| 名称        | 类型   | 说明         |
| ----------- | ------ | ------------ |
| leading     | Widget | 左侧组件     |
| title       | Widget | 标题         |
| subtitle    | Widget | 副标题       |
| trailing    | Widget | 右侧组件     |
| onTap       |        | 点击事件回调 |
| onLongPress |        | 长按事件回调 |

更多属性参考：https://api.flutter.dev/flutter/material/ListTile-class.html

下面我们使用 ListView + ListTile 实现一个效果：

```dart
import 'package:flutter/material.dart';

void main() {

  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter ListView Widget"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        ListTile(
          leading: Icon(Icons.search),
          title: Text("标题1"),
          subtitle: Text("描述1"),
          trailing: Icon(Icons.home),
        ),
        ListTile(
          leading: Icon(Icons.search),
          title: Text("标题2"),
          subtitle: Text("描述2"),
          trailing: Icon(Icons.home)
        ),
        ListTile(
          leading: Icon(Icons.search),
          title: Text("标题3"),
          subtitle: Text("描述3"),
          trailing: Icon(Icons.home)
        )
      ],
    );
  }
}
```

效果图：


![flutter_07.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607879.png)

### 2.3、效果实现

上面 2.1 展示的效果就是：ListTile + 横线作为一个 item 进行排列，如何将这两个 Widget 包装为一个整体，我们就要学习下 Column 

1、Column 介绍

Column 是 Flutter 给我们提供的垂直布局 Widget，其常用属性有：

| 名称               | 类型               | 说明           |
| ------------------ | ------------------ | -------------- |
| mainAxisAlignment  | MainAxisAlignment  | 主轴的排序方式 |
| crossAxisAlignment | CrossAxisAlignment | 次轴的排序方式 |
| children           | List<Widget>       | 组件子元素     |

更多属性参考：https://api.flutter.dev/flutter/widgets/Column-class.html

同样 Flutter 给我们提供了水平布局 Widget Row，常用属性和 Column 一样

2、横线我们直接使用 Divider

ok，现在就可以去实现效果图了，上面 2.2 的例子 ListView 里面的数据都是写死的，不灵活，接下来我们使用 ListView 的命名构造方法 ListView.Builder 来实现动态加载：

```dart
import 'package:flutter/material.dart';

void main() {

  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter ListView Widget"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget{

  //mock 数据：相当于 List<Map>
  var mDataList = [
    {
      "title":"标题1",
      "desc":"描述1",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题2",
      "desc":"描述2",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题3",
      "desc":"描述3",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题4",
      "desc":"描述4",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题5",
      "desc":"描述6",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(//通过 ListView.builder 实现数据的动态加载
        itemCount: mDataList.length, //item 的个数
        itemBuilder: (context, index) { //通过 itemBuilder 构建 Widget
          return Column(
            children: [ //Column 里面包装了 ListTile + Divider
              ListTile(
                leading: ClipOval( //圆形图片
                  child: Image.network(
                    mDataList[index]["image"] ?? "",
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                  ),
                ),
                title: Text(mDataList[index]["title"] ?? ""), //标题
                subtitle: Text(mDataList[index]["desc"] ?? ""), //副标题
              ),
              Divider() //横线
            ],
          );
        });
  }
}
```

上述代码就实现了我们想要的效果

## 三、Flutter Widget 之 GridView

GridView 是 Flutter 给我们提供的网格布局 Widget，我们快速过一下，然后实现一些效果：

GridView 创建网格列表有多种方式，主要介绍两种：

1、通过 GridView.count 实现网格布局

2、通过 GridView.builder 实现网格布局

**常用属性**：

| 名称             | 类型               | 说明                                                 |
| ---------------- | ------------------ | ---------------------------------------------------- |
| scrollDirection  | Axis               | Axis.horizontal 水平列表 <br/>Axis.vertical 垂直列表 |
| padding          | EdgeInsetsGeometry | 內边距                                               |
| resolve          | bool               | 组件反向排序                                         |
| children         | List<Widget>       | 列表元素                                             |
| crossAxisSpacing | double             | 水平子 Widget 之间间距                               |
| mainAxisSpacing  | double             | 垂直子 Widget 之间间距                               |
| crossAxisCount   | int                | 一行的 Widget 数量                                   |
| childAspectRatio | double             | 子 Widget 宽高比例                                   |
| gridDelegate     | SliverGridDelegate | 控制布局主要用在 GridView.builder 里面               |

### 3.1、Flutter GridView.count 实现网格布局

```dart
import 'package:flutter/material.dart';

void main() {

  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter ListView Widget"),//设置标题栏标题
        elevation: 30,//设置标题栏阴影
      ),
      body: MyBodyPage() //自定义 Widget
    ),
  ));
}

class MyBodyPage extends StatelessWidget{

  //mock 数据
  var mDataList = [
    {
      "title":"标题1",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题2",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题3",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题4",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title":"标题5",
      "image":"https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
  ];

  List<Widget> _getListWidget() {
    var listWidget = mDataList.map((value) {
      return Container(
        decoration: //设置一个宽度为 1 绿色的边框
          BoxDecoration(border: Border.all(color: Colors.green, width: 1.0)),
        child: Column( //垂直布局里面嵌套：Expanded + SizedBox + Text + SizedBox
          children: [
            Expanded( //展开 Widget，类似 Android 里面 Linearlayout 设置权重，用在这是让图片自适应展开
              child: Image.network(// 图片
                value["image"] ?? "",
                fit: BoxFit.cover,
                width: double.infinity, //设置图片的宽度为屏幕的宽度
              ),
            ),
            SizedBox(height: 12),//设置一个高度为 12 的空白间距
            Text( // 设置文本
                value["title"] ?? "",
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 20
                )
            ),
            SizedBox(height: 12),//设置一个高度为 12 的空白间距
          ],
        ),
      );
    });
    return listWidget.toList();
  }

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,// 设置一行显示 Widget 数量为 2
      padding: EdgeInsets.all(20), //设置 GridView 內边距为 20
      crossAxisSpacing: 20, //设置水平子 Widget 之间的间距为 20
      mainAxisSpacing: 20,  //设置垂直子 Widget 之间的间距为 20
      children: _getListWidget() //设置子 Widget
    );
  }
}
```

上述代码中我们使用了两个新 Widget：Expanded，SizeBox

1、Expanded 是用于展开子 Widget 的 Widget，常用于 Row，Column 中，其 flex 属性就是用来设置权重的，类似于 Android 的 LinearLayout 设置权重

2、SizeBox 主要是用来指定一段间距的，其有两个属性，width，height。如果设置 width 就是指定宽度，如果设置 height 就是指定高度

实现效果：


![flutter_08.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607517.png)

### 3.2、Flutter GridView.builder 实现网格布局

同样的效果，我们使用 GridView.builder 来实现

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter GridView Widget"), //设置标题栏标题
          elevation: 30, //设置标题栏阴影
        ),
        body: MyBodyPage() //自定义 Widget
        ),
  ));
}

class MyBodyPage extends StatelessWidget {
  //mock 数据
  var mDataList = [
    {
      "title": "标题1",
      "image": "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title": "标题2",
      "image": "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title": "标题3",
      "image": "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title": "标题4",
      "image": "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
    {
      "title": "标题5",
      "image": "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
    },
  ];

  Widget _getListWidget(context, index) {
    return Container(
      decoration: //设置一个宽度为 1 绿色的边框
          BoxDecoration(border: Border.all(color: Colors.green, width: 1.0)),
      child: Column(
        //垂直布局里面嵌套：Expanded + SizedBox + Text + SizedBox
        children: [
          Expanded(
            //扩展 Widget，类似 Android 里面 Linearlayout 设置权重，用在这是让图片自适应
            child: Image.network(
              // 图片
              mDataList[index]["image"] ?? "",
              fit: BoxFit.cover,
              width: double.infinity, //设置图片的宽度为屏幕的宽度
            ),
          ),
          SizedBox(height: 12), //设置一个高度为 12 的空白间距
          Text(
              // 设置文本
              mDataList[index]["title"] ?? "",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20)),
          SizedBox(height: 12), //设置一个高度为 12 的空白间距
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
        itemCount: mDataList.length,
        padding: EdgeInsets.all(20),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, //设置一行有两个 Widget
          crossAxisSpacing: 20, //设置水平子 Widget 之间的间距为 20
          mainAxisSpacing: 20, //设置垂直子 Widget 之间的间距为 20
          childAspectRatio: 1, //设置子组件宽高比例为 1
        ),
        itemBuilder: _getListWidget //将方法作为一个参数传入
        );
  }
}
```

## 四、Flutter Widget 之 Stack

Stack 是 Fluter 提供的叠层 Widget ，类似 Android 的 FrameLayout

**常用属性**：

| 名称      | 类型              | 说明                     |
| --------- | ----------------- | ------------------------ |
| alignment | AlignmentGeometry | 配置所有子元素的显示位置 |
| children  | List<Widget>      | 子组件                   |

通常它会配合 Align 或 Positioned 实现定位布局

**Align 常用属性**

| 名称      | 类型              | 说明                 |
| --------- | ----------------- | -------------------- |
| alignment | AlignmentGeometry | 配置子元素的显示位置 |
| child     | Widget            | 子组件               |

**Positioned 常用属性**

| 名称   | 类型   | 说明                 |
| ------ | ------ | -------------------- |
| top    | double | 子元素距离顶部的距离 |
| bottom | double | 子元素距离底部的距离 |
| left   | double | 子元素距离左侧距离   |
| right  | double | 子元素距离右侧距离   |
| child  | Widget | 子组件               |

下面我们实现如下效果：


![flutter_09.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607392.png)

### 4.1、Stack + Align 实现定位布局

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Stack Widget"), //设置标题栏标题
          elevation: 30, //设置标题栏阴影
        ),
        body: MyBodyPage() //自定义 Widget
        ),
  ));
}

class MyBodyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Align(
          alignment: Alignment.topLeft,//左上
          child: Container(
            width: 100,
            height: 100,
            color: Colors.red,
          ),
        ),
        Align(
          alignment: Alignment.topRight,//右上
          child: Container(
            width: 100,
            height: 100,
            color: Colors.orange,
          ),
        ),
        Align(
          alignment: Alignment.center,//中间
          child: Container(
            width: 100,
            height: 100,
            color: Colors.yellow,
          ),
        ),
        Align(
          alignment: Alignment.bottomLeft,//左下
          child: Container(
            width: 100,
            height: 100,
            color: Colors.green,
          ),
        ),
        Align(
          alignment: Alignment.bottomRight,//右下
          child: Container(
            width: 100,
            height: 100,
            color: Colors.blue,
          ),
        )
      ],
    );
  }
}
```

### 4.2、Stack + Positioned 实现定位布局

这种方式必须指定精确的宽高，在不同分辨率的手机，可能显示会有点问题，优先还是使用 Stack + Align 实现定位布局，如果对 UI 的小偏差能忽略不计，用这个也可以

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Stack Widget"), //设置标题栏标题
          elevation: 30, //设置标题栏阴影
        ),
        body: MyBodyPage() //自定义 Widget
        ),
  ));
}

class MyBodyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final screenWidth = size.width; //获取屏幕宽度
    final screenHeight = size.height; //获取屏幕高度
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: Stack(
        children: [
          Positioned(//左上
            child: Container(
              width: 100,
              height: 100,
              color: Colors.red,
            ),
          ),
          Positioned(//右上
            left: screenWidth - 100,
            child: Container(
              width: 100,
              height: 100,
              color: Colors.orange,
            ),
          ),
          Positioned(//中间
            left: screenWidth / 2 - 50,
            top: screenHeight / 2 - 90,
            child: Container(
              width: 100,
              height: 100,
              color: Colors.yellow,
            ),
          ),
          Positioned(//左下
            top: screenHeight - 180,
            child: Container(
              width: 100,
              height: 100,
              color: Colors.green,
            ),
          ),
          Positioned(//右下
            left: screenWidth - 100,
            top: screenHeight - 180,
            child: Container(
              width: 100,
              height: 100,
              color: Colors.blue,
            ),
          )
        ],
      ),
    );
  }
}
```

## 五、Widget 组合之综合案例

讲综合案例之前我们介绍下 Padding：

Padding 是 Flutter 给我们提供展示内间距的 Widget，为啥要提供这个 Widget 呢？因为很多 Widget 都没有 padding 属性，这个时候我们可以用 Padding 处理与子 Widget 的內间距，其常用的属性如下：

| 名称    | 类型               | 说明                                |
| ------- | ------------------ | ----------------------------------- |
| padding | EdgeInsetsGeometry | padding 值, EdgeInsets 设置填充的值 |
| child   | Widget             | 子组件                              |

ok，接下来看下综合案例要实现的效果：


![flutter_10.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607204.png)

先捋一捋实现的思路：首页我们看到这个页面整体有一个内间距（Padding），元素划分为 4 块，从上到下垂直排列，可以使用 Column，在看具体的每一块：

第一块：一个黑色的长方形，可以使用 Container 实现

第二块：左边一张长图，右边先整体也看成一张图片，左右比例 2 : 1，因此我们可以使用 Row + Expanded 实现，在看右边这块整体又分上下两张图片，为了让这两张图片自适应宽度，这里我们可以使用 ListView 嵌套两个 Image

第三块：左中右三张图片，我们可以使用 Stack + Align 定位布局实现

第四块：直接使用 ListTile 实现，ListTile 的 leading 为一个圆形图片

另外还有一些小小的细节，如每一块之间的间距，横线，每一块内部的间距，这些我们使用 SizedBox，Divider 实现

通过上面的分析，我整理出了一张结构图：


![flutter_11 (2).png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281607887.png)

接下来，我们就用代码实现一下：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text("Flutter Widget Combine Pricetice"),
          elevation: 30, //设置标题阴影
        ),
        body: MyHome(),
      ),
    );
  }
}

class MyHome extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding( //Padding 实现页面內间距
      padding: EdgeInsets.all(10),
      child: Column( //Column 实现布局垂直排列
        children: [
          Container( //Container 实现黑色长方形
              color: Colors.black,
              height: 180
          ),
          SizedBox(height: 10), //高度为 10 的间距
          Row( // Row + Expanded 实现横向布局的等比分配
            children: [
              Expanded(
                  flex: 2,
                  child: Container( //Container 嵌套 Image 实现左边长图
                    child: Image.network(
                        "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
                        fit: BoxFit.cover,
                        height: 100),
                  )),
              SizedBox(width: 10), //高度为 10 的间距
              Expanded(
                flex: 1,
                child: Container( //Container 嵌套 ListView 实现右边上下两张自适应图
                  height: 100,
                  child: ListView(
                    children: [
                      Image.network(
                          "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
                          fit: BoxFit.cover,
                          height: 45),
                      SizedBox(height: 10), //高度为 10 的间距
                      Image.network(
                          "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
                          fit: BoxFit.cover,
                          height: 45),
                    ],
                  ),
                ),
              )
            ],
          ),
          Divider(), //横线
          Stack( // Stack + Align 实现定位布局
            children: [
              Align(
                  alignment: Alignment.topLeft,
                  child: Image.network("https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover)
              ),
              Align(
                  alignment: Alignment.topCenter,
                  child: Image.network("https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover)
              ),
              Align(
                  alignment: Alignment.topRight,
                  child: Image.network("https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover)
              )
            ],
          ),
          Divider(), //横线
          ListTile( // ListTile 实现 item
            leading: ClipOval( //圆形图片
              child: Image.network(
                "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg",
                width: 50,
                height: 50,
                fit: BoxFit.cover,
              ),
            ),
            title: Text(
              "你好，我是刘亦菲",//标题
              style: TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.bold
              )
            ),
            subtitle: Text(
                "很高兴认识你",//副标题
                style: TextStyle(
                  color: Colors.orange,
                )
            ),
          )
        ],
      ),
    );
  }
}
```

## 六、总结

本文重点内容：

1、采用 效果 -> Widget 介绍 -> 代码实现的方式对 Image，ListView，GridView，Stack 进行了介绍

2、在介绍上面 Widget 的过程中，我们又穿插了其它一些 Widget 的讲解：ClipOval，ListTile，Expanded，SizedBox，Divider，Align，Positioned，Padding

3、最后通过一个综合案例对介绍的 Widget 进行组合使用

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会介绍 Flutter Button 相关 Widget，以及 Flutter 2.x Button 的变化


### 参考和推荐

[Flutter 官方 API 文档](https://api.flutter.dev/flutter/dart-ui/dart-ui-library.html)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
