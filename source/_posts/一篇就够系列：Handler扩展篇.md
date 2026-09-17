---
title: 一篇就够系列：Handler扩展篇
date: 2022-10-11 10:50:51
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

在[上一篇](https://juejin.cn/post/6924084444609544199)中，我们对Handler的主体部分进行了讲解，今天，我们就来学习一下Handler相关的一些扩展知识，讲完这些扩展知识后，在来回答之前列出来的一系列问题

## 同步屏障

通过上一篇的学习，我们知道: Handler发送的Message会放入到MessageQueue中，MessageQueue中维护了一个优先级队列，优先级队列的意思就是将存储数据的单链表按照时间升序进行排序形成的，Looper则按照顺序，每次从这个优先级队列中取出一个Message进行分发，一个处理完就处理下一个。

那么问题来了：我能不能让我的一个Message被优先处理？

可以，使用同步屏障

这里，我心里又会有个疑问，什么是同步屏障？怎么使用同步屏障？同步屏障有啥作用？带着这些疑问🤔️，我们来分析下源码

先看下MessageQueue的`next`方法，在上一篇中，我们省略了一部分代码，其中有一部分是这样子的，仅贴出关键代码

```java
Message next() {
    //...
    for (;;) {
        synchronized (this) {
            if (msg != null && msg.target == null) {
                // Stalled by a barrier.  Find the next asynchronous message in the queue.
                do {
                     prevMsg = msg;
                     msg = msg.next;
                } while (msg != null && !msg.isAsynchronous());
            }
    }
}
```

上述代码：

1、判断当前msg不为空并且msg.target为空，则进入条件体里面

2、条件体里面有一行源码注释，翻译过来就是: **被一个屏障给阻碍。在队列中查找下一个异步消息**

3、接下来就是一个循环，遍历找出一条异步消息，循环体里面就是链表相关的操作

这里大家是不是会有个疑问？msg.target怎么可能会为空呢？之前发送消息的一系列方法不是都会给msg.target对象赋值吗？

没错，我们在回顾一下Handler的`enqueueMessage`：

```java
private boolean enqueueMessage(@NonNull MessageQueue queue, @NonNull Message msg,long uptimeMillis) {
     //将当前Handler赋值给msg.target
     msg.target = this;
     msg.workSourceUid = ThreadLocalWorkSource.getUid();
     if (mAsynchronous) {
         msg.setAsynchronous(true);
     }
     //调用MessageQueue的enqueueMessage方法
     return queue.enqueueMessage(msg, uptimeMillis);
}
```

我们知道Handler的`post`和`send`系列方法发送的消息，最终都会走到这个方法，msg.target都会被赋值，因此不可能为空。那msg.target啥时候会为空呢？我们推断肯定是其他发送消息的方法使得msg.target为空，那我们就找一下，会发现MessageQueue的`postSyncBarrier`的方法中没有给msg.target对象赋值：

```java
public int postSyncBarrier() {
    return postSyncBarrier(SystemClock.uptimeMillis());
}

private int postSyncBarrier(long when) {
     // Enqueue a new sync barrier token.
     // We don't need to wake the queue because the purpose of a barrier is to stall it.
     synchronized (this) {
         final int token = mNextBarrierToken++;
         final Message msg = Message.obtain();
         msg.markInUse();
         msg.when = when;
         msg.arg1 = token;

         Message prev = null;
         Message p = mMessages;
         if (when != 0) {
             while (p != null && p.when <= when) {
                 prev = p;
                 p = p.next;
             }
         }
         if (prev != null) { // invariant: p == prev.next
             msg.next = p;
             prev.next = msg;
         } else {
             msg.next = p;
             mMessages = msg;
         }
         return token;
     }
 }
```

上述代码就是往消息队列中合适的位置插入target属性为null的Message

因此我们是不是可以知道，Message的target属性为空和非空是很不一样的，这里就不卖关子了，直接给结论: **target属性为空的Message就是同步屏障，他是一种特殊的消息，并不会被消费，仅仅是作为一个标识处于 MessageQueue 中，当MessageQueue的`next`方法遇到同步屏障的时候，就会循环遍历整个链表找到标记为异步消息的Message，其他的消息会直接忽视，那么这样异步消息就会提前被执行了**

现在我们现在就可以回答上面的问题了：**target属性为空的Message就是同步屏障，同步屏障可以使得异步消息优先被处理，通过MessageQueue的`postSyncBarrier`可以添加一个同步屏障**

**注意**: **在异步消息处理完之后，同步屏障并不会被移除，需要我们手动移除，从上面的源码我们也可以看出，如果不移除同步屏障，那么他会一直在那里，这样同步消息就永远无法被执行了。**

因此我们在使用完同步屏障后，需要手动移除，代码如下: 

```java
public void removeSyncBarrier(int token) {
     // Remove a sync barrier token from the queue.
     // If the queue is no longer stalled by a barrier then wake it.
     synchronized (this) {
         Message prev = null;
         Message p = mMessages;
         while (p != null && (p.target != null || p.arg1 != token)) {
             prev = p;
             p = p.next;
         }
         if (p == null) {
             throw new IllegalStateException("The specified message queue synchronization "
                     + " barrier token has not been posted or has already been removed.");
         }
         final boolean needWake;
         if (prev != null) {
             prev.next = p.next;
             needWake = false;
         } else {
             mMessages = p.next;
             needWake = mMessages == null || mMessages.target != null;
         }
         p.recycleUnchecked();

         // If the loop is quitting then it is already awake.
         // We can assume mPtr != 0 when mQuitting is false.
         if (needWake && !mQuitting) {
             nativeWake(mPtr);
         }
     }
 }
```

到这里我心里又有一个疑问了？怎么把一个消息变成异步消息呢？还是回到Handler的`enqueueMessage`方法：

```java
private boolean enqueueMessage(@NonNull MessageQueue queue, @NonNull Message msg,long uptimeMillis) {
     msg.target = this;
     msg.workSourceUid = ThreadLocalWorkSource.getUid();
     //如果mAsynchronous，则将该消息设置为异步消息
     if (mAsynchronous) {
         msg.setAsynchronous(true);
     }
     return queue.enqueueMessage(msg, uptimeMillis);
}
```

从上述代码我是可以看到，通过msg.setAsynchronous方法设置为true，可以把一个消息变成异步消息，但是前提得满足mAsynchronous属性为true，mAsynchronous是Handler中的一个属性，他会在这两个构造方法中被赋值：

```java
@UnsupportedAppUsage
public Handler(@NonNull Looper looper, @Nullable Callback callback, boolean async) {
    //...
    mAsynchronous = async;
}

public Handler(@Nullable Callback callback, boolean async) {
    //...
    mAsynchronous = async;
}
```

因此我们是不是可以得出结论，把一个消息设置为异步消息，有两种方式：

1、在Handler的构造方法中，传入async为true，那么这个时候发送的Message就都是异步的的消息

2、给Message通过`setAsynchronous` 方法标志为异步

但是，上面两个构造方法对外是不可见的，我们调用不到，而且设置同步屏障的方法对外也是不可见的，说明谷歌不想要我们去使用他。所以这里同步屏障也是作为一个了解，一般只有系统会去使用它，例如：在进行UI绘制的时候，以下是ViewRootImpl中执行UI绘制的方法使用到了同步屏障:

```java
@UnsupportedAppUsage
void scheduleTraversals() {
    if (!mTraversalScheduled) {
        mTraversalScheduled = true;
        mTraversalBarrier = mHandler.getLooper().getQueue().postSyncBarrier();
        mChoreographer.postCallback(
                Choreographer.CALLBACK_TRAVERSAL, mTraversalRunnable, null);
        if (!mUnbufferedInputDispatch) {
            scheduleConsumeBatchedInput();
        }
        notifyRendererOfFramePending();
        pokeDrawLockIfNeeded();
    }
}

void unscheduleTraversals() {
    if (mTraversalScheduled) {
        mTraversalScheduled = false;
        mHandler.getLooper().getQueue().removeSyncBarrier(mTraversalBarrier);
        mChoreographer.removeCallbacks(
                Choreographer.CALLBACK_TRAVERSAL, mTraversalRunnable, null);
    }
}
```

上述代码在把绘制消息放入队列之前，先放入了一个同步屏障，然后在发送异步绘制消息，从而使得界面绘制的消息会比其他消息优先执行，避免了因为 MessageQueue 中消息太多导致绘制消息被阻塞导致画面卡顿，当绘制完成后，就会将同步屏障移除。

## IdleHandler

见名知意，idle是空闲的意思，那么IdleHandler就是空闲的Handler，有点这个意思，实际上它是MessageQueue中有一个静态接口

```java
public static interface IdleHandler {
    boolean queueIdle();
}
```

可以看到它是一个单方法的接口，也可称为函数型接口，它的作用是：**在UI线程处理完所有View事务后，回调一些额外的操作，且不会堵塞主进程；**我们来实际操作一下

```java
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        new Handler().getLooper().getQueue().addIdleHandler(new MessageQueue.IdleHandler() {
            @Override
            public boolean queueIdle() {
                Log.d("print", "queueIdle: 空闲时做一些轻量级别");
                return false;
            }
        });
    }
}

//上面代码会打印如下结果
queueIdle: 空闲时做一些轻量级别
```

接着进行源码分析，我们在看下`addIdleHandler`这个方法：

```java
public void addIdleHandler(@NonNull IdleHandler handler) {
    if (handler == null) {
        throw new NullPointerException("Can't add a null IdleHandler");
    }
    synchronized (this) {
        mIdleHandlers.add(handler);
    }
}
```

可以看到，被添加进来的handler放到了mIdleHandlers，跟过去看下mIdleHandlers，会发现MessageQueue中定义了IdleHandler的集合和数组，并且有一些操作方法，如下：

```java
private final ArrayList<IdleHandler> mIdleHandlers = new ArrayList<IdleHandler>();
private IdleHandler[] mPendingIdleHandlers;

public void addIdleHandler(@NonNull IdleHandler handler) {
    if (handler == null) {
        throw new NullPointerException("Can't add a null IdleHandler");
    }
    synchronized (this) {
        mIdleHandlers.add(handler);
    }
}

public void removeIdleHandler(@NonNull IdleHandler handler) {
    synchronized (this) {
        mIdleHandlers.remove(handler);
    }
}
```

最后在看下MessageQueue中的`Next`方法，仅贴出关键代码：

```java
Message next() {
  	int pendingIdleHandlerCount = -1; // -1 only during first iteration
    for (;;) {
        //...
        synchronized (this) {
             //...
             //当前无消息，或还需要等待一段时间消息才能分发，获得IdleHandler的数量
             if (pendingIdleHandlerCount < 0 && (mMessages == null || now < mMessages.when)) {
                 pendingIdleHandlerCount = mIdleHandlers.size();
             }
          
          	 if (pendingIdleHandlerCount <= 0) {
                 // No idle handlers to run.  Loop and wait some more.
               	 //如果没有idle handler需要执行，阻塞线程进入下次循环
                 mBlocked = true;
                 continue;
             }
	     //初始化mPendingIdleHandlers
             if (mPendingIdleHandlers == null) {
                 mPendingIdleHandlers = new IdleHandler[Math.max(pendingIdleHandlerCount, 4)];
             }
             //把List转化成数组类型
             mPendingIdleHandlers = mIdleHandlers.toArray(mPendingIdleHandlers);
         }
      
        //循环遍历所有的IdleHandler
        for (int i = 0; i < pendingIdleHandlerCount; i++) {
            final IdleHandler idler = mPendingIdleHandlers[i];
            mPendingIdleHandlers[i] = null; // release the reference to the handler

            boolean keep = false;
            try {
              	//获得idler.queueIdle的返回值
                keep = idler.queueIdle();
            } catch (Throwable t) {
                Log.wtf(TAG, "IdleHandler threw exception", t);
            }
            //keep即idler.queueIdle的返回值，如果为false表明只要执行一次，并移除，否则不移除
            if (!keep) {
                synchronized (this) {
                    mIdleHandlers.remove(idler);
                }
            }
         }
         // Reset the idle handler count to 0 so we do not run them again.
      	 //将pendingIdleHandlerCount置为0避免下次再次执行
         pendingIdleHandlerCount = 0;
      
      	 // 当在执行IdleHandler的时候，可能有新的消息已经进来了
         // 所以这个时候不能阻塞，要回去循环一次看一下
         nextPollTimeoutMillis = 0;
    }
}
```

上述代码解析：

1、当调用next方法的时候，会将pendingIdleHandlerCount赋值为-1

2、判断pendingIdleHandlerCount是否小于0并且MessageQueue 是否为空或者有延迟消息需要执行，如果是则把存储IdleHandler的list的长度赋值给pendingIdleHandlerCount

3、判断如果没有IdleHandler需要执行，阻塞线程进入下次循环，如果有，则初始化mPendingIdleHandlers，把list中的所有IdleHandler放到数组中。这一步是为了不让在执行IdleHandler的时候List被插入新的IdleHandler，造成逻辑混乱

4、循环遍历所有的IdleHandler并执行，查看idler.queueIdle方法的返回值，为false表明这个IdleHandler只需要执行一次，并移除，为true，则不移除

5、将pendingIdleHandlerCount置为0避免下次再次执行， 当在执行IdleHandler的时候，可能有新的消息已经进来了，所以这个时候不能阻塞，要回去循环一次看一下

到这里同步屏障和IdleHandler都讲完了，建议读者配合完整的源码在去仔细阅读一次。

**实际应用**: 可以在IdleHandler里面获取View的宽高

## 主线程消息循环

在上一篇中我们讲到，ActivityThread就是主线程，也可以说是UI线程，在主线程的`main方法中`创建了Looper，并开启了消息循环：

```java
public static void main(String[] args) {
  //...
  //创建Looper
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

主线程的消息循环开始了以后，ActivityThread还需要有一个Handler来和消息队列进行交互，这个Handler就是ActivityThread.H，它内部定义了很多的消息类型，例如四大组件的启动，Application的启动等等

```java
class H extends Handler {
        public static final int BIND_APPLICATION        = 110;
        @UnsupportedAppUsage
        public static final int EXIT_APPLICATION        = 111;
        @UnsupportedAppUsage
        public static final int RECEIVER                = 113;
        @UnsupportedAppUsage
        public static final int CREATE_SERVICE          = 114;
        @UnsupportedAppUsage
        public static final int SERVICE_ARGS            = 115;
        @UnsupportedAppUsage
        public static final int STOP_SERVICE            = 116;

        public static final int CONFIGURATION_CHANGED   = 118;
        public static final int CLEAN_UP_CONTEXT        = 119;
        @UnsupportedAppUsage
        public static final int GC_WHEN_IDLE            = 120;
        @UnsupportedAppUsage
        public static final int BIND_SERVICE            = 121;
        @UnsupportedAppUsage
        public static final int UNBIND_SERVICE          = 122;
        public static final int DUMP_SERVICE            = 123;
        public static final int LOW_MEMORY              = 124;
        public static final int PROFILER_CONTROL        = 127;
        public static final int CREATE_BACKUP_AGENT     = 128;
        public static final int DESTROY_BACKUP_AGENT    = 129;
        public static final int SUICIDE                 = 130;
     		//...
        public void handleMessage(Message msg) {
          	//...
        }
}
```

关于ActivityThread.H的实际应用，我们在看[Activity的启动流程](https://juejin.cn/post/6847902222294990862)可能会有比较深入的理解，ActivityThread通过ApplicationThread和AMS进行进程间通信的方式完成ActivityThread的请求后，会回调ApplicationThread中的Binder方法，然后ApplicationThread会向H发送消息，H收到消息后会将ApplicationThread中的逻辑切换到ActivityThread中去执行，即切换到主线程去执行，这个过程就是主线程的消息循环模型

## 妙用 Looper 机制

1、我们可以通过Looper`getMainLooper`方法获取主线程Looper，从而可以判断当前线程是否是主线程

2、将 Runnable post 到主线程执行

```java
public final class MainThread {

    private MainThread() {
    }

    private static final Handler HANDLER = new Handler(Looper.getMainLooper());

    public static void run(@NonNull Runnable runnable) {
        if (isMainThread()) {
            runnable.run();
        }else{
            HANDLER.post(runnable);
        }
    }

    public static boolean isMainThread() {
        return Looper.myLooper() == Looper.getMainLooper();
    }
}
```

## 子线程使用Handler及相关注意事项

我们通常使用Handler都是从子线程发送消息到主线程去处理，那么这里我们尝试一下从主线程发送消息到子线程来处理，上代码：

```java
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //创建线程实例并开启
        MyThread myThread = new MyThread();
        myThread.start();
        //打开这段注释就不会crash，且看下面分析
//      try {
//          Thread.sleep(500);
//      } catch (InterruptedException e) {
//          e.printStackTrace();
//      }
        //获取Handler发送消息
        myThread.getHandler().sendEmptyMessage(0x001);
    }

    public static class MyThread extends Thread {
        private Handler mHandler;

        public void run() {
            Looper.prepare();
            mHandler = new Handler() {
                public void handleMessage(@NonNull Message msg) {
                    if(msg.what == 0x001){
                        Log.d("print", "handleMessage: ");
                    }
                }
            };
            Looper.loop();
        }

        public Handler getHandler(){
            return mHandler;
        }
    }
}
```

运行一下上述代码，发现会Crash，如下图：

![image-20210223112129732](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281531397.png)

报了一个空指针异常，原因就是多线程并发，当主线程执行到sendEnptyMessage时，子线程的Handler还没有创建。因此我们可以在获取Handler的时候让主线程休眠一下在执行，应用就不会Crash了，打开上面代码的注释即可

**值得注意的是**：我们自己创建的Looper在使用完毕后应该调用`quit`方法来终止消息循环，如果不退出的话，那么该线程的Looper处理完所有的消息后，就会处于一个阻塞状态，要知道线程是比较重量级的，如果一直存在，肯定会对应用性能造成一定的影响。而如果退出Looper，这个线程就会立刻终止，因此建议不需要的时候终止Looper。

因此在子线程使用Handler，我们需要注意一下两点：

**1、必须调用` Looper.prepare()`创建当前线程的 Looper，并调用`Looper.loop()`开启消息循环**

**2、必须在使用结束后调用Looper的`quit`方法退出当前线程**

## HandlerThread

上面讲到主线程发送消息到子线程来处理，其实Android已经给我们提供了一个这样轻量级的异步类，那就是HandlerThread

HandlerThread的实现原理也比较简单：**继承Thread并对Looper进行了封装**

具体源码就不过多分析了，大家有兴趣的可以去看一下，也就100多行代码，这里主要讲解一下使用：

```java
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
      	//1，创建Handler实例
      	HandlerThread mHandlerThread = new HandlerThread("HandlerThread");
      	//2，启动线程
        mHandlerThread.start();
      	//3，使用传入Looper为参数的构造方法创建Handler实例
        Handler mHandler = new Handler(mHandlerThread.getLooper()){
            @Override
            public void handleMessage(@NonNull Message msg) {
                Log.d("print", "当前线程: " + Thread.currentThread().getName() + " handleMessage");
            }
        };
        //4，使用Handler发送消息
        mHandler.sendEmptyMessage(0x001);
      	//5，在合适的时机调用HandlerThread的quit方法，退出消息循环
    }
}

//上述代码打印结果:
当前线程: HandlerThread handleMessage
```

### Handler  HandlerThread  Thread三者区别

**Handler**：在Android中负责发送和处理消息

**HandlerThread**：继承自Thread，对Looper进行了封装，也就是说它在子线程维护了一个Looper，方便我们在子线程中去处理消息

**Thread**: cpu执行的最小单位，即线程，它在执行完后就立马结束了，并不能去处理消息。如果要处理，需要配合Looper，Handler一起使用

## 子线程弹Toast

```java
//1
new Thread(){
    @Override
    public void run() {
        Toast.makeText(MainActivity.this, "子线程弹Toast", Toast.LENGTH_SHORT).show();
    }
}.start();

//2
new Thread(){
    @Override
    public void run() {
        Looper.prepare();
        Toast.makeText(MainActivity.this, "子线程弹Toast", Toast.LENGTH_SHORT).show();
        Looper.loop();
    }
}.start();
```

上述1代码运行会奔溃，会报这么一个异常提示：**"Can't toast on a thread that has not called Looper.prepare()"**

原因就是Toast的实现也是依赖Handler，而我们知道在子线程中创建Handler，需先创建Looper并开启消息循环，这点在Toast中的源码也有体现，如下图：

![image-20210223131023498](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4fb7b199888404f864e1d0c43d0dc7f~tplv-k3u1fbpfcp-zoom-1.image)

因此我们在子线程创建Toast就需要使用上述2代码的方式

## 子线程弹Dialog

```java
new Thread(){
    @Override
  	public void run() {
            Looper.prepare();
      	    new AlertDialog.Builder(MainActivity.this)
                  .setTitle("标题")
                  .setMessage("子线程弹Dialog")
                  .setNegativeButton("取消",null)
                  .setPositiveButton("确定",null)
                  .show();
            Looper.loop();     
    }    
}.start();
```

和上面Toast差不多，这里贴出正确的代码示例，它的实现也是依赖Handler，我们在它的源码中可以看到：

```java
private final Handler mHandler = new Handler();
```

他直接就new了一个Handler实例，我们知道，创建Handler，需要先创建Looper并开启消息循环，主线程中已经给我们创建并开启消息循环，而子线程中并没有，如果不创建那就会报这句经典的异常提示：**"Can't create handler inside thread that has not called Looper.prepare() "**，因此在子线程中，需要我们手动去创建并开启消息循环

到这里，Handler相关的扩展知识就全部讲完了，我们会发现也有着很多使用的小技巧，比如 IdleHandler，判断是否是主线程等等

由于 Handler 的特性，它在 Android 里的应用非常广泛，比如： AsyncTask、HandlerThread、Messenger、IdleHandler 和 IntentService 等等，下面我们来回答上一篇中列出来的一系列问题

## 问题

### 1、Handler有哪些作用?

答：

 1、Handler能够进行线程之间的切换 

2、Handler能够按照顺序处理消息，避免并发 

3、Handler能够阻塞线程 

4、Handler能够发送并处理延迟消息

解析: 

1、Handler能够进行线程之间的切换，是因为使用了不同线程的Looper处理消息

2、Handler能够按照顺序处理消息，避免并发，是因为消息在入队的时候会按照时间升序对当前链表进行排序，Looper读取的时候，MessageQueue的`next`方法会循环加锁，同时配合阻塞唤醒机制

3、Handler能够阻塞线程主要是基于Linux的epoll机制实现的

4、Handler能够处理延迟消息，是因为MessageQueue的`next`方法中会拿当前消息时间和当前时间做比较，如果是延迟消息，那么就会阻塞当前线程，等阻塞时间到，在执行该消息

### 2、为什么我们能在主线程直接使用Handler，而不需要创建Looper？

答：主线程已经创建了Looper，并开启了消息循环

### 3、如果想要在子线程创建Handler，需要做什么准备？

答：需要先创建Looper，并开启消息循环

### 4、一个线程有几个Handler？

答：可以有任意多个

### 5、一个线程有几个Looper？如何保证？

答：一个线程只有一个Looper，通过ThreadLocal来保证

### 6、Handler发送消息的时候，时间为啥要取SystemClock.uptimeMillis() + delayMillis，可以把SystemClock.uptimeMillis() 换成System.currentTimeMillis()吗？

答：不可以

**SystemClock.uptimeMillis()** 这个方法获取的时间，是自系统开机到现在的一个毫秒数，这个时间是个相对的

**System.currentTimeMillis()** 这个方法获取的是自**1970-01-01 00:00:00** 到现在的一个毫秒数，这是一个和系统强关联的时间，而且这个值可以做修改

1、使用System.currentTimeMillis()可能会导致延迟消息失效

2、最终这个时间会被设置到Message的when属性，而Message的when属性只是需要一个时间差来表示消息的先后顺序，使用一个相对时间就行了，没必要使用一个绝对时间

### 7、为什么Looper死循环，却不会导致应用卡死？

答：因为当Looper处理完所有消息的时候，会调用Linux的epoll机制进入到阻塞状态，当有新的Message进来的时候会打破阻塞继续执行。

应用卡死即ANR: 全称Applicationn Not Responding，中文意思是应用无响应，当我发送一个消息到主线程，Handler经过一定时间没有执行完这条消息，那么这个时候就会抛出ANR异常

Looper死循环: 循环执行各种事务，Looper死循环说明线程还活着，如果没有Looper死循环，线程结束，应用就退出了，当Looper处理完所有消息的时候会调用Linux的epoll机制进入到阻塞状态，当有新的Message进来的时候会打破阻塞继续执行

### 8、Handler内存泄露原因? 如何解决？

内存泄漏的本质是长生命周期的对象持有短生命周期对象的引用，导致短生命周期的对象无法被回收，从而导致了内存泄漏

下面我们就看个导致内存泄漏的例子

```java
public class MainActivity extends AppCompatActivity {

    private final Handler mHandler = new Handler() {
        @Override
        public void handleMessage(@NonNull Message msg) {
           //do something
        }
    };
  
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //发送一个延迟消息，10分钟后在执行
        mHandler.sendEmptyMessageDelayed(0x001,10*60*1000);
    }
}
```

上述代码:

1、我们通过匿名内部类的方式创建了一个Handler的实例

2、在`onCreate`方法里面通过Handler实例发送了一个延迟10分钟执行的消息

我们发送的这个延迟10分钟执行的消息它是持有Handler的引用的，根据Java特性我们又知道，非静态内部类会持有外部类的引用，因此当前Handler又持有Activity的引用，而Message又存在MessageQueue中，MessageQueue又在当前线程中，因此会存在一个引用链关系:

**当前线程->MessageQueue->Message->Handler->Activity**

因此当我们退出Activity的时候，由于消息需要在10分钟后在执行，因此会一直持有Activity，从而导致了Activity的内存泄漏

通过上面分析我们知道了内存泄漏的原因就是持有了Activity的引用，那我们是不是会想，切断这条引用，那么如果我们需要用到Activity相关的属性和方法采用弱引用的方式不就可以了么？我们实际操作一下，把Handler写成一个静态内部类

```java
public class MainActivity extends AppCompatActivity {

  	private final SafeHandler mSafeHandler = new SafeHandler(this);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
      	//发送一个延迟消息，10分钟后在执行
        mSafeHandler.sendEmptyMessageDelayed(0x001,10*60*1000);
    }

    //静态内部类并持有Activity的弱引用
    private static class SafeHandler extends Handler{
      
        private final WeakReference<MainActivity> mWeakReference;
      
        public SafeHandler(MainActivity activity){
            mWeakReference = new WeakReference<>(activity);
        }

        @Override
        public void handleMessage(@NonNull Message msg) {
            MainActivity mMainActivity = mWeakReference.get();
            if(mMainActivity != null){
                //do something
            }
        }
    }
}
```

上述代码

1、把Handler定义成了一个静态内部类，并持有当前Activity的弱引用，弱引用会在Java虚拟机发生gc的时候把对象给回收掉

经过上述改造，我们解决了Activity的内存泄漏，此时的引用链关系为:

**当前线程->MessageQueue->Message->Handler**

我们会发现Message还是会持有Handler的引用，从而导致Handler也会内存泄漏，所以我们应该在Activity销毁的时候，在他的生命周期方法里，把MessageQueue中的Message都给移除掉，因此最终就变成了这样：

```java
public class MainActivity extends AppCompatActivity {

  	private final SafeHandler mSafeHandler = new SafeHandler(this);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
      	//发送一个延迟消息，10分钟后在执行
        mSafeHandler.sendEmptyMessageDelayed(0x001,10*60*1000);
    }
  
  	@Override
    protected void onDestroy() {
        super.onDestroy();
        mSafeHandler.removeCallbacksAndMessages(null);
    }

    //静态内部类并持有Activity的弱引用
    private static class SafeHandler extends Handler{
      
        private final WeakReference<MainActivity> mWeakReference;
      
        public SafeHandler(MainActivity activity){
            mWeakReference = new WeakReference<>(activity);
        }

        @Override
        public void handleMessage(@NonNull Message msg) {
            MainActivity mMainActivity = mWeakReference.get();
            if(mMainActivity != null){
                //do something
            }
        }
    }
}
```

因此当Activity销毁后，引用链关系为:

**当前线程->MessageQueue**

而当前线程和MessageQueue的生命周期和应用生命周期是一样长的，因此也就不存在内存泄漏了，完美。

所以解决Handler内存泄漏最好的方式就是：**将Handler定义成静态内部类，内部持有Activity的弱引用，并在Activity销毁的时候移除所有消息**

### 9、线程维护的Looper，在消息队列无消息时的处理方案是什么？有什么用？

答：当消息队列无消息时，Looper会阻塞当前线程，释放cpu资源，提高App性能

我们知道Looper的`loop`方法中有个死循环一直在读取MessageQueue中的消息，其实是调用了MessageQueue中的`next`方法，这个方法会在无消息时，调用Linux的epoll机制，使得线程进入阻塞状态，当有新消息到来时，就会将它唤醒，next方法里会判断当前消息是否是延迟消息，如果是则阻塞线程，如果不是，则会返回这条消息并将其从优先级队列中给移除

### 10、MessageQueue什么情况下会被唤醒？

答：需要分情况

1、发送消息过来，此时MessageQueue中无消息或者当前发送过来的消息携带的when为0或者有延迟执行的消息，那么需要唤醒

2、当遇到同步屏障且当前发送过来的消息为异步消息，判断该异步消息是否插入在所有异步消息的队首，如果是则需要唤醒，如果不是，则不唤醒

### 11、线程什么情况下会被阻塞？

答：分情况

1、当MessageQueue中没有消息的时候，这个时候会无限阻塞，

2、当前MessageQueue中全部是延迟消息，阻塞时间为(当前延迟消息时间 - 当前时间)，如果这个阻塞时间超过来Integer类型的最大值，则取Integer类型的最大值

### 12、我们可以使用多个Handler往消息队列中添加数据，那么可能存在发消息的Handler存在不同的线程，那么Handler是如何保证MessageQueue并发访问安全的呢？

答：循环加锁，配合阻塞唤醒机制

我们可以发现MessageQueue其实是“生产者-消费者”模型，Handler不断地放入消息，Looper不断地取出，这就涉及到死锁问题。如果Looper拿到锁，但是队列中没有消息，就会一直等待，而Handler需要把消息放进去，锁却被Looper拿着无法入队，这就造成了死锁。Handler机制的解决方法是**循环加锁**。在MessageQueue的next方法中：

```java
Message next() {
   ...
    for (;;) {
  ...
        nativePollOnce(ptr, nextPollTimeoutMillis);
        synchronized (this) {
            ...
        }
    }
}
```

我们可以看到他的等待是在锁外的，当队列中没有消息的时候，他会先释放锁，再进行等待，直到被唤醒。这样就不会造成死锁问题了。

那在入队的时候会不会因为队列已经满了然后一边在等待消息处理一边拿着锁呢？这一点不同的是MessageQueue的消息没有上限，或者说他的上限就是JVM给程序分配的内存，如果超出内存会抛出异常，但一般情况下是不会的。

### 13、Handler是如何进行线程切换的呢？

答：使用不同线程的Looper处理消息

我们通常处理消息是在Handler的`handleMessage`方法中，那么这个方法是在哪里回调的呢？看下面这段代码

```java
public static void loop() {
    //开启死循环读取消息
    for (;;) {
         // 调用Message对应的Handler处理消息
         msg.target.dispatchMessage(msg);
    }
}
```

上述代码中`msg.target`其实就是我们发送消息的Handler，因此他会回调Handler的`dispatchMessage`方法，而`dispatchMessage`这个方法我们在上一篇中重点分析过，其中有一部分逻辑就是会回调到Handler的`handleMessage`方法，我们还可以发现，Handler的`handleMessage`方法所在的线程是由Looper的`loop`方法决定的。平时我们使用的时候，是从异步线程发送消息到 Handler，而这个 Handler 的 `handleMessage()` 方法是在主线程调用的，因为Looper是在主线程创建的，所以消息就从异步线程切换到了主线程。

### 14、我们在使用Message的时候，应该如何去创建它？

答：Android 给 Message 设计了回收机制，官方建议是通过`Message.obtain`方法来获取，而不是直接new一个新的对象，所以我们在使用的时候应尽量复用 Message ，减少内存消耗，方式有二：

1、调用 Message 的一系列静态重载方法 `Message.obtain`  获取

2、通过 Handler 的公有方法 `handler.obtainMessage`，实际上`handler.obtainMessage`内部调用的也是`Message.obtain`的重载方法

### 15、Handler里面藏着的CallBack能做什么？

答: 利用此CallBack拦截Handler的消息处理

在上一篇中我们分析到，`dispatchMessage`方法的处理步骤:

1、首先，检查Message的callback是否为null，不为null就通过`handleCallBack`来处理消息，Message的callback是一个Runnable对象，实际上就是Handler的`post`系列方法所传递的Runnable参数

2、其次，检查Handler里面藏着的CallBack是否为null，不为null就调用mCallback的`handleMessage`方法来处理消息，并判断其返回值：为true，那么 Handler 的 `handleMessage(msg)` 方法就不会被调用了；为false，那么就意味着**一个消息可以同时被 Callback 以及 Handler 处理**。

3、最后，调用Handler的`handleMessage`方法来处理消息

通过上面分析我们知道Handler处理消息的顺序是：**Message的Callback > Handler的Callback > Handler的`handleMessage`方法**

使用场景: Hook ActivityThread.mH ， 在 ActivityThread 中有个成员变量 `mH` ，它是个 Handler，又是个极其重要的类，几乎所有的插件化框架都使用了这个方法。

### 16、Handler阻塞唤醒机制是怎么一回事？

答： Handler的阻塞唤醒机制是基于Linux的阻塞唤醒机制。

这个机制也是类似于handler机制的模式。在本地创建一个文件描述符，然后需要等待的一方则监听这个文件描述符，唤醒的一方只需要修改这个文件，那么等待的一方就会收到文件从而打破唤醒。和Looper监听MessageQueue，Handler添加message是比较类似的。具体的Linux层知识读者可通过这篇文章详细了解（[传送门](https://mp.weixin.qq.com/s/Ylc5mPwMzWoK2CIthZy0Vw)）

### 17、什么是Handler的同步屏障？

答: 同步屏障是一种使得异步消息可以被更快处理的机制

### 18、能不能让一个Message被加急处理？

答：可以，添加加同步屏障，并发送异步消息

### 19、什么是IdleHandler？

答: IdleHandler是MessageQueue中一个静态函数型接口，它在主线程执行完所有的View事务后，回调一些额外的操作，且不会阻塞主线程

## 总结

Handler消息机制在Android系统源码中进行了大量的使用，可以说是涉及了Android的方方面面，比如我们四大组件的启动，Application的创建等等，学好Handler相关的知识，可以帮助我们更好的去阅读Android源码，而且Handler在我们日常开发中直接或间接的会被用到。同时通过对Handler源码的学习，让我感受到了代码设计的背后，蕴藏着工程师大量的智慧，心里直呼666，哈哈。

到了这里，关于Handler相关的知识就都讲完了，如果你还有什么问题，评论区告诉我吧。

## 参考和推荐

[Android全面解析之Handler机制（终篇）：常见问题汇总](https://juejin.cn/post/6887933281686421518)

[Handler 都没搞懂，拿什么去跳槽啊？](https://juejin.cn/post/6844903783139393550)

[换个姿势，带着问题看Handler](https://juejin.cn/post/6844904150140977165#heading-22)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
