---
title: Android字体系列 （四）：全局替换字体方式
date: 2022-10-11 10:30:59
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281550573.jpeg
tags: 
- 原创
- Android
- Android Font
categories:
- Android
- Font
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281550573.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们了解了 Xml 中的字体，还没有看过上一篇文章的朋友，建议先去阅读 [Android字体系列 （三）：Xml中的字体](https://juejin.cn/post/6974388756275019812)，有了前面的基础，接下来我们就看下 Android 中全局替换字体的几种方式

**注意：本文所展示的系统源码都是基于Android-30 ，并提取核心部分进行分析**

 [Github Demo 地址](https://github.com/sweetying520/ChangeDefaultFontDemo) , 大家可以看 Demo 跟随我的思路一起分析

## 一、方式一：通过遍历 ViewTree，全局替换字体

之前我讲过：在 Android 中，我们一般会直接或间接的通过 TextView 控件去承载字体的显示，因为关于 Android 提供的承载字体显示的控件都会直接或间接继承 TextView。 

那么这就是一个突破口：**我们可以在 Activity 或 Fragment 的基类里面获取当前布局的 ViewTree，遍历 ViewTree ，获取 TextView 及其子类，批量修改它们的字体，从而达到全局替换字体的效果。**

代码如下：

```kotlin
//全局替换字体工具类
object ChangeDefaultFontUtils {

    private const val NOTO_SANS_BOLD = R.font.noto_sans_bold
    /**
     * 方式一: 遍历布局的 ViewTree, 找到 TextView 及其子类进行批量替换
     *
     * @param mContext 上下文
     * @param rootView 根View
     */
    fun changeDefaultFont(mContext: Context?, rootView: View?){
        when(rootView){
            is ViewGroup -> {
                rootView.forEach {
                    changeDefaultFont(mContext,it)
                }
            }
            is TextView -> {
                try {
                    val typeface = ResourcesCompat.getFont(mContext!!, NOTO_SANS_BOLD)
                    val fontStyle = rootView.typeface?.style ?: Typeface.NORMAL
                    rootView.setTypeface(typeface,fontStyle)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }
}

//Activity 基类
abstract class BaseActivity: AppCompatActivity(){

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val mRootView = LayoutInflater.from(this).inflate(getLayoutId(), null)
        setContentView(mRootView)
        ChangeDefaultFontUtils.changeDefaultFont(this,mRootView)
        initView()
    }

    /**获取布局Id*/
    abstract fun getLayoutId(): Int

    /**初始化*/
    abstract fun initView()
}

//MainActivity
class MainActivity : BaseActivity() {

    override fun getLayoutId(): Int {
        return R.layout.activity_main
    }

    override fun initView() {

    }
}
```

上述代码：

1、创建了一个全局替换字体的工具类，主要逻辑：

判断当前 rootView 是否是一个 ViewGroup，如果是，遍历取出其所有的子 View，然后递归调用 changeDefaultFont 方法。再判断是否是 TextView 或其子类，如果是就替换字体

2、创建了一个 Activity 基类，并在其中写入字体替换的逻辑

3、最后让上层 Activity 继承基类 Activity

逻辑很简单，在看下我们编写的 Xml 的一个效果：

![image-20210616144417422](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281550683.png)

接下来我们运行看下实际替换后的一个效果：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281550792.png" alt="image-20210616144927196" style="zoom:50%;" />

可以看到，字体被替换了。

现在我们来讨论一下这种方式的优缺点：

**优点**：我们不需要修改 Xml 布局，不需要重写多个控件，只需要在 **inflate View** 之后调一下就可以了

**缺点**：不难发现这种方式会遍历 Xml 文件中的所有 View 和 ViewGroup，但是如果出现 RecyclerView , ListView，或者其他 ViewGroup 里面动态添加 View，那么我们还是需要去手动添加替换的逻辑，否则字体不会生效。而且它每次递归遍历 ViewTree，性能上多少会有点影响

接下来我们看第二种方式

## 二、方式二：通过 LayoutInflater，全局替换字体

讲这种方式前，我们首先要对 LayoutInflater 的 inflate 过程有一定的了解，以 AppCompatActivity 的 setContentView 为例大致说下流程：

**我们在 Activity 的 setContentView 中传入一个布局 Xml，Activity 会通过代理类 AppCompatDelegateImpl 把它交由 LayoutInflater 进行解析，解析出来后，会交由自己的 3 个工厂去创建 View，优先级分别是mFactory2、mFactory、mPrivateFactory**

流程大概就说到这里，具体过程我后续会写一篇文章专门去讲。

mFactory2、mFactory ，系统提供了开放的 Api 给我们去设置，如下：

```java
//以下两个方法在 LayoutInflaterCompat.java 文件中
@Deprecated
public static void setFactory(@NonNull LayoutInflater inflater, @NonNull LayoutInflaterFactory factory) {
    if (Build.VERSION.SDK_INT >= 21) {
        inflater.setFactory2(factory != null ? new Factory2Wrapper(factory) : null);
    } else {
        final LayoutInflater.Factory2 factory2 = factory != null
                ? new Factory2Wrapper(factory) : null;
        inflater.setFactory2(factory2);

        final LayoutInflater.Factory f = inflater.getFactory();
        if (f instanceof LayoutInflater.Factory2) {
            forceSetFactory2(inflater, (LayoutInflater.Factory2) f);
        } else {
            forceSetFactory2(inflater, factory2);
        }
    }
}

public static void setFactory2(@NonNull LayoutInflater inflater, @NonNull LayoutInflater.Factory2 factory) {
    inflater.setFactory2(factory);
  
    if (Build.VERSION.SDK_INT < 21) {
        final LayoutInflater.Factory f = inflater.getFactory();
        if (f instanceof LayoutInflater.Factory2) {
            forceSetFactory2(inflater, (LayoutInflater.Factory2) f);
        } else {
            forceSetFactory2(inflater, factory);
        }
    }
}
```

这两个方法在 LayoutInflaterCompat 这个类中，LayoutInflaterCompat 是 LayoutInflater 一个辅助类，可以看到：

1、setFactory 方法使用了 @Deprecated 注解表示这个 Api 被弃用

2、setFactory2 是 Android 3.0 引入的，它和 setFactory 功能是一致的，区别就在于传入的接口参数不一样，setFactory2 的接口参数要多实现一个方法

利用 setFactory 系列方法，我们可以：

**1）、拿到 LayoutInflater inflate 过程中 Xml 控件对应的名称和属性**

**2）、我们可以对控件进行替换或者做相关的逻辑处理**

看个实际例子：还是方式一的代码，我们在 BaseActivity 中增加如下代码：

```kotlin
//Activity 基类
abstract class BaseActivity: AppCompatActivity(){
		
   //新增部分
   private val TAG: String? = javaClass.simpleName
  
    override fun onCreate(savedInstanceState: Bundle?) {
      	//...
      	//新增部分，其余代码省略
      	LayoutInflaterCompat.setFactory2(layoutInflater,object : LayoutInflater.Factory2{
            override fun onCreateView(parent: View?, name: String, context: Context, attrs: AttributeSet
            ): View? {
                Log.d(TAG, "name: $name" )
                for (i in 0 until attrs.attributeCount){
                    Log.d(TAG, "attr: ${attrs.getAttributeName(i)} ${attrs.getAttributeValue(i)}")
                }
              	return null
            }

            override fun onCreateView(name: String, context: Context, attrs: AttributeSet): View? {
                return null
            }

        })
        super.onCreate(savedInstanceState)
       	//...
    }

    //...
}
```

**注意**：上面 LayoutInflaterCompat.setFactory2 方法必须放在 super.onCreate(savedInstanceState) 的前面，不然会报错，因为系统会在 AppCompatActivity 的 oncreate 方法给 LayoutInflater 设置一个 Factory，而如果在已经设置的情况下再去设置，LayoutInflater 的 setFactory 系列方法就会抛异常，源码如下：

```java
//AppCompatActivity 的 oncreate
@Override
protected void onCreate(@Nullable Bundle savedInstanceState) {
    final AppCompatDelegate delegate = getDelegate();
    //调用 AppCompatDelegateImpl 的 installViewFactory 设置 Factory
    delegate.installViewFactory();
    //...
}

//AppCompatDelegateImpl 的 installViewFactory
@Override
public void installViewFactory() {
    LayoutInflater layoutInflater = LayoutInflater.from(mContext);
    if (layoutInflater.getFactory() == null) {
      	//如果当前 LayoutInflater 的 Factory 为空，则进行设置
        LayoutInflaterCompat.setFactory2(layoutInflater, this);
    } else {
      	//如果不为空，则进行 Log 日志打印
        if (!(layoutInflater.getFactory2() instanceof AppCompatDelegateImpl)) {
            Log.i(TAG, "The Activity's LayoutInflater already has a Factory installed"
                    + " so we can not install AppCompat's");
        }
    }
}

//LayoutInflater 的 setFactory2
public void setFactory2(Factory2 factory) {
    //如果已经设置，则抛异常
    if (mFactorySet) {
        throw new IllegalStateException("A factory has already been set on this LayoutInflater");
    }
    if (factory == null) {
        throw new NullPointerException("Given factory can not be null");
    }
    mFactorySet = true;
    //...
}
```

**注意**：上面 AppCompatActivity 中设置 Factory 是 android.appcompat  1.1.0 版本，而如果是更高的版本，如 1.3.0，可能设置的地方会有点变化，但是不影响我们设置位置的变化，感兴趣的可以去看下源码，这里你只要知道我们必须在 Activity 的 super.onCreate(savedInstanceState) 之前设置 Factory 就可以了

运行应用程序，看下几个主要控件的截图打印信息：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281550436.png" alt="image-20210616150016885" style="zoom:50%;" />

从 Log 输出可以看出，你所有的 Xml 控件，都会经过 LayoutInflaterFactory.onCreateView 方法走一遍去实现初始化的过程，在其中可以有效的分辨出是什么控件，以及它有什么属性。并且 onCreateView 方法的返回值就是一个 View，因此我们在此处可以对控件进行替换或者做相关的逻辑处理

到这里，你是否有了全体替换字体的思路了呢？

答案已经很明了：**利用自定义的 Factory 进行字体的替换**

这种方式我们只需要在 BaseActivity 里面操作就可以了，而且有效的解决了方式一带来的问题，提高了效率，如下：

```kotlin
abstract class BaseActivity: AppCompatActivity(){

    override fun onCreate(savedInstanceState: Bundle?) {
        LayoutInflaterCompat.setFactory2(layoutInflater,object : LayoutInflater.Factory2{
            override fun onCreateView(parent: View?, name: String, context: Context, attrs: AttributeSet
            ): View? {
                var view: View? = null
                if(1 == name.indexOf(".")){
                    //表示自定义 View
                    //通过反射创建
                    view = layoutInflater.createView(name,null,attrs)
                }

                if(view == null){
                    //通过系统创建一系列 appcompat 的 View
                    view = delegate.createView(parent, name, context, attrs)
                }

                if(view is TextView){
                    //如果是 TextView 或其子类，则进行字体的替换
                    ChangeDefaultFontUtils.changeDefaultFont(this@BaseActivity,view)
                }

                return view
            }

            override fun onCreateView(name: String, context: Context, attrs: AttributeSet): View? {
                return null
            }

        })
        super.onCreate(savedInstanceState)
        setContentView(getLayoutId())
        initView()
    }

    /**获取布局Id*/
    abstract fun getLayoutId(): Int

    /**初始化*/
    abstract fun initView()
}
```

上述代码我们做了：

1、判断是自定义 View ，通过反射创建

2、判断是系统提供的一些控件，使用 appcompat 系列 View 进行替换

3、判断是 TextView 或其子类，进行字体的替换

运行应用程序，最终实现了和方式一一样的效果：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281550179.png" alt="image-20210616144927196" style="zoom:50%;" />

## 三、方式三：通过配置应用主题，全局替换默认字体

这种方式挺简单的，在 application 中，通过 android:theme 来配置一个 App 的主题。一般新创建的项目，都是会有一个默认基础主题。在其中追加关于字体的属性，就可以完成全局默认字体的替换，在主题中我们可以对以下三个属性进行配置：

```xml
 <item name="android:typeface"></item>
 <item name="android:fontFamily"></item>
 <item name="android:textStyle"></item>
```

这三者的设置和关系我们在本系列的第一篇文章中已经讲过，还不清楚的可以去看下 [传送门](https://juejin.cn/post/6973064546420260878#heading-5)

关于 Xml 中使用字体的功能，我们上篇文章也已经讲过，还不清楚的可以去看下 [传送门](https://juejin.cn/post/6974388756275019812)

因为我们只需要配置默认字体，所以新增一行如下配置，就可以实现全局替换默认字体的效果了：

```xml
<style name="Theme.ChangeDefaultFontDemo" parent="Theme.MaterialComponents.DayNight.DarkActionBar.Bridge">
	//...
  	<item name="android:fontFamily">@font/noto_sans_bold</item>
  	//...
</style>
```

那么凡事都有意外，假如你的 Activity 引用了自定义主题，且自定义主题没有继承基础主题，那么你就需要补上这一行配置，不然配置的默认字体不会生效

## 四、方式四：通过反射，全局替换默认字体

通过反射修改，其实和方式三有点类似。因为在  Android Support Library 26 之前，我们不能直接在 Xml 中设置第三方字体，而只能设置系统提供的一些默认字体，所以通过反射这种方式，可以把系统默认的字体替换为第三方的字体。而现在我们使用的版本基本上都会大于等于 26，因此通过配置应用主题的方式就可以实现全局替换默认字体的效果。但是这里并不妨碍我们讲反射修改默认字体。

### 1、步骤一：在  App 的主题配置默认字体

```xml
<style name="Theme.ChangeDefaultFontDemo" parent="Theme.MaterialComponents.DayNight.DarkActionBar.Bridge">
	//...
  	<item name="android:typeface">serif</item>
  	//...
</style>
```

这里随便选一个默认字体，后续我们反射的时候需要拿到你这个选的默认字体，然后进行一个替换

**注意**: 这里必须配置 **android:typeface** ，其他两个不行，在本系列的第一篇中，关于 typeface，textStyle 和 fontFamily 属性三者的关系我们分析过，还不清楚的可以去看看 [传送门](https://juejin.cn/post/6973064546420260878#heading-5)：

setTypefaceFromAttrs 方法是 TextView 最终设置字体的方法，**当 typeface 和 familyName 都为空，则会根据 typefaceIndex 的值取相应的系统默认字体**。当我们设置  **android:typeface**  属性时，会将对应的属性值赋给 typefaceIndex ，并把 familyName 置为 null，而 typeface 默认为 null，因此满足条件

### 2、通过反射修改 Typeface 默认字体

**注意**：Google 在 Android 9.0 及之后对反射做了限制，被使用 `@hide` 标记的属性和方法通过反射拿不到

在 Typeface 中，自带的一些默认字体被标记的是 **public static final**，因此这里无需担心反射的限制

![image-20210618174439624](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281551718.png)

因为在上一步配置的主题中，我们设置的是 serif ，所以这里替换它就好了，完整的方法就是通过反射拿到 Typeface 的默认字体 SERIF，然后使用反射将它修改成我们需要的字体即可：

```kotlin
object ChangeDefaultFontUtils {
    const val NOTO_SANS_BOLD = R.font.noto_sans_bold
    
    fun changeDefaultFont(mContext: Context) {
        try {
            val typeface = ResourcesCompat.getFont(mContext, NOTO_SANS_BOLD)
            val defaultField = Typeface::class.java.getDeclaredField("SERIF")
            defaultField.isAccessible = true
            defaultField[null] = typeface
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
```

### 3、在 Application 里面，调用替换的方法

```kotlin
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        ChangeDefaultFontUtils.changeDefaultFont(this)
    }
}
```

那么经过上面的三个步骤，我们同样可以实现全局替换默认字体的效果

## 五、项目实践

回到我们剩下的需求：**全局替换默认字体**

1、方式一和方式二都是全局替换字体，会将我们之前已经设置好的字体给覆盖，因此并不适合

2、方式三和方式四都是全局替换默认字体，我们之前已经设置好的字体不会被覆盖，满足我们的要求，但是方式四通过反射，是因为之前我们不能直接在 Xml 里面设置第三方字体。从 Android Support Library 26 及之后支持在 Xml 里面设置默认字体了，因此我在项目实践中，最终选择了方式三实现了全局替换默认字体的效果，需求完结 🎉

## 六、总结

最后回顾一下我们讲的重点知识：

1、通过遍历 ViewTree，全局替换字体，这种方式每次都需要递归遍历，有性能问题

2、通过 LayoutInflater 设置自定义 Factory 全局替换字体，效率高

3、通过配置应用主题全局替换默认字体，简单高效

4、通过反射全局替换默认字体，相对于 3，性能会差点，使用步骤也相对复杂

5、我在项目实践过程中的一个选择

好了，本系列文章到这里就结束了，希望能给你带来帮助 🤝 

**感谢你阅读这篇文章**

### 参考和推荐

[全局修改默认字体，通过反射也能做到](https://segmentfault.com/a/1190000011401796)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
