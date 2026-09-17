---
title: 线程池（五）
date: 2022-09-14 21:01:36
author: sweetying
tags: 
- 原创
- Java
- 多线程
categories:
- Java
- 多线程
---

## 前言

每一个线程的启动和结束都是比较消耗时间和占用资源的。

如果在系统中使用到了很多的线程，大量的启动和结束动作会导致系统的性能变卡，响应变慢。

为了解决这个问题，引入线程池这种设计思想。

线程池的模式很像生产者消费者模式，消费的对象是一个一个能够运行的任务。

## 一、线程池设计思路

线程池的思路和生产者消费者模型是很接近的：

1、准备一个任务容器

2、一次性启动 10 个消费者线程

3、刚开始任务容器是空的，所以线程都 wait 在上面

4、直到一个外部线程往这个任务容器中扔了一个`任务`，就会有一个消费者线程被唤醒 notify

5、这个消费者线程取出`任务`，并且执行这个任务，执行完毕后，继续等待下一次任务的到来。

6、如果短时间内，有较多的任务加入，那么就会有多个线程被唤醒，去执行这些任务。

在整个过程中，都不需要创建新的线程，而是循环使用这些已经存在的线程

如下图：

![image-20221228114142462](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281627171.png)

## 二、开发一个自定义线程池

如下代码实现，虽然不够完善和健壮，但是已经足以说明线程池的工作原理：

```java
//1、自定义线程池
public class ThreadPool {

    /**
     * 线程池大小
     */
    private int threadPoolSize;

    /**
     * 任务容器
     */
    private LinkedList<Runnable> tasks = new LinkedList<>();

    /**
     * 试图消费任务的线程
     */
    public ThreadPool(){
        threadPoolSize = 10;

        //启动 10 个任务消费者线程
        synchronized (tasks){
            for (int i = 0; i < threadPoolSize; i++) {
                new TaskConsumeThread("任务消费者线程 " + i).start();
            }
        }
    }

    public void add(Runnable runnable){
        synchronized (tasks){
            tasks.add(runnable);
            //唤醒等待的任务消费者线程
            tasks.notifyAll();
        }
    }

    class TaskConsumeThread extends Thread{

        private Runnable task;

        public TaskConsumeThread(@NonNull String name) {
            super(name);
        }

        @Override
        public void run() {
            System.out.println("启动：" + getName());
            while (true){
                synchronized (tasks){
                    while (tasks.isEmpty()){
                        try {
                            tasks.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }

                    task = tasks.removeLast();
                    //允许添加任务的线程可以继续添加任务
                    tasks.notifyAll();
                }
                System.out.println(getName() + " 获取到任务，并执行");
                task.run();
            }
        }
    }
}

//2、测试
public class TestThread {

    public static void main(String[] args) {
        ThreadPool pool = new ThreadPool();

        for (int i = 0; i < 5; i++) {
            int finalI = i;
            Runnable task = new Runnable() {
                @Override
                public void run() {
                    System.out.println("执行任务：" + finalI);
                }
            };

            pool.add(task);
        }

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

//打印结果
启动：任务消费者线程 0
启动：任务消费者线程 2
启动：任务消费者线程 1
启动：任务消费者线程 3
启动：任务消费者线程 5
启动：任务消费者线程 6
启动：任务消费者线程 7
启动：任务消费者线程 8
启动：任务消费者线程 4
启动：任务消费者线程 9
任务消费者线程 7 获取到任务，并执行
任务消费者线程 2 获取到任务，并执行
任务消费者线程 9 获取到任务，并执行
任务消费者线程 0 获取到任务，并执行
执行任务：3
执行任务：0
执行任务：2
任务消费者线程 1 获取到任务，并执行
执行任务：1
执行任务：4
```

## 三、测试线程池

创造一个情景，每个任务执行的时间都是 1 秒，刚开始是间隔 1 秒钟向线程池中添加任务，然后间隔时间越来越短，执行任务的线程还没来得及结束，新的任务又来了。此时就会观察到线程池里的其他线程被唤醒来执行这些任务

```java
public class TestThread {
    public static void main(String[] args) {
        ThreadPool pool = new ThreadPool();
        int sleep = 1000;
        while (true) {
            pool.add(new Runnable() {
                @Override
                public void run() {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            });
            try {
                Thread.sleep(sleep);
                sleep = sleep > 100 ? sleep - 100 : sleep;
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        }

    }
}

//打印结果
启动：任务消费者线程 0
启动：任务消费者线程 3
启动：任务消费者线程 4
启动：任务消费者线程 2
启动：任务消费者线程 1
启动：任务消费者线程 5
启动：任务消费者线程 6
启动：任务消费者线程 7
启动：任务消费者线程 8
启动：任务消费者线程 9
任务消费者线程 8 获取到任务，并执行
任务消费者线程 4 获取到任务，并执行
任务消费者线程 7 获取到任务，并执行
任务消费者线程 8 获取到任务，并执行
任务消费者线程 4 获取到任务，并执行
任务消费者线程 7 获取到任务，并执行
任务消费者线程 8 获取到任务，并执行
任务消费者线程 4 获取到任务，并执行
任务消费者线程 6 获取到任务，并执行
任务消费者线程 7 获取到任务，并执行
任务消费者线程 5 获取到任务，并执行
任务消费者线程 8 获取到任务，并执行
任务消费者线程 9 获取到任务，并执行
任务消费者线程 0 获取到任务，并执行
任务消费者线程 1 获取到任务，并执行
任务消费者线程 4 获取到任务，并执行
任务消费者线程 2 获取到任务，并执行
任务消费者线程 3 获取到任务，并执行
任务消费者线程 6 获取到任务，并执行
任务消费者线程 7 获取到任务，并执行
任务消费者线程 5 获取到任务，并执行
任务消费者线程 8 获取到任务，并执行
任务消费者线程 9 获取到任务，并执行
任务消费者线程 0 获取到任务，并执行
...
```

## 四、使用 Java 自带线程池

Java 给我们提供了自带的线程池 ThreadPoolExecutor 在 java.util.concurrent 包下。

如下代码：

```java
ThreadPoolExecutor pool = new ThreadPoolExecutor(10, 15, 60, TimeUnit.SECONDS, new LinkedBlockingQueue<>());
pool.execute(new Runnable() {
   	@Override
   	public void run() {
    	System.out.println("执行任务");
    }
});
```

第一个参数 10 ：表示线程池初始化了 10 线程在里面工作

第二个参数 15 ：表示如果 10 个线程不够用了，就会增加到最多 15 个线程

第三个参数 60 ：结合第四个参数 TimeUnit.SECONDS 表示 经过 60 秒，多出来的线程没有接到活，就会回收，最后保持池子里面就 10 个

第四个参数 TimeUnit.SECONDS 如上

第五个参数 new LinkedBlockingQueue<>() ：表示存放任务的集合

execute 方法用于添加并执行新的任务

## 五、总结

本篇文章我们介绍了：

1、设计一个线程池的思路并进行了具体实现

2、自定义线程池测试

3、Java 自带线程池介绍

好了，本篇文章到这里就结束了，感谢你的阅读🤝
