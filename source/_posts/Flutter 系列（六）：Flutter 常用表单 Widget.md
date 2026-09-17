---
title: Flutter 系列（六）：Flutter 常用表单 Widget
date: 2022-10-10 16:54:24
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281603398.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281603398.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们介绍了 Flutter 中常用的按钮 Widget，Flutter 1.x 和 Flutter 2.x 按钮的变化，最后通过 Flutter 1.x 相关 Button + BottomNavigationBar + FloatingActionButton 实现了一个综合案例。还没有看过上一篇文章的朋友，建议先去阅读 [Flutter 系列（五）：Flutter 常用按钮 Widget](https://juejin.cn/post/7137082885571346463)。接下来我们对 Flutter 表单 Widget 进行学习

Flutter 中常见的表单有：TextField，CheckBox，Radio，Switch，CheckboxListTile，RadioListTile，SwitchListTile，Slider 等，下面就介绍一下这些常用的 Widget

## 一、Flutter 常用表单 Widget 介绍

### 1.1、TextFiled 文本框

TextFiled 是 Flutter 给我们提供的文本框 Widget，其常用的属性有：

| 属性名称    | 属性类型              | 说明                                                         |
| ----------- | --------------------- | ------------------------------------------------------------ |
| maxLines    | int                   | 设置此参数可以把文本框改为多行文本框                         |
| onChanged   | ValueChanged<String>  | 文本框改变时触发的事件                                       |
| decoratioin | InputDecoration       | 装饰，InputDecoration 常用属性：<br>hintText：默认提示文案<br>border：文本框边框，配合 OutlineInputBorder 使用<br>labelText：label 的名称<br>labelStyle：配置 label 的样式 |
| obscureText | bool                  | 是否把文本框改为密码框                                       |
| controller  | TextEditingController | 配置文本框默认显示的内容                                     |

运行下面代码：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Form Practice"), //设置标题栏标题
      ),
      body: MyBodyPage(), //自定义 body Wdiget
    )
  ));
}

class MyBodyPage extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(20),
      child: Column(
        children: [
          TextField( //账号输入框
            maxLines: 1, //最大显示一行
            decoration: InputDecoration(
                hintText: "please input account", //默认提示文案
                label: Text("Account") //文本框标签提示
            ),
          ),
          SizedBox(height: 20),
          TextField(//密码输入框
            maxLines: 1, //最大显示一行
            obscureText: true, //设置文本输入为密文
            decoration: InputDecoration(
                hintText: "please input password", //默认提示文案
                label: Text("Password") //文本框标签提示
            ),
          )
        ],
      ),
    );
  }
}
```

效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281603636.png" alt="textfield.png" width="50%" />

### 1.2、Checkbox，CheckboxListTile 复选框

Checkbox 是 Flutter 给我们提供的复选框 Widget，常用属性有：

| 属性名称    | 属性类型           | 说明                              |
| ----------- | ------------------ | --------------------------------- |
| value       | bool               | 必填项，true：选中，false：未选中 |
| onChanged   | ValueChanged<bool> | 必填项，改变时触发的事件          |
| activeColor | Color              | 选中的背景颜色                    |
| checkColor  | Color              | 选中复选框里面符号的颜色          |

CheckboxListTile 是 Flutter 给我们提供的复选框列表 Item，常用属性有：

| 属性名称    | 属性类型           | 说明                                                         |
| ----------- | ------------------ | ------------------------------------------------------------ |
| value       | bool               | 必填项，true：选中，false：未选中                            |
| onChanged   | ValueChanged<bool> | 必填项，改变时触发的事件                                     |
| activeColor | Color              | 选中的背景颜色，如果 selected 为 true ，则 title，subtitle，secondary 也会变 |
| checkColor  | Color              | 选中复选框里面符号的颜色                                     |
| title       | Widget             | 标题                                                         |
| subtitle    | Widget             | 二级标题                                                     |
| secondary   | Widget             | 配置显示的图标或图片                                         |
| selected    | bool               | 选中时其它子 Widget 颜色是否跟着改变                         |

在这之前，我们自定义 Wdiget 都是继承 StatelessWidget，但表单相关的 Widget 都是有状态的，因此需要继承 StatefulWidget 来动态展示它的一个状态，继承 StatefulWidget 的一个标准模版如下：

```dart
class MyBodyPage extends StatefulWidget{
  @override
  State<StatefulWidget> createState() => _MyBodyPageState();
}

class _MyBodyPageState extends State<MyBodyPage>{
  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    throw UnimplementedError();
  }
}
```

接下来我们使用 Checkbox，CheckboxListTile 来实践一下：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Form Practice"), //设置标题栏标题
      ),
      body: MyBodyPage(), //自定义 body Wdiget
    )
  ));
}


class MyBodyPage extends StatefulWidget{
  @override
  State<StatefulWidget> createState() => _MyBodyPageState();
}

class _MyBodyPageState extends State<MyBodyPage> {

  //记录第一个复选框的选中状态
  var flag1 = false;
  //记录第二个复选框的选中状态
  var flag2 = false;
  //记录第三个复选框的选中状态
  var flag3 = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Checkbox( //第一个复选框
          value: flag1,
          onChanged: (value){
            setState(() {
              flag1 = value??false; //更新复选框的状态
            });
          },
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(flag1 == true ? "选中" : "未选中")
          ],
        ),
        Divider(color: Colors.black),
        CheckboxListTile(value: flag2, onChanged: (value){ //第二个复选框列表 item
          setState(() {
            flag2 = value??false; //更新复选框的状态
          });
        },
          activeColor: Colors.green, //选中的背景颜色，如果 selected 为 true ，则 title，subtitle，secondary 也会变
          checkColor: Colors.black, //选中复选框里面符号的颜色
          title: Text('标题'), //展示标题
          subtitle: Text("描述"), //展示副标题
          selected: flag2, //选中时其它子 Widget 颜色跟着改变
        ),

        Divider(color: Colors.black),

        CheckboxListTile(value: flag3, onChanged: (value){ //第三个复选框列表 item
          setState(() {
            flag3 = value??false; //更新复选框的状态
          });
        },
          title: Text('标题'), //展示标题
          subtitle: Text("描述"), //展示副标题
          secondary: Icon(Icons.home), //展示图标
          selected: false, //选中时其它子 Widget 颜色不跟着改变
        )
      ],
    );
  }
}
```

效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281603374.gif" alt="checkbox.gif" width="30%" />

### 1.3、Radio，RadioListTile 单选框

Radio，RadioListTile 是 Flutter 给我们提供的单选框和单选框列表 Item，它的常用属性和 Checkbox，CheckboxListTile 非常类似，区别就是：Radio，RadioListTile 必须提供一个 groupValue 属性用于记录单选框的分组，直接上代码感受下：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Form Practice"), //设置标题栏标题
      ),
      body: MyBodyPage(), //自定义 body Wdiget
    )
  ));
}

class MyBodyPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _MyBodyPageState();
}

class _MyBodyPageState extends State<MyBodyPage> {
  //性别
  int sex = 1;
  //第二个复选框状态标记
  bool flag = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        //第一组单选框
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("男"),
            Radio(
                value: 1,
                onChanged: (value) {
                  setState(() {
                    sex = value as int; //更新状态
                  });
                },
                groupValue: sex), //groupValue 为 sex
            SizedBox(width: 20),
            Text("女"),
            Radio(
                value: 2,
                onChanged: (value) {
                  setState(() {
                    sex = value as int; //更新状态
                  });
                },
                groupValue: sex) //groupValue 为 sex
          ],
        ),
        SizedBox(height: 20),
        Divider(),
         //第二组单选框
        RadioListTile(
          value: true,
          onChanged: (value) {
            setState(() {
              flag = value as bool; //更新状态
            });
          },
          groupValue: flag, //groupValue 为 flag
          title: Text("一级标题"), //标题
          subtitle: Text("二级标题"), //副标题
          secondary: Icon(Icons.home), //显示图标
        ),
        RadioListTile(
          value: false,
          onChanged: (value) {
            setState(() {
              flag = value as bool; //更新状态
            });
          },
          groupValue: flag, //groupValue 为 flag
          title: Text("一级标题"), //标题
          subtitle: Text("二级标题"), //副标题
          secondary: Image.network( //显示图片
              "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"),
        )
      ],
    );
  }
}

```

效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281603401.gif" alt="radiobutton.gif" width="30%" />

### 1.4、Switch，SwitchListTile 开关

Switch，SwitchListTile 是 Flutter 给我们提供的开关和开关列表 Item，常用属性和上面两个类似，我们快速过一下：

代码实践：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Form Practice"), //设置标题栏标题
      ),
      body: MyBodyPage(), //自定义 body Wdiget
    )
  ));
}

class MyBodyPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _MyBodyPageState();
}

class _MyBodyPageState extends State<MyBodyPage> {
  //开关的状态标记
  bool flag = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Switch( //Switch
            value: flag,
            onChanged: (value) {
              setState(() {
                flag = value; //更新状态
              });
            }),
        SizedBox(height: 20),
        SwitchListTile( //SwitchListTile
            value: flag,
            onChanged: (value) {
              setState(() {
                flag = value; //更新状态
              });
            },
            title: Text("标题"), //标题
            subtitle: Text("副标题"), //副标题
            secondary: Image.network( //显示图片
              "https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg"
            ) 
        )
      ],
    );
  }
}
```

效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281603433.gif" alt="switch.gif" width="30%" />

### 1.5、Slider 进度条

Slider 是 Flutter 给我们提供的进度条 Widget。其常用属性有：

| 属性名称      | 属性类型             | 说明                                                         |
| ------------- | -------------------- | ------------------------------------------------------------ |
| value         | double               | 必填项，当前 Slider 滑块位置的值，注意不可以超出 min 和 max 的范围，否则会报错 |
| onChanged     | ValueChanged<double> | 必填项，正在滑动或者点击，未松手                             |
| onChangeStart | ValueChanged<double> | 刚开始点击                                                   |
| onChangeEnd   | ValueChanged<double> | 滑动或者点击结束，已松手                                     |
| min           | double               | 最小值，默认为 0.0                                           |
| max           | double               | 最大值，默认为 1.0                                           |
| activeColor   | Color                | 滑块颜色                                                     |
| inactiveColor | Color                | 轨道颜色                                                     |
| label         | String               | 气泡文本                                                     |
| divisions     | int                  | 刻度，如没有刻度，label 则不会展示                           |

代码实践：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text("Flutter Form Practice"), //设置标题栏标题
      ),
      body: MyBodyPage(), //自定义 body Wdiget
    )
  ));
}

class MyBodyPage extends StatefulWidget{

  @override
  State<StatefulWidget> createState() => _MyBodyPageState();
}

class _MyBodyPageState extends State<MyBodyPage>{
  //滑块的值
  double sliderValue = 0;

  // 更新状态
  void updateSlider(value){
    sliderValue = value;
    setState(() {

    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(20),
      child: Column(
        children: [
          _slider() 
        ],
      ),
    );
  }

  //构建滑块 Widget
  Slider _slider(){
    return Slider(
      value: sliderValue,
      max: 100, //最大值为 100
      activeColor: Colors.red, //滑块颜色为红色
      inactiveColor: Colors.green, //轨道颜色为绿色
      label: "进度：$sliderValue", //气泡文本
      divisions: 10, //刻度
      onChanged: (value){ //正在滑动或者点击，未松手
        updateSlider(value);
      },
      onChangeStart: (value){ //刚开始点击
        updateSlider(value);
      },
      onChangeEnd: (value){ //滑动或者点击结束，已松手
        updateSlider(value);
      },
    );
  }
}
```

效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281604898.gif" alt="slider.gif" width="30%" />

我们还可以使用 SliderTheme 嵌套 Slider 实现各种自定义样式，这里就不做演示了，SliderTheme 常用属性有：

| 属性名称 | 属性类型        | 说明                                            |
| -------- | --------------- | ----------------------------------------------- |
| data     | SliderThemeData | 必填项，通过 SliderThemeData 实现各种自定义样式 |
| child    | Widget          | 必填项，子 Widget                               |

SliderThemeData 属性介绍：https://api.flutter.dev/flutter/material/SliderThemeData-class.html

## 二、表单 Widget 之综合案例

接下来，我们就使用表单 Widget 做一个用户信息登记系统，效果如下：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281604140.gif" alt="form_combine.gif" width="30%" />

按照惯例，我们先分析这个页面：

1、可以看到这是一个从上往下的垂直布局，有个内边距，子 Widget 是自适应的，这里我们可以使用 ListView 并设置一个 padding 实现

2、然后从上往下依次是，输入姓名：文本框（TextField），性别选择：单选框（Radio），兴趣爱好：复选框（Checkbox），颜值打分：滑块（Slider），永不宕机：开关（SwitchListTile），获取用户信息（RaisedButton），用户信息展示（Text）

3、这些 Widget 都是有状态的，因此我们需要继承 StatefulWidget，并使用 setState 方法去更新状态

我们画一张图来理一下 Widget 之间的树形结构：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281604394.png" alt="表单 Widget 之综合案例.png" width="50%" />

最后我们进行代码实现，里面写了详细的注释：

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text("用户信息登记系统"), //设置标题栏标题
        ),
        body: MyBodyPage(), //自定义 body Wdiget
      )
  ));
}

class MyBodyPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _MyBodyPageState();
}

class _MyBodyPageState extends State<MyBodyPage> {

  //用户姓名
  String userName = "";
  //性别
  int sex = 1;
  //是否开启永不宕机
  bool flag = false;
  //颜值打分
  double sliderValue = 0;
  //兴趣爱好
  List hobbies = [
    {"checked": false, "title": "打篮球"},
    {"checked": false, "title": "爬山"},
    {"checked": false, "title": "写代码"},
  ];
  //个人信息
  String info = "";

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(20),
      children: [
        TextField( //文本框：用户姓名
          decoration: InputDecoration(
              hintText: "请输入用户姓名", //默认提示文案
              label: Text("姓名") //标签
          ),
          onChanged: (str){
            setState(() {
              userName = str; //更新用户姓名状态
            });
          },
        ),
        SizedBox(height: 10),
        Text("性别："),
        Row( //性别选择
          children: [
            Text("男"),
            Radio(value: 1, groupValue: sex, onChanged: _sexChanged),
            Text("女"),
            Radio(value: 2, groupValue: sex, onChanged:_sexChanged)
          ],
        ),
        Text("兴趣爱好："),
        Row( //兴趣爱好
          children: _getHobbies(),
        ),
        _slider(),
        Row( //颜值打分
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("颜值：$sliderValue分"),
          ],
        ),
        SwitchListTile( //开关永不宕机
            value: flag,
            title: Text("永不宕机"),
            onChanged: (value){
              setState(() {
                flag = value;
              });
            }
        ),
        RaisedButton( //获取用户信息
          child: Text("获取用户信息"),
          onPressed: (){
            setState(() {
              info = getInfo(); //更新用户状态信息
            });
          },
          color: Colors.blue,
          textColor: Colors.white,
        ),

        Text(info) //用户信息展示
      ],
    );
  }

  //获取用户展示的信息
  String getInfo() {
    String hobbiesStr = "";
    for (var element in hobbies) {
      if(element["checked"]){
        hobbiesStr += element["title"] + "，";
      }
    }
    return "$userName，性别${sex == 1 ? "男" : "女"}，喜欢$hobbiesStr${flag ? "永不宕机，" : ""}颜值$sliderValue分";
  }

  //更新性别状态
  void _sexChanged(value){
    setState(() {
      sex = value as int;
    });
  }

  //更新滑块状态
  void updateSlider(value){
    sliderValue = value;
    setState(() {

    });
  }

  //获取兴趣爱好 Widget List
  List<Widget> _getHobbies() {
    List<Widget> temp = [];
    for (var element in hobbies) {
      //添加 Text
      temp.add(Text(element["title"]));
      //添加 Checkbox
      temp.add(Checkbox(
          value: element["checked"],
          onChanged: (value) {
            setState(() {
              element["checked"] = value;
            });
          }));
    }
    return temp;
  }

  //获取滑块 Widget
  Slider _slider(){
    return Slider(
      value: sliderValue,
      max: 100, //最大值为 100
      label: "颜值：$sliderValue分", //气泡文本
      divisions: 10, //刻度
      onChanged: (value){ //正在滑动或者点击，未松手
        updateSlider(value);
      },
      onChangeStart: (value){ //刚开始点击
        updateSlider(value);
      },
      onChangeEnd: (value){ //滑动或者点击结束，已松手
        updateSlider(value);
      },
    );
  }
}
```

## 三、总结

本篇文章我们介绍了：

1、Flutter 中常用的表单 Widget ：TextField，CheckBox，Radio，Switch，CheckboxListTile，RadioListTile，SwitchListTile，Slider 的常用属性和使用，以及它们的显示效果

2、通过表单 Widget 组合实现了一个用户信息登记系统

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 下篇预告

后续不会花大篇幅去介绍 Widget，我会穿插在其它知识点中简单介绍下，Flutter 中有 400 多个 Widget，不可能每个都去学，我的建议：掌握常用的，其它用到时在去官网查询。

下篇文章我会讲 Flutter 中的路由以及实际开发中请求 Http 接口渲染页面，尽请期待吧🍺


### 参考和推荐

[Flutter 教程](https://www.bilibili.com/video/BV1S4411E7LY?p=19&vd_source=d0b24cb21c438ff4a9ac2e589eacb3d9)：通俗易懂的 Flutter 入门教程

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
