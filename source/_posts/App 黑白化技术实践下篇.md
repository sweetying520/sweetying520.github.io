---
title: App 黑白化技术实践下篇
date: 2022-12-09 15:57:18
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261445849.jpeg
tags: 
- 原创
- Android
- App 黑白化
categories:
- Android
- App 黑白化
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261445849.jpeg)

## 前言

很高兴遇见你~

在[App 黑白化技术实践上篇](https://juejin.cn/post/7174768835927965733)这篇文章，我们介绍了：

1、App 黑白化实现原理：将 Paint 的饱和度设置为 0，然后进行 View 的绘制

2、App 黑白化两种方案实践：

> 1、对页面的 DecorView 进行黑白化设置
>
> 2、替换页面的内容栏 FramLaout 为黑白化 FrameLayout

3、分析了 App 黑白化两种方案存在的一些问题

> 1、方案一：Dialog，PopupWindow 黑白化不生效
>
> 2、方案二：Dialog 黑白化生效，PopupWindow 黑白化不生效

4、给出了 App 黑白化两种方案出现问题的原因以及新的思路

还没有看过的朋友，建议先去阅读一下。

回顾一下我们说的新思路：

App 中 Window 的添加最终都会走到 WindowManagerGlobal 的 addView 方法：

```java
//WindowManagerGlobal#addView
public void addView(View view, ViewGroup.LayoutParams params,
        Display display, Window parentWindow) {
        //...
	synchronized (mLock) {

        // 将 view 添加到 mViews，mViews 是一个 ArrayList 集合
        mViews.add(view);
       	

        // 最后通过 viewRootImpl 来添加 window
        try {
            root.setView(view, wparams, panelParentView);
        } 
    }  
}
```

WindowManagerGlobal 是一个全局单例，其中 mViews 是一个集合，App 中所有的 Window 在添加的时候都会被它给存起来。

那我们就可以通过 Hook 拿到 mViews 中所有的 View 然后进行黑白化设置，这样不管是 Activity，Dialog，PopupWindow 还是其他一些 Window 组件，都会变成黑白化。具体一点就是：

> 1、Hook WindowManagerGlobal 中的 mViews ，将其改成可感知数据的 ArrayList 集合
>
> 2、监听 mViews 的 add 操作，然后对 View 进行黑白化设置

在此之前，你需要明白：

> 1、什么是 Hook？
>
> 2、怎么进行 Hook？

才能完成上述操作

## 一、Hook 介绍

### 1.1、什么是 Hook？

简单理解：**Hook 就是使用代理对象对原始对象进行劫持，插入一段我们自己的逻辑，实现偷梁换柱**

正常调用：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261446167.png" alt="image-20221210162609850.png" width="50%" />

Hook 调用：


![image-20221210162658307.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261446036.png)

### 1.2、怎么进行 Hook？

Hook 通常是有固定套路的：

> 1、确认 Hook 点（被劫持的原始对象我们称之为 Hook 点）
>
> 2、定义代理类
>
> 3、使用代理对象替换 Hook 点

说起来有点抽象，下面我就手把手带领大家进行 Hook 实践。

### 1.3、Hook 实践

如下例子：

MainActivity 中，我们给 btnHook 设置了点击事件并进行了 Log 打印，现在要求在不改动这个点击事件的情况下，弹出 Toast 并显示：erdai666。

如何做到？

我们是不是就要对`btnHook.setOnClickListener`的点击事件（OnClickListener）进行 Hook

```kotlin
class MainActivity: BaseActivity() {

    private val btnHook by lazy {
        findViewById<Button>(R.id.btnHook)
    }

    override fun getLayoutId(): Int {
        return R.layout.activity_main
    }

    override fun initView() {
        btnHook.setOnClickListener{
            Log.d("MainActivity", "Hello")
        }
    }
}
```

按照上面的固定套路：

#### 1.3.1、确认 Hook 点

跟一下`btnHook.setOnClickListener`的源码：

```java
//1、btnHook.setOnClickListener => View#setOnClickListener
public void setOnClickListener(@Nullable OnClickListener l) {
    if (!isClickable()) {
        setClickable(true);
    }
    getListenerInfo().mOnClickListener = l;
}

//2、getListenerInfo().mOnClickListener => ListenerInfo#mOnClickListener
public class View implements Drawable.Callback,... {
  	//...
  
  	static class ListenerInfo {
      	//...
        public OnClickListener mOnClickListener;
    }
}
```

上述代码我们可以知道：

1、当我们进入`btnHook.setOnClickListener` ，发现 OnClickListener 对象被赋值给了`getListenerInfo().mOnClickListener`

2、getListenerInfo() 是一个 ListenerInfo 对象，ListenerInfo 是 View 中的一个静态内部类，它持有了 OnClickListener 对象

那么现在我们就可以确认 Hook 点：**View 中 ListenerInfo 中的 OnClickListener 对象**

#### 1.3.2、定义代理类

```kotlin
class ProxyClickListener(var context: Context,var clickListener: View.OnClickListener) 
: View.OnClickListener {
    
    override fun onClick(v: View?) {
        Toast.makeText(context,"erdai666",Toast.LENGTH_SHORT).show()
        clickListener.onClick(v)
    }
}
```

代理类逻辑很简单：就是在 OnClickListener 的基础上添加了我们自己的 Toast 提示

**Tips：** 如果 Hook 点是接口，我们可以使用 JDK 的动态代理，如果动态代理不清楚的可以看我这篇文章，详细介绍了 Java 六大设计原则和 24 种设计模式：["一篇就够"系列：Java 六大设计原则和常用设计模式](https://juejin.cn/post/7160363585028227086)

#### 1.3.3、使用代理对象替换 Hook 点

替换过程我们需要使用到反射，如果反射不清楚，可以看我这篇文章：[Android APT 系列 （一）：APT 筑基之反射](https://juejin.cn/post/6977679823132950536)

理一理替换的思路：

我们的目标是对 View 中 ListenerInfo 中的 OnClickListener 对象进行替换，因此要通过反射拿到这个对象，细节拆分：

> 1、拿到当前 View 对象的 ListenerInfo 对象
>
> 2、通过 ListenerInfo 对象在拿到  OnClickListener 对象

拿到  OnClickListener 对象后，创建代理对象，然后对当前  OnClickListener 对象进行替换即可

新建一个 HookSetOnClickListenerHelper 类对上面的思路进行实践：

```kotlin
object HookSetOnClickListenerHelper {

    /**
     * context：上下文
     * view：当前 view 对象
     */
    fun hook(context: Context,view: View){
        //一、拿到当前 View 对象的 ListenerInfo 对象
        val getListenerInfoMethod = View::class.java.getDeclaredMethod("getListenerInfo")
        //破坏封装，让我们能访问 private 修饰的成员
        getListenerInfoMethod.isAccessible = true
        val listenerInfo = getListenerInfoMethod.invoke(view)

        //二、通过 ListenerInfo 对象在拿到 OnClickListener 对象
        //android.view.View$ListenerInfo 这种是内部类的写法
        val mOnClickListenerFiled = Class.forName("android.view.View\$ListenerInfo").getDeclaredField("mOnClickListener")
        val mOnClickListener = mOnClickListenerFiled.get(listenerInfo) as View.OnClickListener

        //三、创建代理对象
        //1、法一
        val proxyClickListener = ProxyClickListener(context,mOnClickListener)

        //2、法二：因为 OnClickListener 是一个接口，我们可以使用 JDK 动态代理
//        val proxyClickListener = Proxy.newProxyInstance(
//            context.classLoader,
//            arrayOf(View.OnClickListener::class.java)
//        ) { proxy, method, args ->
//            Toast.makeText(context, "erdai666", Toast.LENGTH_SHORT).show()
//            method?.invoke(mOnClickListener, *args)
//        }
        

        //四、使用代理对象替换原始对象
        mOnClickListenerFiled.set(listenerInfo,proxyClickListener)
    }
}
```

ok，接下来修改 MainActivity：

```kotlin
class MainActivity: BaseActivity() {

    private val btnHook by lazy {
        findViewById<Button>(R.id.btnHook)
    }

    override fun getLayoutId(): Int {
        return R.layout.activity_main
    }

    override fun initView() {
        btnHook.setOnClickListener{
            Log.d("MainActivity", "Hello")
        }
      	//Hook
        HookSetOnClickListenerHelper.hook(this,btnHook)
    }
}
```

运行 App，效果如下：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261446533.png" alt="image-20221210182733451.png" width="30%" />

了解了 Hook，接下来我们就 Hook WindowManagerGlobal 中的 mViews 实现 App 黑白化

## 二、Hook WindowManagerGlobal 中 mViews 实现 App 黑白化

我们的思路很明确：

1、Hook WindowManagerGlobal 中的 mViews ，将其改成可感知数据的 ArrayList 集合

2、监听 mViews 的 add 操作，然后对 View 进行黑白化设置

代码实现，写了详细的注释：

```kotlin
//1、新建 mViews 对象的代理类：可感知数据的 ArrayList 集合
class ObservableArrayList<T>(private val onListAddListener: OnListAddListener<T>?) :
    ArrayList<T>() {

    override fun add(element: T): Boolean {
        val isAdd = super.add(element)
        onListAddListener?.add(this, size - 1)
        return isAdd
    }

    //监听器：监听 ArrayList add 操作
    interface OnListAddListener<T> {
        fun add(list: ArrayList<T>, index: Int)
    }
}

//2、新建一个 GlobalGray 编写 Hook 逻辑
object GlobalGray {

    fun hook(){
        //一、获取 WindowManagerGlobal 对象
        val windowManagerGlobalClass = Class.forName("android.view.WindowManagerGlobal")
        val getInstanceStaticMethod = windowManagerGlobalClass.getDeclaredMethod("getInstance")
        val windowManagerGlobal = getInstanceStaticMethod.invoke(windowManagerGlobalClass)

        //二、获取 WindowManagerGlobal 中的 mViews
        val mViewsField = windowManagerGlobalClass.getDeclaredField("mViews")
        mViewsField.isAccessible = true
        val mViews = mViewsField.get(windowManagerGlobal) as ArrayList<View>

        //三、创建代理类对象
        //创建饱和度为 0 的画笔
        val paint = Paint()
        val cm = ColorMatrix()
        cm.setSaturation(0f)
        paint.colorFilter = ColorMatrixColorFilter(cm)

        val proxyArrayList = ObservableArrayList(object : ObservableArrayList.OnListAddListener<Any>{
            override fun add(list: ArrayList<Any>, index: Int) {
                val view = list[index] as View
                view.setLayerType(View.LAYER_TYPE_HARDWARE,paint)
            }
        })
        //将原有的数据添加到代理 ArrayList
        proxyArrayList.addAll(mViews)

        //四、使用代理对象替换原始对象
        mViewsField.set(windowManagerGlobal,proxyArrayList)
    }
}
```

Hook 逻辑写好了，我们测试一下，在 Applicaton 里面添加 Hook 的逻辑：

```kotlin
class MyApp: Application() {

    override fun onCreate() {
        super.onCreate()
      	//Hook 全局 App 黑白化
        GlobalGray.hook()
    }
}
```

运行 App ，效果验证：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261446753.gif" alt="ezgif.com-gif-maker.gif" width="30%" />

### 2.1、关于视频

我们这种方案只是针对 WindowManagerGlobal addView 过程中的所有 View 实现黑白化，如果不是这个范畴的则实现不了，例如：SurfaceView

1、对于普通的 View，Android 中的窗口界面包括多个 View 组成的 View Hierachy 的树形结构，只有最顶层的 DecorView才对 WMS 可见，这个 DecorView 在 WMS 中有一个对应的 WindowState，此时 APP 请求创建 Surface 时，会在SurfaceFlinger 内部建立对应的 Layer。

2、而对于 SurfaceView 它自带一个Surface，这个 Surface 在 WMS 有自己对应的 WindowState，在 SurfaceFlinger 中有自己对应的 Layer。

3、SurfaceView 从 App 端看它仍然在 View hierachy 结构中，但在 WMS 和 SurfaceFlinger 中它与宿主窗口是分离的。因此 SurfaceView 的 Surface 的渲染可以放到单独线程去做，不会影响主线程对事件的响应。

因此如果你视频播放使用的是 SurfaceView ，则这种方案实现不了黑白化，你需要针对 SurfaceView 单独去处理.

## 三、总结

本篇文章我们介绍了：

1、Android 高级必备 Hook ，并带领大家手把手对 Hook 进行了实践

2、Hook 是有固定套路的：

> 1、确认 Hook 点
>
> 2、定义代理类
>
> 3、使用代理对象替换 Hook 点

掌握这个套路，我们就能很轻松的去进行 Hook

3、通过 Hook WindowManagerGlobal 的 mViews 实现 App 全局黑白化

4、如果你视频播放使用的是 SurfaceView ，则这种方案实现不了黑白化，你需要针对 SurfaceView 单独去处理

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
