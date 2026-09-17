---
title: 原子访问（七）
date: 2022-09-16 21:01:36
author: sweetying
tags: 
- 原创
- Java
- 多线程
categories:
- Java
- 多线程
---

## 一、原子性操作概念

所谓的原子性操作即不可中断，不可分割的操作，比如赋值操作：

```java
int i = 5;
```

原子性操作本身是线程安全的，但是 i++ 这个行为，事实上是 3 个原子性操作操作组成的：

```java
//i++ 操作拆分
1、取 i 的值
2、i + 1
3、把新的值赋予 i
```

这三个步骤，每一步都是一个原子操作，但是合在一起，就不是原子操作，是线程不安全的。

换句话说，一个线程在步骤 1 取 i 的值结束后，还没有来得及进行步骤 2，另一个线程也可以取 i 的值了。

这也是分析同步问题产生的原因中的原理。

i++，i--，i = i + 1 这些都不是原子性操作。

只有`int i = 1`这个操作时原子性的

## 二、AtomicInteger

JDK 1.6 之后，Java 新增一个包`java.util.concurrent.atomic`，里面有各种原子类，比如：AtomicInteger 。

而 AtomicInteger 提供了各种自增，自减等方法，这些方法都是原子性的。

换句话说，自增方法 incrementAndGet 是线程安全的，同一个时间，只有一个线程可以调用这个方法。

代码实现：

```java
public class TestThread {
    public static void main(String[] args) {
        AtomicInteger atomicInteger = new AtomicInteger();
        final int i = atomicInteger.decrementAndGet();
        final int j = atomicInteger.incrementAndGet();
        final int k = atomicInteger.incrementAndGet();
        final int l = atomicInteger.addAndGet(3);
        System.out.println(i);
        System.out.println(j);
        System.out.println(k);
        System.out.println(l);
    }
}

//打印结果
-1
0
1
4
```

## 三、同步测试

分别使用基本变量的非原子性操作符和原子性的 AtomicInteger 对象的 incrementAndGet 来进行多线程测试。

代码实现：

```java
public class TestThread {

    private static int value = 0;
    private static AtomicInteger atomicValue = new AtomicInteger();

    public static void main(String[] args) {
        int number = 10000;
        Thread[] ts1 = new Thread[number];
        for (int i = 0; i < number; i++) {
            Thread t = new Thread(){
                @Override
                public void run() {
                    value++;
                }
            };
            t.start();
            ts1[i] = t;
        }

        //等待这些线程全部结束
        for (Thread t : ts1) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.printf("%d个线程进行value++后，value的值变成:%d%n", number,value);

        Thread[] ts2 = new Thread[number];
        for (int i = 0; i < number; i++) {
            Thread t = new Thread(){
                @Override
                public void run() {
                    atomicValue.incrementAndGet();
                }
            };
            t.start();
            ts2[i] = t;
        }

        //等待这些线程全部结束
        for (Thread t : ts2) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.printf("%d个线程进行atomicValue.incrementAndGet();后，atomicValue的值变成:%d%n", number,atomicValue.intValue());
    }
}

//打印结果
10000个线程进行value++后，value的值变成:9999
10000个线程进行atomicValue.incrementAndGet();后，atomicValue的值变成:10000
```

## 四、使用 AtomicInteger 来替换 Hero 类中的 synchronized

Hero 类如下：

```java
public class Hero{
    public String name;
    public int hp;
     
    public int damage;
    public synchronized void recover(){
        hp=hp+1;
    }
     
    //掉血
    public void hurt(){
        //使用this作为同步对象
        synchronized (this) {
            hp=hp-1;   
        }
    }
     
    public void attackHero(Hero h) {
        h.hp-=damage;
        System.out.format("%s 正在攻击 %s, %s的血变成了 %.0f%n",name,h.name,h.name,h.hp);
        if(h.isDead())
            System.out.println(h.name +"死了！");
    }
  
    public boolean isDead() {
        return 0>=hp?true:false;
    }
}
```

接下来我们使用 AtomicInteger 对其进行替换：

```java
class Hero{
    public String name;
    public AtomicInteger hp = new AtomicInteger();

    public int damage;
    public synchronized void recover(){
        hp.incrementAndGet();
    }

    public void hurt(){
        hp.decrementAndGet();
    }

    public void attackHero(Hero h) {
        h.hp.addAndGet(0 - damage);
        System.out.format("%s 正在攻击 %s, %s的血变成了 %.0f%n",name,h.name,h.name,h.hp);
        if(h.isDead())
            System.out.println(h.name +"死了！");
    }

    public boolean isDead() {
        return 0>=hp.intValue()?true:false;
    }
}
```

## 五、总结

本篇文章我们介绍了原子性操作的概念，以及原子性操作的类：AtomicInteger。并进行了同步测试以及对 Hero 类进行了替换

好了，本篇文章到这里就结束了，感谢你的阅读🤝
