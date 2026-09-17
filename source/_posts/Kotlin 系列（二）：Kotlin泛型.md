---
title: Kotlin 系列（二）：Kotlin泛型
date: 2022-10-11 10:50:24
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281623687.jpeg
tags: 
- 原创
- Android
- Kotlin
categories:
- Android
- Kotlin
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281623687.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇中，我们学习了 Kotlin 大部分知识点，体验到了 Kotlin 语法的便捷，强大，以及高效的函数式编程。还没有看过上一篇文章的朋友，建议先去阅读 ["Kotlin"系列: 一、Kotlin入门](https://juejin.cn/post/6942251919662383134)，接下来我们就进入 Kotlin 泛型的学习，泛型在我看来是比较复杂的，同时也是面试中经常问的，很长一段时间，我对泛型的认识比较模糊，那么在使用的时候就更加疑惑了，因此这篇文章希望能带大家攻克这一知识点

## 问题

下面我抛出一系列问题，咱们带着问题去学习：

1、什么是泛型？

2、泛型有什么作用？

3、怎么去定义和使用泛型？

### 1、什么是泛型？

泛型通俗的理解就是：很多的类型，它通过使用**参数化类型**的概念，允许我们在不指定具体类型的情况下进行编程

### 2、泛型有什么作用？

泛型是 JDK 1.5 引入的安全机制，是一种给编译器使用的技术：

1、提高了代码的可重用性

2、将运行期的类型转换异常提前到了编译期，保证类型的安全，避免类型转换异常

### 3、怎么去定义和使用泛型？

我们可以给一个类，方法，或者接口指定泛型，在具体使用的地方指定具体的类型

## 一、Java 泛型

要学习好 Kotlin 泛型，我们先要对 Java 泛型足够的了解，因为 Kotlin 泛型和 Java 泛型基本上是一样的，只不过在 Kotlin 上有些东西换了新的写法

### 1、泛型的简单使用

在 Java 中，我们可以给一个类，方法，或者接口指定泛型，在具体使用的地方指定具体的类型

1）、定义一个泛型类，在类名的后面加上 `<T>` 这种语法结构就是定义一个泛型类，泛型可以有任意多个

```java
//定义一个泛型类
public class JavaGenericClass<T> {

    private T a;

    public JavaGenericClass(T a) {
        this.a = a;
    }

    public T getA() {
        return a;
    }

    public void setA(T a) {
        this.a = a;
    }

    //泛型类使用
    public static void main(String[] args) {
      	//编译器可推断泛型类型，因此 new 对象后面的泛型类型可省略
        JavaGenericClass<String> javaGenericClass1 = new JavaGenericClass<String>("erdai");
        JavaGenericClass<Integer> javaGenericClass2 = new JavaGenericClass<>(666);
        System.out.println(javaGenericClass1.getA());
        System.out.println(javaGenericClass2.getA());
    }
}

//打印结果
erdai
666
```

2）、定义一个泛型方法，在方法的返回值前面加上 `<T>` 这种语法结构就是定义一个泛型方法，泛型可以有任意多个，泛型方法的泛型与它所在的类没有任何关系

```java
public class JavaGenericMethod {

    public <T> void getName(T t){
        System.out.println(t.getClass().getSimpleName());
    }

    public static void main(String[] args) {
        JavaGenericMethod javaGenericMethod = new JavaGenericMethod();
      	//编译器可推断出泛型类型，因此这里的泛型类型也可省略
        javaGenericMethod.<String>getName("erdai666");
    }
}

//打印结果
String
```

3）、定义一个泛型接口

在接口名的后面加上 `<T>` 这种语法结构就是定义一个泛型接口，泛型可以有任意多个

```java
public interface JavaGenericInterface<T> {

    T get();
}

class TestClass<T> implements JavaGenericInterface<T>{

    private final T t;

    public TestClass(T t) {
        this.t = t;
    }

    @Override
    public T get() {
        return t;
    }
}

class Client{

    public static void main(String[] args) {
        JavaGenericInterface<String> javaGenericInterface = new TestClass<>("erdai666");
        System.out.println(javaGenericInterface.get());
    }
}
//打印结果
erdai666
```

### 2、泛型擦除

#### 1、泛型擦除是什么？

看下面这段代码：

```java
//使用了不同的泛型类型 结果得到了相同的数据类型
public class JavaGenericWipe {
  
    public static void main(String[] args) {
        Class a = new ArrayList<String>().getClass();
        Class b = new ArrayList<Integer>().getClass();

        System.out.println("a = " + a);
        System.out.println("b = " + b);
        System.out.println("a == b: " + (a == b));
    }
}

//打印结果
a = class java.util.ArrayList
b = class java.util.ArrayList
a == b: true
```

为啥会出现这种情况呢？

因为 Java 中的泛型是使用擦除技术来实现的：**泛型擦除是指通过类型参数合并，将泛型类型实例关联到同一份字节码上。编译器只为泛型类型生成一份字节码，并将其实例关联到这份字节码上**

之所以要使用泛型擦除是为了兼容 JDK 1.5 之前运行时的类加载器，避免因为引入泛型而导致运行时创建不必要的类

#### 2、泛型擦除的具体步骤

1）、擦除所有类型参数信息，如果类型参数是有界的，则将每个参数替换为其第一个边界；如果类型参数是无界的，则将其替换为 Object类型擦除的规则：

> `<T>` 擦除后变为 Object 
>
> `<T extends A>` 擦除后变为 A 
>
> `<? extends A>`  擦除后变为 A
>
> `<? super A>` 擦除后变为Object

2）、（必要时）插入类型转换，以保持类型安全

3）、（必要时）生成桥接方法以在子类中保留多态性

```java
//情况1: 擦除所有类型参数信息，如果类型参数是有界的，则将每个参数替换为其第一个边界；如果类型参数是无界的，则将其替换为 Object
class Paint {
    void draw() {
        System.out.println("Paint.draw() called");
    }
}

//如果不给 T 设置边界，那么 work 方法里面的 t 就调用不到 draw 方法
class Painter<T extends Paint> {
    private T t;

    public Painter(T t) {
        this.t = t;
    }
    public void work() {
        t.draw();
    }
}

//情况2：（必要时）插入类型转换，以保持类型安全
public class JavaGenericWipe {
    public static void main(String[] args) {
        List<String> stringList = new ArrayList<>();
        stringList.add("erdai");
        stringList.add("666");

        for (String s : stringList) {
            System.out.println(s);
        }
    }
}

//编译时生成的字节码文件翻译过来大致如下
public class JavaGenericWipe {
    public JavaGenericWipe() {
    }

    public static void main(String[] args) {
        List<String> stringList = new ArrayList();
        stringList.add("erdai");
        stringList.add("666");
        Iterator var2 = stringList.iterator();

        while(var2.hasNext()) {
            //编译器给我们做了强转的工作
            String s = (String)var2.next();
            System.out.println(s);
        }
    }
}

//情况3 （必要时）生成桥接方法以在子类中保留多态性
class Node {
    public Object data;

    public Node(Object data) {
        this.data = data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}

class MyNode extends Node {

    public MyNode(Integer data) {
        super(data);
    }

    public void setData(Integer data) {
        super.setData(data);
    }
}

//编译时生成的字节码文件翻译过来大致如下
class MyNode extends Node {

    public MyNode(Integer data) {
        super(data);
    }
    // 编译器生成的桥接方法
    public void setData(Object data) {
        setData((Integer) data);
    }

    public void setData(Integer data) {
        System.out.println("MyNode.setData");
        super.setData(data);
    }
}
```

#### 3、伪泛型

Java 中的泛型是一种特殊的语法糖，通过类型擦除实现，这种泛型称为伪泛型，我们可以反射绕过编译器泛型检查，添加一个不同类型的参数

```java
//反射绕过编译器检查
public static void main(String[] args) {
    
     List<String> stringList = new ArrayList<>();
     stringList.add("erdai");
     stringList.add("666");

     //使用反射增加一个新的元素
     Class<? extends List> aClass = stringList.getClass();
     try {
         Method method = aClass.getMethod("add", Object.class);
         method.invoke(stringList,123);
     } catch (Exception e) {
         e.printStackTrace();
     }

     Iterator iterator = stringList.iterator();
     while (iterator.hasNext()){
         System.out.println(iterator.next());
     }
}
//打印结果
erdai
666
123
```

#### 4、泛型擦除进阶

下面我抛出一个在工作中经常会遇到的问题：

在进行网络请求的时候，传入一个泛型的实际类型，为啥能够正确的获取到该泛型类型，并利用 Gson 转换为实际的对象？

答：是因为在运行期我们可以使用反射获取到具体的泛型类型

What? 泛型不是在编译的时候被擦除了吗？为啥在运行时还能够获取到具体的泛型类型？🤔️

答：泛型中所谓的类型擦除，其实只是擦除 Code 属性中的泛型信息，在类常量池属性（Signature 属性、LocalVariableTypeTable 属性）中其实还保留着泛型信息，而类常量池中的属性可以被 class 文件，字段表，方法表等携带，这就使得我们声明的泛型信息得以保留，这也是我们在运行时可以反射获取泛型信息的根本依据

```java
//这是反编译后的 JavaGenericClass.class 文件，可以看到 T
public class JavaGenericClass<T> {

    private T a;

    public JavaGenericClass(T a) {
        this.a = a;
    }

    public T getA() {
        return a;
    }

    public void setA(T a) {
        this.a = a;
    }
  
  //...
}
```

**注意**：Java 是在 JDK 1.5 引入的泛型，为了弥补泛型擦除的不足，JVM 的 class 文件也做了相应的修改，其中最重要的就是新增了 **Signature** 属性表和 **LocalVariableTypeTable** 属性表

我们看下下面这段代码：

```java
class ParentGeneric<T> {

}

class SubClass extends ParentGeneric<String>{

}

class SubClass2<T> extends ParentGeneric<T> {

}

public class GenericGet {

    //获取实际的泛型类型
    public static <T> Type findGenericType(Class<T> cls) {
        Type genType = cls.getGenericSuperclass();
        Type finalNeedType = null;
        if (genType instanceof ParameterizedType) {
            Type[] params = ((ParameterizedType) genType).getActualTypeArguments();
            finalNeedType = params[0];
        }
        return finalNeedType;
    }
  
    public static void main(String[] args) {
        SubClass subClass = new SubClass();
	SubClass2<Integer> subClass2 = new SubClass2<Integer>();
        //打印 subClass 获取的泛型
        System.out.println("subClass: " + findNeedClass(subClass.getClass()));
      	//打印subClass2获取的泛型
        System.out.println("subClass2: " + findGenericType(subClass2.getClass()));
    }
}

//运行这段代码 打印结果如下
subClass: class java.lang.String
subClass2: T
```

上面代码：

1、 SubClass 相当于对 ParentGeneric<T> 做了赋值操作 T = String，我们通过反射获取到了泛型类型为 String

2、SubClass2 对 ParentGeneric<T>没有做赋值操作 ，我们通过反射获取到了泛型类型为 T 

这里大家肯定会有很多疑问？

1、为啥 1 中没有传入任何泛型的信息却能获取到泛型类型呢？

2、为啥 2 中我创建对象的时候传入的泛型是 Integer ，获取的时候变成了 T 呢？

现在我们来仔细分析一波：

上面我讲过，类型擦除其实只是擦除 Code 属性中的泛型信息，在类常量池属性中还保留着泛型信息，因此上面的 SubClass 和SubClass2 在编译的时候其实会保留各自的泛型到字节码文件中，一个是 String，一个是 T 。而 subClass 和 subClass2 是运行时动态创建的，这个时候你即使传入了泛型类型，也会被擦除掉，因此才会出现上面的结果，到这里，大家是否明了了呢？

如果还有点模糊，我们再来看一个例子：

```java
class ParentGeneric<T> {

}

public class GenericGet {
    //获取实际的泛型类型
    public static <T> Type findGenericType(Class<T> cls) {
       Type genType = cls.getGenericSuperclass();
        Type finalNeedType = null;
        if (genType instanceof ParameterizedType) {
            Type[] params = ((ParameterizedType) genType).getActualTypeArguments();
            finalNeedType = params[0];
        }
        return finalNeedType;
    }

    public static void main(String[] args) {
        ParentGeneric<String> parentGeneric1 = new ParentGeneric<String>();
        ParentGeneric<String> parentGeneric2 = new ParentGeneric<String>(){};

        //打印 parentGeneric1 获取的泛型
        System.out.println("parentGeneric1: " + findGenericType(parentGeneric1.getClass()));
        //打印 parentGeneric2 获取的泛型
        System.out.println("parentGeneric2: " + findGenericType(parentGeneric2.getClass()));

    }
}
//运行这段代码 打印结果如下
parentGeneric1: null
parentGeneric2: class java.lang.String
```

上述代码 parentGeneric1 和 parentGeneric2 唯一的区别就是多了 {}，获取的结果却截然不同，我们在来仔细分析一波：

1、 ParentGeneric 声明的泛型 T 在编译的时候其实是保留在了字节码文件中，parentGeneric1 是在运行时创建的，由于泛型擦除，我们无法通过反射获取其中的类型，因此打印了 null

这个地方可能大家又会有个疑问了，你既然保留了泛型类型为 T，那么我获取的时候应该为 T 才是，为啥打印的结果是 null 呢？

如果你心里有这个疑问，说明你思考的非常细致，要理解这个问题，我们首先要对 Java 类型（Type）系统有一定的了解，这其实和我上面写的那个获取泛型类型的方法有关：

```java
//获取实际的泛型类型
public static <T> Type findGenericType(Class<T> cls) {
    //获取当前带有泛型的父类
    Type genType = cls.getGenericSuperclass();
    Type finalNeedType = null;
    //如果当前 genType 是参数化类型则进入到条件体
    if (genType instanceof ParameterizedType) {
      	//获取参数类型 <> 里面的那些值,例如 Map<K,V> 那么就得到 [K,V]的一个数组
        Type[] params = ((ParameterizedType) genType).getActualTypeArguments();
      	//将第一个泛型类型赋值给 finalNeedType
        finalNeedType = params[0];
    }
    return finalNeedType;
}
```

上述代码我们需要先获取这个类的泛型父类，如果是参数化类型则进入到条件体，获取实际的泛型类型并返回。如果不是则直接返回 finalNeedType , 那么这个时候就为 null 了

在例1中：

```java
SubClass1 subClass1 = new SubClass1();
SubClass2<Integer> subClass2 = new SubClass2<>();
System.out.println(subClass1.getClass().getGenericSuperclass());
System.out.println(subClass2.getClass().getGenericSuperclass());
//运行程序 打印结果如下
com.dream.java_generic.share.ParentGeneric<java.lang.String>
com.dream.java_generic.share.ParentGeneric<T>
```

可以看到获取到了泛型父类，因此会走到条件体里面获取到实际的泛型类型并返回

在例2中:

```java
ParentGeneric<String> parentGeneric1 = new ParentGeneric<String>();
System.out.println(parentGeneric1.getClass().getGenericSuperclass());
//运行程序 打印结果如下
class java.lang.Object
```

可以看到获取到的泛型父类是 Object，因此进不去条件体，所以就返回 null 了

2、parentGeneric2 在创建的时候后面加了 {}，这就使得 parentGeneric2 成为了一个匿名内部类，且父类就是 ParentGeneric，因为匿名内部类是在编译时创建的，那么在编译的时候就会创建并携带具体的泛型信息，因此 parentGeneric2 可以获取其中的泛型类型

通过上面两个例子我们可以得出结论：**如果在编译的时候就保存了泛型类型到字节码中，那么在运行时我们就可以通过反射获取到，如果在运行时传入实际的泛型类型，这个时候就会被擦除，反射获取不到当前传入的泛型实际类型**

例子1中我们指定了泛型的实际类型为 String，编译的时候就将它存储到了字节码文件中，因此我们获取到了泛型类型。例子2中我们创建了一个匿名内部类，同样在编译的时候会进行创建并保存了实际的泛型到字节码中，因此我们可以获取到。而 parentGeneric1 是在运行时创建的，虽然 ParentGeneric 声明的泛型 T 在编译时也保留在了字节码文件中，但是它传入的实际类型被擦除了，这种泛型也是无法通过反射获取的，记住上面这条结论，那么对于泛型类型的获取你就得心应手了

#### 5、泛型获取经验总结

其实通过上面两个例子可以发现，当我们定义一个子类继承一个泛型父类，并给这个泛型一个类型，我们就可以获取到这个泛型类型

```java
//定义一个子类继承泛型父类，并给这个泛型一个实际的类型
class SubClass extends ParentGeneric<String>{

}

//匿名内部类，其实我们定义的这个匿名内部类也是一个子类，它继承了泛型父类，并给这个泛型一个实际的类型
ParentGeneric<String> parentGeneric2 = new ParentGeneric<String>(){};
```

**因此如果我们想要获取某个泛型类型，我们可以通过子类的帮助去取出该泛型类型，一种良好的编程实践就是把当前需要获取的泛型类用 abstract 声明**

### 3、边界

边界就是在泛型的参数上设置限制条件，这样可以强制泛型可以使用的类型，更重要的是可以按照自己的边界类型来调用方法

1）、Java 中设置边界使用 extends 关键字，完整语法结构：`<T extends Bound>` ，Bound 可以是类和接口，如果不指定边界，默认边界为 Object

2）、可以设置多个边界，中间使用 & 连接，多个边界中只能有一个边界是类，且类必须放在最前面，类似这种语法结构

```java
<T extends ClassBound & InterfaceBound1 & InterfaceBound2>
```

下面我们来演示一下：

```java
abstract class ClassBound{
    public abstract void test1();
}

interface InterfaceBound1{
    void test2();
}

interface InterfaceBound2{
    void test3();
}

class ParentClass <T extends ClassBound & InterfaceBound1 & InterfaceBound2>{
    private final T item;

    public ParentClass(T item) {
        this.item = item;
    }

    public void test1(){
        item.test1();
    }

    public void test2(){
        item.test2();
    }

    public void test3(){
        item.test3();
    }
}

class SubClass extends ClassBound implements InterfaceBound1,InterfaceBound2 {

    @Override
    public void test1() {
        System.out.println("test1");
    }

    @Override
    public void test2() {
        System.out.println("test2");
    }

    @Override
    public void test3() {
        System.out.println("test3");
    }
}

public class Bound {
    public static void main(String[] args) {
        SubClass subClass = new SubClass();
        ParentClass<SubClass> parentClass = new ParentClass<SubClass>(subClass);
        parentClass.test1();
        parentClass.test2();
        parentClass.test3();
    }
}
//打印结果
test1
test2
test3
```

### 4、通配符

#### 1、泛型的协变，逆变和不变

思考一个问题，代码如下：

```java
Number number = new Integer(666);
ArrayList<Number> numberList = new ArrayList<Integer>();//编译器报错 type mismatch
```

上述代码，为啥 Number 的对象可以由 Integer 实例化，而 `ArrayList<Number>` 的对象却不能由 `ArrayList<Integer>` 实例化？

要明白上面这个问题，我们首先要明白，什么是泛型的协变，逆变和不变

> 1）、泛型协变，假设我定义了一个 `Class<T>` 的泛型类，其中 A 是 B 的子类，同时 `Class<A>` 也是 `Class<B>` 的子类，那么我们说 Class 在 T 这个泛型上是协变的
>
> 2）、泛型逆变，假设我定义了一个 `Class<T>` 的泛型类，其中 `A 是 B` 的子类，同时 `Class<B>` 也是 `Class<A>` 的子类，那么我们说 Class 在 T 这个泛型上是逆变的
>
> 3）、泛型不变，假设我定义了一个 `Class<T> ` 的泛型类，其中 A 是 B 的子类，同时 `Class<B>` 和 `Class<A>` 没有继承关系，那么我们说 Class 在 T 这个泛型上是不变的

因此我们可以知道 `ArrayList<Number>` 的对象不能由 `ArrayList<Integer>` 实例化是因为 ArrayList 当前的泛型是不变的，我们要解决上面报错的问题，可以让 ArrayList 当前的泛型支持协变，如下：

```java
Number number = new Integer(666);
ArrayList<? extends Number> numberList = new ArrayList<Integer>();
```

#### 2、泛型的上边界通配符

1）、泛型的上边界通配符语法结构：`<? extends Bound>`，使得泛型支持协变，它限定的类型是当前上边界类或者其子类，如果是接口的话就是当前上边界接口或者实现类，使用上边界通配符的变量只读，不可以写，可以添加 null ，但是没意义

```java
public class WildCard {
    public static void main(String[] args) {
        List<Integer> integerList = new ArrayList<Integer>();
        List<Number> numberList = new ArrayList<Number>();
        integerList.add(666);
        numberList.add(123);

        getNumberData(integerList);
        getNumberData(numberList);
    }

    public static void getNumberData(List<? extends Number> data) {
        System.out.println("Number data :" + data.get(0));
    }
}
//打印结果
Number data: 666
Number data: 123
```

问题：为啥使用上边界通配符的变量只读，而不能写？

1、`<? extends Bound>`,它限定的类型是当前上边界类或者其子类，它无法确定自己具体的类型，因此编译器无法验证类型的安全，所以不能写

2、假设可以写，我们向它里面添加若干个子类，然后用一个具体的子类去接收，势必会造成类型转换异常

#### 3、泛型的下边界通配符

1）、泛型的下边界通配符语法结构：`<? super Bound>`，使得泛型支持逆变，它限定的类型是当前下边界类或者其父类，如果是接口的话就是当前下边界接口或者其父接口，使用下边界通配符的变量只写，不建议读

```java
public class WildCard {
  
    public static void main(String[] args) {
        List<Number> numberList = new ArrayList<Number>();
        List<Object> objectList = new ArrayList<Object>();
        setNumberData(numberList);
        setNumberData(objectList);
    }
    
    public static void setNumberData(List<? super Number> data) {
        Number number = new Integer(666);
        data.add(number);
    }
}
```

问题：为啥使用下边界通配符的变量可以写，而不建议读？

1、`<? super Bound>`，它限定的类型是当前下边界类或者其父类，虽然它也无法确定自己具体的类型，但根据多态，它能保证自己添加的元素是安全的，因此可以写

2、获取值的时候，会返回一个 `Object` 类型的值，而不能获取实际类型参数代表的类型，因此建议不要去读，如果你实在要去读也行，但是要注意类型转换异常

#### 4、泛型的无边界通配符

1）、无边界通配符的语法结构：`<?>`，实际上它等价于 `<? extends Object>`，也就是说它的上边界是 Object 或其子类，因此使用无界通配符的变量同样只读，不能写，可以添加 null ，但是没意义

```java
public class WildCard {
  
    public static void main(String[] args) {
        List<String> stringList = new ArrayList<String>();
        List<Number> numberList = new ArrayList<Number>();
        List<Integer> integerList = new ArrayList<Integer>();
        stringList.add("erdai");
        numberList.add(666);
        integerList.add(123);
        getData(stringList);
        getData(numberList);
        getData(integerList);
    }
    
     public static void getData(List<?> data) {
        System.out.println("data: " + data.get(0));
    }
}
//打印结果
data: erdai
data: 666
data: 123
```

#### 5、PECS 原则

泛型代码的设计，应遵循**PECS原则（Producer extends Consumer super）：**

1）、如果只需要获取元素，使用 `<? extends T>`

2）、如果只需要存储，使用 `<? super T>`

```java
//这是 Collections.java 中 copy 方法的源码
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
      //...
}
```

这是一个很经典的例子，src 表示原始集合，使用了 `<? extends T>`，只能从中读取元素，dest 表示目标集合，只能往里面写元素，充分的体现了 PECS 原则

#### 6、使用通配符总结 

1）、当你只想读取值的时候，使用 `<? extends T>`

2）、当你只想写入值的时候，使用 `<? super T>`

3）、当你既想读取值又想写入值的时候，就不要使用通配符

### 5、泛型的限制

1）、泛型不能显式地引用在运行时类型的操作里，如 instanceof 操作和 new 表达式，运行时类型只适用于原生类型

```java
public class GenericLimitedClass<T> {
    private void test(){
        String str = "";
      	//编译器不允许这种操作
        if(str instanceof T){

        }
        //编译器不允许这种操作
        T t = new T();
    }
}
```

2）、不能创建泛型类型的数组，只可以声明一个泛型类型的数组引用

```java
public class GenericLimitedClass<T> {
    private void test(){
       GenericLimitedClass<Test>[] genericLimitedClasses;
       //编译器不允许
       genericLimitedClasses = new GenericLimitedClass<Test>[10];
    }
}
```

3）、不能声明类型为泛型的静态字段

```java
public class GenericLimitedClass<T> {
    //编译器不允许
    private static T t;
}
```

4）、泛型类不可以直接或间接地继承 Throwable

```java
//编译器不允许
public class GenericLimitedClass<T> extends Throwable {
   
}
```

5）、方法中不可以捕获类型参数的实例，但是可以在 throws 语句中使用类型参数

```java
public class GenericLimitedClass<T> {
    private <T extends Throwable> void test1() throws T{
        try {

        //编译器不允许
        }catch (T exception){

        }
    }
}
```

6）、一个类不可以重载在类型擦除后有同样方法签名的方法

```java
public class GenericLimitedClass<T> {
    //编译器不允许
    private void test2(List<String> stringList){

    }

    private void test2(List<Integer> integerList){

    }
}
```

### 6、问题

1）、类型边界和通配符边界有什么区别？

类型边界可以有多个，通配符边界只能有一个

2）、`List<?>` 和 `List<Object>` 一样吗？

不一样

1、 `List<Object>` 可读写，但是 List<?> 只读

2、`List<?>`可以有很多子类，但是 `List<Object>` 没有

## 二、Kotlin 泛型

Kotlin 泛型和 Java 泛型基本上是一样的，只不过在 Kotlin 上有些东西换了新的写法

### 1、泛型的基本用法

1）、在 Kotlin 中我们定义和使用泛型的方式如下：

```kotlin
//1、定义一个泛型类，在类名后面使用 <T> 这种语法结构就是为这个类定义一个泛型
class MyClass<T>{
  	fun method(params: T) {
      
    }
}
//泛型调用
val myClass = MyClass<Int>()
myClass.method(12)

//2、定义一个泛型方法，在方法名的前面加上 <T> 这种语法结构就是为这个方法定义一个泛型
class MyClass{
    fun <T> method(params: T){

    }
}
//泛型调用
val myClass = MyClass()
myClass.method<Int>(12)
//根据 Kotlin 类型推导机制，我们可以把泛型给省略
myClass.method(12)

//3、定义一个泛型接口，在接口名后面加上 <T> 这种语法结构就是为这个接口定义一个泛型
interface MyInterface<T>{
    fun interfaceMethod(params: T)
}
```

对比 Java 中定义泛型，我们可以发现：在定义类和接口泛型上没有任何区别，在定义方法泛型时，Kotlin 是在方法名前面添加泛型，而 Java 是在返回值前面添加泛型

### 2、边界

1）、为泛型指定边界，我们可以使用 `<T : Class>` 这种语法结构，如果不指定泛型的边界，默认为 Any? 

2）、如果有多个边界，可以使用 where 关键字，中间使用 : 隔开，多个边界中只能有一个边界是类，且类必须放在最前面

```kotlin
//情况1 单个边界
class MyClass1<T : Number> {

    var data: T? = null

    fun <T : Number> method(params: T) {

    }
}

//情况2 多个边界使用 where 关键字
open class Animal
interface Food
interface Food2

class MyClass2<T> where T : Animal, T : Food, T : Food2 {

    fun <T> method(params: T) where T : Animal, T : Food, T : Food2 {

    }
}
```

### 3、泛型实化

泛型实化在 Java 中是不存在的，Kotlin 中之所以能实现泛型实化，是因为使用的内联函数会对代码进行替换，那么在内联函数中使用泛型，最终也会使用实际的类型进行替换

1）、使用内联函数配合 reified 关键字对泛型进行实化，语法结构如下：

```kotlin
inline fun <reified T> getGenericType() {
  
}
```

实操一下：

```kotlin
inline fun <reified T> getGenericType() = T::class.java

fun main() {
    //泛型实化 这种情况在 Java 是会被类型擦除的
    val result1 = getGenericType<String>()
    val result2 = getGenericType<Number>()
    println(result1)
    println(result2)
}
//打印结果
class java.lang.String
class java.lang.Number
```

2）、实际应用

在我们跳转 Activity 的时候通常会这么操作

```kotlin
val intent = Intent(mContext,TestActivity::class.java)
mContext.startActivity(intent)
```

有没有感觉写这种 TestActivity::class.java 的语法很难受，反正我是觉得很难受，那么这个时候我们就可以使用泛型实化换一种写法：

```kotlin
//定义一个顶层函数
inline fun <reified T> startActivity(mContext: Context){
    val intent = Intent(mContext,T::class.java)
    mContext.startActivity(intent)
}

//使用的时候
startActivity<TestActivity>(mContext)
```

这种写法是不是清爽了很多，那么在我们跳转 Activity 的时候，可能会携带一些参数，如下：

```kotlin
val intent  = Intent(mContext,TestActivity::class.java)
intent.putExtra("params1","erdai")
intent.putExtra("params2","666")
mContext.startActivity(intent)
```

这个时候我们可以增加一个函数类型的参数，使用 Lambda 表达式去调用，如下：

```kotlin
inline fun <reified T> startActivity(mContext: Context, block: Intent.() -> Unit){
    val intent = Intent(mContext,T::class.java)
    intent.block()
    mContext.startActivity(intent)
}

//使用的时候
startActivity<SecondActivity>(mContext){       
  putExtra("params1","erdai")     
  putExtra("params2","666")
}
```

### 4、泛型协变，逆变和不变

1）、泛型协变的语法规则：`<out T>` 类似于 Java 的  `<? extends Bound>`，它限定的类型是当前上边界类或者其子类，如果是接口的话就是当前上边界接口或者实现类，协变的泛型变量只读，不可以写，可以添加 null ，但是没意义

```kotlin
open class Person
class Student: Person()
class Teacher: Person()

class SimpleData<out T>{

}

fun main() {
    val person: Person = Student()
    val personGeneric: SimpleData<Person> = SimpleData<Student>()
    val list1: ArrayList<out Person> = ArrayList<Student>()
}
```

2）、泛型逆变的语法规则：`<in T>` 类似于 Java 的 `<? super Bound>`，它限定的类型是当前下边界类或者其父类，如果是接口的话就是当前下边界接口或者其父接口，逆变的泛型变量只能写，不建议读

```kotlin
open class Person
class Student: Person()
class Teacher: Person()

class SimpleData<in T>{

}

fun main() {
    val person1: Person = Student()
    val personGeneric1: SimpleData<Student> = SimpleData<Person>()
    val list2: ArrayList<in Person> = ArrayList<Any>()
}
```

5）、泛型不变和 Java 语法规则是一样的

```kotlin
open class Person
class Student: Person()
class Teacher: Person()

class SimpleData<T>{

}

fun main() {
    val person: Person = Student()
    //编译器不允许
    val personGeneric: SimpleData<Person> = SimpleData<Student>()
}
```

6）、Kotlin 使用 <*> 这种语法结构来表示无界通配符，它等价于 `<out Any>`，类似于 Java 中的 <?>，在定义一个类的时候你如果使用`<out T : Number>` ，那么 * 就相当于 `<out Number>`

```kotlin
class KotlinGeneric<out T: Number>{

}

//无界通配符 等价于 <out Any>，但是我这个类限制了泛型边界为 Number，因此这里相当于 <out Number>
fun main() {
    val noBound: KotlinGeneric<*> = KotlinGeneric<Int>()
 
    //根据协变规则 编译器不允许这样写
    val noBound: KotlinGeneric<*> = KotlinGeneric<Any>()
}
```

## 三、泛型总结

要学好 Kotlin 泛型，就要先学习好 Java  泛型，最后总结一下这篇文章讲的内容：

1、回答了一些关于泛型的问题

2、讲解了 Java 泛型，其中我觉得泛型擦除和泛型的协变，逆变和不变是比较难理解的，因此大家可以多花点时间去理解这一块

3、讲解了 Kotlin 泛型，相对于 Java 泛型，Kotlin泛型就是在语法结构上有些不一样，但功能是完全一样的，另外 Kotlin 中的泛型实化是 Java 中所没有的

好了，到这里，Kotlin 泛型就讲完了，相信你如果从头看到这里，收获一定很多，如果觉得我写得还不错，请给我点个赞吧🤝，如果有任何问题，欢迎评论区一起讨论

**感谢你阅读这篇文章**

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
