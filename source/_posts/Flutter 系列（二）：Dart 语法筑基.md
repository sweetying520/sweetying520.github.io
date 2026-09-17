---
title: Flutter 系列（二）：Dart 语法筑基
date: 2022-10-10 16:20:34
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281601330.jpeg
tags: 
- 原创
- Flutter
categories:
- Flutter
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281601330.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们介绍了 Flutter 开发环境搭建，以及使用 AndroidStudio 运行你的第一个 Flutter 项目，体验了热重载。还没有看过上一篇文章的朋友，建议先去阅读[Flutter 系列（一）：运行你的第一个 Flutter 应用](https://juejin.cn/post/7057420846863745031)，在我看来，Dart 在设计时应该是借鉴了百家语言之所长😄：Java，Kotlin等：

1、在静态语法方面，如：类型定义，方法声明，泛型等，和 Java 非常相似

2、一些语法特性，如：函数式特性，空安全，函数默认值等，和 Kotlin 非常相似

3、Dart 还有一些自己独创的语法，如：命名构造方法，级联操作符等

总之，熟悉之后，你会发现 Dart 是一门非常有意思的编程语言，接下来就让我们一起进入 Dart 的语法学习吧

**注意**： Dart 语法和 Java，Kotlin 真的很像，尤其是 Java。另外如果对 Kotlin 语法不熟的，可以去看我的另外一篇文章：["Kotlin"系列: 一、Kotlin入门](https://juejin.cn/post/6942251919662383134)

## 一、变量和方法

### 1.1、变量

1）、Dart 可以显示指明类型来声明一个可变的变量。且指明的类型分为可空和非空

2）、Dart 也可以使用 var 关键字来声明一个可变的变量，此时编译器会根据变量初始值自动推断类型

3）、Dart 使用 final 关键字来声明一个不可变的变量，且可以替代 var 或加在类型前面

4）、Dart 中变量如果是非空类型，那么必须给一个默认值，否则无法编译通过。如果是可空类型，默认值都为 null

5）、Dart 中每一行代码都要加 ; 😂，走回头路了，有点鸡肋

```dart
//1、Dart 可以显示指明类型来声明一个可变的变量。且指明的类型分为可空和非空
//1.1、类比 Java，显示指明类型来声明一个可变的变量
//dart 写法：
int a = 10;
bool b = true;

//Java 写法
int a = 10;
boolean b = true;

//1.2、指明的类型分为可空和非空
//dart 写法
int? a = 10;
bool? b = true;

//kotlin 写法
var a: Int? = 10
var b: Boolean? = true
  
//2、Dart 也可以使用 var 关键字来声明一个可变的变量，此时编译器会根据变量初始值自动推断类型
//dart 写法
var a = 10;
var b = true;

//kotlin 写法
var a = 10
var b = true
  
//3、Dart 使用 final 关键字来声明一个不可变的变量，且可以替代 var 或加在类型前面
//dart 写法
final a = 10;
final int aa = 10;
final b = true;
final bool bb = true;

//Java 写法
final int a = 10;
final boolean b = true;

//5、Dart 中变量如果是非空类型，那么必须给一个默认值。如果是可空类型，默认值都为 null
void main() {
  String s = "erdai";
  int? i;
  print('$s $i'); //打印结果：erdai null
}
```

**小建议**：定义变量，优先使用自动推断，来自 Dart 官方的建议

**注意**： Dart 完全抛弃了 Java 中的基本数据类型，全部都是对象数据类型

5）、Dart 中还可以使用 Object 和 dynamic 关键字来声明一个变量

```dart
//1、Dart 中还可以使用 Object 和 dynamic 关键字来声明一个变量
//1.1、Object 声明变量，这一点和 Java 没任何区别
Object a = 10;
Object b = true;
Object str = "erdai666";

//1.2、dynamic 声明变量，这一点是 Java 所没有的
dynamic a = 10;
dynamic b = true;
dynamic str = "erdai666";
```

思考一个问题：Object 和 dynamic 有啥区别呢？🤔️

答：Object 是所有类的基类，相当于一个可以兼容所有类型的超级类型，这点和 Java 类似。dynamic 就是一个定义动态类型的关键字

```dart
//1、声明一个 Object 类型的变量调用 substring，此时会编译报错，因为 Object 没有 substring 方法
Object str = "erdai666";
str.substring(1); //编译报错：The method 'substring' isn't defined for the type 'Object'.

//2、使用 dynamic 定义一个变量调用 substring，此时可以绕过编译检查
dynamic str = "erdai666";
str.substring(1);
```

**注意**：使用 dynamic 定义的变量调用相关指定类型 api 时，因为会绕过编译器检查，所以别写错了，否则运行时就会报找不到此 api，如下：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281601808.png" alt="img" width="100%" />

可以看到，编译器提示： String 类没有 subString 方法。就是因为我们 api 写错了，将 substring 写成了 subString 导致的

### 1.2、常量

1）、Dart 使用 const 关键字来定义一个常量

2）、Dart 可以使用 const 关键字替代 var 或加在类型前面

3）、Dart 还可以使用 const 关键字来创建一个常量

```dart
//1、Dart 使用 const 关键字来定义一个常量
//2、Dart 可以使用 const 关键字替代 var 或加在类型前面
const a = 10;
const b = true;
const int aa = 10;
const bool bb = true;

//3、Dart 还可以使用 const 关键字来创建一个常量
//创建一个内容和引用都不可变的 list 数组
var list = const [1,2,3];
//创建一个内容和引用都不可变的 set 集合
var set = const {1,2,3};
```

这里我有一个疑问：那 const 和 final 有啥异同呢？

答：

异：

1、final 可以一开始不赋值，如果赋值了则不可变。const 一开始就需要赋值且不可变

2、const 必须给一个明确的编译常量值（即编译期间就确定的值）

3、final 可以通过计算或者方法获取一个值（即运行期间确定的值）

4、final 表示引用不可变，但内容是可变的。const 表示内容和引用都不可变

同：

1、final，const 关键字都可以用来定义一个常量

```dart
//1、final 可以一开始不赋值，如果赋值了则不可变。const 一开始就需要赋值且不可变
//2、const 必须给一个明确的编译常量值（即编译期间就确定的值）
//3、final 可以通过计算/方法获取一个值（即运行期间确定的值）

final a;//编译通过
a = 10;//编译通过

const b;//编译报错
b = 10;//编译报错

//4、final 表示引用不可变，但内容是可变的。const 表示内容和引用都不可变
final set = {1,2,3};
set.add(4);

var list = const [1,2,3];
list.add(4);//运行报错，const list 不可新增元素
```

### 1.3、方法

#### 1.3.1、方法定义

1）、方法和函数是同一个概念，在 Java 中我们习惯叫方法 (method)。在 Kotlin 中我们习惯叫函数 (function)。因 Dart 更像 Java ，因此这里建议大家也叫方法 (method)

2）、方法是运行代码的载体，像我们使用过的 main 方法就是一个方法

Dart 中定义方法的语法规则：

> 返回参数类型 方法名(参数1,参数2,参数3...) {
>
> 方法体
>
> }

```dart
//1、Dart 写法1：方法的参数使用：var 参数名
String methodName(var name,var age){
  return "erdai666";
}

//2、Dart 写法2：方法的参数使用：类型 参数名
String methodName(String name,int age){
  return "erdai666";
}

//3、Dart 写法3：方法的返回类型可省略，根据方法体最后一行代码进行返回类型推断
methodName(var name,var age){
  return "erdai666";
}

//4、如果没有写返回类型，且方法体最后一行代码没有明确写返回语句，那么默认执行：return null
methodName(var name,var age){
  
}

//5、Dart 写法4：无返回值使用 void 关键字
void methodName(var name,var age){
  
}

//6、Dart 写法5：如果方法体只有一行表达式，可将其改成单行方法样式，方法名和方法体用 => 连接
String methodName(var name,var age) => "erdai666";
```

方法语法解释：

-   所有方法都有返回值，即使返回值是 void

-   方法的返回类型，可写可不写。如果不写，会根据方法体里面最后一行代码进行类型推断

-   如果没有写返回类型，且方法体最后一行代码没有明确写返回语句，那么默认执行：return null

-   方法名称可以随便取，就像 Java ，Kotlin 里面定义方法名一样

-   方法名里面的参数可以有任意多个，参数的声明格式有两种：

    > 1、var 参数名
    >
    > 2、类型 参数名

<!---->

-   如果方法体只有一行表达式，可将其改成单行方法样式，方法名和方法体用 => 连接

**小建议**：定义一个方法时，建议把返回类型给写出来，可读性强

#### 1.3.2、可选参数 & 命名参数 & 默认参数

##### 可选参数

1）、可选参数顾名思义就是可以选择的参数，使用 [] 表示可选的位置参数，如下：

```dart
void optionFunction(var value1,[var value2 = 2,var value3 = 3]){
  print('$value1 $value2 $value3');
}

void main(){
  optionFunction(1);
}

//打印结果
1 2 3
```

疑问：如果我只想给 value1 和 value3 传参：可以做到吗？

答：不能。如果想做到，就需要使用命名参数

##### 命名参数

1）、命名参数默认都为可选参数。如果是必要参数，则需要用 required 关键字，且使用 required 修饰的参数不能提供默认值

2）、使用 {} 来指定命名参数

3）、命名参数必须以 key: value 的形式去指定

如下：

```dart
//1、使用 {} 来指定命名参数
void optionFunction(var value1,{var value2 = 2,var value3 = 3}){
  print('$value1 $value2 $value3');
}

void main(){
  optionFunction(1,value3: 4);
}
//打印结果
1 2 4

 
//2、如果是必要参数，则需要用 required 关键字，且使用 required 修饰的参数不能提供默认值
//此时 value2 为必传的参数
void optionFunction(var value1,{required var value2,var value3 = 3}){
  print('$value1 $value2 $value3');
}  

void main(){
  optionFunction(1,value2: 4);
}
//打印结果
1 4 3
```

##### 默认参数

如上我们刚才给可选参数和命名参数提供的默认值

1）、默认参数就是给可选参数提供默认值，以便在未提供相应实参时使用

2）、默认值必须是编译时常量

3）、如果可选参数没有提供默认值，那默认值就为 null

```dart
//1、如果可选参数没有提供默认值，那默认值就为 null
void optionFunction(var value1,{var value2 = 2,var value3}){
  print('$value1 $value2 $value3');
}
 
void main(){
  optionFunction(1);
}
//打印结果
1 2 null
```

#### 1.3.3、匿名方法（又称闭包）

1）、匿名方法顾名思义就是没有名字的方法，语法规则如下：

```dart
//1、方式一：
(var 参数名){
   方法体
}

//2、方式二：
(类型 参数名){
   方法体
}

//3、方式三：如果方法体只有一行代码可以将匿名方法用单行表示
(var 参数名) => 方法体
(类型 参数名) => 方法体
  
//4、方式四：省略 var 或类型
(参数名){
   方法体
}

(参数名) => 方法体
```

2）、匿名方法一般会当做参数或赋值给一个变量

```dart
//1、匿名方法当作参数使用
void main(){
  const list = [1,2,3];
  list.forEach((element){
    print(element);
  });
  //可简化成如下写法：
  //list.forEach((element) => print(element));
}

//2、匿名方法赋值给一个变量
void main(){
  const list = [1,2,3];
  var function = (element){
    print(element);
  };
  //可简化成如下写法：
  //var function = (element) =>  print(element);
  list.forEach(function);
}
```

3）、匿名方法立即执行

```dart
//1、方式1
void main(){
  var func = (){
    print('666');
  };
  (func)();
}

//2、方式2
void main(){
  ((){
    print('666');
  })();
}

//打印结果
666
```

4）、匿名方法内部可以引用包含该匿名方法的所有层级作用域中的变量，与匿名方法调用的位置无关，如下：

```dart
//makeAdder 返回一个匿名方法
Function makeAdder(num addBy){
  //匿名方法访问 addBy 参数
  return (num i) => addBy + i;
}

void  main(){
  //创建一个匿名方法，传入实参为 2
  var add1 = makeAdder(2);
  //创建一个匿名方法，传入实参为 3
  var add2 = makeAdder(3);

  //分别调用两个匿名方法，并打印结果
  print(add1(3));
  print(add2(4));
}

//打印结果
5
7
```

**注意**：Dart 中的方法也是一种类型，对应 Function 类，所以方法可以被赋值给变量或作为参数传入另一个方法

#### 1.3.4、静态方法

1）、使用 static 关键字修饰的方法即为静态方法，因静态方法不属于类实例，所以也无法访问类成员

2）、静态方法可以使用类名直接调用

```dart
class Test{
  static String staticFunction1(){
    return "";
  }

  static void staticFunction2(){
 
  }
}

void main(){
  Test.staticFunction1();
  Test.staticFunction2();
}
```

## 二、基本类型和运算符

### 2.1、基本类型

前面提到过：Dart 完全抛弃了 Java 中的基本数据类型，全部都是对象数据类型。因此我们这里讲的基本类型，也是对象数据类型，只不过是 Dart 默认给我们提供的

#### 2.1.1、数字类型

1）、在dart语言中数字类型主要有下面三种：

> int：整数类型
>
> double：浮点数类型
>
> num：数字类型，int和double都是它的子类

```dart
var x = 1;   // 初始化为 int 类型
var y = 1.1;  // 包含小数，初始化为 double

// 明确指定数据类型
double z = 1;
num d = 100;
```

2）、数字类型和字符串类型互相转换

```dart
// 将 String 类型转换成 int 类型
var one = int.parse('1');

// 将 String 类型转换成 double 类型
var onePointOne = double.parse('1.1');


// 将 int 类型转换成 String 类型
String oneAsString = 1.toString();

// 将 double 类型转换成 String 类型, 保留两位小数
String piAsString = 3.14159.toStringAsFixed(2);
```

#### 2.1.2、字符串类型

1）、字符串类型使用单引号或者双引号包裹字符串都可以

```dart
var s1 = 'Hello';
var s2 = "erdai";
```

##### 2.1.2.1、字符串内嵌表达式

1）、Dart 支持在字符串中内嵌变量，或者干脆内嵌表达式

```dart
// 内嵌变量
var s3 = '你好: $s2';

// 内嵌表达式
var s4 = "转大写：${s2.toUpperCase()}";
```

##### 2.1.2.2、字符串相加（连接）

字符串相加，就是将两个字符串连接起来，dart 语言中有以下两种方式实现字符串连接：

1）、连续的字面字符串定义，默认会将字符串连接起来

2）、使用 + 加号连接字符串

```dart
void main(){
  //1、连续的字面字符串定义，默认会将字符串连接起来
  var str1 = "erdai" "666";
  //2、使用 + 加号连接字符串
  var str2 = "erdai" + "666";
  print(str1);
  print(str2);
}

//打印结果
erdai666
erdai666
```

##### 2.1.2.3、多行字符串定义

1）、使用 **'''** 三引号定义多行字符串，这种方式可以保留字符串的换行符

```dart
void main() {
  var s1 = '''
这是第一行字符串。
这是第二行字符串。
''';
  print(s1);
}

//打印结果
这是第一行字符串。
这是第二行字符串。
```

#### 2.1.3、布尔类型

布尔类型就两种值：true 或者 false， 分别表示真和假

```dart
var isOk = false;
bool status = true;
```

#### 2.1.4、枚举类型

1）、枚举类型其实就是一组常量的集合，都是只读的

```dart
// 使用 enum 关键字，定义 Color 枚举类型，Color 包含了3个常量 red、green、blue
enum Color { red, green, blue }

// 读取 Color.blue 枚举常量
var aColor = Color.blue;

// 使用 switch 语句判断 aColor 变量值
switch (aColor) {
  case Color.red:  // 使用枚举常量作为检测条件，aColor == Color.red 则成立。
    print('Red as roses!');
    break;
  case Color.green:
    print('Green as grass!');
    break;
  default: // 默认条件
    print(aColor); // 'Color.blue'
}
```

2）、枚举常量都有一个从 0 开始数字编号，第一个常量是 0，第二个是 1，以此类推

```dart
void main() {
  print(Color.green.index);
  print(Color.blue.index);
}

//打印结果
1
2
```

### 2.2、运算符

运算符这一块，除了级联调用是 Java 和 Kotlin 所没有的，其他运算符基本类似

#### 2.2.1、级联调用

1）、级联调用就是通过 **.. (两个连续的点)** 连续调用对象的属性和方法

```dart
querySelector('#confirm') // 通过 querySelector 查询获得一个对象
  ..text = 'Confirm' // 设置对象 text 属性
  ..classes.add('important');  // 调用对象的 classes 属性的 add 函数

//等价如下代码

// 通过 querySelector 查询获得一个对象
var button = querySelector('#confirm');
// 设置对象 text 属性
button.text = 'Confirm';
// 调用对象的 classes 属性的 add 函数
button.classes.add('important');
```

**注意**：大家先关注语法即可

#### 2.2.2、赋值运算符

```dart
//1、使用 = 进行赋值
a = 100;

//2、复合赋值运算符
a *= 3; // 等价于 a = a * 3
a -= 3; // 等价于 a = a - 3
a += 3; // 等价于 a = a + 3
a /= 3; // 等价于 a = a / 3
a %= 3; // 等价于 a = a % 3
```

#### 2.2.3、算数运算符

| 运算符 | 说明                   |
| ------ | ---------------------- |
| +      | 加                     |
| -      | 减                     |
| -expr  | 算数取反               |
| *      | 乘                     |
| /      | 除                     |
| ~/     | 除法，结果取整         |
| %      | 求余                   |
| ++     | 支持前置自增和后置自增 |
| --     | 支持前置自减和后置自减 |

```dart
// a = 5
var a = 2 + 3;
// a1 = -1
var a1 = 2 - 3;
// a2 = 6
var a2 = 2 * 3;
// a3 = 2.5
var a3 = 5 / 2;
// 整除，a4 = 2
var a4 = 5 ~/ 2;
// 求余数 a5 = 1
var a5 = 5 % 2;
//a++ 和 ++a 区别：a++ 先用在加，++a先加在用
a++; // 相当于 a = a + 1
++a; 
a--; // 相当于 a = a - 1
--a;
```

#### 2.2.4、关系运算符

关系运运算符常用于条件表达式中，判断条件是否成立

| 运算符 | 说明                 |
| ------ | -------------------- |
| ==     | 判断两个值是否相等   |
| !=     | 判断两个值是否不相等 |
| \>     | 大于                 |
| <      | 小于                 |
| >=     | 大于等于             |
| <=     | 小于等于             |

#### 2.2.5、类型测试运算符

| 运算符 | 说明                                                         |
| ------ | ------------------------------------------------------------ |
| as     | 用于类型转换，将一个对象类型转换成另外一种对象类型，一般用于子类对象转换成父类对象。 |
| is     | 用于检测一个变量是否属于某种对象类型                         |
| is!    | 用于检测一个变量不属于某种对象类型                           |

```dart
// 如果 emp 变量是 Person 类型则条件为 true
if (emp is Person) {
  // 忽略代码
}

// 永远返回 true, 因为所有类型都继承了 Object。
if (emp is Object) {
    // 忽略代码
}
```

**注意**：如果变量是某个类的子类的实例，那么这个变量也属于父类类型，is 条件返回 true

#### 2.2.6、逻辑运算符

| 运算符 | 说明           |
| ------ | -------------- |
| !expr  | 表达式条件取反 |
| \|\|   | 逻辑或         |
| &&     | 逻辑与         |

```dart
//常用于条件语句组合表达式
if (!done && (col == 0 || col == 3)) {
  //...
}
```

#### 2.2.7、位运算符

二进制位运算符

| 运算符 | 说明     |
| ------ | -------- |
| &      | 与       |
| \|     | 或       |
| \^     | 异或     |
| ~expr  | 按位取反 |
| <<     | 左移     |
| >>     | 右移     |

```dart
// a = 256
var a = 1 << 8; // 1 左移 8 位相当于：1 * 2 的 8 次方
```

#### 2.2.8、条件运算符

Dart 中有两种条件运算符：

1、语法规则：condition ? expr1 : expr2 ，类似 Java 三目运算符。condition 表达式为真，则执行并返回 expr1 的值， 否则执行 expr2

2、语法规则：expr1 ?? expr2 ，类似 Kotlin 的 ?: 。如果 expr1 不等于 null, 则执行 expr1 并返回 expr1 的值，否则执行并返回 expr2 的值

```dart
// 如果isPublic为真，visibility = 'public' 否则 visibility = 'private'
var visibility = isPublic ? 'public' : 'private';

// 这种语法在处理参数默认值非常有用。
// 如果name不等于null, 则payerName = name 否则payerName = 'Guest'
String payerName = name ?? 'Guest';
```

## 三、数组和集合

### 3.1、List 数组

#### 3.1.1、定义

1）、与 Java 的数组类型不同，Dart 中的数组类型就是 List，它是泛型类型数据结构，支持任意数据类型的数组

2）、List 数组定义的元素有序可重复，类似 Java 的 List 集合

3）、Dart 中 List 数组主要分为两种类型：

1、可变长度数组

2、固定长度数组

不管是哪种类型的数组，他们的操作方式是一样的

```dart
//1、可变长度数组
//定义一个 int 类型的可变数组
List<int> a = []; //等价：var a = <int>[];

//定义一个 String 类型的可变数组
var strs = <String>[]; //等价 List<String> strs = [];

//如下这种定义方式，编译器会给我们推断出是字符串类型的可变数组
var strs = ['字符串'];
```

1、熟悉 Java 的人都知道，上述这种定义就是泛型类型的语法，<> 符号定义的是 List 的元素类型

2、上述定义数组我们并没有指定数组大小，因此他们定义的都是可变数组，可变数组可以往数组中插入不限制数量的元素 （只要没超过内存限制）

```dart
//2、固定长度数组
//定义一个固定长度为 3 ，类型为 int 的数组
var list = List.filled(3,0);

//测试一
void main() {
  //定义一个固定长度为 3 ，类型为 int 的数组
  var list = List.filled(3,0);
  list[0] = 1;
  list[1] = 2;
  list[2] = 3;
  //此时如果我们添加第 4 个元素，则会报数组下标越界异常
  //list[3] = 4; //数组下标越界
  for (var value in list) {
    print(value);
  }
}
//打印结果
1
2
3
  
//测试二：
void main() {
  //定义一个固定长度为 2 ，类型为 String 的数组
  var list = List.filled(2,"");
  list[0] = "erdai";
  list[1] = "666";

  for (var value in list) {
    print(value);
  }
}
//打印结果
erdai
666
```

**注意：**

1、上述 filled 方法的两个参数：第一个表示数组长度，第二个表示存放的元素类型初始值

2、固定长度的数组，只能通过数组下标的方式读写数组，不能使用 add，insert 方法修改数组，否则会报错

#### 3.1.2、伸展运算符

如果我们想将一个 List 数组的元素填充到另外一个数组去，我们可以使用伸展运算符 **...** ，如下：

```dart
var list = [1, 2, 3];
var list2 = [0, ...list]; // 将 list 数组的所有元素一个个展开来，插入到 list2 中
// 等价代码 var list2 = [0, 1, 2, 3]
```

#### 3.1.3、常用 Api 介绍

```dart
//1、首先定义一个 int 类型的可变数组
var a = <int>[];

//2、往数组尾巴添加元素 a:[1,2,3]
a.add(1);
a.add(2);
a.add(3);

//3、修改第一个元素的值 a:[0,2,3]
a[0] = 0;

//4、在数组 0 位置，插入 100 a:[100,0,2,3]
a.insert(0,100);

//5、删除一个元素 a:[100,0,2]
//根据元素删除
a.remove(3);

//根据下标删除 a:[100,2]
a.removeAt(1);

//6、获取数组大小
print(a.length); //打印：2
  
//7、数组排序：默认数组从小到大排序 a:[2,100]
a.sort();

//8、判断数组是否包含指定元素
a.contains(2); // true

//9、清空 List，删除所有数据 a:[]
a.clear();
```

### 3.2、Set 集合

#### 3.2.1、定义

1）、Dart 中的 Set 是无序集合类型，Set 跟 List 都能保存一组数据，区别就是 Set 的元素都是唯一的，和 Java 的 Set 集合类似

2）、Set 支持任意类型数据，主要有下面三种方式初始化：

```dart
//1、方式一：使用 {} 定义一个 String 类型的 Set
var strSet = {"str"};

//2、方式二：定义一个空的 String 类型的 Set
var names = <String>{};

//3、方式三：通过 Set 对象定义一个可以保存 String 类型的 Set
var names = Set<String>();
```

#### 3.2.2、常用 Api 介绍

```dart
//1、首先定义一个 set 集合
var names = <String>{};

//2、添加一个元素 names:{"Dart"}
names.add("Dart");

//3、添加一个 List 数组 names:{"Dart","Flutter"}
var titles = ["Flutter"];
names.addAll(titles);

//4、获取 Set 大小
print(names.length); //打印：2

//5、删除元素
//根据元素进行删除 names:{"Dart"}
names.remove("Flutter");

//6、判断 Set 是否包含指定元素
names.contains("Dart"); //true

//7、清空 Set 所有元素 names:{}
names.clear();
```

### 3.3、Map 集合

#### 3.3.1、定义

1）、Dart 中 map 类型，就是一种哈希类型数据，map 类型的数据都是由 key 和 value 两个值组成，key 是唯一的，value 不必唯一，读写数据都是通过 key 进行，map 也是泛型类型，支持任意类型数据，key 和 value 可以是任意类型数据

2）、map 主要有以下四种方式初始化：

```dart
//1、方式一：直接以key, value 的方式初始化一个 map 类型变量， key 和 value 都是 String 类型
var map1 = {
  //格式  Key: Value
  'first': 'partridge',
  'second': 'turtledoves',
  'fifth': 'golden rings'
};

//2、方式二：直接通过 Map 类构造一个 map 类型变量, key 类型为 String, value 类型为 int
var map2 = Map<String, int>();

//3、方式三：定义一个 key 类型为 String, value 类型为 int 的空 Map
var map3 = <String,int>{}

//4、方式四：定义一个绕过编译检查的动态 key，value 类型 Map
var map4 = Map(); //等价于：var map4 = {};
```

#### 3.3.2、常用 Api 介绍

```dart
//1、首先定义一个 map
var map = {};

//2、向 map 添加数据 map:{"key1":"value1","key2":"value2"}
//使用 [] 操作符读写 map 数据，语法：map变量[key]
map["key1"] = "value1";
map["key2"] = "value2";

//3、查询 map：使用[]操作符，根据 key 查询对应的 value 值，如果 key 不存在则返回 null
var v1 = map["key1"];
var v2 = map["key2"];

//4、更新 map 数据：根据 key 更新 map 数据和添加 map 数据用法一样
//如果 key 值不存在则添加，否则更新 key 的数据
//map:{"key1":"value1","key2":"value2"}
map["key2"] = "erdai";

//5、获取 map 大小
print(map.length); //打印：2

//6、遍历 map
map.forEach((k, v) {
  print('$k $v');
});

//7、删除 map 数据：通过 remove 函数可以删除指定的 key 数据
//map:{"key2":"value2"}
map.remove("key1");

//8、清空所有 map 数据 map:{}
map.clear();
```

## 四、程序的逻辑控制

这个章节相对简单，我们就简单举个例子

### 4.1、if-else

```dart
if (isRaining()) {
  // 代码1
} else if (isSnowing()) {
  // 代码2
} else {
  // 代码3
}
```

else是可选的，根据需要组合即可

### 4.2、for-i 和 for-in 循环

```dart
// 定义 int 数组
var list = [5,1,2,6,3];

//1、for-i 循环遍历数组
for (var i = 0; i < list.length; i++) {
  // 打印数组元素
  print(list[i]); 
}

//2、for-in 循环遍历数组变量 list
for (var v in list) {
  // 打印数组元素 v
  print(v); 
}

//打印结果
5
1
2
6
3
```

### 4.3、switch语句

1）、switch 语句的作用跟 if 语句类似，用于检测各种条件是否成立，然后执行相应分支的代码

2）、switch 支持检测 int，String 类型变量的检测，当然如果你自定义的类重载了 == 操作符，也可以在 switch 条件中使用

```dart
// 条件状态变量
var command = 'OPEN';

switch (command) { // 需要检测的变量 
  case 'CLOSED':  //case 语句用于设置检测条件
    executeClosed(); // 如果 command = 'CLOSED'，执行当前分支代码。
    break; // 结束当前分支执行逻辑
  case 'PENDING':
    executePending();
    break;
  case 'APPROVED':
    executeApproved();
    break;
  default: // 如果上面的 case 语句都没有匹配成功，则执行 default 分支的逻辑。
    executeUnknown();
}
```

### 4.4、while 和 do-while 循环语句

```dart
//1、while 循环语句例子
void main() {
  // 定义 int 数组
  var list = [5, 1, 2, 6, 3];

  // 循环遍历数组
  var i = 0;
  while (i < list.length) {
    // 条件为 true 则执行循环体代码
    print(list[i]); // 打印数组元素
    i++; // 数组下标递增
  }
}

//2、do-while 循环语句例子
void main() {
  // 定义 int 数组
  var list = [5, 1, 2, 6, 3];

  // 循环遍历数组
  var i = 0;
  do {
    print(list[i]);
    i++;
  } while (i < list.length); // 先执行循环体代码后再检测循环条件，条件为 true 则继续执行循环
}

//打印结果
5
1
2
6
3
```

## 五、面向对象编程

Dart 是面向对象编程语言，对象都是由类创建的，所有类都是由 Object 类派生出来的子类，除了 Object , 所有类只有一个父类（即只能继承一个父类）

尽管 Dart 语言中一个类只能继承一个父类，但是 Dart 语言提供了 mixin 机制，可以复用多个类，达到类似多继承的效果

### 5.1、类和对象

1）、Dart 没有 public、protected 和 private 等成员访问限定符。默认情况下属性，方法，类等都是共有的，类似 Java 的 public。如果想要表示私有，则以下划线 _ 开头去命名

2）、Dart 中实例化对象和 Java 类似，new 关键字可写可不写

3）、当我们在类中创建私有属性时，我们应该给私有属性提供 getter 和 setter 方法供外界访问：

get 方法语法格式：**返回值类型 get 方法名 { 方法体 }**

set 方法语法格式：**set 方法名 ( 参数 ) { 方法体 }**

```dart
class Person {
  // 定义类成员属性，默认类的成员属性和方法都是共有的，类似 java 的 public
  var name;
  // 以下划线 ( _ ) 开头命名的属性代表私有成员属性
  var _age;

  // 跟类名同名的方法，为构造方法
  // 这里自定义了一个携带参数的构造方法。
  // 如果我们没有自定义构造方法，会自动生成一个不带参数的默认构造方法
  Person(var name, var age) {
    // 因为参数名和类属性名同名，可以使用this引用当前对象
    this.name = name;
    // 可以忽略this关键字，直接引用类成员
    _age = age;
  }
  
  //为 _age 提供 getter 和 setter 方法
  int get age{
    return _age;
  }
  //getter 方法还可以简化为此写法：int get age => _age;

  set age(int age){
    _age = age;
  }

  // 定一个 public 的方法
  String greet(String who) => 'Hello, $who. I am $name, my age is $_age !';
}

void main(){
  var person = Person("erdai",18);
  //下面这句就是调用了 age 的 set 方法
  person.age = 20;
  var greet = person.greet("lucy");
  print(greet);
}

//打印结果
Hello, lucy. I am erdai, my age is 20 !
```

### 5.2、构造方法

如果我们没有自定义一个构造方法，会自动生成一个不带参数的默认构造方法

```dart
// 这个类会生成默认的构造方法
class Person {
    String name;
}

// 通过默认构造方法实例化对象
var p = Person();
```

#### 5.2.1、自定义构造方法

```dart
class Point{
  var x,y;
  
  Point(var x,var y){
    // 通过this访问成员属性，当然一般除非出现命名冲突，否则可以忽略this
    this.x = x;
    this.y = y;
  }
}
```

对于构造方法中，简单的赋值操作，Dart语言提供了更简洁的语法，如下：

```dart
class Point{
  var x,y;

  // 直接将构造方法的第一个参数赋值给this.x, 第二个参数赋值给this.y
  Point(this.x,this.y);
}
```

#### 5.2.2、初始化参数列表

Dart 还为构造方法提供了 **参数初始化列表** 的语法，用于初始化对象参数

```dart
class Point{
  var x,y;

  // 冒号 : 后面的表达式就是参数初始化列表，每个表达式用逗号分隔
  Point(var x,var y): this.x = x,this.y = y{
    // 使用参数初始化列表初始化对象属性，这里如果没有别的初始化工作要做，可以是空的
  }
}
```

#### 5.2.3、命名构造方法

1）、Dart 可以使用命名构造方法语法，创建多个构造方法，命名构造方法语法格式： **类名.构造方法名(参数列表)**

```dart
class Point{
  var x,y;

  Point(this.x,this.y);

  // 命名构造方法 namedConstructor
  Point.namedConstructor(){
    x = 0;
    y = 0;
  }
}

void main(){
  // 使用命名构造方法实例化对象
  var point = Point.namedConstructor();
}
```

上面的例子也可以改写为：

```dart
class Point{
  var x,y;

  Point(this.x,this.y);
  // 命名构造方法 namedConstructor
  // 这里使用参数初始化列表，直接通过 this 调用上面的构造方法，传入两个参数 0，初始化对象
  Point.namedConstructor():this(0,0);
}
```

#### 5.2.4、factory 构造方法

1）、Dart 提供了一个特殊的构造方法，类似设计模式中的工厂模式，用来创建对象

2）、factory 构造方法只能访问静态属性和静态成员方法，因此不能访问 this 引用

```dart
//1、定义个日志类
class Logger {
  final String name;
  bool mute = false;

  // 定义一个私有的_cache属性，用来保存创建好的Logger对象
  static final Map<String, Logger> _cache = {};

  // 注意这个构造方法，前面使用了factory关键字修饰，这代表这个构造方法是一个工厂构造方法
  // 工厂构造方法不会每次都创建一个新的Logger对象
  factory Logger(String name) {
    // 根据name判断缓存的Logger对象是否存在
    if (_cache.containsKey(name)) {
      // 返回缓存的Logger对象
      return _cache[name]!;
    } else {
      // 如果没有缓存，则调用命名构造方法_internal创建一个Logger对象
      final logger = Logger._internal(name);
      // 根据name缓存logger
      _cache[name] = logger;
      // 返回新的Logger对象
      return logger;
    }
  }

  // 注意这个是一个私有的命名构造方法。
  Logger._internal(this.name);

  void log(String msg) {
    if (!mute) print(msg);
  }
}

//2、测试
void main(){
  var logger = Logger("erdai");
  logger.log(logger.name);
}

//打印结果
erdai
```

### 5.3、继承和多态

#### 5.3.1、继承

1）、Dart 通过 extend 关键字继承一个类，和 Java 类似

2）、子类会继承父类可见的属性和方法，不会继承构造方法

3）、子类能够复写父类的 getter，setter，以及普通方法，使用 @override 表示覆写

```dart
class Parent{
  String name = "";
  int age = 0;

  //计算属性
  bool get adult => this.age > 18;

  //私有属性，对于子类不可见
  String _address = "";

  void method(){
    print('Parent');
  }
}

class Children extends Parent{
  
  void specificMethod(){
    print('Children specificMethod');
  }
}

void main(){
  var child = Children();
  //调用子类自己的方法
  child.specificMethod();
  //访问父类的属性
  child.name = "erdai";
  child.age = 18;
  print('${child.name} ${child.age}');
  //调用父类的方法
  child.method();
  //访问父类的计算属性
  print('${child.adult}');
}

//打印结果
Children specificMethod
erdai 18
Parent
false
```

#### 5.3.2、多态

1）、简单的理解：多态就是将子类的对象赋值给父类的引用，同一个方法调用会有不同的执行效果

2）、多态的体现：父类定义一个方法，让继承它的子类去实现，每个子类有不同的表现

```dart
class Animal{
  void animalType(){

  }
}

class Dog extends Animal{

  @override
  void animalType() {
    print('I am dog');
  }
}

class Pig extends Animal{

  @override
  void animalType() {
    print('I am pig');
  }
}

void main(){
  //子类的对象赋值给父类的引用
  Animal animal1 = Dog();
  Animal animal2 = Pig();
  //同一个方法调用会有不同的执行效果
  animal1.animalType();
  animal2.animalType();
}

//打印结果
I am dog
I am pig
```

### 5.4、抽象类和抽象方法

1）、抽象类就是不能实例化的类，通过 abstract 关键字声明

2）、抽象方法就是没有实现的方法，Dart 中的抽象方法不能用 abstract 声明，Dart 中没有方法体的方法就称为抽象方法

3）、继承抽象类，子类必须要实现所有抽象方法，否则会报错

```dart
// 使用 abstract 关键字修饰的类，就是抽象类
abstract class Doer{
  // 抽象类跟普通类一样，可以定义成员变量，成员方法。
  String name = "";
  // 定义个抽象方法，这个方法我们没有实现具体的功能
  void doSomething();
}

// 继承抽象类 Doer
class EffectiveDoer extends Doer{
  // 实现抽象类的抽象方法
  @override
  void doSomething() {
    print('doSomething');
  }
}

void main(){
  var doer = EffectiveDoer();
  doer.doSomething();
  doer.name = "erdai";
  print(doer.name);
}

//打印结果
doSomething
erdai
```

### 5.5、接口

1）、Dart 中的接口没有使用 interface 关键字定义，而是普通类和抽象类都可以作为接口被实现。但是一般都是用抽象类来定义接口

2）、子类通过 implements 来实现接口

3）、默认情况每一个类都**隐含**一个包含所有公有成员（属性和方法）的接口定义

```dart
abstract class Fruit{
  // 包含在隐式接口里面
  String name = "";
  
  // 构造方法不包含在隐式接口里面
  Fruit(this.name);
  
  // 包含在隐式接口里面
  void eat();
}

class Apple implements Fruit{
  @override
  String name = "苹果";

  @override
  void eat() {
    print('吃$name');
  }
}

void main(){
  var fruit = Apple();
  fruit.eat();
}

//打印结果
吃苹果
```

**注意**：虽然普通类也可以作为接口实现，但是依然需要实现普通类里面所有的公有成员（属性和方法），因此建议大家使用抽象类来作为接口实现，因为抽象类本来就是用来定义给子类实现的

## 六、空安全检查

1）、Dart 在 2.12 版本和 Flutter 2.0 中引入了空安全的新特性，在空安全版本下，运行时的 **NPE (NullPointer Exception)** 异常被提前到了编译期

2）、在空安全推出之前，静态类型系统允许所有的类型值为 null，因为 Null 是所有类型的子类。而在空安全推出后，所有类型默认为不可空类型，Null 不再是所有类的子类，它变成了和其他类型并行的类

3）、Dart 新增了一些关键字用于空安全，如下：

| **关键字** | **含义**         | 示例             |
| ---------- | ---------------- | ---------------- |
| ?          | 可空             | int a?;          |
| !          | 非空             | int b = a!;      |
| late       | 延迟初始化       | late int a;      |
| required   | 可选参数的不可空 | {required int a} |

### 6.1、**空类型声明符 ？**

1）、在类型后面加上 ？，表示可空类型

2）、使用 var 关键字定义的变量也是可空类型

3）、可空类型变量的调用，使用 ?. 操作符，它表示如果当前对象不为 null 则调用，为 null 则什么都不做

```dart
//1、在类型后面加上 ？，表示可空类型
void main() {
  //定义一个 String 的可空类型，默认值为 null
  String? str;
  //编译报红，因为可空类型需要使用 ?. 调用
  //提示：The property 'length' can't be unconditionally accessed because the receiver can be 'null'.
  print(str.length); 
}

//2、使用 var 关键字定义的变量也是可空类型
void main() {
  //定义一个动态的可空类型 str，默认值为 null
  var str;
  //下面这句代码会绕过编译器检查，但运行时会报错：NoSuchMethodError: 'length'
  print(str.length);
}

//3、可空类型变量的调用，使用 ?. 操作符，它表示如果当前对象不为 null 则调用，为 null 则什么都不做
void main() {
  String? str1;
  var str2;
  print(str1?.length);
  print(str2?.length);
}
//打印结果
null
null
```

### 6.2、**非空断言 !**

1）、使用 ! 关键字表示告诉编译器这是一个不可能为空的变量。如果为空，你就抛异常

```dart
String? getName() => "erdai";

void main() {
 String? str = getName();
 //此时会编译报红，因为编译器无法智能判空
 //print(str.length);
 //因此我们需要使用 ! 关键字
 print(str!.length);
}
//打印结果
5
```

### 6.3、**late 延迟初始化**

1）、late 关键字会告诉编译器：这是个非空变量，我稍后会初始化

```dart
//此时会编译报红，因为编译器会告诉我们非空变量必须先初始化
//String str;
//因此我们需要使用 late 关键字
late String str;

void main() {
  str = "erdai";
  print(str);
}
//打印结果
erdai
```

### 6.4、**required 关键字**

1）、required 关键字主要是用来标记命名参数，在使用时一定要给他们赋值，使得他们不为空

2）、使用 required 修饰的参数不能提供默认值

```dart
void optionFunction(var value1,{required var value2,var value3 = 3}){
  print('$value1 $value2 $value3');
} 

void main() {
  optionFunction(1, value2: 100);
}

//打印结果
1 100 3
```

## 七、有趣的运算符重载

与 Kotlin 类似，Dart 的运算符重载允许我们让任意两个对象进行相加，或者是进行其他更多的运算操作

1）、运算符重载使用的是 operator 关键字，我们只需要在指定运算符前面加上 operator 关键字，就可以实现运算符重载的功能了，Dart 支持的重载运算符如下：

```dart
<   +   |   []
>   /   ^   []=
<=  ~/  &   ~
>=  *   <<  ==
–   %   >>
```

2）、重载运算符的语法格式如下：

```dart
函数返回值 operator 运算符(运算符参数) {
    // 实现运算符重载逻辑
}
```

下面我们就来实践一下：

```dart
class Money{
  int value = 0;

  Money(this.value);

  //重载 + 号运算符, 两个 Money 对象相加,然后返回一个新的 Money 对象
  Money operator +(Money money){
    var sum = value + money.value;
    return Money(sum);
  }
}

void main() {
  var money1 = Money(100);
  var money2 = Money(200);
  //两个对象相加
  var money3 = money1 + money2;
  print(money3.value);
}
```

## 八、 mixin 混入

1）、前面说到 Dart 语言的类是单继承的，如果我们想要实现类似多继承的效果可以使用 mixin 机制，又叫混入机制，例如把类 A 混入到类 B 中，那么类 B 就拥有了类 A 的成员，跟继承的特性非常相似

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
//或实现这个 mixin 的父类约束
class F{}

mixin G on F{}

//class I with G{} //编译报错：class I 没有继承 mixin 的父类约束
class I extends F with G{} //编译通过，class I 继承了 mixin 的父类约束

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

## 九、Dart 泛型

泛型编程机制最主要的目的是为了代码复用，避免类型转换异常。如果你对 Java ，Kotlin 泛型很熟悉，你会觉得 Dart 泛型非常简单。对 Java ，Kotlin 泛型还不熟悉的，看我这篇文章[传送门](https://juejin.cn/post/6950042154496425992)

1）、Dart 中泛型主要有以下四种使用：

1、泛型类

2、泛型接口

3、泛型方法

4、限制泛型类型

### 9.1、泛型类，泛型接口，泛型方法

1）、我们定义一个类，或者接口的时候，在类名后面增加泛型参数，就是为这个类或接口添加了一个泛型

2）、我们定义一个方法时，在方法名后面增加泛型参数，就是为这个方法添加了一个泛型

3）、泛型语法格式：`<T>` ，多个泛型之间用 , 隔开：<T,K>

4）、泛型参数的命名可以随便取，但是我们一般习惯使用大写字母代表泛型参数

```dart
//一、泛型类
//1、定义泛型类
class GenericClass<T>{

  T? name;

  GenericClass(this.name);

  void setName(T? value){
    name = value;
  }

  T? getName(){
    return name;
  }
}

//2、泛型类使用
void main() {
  var genericClass = GenericClass<String>("");
  genericClass.setName("erdai");
  print(genericClass.getName());
}

//3、打印结果
erdai
  
//二、泛型接口
//1、定义泛型接口
abstract class GenericInterface<K,V>{
  void setKeyValue(K key,V value);
}

//2、定义泛型接口实现类
class GenericInterfaceImpl<K,V> implements GenericInterface<K,V>{

  var map = {};

  @override
  void setKeyValue(K key, V value) {
    map[key] = value;
  }
}

//3、泛型接口使用
void main() {
  var impl = GenericInterfaceImpl<String,int>();
  impl.setKeyValue("erdai", 666);
  impl.map.forEach((key, value) {
    print('$key $value');
  });
}

//4、打印结果
erdai 666


//三、泛型方法：类比 Java，Kotlin 中的写法
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
上述定义泛型类，泛型接口和 Java，Kotlin 没啥区别，倒是定义泛型方法，大家需要注意：

1、Java 中方法的泛型定义在返回值的前面

2、Kotlin 中的方法泛型定义在方法名的前面

3、Dart 中的泛型定义在方法名的后面

### 9.2、限制泛型类型

1）、限制泛型参数类型语法格式：<泛型参数 extends 父类>

```dart
class BaseClass{

  void baseMethod(){
    print('BaseClass baseMethod...');
  }
}

class Child extends BaseClass{
  @override
  void baseMethod() {
    print('Child baseMethod');
  }
}

//T 类型必须是 BaseClass 或者其子类
class Foo<T extends BaseClass>{
  T? t;
  
  Foo(this.t);

  void fooTest(){
    t?.baseMethod();
  }
}

void main(){
  //1、使用父类 BaseClass 作为泛型参数是允许的
  var baseClass = BaseClass();
  var foo1 = Foo<BaseClass>(baseClass);
  foo1.fooTest();
  
  //2、使用子类 Child 作为泛型参数
  var childClass = Child();
  var foo2 = Foo<Child>(childClass);
  foo2.fooTest();

  //3、如果不传入任何泛型参数，默认使用父类 BaseClass 作为泛型参数
  var foo3 = Foo(baseClass);
  foo3.fooTest();
}

//打印结果
BaseClass baseMethod...
Child baseMethod
BaseClass baseMethod...
```

## 十、Dart Import 导入包

在日常开发中，我们经常需要导入我们的本地模块或者第三方开源包。Dart 中主要通过 import 指令导入包

### 10.1、导入内置包

1）、Dart 内置了一些常用的包，这些内置的包会随着 Dart sdk 一起安装在本地

2）、导入内置包使用 dart: 作为路径前缀

```dart
// 导入内置 math 包，使用 dart: 作为前缀。
// math 包主要提供一些数学相关的函数，例如，正弦函数、求最大值函数等等
import 'dart:math';

void main() {
  // 调用 math 包中的 max 函数，求两个数中的最大值。
  var a = max(1,100);
  print(a); //打印 100
}
```

### 10.2、包的别名

默认情况调用包中的函数或者类，不需要包名作为前缀，上面调用了 math 包中的 max 函数，直接使用包中的函数名。但是这样会存在命名冲突的可能性，如果导入的两个包，包含了同名的类或者函数，就会出现命名冲突，因此提供别名机制

1）、使用 as 关键字指定包的别名

```dart
//使用 as 关键字，指定包的别名
import 'dart:math' as math;

void main() {
  // 使用别名，引用包中的函数 。
  var a = math.max(1,100);
  print(a); //打印 100
}
```

### 10.3、导入包的部分内容

1）、有时候我们不想导入整个包，只想导入包里面的某个类或者某个函数。Dart 提供了show 和 hide 关键字处理导入包的部分内容

```dart
//1、仅导入 max 函数, 导入多个内容使用逗号分隔，例如 show max,sin
import 'dart:math' show max;

//2、除了max函数，导入 math 中的所有内容。
import 'dart:math' hide max;
```

### 10.4、导入本地模块

在日常开发中，我们会经常会导入本地的模块，一般项目中会有多个 dart 脚本文件，每个 dart 脚本实现不同模块的代码，在需要的时候直接导入 dart 脚本文件即可

```dart
//例如我有个本地模块：libs/stack.dart

//导入本地模块
//直接通过本地文件路径导入 dart 脚本即可
import 'libs/stack.dart';
```

### 10.5、导入第三方开源包

#### 10.5.1、查找第三方开源包

<https://pub.dev/> ：这个是 pub 的中央仓库, 上面有大量的第三方开源包，可以到这里找到自己想要的包

#### 10.5.2、配置依赖包

在项目根目录 pubspec.yaml 中配置 dependencies 属性，结构如下：

> dependencies:
>
> 包名: 版本号

```dart
dependencies:
  http: ^0.13.5
  cupertino_icons: ^1.0.2
```

关于版本号说明，如下:

>^1.2.1 代表的更新版本范围为 >=1.2.1 && < 2.0.0
>
>^0.2.1 代表的更新版本范围为 >=0.2.1 && < 0.3.0
>
>^0.0.2 代表的更新版本范围为 0.0.2（相当于锁定为了 0.0.2 版本）

**规律**： 实则就是把 ^ 后面非 0 的数字 +1 ，然后把其他位变为 0 就是它的最大版本。另外如果最后一位非 0 ，其他位为 0 ，就相当于锁版本。如：

```dart
最大版本：^1.2.1 => 2.2.1 => 2.0.0 范围：1.2.1-2.0.0
最大版本：^0.2.1 => 0.3.1 => 0.3.0 范围：0.2.1-0.3.0
^0.0.2：固定版本：0.0.2
```

#### 10.5.3、下载依赖包

打开命令行，输入如下命令：

```dart
flutter pub get
```

或者直接使用开发工具的可视化界面操作

#### 10.5.4、导入第三方开源包

依赖包下载安装后，我们就可以使用 import 导入第三方包，第三方包前缀为 package:

```dart
// 这里导入 http 包，别名为 http
import 'package:http/http.dart' as http;
```

## 十一、Dart 异常处理

类似 Java，Dart 提供了 Exception 和 Error 两种类型的异常以及一些子类

1）、使用 throw 关键字抛出自定义类型异常，也可以将任何非 null 对象作为异常抛出

```dart
 throw Exception('这是一个异常');
 throw '这是一个异常';
```

**小建议**：一般建议抛出 Exception 和 Error , 或者他们的子类

2）、使用 try/on catch 配合捕获异常

```dart
void main() {
  try {
    var s;
    print(s.length);
  } on NoSuchMethodError catch (e) {
    //捕获异常并打印
    print(e);
  } catch (e, s) {
    //兜底处理 e：抛出的异常对象 s：栈信息，此参数可写可不写
    print(e);
    print(s);
  }
}
```

上述代码：

1、使用 on 和 catch 来捕获异常：on 用来指定异常的类型，catch 则用来捕获对象

2、当抛出的错误并不是 on 指定的异常类型时，则走最后面的 catch 兜底

3、兜底 catch 方法有两个参数，第一个参数是抛出的异常对象，第二个参数是栈信息

3）、使用 rethrow 再次抛出异常

```dart
void exceptionMethod(){
  try {
    dynamic b = true;
    print(b++); //NoSuchMethodError
  } catch (e) {
    rethrow; //将上述异常再次抛出
  }
}


void main() {
  try {
    exceptionMethod();
  } catch (e) {
    //捕获异常并打印
    print(e);
  }
}
```

## 十二、Dart 异步处理

Dart 是单线程模型的语言，如果我们在程序中做耗时操作：请求 Api 接口，文件 IO 等，就可能导致点击事件没有响应，程序卡顿之类的情况。为了处理这种情况，Dart 引入了异步操作机制：

1、Dart 异步处理不会阻塞线程，其他任务可以继续运行

2、因为 Dart 的异步机制并不涉及线程的切换，仅仅是由我们的编程语言去控制，所以它的执行效率非常高

### 12.1、Dart 异步处理的用法

1）、Dart 语言中，有很多库的函数返回 Future 或者 Stream 对象，这些对象都是 Dart 对异步编程支持的实现

Future - 代表一个异步计算任务，可以获取任务的计算结果

Stream - 代表一个异步的数据序列，通常用于读取连续的数据或者事件

#### 12.1.1、Future

1）、Future代表的是一个异步的计算任务，如果任务还没执行完成，我们是拿不到异步任务的结果

```dart
import 'package:http/http.dart' as http;

void main() {
  var url = "https://www.baidu.com/";
  //调用 get 函数请求 url, 返回一个封装了 http 请求任务的 future 对象
  Future fTask = http.get(Uri.parse(url));
  //打印 future 对象
  print(fTask);
  
  // 向 future 对象注册回调函数，处理请求结果
  fTask.then((response) => {
    print('Response status: ${response.statusCode}')
  });
  // 打印 main 函数结束标记
  print('main end...');
}

//打印结果
Instance of 'Future<Response>'
main end...
Response status: 200

Process finished with exit code 0
```

上述代码：

1、首先打印了 fTask ，输出表示 fTask 是一个 Future 对象，将来会返回一个叫 Response 的结果对象

2、接下来打印了 main end... ，而不是先输出 http 的请求状态码

3、最后打印了 http 的请求状态码：Response status: 200 ，然后进程也退出了

上面这段程序在打印了 main end... 时进程并没有退出，而是等到打印了 http 的请求状态码：Response status: 200 才退出，这也验证了我们前面一个观点： **Dart 的异步机制并不涉及线程的切换，仅仅是由我们的编程语言去控制，所以它的执行效率非常高**

#### 12.1.2、await 和 async

上述这个例子存在一个问题：

1、需要注册回调函数，如果我有多层回调，可读性就会变得很差

此时我们可以使用 await 和 async 机制来处理这个问题，而且它还能让我们使用同步的方式写出异步的代码

```dart
void main() async{
  var url = "https://www.baidu.com/";
  //请求 url, 通过 await，等待 future 异步计算任务的结果，执行成功就直接返回结果
  var response = await http.get(Uri.parse(url));
  print('Response status: ${response.statusCode}');
  print('main end...');
}

//打印结果
Response status: 200
main end...
```

上述代码：

1、输出结果的顺序，跟我们书写代码的顺序一致

2、通过标记 async 和 await 关键字，我们的异步代码，看起来跟同步代码没什么区别：

> 1、async 关键字的作用就是标记一个函数是异步函数
>
> 2、await 关键字的作用是等待异步任务的结果

**注意：** await 关键字只能在标记了async 的异步函数中使用，否则会报错

#### 12.1.3、Stream

1）、Stream 代表一个异步的数据序列，是一种异步读取流式数据的方式，使用格式如下：

> await for (数据类型 变量 in stream类型变量) {
>
> // 处理数据
>
> }

```dart
Future<int> sumStream(Stream<int> stream) async {
  var sum = 0;
  await for (final value in stream) {
    sum += value;
  }
  return sum;
}

//async* 表示这是一个需返回 Stream 类型参数的异步函数
Stream<int> countStream(int to) async* {
  for (int i = 1; i <= to; i++) {
    //yield 在这里表示暂时让出资源让其他代码执行
    yield i;
  }
}

void main() async{
  var stream = countStream(10);
  //通过 await 等待 sumStream 计算返回结果
  var sum = await sumStream(stream);
  print(sum);
}
//打印结果
55
```

上述代码我们使用 await 标记 for in 循环语句，循环读取 stream 类型变量中的数据，代码书写也很直观，跟同步代码的书写方式一致

## 十三、Dart Isolate 并发

我们知道一般常用的并发机制主要包括进程，线程以及后面的协程。但是 Dart 不一般 😂 ，Dart 中的并发机制主要是由 Isolate 去实现的。所谓 Isolate ，你可以简单的理解是一种特殊的线程

Isolate 的特点：

1、Isolate 之间不能共享内存

2、Isolate 之间只能通过消息通讯

不能共享内存，意味着你不能像线程那样通过变量共享状态，每个 Isolate 都有自己独立的内存，这样设计的好处**就是你不用加锁，也能安全的操作自己的数据**

这里你是否会有一个疑问🤔️：前面我们通过 Dart 异步机制处理了接口请求之类的异步任务，不是也有类似并发的效果吗？那为什么还要引入 Isolate 并发机制呢？

答：前面我们讲的异步机制你可以理解为一种假异步，因为它实际还是在一个线程中去处理各种网络 IO，这些网络 IO 并不怎么消耗 CPU 资源，只是需要大量的等待请求响应的时间，因此我们可以利用等待的空闲时间去处理其他任务，这就是异步机制能够提高性能的原因。这种机制其实和 Android Handler 机制有点类似。而现在如果你有一个计算量非常大的任务，例如：你需要对视频进行格式化处理，这个时候这些 CPU 密集型计算就会阻塞你的线程，导致其他任务都执行不了。因此针对这种比较耗 CPU 资源的任务，最好创建一个 Isolate 去处理，避免阻塞主 Isolate （也就是主线程），这样也可以利用设备的多核特性

### 13.1、Isolate 基本用法

```dart
// 导入 isolate 包
import 'dart:isolate';

void main() {
  // 通过 Isolate.spawn 静态函数，创建一个新的 Isolate
  // spawn 是一个泛型函数，接受一个泛型参数，表示 Isolate 入口函数接受的参数类型
  // 这里 spawn 的泛型参数是 String，subTask 是入口函数
  // 第二个参数跟泛型参数类型一致，表示传递给入口函数的参数，这里传入的是字符串
  Isolate.spawn<String>(subTask, "my task");
  print("main func end.");
}

// Isolate 入口函数定义，接受一个 String 参数
// 入口函数的参数类型由上面的 spawn 的泛型参数决定
void subTask(String msg){
  print("subTask receive: $msg ");
}

//打印结果
main func end.
subTask receive: my task
```

通过输出，我们发现先打印了 main func end，然后，执行新建 Isolate 的入口函数。 如果我们想让代码执行顺序，跟我们书写顺序一致的话，可以使用 await 关键字等待 Isolate 执行结束：

```dart
// 导入 isolate 包
import 'dart:isolate';

// 使用 async 关键字将 main 函数标记为一个异步函数，这样才能使用 await 关键字
void main() async{
  // 使用 await 关键字等待任务执行完成
  await Isolate.spawn<String>(subTask, "my task");
  print("main func end.");
}

// Isolate 入口函数定义，接受一个 String 参数
void subTask(String msg){
  print("subTask receive: $msg ");
}

//打印结果
subTask receive: my task 
main func end.
```

### 13.2、Isolate 消息通讯

多个 Isolate 之间只能通过消息进行通讯，那么我们如何去获取一个 Isolate 返回的结果呢？

答：主要通过 ReceivePort 和 SendPort 两个类处理消息通讯

1）、ReceivePort 负责接收 SendPort 发送的消息， SendPort 和 ReceivePort 是捆绑关系， SendPort 是由 ReceivePort 创建的

```dart
void main() async{
   // 创建一个 ReceivePort 用于接收消息
   var recv = ReceivePort();

   // 创建一个 Isolate，泛型参数为 SendPort，入口函数为 subTask
   // subTask 入口函数的参数为 SendPort 类型，因此 spawn 第二个参数，传入 recv 的 sendPort 对象
   Isolate.spawn<SendPort>(subTask, recv.sendPort);

   // 使用 await 等待 recv 的第一条消息
   var result = await recv.first;
   print("receive：$result");
}

// Isolate 入口函数定义，接收一个 SendPort 对象作为参数
void subTask(SendPort port){
  // 使用 SendPort 发送一条字符串消息
  port.send("subTask Result");
}

//打印结果
receive：subTask Result
```

## 十四、总结

本篇估计是我写过最长的文章了，比之前写 Kotlin 入门那一篇还要长😂。总的来说，这篇文章几乎涵盖了 Dart 的所有语法知识，如果你能够耐心看到这里，并手敲里面的示例，相信你一定收获很大。如果觉得我写的还不错，请给我点个赞吧🤝

**感谢你阅读这篇文章**

### 下篇预告

基础打好了，下篇文章我们就正式进入到 Flutter 的学习了，敬请期待吧😄

### 参考和推荐

[一文搞定Dart语法](https://juejin.cn/post/7075337131974983688#heading-72)

[Dart语言教程](https://www.tizi365.com/archives/165.html)

[Flutter 基础 | Dart 语法](https://juejin.cn/post/7028710779171897351#heading-7)

[Dart 官方教程](https://dart.cn/tutorials/language)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：** [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
