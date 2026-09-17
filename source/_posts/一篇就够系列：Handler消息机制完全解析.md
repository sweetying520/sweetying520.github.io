---
title: 一篇就够系列：Handler消息机制完全解析
date: 2022-10-11 10:50:49
author: sweetying
tags: 
- 原创
- Android
- 一篇就够
categories:
- Android
- 一篇就够
---

## 前言
> Handler系列文章共两篇：
>
> 第一篇：["一篇就够"系列: Handler消息机制完全解析](https://juejin.cn/post/6924084444609544199#heading-5)
>
> 第二篇： ["一篇就够"系列: Handler扩展篇](https://juejin.cn/post/6932608660354891790/)

关于Handler，想必大家都已经非常熟悉了，它是Android中非常基础，但同时也极其重要的消息机制，说它基础，是因为它使用简单，在我们一开始学习Android时，就会接触到Handler，用它来进行线程间的通信。说它极其重要，是因为它在Android系统中扮演了一个极其核心的角色，可以说只要有异步通信的地方就一定会有Handler，正是因为它的存在，使得我们Android系统中的很多组件能够正常的运行

**注意：本文所展示的系统源码都是基于Android-29 ，并提取核心部分进行分析**

## 问题

下面我在这里抛出一些问题，如果你都知道，那么恭喜你，你对Handler机制掌握的很透彻，如果你对下面这些问题有一些疑惑，那么你就可以接着往下看，我会由浅入深的给你讲解Handler机制，看完之后，这些问题你就都会非常的明了，同时在最后我也会对这些问题给出自己的回答

1. Handler有哪些作用?
2. 为什么我们能在主线程直接使用Handler，而不需要创建Looper?
3. 如果想要在子线程创建Handler，需要做什么准备?
4. 一个线程有几个Handler?
5. 一个线程有几个Looper?如何保证?
6. 为什么Lopper死循环，却不会导致应用卡死?
7. Handler内存泄露原因? 如何解决？
8. 线程维护的Looper，在消息队列无消息时的处理方案是什么?有什么用?
9. 我们可以使用多个Handler往消息队列中添加数据，那么可能存在发消息的Handler存在不同的线程，那么Handler是如何保证MessageQueue并发访问安全的呢？
10. Handler是如何进行线程切换的呢？
11. 我们在使用Message的时候,应该如何去创建它？
12. Handler里面藏着的CallBack能做什么？
13. Handler阻塞唤醒机制是怎么一回事？
14. 什么是Handler的同步屏障？
15. 能不能让一个Message被加急处理？

## 什么是Handler?

我们通常所说的Handler，他其实是Handler机制中的一个角色，只不过我们对Handler接触比较多，因此用Handler来代称

**Handler机制是Android中基于单线消息队列模式的一套线程消息机制。**

## Handler基本用法

```java
//在主线程创建Handler实例
private Handler mHandler = new Handler() {
        @Override
        public void handleMessage(@NonNull Message msg) {
            //处理接收的消息
        }
    };

//在适当的时机使用Handler实例发送消息
mHandler.sendMessage(message);
mHandler.post(runnable);//Runnable会被封装进一个Message，所以它本质上还是一个Message
```

看上面这段代码，创建了一个Handler实例并重写了 `handleMessage` 方法 ，然后在适当的时机调用它的 `send` 或者 `post` 系列方法就可以了，使用就是这么简单

那么问题来了，它们是如何进行线程间的通信的呢? 下面我们就需要对源码进行分析

## Handler机制源码分析

在分析源码之前,我先讲下Handler机制涉及的几大角色: **Handler,Looper,MessageQueue,Message**

先提前介绍下这几个角色的作用,便于后续分析源码的一个理解

**Handler**: 发送消息和处理消息

**Looper**: 从MessageQueue中获取Message，然后交给Handler处理

**MessageQueue**: 消息队列，存放Handler发送过来的消息

**Message**: 消息的载体

下面我们开始进行源码分析，在我们一开始使用的时候，创建了一个Handler实例，那我们看下它实例化的这个构造方法：

```java
public Handler() {
     this(null, false);
}
```

它其实是调用了它的一个重载的方法,接着看它的重载方法

**注意:** 

1. Handler的构造方法中还可以传入Looper，通过传入Looper的构造方法可以实现一些特殊的功能
2. Handler的构造方法中还可以传入Callback，这种方式创建一个Handler的实例，它并不需要派生出一个子类，后面我也会介绍到
3. 有些构造方法使用了`@UnsupportedAppUsage`注解，表示不支持外部应用调用

```java
public Handler(@Nullable Callback callback, boolean async) {
  	//...
    //获取当前线程的Lopper
    mLooper = Looper.myLooper();
    //如果当前Looper为空,则抛出异常
    if (mLooper == null) {
        throw new RuntimeException(
            "Can't create handler inside thread " + Thread.currentThread()
                    + " that has not called Looper.prepare()");
    }
    //将当前Lopper中的MessageQueue赋值给Handler中的MessageQueue
    mQueue = mLooper.mQueue;
    //...
 }

//---------------------以下为额外扩展内容--------------------------
//传入Looper的构造方法
public Handler(@NonNull Looper looper) {
    this(looper, null, false);
}

//传入Callback的构造方法
public Handler(@Nullable Callback callback) {
    this(callback, false);
}

//使用了@UnsupportedAppUsage注解的构造方法
@UnsupportedAppUsage
public Handler(boolean async) {
    this(null, async);
}
```

上面这段代码注释写的很清楚，那我们是不是就可以得出一个结论： **我们在创建Handler实例的时候，一定要先创建一个Lopper，并开启循环读取消息**，那么大家肯定有个疑问？ 你上面的使用就没有创建Lopper，那是因为我们的主线程已经给我们创建了一个Lopper

接下来我们找下主线程的这个Lopper是在哪里创建的，我们找到ActivityThread的main()方法

```java
public static void main(String[] args) {
  //...
 	//创建Lopper
  Looper.prepareMainLooper();
  
  ActivityThread thread = new ActivityThread();
  thread.attach(false);

  if (sMainThreadHandler == null) {
    sMainThreadHandler = thread.getHandler();
  }
  //...
  //开启循环读取消息
  Looper.loop();
	//Looper如果因异常原因停止循环则抛异常
  throw new RuntimeException("Main thread loop unexpectedly exited");
}
```

**注意：通常我们认为 ActivityThread 就是主线程。事实上它并不是一个线程，而是主线程操作的管理者，所以们把 ActivityThread 认为就是主线程无可厚非，另外主线程也可以说成 UI 线程。**

我们在 ActivityThread里的`main`方法里调用了Looper.prepareMainLooper() 方法创建了主线程的Looper ，并且调用了`loop`方法，所以我们就可以直接使用 Handler

继续分析，我们知道main()方法是Java程序的入口，同时也是Android应用程序的入口，而在Java中，我们执行完main()方法，马上就退出了，而在Android中，为啥没有退出呢？这里我们做个假设，如果在Android中也退出了，那么是不是Android就没得玩了，所以Google肯定是不能让他退出的，之所以在Android中没有退出，正是因为我们在这里创建并开启了Looper死循环，他会循环执行各种事物。Looper死循环说明线程没有死亡，如果Looper停止循环，线程则结束退出了

那么大家是不是又会有个疑问？既然是一个死循环，那为啥不会造成ANR？

其实Lopper死循环和程序ANR没有任何关系，这里感觉就是在进行一个概念的混淆，这里我解释一下这两个概念

ANR: 全称Applicationn Not Responding，中文意思是应用无响应，当我发送一个消息到主线程，经过一定时间没有被执行，那么这个时候就会抛出ANR异常

Lopper死循环: 循环执行各种事务，当Looper处理完所有消息的时候会进入阻塞状态，当有新的Message进来的时候会打破阻塞继续执行

到了这里，相信大家对于创建Handler已经很明了了，下面我们来实际应用一下，在子线程创建Handler，直接上代码：

```java
public static class MyThread extends Thread {
    public Handler mHandler;
 
        public void run() {
            Looper.prepare();
            mHandler = new Handler() {
                public void handleMessage(@NonNull Message msg) {
										//处理接收的消息
                }
            };
            Looper.loop();
        }
}
```

好，到了这里，我们应该对**创建Handler实例的时候,一定要先创建一个Lopper，并开启循环读取消息**，有了深刻的理解，我们继续分析源码

上面说了创建Handler实例之前要先创建Looper并开启循环，那我们分析下创建Lopper并开启循环这个过程，先看下ActivityThread里的`main`方法里调用的Looper.prepareMainLooper()

```java
public static void prepareMainLooper() {
  	//创建Looper,参数false表示该Looper不能退出
    prepare(false);
  	//添加同步锁
    synchronized (Looper.class) {
      	//如果当前sMainLooper已经存在,则抛异常
        if (sMainLooper != null) {
            throw new IllegalStateException("The main Looper has already been prepared.");
        }
      	//将当前线程的Looper实例赋值给sMainLooper
        sMainLooper = myLooper();
    }
}
```

实际上主要是调用了另外两个方法，我们在看下prepare(false)和myLooper()方法的内部实现

```java
private static void prepare(boolean quitAllowed) {
  	 //通过sThreadLocal获取当前Looper实例,如果当前Lopper实例不为空则抛出异常
     if (sThreadLocal.get() != null) {
         throw new RuntimeException("Only one Looper may be created per thread");
     }
  	 //将new出来的Looper实例设置给sThreadLocal
     sThreadLocal.set(new Looper(quitAllowed));
}
```

```java
public static @Nullable Looper myLooper() {
  	 //通过sThreadLocal获取Looper实例对象
     return sThreadLocal.get();
}
```

`prepare`方法: new一个Looper设置给sThreadLocal. `myLooper`方法: 通过sThreadLocal获取Looper. 上面两个方法，大家是不是会对这个sThreadLocal很好奇，这个东西有啥作用，我们根据上面两个方法可以推断出: sThreadLocal是用来存放Looper的

### ThreadLocal介绍

**ThreadLocal是Java中一个用于线程内部存储数据的工具类**

看下面这一段代码

```java
 public static void main(String[] args) {
     ThreadLocal<Boolean> threadLocal = new ThreadLocal<>();
     threadLocal.set(true);
     Boolean aBoolean = threadLocal.get();
     System.out.println("Current Thread " + Thread.currentThread().getName() + ": " + aBoolean);
		 //创建一个新的线程命名为a
     new Thread("a"){
         @Override
          public void run() {
              threadLocal.set(false);
              Boolean bBoolean = threadLocal.get();
              System.out.println("Current Thread " + Thread.currentThread().getName() + ": " + bBoolean);
          }
     }.start();
		 //创建一个新的线程命名为b
     new Thread("b"){
         @Override
         public void run() { ;
             Boolean cBoolean = threadLocal.get();
             System.out.println("Current Thread " + Thread.currentThread().getName() + ": " + cBoolean);
         }
     }.start();
 }

//打印结果:
Current Thread main: true
Current Thread a: false
Current Thread b: null
```

上面这段代码: 

1. 在主线程创建了一个threadLocal变量，并调用`set`方法设置为true，然后获取该值并打印
2. 创建一个新的线程，并调用`set`方法设置值为false，获取获取该值并打印
3. 创建一个新的线程，获取该值并打印

从上面的日志可以看出，虽然在不同的线程中访问同一个threadLocal对象，但是它们通过ThreadLocal获取的值却是不一样的，这就是ThreadLocal的奇妙之处，这里我又想问一句,为什么? 凡事多问几个为什么，知识原理就学到手了，哈哈😄，我们点进去ThreadLocal的`set`方法看一下

```java
public void set(T value) {
  	//获取当前线程
    Thread t = Thread.currentThread();
  	//获取当前线程的ThreadLocalMap
    ThreadLocalMap map = getMap(t);
    if (map != null)
      	//如果map不为空,则将当前的ThreadLocal变量作为key,传进来的泛型作为value进行存储
        map.set(this, value);
    else
      	//如果map为空,则会创建map,将当前的ThreadLocal变量作为key,传进来的泛型作为value进行存储
        createMap(t, value);
}
```

通过上面代码我们知道，通过获取当前线程的ThreadLocalMap，在把ThreadLocal变量作为key，传进来的泛型作为value进行存储

**ThreadLocalMap**它是ThreadLocal里面的一个静态内部类，它类似于一个改版的HashMap，内部也是使用数组和Hash算法来存储数据，使得存储和读取的速度非常快，因此这里我们使用HashMap的思想去理解ThreadLocalMap就好了，如果对ThreadLocalMap工作原理感兴趣的，可以阅读这篇文章[传送门](https://juejin.cn/post/6844904141890781192)

在看下`get`方法

```java
public T get() {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T)e.value;
            return result;
        }
    }
    return setInitialValue();
}
```

获取当前线程的ThreadLocalMap，前面讲到ThreadLocalMap其实非常像一个HashMap，他的get方法也是一样的，使用ThreadLocal作为key获取到对应的Entry，再把value返回即可，如果map尚未初始化则会执行初始化操作

因此我们是否可以得到结论:

![image-20210201082013061](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281531848.png)

ThreadLocal会从各自的线程，取出自己维护的ThreadLocalMap，其key为ThreadLocal，value为ThreadLocal对应的泛型对象，这样每个ThreadLocal就可以把自己作为key把不同的value存储在不同的ThreadLocalMap，当获取数据的时候，同个ThreadLocal就可以从不同线程的ThreadLocalMap中得到不同的数据。因此当我们以线程作为作用域，并且不同线程需要具有不同数据副本的时候，我们就可以考虑使用ThreadLocal。而Looper正好适用于这种场景

### Looper介绍

上面我们分析到Looper使用ThreadLocal来保证每个线程有且只有一个相同的副本，因此我们可以得出结论: **一个线程对应一个Looper**，这个结论非常的重要，Handler机制之所以能够实现线程之间的通信，就是因为使用了不同线程的Looper处理消息，举个例子: 我在线程A创建了几个Hanlder实例处理消息，那我首先就要创建A线程的Looper并开启消息循环，那么我不管你这些Hanlder的实例从那个线程发送消息过来，最终都会回到我A线程的MessageQueue中，然后通过A线程Looper不断读取消息，在交给当前A线程的Handler来处理

Looper可以说是Handler机制中的一个非常重要的核心。Looper相当于线程消息机制的引擎，驱动整个消息机制运行。Looper负责从队列中取出消息，然后交给对应的Handler去处理。如果队列中没有消息，则MessageQueue的next方法会阻塞线程，等待新的消息的到来。每个线程有且只能有一个“引擎”，也就是Looper，如果没有Looper，那么消息机制就运行不起来，而如果有多个Looper，则会违背单线操作的概念，造成并发操作。

#### Looper创建

在上面创建Looper的时候我们分析到:

1. 主线程ActivityThread创建Looper，使用的是`prepareMainLooper`方法，它是为主线程量身定做的，由于主线程的Looper比较特殊，所以Looper提供了一个`getMainLooper`方法，通过这个方法我们可以在任何地方获取到主线程的Looper，且主线程的Looper不能退出

2. 我们自己创建的Looper，使用的是`prepare`方法，实质上它们最终都会调到`prepare(boolean quitAllowed)`这个方法，这个方法是私有的，外部不能直接调用，区别就是主线程创建的Looper不能退出，而我们自己创建的可以退出

```java
//主线程
public static void prepareMainLooper() {
    prepare(false);
  	//...
}

//获取主线程Looper
public static Looper getMainLooper() {
     synchronized (Looper.class) {
     return sMainLooper;
     }
 }

//我们自己创建Looper
public static void prepare() {
    prepare(true);
}

//参数quitAllowed true: 可退出 false: 不可退出
private static void prepare(boolean quitAllowed) {
     if (sThreadLocal.get() != null) {
         throw new RuntimeException("Only one Looper may be created per thread");
     }
     sThreadLocal.set(new Looper(quitAllowed));
}
```

到这里我又有个疑问，为啥Looper不能直接在外部给New出来呢？我们点击去Looper的构造方法看一下:

```java
private Looper(boolean quitAllowed) {
  	 //创建一个MessageQueue,赋值给当前Looper的mQueue
     mQueue = new MessageQueue(quitAllowed);
  	 //获取当前线程赋值给Looper的mThread
     mThread = Thread.currentThread();
}
```

我们发现，他的构造方法是私有的，原来如此。而且我们还会发现：Looper的内部维护了一个MessageQueue，当初始化Looper的时候会顺带初始化这个MessageQueue

#### Looper开启消息循环

当我们的Looper创建好后，他是不会自己启动的，需要我们手动去启动Looper，调用Looper的`loop()`方法即可，所以前面创建Looper的时候我总是会说，创建Looper并开启消息循环，Looper的`prepare`和`loop`方法是配套使用的，两者必须成对存在。现在我们来重点分析一下Looper的`loop`方法，上源码:

```java
public static void loop() {
    // 获取当前线程的Looper
    final Looper me = myLooper();
    //当前线程的Looper,直接抛异常
    if (me == null) {
        throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
    }
  	//获取当前Looper中的MessageQueue
    final MessageQueue queue = me.mQueue;
    //...
  	//开启死循环读取消息
    for (;;) {
        // 获取消息队列中的消息
        Message msg = queue.next(); // might block
        if (msg == null) {
            // 返回null说明MessageQueue退出了
            return;
        }
        //...
        try {
            // 调用Message对应的Handler处理消息
            msg.target.dispatchMessage(msg);
            if (observer != null) {
                observer.messageDispatched(token, msg);
            }
            dispatchEnd = needEndTime ? SystemClock.uptimeMillis() : 0;
        }
        //...
    		// 回收Message
        msg.recycleUnchecked();
    }
}
```

`loop`方法就是Looper这个“引擎”的核心所在，他就像是一个开关

分析下这段代码，首先获取当前线程的Looper对象，没有则抛异常，然后进入一个死循环: 不断调用MessageQueue的next方法来获取消息，然后调用message的目标handler的`dispatchMessage`方法来处理Message。

#### Looper退出

Looper提供了`quit`和`quitSafely`方法来退出一个Looper，二者的区别是： quit会直接退出Looper，而quitSafely只是设定一个标记，然后把消息队列中的已有消息处理完毕后才安全退出.在我们手动创建Looper的情况下，如果所有的消息都被处理完成后，我们应该调用`quit`方法来终止消息循环，否则子线程就会一直处于等待状态，而如果退出Looper，这个线程就会立刻终止，因此建议不需要的时候终止Looper。

```java
public void quit() {
    mQueue.quit(false);
}

public void quitSafely() {
    mQueue.quit(true);
}

// 最终都是调用到了这个方法
void quit(boolean safe) {
    // 如果不能退出则抛出异常。这个值在初始化Looper的时候被赋值
    if (!mQuitAllowed) {
        throw new IllegalStateException("Main thread not allowed to quit.");
    }

    synchronized (this) {
        // 退出一次之后就无法再次运行了
        if (mQuitting) {
            return;
        }
        mQuitting = true;
        // 执行不同的方法
        if (safe) {
            removeAllFutureMessagesLocked();
        } else {
            removeAllMessagesLocked();
        }
        // 唤醒MessageQueue
        nativeWake(mPtr);
    }
}
```

`quit`和`quitSafely`方法最终都调用了`quit(boolean safe)`这个方法，这个方法先判断是否能退出，然后再执行退出逻辑。如果mQuitting==true，那么这里会直接return掉，我们会发现mQuitting这个变量只有在这里被执行了赋值，所以一旦looper退出，则无法再次运行了。之后执行不同的退出逻辑,然后唤醒MessageQueue,之后MessageQueue的next方法会退出，Looper的loop方法也会跟着退出，那么线程也就停止了。

#### Looper总结

Looper作为Handler消息机制的“动力引擎”，不断从MessageQueue中获取消息，然后交给Handler去处理。Looper的使用前需要先初始化当前线程的Looper对象，再调用loop方法来启动它。

同时Handler也是实现切换的核心，因为不同的Looper运行在不同的线程，他所调用的dispatchMessage方法则运行在不同的线程，所以Message的处理就被切换到Looper所在的线程了。当looper不再使用时，可调用不同的退出方法来退出他，注意Looper一旦退出，线程则会直接结束。

### Handler发送消息

Handler和Looper都创建好了，那么接下来我们就要使用Handler去发送消息，我们在最开始介绍Handler使用的时候，写了发送的两种消息类型，如下:

```java
//在适当的时机使用Handler实例发送消息
mHandler.sendMessage(message);
mHandler.post(runnable);//Runnable会被封装进一个Message,所以它本质上还是一个Message
```

使用Handler发送消息，它有`send` 或者 `post`等一系列方法，最终这些发送的方法会调用到Handler中的enqueueMessage()方法，而Handler中的`enqueueMessage`方法最终会调用到MessageQueue的`enqueueMessage`方法，我们通过一个发送消息方法的源码看下，以我们最常用的sendMessage()这个方法为例：

**注意**：`post`系列方法，发送的是一个Runnable，Runnable会被封装进一个Message，所以它本质上还是一个Message

```java
//1
public final boolean sendMessage(@NonNull Message msg) {
    return sendMessageDelayed(msg, 0);
}

//2
public final boolean sendMessageDelayed(@NonNull Message msg, long delayMillis) {
    if (delayMillis < 0) {
      	delayMillis = 0;
    }
   	return sendMessageAtTime(msg, SystemClock.uptimeMillis() + delayMillis);
}

//3
public boolean sendMessageAtTime(@NonNull Message msg, long uptimeMillis) {
    MessageQueue queue = mQueue;
    if (queue == null) {
        RuntimeException e = new RuntimeException(
        this + " sendMessageAtTime() called with no mQueue");
        Log.w("Looper", e.getMessage(), e);
       	return false;
    }
    return enqueueMessage(queue, msg, uptimeMillis);
}

//4
private boolean enqueueMessage(@NonNull MessageQueue queue, @NonNull Message msg,long uptimeMillis) {
     //将当前的Handler赋值给Message的target属性
  	 msg.target = this;
     msg.workSourceUid = ThreadLocalWorkSource.getUid();

     if (mAsynchronous) {
         msg.setAsynchronous(true);
     }
     return queue.enqueueMessage(msg, uptimeMillis);
}
```

以上代码的调用顺序就是1->2->3->4

这里我给一张图来总结一下，`send` 或者 `post`等一系列方法的调用及最终的走向：

![image-20210131222442908](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281531034.png)



### MessageQueue enqueueMessage方法介绍

到了这里，我们就来重点分析一下MessageQueue的enqueueMessage()方法，enqueueMessage中文意思是入队消息，见名知意，这个方法就是把Handler发送的消息，放到消息队列中

```java
boolean enqueueMessage(Message msg, long when) {
    // Hanlder为空则抛异常
    if (msg.target == null) {
        throw new IllegalArgumentException("Message must have a target.");
    }
  	//当前消息如果已经已经被执行则抛异常
    if (msg.isInUse()) {
        throw new IllegalStateException(msg + " This message is already in use.");
    }

    // 对MessageQueue进行加锁
    synchronized (this) {
        // 判断目标thread是否已经死亡
        if (mQuitting) {
            IllegalStateException e = new IllegalStateException(
                    msg.target + " sending message to a Handler on a dead thread");
            Log.w(TAG, e.getMessage(), e);
            msg.recycle();
            return false;
        }
        // 标记Message正在被执行，以及需要被执行的时间
        //这里的when的值需要分情况:1,可能为0 2, 如果不为0，则是系统开机到现在的一个毫秒数 + 延迟执行的时间
        //这两种情况主要看你调用的是Handler哪个发送Message的方法
        msg.markInUse();
        msg.when = when;
        // p是MessageQueue的链表头
        Message p = mMessages;
      	// 判断是否需要唤醒MessageQueue
        boolean needWake;
        // 如果有新的队头，同时MessageQueue处于阻塞状态则需要唤醒队列
        if (p == null || when == 0 || when < p.when) {
            msg.next = p;
            mMessages = msg;
            needWake = mBlocked;
        } else {
            //...
            // 根据时间找到插入的位置
            Message prev;
            for (;;) {
                prev = p;
                p = p.next;
                if (p == null || when < p.when) {
                    break;
                }
                //...
            }
            msg.next = p; 
            prev.next = msg;
        }

        // 如果需要则唤醒队列
        if (needWake) {
            nativeWake(mPtr);
        }
    }
    return true;
}

```

上述代码我们来总结一下:

1. 首先判断Message中的Handler不能不空，且不能为在使用中，否则抛异常

2. 对MessageQueue进行加锁，判断当前线程是否dead，如果dead则打印一个异常，并返回false

3. 初始化Message的执行时间以并且标记为正在执行中

4. 当新插入的Message在链表头时，如果messageQueue是空的或者正在等待下个延迟消息，则需要唤醒MessageQueue

5. 根据Message的执行时间，找到在链表中的插入位置进行插入，这里我们可以理解MessageQueue中维护了一个优先级队列,

   优先级队列就是链表根据时间进行排序并加入队列的数据结构形成的，例如我们发送的几个消息携带的时间分别为：1s，20ms，3s，那么这个时候就会根据时间进行排序为：20ms，1s，3s， 那么如果我新加入的一个消息的时间为2s，那么他就会插入1s和3s的中间，此时这个优先级队列就有了4个元素： 20ms，1s，2s，3s

### MessageQueue next方法介绍

到这里，Handler发送的消息已经放到了MessageQueue中，那接着肯定就要进行消息的读取，我们刚讲到Looper的`Loop`方法会从MessageQueue中循环读取消息，`loop`方法中调用`queue.next()`的地方有句源码注释：might block,中文意思是可能被阻塞，如下：

```java
public static void loop() {
  	//获取当前Looper中的MessageQueue
    final MessageQueue queue = me.mQueue;
    //...
  	//开启死循环读取消息
    for (;;) {
      // 获取消息队列中的消息
        Message msg = queue.next(); // might block
    }
  	//...
}
```

我们就看下MessageQueue的`next`方法到底做了什么：

```java
Message next() {
    // Return here if the message loop has already quit and been disposed.
    // 源码中的注释表示:如果looper已经退出了,这里就返回null
    final long ptr = mPtr;
    if (ptr == 0) {
        return null;
    }
    //...
    // 定义阻塞时间赋值为0
    int nextPollTimeoutMillis = 0;
  	//死循环
    for (;;) {
        if (nextPollTimeoutMillis != 0) {
            Binder.flushPendingCommands();
        }
        // 阻塞对应时间 这个方法最终会调用到linux的epoll机制
        nativePollOnce(ptr, nextPollTimeoutMillis);
    		// 对MessageQueue进行加锁，保证线程安全
        synchronized (this) {
            final long now = SystemClock.uptimeMillis();
            Message prevMsg = null;
            Message msg = mMessages;
            //...
            if (msg != null) {
                if (now < msg.when) {
                    // 下一个消息还没开始，等待两者的时间差
                    nextPollTimeoutMillis = (int) Math.min(msg.when - now, Integer.MAX_VALUE);
                } else {
                    // 获得消息且现在要执行，标记MessageQueue为非阻塞
                    mBlocked = false;
                    // 链表操作
                    if (prevMsg != null) {
                        prevMsg.next = msg.next;
                    } else {
                        mMessages = msg.next;
                    }
                    msg.next = null;
                    msg.markInUse();
                    return msg;
                }
            } else {
                // 没有消息，进入阻塞状态
                nextPollTimeoutMillis = -1;
            }
          	//退出
          	if (mQuitting) {
                 dispose();
                 return null;
             }
            //...涉及了同步屏障和IdleHandler,后续在分析
    }
}
```

从上面代码我们发现`next`方法目的是获取MessageQueue中的一个Message，它里面有一个死循环，如果消息队列中没有消息，那么next方法会一直阻塞在这里，当有新消息到来时，就会将它唤醒，next方法会返回这条消息并将其从优先级队列中给移除

步骤如下：

1. 如果Looper已经退出了，直接返回null
2. 进入死循环，直到获取到Message或者退出
3. 循环中先判断是否需要进行阻塞，阻塞最终会调用到linux的epoll机制，阻塞结束后,对MessageQueue进行加锁，获取Message
4. 如果MessageQueue中没有消息，则直接把线程无限阻塞等待唤醒
5. 如果MessageQueue中有消息，则判断是否需要等待，否则则直接返回对应的message

可以看到逻辑就是判断当前时间Message中是否需要等待.其中`nextPollTimeoutMillis`表示阻塞的时间，`-1`表示无限时间,直到有事件发生为止，`0`表示不阻塞

### Handler接收消息

在我们对Looper进行总结时我们说了： Handler也是实现线程切换的核心，因为不同的Looper运行在不同的线程，他所调用的dispatchMessage方法则会运行在不同的线程，所以Message的处理就会被切换到Looper所在的线程

```java
public static void loop() {
    for (;;) {
      	//...
        try {
            // 调用Message对应的Handler处理消息
            msg.target.dispatchMessage(msg);
        }
 				//...
    }
}
```

上面代码调用了 `msg.target.dispatchMessage(msg)` 方法，msg.target 就是发送该消息的 Handler，这样消息最终会回调到Handler的`dispatchMessage`方法中，看下这个方法

```java
public void dispatchMessage(@NonNull Message msg) {
  	//消息的callback不为空,则回调handleCallback方法
    if (msg.callback != null) {
        handleCallback(msg);
     } else {
      		//当前mCallback不为空,回调mCallback.handleMessage方法
     			if (mCallback != null) {
              if (mCallback.handleMessage(msg)) {
                  return;
              }
          }
      		//回调handleMessage
          handleMessage(msg);
     }
}
```

上述代码步骤:

1、首先，检查Message的callback是否为null，不为null就通过`handleCallBack`来处理消息，Message的callback是一个Runnable对象，实际上就是Handler的`post`系列方法所传递的Runnable参数，`handleCallBack`方法处理逻辑也很简单，如下:

```java
private static void handleCallback(Message message) {
     message.callback.run();
}
```

2、其次，检查mCallback是否为null，不为null就调用mCallback的`handleMessage`方法来处理消息。Callback是个接口，如下：

```java
/**
 * Callback interface you can use when instantiating a Handler to avoid
 * having to implement your own subclass of Handler.
 */
public interface Callback {
    boolean handleMessage(@NonNull Message msg);
}
```

通过Callback可以采用如下方式来创建Handlere对象：

```java
Handler handler = new Handler(callback);
```

那Callback的意义是什么呢？源码里注释做了说明：可以用来创建一个Handler的实例但并不需要派生的子类。在日常开发中，创建Handler最常见的就是派生一个Handler的子类并重写其`handleMessage`方法来处理具体的消息，而Callback给我们提供了另外一种使用Handler的方式，当我们不想派生子类时，就可以通过Callback来实现。

3、最后，调用Handler的`handleMessage`方法来处理消息

Handler处理消息的过程我画了一张图，如下：

![image-20210131222054614](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281532893.png)

### Message介绍

Message是负责承载消息的类，主要是关注他的内部属性：

```java
// 用户自定义，主要用于辨别Message的类型
public int what;
// 用于存储一些整型数据
public int arg1;
public int arg2;
// 可放入一个可序列化对象
public Object obj;
// Bundle数据
Bundle data;
// Message处理的时间。相对于1970.1.1而言的时间
// 对用户不可见
public long when;
// 处理这个Message的Handler
// 对用户不可见
Handler target;
// 当我们使用Handler的post方法时候就是把runnable对象封装成Message
// 对用户不可见
Runnable callback;
// MessageQueue是一个链表，next表示下一个
// 对用户不可见
Message next;
```

#### 循环利用Message

当我们获取Message的时候，官方建议是通过Message.obtain()方法来获取，当使用完之后使用recycle()方法来回收循环利用。而不是直接new一个新的对象：

```java
public static Message obtain() {
    synchronized (sPoolSync) {
        if (sPool != null) {
            Message m = sPool;
            sPool = m.next;
            m.next = null;
            m.flags = 0; 
            sPoolSize--;
            return m;
        }
    }
    return new Message();
}
```

Message维护了一个静态链表，链表头是`sPool`，Message有一个next属性，Message本身就是链表结构。`sPoolSync`是一个object对象，仅作为解决并发访问安全设计。当我们调用obtain来获取一个新的Message的时候，首先会检查链表中是否有空闲的Message，如果没有则新建一个返回。

当我们使用完成之后，可以调用Message的recycle方法进行回收，如果这个Message正在使用则会抛出异常，否则则调用`recycleUnchecked`进行回收，把Message中的内容清空，然后判断链表是否达到最大值（50），然后插入链表中

## Handler消息机制原理总结

通过上面的源码分析，我们可以得出结论：

1. 实例化Handler之前，需先构建当前线程的Looper并开启消息循环
2. 通过Handler的send和post方法发送消息
3. 发送的消息会加入到MessageQueue中，等待Looper获取处理
4. Looper会不断地从MessageQueue中获取Message然后交付给对应的Handler处理

如果到这里你还不是特别清楚Handler消息机制的原理，那么继续看下面这张图：

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281532817.png)

好了，到了这里，关于Handler消息机制的主体部分就讲完了。

限于篇幅，本篇文章就到这里了，后续我会在写一篇关于Handler的文章，介绍Hanlder的一些扩展知识学习，并回答前面我所列出来的一系列问题

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
