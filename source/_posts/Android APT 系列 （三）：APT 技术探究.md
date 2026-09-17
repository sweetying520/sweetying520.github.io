---
title: Android APT 系列 （三）：APT 技术探究
date: 2022-10-10 17:54:47
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281546539.jpeg
tags: 
- 原创
- Android
- Android APT
categories:
- Android
- APT
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281546539.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们对注解进行了讲解，还没有看过上一篇文章的朋友，建议先去阅读 [Android APT 系列 （二）：APT 筑基之注解](https://juejin.cn/post/6978293956450713630)。至此，关于 Apt 基础部分我们都讲完了，接下来就正式进入 APT 技术的学习

[Github Demo 地址](https://github.com/sweetying520/AptDemo) , 大家可以看 Demo 跟随我的思路一起分析

## 一、APT 介绍

### 1）、什么是 APT ?

APT 全称 `Annotation Processing Tool`，翻译过来即注解处理器。引用官方一段对 APT 的介绍：**APT 是一种处理注释的工具, 它对源代码文件进行检测找出其中的注解，并使用注解进行额外的处理。**

### 2）、APT 有什么用？

APT 能在编译期根据编译阶段注解，给我们自动生成代码，简化使用。很多流行框架都使用到了 APT 技术，如 ButterKnife，Retrofit，Arouter，EventBus 等等

## 二、APT 工程

### 1）、APT 工程创建

一般情况下，APT 大致的的一个实现过程：

1、创建一个 `Java Module` ，用来编写注解

2、创建一个 `Java Module` ，用来读取注解信息，并根据指定规则，生成相应的类文件

3、创建一个 `Android Module` ，通过反射获取生成的类，进行合理的封装，提供给上层调用

如下图：

![image-20210627182425586](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281546060.png)

这是我的 APT 工程，关于 Module 名称可以任意取，按照我上面说的规则去进行就好了

### 2）、Module 依赖

工程创建好后，我们就需要理清楚各个 Module 之间的一个依赖关系：

1、因为 `apt-processor` 要读取 `apt-annotation` 的注解，所以 `apt-processor` 需要依赖 `apt-annotation` 

```java
//apt-processor 的 build.gradle 文件
dependencies {
    implementation project(path: ':apt-annotation')
}
```

2、app 作为调用层，以上 3 个 Module 都需要进行依赖

```java
//app 的 build.gradle 文件
dependencies {
    //...
    implementation project(path: ':apt-api')
    implementation project(path: ':apt-annotation')
    annotationProcessor project(path: ':apt-processor')
}
```

APT 工程配置好之后，我们就可以对各个 Module 进行一个具体代码的编写了

## 三、apt-annotation 注解编写

这个 Module 的处理相对来说很简单，就是编写相应的自定义注解就好了，我编写的如下：

```java
@Inherited
@Documented
@Retention(RetentionPolicy.SOURCE)
@Target({ElementType.TYPE,ElementType.METHOD})
public @interface AptAnnotation {
    String desc() default "";
}
```

## 四、apt-processor 自动生成代码

这个 Module 相对来说比较复杂，我们把它分为以下 3 个步骤：

1、注解处理器声明

2、注解处理器注册

3、注解处理器生成类文件

### 1）、注解处理器声明

#### 1、新建一个类，类名按照自己的喜好取，继承 `javax.annotation.processing` 这个包下的 AbstractProcessor 类并实现其抽象方法

```java
public class AptAnnotationProcessor extends AbstractProcessor {
  
    /**
     * 编写生成 Java 类的相关逻辑
     *
     * @param set              支持处理的注解集合
     * @param roundEnvironment 通过该对象查找指定注解下的节点信息
     * @return true: 表示注解已处理，后续注解处理器无需再处理它们；false: 表示注解未处理，可能要求后续注解处理器处理
     */
    @Override
    public boolean process(Set<? extends TypeElement> set, RoundEnvironment roundEnvironment) {
        return false;
    }
}
```

重点看下第一个参数中的 TypeElement ，这个就涉及到 Element 的知识，我们简单的介绍一下：

**Element 介绍**

实际上，Java 源文件是一种结构体语言，源代码的每一个部分都对应了一个特定类型的 Element ，例如包，类，字段，方法等等：

```java
package com.dream;         // PackageElement：包元素

public class Main<T> {     // TypeElement：类元素; 其中 <T> 属于 TypeParameterElement 泛型元素

    private int x;         // VariableElement：变量、枚举、方法参数元素

    public Main() {        // ExecuteableElement：构造函数、方法元素
    }
}
```

Java 的 Element 是一个接口，源码如下：

```java
public interface Element extends javax.lang.model.AnnotatedConstruct {
    // 获取元素的类型，实际的对象类型
    TypeMirror asType();
    // 获取Element的类型，判断是哪种Element
    ElementKind getKind();
    // 获取修饰符，如public static final等关键字
    Set<Modifier> getModifiers();
    // 获取类名
    Name getSimpleName();
    // 返回包含该节点的父节点，与getEnclosedElements()方法相反
    Element getEnclosingElement();
    // 返回该节点下直接包含的子节点，例如包节点下包含的类节点
    List<? extends Element> getEnclosedElements();

    @Override
    boolean equals(Object obj);
  
    @Override
    int hashCode();
  
    @Override
    List<? extends AnnotationMirror> getAnnotationMirrors();
  
    //获取注解
    @Override
    <A extends Annotation> A getAnnotation(Class<A> annotationType);
  
    <R, P> R accept(ElementVisitor<R, P> v, P p);
}
```

我们可以通过 Element 获取如上一些信息（写了注释的都是一些常用的）

由 Element 衍生出来的扩展类共有 5 种：

1、PackageElement 表示一个包程序元素

2、TypeElement 表示一个类或者接口程序元素

3、TypeParameterElement 表示一个泛型元素

4、VariableElement 表示一个字段、enum 常量、方法或者构造方法的参数、局部变量或异常参数

5、ExecuteableElement 表示某个类或者接口的方法、构造方法或初始化程序（静态或者实例）

可以发现，Element 有时会代表多种元素，例如 TypeElement 代表类或接口，此时我们可以通过 element.getKind() 来区分：

```java
Set<? extends Element> elements = roundEnvironment.getElementsAnnotatedWith(AptAnnotation.class);
for (Element element : elements) {
    if (element.getKind() == ElementKind.CLASS) {
        // 如果元素是类

    } else if (element.getKind() == ElementKind.INTERFACE) {
        // 如果元素是接口

    }
}
```

ElementKind 是一个枚举类，它的取值有很多，如下：

```java
PACKAGE	//表示包
ENUM //表示枚举
CLASS //表示类
ANNOTATION_TYPE	//表示注解
INTERFACE //表示接口
ENUM_CONSTANT //表示枚举常量
FIELD //表示字段
PARAMETER //表示参数
LOCAL_VARIABLE //表示本地变量
EXCEPTION_PARAMETER //表示异常参数
METHOD //表示方法
CONSTRUCTOR //表示构造函数
OTHER //表示其他
```

关于 Element 就介绍到这，我们接着往下看

#### 2、重写方法解读

除了必须实现的这个抽象方法，我们还可以重写其他 4 个常用的方法，如下：

```java
public class AptAnnotationProcessor extends AbstractProcessor {
    //...
  
    /** 
     * 节点工具类（类、函数、属性都是节点）
     */
    private Elements mElementUtils;

    /** 
     * 类信息工具类
     */
    private Types mTypeUtils;

    /**
     * 文件生成器
     */
    private Filer mFiler;

    /**
     * 日志信息打印器
     */
    private Messager mMessager;
  
    /**
     * 做一些初始化的工作
     * 
     * @param processingEnvironment 这个参数提供了若干工具类，供编写生成 Java 类时所使用
     */
    @Override
    public synchronized void init(ProcessingEnvironment processingEnv) {
        super.init(processingEnv);
        mElementUtils = processingEnv.getElementUtils();
        mTypeUtils = processingEnv.getTypeUtils();
        mFiler = processingEnv.getFiler();
        mMessager = processingEnv.getMessager();
    }
  
    /**
     * 接收外来传入的参数，最常用的形式就是在 build.gradle 脚本文件里的 javaCompileOptions 的配置
     *
     * @return 属性的 Key 集合
     */
    @Override
    public Set<String> getSupportedOptions() {
        return super.getSupportedOptions();
    }

    /**
     * 当前注解处理器支持的注解集合，如果支持，就会调用 process 方法
     *
     * @return 支持的注解集合
     */
    @Override
    public Set<String> getSupportedAnnotationTypes() {
        return super.getSupportedAnnotationTypes();
    }
		
    /**
     * 编译当前注解处理器的 JDK 版本
     *
     * @return JDK 版本
     */
    @Override
    public SourceVersion getSupportedSourceVersion() {
        return super.getSupportedSourceVersion();
    }
}
```

**注意**：`getSupportedAnnotationTypes()`、`getSupportedSourceVersion()`和`getSupportedOptions()` 这三个方法，我们还可以采用注解的方式进行提供：

```java
@SupportedOptions("MODULE_NAME")
@SupportedAnnotationTypes("com.dream.apt_annotation.AptAnnotation")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class AptAnnotationProcessor extends AbstractProcessor {
    //...
}
```

### 2）、注解处理器注册

注解处理器声明好了，下一步我们就要注册它，其中注册有两种方式：

1、手动注册

2、自动注册

手动注册比较繁琐固定且容易出错，不推荐使用，这里就不讲了。我们主要看下自动注册

#### 自动注册

1、首先我们要在 `apt-processor`这个 Module 下的 build.gradle 文件导入如下依赖：

```java
implementation 'com.google.auto.service:auto-service:1.0-rc6'
annotationProcessor 'com.google.auto.service:auto-service:1.0-rc6'
```

**注意**：这两句必须都要加，否则注册不成功，我之前踩坑了

2、在注解处理器上加上 `@AutoService(Processor.class)` 即可完成注册

```java
@AutoService(Processor.class)
public class AptAnnotationProcessor extends AbstractProcessor {
    //...
}
```

### 3）、注解处理器生成类文件

注册完成之后，我们就可以正式编写生成 Java 类文件的代码了，其中生成也有两种方式：

1、常规的写文件方式

2、通过 javapoet 框架来编写

1 的方式比较死板，需要把每一个字母都写上，不推荐使用，这里就不讲了。我们主要看下通过 javapoet 这个框架生成 Java 类文件

####  javapoet 方式

这种方式更加符合面向对象编码的一个风格，对 javapoet 还不熟的朋友，可以去 github 上学习一波 [传送门](https://github.com/square/javapoet)，这里我们介绍一下它常用的一些类：

> TypeSpec：用于生成类、接口、枚举对象的类
>
> MethodSpec：用于生成方法对象的类
>
> ParameterSpec：用于生成参数对象的类
>
> AnnotationSpec：用于生成注解对象的类
>
> FieldSpec：用于配置生成成员变量的类
>
> ClassName：通过包名和类名生成的对象，在JavaPoet中相当于为其指定 Class
>
> ParameterizedTypeName：通过 MainClass 和 IncludeClass 生成包含泛型的 Class
>
> JavaFile：控制生成的 Java 文件的输出的类

##### 1、导入 javapoet 框架依赖

```java
implementation 'com.squareup:javapoet:1.13.0'
```

##### 2、按照指定代码模版生成 Java 类文件

例如，我在 app 的 build.gradle 下进行了如下配置：

```groovy
android {
    //...
    defaultConfig {
        //...
        javaCompileOptions {
            annotationProcessorOptions {
                arguments = [MODULE_NAME: project.getName()]
            }
        }
    }
}
```

在 MainActivity 下面进行了如下注解：

![image-20210627212604288](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281547581.png)

我希望生成的代码如下：

![image-20210627220320906](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281547808.png)

现在我们来实操一下：

```java
@AutoService(Processor.class)
@SupportedOptions("MODULE_NAME")
@SupportedAnnotationTypes("com.dream.apt_annotation.AptAnnotation")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class AptAnnotationProcessor extends AbstractProcessor {
		
    //文件生成器
    Filer filer;
    //模块名
    private String mModuleName;

    @Override
    public synchronized void init(ProcessingEnvironment processingEnvironment) {
        super.init(processingEnvironment);
      	//初始化文件生成器
        filer = processingEnvironment.getFiler();
      	//通过 key 获取 build.gradle 中对应的 value
        mModuleName = processingEnv.getOptions().get("MODULE_NAME");
    }

    @Override
    public boolean process(Set<? extends TypeElement> set, RoundEnvironment roundEnvironment) {
        if (set == null || set.isEmpty()) {
            return false;
        }
				
      	//获取当前注解下的节点信息
        Set<? extends Element> rootElements = roundEnvironment.getElementsAnnotatedWith(AptAnnotation.class);

        // 构建 test 函数
        MethodSpec.Builder builder = MethodSpec.methodBuilder("test")
                .addModifiers(Modifier.PUBLIC) // 指定方法修饰符
                .returns(void.class) // 指定返回类型
                .addParameter(String.class, "param"); // 添加参数
        builder.addStatement("$T.out.println($S)", System.class, "模块: " + mModuleName);

        if (rootElements != null && !rootElements.isEmpty()) {
            for (Element element : rootElements) {
              	//当前节点名称
                String elementName = element.getSimpleName().toString();
              	//当前节点下注解的属性
                String desc = element.getAnnotation(AptAnnotation.class).desc();
                // 构建方法体
                builder.addStatement("$T.out.println($S)", System.class, 
                                     "节点: " + elementName + "  " + "描述: " + desc);
            }
        }
        MethodSpec main =builder.build();

        // 构建 HelloWorld 类
        TypeSpec helloWorld = TypeSpec.classBuilder("HelloWorld")
                .addModifiers(Modifier.PUBLIC) // 指定类修饰符
                .addMethod(main) // 添加方法
                .build();

        // 指定包路径，构建文件体
        JavaFile javaFile = JavaFile.builder("com.dream.aptdemo", helloWorld).build();
        try {
            // 创建文件
            javaFile.writeTo(filer);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return true;
    }
}
```

经过上面这些步骤，我们运行 App 就能生成上面截图的代码了，现在还差最后一步，对生成的代码进行使用

**注意**：不同版本的 Gradle 生成的类文件位置可能不一样，我的 Gradle 版本是 6.7.1，生成的类文件在如下位置：

![image-20210627221836736](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281547757.png)

一些低版本的 Gradle 生成的类文件在 `/build/generated/source` 这个目录下

## 五、apt-api 调用生成代码完成业务功能

这个 Module 的操作相对来说也比较简单，就是通过反射获取到生成的类，进行相应的封装使用即可，我的编写如下：

```java
public class MyAptApi {

    @SuppressWarnings("all")
    public static void init() {
        try {
            Class c = Class.forName("com.dream.aptdemo.HelloWorld");
            Constructor declaredConstructor = c.getDeclaredConstructor();
            Object o = declaredConstructor.newInstance();
            Method test = c.getDeclaredMethod("test", String.class);
            test.invoke(o, "");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

接着我们在 MainActivity 的 oncreate 方法里面进行调用：

```java
@AptAnnotation(desc = "我是 MainActivity 上面的注解")
public class MainActivity extends AppCompatActivity {
  
    @AptAnnotation(desc = "我是 onCreate 上面的注解")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        MyAptApi.init();
    }
}
//打印结果
模块: app
节点: MainActivity  描述: 我是 MainActivity 上面的注解
节点: onCreate  描述: 我是 onCreate 上面的注解
```

## 六、总结

本篇文章讲的一些重点内容：

1、APT 工程所需创建的不同种类的 Module 及 Module 之间的依赖关系

2、Java 源文件实际上是一种结构体语言，源代码的每一个部分都对应了一个特定类型的 Element

3、采用 auto-service 对注解处理器进行自动注册

4、采用 javapoet 框架编写所需生成的 Java 类文件

5、通过反射及适当的封装，将生成的类的功能提供给上层调用

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝 

**感谢你阅读这篇文章**

### 下篇预告

下篇文章我会讲我是如何应用 APT 技术实现反射创建 View 的一个替换，敬请期待吧😄

### 参考和推荐

[Android注解处理器APT技术探究](https://juejin.cn/post/6963873016220663844#comment)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
