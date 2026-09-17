---
title: Flutter 系列（八）：Flutter 与 Android 的你来我往
date: 2022-10-10 16:54:26
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281559284.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281559284.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们介绍了 Flutter 中的路由：

> 1、基本路由
>
> 2、命名路由
>
> 3、返回上一级
>
> 4、替换路由
>
> 5、返回到根路由

以及集成 http 库进行 https 请求实战。

还没有看过上一篇文章的朋友，建议先去阅读 [Flutter 系列（七）：Flutter 路由和 HTTPS 请求实战](https://juejin.cn/post/7142650961868095524#heading-11)。接下来我们对 Flutter 与 Android 原生的交互与通信进行介绍

我做 Android 原生开发时，通常会以组件化的方式去进行，根据业务划分不同的组件，每个组件都是一个独立的工程，可以进行独立的运行和调试，当需要发版时，我们会将每个组件打成 aar 包并上传到 Maven 私服仓库，然后整合到 App 壳工程中，最终进行打包上线。在这个开发过程中，组件之间是需要进行通信的，如果需要通信的组件都是 Android 原生开发的，那么可以选择一个路由框架进行通信，例如：Arouter。

但是我们有些业务组件是使用 Flutter 开发的，因此这里就涉及到 Flutter 与 Android 原生的通信，那么它们是如何进行通信的呢？且听我细细道来

## 一、Android 壳工程集成 Flutter 组件

1、打开 AndroidStudio ，创建一个 Android 工程 AndroidAndFlutterInteractive：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281559321.png" alt="image-20220918215022577" width="50%" />

2、接着在创建一个 Flutter 工程 fluttermodule：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281559984.png" alt="image-20220918215214876" width="50%" />

main.dart 文件初始代码如下：

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'You have clicked the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

3、在 Flutter 工程中执行 `flutter build aar` 命令或者直接使用 AndroidStudio 上的可视化操作：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281559983.png" alt="202209221609588.png" width="70%" />

执行完后会有如下提示：

```dart
Consuming the Module
  1. Open <host>/app/build.gradle
  2. Ensure you have the repositories configured, otherwise add them:

      String storageUrl = System.env.FLUTTER_STORAGE_BASE_URL ?: "https://storage.googleapis.com"
      repositories {
        maven {
            url '/Users/zhouying/codeandnotes/Flutter/fluttermodule/build/host/outputs/repo'
        }
        maven {
            url "$storageUrl/download.flutter.io"
        }
      }

  3. Make the host app depend on the Flutter module:

    dependencies {
      debugImplementation 'com.example.fluttermodule:flutter_debug:1.0'
      profileImplementation 'com.example.fluttermodule:flutter_profile:1.0'
      releaseImplementation 'com.example.fluttermodule:flutter_release:1.0'
    }


  4. Add the `profile` build type:

    android {
      buildTypes {
        profile {
          initWith debug
        }
      }
    }
```

大致意思就是在我们创建的 Android 工程中配置生成的 Flutter aar 的仓库地址，然后引用这个 aar，大家按照上述步骤配置即可

**注意**：上述演示生成的 Flutter aar 只是存在本地，实际开发中，我们会自己编写脚本生成 aar 并上传到 Maven 私服仓库

配置完成后，同步一下项目，如果没啥报错，我们就算是成功集成了 Flutter 组件

## 二、Android 调起 Flutter 页面（FlutterActivity）

接下来我们继续对 Android 工程进行配置，让 Flutter 页面显示出来

1、在 Android 工程的 AndroidManifest.xml 文件中添加 FlutterActivity

```dart
<!--注册FlutterActivity-->
<activity
    android:name="io.flutter.embedding.android.FlutterActivity"
    android:configChanges="orientation|keyboardHidden|screenSize"
    android:hardwareAccelerated="true"
    android:windowSoftInputMode="adjustResize" />
```

2、编写一个 button 跳转到 Flutter 页面

```dart
//1、activity_main.xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".MainActivity">

    <Button
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginHorizontal="20dp"
        android:textAllCaps="false"
        android:onClick="toFlutterActivity"
        android:text="跳转 FlutterActivity"
        tools:ignore="HardcodedText,UsingOnClickInXml" />

</LinearLayout>

//2、MainActivity
class MainActivity : AppCompatActivity() {
    
    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    //跳转到 FlutterActivity
    fun toFlutterActivity(view: View) {
        val intent = FlutterActivity.createDefaultIntent(this)
        startActivity(intent)
    }
}
```

3、效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281559086.gif" alt="ezgif.com-gif-maker.gif" width="30%" />

上述效果图虽然跳过去了，但是我们可以看到点击 button 时一个明显的停顿感，用户体验不好，接下来介绍一种预初始化 Flutter 的方式

### 2.1、Android 预初始化 Flutter 页面跳转

核心思想就是缓存 FlutterEngine，然后从缓存中取出 FlutterEngine 进行跳转

1、修改 MainActivity ：

```dart
class MainActivity : AppCompatActivity() {

    companion object{
        //缓存 FlutterEngine 的 key
        const val FLUTTER_ENGINE_ID = "default"
    }
    //FlutterEngine
    private lateinit var flutterEngine: FlutterEngine

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        //初始化 FlutterEngine
        flutterEngine = initFlutterEngine(FLUTTER_ENGINE_ID)
    }

    //跳转到 FlutterActivity
    fun toFlutterActivity(view: View) {
        val intent = FlutterActivity.withCachedEngine(FLUTTER_ENGINE_ID).build(this)
        startActivity(intent)
    }

    /**
     * 初始化 FlutterEngine
     * 一般在跳转前调用，从缓存中取出 FlutterEngine，这样可以加快我们页面的一个跳转
     */
    private fun initFlutterEngine(engineId: String): FlutterEngine {
        //创建 FlutterEngine
        val flutterEngine = FlutterEngine(this)
        //指定要跳转的 Flutter 页面
        flutterEngine.navigationChannel.setInitialRoute("main")
        flutterEngine.dartExecutor.executeDartEntrypoint(DartExecutor.DartEntrypoint.createDefault())
        //缓存 FlutterEngine
        val flutterEngineCache = FlutterEngineCache.getInstance()
        flutterEngineCache.put(engineId,flutterEngine)
        return flutterEngine
    }

    override fun onDestroy() {
        super.onDestroy()
        /**
         * 注意这里一定要销毁，否则会导致内存泄漏
         * 因为 FlutterEngine 比显示它的 FlutterActivity 生命周期要长
         * 当我们退出 FlutterActivity 时，FlutterEngine 可能还会继续执行代码
         * 所以我们应该在 FlutterActivity 退出时调用 flutterEngine.destroy 停止执行并释放资源
         */
        flutterEngine.destroy()
    }
}
```

2、Flutter 端也要做相应的修改：

```dart
void main() => runApp(getRouter(window.defaultRouteName));

///接收 Android 跳转过来的启动路由参数，如果匹配上了走正常流程
///如果没匹配上，则提示 page not found
Widget getRouter(String routeName) {
  switch(routeName){
    case "main":
      return const MyApp();
    default:
      return MaterialApp(
        home: Scaffold(
          appBar: AppBar(
            title: const Text("Flutter Demo Home Page"),
          ),
          body: const Center(
            child: Text(
              "page not found",
              style: TextStyle(
                fontSize: 24,
                color: Colors.red
              ),
            ),
          ),
        ),
      );
  }
}		
```

3、当我们修改 Flutter 工程的代码后，重新运行 Android 项目并不会生效，我们需要：

> 1、在 Flutter 工程重新执行 `flutter build aar` 命令
>
> 2、待 Flutter 命令执行完成，clean Android 工程

此时我们运行 Android 项目，就可以看到效果了：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281600300.gif" alt="ezgif.com-gif-maker (1).gif" width="30%" />

可以看到，页面跳转变得非常丝滑

现在只是简单的跳转，那么如果我想在跳转时给 Flutter 页面传值要怎么做呢？

### 2.2、Android 给 Flutter 页面传值

分析 2.1 这个例子，我们在 Android 工程中设置了启动路由：

```dart
flutterEngine.navigationChannel.setInitialRoute("main")
```

然后在 Flutter 中通过 `window.defaultRouteName` 获取了路由

那么我是否可以在启动路由中多添加一些数据，然后 Flutter 获取后进行解析呢？例如：

```dart
//1、我在 Android 中这样设置
flutterEngine.navigationChannel.setInitialRoute("main?{\"name\":\"erdai\",\"age\":18}")

//2、Flutter 中获取路由并进行解析
String url = window.defaultRouteName;
//获取路由名称
String routeName = url.substring(0,url.indexOf("?"));
//获取参数，将参数解析并转换成一个 Map 对象
String paramsString = url.substring(url.indexOf("?") + 1);
Map<String,dynamic> paramsMap = json.decode(paramsString);

```

实际上就是这么干的，我们修改 Flutter 端的代码：

```dart
void main(){
  //获取 Android 传过来的路由
  String url = window.defaultRouteName;
  //解析并获取路由名称
  String routeName = url.substring(0,url.indexOf("?"));
  //解析并将参数转换成一个 Map 对象
  String paramsString = url.substring(url.indexOf("?") + 1);
  Map<String,dynamic> paramsMap = json.decode(paramsString);
  //打印参数
  print(paramsMap);
  runApp(getRouter(routeName));
}
//...
```

当我们发布 aar，clean Android 工程并重新运行会进行参数的打印：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281600633.png" alt="202209221611327.png" width="70%" />

## 三、Android 嵌入 Flutter 页面（FlutterFragment）

类比 Android 启动 FlutterActivity，主要是通过两种方式构建 intent 对象：

```dart
//方式一
var intent: Intent = FlutterActivity.createDefaultIntent(this)
  
//方式二
var intent = FlutterActivity
  .withCachedEngine(FLUTTER_ENGINE_ID)
  .build(this)
```

构建 FlutterFragment 类似：

```dart
//方式一
var flutterFragment: FlutterFragment = FlutterFragment.createDefault()
  
//方式二
var flutterFragment: FlutterFragment = FlutterFragment
     .withCachedEngine(FLUTTER_ENGINE_ID)
     .build()
```

修改 Android 代码 ：

```dart
//1、我们新建一个 SecondActivity
//activity_second.xml内容：FrameLayout 用于承载 FlutterFragment
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/flFragmentContainer"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".SecondActivity"/>
      
//2、修改 SecondActivity
class SecondActivity : AppCompatActivity() {
    companion object{
        //缓存 FlutterEngine 的 key
        const val FLUTTER_ENGINE_ID = "default"
    }
    //FlutterEngine
    private lateinit var flutterEngine: FlutterEngine
    //FlutterFragment
    private lateinit var flutterFragment: FlutterFragment

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        //初始化 FlutterEngine
        flutterEngine = initFlutterEngine(FLUTTER_ENGINE_ID)

        //初始化 FlutterFragment
        flutterFragment = FlutterFragment
            .withCachedEngine(FLUTTER_ENGINE_ID)
            .build()

        //将 FlutterFragment 嵌入到 SecondActivity 中
        supportFragmentManager.beginTransaction().replace(R.id.flFragmentContainer,flutterFragment).commit()
    }

    /**
     * 初始化 FlutterEngine
     * 上述代码一般在跳转前调用，这样可以加快我们页面的一个跳转
     */
    private fun initFlutterEngine(engineId: String): FlutterEngine {
        //创建 FlutterEngine
        val flutterEngine = FlutterEngine(this)
        //指定要跳转的 Flutter 页面并携带参数
        flutterEngine.navigationChannel.setInitialRoute("main?{\"name\":\"erdai\",\"age\":18}")
        flutterEngine.dartExecutor.executeDartEntrypoint(DartExecutor.DartEntrypoint.createDefault())
        //缓存 FlutterEngine
        val flutterEngineCache = FlutterEngineCache.getInstance()
        flutterEngineCache.put(engineId,flutterEngine)
        return flutterEngine
    }

    //重写一些方法，然后将其转发到了 FlutterFragment 中
    override fun onPostResume() {
        super.onPostResume()
        flutterFragment.onPostResume()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        flutterFragment.onNewIntent(intent)
    }

    override fun onBackPressed() {
        super.onBackPressed()
        flutterFragment.onBackPressed()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        flutterFragment.onRequestPermissionsResult(requestCode,permissions,grantResults)
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        flutterFragment.onUserLeaveHint()
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        flutterFragment.onTrimMemory(level)
    }

    override fun onDestroy() {
        super.onDestroy()
        //停止代码执行并释放资源
        flutterEngine.destroy()
    }
}

//3、在 AndroidManifest 文件中设置 SecondActivity 主题
<activity
   android:name=".SecondActivity"
   android:exported="false"
   android:theme="@style/Theme.MaterialComponents.DayNight.NoActionBar"/>

//4、修改 MainActivity 跳转按钮跳转到 SecondActivity
fun toSecondActivity(view: View) {
    startActivity(Intent(this,SecondActivity::class.java))
}
```

上述 SecondActivity 中我们重写了很多方法，然后将其转发到了 FlutterFragment 中，主要目的是为了实现 Flutter 中所有预期的行为

接下来看下效果：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281600237.gif" alt="ezgif.com-gif-maker2.gif" width="30%" />

## 四、Android 与 Flutter 通信

Flutter 提供了一套 PlatformChannel 机制用于 Flutter 和 Android 的通信，主要分为三种类型：

1、**MethodChannel**：主要用于传递方法调用，Flutter 和 Native（Android）之间进行方法调用时可以使用，是一种双向的通信方式

2、**EventChannel**：主要用于用户数据流的通信，如：手机电量变化，网络连接变化等。这种方式只能  Native（Android）向 Flutter 发送数据，是一种单向的通信方式

3、**BaseicMessageChannel**：主要用于传递各种类型数据，它支持的类型有很多，如：String，半结构化信息等，是一种双向的通信方式

### 4.1、MethodChannel

上面我们介绍了 Android 给 Flutter 页面传值，主要是通过这行代码：

```dart
flutterEngine.navigationChannel.setInitialRoute("main?{\"name\":\"erdai\",\"age\":18}")
```

点击查看 navigationChannel 的源码：

```dart
//NavigationChannel 源码
public class NavigationChannel {
  private static final String TAG = "NavigationChannel";

  @NonNull public final MethodChannel channel;

  public NavigationChannel(@NonNull DartExecutor dartExecutor) {
    this.channel = new MethodChannel(dartExecutor, "flutter/navigation", JSONMethodCodec.INSTANCE);
    channel.setMethodCallHandler(defaultHandler);
  }
  //...
}
```

发现它实际就是对 MethodChannel 做了一层封装，底层是通过 MethodChannel 来进行通信

这种方式在开发中用的比较多，使用也比较简单，我们直接通过例子说明

下面实现这么一个需求：**首先从 MainActivity 跳转到 SecondActivity，然后 SecondActivity 每隔一秒给 Flutter 页面发送一个数字，Flutter 接收到数字并显示到中间的 Text 中，当接收到数字等于 5 ，通知 SecondActivty finish**

先看一眼实现的效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281600786.gif" alt="ezgif.com-gif-maker (3).gif" width="30%" />

1、首先来看 Android 端代码实现，SecondActivity 新增的部分：

```dart
class SecondActivity : AppCompatActivity() {
   
    //...
    //MethodChannel
    private lateinit var methodChannel: MethodChannel
    //发送给 Flutter 的数字
    private var count = 0

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        //...
	//MethodChannel初始化，注意后面的字符串必须保持 Android 和 Flutter 一致
        methodChannel = MethodChannel(flutterEngine.dartExecutor,"com.dream.interactive")
       	//设置 Flutter 传给我们的方法回调
        methodChannel.setMethodCallHandler { call, result ->
            if(call.method == "sendFinish"){
                finish()
            }
        }
      	//开启定时器，每隔一秒给 Flutter 发送一个数字
        startTimer()
    }
	
    private fun startTimer() {
        Timer().schedule(timerTask {
            runOnUiThread {
                val map = mapOf("count" to count++)
                methodChannel.invokeMethod("timer", map)
            }
        }, 0, 1000)
    }

    //...
}
```

2、Flutter 端代码实现，新增部分：

```dart
class _MyHomePageState extends State<MyHomePage> {
  //记录传递过来的数字
  int _counter = 0;
  //初始化 MethodChannel，字符串必须保持 Android 和 Flutter 一致
  final _channel = const MethodChannel("com.dream.interactive");
  //...

  @override
  void initState() {
    super.initState();
    //设置接收 Android 传递过来的方法回调
    _channel.setMethodCallHandler((call) async {
      String method = call.method;
      switch(method){
        //如果匹配到了 timer 方法
        case "timer":
          //接收传递过来的数字并刷新 UI
          setState(() {
            _counter = call.arguments["count"];
          });
          //当数字等于 5，通知 Android finish SecondActivity
          if(_counter == 5){
            _channel.invokeMethod("sendFinish");
            break;
          }
          break;
        default:
          break;
      }
    });
  }
  //...
}
```

### 4.2、EventChannel

**我们使用 EventChannel 模拟 Android 发送一个充电信息给 Flutter ，Flutter 接收后在中间的 Text 展示出来**

1、 Android 端代码实现，SecondActivity 新增的部分：

```dart
class SecondActivity : AppCompatActivity() {
   
    /**
     * EventChannel 事件接收器，它是一个接口，我们主要通过它给 Flutter 传递 event 事件
     */	
    private lateinit var eventSink: EventChannel.EventSink
    //电量信息
    private var electricity = 0

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
          
        //初始化 EventChannel，注意后面的字符串必须保持 Android 和 Flutter 一致
        val eventChannel =  EventChannel(flutterEngine.dartExecutor,"com.dream.eventchannel")
        //设置接收 Flutter 传递过来的数据流回调
        eventChannel.setStreamHandler(object : EventChannel.StreamHandler {
            //当 Flutter 与 Android 建立连接后会回调此方法
            override fun onListen(arguments: Any?, events: EventChannel.EventSink) {
              	//打印 Flutter 传过来的参数，建立连接时返回的值，仅此一次
                Log.d("erdai", "onListen: $arguments")
                //对 eventSink 赋值
                eventSink = events
                //开启定时器，每隔一秒电量增加 20%
                startTimer()
            }
						
            //当 Flutter 与 Android 断开连接后会回调此方法
            override fun onCancel(arguments: Any?) {
                Log.d("erdai", "onCancel: 断开连接")
            }
        })
    }

    //开启定时器，每隔一秒电量增加 20%
    private fun startTimer() {
        Timer().schedule(timerTask {
            runOnUiThread {
              	//每隔一秒电量 +20
                electricity += 20
                //发送事件给 Flutter
                eventSink.success("电量：$electricity%")
                if(electricity == 100){
                   //当电量为 100 ，发送完成事件给 Flutter
                   eventSink.endOfStream()
                }
            }
        }, 0, 1000)
    }
}
```

2、Flutter 端代码实现，新增部分：

```dart
class _MyHomePageState extends State<MyHomePage> {
  //电量信息
  dynamic electricity;
  //EventChannel 注意后面的字符串必须保持 Android 和 Flutter 一致
  final _eventChannel = const EventChannel("com.dream.eventchannel");
  //订阅流信息
  StreamSubscription? _streamSubscription;
  

  @override
  void initState() {
    super.initState();
    //初始化 StreamSubscription
    _streamSubscription = _eventChannel
        .receiveBroadcastStream(["Hello，建立连接吧"])
        .listen(_onData,onError: _onError,onDone: _onDone);
  }

  //接收 Andorid 发送过来的正常事件
  void _onData(event){
    //打印
    print(event);
    //对 electricity 赋值，刷新 UI
    setState(() {
      electricity = event;
    });
  }

  //接收 Andorid 发送过来的 error 事件
  void _onError(error){
    //打印
    print(error);
  }

  //接收 Android 发送过来的完成事件
  void _onDone(){
    print('_onDone');
  }

  //释放资源
  @override
  void dispose() {
    if(_streamSubscription != null){
      _streamSubscription?.cancel();
      _streamSubscription = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //...
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            //...
            Text(
              '$electricity',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      //..
    );
  }
}
```

接下来我们看下效果和 Log 日志：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281600035.gif" alt="ezgif.com-gif-maker (4).gif" width="30%" />


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281600289.png" alt="202209221613607.png" width="70%" />

### 4.3、BaseicMessageChannel

**我们使用 BaseicMessageChannel 实现一段 Andorid 和 Flutter 的对话，Flutter 收到 Android 的消息，在中间的 Text 展示出来，Android 收到 Flutter 的消息，使用 Toast 展示出来** 

1、 Android 端代码实现，SecondActivity 新增的部分：

```dart
class SecondActivity : AppCompatActivity() {
    //...
    //BasicMessageChannel
    private lateinit var messageChannel: BasicMessageChannel<String>
  	
    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
      	//...

	//初始化 BasicMessageChannel，注意后面的字符串必须保持 Android 和 Flutter 一致
        messageChannel = 
          BasicMessageChannel(flutterEngine.dartExecutor,"com.dream.messagechannel",StringCodec.INSTANCE)
        //设置接收 Flutter 传递过来的消息回调
        messageChannel.setMessageHandler { replay: String?, reply: BasicMessageChannel.Reply<String> ->
            //打印 Flutter 发过来的消息
            Log.d("erdai", "onCreate: $replay")
            //使用 Toast 展示出来
            Toast.makeText(this,replay,Toast.LENGTH_SHORT).show()
            //回传消息给 Flutter
            reply.reply("梧桐山")
        }
      	
      	//发送消息给 Flutter
        messageChannel.send("周末去爬山吗?") { replay: String? ->
            //接收 Flutter 回传的消息
            //打印 Flutter 回传的消息
            Log.d("erdai", "onCreate: $replay")
            //使用 Toast 展示出来
            Toast.makeText(this,replay,Toast.LENGTH_SHORT).show()
        }
    }

    //...
}
```

2、Flutter 端代码实现，新增部分：

```dart
class _MyHomePageState extends State<MyHomePage> {
 
  //记录 Android 传过来的值
  dynamic _content;
  //BasicMessageChannel，注意后面的字符串必须保持 Android 和 Flutter 一致
  final _messageChannel = const BasicMessageChannel("com.dream.messagechannel", StringCodec());

  @override
  void initState() {
    super.initState();
    //设置接收 Android 传递过来的消息回调
    _messageChannel.setMessageHandler((message) =>Future<String>((){
      //打印 Android 发送过来的消息
      print(message);
      //给 _content 赋值，刷新 UI
      setState(() {
        _content = message;
      });
      //回传值给 Android
      return "好啊";
    }));
    
    //...
  }
  
  //点击 FloatingActionButton 的响应方法
  void _incrementCounter() async{
    //给 Android 发送消息，并接收 Android 回传的消息
    var result = await _messageChannel.send("去爬哪座山?");
    //打印 Android 回传的消息
    print("$result");
    //给 _content 赋值，刷新 UI
    setState(() {
      _content = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            //...
            Text(
              '$_content',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ), 
    );
  }
}
```

看下效果和 Log 日志：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281601340.gif" alt="ezgif.com-gif-maker (5).gif" width="30%" />


![202209221614000.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281601244.png)

### 4.4、通信原理


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281601038.png" alt="202209221615654.png" width="100%" />

从图中我们可以看出：

1、Android 和 Flutter 都是以 ByteBuffer 为载体，然后通过 BinaryMessenger 来发送和接收数据

2、Android 和 Flutter 都是基于 PlatformChannel 机制来进行通信的

之所以我们能够如此简单的进行通信，实则是系统给我们做了大量的封装：线程的切换，数据拷贝等复杂操作

另外需要注意的是：**在 Android 侧，BinaryMessenger 是一个接口，在 FlutterView 中实现了该接口，在 BinaryMessenger 的方法中通过 JNI 来与系统底层沟通。在 Flutter 侧，BinaryMessenger 是一个类，该类的作用就是与类 window 沟通，而类 window 才真正与系统底层沟通**

## 五、总结

本篇文章我们介绍了：

1、Android 集成 Flutter 

> 主要就是将 Flutter 端的代码打成 aar ，然后 Android 引用这个 aar

2、Android 调起 Flutter 页面（FlutterActivity，FlutterFragment），并给 Flutter 页面传值

> 传值底层使用的 MethodChannel

3、Android 与 Flutter 通信，主要使用到了 Flutter 的 PlatformChannel 机制，其实现主要有三种类型：

> 1、MethodChannel：用于 Flutter 和 Android 之间的方法通信，双向的
>
> 2、EventChannel：用于 Flutter 和 Android 之间的数据流通信，单向的：Android -> Flutter
>
> 3、BaseicMessageChannel：用于 Flutter 和 Android 之间的数据通信，双向的

4、简单的介绍了 Android 与 Flutter 通信的原理

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会讲开发 Flutter 项目的一个技术选型，尽请期待吧🍺

### 参考和推荐

[Android 集成 Flutter | 与交互](https://juejin.cn/post/7054743801520193543)

[一篇看懂Android与Flutter之间的通信](https://juejin.cn/post/6844903873358856200#heading-7)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
