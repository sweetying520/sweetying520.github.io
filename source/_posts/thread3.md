---
title: 多线程同步（三）
date: 2022-09-12 21:01:36
author: sweetying
tags: 
- 原创
- Java
- 多线程
categories:
- Java
- 多线程
---

## 一、演示多线程同步问题

多线程的同步问题是指多个线程同时修改一个数据的时候，可能导致的问题，多线程的问题，也叫并发（Concurrency）问题。

假设盖伦有 10000 滴血，并且在基地里，同时又被对方多个英雄攻击，相当于：

**有多个线程在减少盖伦的 hp，同时又有多个线程在恢复盖伦的 hp**

假设线程的数量是一样的，并且每次改变的值都是 1，那么所有线程结束后，盖伦的 hp 应该还是 10000。

但实际结果并非如此

**注意：** 不是每一次运行都会看到错误的数据产生，多运行几次，或者增加运行的次数

```java
//1、新建一个 Hero 类
class Hero {
    public String name;
    public float hp;

    public int damage;

    //回血
    public void recover() {
        hp = hp + 1;
    }

    //掉血
    public void hurt() {
        hp = hp - 1;
    }

    public void attackHero(Hero h) {
        h.hp -= damage;
        System.out.format("%s 正在攻击 %s, %s的血变成了 %.0f%n", name, h.name, h.name, h.hp);
        if (h.isDead())
            System.out.println(h.name + "死了！");
    }

    public boolean isDead() {
        return 0 >= hp;
    }
}

//2、测试
public class TestThread {

    public static void main(String[] args) {

        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 10000;

        System.out.printf("盖伦的初始血量是 %.0f%n", gareen.hp);

        //多线程同步问题指的是多个线程同时修改一个数据的时候，导致的问题
        //假设盖伦有10000滴血，并且在基地里，同时又被对方多个英雄攻击
        //用 Java 代码来表示，就是有多个线程在减少盖伦的hp
        //同时又有多个线程在恢复盖伦的hp
        //n个线程增加盖伦的hp
        int n = 10000;

        Thread[] addThreads = new Thread[n];
        Thread[] reduceThreads = new Thread[n];

        //n个线程恢复盖伦的hp
        for (int i = 0; i < n; i++) {
            Thread t = new Thread() {
                public void run() {
                    gareen.recover();
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
            t.start();
            addThreads[i] = t;
        }

        //n个线程减少盖伦的hp
        for (int i = 0; i < n; i++) {
            Thread t = new Thread() {
                public void run() {
                    gareen.hurt();
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
            t.start();
            reduceThreads[i] = t;
        }

        //等待所有加血线程结束
        for (Thread t : addThreads) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        //等待所有减血线程结束
        for (Thread t : reduceThreads) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        //代码执行到这里，所有加血和减血线程都结束了
        //加血和减血线程的数量是一样的，每次都增加，减少1.
        //那么所有线程都结束后，盖伦的hp应该还是初始值
        //但是事实上观察到的是：
        System.out.printf("%d个加血线程和%d个减线程结束后%n盖伦的血量变成了 %.0f%n", n, n, gareen.hp);

    }
}

//打印结果
盖伦的初始血量是 10000
10000个加血线程和10000个减血线程结束后
盖伦的血量变成了 9999
```

## 二、分析同步问题产生的原因

如下图：

![image-20221227100429593](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281627828.png)

1、假设加血线程先进入，得到的 hp 是 10000，进行增加运算

2、正在做增加运算的时候，还没有来得及修改 hp 的值，减血线程来了

3、减血线程得到的 hp 也是 10000，减血线程进行减少运算

4、加血线程运算结束，得到值 10001，并把这个值赋予 hp

5、减血线程运算结束，得到值 9999，并把这个值赋予 hp，那么 hp 最终的值就是 9999

虽然经历了两个线程各自增减了一次，本来期望还是原值 10000，但是却得到了 9999，这个时候的值是一个错误的值，在业务上又叫做脏数据

## 三、解决思路

总体解决思路是：**在加血线程访问 hp 期间，其他线程不可以访问 hp**

如下图：

![image-20221227102140108](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281627391.png)

1、加血线程获得 hp 并进行运算，在运算期间，减血线程试图来获取 hp ，但不被允许

2、加血线程运算结束，并成功修改 hp 的值为 10001

3、减血线程在加血线程做完后，才能访问 hp 的值即 10001

4、减血线程做减少运算，并得到新的值 10000

## 四、synchronized 同步对象概念

解决上述问题之前，先理解 synchronized 关键字的意义，如下代码：

```java
Object someObject = new Object();
synchronized(someObject){
  //此处的代码只有占有了 someObject 后才可以执行
}
```

1）、synchronized 表示当前线程，独占对象 someObject，当前对象独占了 someObject，如果有其他线程试图占有 someObject ，就会等待，直到当前线程释放 someObject 的占用。

2）、someObject 又叫同步对象，所有的对象都可以作为同步对象

3）、为了达到同步的效果，必须使用同一个同步对象

4）、释放同步对象的方式：synchronized 块自然结束，或者有异常抛出

![image-20221227103526974](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281627768.png)

代码示例：

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

//打印结果
10:42:42 t2 试图占有对象：someObject
10:42:42 t1 试图占有对象：someObject
10:42:42 t2 占有对象：someObject
10:42:47 t2 释放对象：someObject
10:42:47 t2 线程结束
10:42:47 t1 占有对象：someObject
10:42:52 t1 释放对象：someObject
10:42:52 t1 线程结束
```

根据打印结果我们可以知道：只有当 t2 释放对象之后，t1 才能占有对象

## 五、使用 synchronized 解决同步问题

所有需要修改 hp 的地方，是建立在占有 someObject 的基础上，someObject 在同一时间，只能被一个线程占有。间接地，导致同一时间， hp 只能被一个线程修改

代码实现：

```java
public class TestThread {

    public static void main(String[] args) {

        final Object someObject = new Object();

        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 10000;

        int n = 10000;

        Thread[] addThreads = new Thread[n];
        Thread[] reduceThreads = new Thread[n];

        for (int i = 0; i < n; i++) {
            Thread t = new Thread() {
                public void run() {
                    //任何线程要修改hp的值，必须先占有 someObject
                    synchronized (someObject) {
                        gareen.recover();
                    }

                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
            t.start();
            addThreads[i] = t;

        }

        for (int i = 0; i < n; i++) {
            Thread t = new Thread() {
                public void run() {
                    //任何线程要修改hp的值，必须先占有 someObject
                    synchronized (someObject) {
                        gareen.hurt();
                    }

                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
            t.start();
            reduceThreads[i] = t;
        }

        for (Thread t : addThreads) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        for (Thread t : reduceThreads) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.printf("%d个增加线程和%d个减少线程结束后%n盖伦的血量是 %.0f%n", n, n, gareen.hp);
    }
}

//打印结果
10000个增加线程和10000个减少线程结束后
盖伦的血量是 10000
```

## 六、使用 hero 对象作为同步对象

既然任意对象都可以用来作为同步对象，而所有的线程访问的都是同一个 hero 对象，**索性就使用 gareen 来作为同步对象**，进一步的，对于 Hero 的 hurt 方法，加上：

```java
synchronized (this) {
  
}
```

表示当前对象为同步对象，即也是 gareen 为同步对象。

代码实现：

```java
//1、Hero 的 hurt 方法
class Hero {
  	
    //...
    
    //掉血
    public void hurt() {
        synchronized (this){
            hp = hp - 1;
        }
    }
}

//2、测试
public class TestThread {

    public static void main(String[] args) {

        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 10000;

        int n = 10000;

        Thread[] addThreads = new Thread[n];
        Thread[] reduceThreads = new Thread[n];

        for (int i = 0; i < n; i++) {
            Thread t = new Thread() {
                public void run() {

                    //使用 gareen 作为 synchronized
                    synchronized (gareen) {
                        gareen.recover();
                    }

                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
            t.start();
            addThreads[i] = t;

        }

        for (int i = 0; i < n; i++) {
            Thread t = new Thread() {
                public void run() {
                    //使用 gareen 作为 synchronized
                    //在方法 hurt 中有 synchronized(this)
                    gareen.hurt();

                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
            t.start();
            reduceThreads[i] = t;
        }

        for (Thread t : addThreads) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        for (Thread t : reduceThreads) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.printf("%d个增加线程和%d个减少线程结束后%n盖伦的血量是 %.0f%n", n, n, gareen.hp);

    }
}

//打印结果
10000个增加线程和10000个减少线程结束后
盖伦的血量是 10000
```

## 七、在方法前，加上修饰符 synchronized

在 recover 前，直接加上 synchronized ，其所对应的同步对象，就是 this，和 hurt 方法达到的效果是一样，外部线程访问 gareen 的方法，就不需要额外使用 synchronized 了。

代码实现：

```java
public class Hero{

    //...
  	
  
    //回血
    //直接在方法前加上修饰符 synchronized
    //其所对应的同步对象，就是 this
    //和 hurt 方法达到的效果一样
    public synchronized void recover(){
        hp=hp+1;
    }
     
    //掉血
    public void hurt(){
        //使用 this 作为同步对象
        synchronized (this) {
            hp=hp-1;   
        }
    }
     
}
```

## 八、总结

本篇文章我们通过演示多线程同步问题，分析产生的原因，解决思路，最后引出 synchronized 修饰符，并通过 synchronized 修饰符解决了同步问题

好了，本篇文章到这里就结束了，感谢你的阅读🤝
