---
title: 多线程 Lock 对象（六）
date: 2022-09-15 21:01:36
author: sweetying
tags: 
- 原创
- Java
- 多线程
categories:
- Java
- 多线程
---

## 回顾

与 synchronized 类似的，lock 也能够达到同步的效果。

首先回忆一下 synchronized 同步对象的方式：

当一个线程占用 synchronized 同步对象，其他线程就不能占用了，知道释放这个同步对象为止

![image-20221227103526974](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281627103.png)

```java
public class SynchronizedTest {

    public static String now() {
        return new SimpleDateFormat("HH:mm:ss").format(new Date());
    }

    public static void main(String[] args) {
        final Object someObject = new Object();

        //t1 线程
        Thread t1 = new Thread() {
            @Override
            public void run() {
                try {
                    System.out.println(now() + " " + getName() +  " 试图占有对象：someObject");
                    synchronized (someObject) {
                        System.out.println(now() + " " + getName() + " 占有对象：someObject");
                        Thread.sleep(5000);
                        System.out.println(now() + " " + getName() + " 释放对象：someObject");
                    }
                    System.out.println(now() + " " + getName() + " 线程结束");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };
        t1.setName("t1");
        t1.start();

        //t2 线程
        Thread t2 = new Thread() {
            @Override
            public void run() {
                try {
                    System.out.println(now() + " " + getName() +  " 试图占有对象：someObject");
                    synchronized (someObject) {
                        System.out.println(now() + " " + getName() + " 占有对象：someObject");
                        Thread.sleep(5000);
                        System.out.println(now() + " " + getName() + " 释放对象：someObject");

                    }
                    System.out.println(now() + " " + getName() + " 线程结束");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };
        t2.setName("t2");
        t2.start();
    }
}
```

## 一、使用 Lock 对象实现同步效果

Lock 是一个接口，为了使用 Lock 对象，需要用到：

```java
Lock lock = new ReentrantLock();
```

与 synchronized(someObject) 类似，lock() 方法表示当前线程占用了 lock 对象，一旦占用，其他线程就不能占用了。

与 synchronized 不同的是，一旦 synchronized 块结束，就会自动释放 someObject 的占用。lock 却必须调用 unlock() 方法进行手动释放，为了保证释放的执行，往往会把 unlock() 放在 finally 中进行。

代码实现：

```java
public class LockTest {

    public static String now() {
        return new SimpleDateFormat("HH:mm:ss").format(new Date());
    }

    public static void main(String[] args) {
        Lock lock = new ReentrantLock();

        //t1 线程
        Thread t1 = new Thread() {
            @Override
            public void run() {
                try {
                    System.out.println(now() + " " + getName() + " 试图占有对象：lock");
                    lock.lock();
                    System.out.println(now() + " " + getName() + " 占有对象：lock");
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    System.out.println(now() + " " + getName() + " 释放对象：lock");
                    lock.unlock();
                }
                System.out.println(now() + " " + getName() + " 线程结束");
            }
        };
        t1.setName("t1");
        t1.start();

        //让 t1 先飞 2 秒
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        //t2 线程
        Thread t2 = new Thread() {
            @Override
            public void run() {
                try {
                    System.out.println(now() + " " + getName() + " 试图占有对象：lock");
                    lock.lock();
                    System.out.println(now() + " " + getName() + " 占有对象：lock");
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }finally {
                    System.out.println(now() + " " + getName() + " 释放对象：lock");
                    lock.unlock();
                }
                System.out.println(now() + " " + getName() + " 线程结束");
            }
        };
        t2.setName("t2");
        t2.start();
    }
}

//打印结果
15:49:39 t1 试图占有对象：lock
15:49:39 t1 占有对象：lock
15:49:39 t2 试图占有对象：lock
15:49:44 t1 释放对象：lock
15:49:44 t1 线程结束
15:49:44 t2 占有对象：lock
15:49:49 t2 释放对象：lock
15:49:49 t2 线程结束
```

## 二、trylock 方法

synchronized 是不占用到手誓不罢休，会一直试图占用下去。

与 synchronized的钻牛角尖不一样，Lock 接口还提供了一个 trylock 方法。

trylock 会在指定的时间范围内试图占用，占用成功了，就可以干活了。如果时间到了，还占用不成功，扭头就走。

**注意：** 因为使用 trylock 有可能成功，有可能失败，所以后面 unlock 释放锁的时候，需要判断是否是占用成功了，如果没占用成功也 unlock ，就会抛出异常。

代码实现：

```java
public class LockTest {

    public static String now() {
        return new SimpleDateFormat("HH:mm:ss").format(new Date());
    }

    public static void main(String[] args) {
        Lock lock = new ReentrantLock();

        //t1 线程
        Thread t1 = new Thread() {
            @Override
            public void run() {
                boolean locked = false;
                try {
                    System.out.println(now() + " " + getName() + " 试图占有对象：lock");
                    locked = lock.tryLock(1, TimeUnit.SECONDS);
                    if(locked){
                        System.out.println(now() + " " + getName() + " 占有对象：lock");
                        System.out.println(now() + " " + getName() + " 进行 5 秒的业务操作");
                        Thread.sleep(5000);
                    }else {
                        System.out.println(now() + " " + getName() + " 经过 1 秒钟的努力，还没有占有对象，放弃占有");
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    if(locked){
                        System.out.println(now() + " " + getName() + " 释放对象：lock");
                        lock.unlock();
                    }
                }
                System.out.println(now() + " " + getName() + " 线程结束");
            }
        };
        t1.setName("t1");
        t1.start();

        //让 t1 先飞 2 秒
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        //t2 线程
        Thread t2 = new Thread() {
            @Override
            public void run() {
                boolean locked = false;
                try {
                    System.out.println(now() + " " + getName() + " 试图占有对象：lock");
                    locked = lock.tryLock(1,TimeUnit.SECONDS);
                    if(locked){
                        System.out.println(now() + " " + getName() + " 占有对象：lock");
                        System.out.println(now() + " " + getName() + " 进行 5 秒的业务操作");
                        Thread.sleep(5000);
                    }else {
                        System.out.println(now() + " " + getName() + " 经过 1 秒钟的努力，还没有占有对象，放弃占有");
                    }

                } catch (InterruptedException e) {
                    e.printStackTrace();
                }finally {
                    if(locked){
                        System.out.println(now() + " " + getName() + " 释放对象：lock");
                        lock.unlock();
                    }
                }
                System.out.println(now() + " " + getName() + " 线程结束");
            }
        };
        t2.setName("t2");
        t2.start();
    }
}

//打印结果
17:00:47 t1 试图占有对象：lock
17:00:47 t1 占有对象：lock
17:00:47 t1 进行 5 秒的业务操作
17:00:49 t2 试图占有对象：lock
17:00:50 t2 经过 1 秒钟的努力，还没有占有对象，放弃占有
17:00:50 t2 线程结束
17:00:52 t1 释放对象：lock
17:00:52 t1 线程结束
```

## 三、线程交互

使用 synchronized 方式进行线程交互，用到的是同步对象的 wait，notify，notifyAll 方法。

Lock 也提供了类似的解决办法，首先通过 lock 对象得到一个 Condition 对象，然后分别调用这个 Condition 对象的：await，signal，signalAll 方法。

**注意：** 不是 Condition 对象的 wait，notify，notifyAll 方法，是 await，signal，signalAll 方法

代码实现：

```java
public class LockTest {

    public static String now() {
        return new SimpleDateFormat("HH:mm:ss").format(new Date());
    }

    public static void main(String[] args) {
        final Lock lock = new ReentrantLock();
        final Condition condition = lock.newCondition();

        //t1 线程
        Thread t1 = new Thread() {
            @Override
            public void run() {
                try {
                    System.out.println(now() + " " + getName() + " 试图占有对象：lock");
                    lock.lock();
                    System.out.println(now() + " " + getName() + " 占有对象：lock");
                    System.out.println(now() + " " + getName() + " 进行 5 秒的业务操作");
                    Thread.sleep(5000);
                    System.out.println(now() + " " + getName() + " 临时释放对象 lock，并等待");
                    condition.await();
                    System.out.println(now() + " " + getName() + " 重新占有对象 lock，并进行 5 秒的业务操作");
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    System.out.println(now() + " " + getName() + " 释放对象：lock");
                    lock.unlock();
                }
                System.out.println(now() + " " + getName() + " 线程结束");
            }
        };
        t1.setName("t1");
        t1.start();

        //让 t1 先飞 2 秒
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        //t2 线程
        Thread t2 = new Thread() {
            @Override
            public void run() {
                try {
                    System.out.println(now() + " " + getName() + " 试图占有对象：lock");
                    lock.lock();
                    System.out.println(now() + " " + getName() + " 占有对象：lock");
                    System.out.println(now() + " " + getName() + " 进行 5 秒的业务操作");
                    Thread.sleep(5000);
                    System.out.println(now() + " " + getName() + " 唤醒等待中的线程");
                    condition.signal();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }finally {
                    System.out.println(now() + " " + getName() + " 释放对象：lock");
                    lock.unlock();
                }
                System.out.println(now() + " " + getName() + " 线程结束");
            }
        };
        t2.setName("t2");
        t2.start();
    }
}

//打印结果
17:18:59 t1 试图占有对象：lock
17:18:59 t1 占有对象：lock
17:18:59 t1 进行 5 秒的业务操作
17:19:01 t2 试图占有对象：lock
17:19:04 t1 临时释放对象 lock，并等待
17:19:04 t2 占有对象：lock
17:19:04 t2 进行 5 秒的业务操作
17:19:09 t2 唤醒等待中的线程
17:19:09 t2 释放对象：lock
17:19:09 t2 线程结束
17:19:09 t1 重新占有对象 lock，并进行 5 秒的业务操作
17:19:14 t1 释放对象：lock
17:19:14 t1 线程结束
```

## 四、总结

本篇文章我们介绍了另外一种锁 Lock，以及相关交互的实现，它与 synchronized 区别：

1、Lock 是一个接口，而 synchronized 是 Java 中的关键字，synchronized 是内置的语言实现，Lock 是代码层面的实现。

2、 Lock 可以选择性的获取锁，如果一段时间获取不到，可以放弃。synchronized 不行，会一根筋一直获取下去。 借助 Lock 的这个特性，就能够规避死锁，synchronized 必须通过谨慎和良好的设计，才能减少死锁的发生。

3、 synchronized 在发生异常和同步块结束的时候，会自动释放锁。而 Lock 必须手动释放， 所以如果忘记了释放锁，一样会造成死锁。

好了，本篇文章到这里就结束了，感谢你的阅读🤝
