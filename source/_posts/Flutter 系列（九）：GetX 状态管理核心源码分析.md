---
title: Flutter 系列（九）：GetX 状态管理核心源码分析
date: 2023-02-27 16:54:26
author: sweetying
index_img: /img/blog/flutter_9_bg.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](/img/blog/flutter_9_bg.jpeg)

## 前言

GetX 是 Flutter 上一个轻量且强大的状态管理框架，它不仅包含了**状态管理**，还有**路由管理，主题管理，国际化多语言管理，网络请求，数据验证，Dialog，Snackbar** 等功能，在一定程度上，减少了我们的开发时间，提高了工作效率。这么好用的一个框架，让我们来学习一下吧。

在我看来，GetX 最核心也是最具有特色的功能是它的状态管理功能，因此今天我们主要的任务就是把 GetX 的状态管理功能给整明白，后续我也会手把手带领大家去手撸 GetX 状态管理的核心源码实现。

## 问题

为了让大家更好的去理解和阅读源码，在此，我先抛出几个问题，大家可以去思考一下？

1、你了解 Dart 中的函数类型吗？怎么定义？

2、typedef 关键字的作用是什么？

3、extension 关键字的作用是什么？

4、如何定义一个泛型方法？Dart 中的泛型方法和 Java，Kotlin 有啥区别？

5、你了解 Dart 中的命名构造方法和 factory 构造方法吗？

6、你知道 Dart 中的 getter，setter 方法要怎么写吗？

7、Dart 中的 mixin 是怎么一回事？

如果你心里对于上面的这些问题有疑问🤔️，那么就跟着我的步伐继续往下走吧

## 一、前置知识

### 1.1、Dart 中的函数类型

函数类型的定义：将一个函数当作类型的类型就是函数类型，它可以：

1、作为一个函数的参数或返回值

2、赋值给一个变量

#### 1.1.1、Kotlin 中的函数类型

对比 Kotlin 中的函数类型：

```kotlin
//Kotlin 中函数类型的语法规则
(String,Int) -> Unit
//或者如下
() -> Unit

//示例：
fun numberPlus(num1: Int,num2: Int,func: (Int,Int) -> Int): Int{
    val sum = func(num1,num2)
    return sum
}

fun main() {
    val numberPlus = numberPlus(10, 20){ num1,num2 ->
        num1 + num2
    }
    val numberMinus = numberPlus(10, 20){ num1,num2 ->
        num1 - num2
    }
    println(numberPlus)
    println(numberMinus)
}

//打印结果
30
-10
```

#### 1.1.2、Dart 函数类型

```dart
//Dart 中的函数类型的语法规则
void Function(String,int)
//或者如下
void Function()
  
  
//示例
int numberPlus(int num1,int num2,int Function(int,int) sum){
  return sum(num1,num2);
}

void main() {
  print(numberPlus(10, 20, (num1, num2) => num1 + num2));
  print(numberPlus(10, 20, (num1, num2) => num1 - num2));
}

//打印结果
30
-10
```

### 1.2、typedef 关键字

**typedef 作用：给任意类型设置一个别名，通常情况下我们会给定义比较长的类型使用 typedef ，例如：函数类型**

如下例子：

```dart
//1、给函数类型取别名
typedef IntOperation = int Function(int,int);

void main() {
  IntOperation intOperation = (a,b) => a + b;
  print(intOperation(4,6));
}
//打印结果
10

//2、给 List<int> 取别名
typedef IntList = List<int>;
void main() {
  IntList intList = [1,2,3];
  print(intList);
}
//打印结果
[1, 2, 3]

//3、给 Map<String,dynamic> 取别名
typedef StringDynamicMap = Map<String,dynamic>;
void main() {
  StringDynamicMap stringDynamicMap = {
    "erdai":"666"
  };
  print(stringDynamicMap);
}
//打印结果
{erdai: 666}

//4、给 List<T> 取别名
typedef MyList<T> = List<T>;
void main() {
  MyList<String> stringList = ["123","456"];
  print(stringList);
}
//打印结果
[123, 456]
```

### 1.3、extension 关键字

**extension 作用：给一个类进行方法扩展**

```dart
extension StringExtension on String{

  int toInt(){
    return int.parse(this);
  }
}

void main() {
    print('${"666".toInt().runtimeType} ===> ${"666".toInt()}');
} 

//打印结果
int ===> 666
```

### 1.4、泛型方法

类比 Java，Kotlin 中的泛型方法：

```dart
//Java 中的写法
public <T> void genericMethod(T param){
  
}

//Kotlin 中的写法
fun <T> genericMethod(param: T){
  
}

//Dart 中的写法
void genericMethod<T>(T param){
  
}
```

**不同点：**

1、Java 中方法的泛型定义在返回值的前面

2、Kotlin 中的方法泛型定义在方法名的前面

3、Dart 中的泛型定义在方法名的后面

### 1.5、命名构造方法和 factory 构造方法

如下示例：

```dart
class Student{
  String? name;
  int? age;

  //命名构造方法
  Student.nameConstructor(this.name,this.age);

  static Student? _instance;
  //构造方法私有化
  Student._private();
  //factory 构造方法
  factory Student(){
    return _instance ??= Student._private();
  }
}

void main() {
  var student = Student.nameConstructor("erdai", 18);
  var student1 = Student();
}
```

### 1.6、getter，setter

语法规则：

> get 方法语法格式：**返回值类型 get 方法名 { 方法体 }**
>
> set 方法语法格式：**set 方法名 ( 参数 ) { 方法体 }**

如下示例：

```dart
class Dog{
  late String _name;
  late int _age;

  Dog(this._name, this._age);
  
  String get name{
    return _name;
  }

  set name(String name){
    _name = name;
  }

  int get age => _age;

  set age(int value) {
    _age = value;
  }

  String get string{
    return 'Dog{_name：$_name，_age：$_age}';
  }
}

void main() {
  var dog = Dog("拉布拉多",6);
  print(dog.string);
  dog.name = "阿拉斯加";
  dog.age = 7;
  print(dog.string);
}

//打印结果
Dog{_name：拉布拉多，_age：6}
Dog{_name：阿拉斯加，_age：7}
```

### 1.7、mixin

1）、Dart 语言的类是单继承的，如果我们想要实现类似多继承的效果可以使用 mixin 机制，又叫混入机制，例如把类 A 混入到类 B 中，那么类 B 就拥有了类 A 的成员，跟继承的特性非常相似

2）、定义一个可以被 mixin 的类，使用 mixin 关键字代替 class 关键字即可

3）、继承被 mixin 的类，使用 with 关键字，如果有多个，中间用 , 隔开

4）、被 mixin 的类只能继承自 Object，不能继承其他类，且不能有构造方法

5）、父类约束：当声明一个 mixin 时， on 后面的类就是这个 mixin 的父类约束。一个类若是要 with 这个 mixin，则这个类必须继承或实现这个 mixin 的父类约束

6）、就远命中原则：当 with 多个 mixin，多个 mixin 拥有同一个方法，则调用方法时会命中最后一个 mixin 类的方法

```dart
//1、定义一个可以被 mixin 的类，使用 mixin 关键字代替 class 关键字即可
//2、继承被 mixin 的类，使用 with 关键字，如果有多个，中间用 , 隔开
mixin A{
  void getA(){
    print('A');
  }
}

mixin B{
  void getB(){
    print('B');
  }
}

class C{
  void getC(){
    print('C');
  }
}

class CC extends C with A,B{}

void main() {
  var cc = CC();
  cc.getA();
  cc.getB();
  cc.getC();
  print(cc is A);
  print(cc is B);
  print(cc is C);
}
//打印结果
A
B
C
true
true
true
  
//3、被 mixin 的类只能继承自 Object，不能继承其他类，且不能有构造方法
class D {}

//编译报错，mixin 类不能继承其他类，只能继承自 Object
mixin E extends D{
   //编译报错，mixin 类不能有构造方法
   E();
}

//4、父类约束：当声明一个 mixin 时， on 后面的类就是这个 mixin 的父类约束。一个类若是要 with 这个 mixin，则这个类必须继承
//或实现或 with 这个 mixin 的父类约束

//4.1
class F{}

mixin G on F{}

//class I with G{} //编译报错：class I 没有继承 mixin 的父类约束
class I extends F with G{} //编译通过，class I 继承了 mixin 的父类约束

//4.2
mixin F1{}

mixin G1 on F1{}

//class I1 with G1{} //编译报错：class I1 没有 with mixin 的父类约束
class I1 with F1,G1{} //编译通过，class I1 with 了 mixin 的父类约束

//5、就远命中原则：当 with 多个 mixin，多个 mixin 拥有同一个方法，则调用方法时会命中最后一个 mixin 类的方法
mixin Test1{
  void testMethod(){
    print('Test1 testMethod');
  }
}

mixin Test2{
  void testMethod(){
    print('Test2 testMethod');
  }
}

class Test with Test1,Test2{

}

void main() {
  var test = Test();
  test.testMethod();
}

//打印结果
Test2 testMethod
```

有了上面的这些知识，一会阅读源码就胸有成竹了。

接下来我们先看下 GetX 的状态管理使用，然后在分析源码。

## 二、GetX 状态管理使用

GetX 状态管理主要有两种使用方式：

1、GetBuilder + Controller.update 状态管理模式

2、Obx + obs 响应式管理模式

### 2.1、GetBuilder + Controller.update 状态管理模式

```dart
//第一步：创建 GetxController 实现类
class GetBuilderLogic extends GetxController {

  var count = 0;

  void increase(){
    count++;
    update();
  }
}

//第二步：创建页面
class GetBuilderPage extends StatelessWidget {
  GetBuilderPage({Key? key}) : super(key: key);
  //1、依赖注入
  final GetBuilderLogic logic = Get.put(GetBuilderLogic());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GetBuilderPage'),
      ),
      //2、GetBuilder 管理模式
      body: GetBuilder<GetBuilderLogic>(builder: (logic) {
        return Center(
          child: Text(
            'You tapped the FAB ${logic.count} times',
            style: const TextStyle(fontSize: 20),
          ),
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: () => logic.increase(),
        tooltip: 'Increment Counter',
        child: const Icon(Icons.add), 
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}
```

效果展示：

![getbuilder.gif](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261039952.gif)

### 2.2、Obx + obs 响应式管理模式

```dart
//第一步：创建 ObxLogic
class ObxLogic {

  var count = 0.obs;

  void increase(){
    count++;
  }
}


//第二步：创建页面
class ObxPage extends StatelessWidget {
  ObxPage({Key? key}) : super(key: key);
  //1、依赖注入
  final ObxLogic logic = Get.put(ObxLogic());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ObxPage'),
      ),
      //2、Obx 管理模式
      body: Obx(() {
        return Center(
          child: Text(
            'You clicked the FAB ${logic.count} times',
            style: const TextStyle(fontSize: 20),
          ),
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: () => logic.increase(),
        tooltip: 'Increment Counter',
        child: const Icon(Icons.add), //Change Icon
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation
          .endFloat, //Change for different locations
    );
  }
}
```

效果展示：

![obx.gif](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261111940.gif)

## 三、GetX 状态管理源码分析

上面无论是 GetBuilder 还是 Obx 模式，其实就是对**观察者模式**的一个应用。

仔细分析，他们都有一些共同点：

1、创建一个 logic

GetBuilderLogic 继承了 GetxController，实际它就变成了一个被观察者，然后调用 GetxController 的 update 方法通知观察者去更新 UI

ObxLogic 虽没有继承 GetxController，但给变量添加了`.obs`后缀，使得它变成了一个响应式变量（被观察者），当它改变的时候就会通知观察者刷新 UI

2、使用 Get.put 方法进行依赖注入，对 logic 进行管理

3、GetBuilder 使用 GetBuilder 管理模式，内部做的主要事情：

> 1、从 Get 中取出依赖注入的实例，建立观察者和被观察者的绑定关系
>
> 2、对 StatefulWidget 进行了封装，最终还是通过 setState 去进行状态的更新

4、Obx 使用 Obx 管理模式，内部做的主要事情：

> 1、使用了一个中间层 RxInterface 建立观察者和被观察者的绑定关系
>
> 2、对 StatefulWidget 进行了封装，最终还是通过 setState 去进行状态的更新

接下来我们正式进入源码分析。

### 3.1、依赖注入管理

从 Get.put 为入口进行分析：

```dart
//1、Get#put
S put<S>(S dependency,
         {String? tag,
         bool permanent = false,
         InstanceBuilderCallback<S>? builder}) =>
     GetInstance().put<S>(dependency, tag: tag, permanent: permanent);
```

可以看到：

1、这是一个泛型方法。后续我们需要通过泛型类型 + tag 去生成存储依赖注入实例的 key

2、内部使用了**桥接模式**，将具体实现交给了 GetInstance

接着看 GetInstance，仅贴出关键代码：

```dart
class GetInstance {
  
  //单例
  factory GetInstance() => _getInstance ??= const GetInstance._();
  const GetInstance._();
  static GetInstance? _getInstance;
  
  //存储依赖注入实例的 map，_InstanceBuilderFactory 是一个工厂类
  static final Map<String, _InstanceBuilderFactory> _singl = {};

  //先进行 insert 插入，在通过 find 查找实例
  S put<S>(
    S dependency, {
    String? tag,
    bool permanent = false,
    @deprecated InstanceBuilderCallback<S>? builder,
  }) {
    _insert(
        isSingleton: true,
        name: tag,
        permanent: permanent,
        builder: builder ?? (() => dependency));
    return find<S>(tag: tag);
  }
  
  //生成 key，然后创建依赖注入实例工厂，在将其放入到 map 中
  void _insert<S>({
    bool? isSingleton,
    String? name,
    bool permanent = false,
    required InstanceBuilderCallback<S> builder,
    bool fenix = false,
  }) {
    final key = _getKey(S, name);
    _singl[key] = _InstanceBuilderFactory<S>(
        isSingleton,
        builder,
        permanent,
        false,
        fenix,
        name,
    );
  }
  
  //生成 key 的规则：如果 tag 为空，则为传入的泛型，如果 tag 不为空，则为传入的泛型 + tag
  String _getKey(Type type, String? name) {
    return name == null ? type.toString() : type.toString() + name;
  }
  
  //1、根据传入的 tag 和泛型类型生成 key，并通过 key 从 map 从去取依赖注入实例工厂
  //2、如果存在则通过工厂方法模式创建具体实例
  S find<S>({String? tag}) {
    final key = _getKey(S, tag);
    if (isRegistered<S>(tag: tag)) {
      final dep = _singl[key];
      if (dep == null) {
        if (tag == null) {
          throw 'Class "$S" is not registered';
        } else {
          throw 'Class "$S" with tag "$tag" is not registered';
        }
      }
      //_initDependencies 内部最终还是调用 getDependency 生成实例
      final i = _initDependencies<S>(name: tag);
      return i ?? dep.getDependency() as S;
    }  
  }
  
  //map 中是否存在该 key
  bool isRegistered<S>({String? tag}) => _singl.containsKey(_getKey(S, tag));
}
```

上述代码：

1、GetInstance 是一个**单例类**

2、put 方法会先调用内部的 insert 方法，然后在通过 find 查找实例

3、insert 方法会根据传入的`泛型 + tag`生成 key，然后创建依赖注入实例工厂，最后放入到 map 中

4、key 生成的规则：

> 1、如果传入的 tag 为空，则 key 为传入的泛型
>
> 2、如果 tag 不为空，则 key 为传入的泛型 + tag

5、find 方法会根据传入的`tag和泛型`生成 key，并通过 key 从 map 中去取依赖注入实例工厂，如果能够取到，则通过**工厂方法模式**创建具体实例并返回

ok，上述我们分析了 Get.put 方法，实际上还有 delete，lazyPut 等方法，当我们的页面销毁时，GetX 会自动给我们进行实例的回收，具体代码就不贴了，感兴趣的可以去看下。

### 3.1、GetBuilder + Controller.update 状态管理模式

接着看 GetxController 里面做了啥，为什么继承它就能成为一个被观察者？

上源码：

```dart
abstract class GetxController extends DisposableInterface
    with ListenableMixin, ListNotifierMixin {
 
  //通知观察者刷新 UI：根据观察者是否设置了 id 更新 ui
  //如果传入了 id，则只通知设置了该 id 的观察者，如果没有，则通知所有的观察者
  void update([List<Object>? ids, bool condition = true]) {
    if (!condition) {
      return;
    }
    if (ids == null) {
      refresh();
    } else {
      for (final id in ids) {
        refreshGroup(id);
      }
    }
  }
}
```

可以看到：

1、GetxController 内部就一个 update 方法，主要逻辑：

>  1、通知观察者刷新 UI：根据观察者是否设置了 id 更新 ui
>
>   2、如果传入了 id，则只通知设置了该 id 的观察者，如果没有，则通知所有的观察者

2、update 内部调用的是 refresh 系列方法，这是 ListNotifierMixin 给它提供的，实际就是因为 with 了 ListNotifierMixin 才让它成为了一个被观察者

继续跟进 ListNotifierMixin ：

```dart
mixin ListNotifierMixin on ListenableMixin {

  //数组，用于存放观察者
  List<GetStateUpdate?>? _updaters = <GetStateUpdate?>[];

  //map，用于绑定设置了 id 的观察者
  HashMap<Object?, List<GetStateUpdate>>? _updatersGroupIds =
      HashMap<Object?, List<GetStateUpdate>>();

  //实际内部调用的 _notifyUpdate
  @protected
  void refresh() {
    assert(_debugAssertNotDisposed());
    _notifyUpdate();

  }

  //通知观察者刷新更新 UI
  void _notifyUpdate() {
    for (var element in _updaters!) {
      element!();
    }
  }

  //根据 id 通知观察者刷新更新 UI
  void _notifyIdUpdate(Object id) {
    if (_updatersGroupIds!.containsKey(id)) {
      final listGroup = _updatersGroupIds![id]!;
      for (var item in listGroup) {
        item();
      }
    }
  }

  //实际内部调用的 _notifyIdUpdate
  @protected
  void refreshGroup(Object id) {
    assert(_debugAssertNotDisposed());
    _notifyIdUpdate(id);
  }

  //移除观察者
  @override
  void removeListener(VoidCallback listener) {
    assert(_debugAssertNotDisposed());
    _updaters!.remove(listener);
  }

  //根据 id 移除观察者
  void removeListenerId(Object id, VoidCallback listener) {
    assert(_debugAssertNotDisposed());
    if (_updatersGroupIds!.containsKey(id)) {
      _updatersGroupIds![id]!.remove(listener);
    }
    _updaters!.remove(listener);
  }

  //添加观察者
  @override
  Disposer addListener(GetStateUpdate listener) {
    assert(_debugAssertNotDisposed());
    _updaters!.add(listener);
    return () => _updaters!.remove(listener);
  }

  //根据 id 添加观察者
  Disposer addListenerId(Object? key, GetStateUpdate listener) {
    _updatersGroupIds![key] ??= <GetStateUpdate>[];
    _updatersGroupIds![key]!.add(listener);
    return () => _updatersGroupIds![key]!.remove(listener);
  }
  
  //...
}
```

上述代码不就是典型的被观察者的实现吗？

1、GetStateUpdate 就是观察者，实际它就是一个回调，使用了 typedef 进行定义：

```dart
typedef GetStateUpdate = void Function();
```

2、内部封装了添加，删除，通知观察者等一系列的操作，还不懂被观察者模式的可以看我这篇文章[传送门](https://juejin.cn/post/7160363585028227086#heading-40)。

ok，现在我们已经有了被观察者，接下来看看它是如何添加观察者。

GetBuilder 源码：

```dart
//1
class GetBuilder<T extends GetxController> extends StatefulWidget {
  //....

  @override
  GetBuilderState<T> createState() => GetBuilderState<T>();
}

//2
class GetBuilderState<T extends GetxController> extends State<GetBuilder<T>>
    with GetStateUpdaterMixin {
  
  //依赖注入实例
  T? controller;
  Object? _filter;

  @override
  void initState() {
    super.initState();

    //根据泛型和tag生成 key，看该 key 是否存在 map 中
    var isRegistered = GetInstance().isRegistered<T>(tag: widget.tag);

    //存在则从 map 中取出来并通过工厂方法模式创建实例并赋值给 controller
    if (widget.global) {
      if (isRegistered) {
        controller = GetInstance().find<T>(tag: widget.tag);
      } 
    } 
		
    //添加观察者
    _subscribeToController();
  }


  //根据 id 是否为 null 进行观察者的添加
  void _subscribeToController() {
    _remove?.call();
    _remove = (widget.id == null)
        ? controller?.addListener(
            _filter != null ? _filterUpdate : getUpdate,
          )
        : controller?.addListenerId(
            widget.id,
            _filter != null ? _filterUpdate : getUpdate,
          );
  }

  //_filterUpdate 内部最终也是调的 getUpdate
  void _filterUpdate() {
    var newFilter = widget.filter!(controller!);
    if (newFilter != _filter) {
      _filter = newFilter;
      getUpdate();
    }
  }

  //当页面销毁时，移除依赖注入的实例
  @override
  void dispose() {
    super.dispose();
    widget.dispose?.call(this);
    if (_isCreator! || widget.assignId) {
      if (widget.autoRemove && GetInstance().isRegistered<T>(tag: widget.tag)) {
        GetInstance().delete<T>(tag: widget.tag);
      }
  }

  @override
  Widget build(BuildContext context) {
    return widget.builder(controller!);
  }
}

//3
mixin GetStateUpdaterMixin<T extends StatefulWidget> on State<T> {

  //最终 getUpdate 还是调用的 setState 进行状态更新
  void getUpdate() {
    if (mounted) setState(() {});
  }
}
```

可以看到：

1、GetBuilder 对 StatefulWidget 进行了封装，具体逻辑在 GetBuilderState 中

2、GetBuilderState 中：

> 1、根据`泛型和tag`生成 key，然后去取依赖注入实例
>
> 2、根据 id 是否为 null 进行观察者（getUpdate）的添加
>
> 3、当页面销毁时，移除依赖注入的实例

3、getUpdate 的具体实现在 GetStateUpdaterMixin 中，可以看到最终还是调用 setState 进行 UI 的更新

当我们点击 button，就会调用 update 方法，通知观察者进行 UI 的刷新。

ok，至此就完成了 GetBuilder + Controller.update 状态管理模式的源码分析。

### 3.2、Obx + obs 响应式管理模式

我们从`0.obs `为入口进行分析：

```dart
extension IntExtension on int {
  RxInt get obs => RxInt(this);
}
```

可以看到它是 int 的一个扩展方法，内部定义了一个 get 方法，get 方法调用了 RxInt。

跟进到 RxInt：

```dart
class RxInt extends Rx<int> {
  RxInt(int initial) : super(initial);

  RxInt operator +(int other) {
    value = value + other;
    return this;
  }

  RxInt operator -(int other) {
    value = value - other;
    return this;
  }
}
```

上述代码：

1、RxInt 继承了 Rx 泛型类

2、进行了操作符（+，-）的重载

继续看 Rx：

```dart
//Rx，具体逻辑交给了 _RxImpl
class Rx<T> extends _RxImpl<T> {
  Rx(T initial) : super(initial);

  //...
}

//_RxImpl，具体逻辑交给了 RxNotifier 和 RxObjectMixin
abstract class _RxImpl<T> extends RxNotifier<T> with RxObjectMixin<T> {
  //...
}

//RxNotifier 将具体逻辑交给了 RxInterface 和 NotifyManager，RxInterface 是一个接口，具体实现还是在 NotifyManager 中
class RxNotifier<T> = RxInterface<T> with NotifyManager<T>;

//GetStream：被观察者的具体实现
class GetStream<T> {
  
  //真正通知观察者刷新 ui
  void _notifyData(T data) {
    _isBusy = true;
    for (final item in _onData!) {
      if (!item.isPaused) {
        item._data?.call(data);
      }
    }
    _isBusy = false;
  }

  //通知观察者，内部会调用 _notifyData
  void add(T event) {
    //...
    _value = event;
    _notifyData(event);
  }

  
  //添加观察者
  LightSubscription<T> listen(void Function(T event) onData,
      {Function? onError, void Function()? onDone, bool? cancelOnError}) {
    final subs = LightSubscription<T>(
      removeSubscription,
      onPause: onPause,
      onResume: onResume,
      onCancel: onCancel,
    )
      ..onData(onData)
      ..onError(onError)
      ..onDone(onDone)
      ..cancelOnError = cancelOnError;
    addSubscription(subs);
    onListen?.call();
    return subs;
  }
    //...
}


//NotifyManager：对 RxInterface 的具体实现
mixin NotifyManager<T> {
  
  //内部拥有一个被观察者
  GetStream<T> subject = GetStream<T>();

  bool get canUpdate => _subscriptions.isNotEmpty;

  //传入的被观察者会执行添加观察者的操作：GetStream.listen，观察者中又会触发内部的被观察者发送通知给它所绑定的观察者
  //这里需要注意：GetStream.listen 方法是添加观察者，而 GetStream.add 是通知观察者
  void addListener(GetStream<T> rxGetx) {
    if (!_subscriptions.containsKey(rxGetx)) {
      final subs = rxGetx.listen((data) {
        if (!subject.isClosed) subject.add(data);
      });
    }
  }

  //listen 中会调用内部的被观察者添加观察者
  StreamSubscription<T> listen(
    void Function(T) onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) =>
      subject.listen(
        onData,
        onError: onError,
        onDone: onDone,
        cancelOnError: cancelOnError ?? false,
      );
}

//RxInterface：内部未实现的方法交由其他类，主要关注 notifyChildren 方法
abstract class RxInterface<T> {
  static RxInterface? proxy;

  bool get canUpdate;
  void addListener(GetStream<T> rxGetx);
  void close();
  StreamSubscription<T> listen(void Function(T event) onData,
      {Function? onError, void Function()? onDone, bool? cancelOnError});

  //完成 RxInterface.proxy 的赋值，视图的更新，让整个逻辑形成闭环
  static T notifyChildren<T>(RxNotifier observer, ValueGetter<T> builder) {
    final _observer = RxInterface.proxy;
    RxInterface.proxy = observer;
    final result = builder();
    //...
    RxInterface.proxy = _observer;
    return result;
  }
}

//RxObjectMixin：主要关注 set 和 get 方法
mixin RxObjectMixin<T> on NotifyManager<T> {
  late T _value;
  //是否是第一次重建
  bool firstRebuild = true;

  //set 方法
  set value(T val) {
    //如果传入的值和当前值相等且不是第一次重建则不处理
    if (_value == val && !firstRebuild) return;
    firstRebuild = false;
    //进行赋值操作
    _value = val;
    //通知观察者刷新 UI
    subject.add(_value);
  }
  
  //get 方法
  T get value {
    //进行观察者和被观察者关系的绑定，具体实现在 NotifyManager 中
    RxInterface.proxy?.addListener(subject);
    return _value;
  }
}
```

看了上述代码你可能会有一些头晕，现在我们好好理一下整个流程：

当我们进入页面调用`0.obs`的时候，最终会触发 RxObjectMixin 中的 get 方法， RxObjectMixin 中的 get 方法内部会走：

```dart
//1、RxInterface.proxy 是 RxInterface 的一个静态代理
RxInterface.proxy?.addListener(subject);

//2、具体实现在 NotifyManager 中
void addListener(GetStream<T> rxGetx) {
    if (!_subscriptions.containsKey(rxGetx)) {
      final subs = rxGetx.listen((data) {
        if (!subject.isClosed) subject.add(data);
      });
    }
}
```

留个疑问🤔️：**RxInterface.proxy 是在哪里被赋值的呢？**

这里实则有两层被观察者关系的绑定，一层是传入的被观察者，一层是 NotifyManager 内部持有的被观察者：

> 1、传入的被观察者会进行添加观察者的操作
>
> 2、观察者内部又会触发内部持有的被观察者发送事件通知它所绑定的观察者

画个图理一理：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261111535.png" alt="image-20230227160343616.png" width="100%" />

那么内部持有的被观察者在哪里进行了观察者的添加呢？

想要知道答案，就要看看 Obx 的源码：

```dart
//1、Obx 继承了 ObxWidget
class Obx extends ObxWidget {
  final WidgetCallback builder;

  const Obx(this.builder);

  @override
  Widget build() => builder();
}

//2、Obx 继承了 StatefulWidget，接着看 _ObxState
abstract class ObxWidget extends StatefulWidget {
 
  
  @override
  _ObxState createState() => _ObxState();

}

//3、_ObxState
class _ObxState extends State<ObxWidget> {
  //持有 RxNotifier，RxNotifier 的具体实现是 RxInterface + NotifyManager
  final _observer = RxNotifier();
  late StreamSubscription subs;

  @override
  void initState() {
    super.initState();
    //添加观察者：listen 中会调用内部的被观察者添加观察者
    subs = _observer.listen(_updateTree, cancelOnError: false);
  }

  //观察者内部会执行此方法，最终还是调用 setState 进行状态的更新
  void _updateTree(_) {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    subs.cancel();
    _observer.close();
    super.dispose();
  }

  //页面构建的时候，调用了 RxInterface.notifyChildren，这里面对 RxInterface.proxy 进行了赋值，页面的构建
  @override
  Widget build(BuildContext context) =>
      RxInterface.notifyChildren(_observer, widget.build);
}
```

上述代码可以看到：

1、完成了 Rx 内部被观察者和观察者的绑定，观察者内部还是调用 setState 进行状态的更新

2、通过 RxInterface.notifyChildren 方法完成 RxInterface.proxy 的赋值

这里也就回答了我们上面留的疑问。

但又出现了另外一个问题：RxInterface.proxy 是一个静态变量，如果使用不当会造成内存泄漏，那 GetX 是怎么做的呢？

具体在看一眼 RxInterface.notifyChildren 方法：

```dart
static T notifyChildren<T>(RxNotifier observer, ValueGetter<T> builder) {
    final _observer = RxInterface.proxy;
    RxInterface.proxy = observer;
    final result = builder();
    //...
    RxInterface.proxy = _observer;
    return result;
}
```

可以看到：

1、将传入的 observer 赋值给 RxInterface.proxy

2、进行页面视图的构建

3、待页面构建完成，又将 RxInterface.proxy 置为 null

上述操作就避免了 RxInterface.proxy 内存泄漏，也让整个逻辑形成了闭环。

当我们执行 count++ 操作时：

```dart
class ObxLogic {

  var count = 0.obs;

  void increase(){
    count++;
  }
}
```

会调用 RxObjectMixin 的 set 方法通知观察者，观察者内部会执行 setState 方法，setState 会调用页面的 build 方法，build 中会调用 RxInterface.notifyChildren ，最终完成 UI 的刷新。

## 四、总结

本篇文章我们介绍了：

1、GetX 源码分析需要的一些前置知识：函数类型，typedef，extension，泛型方法，构造方法，get，set，mixin

2、GetX 状态管理的使用及效果展示，主要分为两种：

> 1、GetBuilder + Controller.update 状态管理模式
>
> 2、Obx + obs 响应式管理模式

3、进行了 GetX 状态管理的源码分析

> 1、GetX 的依赖注入，内部使用 map 进行管理
>
> 2、GetBuilder + Controller.update 源码：主要通过 Get 的依赖注入管理完成观察者和被观察者的绑定，最终还是通过 setState 进行状态的更新
>
> 3、Obx + obs 源码：主要通过 RxInterface 完成观察者和被观察者关系的绑定，最终还是通过 setState 进行状态的更新


好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会手撸 GetX 状态管理核心源码实现，敬请期待吧🍺

### 参考和推荐

[Flutter GetX 深度剖析](https://juejin.cn/post/6984593635681517582#heading-7)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](https://link.juejin.cn/?target=http%3A%2F%2Fm6z.cn%2F6jwi7b "http://m6z.cn/6jwi7b") ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
