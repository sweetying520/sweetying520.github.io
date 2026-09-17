---
title: Gradle 系列 （六）、Gradle Transform + ASM + Javassist 实战
date: 2022-10-29 17:12:06
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281612454.jpeg
tags:
- 原创
- Android
- Gradle
categories:
- Android
- Gradle
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281612454.jpeg)

# 前言

很高兴遇见你~

关于 Gradle 学习，我所理解的流程如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281612033.png" alt="Gradle_learning" width="100%" />

在本系列的上一篇文章中，我们介绍了：

> 1、什么是 Gradle Transform？
>
> 2、自定义 Gradle Transform 流程
>
> 3、Gradle Transform 数据流程以及核心 Api 分析
>
> 4、Gradle Gransform 的增量与并发并封装了一套自定义模版，简化我们自定义 Gradle Transform 的使用

还没有看过上一篇文章的朋友，建议先去阅读[Gradle 系列 （五）、自定义 Gradle Transform](https://juejin.cn/post/7159841721856032804)，接下来我们介绍 Gradle Transform + ASM + Javassist 的实战应用

# 回顾

上一篇文章我们在前言中留了几个问题：

1、为了对 app 性能做一个全面的评估，我们需要做 UI，内存，网络等方面的性能监控，如何做?

2、发现某个第三方库有 bug ，用起来不爽，但又不想拿它的源码修改在重新编译，有什么好的办法？

3、我想在不修改源码的情况下，统计某个方法的耗时，对某个方法做埋点，怎么做？

1 是需要通过 Gradle Transform 去做一个 APM 框架，这个写起来篇幅会过长，后续专门开文章去讲。

我们主要解决 2，3 这两个问题，在此之前先简单学习点 ASM 和 Javassist 的知识

# 一、ASM 筑基

## 1.1、ASM 介绍

ASM 是一个 Java 字节码操作框架。它能被用来动态生成字节码或者对现有的类进行增强。ASM 可以直接生成二进制 class 文件，也可以在类被加载入 Java 虚拟机之前动态改变类行为。比如方法执行前后插入代码，添加成员变量，修改父类，添加接口等等

## 1.2、ASM Api

首先先引入 ASM 相关的 Gradle 远程依赖：

```groovy
//asm
implementation 'org.ow2.asm:asm:9.2'
implementation 'org.ow2.asm:asm-util:9.2'
implementation 'org.ow2.asm:asm-commons:9.2'
```

ASM 的 Api 有两种使用方式：

> 1、Tree Api ：树形模式
>
> 2、Visitor Api ：访问者模式

Tree Api 会将 class 文件的结构读取到内存，构建一个树形结构，在处理 Method，Field 等元素时，会到树形结构中定位到某个元素进行操作，然后把操作在写入 class 文件，最终达到修改字节码的目的。一般比较适合处理复杂的场景

### 1.2.1、Visitor Api：访问者模式

Visitor Api 则是通过接口的方式，分离**读 class** 和**写 class** 的逻辑，一般通过 ClassReader 读取 class ，然后 ClassReader 通过 ClassVisitor 抽象类（ClassWriter 是它的具体实现类），将 class 的每个细节按顺序传递给 ClassVisitor（ClassVisitor 中有许多 visitXXX 方法），这个过程就像 ClassReader 带着 ClassVisitor 游览了 class 的每一个指令，有了这些信息，就可以操作这个 class 了

这种方式比较适合处理一些简单的场景，如：**出于某个目的，寻找 class 文件中的一个 hook 点进行字节码修改**。我们就可以使用这种方式

#### 1.2.1.1、ClassVisitor

ClassVisitor 是一个抽象类，主要用于接收 ClassReader 传递过来的每一个字节码指令，常用的实现类有：ClassWriter。

##### 1.2.1.1.1、ClassVisitor 构造方法

ClassVisitor 构造方法主要有两个：

```java
 public ClassVisitor(final int api) {
    this(api, null);
  }


 public ClassVisitor(final int api, final ClassVisitor classVisitor){
    //...
 }
```

我们可以使用：

> 1、传入 ASM 的 Api 版本去构建它：Opcodes.ASM4, Opcodes.ASM5, Opcodes.ASM6 or Opcodes.ASM7
>
> 2、传入 ASM 的 Api  版本和 ClassVisitor 的实现类如：ClassWriter 去构建它

##### 1.2.1.1.2、ClassVisitor visitXXX 系列方法

它还有一系列 visitXXX 方法，列举常用的几个：

```java
public abstract class ClassVisitor {
  //...
  
  //一开始调用
  public void visit(
      final int version,
      final int access,
      final String name,//类名，例如：com.dream.androidutil.StringUtils => com/dream/androidutil/StringUtils
      final String signature,//泛型
      final String superName,//父类名
      final String[] interfaces) {//实现的接口
  }

  //访问注解
  public AnnotationVisitor visitAnnotation(
    //注解名称，例如：com.dream.customannotation.CostTime => Lcom/dream/customannotation/CostTime;
    final String descriptor,
    final boolean visible) {
    //...
  }

  //访问方法
  public MethodVisitor visitMethod(
      final int access,
      final String name,//方法名，例如：getCharArray
      final String descriptor,//方法签名，简单来说就是方法参数和返回值的特定字符串
      final String signature,//泛型
      final String[] exceptions) {
    if (cv != null) {
      return cv.visitMethod(access, name, descriptor, signature, exceptions);
    }
    return null;
  }

  //访问结束时调用
  public void visitEnd() {
    if (cv != null) {
      cv.visitEnd();
    }
  }
}
```

##### 1.2.1.1.3、ClassVisitor visitXXX 方法调用顺序

上述方法的调用遵循一定的顺序，下面列举的是所有 visitXXX 方法的调用顺序：

```java
visit
[visitSource][visitModule][visitNestHost][visitPermittedSubclass][visitOuterClass]
(
 visitAnnotation |
 visitTypeAnnotation |
 visitAttribute
)*
(
 visitNestMember |
 visitInnerClass |
 visitRecordComponent |
 visitField |
 visitMethod
)* 
visitEnd
```

其中，涉及到一些符号，它们的含义如下：

> `[]` ：表示最多调用一次，可以不调用，但最多调用一次。
>
> `() 和 |` ：表示在多个方法之间，可以选择任意一个，并且多个方法之间不分前后顺序
>
> `*` ： 表示方法可以调用0次或多次。

简化一下，如下示例：

```java
visit
(
 visitAnnotation |
)* 
(
 visitField |
 visitMethod
)* 
visitEnd
```

解释说明：上述代码会先调用`visit`方法，接着调用`visitAnnotation` 方法，然后在调用`visitField`或`visitMethod`方法，最后调用`visitEnd`方法

#### 1.2.1.2、ClassReader

ClassReader 主要用于读取 class 文件，并把每个字节码指令传递给 ClassVisitor 的 visitXXX 方法

##### 1.2.1.2.1、ClassReader 构造方法

如下图：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281612072.png" alt="image-20221030123617942.png" width="50%" />

我们可以使用：

> 1、ByteArray（字节数组）
>
> 2、inputStream（输入六），
>
> 3、className（String 的 类名称）

等来构建它

##### 1.2.1.2.2、ClassReader 方法

ClassReader 提供了一系列 get 方法获取类信息：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613172.png" alt="image-20221030124122636.png" width="50%" />

不过，它最重要的方法还是 accept 方法：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613197.png" alt="image-20221030124229333.png" width="50%" />

accept 可以接收一个 ClassVisitor 和一个 parsingOptions。parsingOptions 取值如下：

> 0：会生成所有的ASM代码，包括调试信息、frame信息和代码信息。
>
> ClassReader.SKIP_CODE：会忽略代码信息，例如：会忽略对于 MethodVisitor.visitXxxInsn() 方法的调用
>
> ClassReader.SKIP_DEBUG：会忽略调试信息，例如：会忽略对于MethodVisitor.visitParameter()、MethodVisitor.visitLineNumber()等方法的调用。
>
> ClassReader.SKIP_FRAMES：会忽略 frame 信息，例如：会忽略对于MethodVisitor.visitFrame()方法的调用。
>
> ClassReader.EXPAND_FRAMES：会对frame信息进行扩展，例如：会对 MethodVisitor.visitFrame() 方法的参数有影响。

**Tips**:  推荐使用`ClassReader.SKIP_DEBUG | ClassReader.SKIP_FRAMES`，因为使用这样的一个值，可以生成最少的 ASM 代码，但是又能实现完整的功能

接收后便开始读取数据。当满足一定条件时，就会触发 ClassVisitor 下的 visitXXX 方法。如下示例：

```java
package com.dream.gradletransformdemo;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;
import java.io.IOException;

public class Test {

    public static void main(String[] var0) throws IOException {
        ClassReader cr = new ClassReader("java.util.ArrayList");
        cr.accept(new MyClassVisitor(Opcodes.ASM7),ClassReader.SKIP_DEBUG | ClassReader.SKIP_FRAMES);
    }

    static class MyClassVisitor extends ClassVisitor {

        public MyClassVisitor(int api) {
            super(api);
        }

        @Override
        public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
            System.out.println("visitMethod: " + "access=>" + access + " name=>" + name
                    + " descriptor=>" + descriptor);
            return super.visitMethod(access, name, descriptor, signature, exceptions);
        }
    }
}
```

我们继承了ClassVisitor 类并重写了visitMethod 方法。还记得之前所说的吗？ClassVistor 定义了在读取 class 时会触发的 visitXXX 方法。通过 accept 方法，建立了 ClassVisitor 与 ClassReader 之间的连接。因此，当 ClassReader 访问对象的方法时，它将触发ClassVisitor 内的 visitMethod 方法，这时由于我们在 visitMethod 下添加了一条打印语句，因此会打印如下信息：

```java
//打印结果，因为 ArrayList 方法众多，简单截取看几个常用的
//...
//<init> 对应的就是 ArrayList 的构造方法，我们可以看到有三个
visitMethod: access=>1 name=><init> descriptor=>(I)V
visitMethod: access=>1 name=><init> descriptor=>()V
visitMethod: access=>1 name=><init> descriptor=>(Ljava/util/Collection;)V
//ArrayList get 方法
visitMethod: access=>1 name=>get descriptor=>(I)Ljava/lang/Object;
//ArrayList set 方法
visitMethod: access=>1 name=>set descriptor=>(ILjava/lang/Object;)Ljava/lang/Object;
//ArrayList add 方法，有 3 个
visitMethod: access=>2 name=>add descriptor=>(Ljava/lang/Object;[Ljava/lang/Object;I)V
visitMethod: access=>1 name=>add descriptor=>(Ljava/lang/Object;)Z
visitMethod: access=>1 name=>add descriptor=>(ILjava/lang/Object;)V
//ArrayList remove 方法                                                                                                      
visitMethod: access=>1 name=>remove descriptor=>(I)Ljava/lang/Object;
visitMethod: access=>1 name=>remove descriptor=>(Ljava/lang/Object;)Z                                                                                                      
//...                                                                                                       
```

##### 1.2.1.2.3、字段解析

上述打印结果：

`<init>` ：表示一个类构造函数的名字

`access` ：方法的访问控制符的定义

`name` ：方法名

`descriptor` ：方法签名，简单来说就是方法参数和返回值的特定字符串

我们挑两个 descriptor 进行解析：

```java
//1、() 里面的表示参数
//2、I 表示 int，
//3、如果不是基础类型，需要写完整包名，同时以 L 打头，例如 Object 对应：Ljava/lang/Object;
//4、V 表示 void
//因此我们可以知道这个 descriptor ：接收两个参数：int，Object ，返回值为：void
descriptor=>(ILjava/lang/Object;)V
  
//1、() 里面的表示参数，() 外面的表示返回值
//2、如果是特定的类，需要写完整包名，同时以 L 打头，例如 Object 对应：Ljava/lang/Object;
//4、Z 表示 boolean
//因此我们可以知道这个 descriptor ：接收一个参数：Object ，返回值为：boolean
descriptor=>(Ljava/lang/Object;)Z
```

**注意 () 里面的参数**：

1、没有的话就什么都不写

2、有的话，如果不是基础类型，要是以 L 打头的类名（包含包名）

3、对于数组以 [ 打头，

4、如果不是基础类型，多个参数之间用分号；进行分隔，即便只有一个参数，也要写分号

类型对应表：

| Type Descriptor       | Java Type    |
| --------------------- | ------------ |
| Z                     | boolean      |
| C                     | char         |
| B                     | byte         |
| S                     | short        |
| I                     | int          |
| F                     | float        |
| J                     | long         |
| D                     | double       |
| Ljava/lang/Object;    | Object       |
| `[I`                  | `int[]`      |
| `[[Ljava/lang/Object` | `Object[][]` |

#### 1.2.1.3、ClassWriter

ClassWriter 的父类是 ClassVisitor ，因此继承了 ClassVisitor 的 visitXXX 系列方法，主要用于字节码的写入

##### 1.2.1.3.1、ClassWriter 构造方法

ClassWriter 的构造方法有两个：

```java
public ClassWriter(final int flags) {
  this(null, flags);
}

public ClassWriter(final ClassReader classReader, final int flags) {
  //...
}
```

我们可以使用：

> 1、flags 
>
> 2、classReader + flags

来构建它，其中 flags 的取值如下：

> 0 ：ASM 不会自动计算 max stacks 和 max locals，也不会自动计算 stack map frames
>
> ClassWriter.COMPUTE_MAXS ：ASM 会自动计算 max stacks 和 max locals，但不会自动计算 stack map frames
>
> ClassWriter.COMPUTE_FRAMES ：ASM 会自动计算 max stacks 和 max locals，也会自动计算 stack map frames

**Tips**： 建议使用 ClassWriter.COMPUTE_FRAMES，计算速度快，执行效率高

##### 1.2.1.3.2、toByteArray 方法

这个方法的作用是将我们之前对 class 的修改（visitXXX 内部修改字节码）转换成 byte 数组，然后通过输出流写入到文件，这样就达到了修改字节码的目的

ok，ASM 的知识点就介绍这么多，接下来我们看下 Javassist

# 二、Javassist 筑基

简单介绍下 Javassist，因为它和 Java 的反射 Api 很像，上手简单一些，大家直接代码中去感受一下，写了详细的注释

首先先添加 Javassist Gradle 远程依赖：

```groovy
implementation 'org.javassist:javassist:3.29.2-GA'
```

## 2.1、使用 Javassist 生成 class 文件

1、首先提供一个待生成的 class 文件模版，如下：

```java
package com.dream.gradletransformdemo;

public class Person {
    //私有属性 name，初始值：erdai
    private String name = "erdai";

    //name get 方法
    public void setName(String var1) {
        this.name = var1;
    }

    //name set 方法
    public String getName() {
        return this.name;
    }
		
    //无参构造方法，方法体：this.name = "xiaoming";
    public Person() {
        this.name = "xiaoming";
    }

    //一个参数的构造方法，方法提：this.name = var1;
    public Person(String var1) {
        this.name = var1;
    }

    //普通方法：printName，方法提：System.out.println(this.name);
    public void printName() {
        System.out.println(this.name);
    }
}
```

2、编写 Javassist 代码生成 Person.class 文件

Javassist 生成 .class 文件和 JavaPoet 生成 .java 文件非常类似，如果你熟悉 JavaPoet 的话，下面生成过程将会变得非常简单

```java
public class TestCreateClass {

    /**
     * 创建一个 Person.class 文件
     */
    public static CtClass createPersonClass() throws Exception {
        ClassPool pool = ClassPool.getDefault();

        // 1. 创建一个空类：Person ，包名：com.dream.gradletransformdemo
        CtClass cc = pool.makeClass("com.dream.gradletransformdemo.Person");

        // 2. 新增一个字段 private String name;
        // 字段名为 name
        CtField param = new CtField(pool.get("java.lang.String"), "name", cc);
        // 访问级别是 private
        param.setModifiers(Modifier.PRIVATE);
        // 初始值是 "erdai"
        cc.addField(param, CtField.Initializer.constant("erdai"));

        // 3. 生成 setter、getter 方法
        cc.addMethod(CtNewMethod.setter("setName", param));
      	cc.addMethod(CtNewMethod.getter("getName", param));
    
        // 4. 添加无参的构造函数
        CtConstructor cons = new CtConstructor(new CtClass[]{}, cc);
      	//方法体：this.name = "xiaoming";
        cons.setBody("{name = \"xiaoming\";}");
        cc.addConstructor(cons);

        // 5. 添加有参的构造函数
        cons = new CtConstructor(new CtClass[]{pool.get("java.lang.String")}, cc);
        // 方法提：this.name = var1; 
      	//$0=this \$1,$2,$3... 代表方法参数
        cons.setBody("{$0.name = $1;}");
        cc.addConstructor(cons);

        // 6. 创建一个名为 printName 的方法，无参数，无返回值，输出 name 值
        CtMethod ctMethod = new CtMethod(CtClass.voidType, "printName", new CtClass[]{}, cc);
        ctMethod.setModifiers(Modifier.PUBLIC);
        ctMethod.setBody("{System.out.println(this.name);}");
        cc.addMethod(ctMethod);

        // 将 Person.class 文件输出到如下文件夹
        cc.writeFile("/Users/zhouying/AndroidStudioProjects/MixDemo/GradleTransformDemo/app/src/main/java/");
      	return cc;
    }


    public static void main(String[] args) {
        try {
            createPersonClass();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## 2.2、使用 Javassist 调用生成的类对象

主要有三种方式：

> 1、通过生成类时创建的 CtClass 实例对象获取 Class 对象，然后通过反射调用
>
> 2、通过读取生成类的位置生成  CtClass 实例对象，在通过 CtClass 实例对象获取 Class 对象，然后通过反射调用
>
> 3、通过定义一个新接口的方式

以上面生成的类为例，我们来调用一下它

1、通过生成类时创建的 CtClass 实例对象获取 Class 对象，然后通过反射调用

```java
public class TestCreateClass {

    //...

    //修改 main 方法
    public static void main(String[] args) {
        try {
            CtClass ctClass = createPersonClass();
            //将 ctClass 转换成 Class 对象，这样我们就可以愉快的使用反射拉
            Class<?> clazz = ctClass.toClass();
            Object o = clazz.newInstance();
            //调用 Person 的 set 方法将 name 设为：erdai666
            Method setNameMethod = clazz.getDeclaredMethod("setName",String.class);
            setNameMethod.invoke(o,"erdai666");
            //调用 printName 方法打印出来
            Method printNameMethod = clazz.getDeclaredMethod("printName");
            printNameMethod.invoke(o);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

//运行后，打印结果
erdai666
```

2、通过读取生成类的位置生成  CtClass 实例对象，在通过 CtClass 实例对象获取 Class 对象，然后通过反射调用

```java
public class TestCreateClass {
  	
    //...

    //修改 main 方法
    public static void main(String[] args) {
        try {
            ClassPool classPool = ClassPool.getDefault();
            //通过生成类的绝对位置构建 CtClass 实例对象
            classPool.appendClassPath
                    ("/Users/zhouying/AndroidStudioProjects/MixDemo/GradleTransformDemo/app/src/main/java/");
            CtClass ctClass = classPool.get("com.dream.gradletransformdemo.Person");
            //将 ctClass 转换成 Class 对象，这样我们就可以愉快的使用反射拉
            Class<?> clazz = ctClass.toClass();
            Object o = clazz.newInstance();
            //调用 Person 的 set 方法将 name 设为：erdai666
            Method setNameMethod = clazz.getDeclaredMethod("setName",String.class);
            setNameMethod.invoke(o,"erdai666");
            //调用 printName 方法打印出来
            Method printNameMethod = clazz.getDeclaredMethod("printName");
            printNameMethod.invoke(o);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

//运行后，打印结果
erdai666
```

3、通过定义一个新接口的方式

```java
interface IPerson{
    void setName(String name);

    String getName();

    void printName();
}

public class TestCreateClass {

    //...

    //修改 main 方法
    public static void main(String[] args) {
        try {
            ClassPool classPool = ClassPool.getDefault();
            //通过生成类的绝对位置构建 CtClass 实例对象
           classPool.appendClassPath
                    ("/Users/zhouying/AndroidStudioProjects/MixDemo/GradleTransformDemo/app/src/main/java/");
            //获取接口
            CtClass iPersonCtClass = classPool.get("com.dream.gradletransformdemo.IPerson");
            //获取生成的类 Person
            CtClass personCtClass = classPool.get("com.dream.gradletransformdemo.Person");
            //让 Person 实现 IPerson 接口
            personCtClass.setInterfaces(new CtClass[]{iPersonCtClass});

            //接下俩就可以通过接口进行调用了
            IPerson person = (IPerson) personCtClass.toClass().newInstance();
            person.setName("erdai666");
            person.printName();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

//运行后，打印结果
erdai666
```

## 2.3、Javassist 修改现有的类对象

一般我们会使用这种方式结合 Gradle Transform 实现对现有类的插桩

1、首先我们先创建一个 PersonService.java 的文件，内容如下：

```java
package com.dream.gradletransformdemo;

public class PersonService {
    
    public void getPerson(){
        System.out.println("get Person");
    }
    
    public void personFly(){
        System.out.println("I believe i can fly...");
    }
}
```

2、接下来使用 Javassist 对它进行修改

```java
public class TestUpdatePersonService {

    public static void main(String[] args) {
        try {
            ClassPool pool = ClassPool.getDefault();
            CtClass ctClass = pool.get("com.dream.gradletransformdemo.PersonService");

            CtMethod personFly = ctClass.getDeclaredMethod("personFly");
            //在 personFly 方法的前后插入代码
            //多行语句写法：
            //"{System.out.println(\"起飞之前准备降落伞\");System.out.println(\"起飞之前准备降落伞111\");}"
            personFly.insertBefore("System.out.println(\"起飞之前准备降落伞\");");
            personFly.insertAfter("System.out.println(\"成功落地...\");");

            //新增一个方法
            CtMethod ctMethod = new CtMethod(CtClass.voidType,"joinFriend",new CtClass[]{},ctClass);
            ctMethod.setModifiers(Modifier.PUBLIC);
            ctMethod.setBody("System.out.println(\"I want to be your friend\");");
            ctClass.addMethod(ctMethod);

            //获取类对象，接下来就可以愉快的使用反射了
            Class<?> clazz = ctClass.toClass();
            Object o = clazz.newInstance();
            //调用 personFly 方法
            Method personFlyMethod = clazz.getDeclaredMethod("personFly");
            personFlyMethod.invoke(o);
            //调用 joinFriend 方法
            Method joinFriendMethod = clazz.getDeclaredMethod("joinFriend");
            joinFriendMethod.invoke(o);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}

//运行后，打印结果
起飞之前准备降落伞
I believe i can fly...
成功落地...
I want to be your friend
```

需要**注意**的是： **上面的`insertBefore`，`insertAfter`，`setBody`中的语句，如果你是单行语句可以直接用双引号，但是有多行语句的情况下，你需要将多行语句用`{}`括起来。Javassist 只接受单个语句或用大括号括起来的语句块**

接下来我们进入实战环节

# 三、Gradle Transform + Javassist 实战

首先看下我们要解决的第一个问题：**发现某个第三方库有 bug ，用起来不爽，但又不想拿它的源码修改在重新编译，有什么好的办法？**

我的思路：**使用 Gradle Transform + Javassit 修改库里面方法的内部实现**，等于没说，😄，我们来实操一下

首先引入一个我准备好的第三方库：

在项目的根 build.gradle 加入 Jitpack 仓库：

```groovy
allprojects {
    repositories {
     	//...
        maven { url 'https://jitpack.io' }
    }
}
```

在 app 的 build.gradle 中添加如下依赖：

```groovy
implementation 'com.github.sweetying520:AndroidUtils:1.0.7'
```

ok，接着我们看下这个库中 StringUtils 的源码：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613517.png" alt="image-20221030154505788.png" width="50%" />

嗯，就两个简单的工具类，我们在 MainActivity 中使用一下：

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
	
        StringUtils.getCharArray(null)
        StringUtils.getLength(null)
    }
}
```

运行项目，你会发现 Crash 了，查看 Log 日志发现是空指针异常

检查第三方库发现这两个方法没有做空判断，传 null，程序肯定就 Crash 了，我们肯定不能允许这种事情发生，当然你可以直接修改源码后重新发布，但是这种方式太简单了，学习我们就应该不断的去挑战自己，想一些创新的思路，今天我们就站在修改字节码的角度去修复它

自定义一个 Transform 继承我们上篇文章写的 Transform 模版，使用 Javassist 进行插桩，代码如下：

```kotlin
class FixThirdLibTransform : BaseCustomTransform(true) {

    /**
     * 获取 Transform 名称
     */
    override fun getName(): String {
        return "FixThirdLibTransform"
    }

    /**
     * 只处理 StringUtils.class 文件，其他的都给过滤掉
     */
    override fun classFilter(className: String) = className.endsWith("StringUtils.class")

    /**
     * 用于过滤 Variant，返回 false 表示 Variant 不执行该 Transform
     */
    @Incubating
    override fun applyToVariant(variant: VariantInfo?): Boolean {
        return "debug" == variant?.buildTypeName
    }


    /**
     * 通过此方法进行字节码插桩
     */
    override fun provideFunction() = { input: InputStream, output: OutputStream ->
        try {
            val classPool = ClassPool.getDefault()
            val makeClass = classPool.makeClass(input)
            //对 StringUtils 的 getLength 进行插桩
            val getLengthMethod = makeClass.getDeclaredMethod("getLength")
            getLengthMethod.insertBefore("{System.out.println(\"Hello getLength bug修复了..\");if($1==null)return 0;}")

            //对 StringUtils 的 getCharArray 进行插桩
            val getCharArrayMethod = makeClass.getDeclaredMethod("getCharArray")
            getCharArrayMethod.insertBefore("{System.out.println(\"Hello getCharArray bug修复了..\");if($1==null)return new char[0];}")

            //打印 log，此 log 是 BaseCustomTransform 里面的
            log("插桩的类名：${makeClass.name}")
            makeClass.declaredMethods.forEach {
                log("插桩的方法名：$it")
            }
            output.write(makeClass.toBytecode())
            makeClass.detach()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
```

在 CustomTransformPlugin 进行插件的注册：

```kotlin
class CustomTransformPlugin: Plugin<Project> {

    override fun apply(project: Project) {
      	//...
       	
        // 1、获取 Android 扩展
        val androidExtension = project.extensions.getByType(AppExtension::class.java)
        // 2、注册 Transform
      	//...
        androidExtension.registerTransform(FixThirdLibTransform())
    }
}
```

发布一个新的插件版本，修改根 build.gradle 插件的版本，同步后重新运行 app，效果验证：

1、先看一眼我们自定义 Transform 里面的 log 打印，符合预期：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613511.png" alt="image-20221030173819432.png" width="100%" />

2、在看下 app 效果，没有奔溃，符合预期


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613162.gif" alt="ezgif.com-gif-maker.gif" width="30%" />

3、最后看一眼我们插桩的 log 日志，符合预期

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613772.png" alt="image-20221030174041379.png" width="100%" />

# 四、Gradle Transform + ASM 实战

接下来我们使用 Gradle Transform + ASM 解决第二个问题：**我想在不修改源码的情况下，统计某个方法的耗时，对某个方法做埋点，怎么做？**

就以 MainActivity 的 onCreate 方法为例子，我们统计一下 onCreate 方法的耗时

1、首先需要大家先安装一个插件：**ASM Bytecode Viewer Support Kotlin** ，这个插件能帮助我们快速的进行 ASM 字节码插桩的操作

打开 MainActivity ，看一眼 onCreate 方法插桩之前的代码：

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
	
        StringUtils.getCharArray(null)
        StringUtils.getLength(null)
    }
}
```

右键选择：ASM Bytecode Viewer


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613239.png" alt="image-20221030175737613.png" width="50%" />

会生成如下代码，选择 ASMified ，就可以看到 ASM 字节码了


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281613010.png" alt="image-20221030175957430.png" width="100%" />

**注意**：我们要操作的是 ASM 字节码，而非 Java 字节码，其实二者非常接近，只不过 ASM 字节码是用 Java 代码的形式来描述的

2、修改 MainActivity onCreate 方法代码

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        val startTime = SystemClock.elapsedRealtime()
        Log.d("erdai", "onCreate startTime: $startTime")
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        StringUtils.getCharArray(null)
        StringUtils.getLength(null)
        val endTime = SystemClock.elapsedRealtime()
        Log.d("erdai", "onCreate endTime: $endTime")
        val cost = endTime - startTime
        Log.d("erdai", "onCreate 耗时: $cost")
    }
}
```

重新查看 ASM 字节码，然后点击：Show differences ，就会出来前后两次代码的对比，绿色部分代码就是我们要添加的


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614528.png" alt="image-20221030181005402.png" width="100%" />

3、创建一个 Transform 继承 BaseTransform ，编写 ASM 代码：

```kotlin
class CostTimeTransform: BaseCustomTransform(true) {

    /**
     * 获取 Transform 名称
     */
    override fun getName(): String {
        return "CostTimeTransform"
    }
  
    /**
     * 过滤只统计以 Activity.class 结尾的文件
     */
    override fun classFilter(className: String) = className.endsWith("Activity.class")
    
    /**
     * 用于过滤 Variant，返回 false 表示 Variant 不执行该 Transform
     */
    @Incubating
    override fun applyToVariant(variant: VariantInfo?): Boolean {
        return "debug" == variant?.buildTypeName
    }

    /**
     * 通过此方法进行字节码插桩
     */
    override fun provideFunction() = { input: InputStream,output: OutputStream ->
        //使用 input 输入流构建 ClassReader
        val reader = ClassReader(input)
        //使用 ClassReader 和 flags 构建 ClassWriter
        val writer = ClassWriter(reader, ClassWriter.COMPUTE_FRAMES)
        //使用 ClassWriter 构建我们自定义的 ClassVisitor
        val visitor = CostTimeClassVisitor(writer)
        //最后通过 ClassReader 的 accept 将每一条字节码指令传递给 ClassVisitor
        reader.accept(visitor, ClassReader.SKIP_DEBUG or  ClassReader.SKIP_FRAMES)
        //将修改后的字节码文件转换成字节数组
        val byteArray = writer.toByteArray()
        //最后通过输出流修改文件，这样就实现了字节码的插桩
        output.write(byteArray)
    }
}
```

4、核心逻辑的处理是在我们自定义的 ClassVisitor 中：

```kotlin
package com.dream.customtransformplugin

import org.objectweb.asm.*
import org.objectweb.asm.commons.AdviceAdapter


class CostTimeClassVisitor(nextVisitor: ClassVisitor) : ClassVisitor(Opcodes.ASM6,nextVisitor) {

    override fun visitMethod(
        access: Int,
        name: String?,
        descriptor: String?,
        signature: String?,
        exceptions: Array<out String>?
    ): MethodVisitor {
        val visitor = super.visitMethod(access, name, descriptor, signature, exceptions)
        // AdviceAdapter 是 MethodVisitor 的子类，使用 AdviceAdapter 可以更方便的修改方法的字节码。
        // AdviceAdapter其中几个重要方法如下：
        // void visitCode()：表示 ASM 开始扫描这个方法
        // void onMethodEnter()：进入这个方法
        // void onMethodExit()：即将从这个方法出去
        // void onVisitEnd()：表示方法扫描完毕
        return object : AdviceAdapter(Opcodes.ASM6, visitor, access, name, descriptor) {

            //在原方法代码的前面插入代码
            override fun onMethodEnter() {
                visitMethodInsn(INVOKESTATIC, "android/os/SystemClock", "elapsedRealtime", "()J", false)
                visitVarInsn(LSTORE, 2)
                visitLdcInsn("erdai")
                visitTypeInsn(NEW, "java/lang/StringBuilder")
                visitInsn(DUP)
                visitMethodInsn(INVOKESPECIAL, "java/lang/StringBuilder", "<init>", "()V", false)
                visitLdcInsn("onCreate startTime: ")
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;", false)
                visitVarInsn(LLOAD, 2)
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(J)Ljava/lang/StringBuilder;", false)
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "toString", "()Ljava/lang/String;", false)
                visitMethodInsn(INVOKESTATIC, "android/util/Log", "d", "(Ljava/lang/String;Ljava/lang/String;)I", false)
                visitInsn(POP)
            }

            //在原方法代码的后面插入代码
            override fun onMethodExit(opcode: Int) {
                visitMethodInsn(INVOKESTATIC, "android/os/SystemClock", "elapsedRealtime", "()J", false)
                visitVarInsn(LSTORE, 4)
                visitLdcInsn("erdai")
                visitTypeInsn(NEW, "java/lang/StringBuilder")
                visitInsn(DUP)
                visitMethodInsn(INVOKESPECIAL, "java/lang/StringBuilder", "<init>", "()V", false)
                visitLdcInsn("onCreate endTime: ")
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;", false)
                visitVarInsn(LLOAD, 4)
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(J)Ljava/lang/StringBuilder;", false)
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "toString", "()Ljava/lang/String;", false)
                visitMethodInsn(INVOKESTATIC, "android/util/Log", "d", "(Ljava/lang/String;Ljava/lang/String;)I", false)
                visitInsn(POP)
                visitVarInsn(LLOAD, 4)
                visitVarInsn(LLOAD, 2)
                visitInsn(LSUB)
                visitVarInsn(LSTORE, 6)
                visitLdcInsn("erdai")
                visitTypeInsn(NEW, "java/lang/StringBuilder")
                visitInsn(DUP)
                visitMethodInsn(INVOKESPECIAL, "java/lang/StringBuilder", "<init>", "()V", false)
                visitLdcInsn("onCreate \u8017\u65f6: ")
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;", false)
                visitVarInsn(LLOAD, 6)
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(J)Ljava/lang/StringBuilder;", false)
                visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "toString", "()Ljava/lang/String;", false)
                visitMethodInsn(INVOKESTATIC, "android/util/Log", "d", "(Ljava/lang/String;Ljava/lang/String;)I", false)
                visitInsn(POP)
            }
        }
```

这样我们在 Activity 中插入方法的耗时就已经完成了，但是会面临一个问题：**刚说的 Activity 是所有的 Activity 包括系统的**，**方法是所有的方法** ，这种效果肯定不是我想要的，而且还可能会出问题，因此我们这里可以加一个自定义注解去控制一下，只统计添加了注解方法的耗时

5、在主工程中创建一个自定义注解

```kotlin
package com.dream.gradletransformdemo.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自定义方法耗时注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CostTime {

}
```

6、接着对 CostTimeClassVisitor 代码进行修改：

```kotlin
class CostTimeClassVisitor(nextVisitor: ClassVisitor) : ClassVisitor(Opcodes.ASM6,nextVisitor) {
    //是否需要被 hook
    var isHook = false

    override fun visitMethod(
        access: Int,
        name: String?,
        descriptor: String?,
        signature: String?,
        exceptions: Array<out String>?
    ): MethodVisitor {
        val visitor = super.visitMethod(access, name, descriptor, signature, exceptions)
        return object : AdviceAdapter(Opcodes.ASM6, visitor, access, name, descriptor) {
						
            /**
             * 访问自定义注解
             */
            override fun visitAnnotation(descriptor: String, visible: Boolean): AnnotationVisitor? {
              	//如果添加了自定义注解，则进行 hook
                if ("Lcom/dream/gradletransformdemo/annotation/CostTime;" == descriptor) {
                    isHook = true
                }
                return super.visitAnnotation(descriptor, visible)
            }

            //在原方法代码的前面插入代码
            override fun onMethodEnter() {
                if(!isHook)return
              	//...
                
            }

            //在原方法代码的后面插入代码
            override fun onMethodExit(opcode: Int) {
                if(!isHook)return
                //...
            }
        }
    }
}
```

ok，至此，我们自定义 Gradle Transform 就编写完成了

在 CustomTransformPlugin 进行插件的注册：

```kotlin
class CustomTransformPlugin: Plugin<Project> {

    override fun apply(project: Project) {
      	//...
       	
        // 1、获取 Android 扩展
        val androidExtension = project.extensions.getByType(AppExtension::class.java)
        // 2、注册 Transform
      	//...
        androidExtension.registerTransform(CostTimeTransform())
    }
}
```

发布一个新的插件版本，修改根 build.gradle 插件的版本，同步后重新运行 app，效果验证：

1、看控制台 log 日志打印，符合预期：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614728.png" alt="image-20221030194559152.png" width="100%" />

2、接着通过反编译工具看下我们插桩后的 MainActivity ，符合预期：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614689.png" alt="image-20221030194522742.png" width="50%" />

# 五、AGP 8.0 版本关于 Gradle Transform 的替换方案

Google 在 AGP 8.0 会将 Gradle Transform 给移除，因此如果项目升级了 AGP 8.0，就需要做好 Gradle Transform 的兼容。

`Gradle Transform`被废弃之后，它的代替品是`Transform Action`，`Transform API`是由`AGP`提供的，而`Transform Action`则是由Gradle 提供。不光是 `AGP` 需要 `Transform`，`Java` 也需要，所以由 `Gradle` 来提供统一的 `Transform API` 也合情合理，关于 `Transform Action`不打算介绍，有兴趣的可以去看这篇文章[Transform 被废弃，TransformAction 了解一下~](https://juejin.cn/post/7131889789787176974)

我们主要介绍一下 AGP 给我们提供的 `AsmClassVisitorFactory`

## 5.1、AsmClassVisitorFactory 介绍

1、AsmClassVisitorFactory 就好比我们之前写的自定义 Transform 模版，只不过现在是由官方提供了，里面做了大量的封装：输入文件遍历、加解压、增量，并发等，简化我们的一个使用。根据官方的说法，AsmClassVisitoFactory 会带来约18%的性能提升，同时可以减少约 5 倍代码。

2、另外从命名也可以看出，Google 更加推荐我们使用 ASM 进行字节码的插桩

## 5.2、AsmClassVisitorFactory 使用

接下来我们就替换一下 Gradle Transform + ASM 的实现方案，使用 AsmClassVisitorFactory 真的是非常简单：

1、自定义一个抽象类继承 AsmClassVisitorFactory，然后 createClassVisitor 方法返回之前写的 CostTimeClassVisitor 即可

```kotlin
package com.dream.customtransformplugin.foragp8

import com.android.build.api.instrumentation.*
import com.dream.customtransformplugin.costtime.CostTimeClassVisitor
import org.objectweb.asm.ClassVisitor


abstract class CostTimeASMFactory: AsmClassVisitorFactory<InstrumentationParameters.None> {
    override fun createClassVisitor(
        classContext: ClassContext,
        nextClassVisitor: ClassVisitor
    ): ClassVisitor {
        return CostTimeClassVisitor(nextClassVisitor)
    }

    override fun isInstrumentable(classData: ClassData): Boolean {
        return true
    }
}
```

2、接下来在 CustomTransformPlugin 进行注册，注册使用了一种新的方式：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614713.png" alt="image-20221030202421200.png" width="100%" />

3、发布一个新的插件版本，修改根 build.gradle 插件的版本，同步后重新运行 app，效果是一样的

一些不同点：

1、编译任务的 Task 名称变了：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614622.png" alt="image-20221030202805807.png" width="100%" />

2、我们编译生成的中间产物有了 Asm 相关的文件夹，方便我们一个效果的验证

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281614023.png" alt="image-20221030203100651.png" width="50%" />

**需要注意的是**： Kotlin 文件看不到插桩的代码，淦😯

# 六、总结

本篇文章我们介绍了：

1、ASM Visitor Api 中的几个核心类：

> 1、ClassVisitor
>
> 2、ClassReader
>
> 3、ClassWriter

2、Javassist 相关语法，使用起来接近原生的反射 Api ，比较容易上手

3、自定义 GradleTransform + Javassist 实现了修改第三方库的源码

4、自定义 GradleTransform + ASM 实现了 MainActivity onCreate 方法耗时的统计

5、介绍了 AGP 8.0 Gradle Transform 被移除后使用 AsmClassVisitorFactory 进行适配，过程非常简单

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

[Github Demo 地址](https://github.com/sweetying520/GradleTransformDemo) , 大家可以结合 demo 一起看，效果杠杠滴🍺

**感谢你阅读这篇文章**

## 参考和推荐

[Gradle Transform + ASM 探索](https://rebooters.github.io/2020/01/04/Gradle-Transform-ASM-%E6%8E%A2%E7%B4%A2/)

[Transform 被废弃，TransformAction 了解一下~](https://juejin.cn/post/7131889789787176974)

[Transform 被废弃，ASM 如何适配?](https://juejin.cn/post/7105925343680135198#heading-2)

[javassist详解](https://juejin.cn/post/7078681608206680094#heading-3)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](https://link.juejin.cn/?target=http%3A%2F%2Fm6z.cn%2F6jwi7b "http://m6z.cn/6jwi7b") ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
