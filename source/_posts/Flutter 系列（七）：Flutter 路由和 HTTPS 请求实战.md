---
title: Flutter 系列（七）：Flutter 路由和 HTTPS 请求实战
date: 2022-10-10 16:54:25
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281604511.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281604511.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们介绍了 Flutter 中常用的表单 Widget：TextField，CheckBox，Radio，Switch，CheckboxListTile，RadioListTile，SwitchListTile，Slider，最后通过这些 Widget 实现了一个综合案例。还没有看过上一篇文章的朋友，建议先去阅读 [Flutter 系列（六）：Flutter 常用表单 Widget](https://juejin.cn/post/7137457377959706654)。接下来我们对 Flutter 路由和 HTTPS 请求实战进行介绍

## 一、Flutter 路由

1）、Flutter 中的路由简单理解就是页面跳转。Flutter 通过 Navigator 组件管理路由导航，并提供了管理堆栈的方法。如：Navigator.push，Navigator.pop

2）、Flutter 给我们提供了两种配置路由跳转的方式：

> 1、基本路由
>
> 2、命名路由

### 1.1、基本路由

#### 1.1.1、基本路由使用

假设我们有两个页面：HomePage.dart，SearchPage.dart，先看一眼它们初始的一个代码：

```dart
//1、HomePage.dart
import 'package:flutter/material.dart';
import 'package:flutterapplication/route/Routes.dart';

void main() {
  runApp(MaterialApp(
      home: HomePage()
  ));
}


class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("HomePage"), //设置标题栏标题
      ),
      body: Center(
        child: RaisedButton(
          child: Text("跳转到 SearchPage"),
          //按钮点击事件
          onPressed: () {
            
          },
        ),
      ), 
    );
  }
}


//2、SearchPage.dart
import 'package:flutter/material.dart';

class SearchPage extends StatelessWidget{

  final arguments;
	
  //可选参数 arguments
  SearchPage({this.arguments});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            title: const Text('SearchPage')
        ),
        body: Center(
          child: Text("搜索页面内容区域：$arguments"),
        )
    );
  }
}
```

上述代码很简单，现在我们想从 HomePage 跳转到 SearchPage，需要以下两步：

1、在 HomePage.dart 中引入 SearchPage.dart 

```dart
//1、绝对路径
import 'package:flutterapplication/pages/SearchPage.dart';
//2、相对路径
import '../SearchPage.dart';
```

**Tips**：日常开发中建议统一使用绝对路径

2、在 HomePage 的点击事件中通过如下方法跳转

```dart
//方式一
Navigator.push(context, MaterialPageRoute(builder: (context){
  return SearchPage();
}));

//方式二
Navigator.of(context).push(
  MaterialPageRoute(builder: (context){
    return SearchPage();
  })
);

//上述两种方式是等价的，实际上方式一是对方式二的封装
```

经过上面两步我们就可以跳转到 SearchPage 页面了

此时还只是简单的跳转，如果我想向 SearchPage 传值呢？

#### 1.1.2、基本路由传值

实则就是在 SearchPage 的构造方法中增加实参

```dart
Navigator.of(context).push(
  MaterialPageRoute(builder: (context){
    return SearchPage(arguments: "erdai666");
  })
);
```

这种基本路由的使用有一个缺点：**不能进行路由的统一管理**。如果我们想把路由统一管理，就需要使用到命名路由

### 1.2、命名路由

#### 1.2.1、命名路由使用

命名路由就是给每个页面设置一个字符串别名，通常是以 / 开头，如："/searchPage"。还是以 1.1.1 的例子进行举例：

1、此时我们可以新建一个 .dart 文件进行路由的统一管理，我这里叫 Routes.dart ：

```dart
String homePage = "/";
String searchPage = "/searchPage";

final routes = {
  homePage: (context) => HomePage(),
  searchPage: (context) => SearchPage()
};

//下面这段代码是将一个匿名方法赋值给一个变量
//匿名方法做的事情：处理路由传参，生成 MaterialPageRoute 路由对象
var onGenerateRoute = (settings) {
  Function? pageContentBuilder = routes[settings.name];
  if (pageContentBuilder != null) {
    if (settings.arguments != null) {
      var route = MaterialPageRoute(
          builder: (context) =>
              pageContentBuilder(context, arguments: settings.arguments));
      return route;
    } else {
      var route =
      MaterialPageRoute(builder: (context) => pageContentBuilder(context));
      return route;
    }
  }
};
```

**Tips**：通常我们会以 '/' 表示 App 启动页的路由

2、在 HomePage.dart 中新增如下配置：

```dart
//导包
import 'package:flutterapplication/route/Routes.dart';

void main() {
  runApp(MaterialApp(
      //app 启动路由页面
      initialRoute: homePage,
      //路由生成
      onGenerateRoute: onGenerateRoute,
      //...
  ));
}
```

3、在 HomePage 的点击事件中通过如下方法跳转

```dart
//方式一
Navigator.pushNamed(context, searchPage);

//方式二
Navigator.of(context).pushNamed(searchPage);

//上述两种方式是等价的，实际上方式一是对方式二的封装
```

这里我们可以发现一个规律：**Navigator 提供了两种 Api 调用方式：`Navigator.api...` 和 `Navigator.of(context).api...`，前者是后者的一个封装**，后面我们都以前者举例

#### 1.2.2、命名路由传值

实则就是给 SearchPage 的构造方法传入实参：

1、修改  Routes.dart 中的路由跳抓

```dart
//...
final routes = {
  //改动点：新增 arguments 命名参数传给 SearchPage
  searchPage: (context,{arguments}) => SearchPage(arguments: arguments)
};
```

2、修改 HomePage 的点击事件跳转方法

```dart
Navigator.pushNamed(context, searchPage,arguments: "erdai666");
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281604215.gif" alt="ezgif.com-gif-maker.gif" width="30%" />

### 1.3、返回上一级

上述效果图中，SearchPage 左上角白色的返回按钮是系统给我们实现的，如果我们需要自己实现返回上一级的效果，使用如下 Api 即可：

```dart
Navigator.pop(context);
```

下面我们给 SearchPage 中间的内容区域添加点击事件，让它返回上一级，代码如下：

```dart
import 'package:flutter/material.dart';

class SearchPage extends StatelessWidget{

  final arguments;

  SearchPage({this.arguments});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            title: const Text('SearchPage')
        ),
        body: Center(
          //新增部分的代码
          child: InkWell(
            child: Text("搜索页面内容区域：$arguments"),
            onTap: (){
              Navigator.pop(context);
            },
          ),
        )
    );
  }
}
```

上述代码我们使用到了 InkWell Widget，它的作用是给没有点击事件的 Widget 添加点击事件，看效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281605914.gif" alt="ezgif.com-gif-maker (1).gif" width="30%" />

### 1.4、替换路由

1）、和 Android 中先启动一个 Activity 然后 finish 上个 Activity 类似。替换路由就是启动一个新页面，然后将新页面替换上一个页面

2）、我们可以使用 `Navigator.pushReplacementNamed` 进行路由的替换

接下来我们编写一个 LoginPage.dart 的登陆页，然后使用 LoginPage 替换 SearchPage，步骤如下：

1、LoginPage 编写

```dart
import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            title: const Text('LoginPage')
        ),
        body: const Center(
          child: Text("去注册"),
        )
    );
  }
}
```

2、在 Routes.dart 中新增路由信息

```dart
import 'package:flutterapplication/pages/LoginPage.dart';

//...
String loginPage = "/loginPage";

final routes = {
  //...
  loginPage: (context) => LoginPage()
};
```

3、修改 SearchPage 的点击事件跳转方法

```dart
//...

class SearchPage extends StatelessWidget{

  final arguments;

  SearchPage({this.arguments});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            title: const Text('SearchPage')
        ),
        body: Center(
          child: InkWell(
            child: Text("搜索页面内容区域：$arguments"),
            onTap: (){
              //路由替换
              Navigator.pushReplacementNamed(context,loginPage);
            },
          ),
        )
    );
  }
}
```

4、效果展示


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281605069.gif" alt="ezgif.com-gif-maker (2).gif" width="30%" />

效果图中我们点击 LoginPage 的返回按钮返回到了 HomePage ，证明 SearchPage 被替换

### 1.5、返回到根路由

1）、和 Android 中启动一个 Activity，然后将这个 Activity 之上的所有 Activity 弹出栈类似。返回根路由就是将当前页面之上的页面全部移除掉

2）、我们可以使用 `Navigator.pushAndRemoveUtil` 返回根路由

接下来我们编写一个 RegisterPage.dart 的注册页，然后 Hompage -> SearchPage -> LoginPage -> RegisterPage 都使用 `Navigator.pushNamed` 方式跳转，RegisterPage -> Hompage 使用 `Navigator.pushAndRemoveUtil` 方式跳转，步骤如下：

1、LoginPage 编写

```dart
import 'package:flutter/material.dart';
import 'package:flutterapplication/HomePage.dart';

class Registerpage extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            title: const Text('RegisterPage')
        ),
        body:  Center(
          child: InkWell(
            child: const Text("注册成功，去 HomePage"),
            onTap: (){
              //通过返回根路由跳转到 HomePage 
              Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context){
                    return HomePage();
                  }),
                  (route) => false);
            },
          ),
        )
    );
  }
}
```

2、在 Routes.dart 中新增路由信息

```dart
import 'package:flutterapplication/pages/RegisterPage.dart';

//...
String registerPage = "/registerPage";

final routes = {
  //...
  registerPage: (context) => RegisterPage()
};
```

3、修改 Hompage，SearchPage，LoginPage 的跳转方式为 `Navigator.pushNamed`

4、效果展示


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281605212.gif" alt="ezgif.com-gif-maker (3).gif" width="30%" />

可以看到，当我们从 RegisterPage 到 HomePage，然后在返回，直接退到了桌面，证明其它页面都被移除了

## 二、HTTPS 请求实战

Flutter 中发起网络请求还是比较简单的，我们引入一个第三方库：

>  http 
>
>  链接：https://pub.dev/packages/http

这里需要大家掌握 Dart 异步编程基础，还不明白的看我[Flutter 系列（二）：Dart 语法筑基](https://juejin.cn/post/7130647339294785549#heading-80)这篇文章

在项目的 pubspec.yaml 配置文件添加如下依赖：

```dart
dependencies:
  http: ^0.13.5
```

接下来就可以使用了，简单的介绍下 get，post 请求，这里特别感谢 [WanAndroid](https://www.wanandroid.com/) 提供的 Api

### 2.1、get 请求

```dart
//导入 http 并设置别名
import 'package:http/http.dart' as http;

//使用 async 标记为异步
void _getData() async{
  //构建请求 uri
  var uri = Uri.https("www.wanandroid.com", "/friend/json");
  //使用 http 发起 get 请求，等待返回结果进行后续代码执行
  var result = await http.get(uri);
  print("====> ${result.statusCode}");
}

void main(){
  _getData();
}

//打印结果
====> 200
```

### 2.2、post 请求

```dart
//json 转换
import 'dart:convert';
//导入 http 并设置别名
import 'package:http/http.dart' as http;


//使用 async 标记为异步
void _postData() async{
  //构建请求 uri
  var uri = Uri.https("www.wanandroid.com", "/user/login");
  //使用 http 发起 post 请求，等待返回结果进行后续代码执行
  var result = await http.post(uri,body: {"username":"账号","password":"密码"});
  if (result.statusCode == 200) {
    //将 json 解析成 map
    var resultMap = json.decode(result.body) as Map<String,dynamic>;
    //打印 map 里面的属性
    print(resultMap["data"]["nickname"]);
  }
}


void main(){
  _postData();
}

//打印结果
sweetying
```

### 2.3、请求案例实战

首先看一眼我们要实现的效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281605006.gif" alt="ezgif.com-gif-maker (4).gif" width="30%" />

实际上就是将我们请求的网络数据使用 ListView 展示出来，比较简单，大家主要掌握思路，直接上代码：

```dart
//导包
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class HttpPracticePage extends StatefulWidget {
  @override
  _HttpPracticePageState createState() => _HttpPracticePageState();
}

class _HttpPracticePageState extends State<HttpPracticePage> {
  var list = [];

  @override
  void initState() {
    super.initState();
    //加载网络数据
    _getData();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
          appBar: AppBar(
            title: Text('Http 实践页面'),
          ),
          //如果 list 为空，展示为空白页面，不为空渲染 ListView
          body: list.isNotEmpty
              ? ListView.builder(
              itemCount: list.length,
              itemBuilder: (context, index) {
                  return ListTile(
                      title: Text("${list[index]["name"]}"),
                      subtitle: Text("${list[index]["link"]}"));
                })
              : Text("")),
    );
  }
	
  //使用 async 标记为异步
  void _getData() async {
    //构建请求 uri
    var uri = Uri.https("www.wanandroid.com", "/friend/json");
    //使用 http 发起 get 请求，等待返回结果进行后续代码执行
    var result = await http.get(uri);
    if (result.statusCode == 200) {
      //将 json 解析成 map
      var map = json.decode(result.body) as Map<String, dynamic>;
      //通知 UI 进行刷新
      setState(() {
        list = map["data"];
      });
    }
  }
}
```

## 三、总结

本篇文章我们介绍了：

1、Flutter 中的路由使用，大家可以根据不同的业务场景使用不同的 Api

2、推荐使用路由统一管理以及导包的时候使用绝对路径

3、简单的介绍了使用第三方库 http 进行 get，post 请求，最后进行了一个请求案例的实战

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会讲 Flutter 与 Android 的通信，尽请期待吧🍺


### 参考和推荐

[Flutter 教程](https://www.bilibili.com/video/BV1S4411E7LY?p=19&vd_source=d0b24cb21c438ff4a9ac2e589eacb3d9)：通俗易懂的 Flutter 入门教程

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
