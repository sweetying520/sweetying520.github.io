---
title: Android APT 系列 （四）：APT 实战应用
date: 2022-10-10 17:54:49
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281547349.jpeg
tags: 
- 原创
- Android
- Android APT
categories:
- Android
- APT
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281547349.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们对 APT 技术进行了讲解，还没有看过上一篇文章的朋友，建议先去阅读 [Android APT 系列 （三）：APT 技术探究](https://juejin.cn/post/6978500975770206239)。接下来，我们就使用 APT 技术来进行实战应用。

[Github Demo 地址](https://github.com/sweetying520/AptDemo) , 大家可以看 Demo 跟随我的思路一起分析

## 回顾

在本系列的开篇，我讲了在项目实践过程中做的一个布局优化，Android 中少量的系统控件是通过 `new` 的方式创建出来的，而大部分控件如 `androidx.appcompat.widget` 下的控件，自定义控件，第三方控件等等，都是通过反射创建的。大量的反射创建多多少少会带来一些性能问题，因此我们需要去解决反射创建的问题，我的解决思路是：

> 1、通过编写 Android 插件获取 Xml 布局中的所有控件 
>
> 2、拿到控件后，通过 APT 生成用 `new` 的方式创建 View 的类 
>
> 3、最后通过反射获取当前类并在基类里面完成替换

## 一、准备 Android 插件生成的文件

其中 1 的具体流程是：通过 Android 插件获取所有 Xml 布局中的控件名称，并写入到一个`.txt`文件中，因 Gradle 系列还没讲，这里我们假设所有的控件名称已经写入到`.txt`文件，如下：

![image-20210629191446005](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281547109.png)

上述文件我们可以看到：

1、一些不带 `.` 的系统控件，如 TextView，ImageView 。系统会默认给我们通过 `new` 的方式去创建，且替换为了`androidx.appcompat.widget`包下的控件，例如：TextView -> AppCompatTextView ，ImageView -> AppCompatImageView 

2、带 `.` 的控件。可能为 `androidx.appcompat.widget` 下的控件，自定义控件，第三方控件等等，这些控件如果我们不做处理，系统会通过反射去创建。因此我们主要是针对这些控件去做处理

**注意**：我这里在根目录下创建了一个 `all_view_name.txt` 的文件，然后放入了一些 View 的名称，这里只是方便我们演示。实际上用 Android 插件去生成的文件我们一般会指定放在 app 的 `/build`目录下，这样我们在 clean 的时候就能顺带把它给干掉

现在 1 完成了，接下来 2 和 3 就回到了我们熟悉的 APT 流程，我们需要读取该文件，通过 APT 生成相应的类，最后使用这个类的功能就 OK 了，还不熟悉 APT 的，先去学习一波 [传送门](https://juejin.cn/post/6978500975770206239) 

还是基于上篇文章的工程进行实操，为了方便后续流程的讲解，我还是贴出上篇文章的工程图：

![image-20210627182425586](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281547641.png)

## 二、apt-annotation 注解编写

编写注解，如下：

```java
@Inherited
@Documented
@Retention(RetentionPolicy.CLASS)
@Target(ElementType.TYPE)
public @interface ViewCreator {
    
}
```

## 三、规定生成的类模版，为后续自动生成代码做准备

在实际工作中，我们一般会这么做：

1、将需要生成的类文件实现某个定义好的接口，通过接口代理来使用

2、规定生成的 Java 类模版，根据模版去进行生成代码逻辑的编写

### 1、将需要生成的类文件实现某个定义好的接口，通过接口代理来使用

关于接口，我们一般会放到 `apt-api` 这个 Module 中

### 2、规定生成的 Java 类模版，根据模版去进行生成代码逻辑的编写

假设我们需要生成的 Java 类模版如下：

```java
package com.dream.aptdemo;

public class MyViewCreatorImpl implements IMyViewCreator {
  @Override
  public View createView(String name, Context context, AttributeSet attr) {
    View view = null;
    switch(name) {
      case "androidx.core.widget.NestedScrollView":
      	view = new NestedScrollView(context,attr);
      	break;
      case "androidx.constraintlayout.widget.ConstraintLayout":
      	view = new ConstraintLayout(context,attr);
      	break;
      case "androidx.appcompat.widget.ButtonBarLayout":
      	view = new ButtonBarLayout(context,attr);
      	break;
        //...
      default:
      	break;
    }
    return view;
}
```

根据上面这些信息，我们就可以进行自动生成代码逻辑的编写了

## 四、apt-processor 自动生成代码

这里你就对着上面给出的代码模版，通过 javapoet 框架编写相应的代码生成逻辑即可，对 `javapoet` 不熟的赶紧去学习一波 [传送门](https://github.com/square/javapoet)

```java
@AutoService(Processor.class)
@SupportedAnnotationTypes("com.dream.apt_annotation.ViewCreator")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MyViewCreatorProcessor extends AbstractProcessor {

    /**文件生成器*/
    private Filer mFiler;

    @Override
    public synchronized void init(ProcessingEnvironment processingEnv) {
        super.init(processingEnv);
        mFiler = processingEnv.getFiler();
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        //从文件中读取控件名称，并转换成对应的集合
        Set<String> mViewNameSet = readViewNameFromFile();
        //如果获取的控件名称集合为空，则终止流程
        if(mViewNameSet == null || mViewNameSet.isEmpty()){
            return false;
        }
      
        //获取使用了注解的元素
        Set<? extends Element> elementsAnnotatedWith = roundEnv.getElementsAnnotatedWith(ViewCreator.class);
        for (Element element : elementsAnnotatedWith) {
            System.out.println("Hello " + element.getSimpleName() + ", 欢迎使用 APT");
            startGenerateCode(mViewNameSet);
            //如果有多个地方标注了注解，我们只读取第一次的就行了
            break;
        }
        return true;
    }

    /**
     * 开始执行生成代码的逻辑
     *
     * @param mViewNameSet 控件名称集合
     */
    private void startGenerateCode(Set<String> mViewNameSet) {
        System.out.println("开始生成 Java 类...");
        System.out.println("a few moment later...");
        //=================================== 构建方法 start ======================================
        //1、构建方法：方法名，注解，修饰符，返回值，参数

        ClassName viewType = ClassName.get("android.view","View");
        MethodSpec.Builder methodBuilder = MethodSpec
                //方法名
                .methodBuilder("createView")
                //注解
                .addAnnotation(Override.class)
                //修饰符
                .addModifiers(Modifier.PUBLIC)
                //返回值
                .returns(viewType)
                //第一个参数
                .addParameter(String.class,"name")
                //第二个参数
                .addParameter(ClassName.get("android.content","Context"),"context")
                //第三个参数
                .addParameter(ClassName.get("android.util","AttributeSet"),"attr");

        //2、构建方法体
        methodBuilder.addStatement("$T view = null",viewType);
        methodBuilder.beginControlFlow("switch(name)");
        //循环遍历控件名称集合
        for (String viewName : mViewNameSet) {
            //针对包含 . 的控件名称进行处理
            if(viewName.contains(".")){
                //分离包名和控件名，如：androidx.constraintlayout.widget.ConstraintLayout
                //packageName：androidx.constraintlayout.widget
                //simpleViewName：ConstraintLayout
                String packageName = viewName.substring(0,viewName.lastIndexOf("."));
                String simpleViewName = viewName.substring(viewName.lastIndexOf(".") + 1);
                ClassName returnType = ClassName.get(packageName, simpleViewName);

                methodBuilder.addCode("case $S:\n",viewName);
                methodBuilder.addStatement("\tview = new $T(context,attr)", returnType);
                methodBuilder.addStatement("\tbreak");
            }
        }
        methodBuilder.addCode("default:\n");
        methodBuilder.addStatement("\tbreak");
        methodBuilder.endControlFlow();
        methodBuilder.addStatement("return view");

        MethodSpec createView = methodBuilder.build();
        //=================================== 构建方法 end ======================================

        //=================================== 构建类 start ======================================
        TypeSpec myViewCreatorImpl = TypeSpec.classBuilder("MyViewCreatorImpl")
                //类修饰符
                .addModifiers(Modifier.PUBLIC)
                //实现接口
                .addSuperinterface(ClassName.get("com.dream.apt_api", "IMyViewCreator"))
                //添加方法
                .addMethod(createView)
                .build();
        //=================================== 构建类 end ========================================

        //=================================== 指定包路径，构建文件体 start =========================
        //指定类包路径
        JavaFile javaFile = JavaFile.builder("com.dream.aptdemo",myViewCreatorImpl).build();
        //生成文件
        try {
            javaFile.writeTo(mFiler);
            System.out.println("生成成功...");
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("生成失败...");
        }
        //=================================== 指定包路径，构建文件体 end ============================
    }

    /**
     * 从文件中读取控件名称，并转换成对应的集合
     */
    private Set<String> readViewNameFromFile() {
        try {
            //获取存储控件名称的文件
            File file = new File("/Users/zhouying/AndroidStudioProjects/AptDemo/all_view_name.txt");
            Properties config = new Properties();
            config.load(new FileInputStream(file));
            //获取控件名称集合
            return config.stringPropertyNames();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

上述生成代码的逻辑写了详细的注释，主要就是对 `javapoet` 框架的一个应用

代码生成好了，接下来就需要提供给上层使用

## 五、apt-api 业务封装供上层使用

### 1、定义一个接口， `apt-api` 和 `apt-processor` 都会使用到

```java
//定义一个接口
public interface IMyViewCreator {
    /**
     * 通过 new 的方式创建 View
     *
     * @param name 控件名称
     * @param context 上下文
     * @param attributeSet 属性
     */
    View createView(String name, Context context, AttributeSet attributeSet);
}
```

### 2、反射获取生成的类，提供相应的代理类供上层调用

```java
public class MyViewCreatorDelegate implements IMyViewCreator{
    
    private IMyViewCreator mIMyViewCreator;
    
    //================================== 单例 start =====================================
    @SuppressWarnings("all")
    private MyViewCreatorDelegate(){
        try {
            // 通过反射拿到 Apt 生成的类
            Class aClass = Class.forName("com.dream.aptdemo.MyViewCreatorImpl");
            mIMyViewCreator = (IMyViewCreator) aClass.newInstance();
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    public static MyViewCreatorDelegate getInstance(){
        return Holder.MY_VIEW_CREATOR_DELEGATE;
    }

    private static final class Holder{
        private static final MyViewCreatorDelegate MY_VIEW_CREATOR_DELEGATE = new MyViewCreatorDelegate();
    }
    //================================== 单例 end =======================================


    /**
     * 通过生成的类创建 View
     * 
     * @param name 控件名称
     * @param context 上下文
     * @param attributeSet 属性
     * @return View
     */
    @Override
    public View createView(String name, Context context, AttributeSet attributeSet) {
        if(mIMyViewCreator != null){
            return mIMyViewCreator.createView(name, context, attributeSet);
        }
        return null;
    }
}
```

到这里我们布局优化流程差不多就要结束了，接下来就是上层调用

## 六、app 上层调用

### 1、在创建的 MyApplication 上添加注解

关于注解你可以添加在其他地方，因为我注解处理器里面做了逻辑判断，只会读取第一次的注解。为了对应，我选择把注解加到 MyApplication 中，如下图：

![image-20210629192519893](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281548516.png)

### 2、最后在 MainActviity 中加入替换 View 的逻辑

如下：

```java
//...
public class MainActivity extends AppCompatActivity {

    //...
    @Nullable
    @Override
    public View onCreateView(@NonNull String name, @NonNull Context context, @NonNull AttributeSet attrs) {
        //1、优先使用我们生成的类去进行 View 的创建
        View view = MyViewCreatorDelegate.getInstance().createView(name, context, attrs);
        if (view != null) {
            return view;
        }
        //2、一些系统的 View ,则走系统的一个创建流程
        return super.onCreateView(name, context, attrs);
    }
}
```

**注意**：一般我们会把替换 View 的逻辑放到基类里面

## 七、效果验证

运行项目

1、先看下我们打印的日志，如下图：

![image-20210629195411055](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281548159.png)

2、在看一眼我们生成的 Java 类文件，如下图：

![image-20210629194711378](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281548075.png)

3、最后 debug 项目跟下流程，发现和我们预期的一致，如下图：

![image-20210629194101025](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281548282.png)

至此，需求完结

## 八、总结

本篇文章讲的一些重点内容：

1、通过 APT 读取文件获取所有的控件名称并生成 Java 类

2、通过接口代理，合理的业务封装提供给上层调用

3、在上层 Application 里面进行注解，在 Activity 中进行 View 控件的替换

4、实际完成后的一个效果验证

好了，本系列文章到这里就结束了，希望能给你带来帮助 🤝 

**感谢你阅读这篇文章**

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
