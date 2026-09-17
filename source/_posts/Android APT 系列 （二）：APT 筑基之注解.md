---
title: Android APT 系列 （二）：APT 筑基之注解
date: 2022-10-10 17:54:43
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281545875.jpeg
tags: 
- 原创
- Android
- Android APT
categories:
- Android
- APT
---


![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281545875.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们对反射一些常用的知识进行了讲解，还没有看过上一篇文章的朋友，建议先去阅读 [Android APT 系列 （一）：APT 筑基之反射](https://juejin.cn/post/6977679823132950536)。接下来我们看下 Java 注解

[Github Demo 地址](https://github.com/sweetying520/AptDemo) , 大家可以看 Demo 跟随我的思路一起分析

## 一、注解介绍

### 1）、什么是注解？

要解释注解我们首先要明白什么是元数据：**元数据就是为其他数据提供信息的数据**

那么还是引入官方一段对注解的解释：**注解用于为代码提供元数据。作为元数据，注解不直接影响你的代码执行，但也有一些类型的注解实际上可以用于这一目的。Java 注解是从 JDK 1.5 开始添加到 Java 的。**

简单的理解：**注解就是附加到代码上的一种额外补充信息**

### 2）、注解有哪些作用？

**源码阶段注解**： 编译器可利用该阶段注解检测错误，提示警告信息，打印日志等

**编译阶段注解**：利用注解信息自动生成代码、文档或者做其它相应的自动处理

**运行阶段注解**： 可通过反射获取注解信息，做相应操作

### 3）、如何自定义定义一个注解？

使用 `@interface` + 注解名称这种语法结构就能定义一个注解，如下：

```java
@interface TestAnnotation{
  
}
```

通常我们会使用一些元注解来修饰自定义注解

## 二、元注解

了解了之前的元数据，**元注解就是为注解提供注解的注解** 😂，这句话可能有点绕，反正你清楚元注解是给注解用的就行了

JDK 给我们提供的元注解有如下几个：

1、@Target

2、@Retention

3、@Inherited

4、@Documented

5、@Repeatable

### 1）、@Target

@Target 表示这个注解能放在什么位置上，具体选择的位置列表如下：

```java
ElementType.ANNOTATION_TYPE //能修饰注解
ElementType.CONSTRUCTOR //能修饰构造器
ElementType.FIELD //能修饰成员变量
ElementType.LOCAL_VARIABLE //能修饰局部变量
ElementType.METHOD //能修饰方法
ElementType.PACKAGE //能修饰包名 
ElementType.PARAMETER //能修饰参数
ElementType.TYPE //能修饰类、接口或枚举类型
ElementType.TYPE_PARAMETER //能修饰泛型，如泛型方法、泛型类、泛型接口 （jdk1.8加入）
ElementType.TYPE_USE //能修饰类型 可用于任意类型除了 class （jdk1.8加入）
  
@Target(ElementType.TYPE)
@interface TestAnnotation{
    
}
```

**注意**：默认情况下无限制

### 2）、@Retention

@Retention 表示注解的的生命周期，可选的值有 3 个：

```java
RetentionPolicy.SOURCE //表示注解只在源码中存在，编译成 class 之后，就没了
  
RetentionPolicy.CLASS //表示注解在 java 源文件编程成 .class 文件后，依然存在，但是运行起来后就没了
  
RetentionPolicy.RUNTIME //表示注解在运行起来后依然存在，程序可以通过反射获取这些信息
  
@Retention(RetentionPolicy.RUNTIME)
@interface TestAnnotation{

}
```

**注意**：默认情况下为 `RetentionPolicy.CLASS`

### 3）、@Inherited

@Inherited 表示该注解可被继承，即当一个子类继承一个父类，该父类添加的注解有被 @Inherited 修饰，那么子类就可以获取到该注解，否则获取不到

```java
@Inherited
@interface TestAnnotation{

}
```

**注意**：默认情况下为不可继承

### 4）、@Documented

@Documented  表示该注解在通过 `javadoc` 命令生成 Api 文档后，会出现该注解的注释说明

```java
@Documented
@interface TestAnnotation{

}
```

**注意**：默认情况下为不出现

### 5）、@Repeatable

@Repeatable 是 JDK 1.8 新增的元注解，它表示注解在同一个位置能出现多次，这个注解有点抽象，我们通过一个实际例子理解一下

```java
//游戏玩家注解
@Inherited
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@interface GamePlayer{
    Game[] value();
}

//游戏注解
@Inherited
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Repeatable(GamePlayer.class)
@interface Game{
    String gameName();
}

@Game(gameName = "CF")
@Game(gameName = "LOL")
@Game(gameName = "DNF")
class GameTest{

}
```

**注意**：默认情况下不可重复

**经验**：通常情况下，我们会使用多个元注解组合来修饰自定义注解

## 三、注解属性

### 1）、注解属性类型

注解属性类型可以为以下的一些类型：

1、基本数据类型

2、String

3、枚举类型

4、注解类型

5、Class 类型

6、以上类型的一维数组类型

### 2）、定义注解属性

首先我们定义一些注解属性，如下：

```java
@Inherited
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@interface TestAnnotation{
    //这就是注解属性的语法结构
    //定义一个属性并给了默认值
    String name() default "erdai";
  
    //定义一个属性未给默认值
    int age();
}
```

可能你会有些疑问：这难道不是在定义方法吗？还可以给默认值？

这些疑问先留着，我们继续分析

自定义注解默认都会继承 Annotation ，Annotation 是一个接口，源码如下：

```java
public interface Annotation {
   
    boolean equals(Object obj);

    int hashCode();
  
    String toString();
    
    Class<? extends Annotation> annotationType();
}
```

我们知道，在接口中可以定义属性和方法，那么作为自定义注解，是否也可以定义呢？

可以，接口中的属性默认都是用`public static final` 修饰的，默认是一个常量，对于自定义注解来说，这点没有任何区别。而接口中的方法其实就相当于自定义注解的属性，只不过自定义注解还可以给默认值。因此我们在学习自定义注解属性时，我们应该把它当作一个新知识，加上我刚才对接口的分析对比，你上面的那些疑问便可以迎刃而解了

### 3）、注解属性使用

1、在使用注解的后面接上一对括号，括号里面使用 `属性名 = value` 的格式，多个属性之间中间用 `,`隔开

2、未给默认值的属性必须进行赋值，否则编译器会报红

```java
//单个属性
@TestAnnotation(age = 18)
class Test{
    
}

//多个属性
@TestAnnotation(age = 18,name = "erdai666")
class Test{

}
```

### 4）、注解属性获取

注解属性的获取可以参考我的上一篇文章 [传送门](https://juejin.cn/post/6977679823132950536) ，上篇文章我们讲的是通过类对象获取注解，咱们补充点上篇文章没讲到的

1、我们在获取属性的时候，可以先判断一下是否存在该注解，增强代码的健壮性，如下：

```java
@TestAnnotation(age = 18,name = "erdai666")
class Test{

}

Class<Test> testClass = Test.class;
//获取当前注解是否存在
boolean annotationPresent = testClass.isAnnotationPresent(TestAnnotation.class);
//如果存在则进入条件体
if(annotationPresent){
    TestAnnotation declaredAnnotation = testClass.getDeclaredAnnotation(TestAnnotation.class);
    System.out.println(declaredAnnotation.name());
    System.out.println(declaredAnnotation.age());
}
```

2、获取类属性的注解属性

```java
@Inherited
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@interface TestField{
    String filed();
}

class Test{
    @TestField(filed = "我是属性")
    public String test;
}

//通过反射获取属性注解
Class<Test> testClass1 = Test.class;
try {
    Field field = testClass1.getDeclaredField("test");
    if(field.isAnnotationPresent(TestField.class)){
        TestField fieldAnnotation = field.getDeclaredAnnotation(TestField.class);
        System.out.println(fieldAnnotation.filed());
    }
} catch (NoSuchFieldException e) {
    e.printStackTrace();
}
//打印结果
我是属性
```

3、获取类方法的注解属性

```java
@Inherited
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface TestMethod{
    String method();
}

class Test{
    @TestMethod(method = "我是方法")
    public void test(){

    }
}
//通过反射获取方法注解
Class<Test> testClass2 = Test.class;
try {
    Method method = testClass2.getDeclaredMethod("test");
    if(method.isAnnotationPresent(TestMethod.class)){
        TestMethod methodAnnotation = method.getDeclaredAnnotation(TestMethod.class);
        System.out.println(methodAnnotation.method());
    }
} catch (Exception e) {
    e.printStackTrace();
}
//打印结果
我是方法
```

## 四、JDK 提供的内置注解

JDK 给我们提供了很多内置的注解，其中常用的有：

)1、@Override

2、@Deprecated

3、@SuppressWarnings

4、@FunctionalInterface

### 1）、@Override 

@Override 用在方法上，表示这个方法重写了父类的方法，例如 `toString` 方法 

```java
@Override
public String toString() {
    return super.toString();
}
```

### 2）、@Deprecated

@Deprecated 表示这个方法被弃用，不建议开发者使用

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281545225.png" alt="image-20210626113644915" style="zoom:50%;" />

可以看到用 @Deprecated 注解的方法调用的时候会被划掉

### 3）、@SuppressWarnings

@SuppressWarnings 用于忽略警告信息，常见的取值如下：

- deprecation：使用了不赞成使用的类或方法时的警告（使用 @Deprecated 使得编译器产生的警告）
- unchecked：执行了未检查的转换时的警告，例如当使用集合时没有用泛型 (Generics) 来指定集合保存的类型; 关闭编译器警告
- fallthrough：当 Switch 程序块直接通往下一种情况而没有 Break 时的警告
- path：在类路径、源文件路径等中有不存在的路径时的警告
- serial：当在可序列化的类上缺少 serialVersionUID 定义时的警告
- finally：任何 finally 子句不能正常完成时的警告
- rawtypes 泛型类型未指明
- unused 引用定义了，但是没有被使用
- all：关于以上所有情况的警告

以泛型举个例子：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281546963.png" alt="image-20210626114048630" style="zoom:50%;" />

当我们创建 List 未指定泛型时，编译器就会报黄提示我们未指明泛型，这个时候就可以使用这个注解了：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281546840.png" alt="image-20210626114241155" style="zoom:50%;" />

### 4）、@FunctionalInterface

@FunctionalInterface 是 JDK 1.8 新增的注解，用于约定函数式接口，**函数式接口就是接口中只有一个抽象方法**

```java
@FunctionalInterface
interface testInterface{
    void testMethod();
}
```

而当你有两个抽象方法时，注解会报红提示你：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281546130.png" alt="image-20210626114855416" style="zoom:50%;" />

## 五、注解实际应用场景

### 1）、使用自定义注解代替枚举类型

主要针对源码阶段注解

这个在我们实际工作中也挺常用的，使用枚举类型开销大，我们一般都会使用自定义注解进行替代，如下：

```java
//1、使用枚举
enum EnumFontType{
    ROBOTO_REGULAR,ROBOTO_MEDIUM,ROBOTO_BOLD
}
//实际调用
EnumFontType type1 = EnumFontType.ROBOTO_BOLD;

//================================ 完美的分割线 ==================================
//2、使用自定义注解
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.LOCAL_VARIABLE})
@Retention(RetentionPolicy.SOURCE)
@IntDef({AnnotationFontType.ROBOTO_REGULAR,AnnotationFontType.ROBOTO_MEDIUM,AnnotationFontType.ROBOTO_BOLD})
@interface AnnotationFontType{
    int ROBOTO_REGULAR = 1;
    int ROBOTO_MEDIUM = 2;
    int ROBOTO_BOLD = 3;
}
//实际调用
@AnnotationFontType int type2 = AnnotationFontType.ROBOTO_MEDIUM;
```

### 2）、注解处理器 (APT)

主要针对编译阶段注解

实际我们日常开发中，经常会遇到它，因为我们常用的一些开源库如 ButterKnife，Retrofit，Arouter，EventBus 等等都使用到了 APT 技术。也正是因为这些著名的开源库，才使得 APT 技术越来越火，在本系列的下一篇中，我也会讲到。

### 3）、运行时注解处理

主要针对运行阶段注解

举个实际的例子：例如我们开车去自助加油机加油，设定的 Money 是 200，如果少于 200 则提示 `加油中...`，否则提示 `油已加满`，如果出现异常情况，提示 `加油失败`

现在我们通过注解来实现一下它，如下：

```java
@Inherited
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface OilAnnotation{
    double maxOilMoney() default 0;
}

class GasStation{

    @OilAnnotation(maxOilMoney = 200)
    public void addOil(double money){
        String tips = processOilAnnotation(money);
        System.out.println(tips);
    }

    @SuppressWarnings("all")
    private String processOilAnnotation(double money){
        try {
            Class<GasStation> aClass = GasStation.class;
            //获取当前方法的注解
            Method addOilMethod = aClass.getDeclaredMethod("addOil", double.class);
            //获取方法注解是否存在
            boolean annotationPresent = addOilMethod.isAnnotationPresent(OilAnnotation.class);
            if(annotationPresent){
                OilAnnotation oilAnnotation = addOilMethod.getDeclaredAnnotation(OilAnnotation.class);
                if(money >= oilAnnotation.maxOilMoney()){
                    return "油已加满";
                }else {
                    return "加油中...";
                }
            }
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return "加油失败";
    }
}

new GasStation().addOil(100);
//打印结果
加油中...
  
new GasStation().addOil(200);
//打印结果
油已加满
```

## 六、总结

本篇文章讲的一些重点内容：

1、自定义注解时，元注解的组合使用

2、注解属性的定义，使用和获取

3、一些常用的 JDK 内置注解

4、注解的实际应用及运行阶段注解的一个实践

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝 

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我们就正式开始 APT 技术的讲解了，敬请期待吧😄

### 参考和推荐

[Java 注解完全解析](https://juejin.cn/post/6844903833299058702)

[「Java 路线」| 注解（含 Kotlin）](https://www.jianshu.com/p/5871e1186840)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
