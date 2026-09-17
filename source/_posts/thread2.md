---
title: 常见线程的方法（二）
date: 2022-09-11 21:01:36
author: sweetying
tags: 
- 原创
- Java
- 多线程
categories:
- Java
- 多线程
---

## 一、暂停当前线程：sleep

1）、Thread.sleep(1000) ：表示当前线程暂停 1000 毫秒，其他线程不受影响

2）、Thread.sleep(1000) 会抛出 InterruptedException 中断异常，因为当前线程 sleep 的时候，有可能被停止，这时就会抛出 InterruptedException

代码实现：

```java
public class TestThread {
    public static void main(String[] args) {
        Thread t1 = new Thread(){
            @Override
            public void run() {
                int seconds = 1;
                while (true) {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.printf("已经完了 LOL %d 秒%n",seconds++);
                }
            }
        };
        t1.start();
    }
}

//打印结果
已经完了 LOL 1 秒
已经完了 LOL 2 秒
已经完了 LOL 3 秒
已经完了 LOL 4 秒
已经完了 LOL 5 秒
...
...
```

## 二、加入到当前线程：join

1）、首先解释一下主线程的概念：所有进程，至少会有一个线程即主线程，即 main 方法开始执行时，就会有一个看不见的主线程存在。

2）、t.join（Thread 对象）：表示在主线程中加入该线程，主线程会等该线程执行完毕，才会继续往下运行

代码实现：

```java
//1、定义英雄的类
class Hero{
    public String name;
    public float hp;

    public int damage;

    public void attackHero(Hero h) {
        try {
            //为了表示攻击需要时间，每次攻击暂停1000毫秒
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        h.hp-=damage;
        System.out.format("%s 正在攻击 %s, %s的血变成了 %.0f%n",name,h.name,h.name,h.hp);

        if(h.isDead())
            System.out.println(h.name +"死了！");
    }

    public boolean isDead() {
        return 0>=hp?true:false;
    }

}

//2、测试
public class TestThread {

    public static void main(String[] args) {
        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;
        gareen.damage = 50;

        final Hero teemo = new Hero();
        teemo.name = "提莫";
        teemo.hp = 300;
        teemo.damage = 30;

        final Hero bh = new Hero();
        bh.name = "赏金猎人";
        bh.hp = 500;
        bh.damage = 65;

        final Hero leesin = new Hero();
        leesin.name = "盲僧";
        leesin.hp = 455;
        leesin.damage = 80;

        Thread t1= new Thread(){
            public void run(){
                while(!teemo.isDead()){
                    gareen.attackHero(teemo);
                }
            }
        };

        t1.start();

        //代码执行到这里，一直是main线程在运行
        try {
            //t1线程加入到main线程中来，只有t1线程运行结束，才会继续往下走
            t1.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        Thread t2= new Thread(){
            public void run(){
                while(!leesin.isDead()){
                    bh.attackHero(leesin);
                }
            }
        };
        //会观察到盖伦把提莫杀掉后，才运行t2线程
        t2.start();
    }
}

//打印结果
盖伦 正在攻击 提莫, 提莫的血变成了 250
盖伦 正在攻击 提莫, 提莫的血变成了 200
盖伦 正在攻击 提莫, 提莫的血变成了 150
盖伦 正在攻击 提莫, 提莫的血变成了 100
盖伦 正在攻击 提莫, 提莫的血变成了 50
盖伦 正在攻击 提莫, 提莫的血变成了 0
提莫死了！
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 390
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 325
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 260
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 195
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 130
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 65
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 0
盲僧死了！
```

根据打印结果可知主线程先是等 t1 执行完后，在执行 t2

## 三、线程优先级：setPriority

1）、当线程处于竞争关系的时候，优先级高的线程会有更大的几率获得CPU资源

代码实现：

```java
public class TestThread {

    public static void main(String[] args) {
        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;
        gareen.damage = 50;

        final Hero teemo = new Hero();
        teemo.name = "提莫";
        teemo.hp = 300;
        teemo.damage = 30;

        final Hero bh = new Hero();
        bh.name = "赏金猎人";
        bh.hp = 500;
        bh.damage = 65;

        final Hero leesin = new Hero();
        leesin.name = "盲僧";
        leesin.hp = 455;
        leesin.damage = 80;

        Thread t1= new Thread(){
            public void run(){
                while(!teemo.isDead()){
                    gareen.attackHero(teemo);
                }
            }
        };



        Thread t2= new Thread(){
            public void run(){
                while(!leesin.isDead()){
                    bh.attackHero(leesin);
                }
            }
        };
				//设置线程优先级
        t1.setPriority(Thread.MAX_PRIORITY);
        t2.setPriority(Thread.MIN_PRIORITY);
        t1.start();
        t2.start();
    }
}
```

## 四、临时暂停：yield

1）、当前线程临时暂停，使得其他线程可以有更多的机会占用 CPU 资源

代码实现：

```java
public class TestThread {

    public static void main(String[] args) {

        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;
        gareen.damage = 50;

        final Hero teemo = new Hero();
        teemo.name = "提莫";
        teemo.hp = 300;
        teemo.damage = 30;

        final Hero bh = new Hero();
        bh.name = "赏金猎人";
        bh.hp = 500;
        bh.damage = 65;

        final Hero leesin = new Hero();
        leesin.name = "盲僧";
        leesin.hp = 455;
        leesin.damage = 80;

        Thread t1= new Thread(){
            public void run(){

                while(!teemo.isDead()){
                    gareen.attackHero(teemo);
                }
            }
        };

        Thread t2= new Thread(){
            public void run(){
                while(!leesin.isDead()){
                    //临时暂停，使得t1可以占用CPU资源
                    Thread.yield();

                    bh.attackHero(leesin);
                }
            }
        };

        t1.setPriority(5);
        t2.setPriority(5);
        t1.start();
        t2.start();

    }
}
```

## 五、守护线程

举个例子：如果一家公司销售部，生产部都解散了，只剩下后勤，那么这家公司也可以解散了

1）、守护线程就相当于公司的后勤部门，当一个进程只剩下守护线程，那么进程就会自动结束。

2）、守护线程通常会被用来做日志，性能统计等工作。

代码实现：

```java
public class TestThread {
  
    public static void main(String[] args) {
          
        Thread t1= new Thread(){
            public void run(){
                int seconds =0;
                 
                while(true){
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.printf("已经玩了LOL %d 秒%n", seconds++);
                     
                }              
            }
        };
      	//将 t1 设置为守护线程
        t1.setDaemon(true);
        t1.start();
          
    }
}
```

上述代码我们把 t1 设置为了守护线程，那么该程序会因为只剩下守护线程而自动结束掉

## 六、总结

本篇文章我们介绍了线程常用的一些方法：

1、sleep ：当前线程暂停

2、join ：加入当前线程

3、setPriority ：设置线程优先级

4、yield ：当前线程临时暂停

5、setDaemon ：设置守护线程

好了，本篇文章到这里就结束了，感谢你的阅读🤝

