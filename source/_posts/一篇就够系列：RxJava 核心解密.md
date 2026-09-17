---
title: 一篇就够系列：RxJava 核心解密
date: 2022-10-11 10:51:00
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281536551.jpeg
tags: 
- 原创
- Android
- 一篇就够
categories:
- Android
- 一篇就够
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281536551.jpeg)

## 前言

很高兴遇见你~

众所周知，RxJava 是一个非常流行的第三方开源库，它能将复杂的逻辑简单化，提高我们的开发效率，一个这么好用的库，来让我们学习一下吧🍺

下面我抛出一些问题，如果你都知道，那么恭喜你，你对 RxJava 掌握的很透彻，如果你对下面这些问题有一些疑惑，那么你就可以接着往下看，我会由浅入深的给你讲解 RxJava，看完之后，这些问题你会非常明了

1、什么是观察者模式？什么是装饰者模式？

2、观察者模式，装饰者模式在 RxJava 中的应用？

3、RxJava map 和 flatMap 操作符有啥区别？

4、如果有多个 subscribeOn ，会是一种什么情况？为啥？

5、如果有多个 observeOn ，会是一种什么情况？为啥？

6、RxJava 框架流思想设计？

7、RxJava 的 Subject 是什么？

8、如何通过 RxJava 实现一个自己的事件总线？

## 一、设计模式介绍

我们先了解一下下面两种设计模式：

1、观察者模式

2、装饰者模式

### 1.1、观察者模式

#### 1.1.1、观察者模式定义

简单的理解：对象间存在一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知并被自动更新

#### 1.1.2、观察者模式示例

```kotlin
//1、定义一个观察者的接口
interface Observer {
    /**
     * 接收事件的方法
     */
    fun onChange(o: Any)
}

//2、定义一个被观察者的接口
interface Observable {
    /**
     * 添加观察者
     */
    fun addObserver(observer: Observer)
    /**
     * 移除观察者
     */
    fun removeObserver(observer: Observer)
    /**
     * 发送事件通知
     */
    fun changeEvent(o: Any)
}

//3、定义一个观察者的实现类
class ObserverImpl: Observer {
    override fun onChange(o: Any) {
      	//对事件进行打印
        println(o)
    }
}

//4、定义一个被观察者的实现类
class ObservableImpl: Observable {

    //存放观察者的集合
    private val observerList: MutableList<Observer> = LinkedList()

    override fun addObserver(observer: Observer) {
        observerList.add(observer)
    }

    override fun removeObserver(observer: Observer) {
        observerList.remove(observer)
    }

    override fun changeEvent(o: Any) {
        for (observer in observerList) {
            observer.onChange(o)
        }
    }
}

//5、测试
fun main(){
    //1、创建被观察者
    val observable = ObservableImpl()
    //2、创建观察者
    val observer1 = ObserverImpl()
    val observer2 = ObserverImpl()
    val observer3 = ObserverImpl()
    //3、添加观察者
    observable.addObserver(observer1)
    observable.addObserver(observer2)
    observable.addObserver(observer3)
    //4、发送事件
    observable.changeEvent("erdai666")
}
//打印结果
erdai666
erdai666
erdai666
```

### 1.2、装饰者模式

#### 1.2.1、装饰者模式定义

简单的理解：动态的给一个类进行功能增强

#### 1.2.2、装饰者模式示例

举个例子：我想吃个蛋炒饭，但是单独一个蛋炒饭我觉得不好吃，我想在上面加火腿，加牛肉。我们使用装饰者模式来实现它

```kotlin
//1、定义一个炒饭的接口
interface Rice {
    fun cook()
}

//2、定义一个炒饭接口的实现类：蛋炒饭
class EggFriedRice: Rice {

    override fun cook() {
        println("蛋炒饭")
    }
}

//3、定义一个炒饭的抽象装饰类
abstract class RiceDecorate(var rice: Rice): Rice

//4、往蛋炒饭中加火腿
class HamFriedRiceDecorate(rice: Rice): RiceDecorate(rice) {
    override fun cook() {
        rice.cook()
        println("加火腿")
    }
}

//5、往蛋炒饭中加牛肉
class BeefFriedRiceDecorate(rice: Rice): RiceDecorate(rice) {

    override fun cook() {
        rice.cook()
        println("加牛肉")
    }
}

//6、测试
fun main(){
    //蛋炒饭
    val rice = EggFriedRice()
    //加火腿
    val hamFriedRiceDecorate = HamFriedRiceDecorate(rice)
    //加牛肉
    val beefFriedRiceDecorate = BeefFriedRiceDecorate(hamFriedRiceDecorate)
    beefFriedRiceDecorate.cook()
}
//打印结果
蛋炒饭
加火腿
加牛肉
```

装饰者模式的核心：定义一个抽象的装饰类继承顶级接口，然后持有这个顶级接口的引用，接下来就可以进行无限套娃了😄

## 二、手撸 RxJava 核心源码实现

ok，了解了两种设计模式，接下来我们正式进入 RxJava 的学习

### 2.1、RxJava 介绍

RxJava 是一个异步操作框架，其核心可以归纳为两点：1、异步事件流 2、响应式编程。接下来我们可以好好的去感受这两点

### 2.2、RxJava 操作符

RxJava 之所以强大源于它各种强大的操作符，掌握好这些操作符能让你对 RxJava 的使用得心应手，RxJava 操作符主要分为 6 大类：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281536198.png" alt="RxJava 操作符.png" width="100%" />

每一个操作符背后都对应了一个具体的实现类，接下来我们就挑几个最常用，最核心的操作符：create，map，flatMap，observeOn，subscribeOn 进行手撸实现，相信看完这些操作符的实现后，你能融会贯通，举一反三

**注意**：下面这些操作符的实现和 RxJava 实现细节不尽相同，但核心思想是一致的，大家只要理解核心思想就好

### 2.3、create 操作符实现

create 是来创建一个被观察者对象，看了 RxJava create 操作符源码你会发现：

1、create 是使用观察者模式实现的，但 RxJava 里面使用的观察者模式和我们上面介绍的还有点不一样，它是一种变种的观察者模式

2、上面例子中我们是通过被观察者去发送事件，而 RxJava 里面定义了专门发送事件的接口，这样做的好处就是让被观察者和发射事件进行解耦

```kotlin
//1、定义一个观察者的顶级接口
interface Observer<T> {
    //建立了订阅关系
    fun onSubscribe()
    //接收到正常事件
    fun onNext(t: T)
    //接收到 error 事件
    fun onError(e: Throwable)
    //接收到 onComplete 事件
    fun onComplete()
}

//2、定义一个被观察者的顶级接口
interface ObservableSource<T> {
    //订阅观察者
    fun subscribe(observer: Observer<T>)
}

//3、定义一个被观察者抽象类实现顶层被观察者接口
abstract class Observable<T>: ObservableSource<T> {

    override fun subscribe(observer: Observer<T>) {
        subscribeActual(observer)
    }
		
    //实际订阅观察者的抽象方法，让子类去实现
    protected abstract fun subscribeActual(observer: Observer<T>)

    //伴生类里面的方法，直接通过类名调用    
    companion object{
      	//这里是我们实现 create 操作符对外提供和 RxJava 类似的方法调用
        fun <T> create(source: ObservableOnSubscribe<T>): ObservableCreate<T>{
            return ObservableCreate(source)
        }
    }
}

//4、定义一个与被观察者发射事件解耦的接口
interface ObservableOnSubscribe<T> {
    //通过 Emitter 发射事件
    fun subscribe(emitter: Emitter<T>)
}

//5、定义事件发射器接口
interface Emitter<T> {
    //发送 onNext 事件
    fun onNext(t: T)
    //发送 onError 事件
    fun onError(e: Throwable)
    //发送 onComplete 事件
    fun onComplete()
}

//6、定义 create 操作符的实现类
class ObservableCreate<T>(var source: ObservableOnSubscribe<T>): Observable<T>() {
		
    //实现父类订阅观察者的方法
    override fun subscribeActual(downStream: Observer<T>) {
      	//可以看到只要一订阅，首先就会接收 onSubscribe 事件
        downStream.onSubscribe()
      	//通过 ObservableOnSubscribe 里面的 Emitter 进行事件的发送，完成被观察者发送事件的解耦
        source.subscribe(CreateEmitter(downStream))
    }

    //事件发射器实现类，可以看到传入了下游的观察者来接收我们发射的事件
    class CreateEmitter<T>(var downStream: Observer<T>): Emitter<T>{

        override fun onNext(t: T) {
            downStream.onNext(t)
        }

        override fun onError(e: Throwable) {
            downStream.onError(e)
        }

        override fun onComplete() {
            downStream.onComplete()
        }
    }
}

//7、测试
fun main(){
    Observable.create(object : ObservableOnSubscribe<String>{
        override fun subscribe(emitter: Emitter<String>) {
            //发射 onNext 事件
            emitter.onNext("erdai666")
            //发射 onComplete 事件
            emitter.onComplete()
        }
    }).subscribe(object : Observer<String>{
        override fun onSubscribe() {
            println("onSubscribe")
        }

        override fun onNext(t: String) {
            println("onNext：$t")
        }

        override fun onError(e: Throwable) {
        }

        override fun onComplete() {
            println("onComplete")
        }
    })
}
//打印结果
onSubscribe
onNext：erdai666
onComplete
```

ok，上述代码就是 create 操作符的实现，大家如果没看明白可以多看几遍，也可以直接把我上面的代码直接拷贝到一个 kt 文件中去运行

### 2.4、map 操作符实现

map 是一个转换操作符，它能把一种类型转为为另外一种类型，如：Int -> String。

它的主要实现：观察者模式 + 装饰者模式 + 泛型

```kotlin
//1、定义一个抽象装饰类，注意里面泛型的使用
abstract class AbstractObservableWithUpstream<T,U>(var source: ObservableSource<T>): Observable<U>()

//2、定义一个类型转换的接口
interface Function<T,U> {
    //传入 T 类型，返回 U 类型
    fun apply(t: T): U
}

//3、定义 map 操作符的实现类
class ObservableMap<T,U>(source: ObservableSource<T>,var function: Function<T,U>): AbstractObservableWithUpstream<T,U>(source) {

    //实现父类订阅观察者的方法
    override fun subscribeActual(observer: Observer<U>) {
      	//接收 onSubscribe 事件
        observer.onSubscribe()
      	//完成事件的转换
        source.subscribe(MapObserver(function,observer))
    }

    //MapObserver 接收 function 对类型进行转换，downStream 对事件进行接收
    class MapObserver<T,U>(var function: Function<T,U>,var downStream: Observer<U>): Observer<T>{
        override fun onSubscribe() {
        }

        override fun onNext(t: T) {
            //核心：当接收到 T 类型，调用 function.apply 转换为 U 类型
            val u: U = function.apply(t)
            downStream.onNext(u)
        }

        override fun onError(e: Throwable) {
            downStream.onError(e)
        }

        override fun onComplete() {
            downStream.onComplete()
        }

    }
}

//4、Observable 中增加相应的调用方法
fun <U> map(function: Function<T, U>): ObservableMap<T,U>{
    return ObservableMap(this, function)
}

//5、测试
fun main(){
    Observable.create(object : ObservableOnSubscribe<String>{
        override fun subscribe(emitter: Emitter<String>) {
            emitter.onNext("erdai666")
            emitter.onComplete()
        }
    })
        .map(object : Function<String,String>{
            override fun apply(t: String): String {
                return "map 转换：$t"
            }
        })
        .subscribe(object : Observer<String>{
        override fun onSubscribe() {
            println("onSubscribe")
        }

        override fun onNext(t: String) {
            println("onNext：$t")
        }

        override fun onError(e: Throwable) {
        }

        override fun onComplete() {
            println("onComplete")
        }
    })
}

//打印结果
onSubscribe
onNext：map 转换：erdai666
onComplete
```

### 2.5、flatMap 操作符实现

flatMap 操作符的实现其实和 map 类似，只不过是把 ：Function<T, U> -> Function<T, ObservableSource> ，将一种类型转换为了一个被观察者的类型，被观察者的类型又可以进行一系列的转换，因此能拆分更细的粒度：

```kotlin
//1、定义 flatMap 操作符的实现类
class ObservableFlatMap<T,U>(source: ObservableSource<T>,var function: Function<T,ObservableSource<U>>): AbstractObservableWithUpstream<T,U>(source) {

    override fun subscribeActual(observer: Observer<U>) {
        observer.onSubscribe()
        source.subscribe(FlatMapObserver(function,observer))
    }

    //FlatMapObserver 接收 function 对类型进行转换，downStream 对事件进行接收
    class FlatMapObserver<T,U>(var function: Function<T,ObservableSource<U>>, var downStream: Observer<U>): Observer<T>{
        override fun onSubscribe() {
        }

        override fun onNext(t: T) {
            //核心：当接收到 T 类型，调用 function.apply 转换为 ObservableSource<U> 类型
            val u: ObservableSource<U> = function.apply(t)
            //对 u 进行更细粒度的拆分，在让下游观察者进行接收
            u.subscribe(object : Observer<U>{
                override fun onSubscribe() {

                }

                override fun onNext(t: U) {
                    downStream.onNext(t)
                }

                override fun onError(e: Throwable) {

                }

                override fun onComplete() {

                }
            })
        }

        override fun onError(e: Throwable) {
            downStream.onError(e)
        }

        override fun onComplete() {
            downStream.onComplete()
        }
    }
}

//2、Observable 中增加相应的调用方法
fun <U> flatMap(function: Function<T,ObservableSource<U>>): ObservableFlatMap<T,U>{
    return ObservableFlatMap(this,function)
}

//3、测试
fun main(){
    Observable.create(object : ObservableOnSubscribe<String>{
        override fun subscribe(emitter: Emitter<String>) {
            emitter.onNext("erdai666")
            emitter.onComplete()
        }
    }).flatMap(object : Function<String,ObservableSource<String>>{
        override fun apply(t: String): ObservableSource<String> {
            return Observable.create(object : ObservableOnSubscribe<String>{
                override fun subscribe(emitter: Emitter<String>) {
                    emitter.onNext("flatMap：$t")
                }
            })
        }

    })
        .subscribe(object : Observer<String>{
        override fun onSubscribe() {
            println("onSubscribe")
        }

        override fun onNext(t: String) {
            println("onNext：$t")
        }

        override fun onError(e: Throwable) {
        }

        override fun onComplete() {
            println("onComplete")
        }
    })
}

//打印结果
onSubscribe
onNext：flatMap：erdai666
onComplete
```

### 2.6、subscribeOn 操作符实现

subscribeOn 主要是用来决定我们订阅观察者是在哪个线程执行

```kotlin
//1、定义一个抽象的调度器
abstract class Scheduler {
		
    abstract fun createWorker(): Worker
    
    //定义一个抽象的 Worker
    abstract class Worker{
      	//真正决定线程执行
        abstract fun schedule(runnable: Runnable)
    }
}

//2、定义调度器的实现类，我们主要实现两种：
//2.1、AndroidMainScheduler：Android 主线程
//可以看到我们就是使用 Handler 将线程切换到主线程
class AndroidMainScheduler(var handler: Handler): Scheduler() {
    override fun createWorker(): Worker {
        return AndroidMainWorker(handler)
    }
    
    class AndroidMainWorker(var handler: Handler): Worker(){
        override fun schedule(runnable: Runnable) {
            handler.post(runnable)
        }
    }
}

//2.2、NewThreadScheduler：开启一个新的子线程
//可以看到我们就是使用线程池来执行 runnable
class NewThreadScheduler(var executorService: ExecutorService): Scheduler() {

    override fun createWorker(): Worker {
        return NewThreadWork(executorService)
    }
  
    class NewThreadWork(var executorService: ExecutorService): Worker(){
        override fun schedule(runnable: Runnable) {
            executorService.execute(runnable)
        }
    }
}

//3、定义一个线程调度器的工具类，类似 RxJava 的调用
class Schedulers {
  
    companion object{
      	//切换到子线程
        fun newThread(): NewThreadScheduler{
            return NewThreadScheduler(Executors.newScheduledThreadPool(2))
        }
				
      	//切换到主线程
        fun mainThread(): AndroidMainScheduler{
            return AndroidMainScheduler(Handler(Looper.getMainLooper()))
        }
    }
}

//4、定义 subscribeOn 操作符实现类
class ObservableSubscribeOn<T>(source: ObservableSource<T>,var scheduler: Scheduler): AbstractObservableWithUpstream<T,T>(source) {

    override fun subscribeActual(observer: Observer<T>) {
      	//接收订阅事件
        observer.onSubscribe()
      	//创建 Worker 决定我们代码所执行的线程
        val worker = scheduler.createWorker()
        worker.schedule(SubscribeTask(SubscribeOnObserver(observer)))
    }


    //可以看到，Runnable 里面就只做了一个订阅操作，因此 subscribeOn 会决定我们订阅观察者的线程
    inner class SubscribeTask(var observer: SubscribeOnObserver<T>): Runnable{
        override fun run() {
            source.subscribe(observer)
        }
    }
  
    //如果我们没有使用 observeOn 切换线程，那么观察者接收事件的线程也会由 subscribeOn 线程决定
    class SubscribeOnObserver<T>(var observer: Observer<T>): Observer<T>{
        override fun onSubscribe() {
        }

        override fun onNext(t: T) {
            observer.onNext(t)
        }

        override fun onError(e: Throwable) {
            observer.onError(e)
        }

        override fun onComplete() {
            observer.onComplete()
        }

    }
}

//5、Observable 中增加相应的调用方法
fun subscribeOn(scheduler: Scheduler): ObservableSubscribeOn<T>{
    return ObservableSubscribeOn(this,scheduler)
}

//6、测试
fun main(){
    Observable.create(object :ObservableOnSubscribe<String>{
        override fun subscribe(emitter: Emitter<String>) {
            emitter.onNext("erdai666")
            emitter.onComplete()
            println("subscribe：${Thread.currentThread().name}")
        }

    }).subscribeOn(Schedulers.newThread())
        .subscribe(object : Observer<String>{
            override fun onSubscribe() {
                println("onSubscribe：${Thread.currentThread().name}")
            }

            override fun onNext(t: String) {
                println("onNext：$t")
                println("onNext：${Thread.currentThread().name}")
            }

            override fun onError(e: Throwable) {
                println("onError：${Thread.currentThread().name}")
            }

            override fun onComplete() {
                println("onComplete")
                println("onComplete：${Thread.currentThread().name}")
            }
        })
}

//打印结果
onSubscribe：main
onNext：erdai666
onNext：pool-1-thread-1
onComplete
onComplete：pool-1-thread-1
subscribe：pool-1-thread-1
```

分析一下上面的打印结果：

1、onSubscribe 是在一开始订阅就触发的，此时 Worker 都还没创建，因此是在主线程执行的

2、因为我们没有使用 observeOn 对观察者接收事件的线程进行切换，所以 onNext，onComplete 接收事件的线程由 subscribeOn 切换的线程决定，

3、subscribe 在我们实际订阅观察者的方法里会执行它，因此是由 subscribeOn 切换的线程决定

### 2.7、observeOn 操作符实现

observeOn 是用来决定我们观察者接收事件是在哪个线程执行，实现相对复杂一点，它内部使用了一个队列来存储发送过来的 onNext 事件，然后通过 While 循环对队列中的事件进行处理，具体大家可以看我下面的实现，写了详细的注释

```kotlin
//1、定义 observeOn 操作符实现类
class ObservableObserveOn<T>(source: ObservableSource<T>, var scheduler: Scheduler): AbstractObservableWithUpstream<T, T>(source) {

    override fun subscribeActual(observer: Observer<T>) {
      	//接收订阅事件
        observer.onSubscribe()
        val worker = scheduler.createWorker()
        source.subscribe(ObserveOnObserver(observer,worker))
    }

    class ObserveOnObserver<T>(var observer: Observer<T>, var worker: Scheduler.Worker, var queue: Deque<T>? = null): Observer<T>,Runnable {

        //标记是否事件都已经接收，一般在 onError 或 onComplete 时标记
        @Volatile
        var done = false

        //记录 onError 的异常
        @Volatile
        var throwable: Throwable? = null

        //是否能结束 While 循环：例如观察者接收了 onError 或 onComplete 事件，就可以结束循环了
        @Volatile
        var over = false

        init {
            //如果队列为空，则新建
            if(queue == null){
                queue = ArrayDeque()
            }
        }

        override fun onSubscribe() {
        }

        override fun onNext(t: T) {
            if(done)return
            //将接收的 onNext 事件加入队列中
            queue?.offer(t)
            //执行调度
            schedule()
        }

        override fun onError(e: Throwable) {
            if(done)return
            //记录异常
            throwable = e
            //标记接收事件完成
            done = true
            //执行调度
            schedule()

        }

        override fun onComplete() {
            if(done)return
            //标记接收事件完成
            done = true
            //执行调度
            schedule()
        }

        //可以看到这里进行了任务的执行，由 observeOn 决定执行的线程
        private fun schedule() {
            worker.schedule(this)
        }

        override fun run() {
            drainNormal()
        }

        //实际最终的逻辑就是在这个方法里面进行处理
        private fun drainNormal() {
            //取当前的队列
            val q = queue
            //取观察者
            val obs = observer

            //while 循环取出队列里面的 onNext 事件
            while (true){
                //取 done 标记
                val d = done
                //从队列中取出元素并出队
                val t = q?.poll()
                //如果 t 为 null 表示队列里面没有事件了
                val empty = t == null
                //检查是否能终止 While 循环
                if(checkTerminated(d,empty,obs)){
                    return
                }

                //如果队列为空，跳出 While 循环
                if(empty)break

                //观察者接收 onNext 事件
                t?.apply {
                    obs.onNext(this)
                }
            }

        }

        //检查是否能终止 While 循环
        private fun checkTerminated(d: Boolean, empty: Boolean, obs: Observer<T>): Boolean {
            if(over){
                //如果能结束了，清空队列
                queue?.clear()
                return true
            }

            //如果已经完成事件的发送
            if(d){
                val e = throwable
                if(e != null){
                    //如果有 onError 事件，标记结束，并接收 onError 事件
                    over = true
                    obs.onError(e)
                }else if(empty){
                    //如果队列为空，标记结束，并接收 onComplete 事件
                    over = true
                    obs.onComplete()
                    return true
                }
            }
            return false
        }
        
    }
} 

//2、Observable 中增加相应的调用方法
fun observeOn(scheduler: Scheduler): ObservableObserveOn<T>{
    return ObservableObserveOn(this,scheduler)
}

//3、测试，因为涉及到 Handler 切换到主线程，我们这里放到 Activity 里面去测试
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        Observable.create(object : ObservableOnSubscribe<String> {
            override fun subscribe(emitter: Emitter<String>) {
                emitter.onNext("erdai666")
                emitter.onComplete()
                println("subscribe：${Thread.currentThread().name}")
            }

        })
            .subscribeOn(Schedulers.newThread())
            .observeOn(Schedulers.mainThread())
            .subscribe(object : Observer<String> {
                override fun onSubscribe() {
                    println("onSubscribe：${Thread.currentThread().name}")
                }

                override fun onNext(t: String) {
                    println("onNext：$t")
                    println("onNext：${Thread.currentThread().name}")
                }

                override fun onError(e: Throwable) {
                    println("onError：${Thread.currentThread().name}")
                }

                override fun onComplete() {
                    println("onComplete")
                    println("onComplete：${Thread.currentThread().name}")
                }
            })
    }
}

//打印结果
onSubscribe：main
subscribe：pool-2-thread-1
onNext：erdai666
onNext：main
onComplete
onComplete：main
```

分析一下上面的打印结果：

1、onSubscribe 是在一开始订阅就触发的，此时 Worker 都还没创建，因此是在主线程执行的

2、subscribe 在我们实际订阅观察者的方法里会执行它，因此是由 subscribeOn 切换的线程决定

3、observeOn 决定了观察者接收事件所在的线程，因此 onNext，onComplete 是在主线程执行的

## 三、RxJava 框架流思想设计

我们通过一段代码来分析 RxJava 的框架流设计：

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
				
      	//create 操作符
        Observable.create(object : ObservableOnSubscribe<String> {
            override fun subscribe(emitter: Emitter<String>) {
                emitter.onNext("erdai666")
                emitter.onComplete()
                println("subscribe：${Thread.currentThread().name}")
            }

        })
      	    //map 操作符
            .map(object : Function<String,String>{
                override fun apply(t: String): String {
                    println("map：${Thread.currentThread().name}")
                    return "map：$t"
                }
            })
      	    //flatMap 操作符
            .flatMap(object : Function<String,ObservableSource<String>>{
                override fun apply(t: String): ObservableSource<String> {
                    println("flatMap：${Thread.currentThread().name}")
                    return Observable.create(object : ObservableOnSubscribe<String>{
                        override fun subscribe(emitter: Emitter<String>) {
                            emitter.onNext("flatMap：$t")
                        }
                    })
                }

            })
      	    //subscribeOn 操作符
            .subscribeOn(Schedulers.newThread())
      	    //observeOn 操作符
            .observeOn(Schedulers.mainThread())
      	    //订阅
            .subscribe(object : Observer<String> {
                override fun onSubscribe() {
                    println("onSubscribe：${Thread.currentThread().name}")
                }

                override fun onNext(t: String) {
                    println("onNext：$t")
                    println("onNext：${Thread.currentThread().name}")
                }

                override fun onError(e: Throwable) {
                    println("onError：${Thread.currentThread().name}")
                }

                override fun onComplete() {
                    println("onComplete")
                    println("onComplete：${Thread.currentThread().name}")
                }
            })
    }
}
```

### 3.1、链式构建流

特点：从上往下

使用一段伪代码来分析 RxJava Observable 的构建

```kotlin
val source = ObservableOnSubscribe()
//create 操作符
Observable.create(souce) ---> observable0 = ObservableCreate(source)
//map 操作符
observable0.map() ---> observable1 = ObservableMap(observable0)
//flatMap 操作符
observable1.flatMap() ---> observable2 = ObservableFlatMap(observable1)
//subscribeOn 操作符
observable2.subscribeOn() ---> observable3 = ObservableSubscribeOn(observable2)
//observeOn 操作符
observable3.observeOn() ---> observable4 = ObservableObserveOn(observable3)
```

有没有发现规律：**我们在上游创建的 Observable(被观察者) 会被传入到下游。这就是典型的装饰者模式的应用，它的特点就是从上往下，无限套娃，动态的达到功能的增强**

### 3.2、订阅流

特点：从下往上

使用一段伪代码来分析 RxJava 订阅的过程

```kotlin
val observe5 = Observer(){}...
observable4.subscribe(observe5) ---> observable4.subscribeActual(observe5)

//observeOn 操作符
val observe4 = ObserveOnObserver(observe5)
observable3.subscribe(observe4) ---> observable3.subscribeActual(observe4)

//subscribeOn 操作符
val observe3 = SubscribeOnObserver(observe4)
observable2.subscribe(observe3) ---> observable2.subscribeActual(observe3)

//flatMap 操作符
val observe2 = FlatMapObserver(observe3)
observable1.subscribe(observe2) ---> observable1.subscribeActual(observe2)

//map 操作符
val observe1 = MapObserver(observe2)
observable0.subscribe(observe1) ---> observable0.subscribeActual(observe1)

//create 操作符
val emitter = CreateEmitter(observe1)
source.subscribe(emitter)
```

有点递归的意思哈

可以发现规律：**我们在下游创建的 Observable 订阅时，会递归先执行上游的订阅，因此订阅流的特点就是从下往上**

### 3.3、回调流

特点：从上往下

我们分析订阅流可以发现，观察者对象是从下往上传的，因此当 emitter 发送事件时，接收的顺序：

```kotlin
//create 操作符
emitter -> observe1

//map 操作符
observe1 -> observe2

//flatMap 操作符
observe2 -> observe3

//subscribeOn 操作符
observe3 -> observe4

//observeOn 操作符
observe4 -> observe5
```

可以看到：**当 emitter 发送事件后，观察者收到事件的顺序是从上往下的**

上面这三个流就是 RxJava 框架流的一个思想设计，对于你理解 RxJava 非常重要，如果没看明白，多看几遍

### 3.4、问题回顾

掌握了 RxJava 框架流，我们回顾一下前面提到的两个问题：

1、如果有多个 subscribeOn ，会是一种什么情况？为啥？

答：只有最上面那个 subscribeOn 切换的线程才会生效。因为 subscribeOn 的作用就是决定你订阅所执行的线程，而订阅流是从下往上的，因此你如果使用多个 subscribeOn 对线程进行切换，最终生效的只会是最上面那个

2、如果有多个 observeOn ，会是一种什么情况？为啥？

答：同理，只有最下游那个 observeOn 切换的线程才会生效。因为回调流是从上往下的，所以如果你创建了多个观察者接收事件，最终生效的只会是最下面那个

好好体会下下面这个例子：

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        Observable.create(object : ObservableOnSubscribe<String> {
            override fun subscribe(emitter: Emitter<String>) {
                emitter.onNext("erdai666")
                emitter.onComplete()
                println("subscribe：${Thread.currentThread().name}")
            }

        })
            .subscribeOn(Schedulers.newThread())
            .map(object : Function<String, String> {
                override fun apply(t: String): String {
                    println("map：${Thread.currentThread().name}")
                    return "map：$t"
                }

            })
            .subscribeOn(Schedulers.mainThread())
            .subscribeOn(Schedulers.newThread())
            .subscribeOn(Schedulers.mainThread())
            .observeOn(Schedulers.newThread())
            .observeOn(Schedulers.mainThread())
            .observeOn(Schedulers.newThread())
      	    .observeOn(Schedulers.mainThread())
            .subscribe(object : Observer<String> {
                override fun onSubscribe() {
                    println("onSubscribe：${Thread.currentThread().name}")
                }

                override fun onNext(t: String) {
                    println("onNext：$t")
                    println("onNext：${Thread.currentThread().name}")
                }

                override fun onError(e: Throwable) {
                    println("onError：${Thread.currentThread().name}")
                }

                override fun onComplete() {
                    println("onComplete")
                    println("onComplete：${Thread.currentThread().name}")
                }

            })
    }
}

//打印结果
onSubscribe：main
map：pool-2-thread-1
subscribe：pool-2-thread-1
onNext：map：erdai666
onNext：main
onComplete
onComplete：main
```

## 四、RxLifeCycle

实现 RxLifeCycle 之前，我们需要了解一下 compose 操作符

###  4.1、compose 操作符介绍

compose 操作符作用：传入一个上游的被观察者返回一个下游的被观察者，能起到一个代码复用的逻辑

**注意**：下面使用的是 RxJava 包下的类

```kotlin
class MyTransformer<T: Any>: ObservableTransformer<T,T> {

    override fun apply(upstream: Observable<T>): ObservableSource<T> {
      	//完成订阅和回调线程的切换
        return upstream.subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
    }
}


//实际应用
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        Observable.create(object : ObservableOnSubscribe<String>{
            override fun subscribe(emitter: ObservableEmitter<String>) {
                emitter.onNext("erdai666")
                emitter.onComplete()
                println("subscribe：${Thread.currentThread().name}")
            }
        })	
      	    //compose 操作符需要传入一个 ObservableTransformer 类型的对象
            .compose(MyTransformer())
            .subscribe(object : Observer<String>{
                override fun onSubscribe(d: Disposable) {
                    println("onSubscribe：${Thread.currentThread().name}")
                }

                override fun onNext(t: String) {
                    println("onNext $t")
                    println("onNext：${Thread.currentThread().name}")
                }

                override fun onError(e: Throwable) {
                    println("onError：${Thread.currentThread().name}")
                }

                override fun onComplete() {
                    println("onComplete")
                    println("onComplete：${Thread.currentThread().name}")
                }
            })
    }
}

//打印结果
onSubscribe：main
subscribe：RxCachedThreadScheduler-1
onNext erdai666
onNext：main
onComplete
onComplete：main
```

###  4.2、RxLifeCycle 实现

我们上面写的代码是存在内存泄漏的，如果我们使用 RxJava 在 Activity 做一个网络请求，此时用户退出了当前 Activity ，但是网络请求还在继续，那么此时就会产生内存泄漏，因此我们需要在做网络请求的时候感知 Activity 的生命周期去做相应的逻辑处理，那么此时 RxLifeCycle 就派上用场了，直接上代码：

```kotlin
//1、RxLifeCycle 实现类
//1.1、它实现了 LifecycleEventObserver，因此可以感知 LifecycleOwner 的声明周期
//1.2、它实现了 ObservableTransformer，因此我们可以使用 compose 操作符
class RxLifeCycle<T: Any>: LifecycleEventObserver,ObservableTransformer<T,T> {

    var compositeDisposable = CompositeDisposable()

    override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
        if(event == Lifecycle.Event.ON_DESTROY){
            //监听到 LifecycleOwner 生命周期为 Destroy 时，移除 Disposable 容器中的所有 Disposable 对象
            compositeDisposable.clear()
        }
    }

    override fun apply(upstream: Observable<T>): ObservableSource<T> {
        return upstream.doOnSubscribe{
            //将 Disposable 加入 Disposable 容器
            compositeDisposable.add(it)
        }
    }

    companion object{
      	//传入 LifecycleOwner，和 RxJava 进行生命周期绑定
        fun <T: Any> bindToDestroy(owner: LifecycleOwner): RxLifeCycle<T>{
            val rxLifeCycle = RxLifeCycle<T>()
            owner.lifecycle.addObserver(rxLifeCycle)
            return rxLifeCycle
        }
    }
}

//2、使用
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        Observable.create(object : ObservableOnSubscribe<String>{
            override fun subscribe(emitter: ObservableEmitter<String>) {
                emitter.onNext("erdai666")
                emitter.onComplete()
                println("subscribe：${Thread.currentThread().name}")
            }
        })	
            .compose(MyTransformer())
      	    //绑定生命周期，防止内存泄漏
      	    .compose(RxLifeCycle.bindToDestroy(this))
            .subscribe(object : Observer<String>{
                override fun onSubscribe(d: Disposable) {
                    println("onSubscribe：${Thread.currentThread().name}")
                }

                override fun onNext(t: String) {
                    println("onNext $t")
                    println("onNext：${Thread.currentThread().name}")
                }

                override fun onError(e: Throwable) {
                    println("onError：${Thread.currentThread().name}")
                }

                override fun onComplete() {
                    println("onComplete")
                    println("onComplete：${Thread.currentThread().name}")
                }
            })
    }
}
```

## 五、RxBus

实现 RxBus 前，我们需要先了解一下 Subject

### 5.1、Subject 介绍

1、Subject 既可以表示一个被观察者也可以表示一个观察者，实际它就是继承了 Observable 抽象类并实现了 Observer 接口

2、Subject 主要分为四种：

> 1、AsyncSubject
>
> 2、BehaviorSubject
>
> 3、PublishSubject
>
> 4、ReplaySubject

#### 5.1.1、AsyncSubject

特点：事件发射无论是在订阅前还是后，都只会接收最后一个事件

```kotlin
fun main(){
    val subject = AsyncSubject.create<String>()
    subject.onNext("A")
    subject.onNext("B")
    subject.subscribe {
        println(it)
    }
    subject.onNext("C")
    subject.onNext("D")
    subject.onComplete()
}

//打印结果
D
```

#### 5.1.2、BehaviorSubject

特点：接收订阅前最后一个事件以及订阅后的所有事件

```kotlin
fun main(){
    val subject = BehaviorSubject.create<String>()
    subject.onNext("A")
    subject.onNext("B")
    subject.subscribe {
        println(it)
    }
    subject.onNext("C")
    subject.onNext("D")
    subject.onComplete()
}

//打印结果
B
C
D
```

#### 5.1.3、PublishSubject

特点：只接收订阅后的所有事件

```kotlin
fun main(){
    val subject = PublishSubject.create<String>()
    subject.onNext("A")
    subject.onNext("B")
    subject.subscribe {
        println(it)
    }
    subject.onNext("C")
    subject.onNext("D")
    subject.onComplete()
}

//打印结果
C
D
```

#### 5.1.4、ReplaySubject

特点：事件发射无论是在订阅前还是后，都会被全部接收

```kotlin
fun main(){
    val subject = ReplaySubject.create<String>()
    subject.onNext("A")
    subject.onNext("B")
    subject.subscribe {
        println(it)
    }
    subject.onNext("C")
    subject.onNext("D")
    subject.onComplete()
}

//打印结果
A
B
C
D
```

### 5.2、RxBus 实现

我们在日常开发中，事件总线用的最多的可能是 EventBus，殊不知 RxJava 也能通过 Subject 实现事件总线的功能，而且使用起来比 EventBus 还简单一些：

```kotlin
//1、RxBus 实现类
object RxBus {
    //定义一个 PublishSubject 类型的 Subject，只接收订阅后的事件
    private val subject: Subject<Any> = PublishSubject.create<Any>().toSerialized()
    
    //接收事件
    fun <T: Any> receive(clazz: Class<T>): Observable<T>{
        return subject.ofType(clazz)
    }

    //发送事件
    fun post(o: Any){
        subject.onNext(o)
    }
}

//2、使用
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        RxBus.receive(String::class.java)
      	    //绑定生命周期，防止内存泄漏
            .compose(RxLifeCycle.bindToDestroy(this))
            .subscribe {
                println(it)
            }

        RxBus.post("erdai666")
    }
}

//打印结果
erdai666
```

## 六、总结

本篇文章我们由浅入深对 RxJava 进行了全面的介绍：

1、介绍了 RxJava 中使用的两种设计模式：

> 1、变种的观察者模式
>
> 2、装饰者模式

2、手撸了 RxJava 核心操作符的实现，希望你能举一反三，其它操作符的实现也是类似的套路

3、介绍了 RxJava 框架流思想设计：

> 1、链式构建流：从上往下
>
> 2、订阅流：从下往上
>
> 3、回调流：从上往下

4、介绍了 compose 操作符并扩展实现了 RxLifeCycle

5、介绍了 Subject 并扩展实现了 RxBus

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**


### 参考和推荐

[RxJava](https://github.com/ReactiveX/RxJava)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
