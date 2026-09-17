---
title: 启动一个线程（一）
date: 2022-09-10 21:01:36
author: sweetying
tags: 
- 原创
- Java
- 多线程
categories:
- Java
- 多线程
---

## 一、线程的概念

首先要理解进程（Processor）和线程（Thread）的区别：

1、进程：启动一个 LOL.exe 就叫一个进程，接着又启动一个 DOTA.exe，这叫两个进程。进程是操作系统执行的最小单位

2、线程：线程是在你进程内部同时做的事情，比如在 LOL 里面，有很多事情在同时发生，如：盖伦击杀提莫的同时，赏金猎人在击杀盲僧，这种就是由多线程实现的。线程是 CPU 执行的最小单位

此处演示不使用多线程的情况：

```java
//1、创建一个英雄类
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
public class Test {

    public static void main(String[] args) {
        Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;
        gareen.damage = 50;

        Hero teemo = new Hero();
        teemo.name = "提莫";
        teemo.hp = 300;
        teemo.damage = 30;

        Hero bh = new Hero();
        bh.name = "赏金猎人";
        bh.hp = 500;
        bh.damage = 65;

        Hero leesin = new Hero();
        leesin.name = "盲僧";
        leesin.hp = 455;
        leesin.damage = 80;

        //盖伦攻击提莫
        while(!teemo.isDead()){
            gareen.attackHero(teemo);
        }

        //赏金猎人攻击盲僧
        while(!leesin.isDead()){
            bh.attackHero(leesin);
        }
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

根据打印结果可知代码是从上往下按顺序执行的。

接下来我们使用多线程实现它

## 二、创建多线程-继承线程类

使用多线程实现：盖伦击杀提莫的同时，赏金猎人在击杀盲僧。

1、设计一个 KillThread 类继承 Thread 类，并且重写 run 方法

2、启动线程方法：实例化一个 KillThread 对象，并且调用其 start 方法

代码实现：

```java
//1、设计一个 KillThread 类继承 Thread 类，并且重写 run 方法
class KillThread extends Thread{
     
    private Hero h1;
    private Hero h2;
 
    public KillThread(Hero h1, Hero h2){
        this.h1 = h1;
        this.h2 = h2;
    }
 
    public void run(){
        while(!h2.isDead()){
            h1.attackHero(h2);
        }
    }
}

//2、测试
public class Test {

    public static void main(String[] args) {
        Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;
        gareen.damage = 50;

        Hero teemo = new Hero();
        teemo.name = "提莫";
        teemo.hp = 300;
        teemo.damage = 30;

        Hero bh = new Hero();
        bh.name = "赏金猎人";
        bh.hp = 500;
        bh.damage = 65;

        Hero leesin = new Hero();
        leesin.name = "盲僧";
        leesin.hp = 455;
        leesin.damage = 80;

        KillThread killThread1 = new KillThread(gareen,teemo);
        killThread1.start();
        KillThread killThread2 = new KillThread(bh,leesin);
        killThread2.start();
    }
}

//打印结果
盖伦 正在攻击 提莫, 提莫的血变成了 250
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 390
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 325
盖伦 正在攻击 提莫, 提莫的血变成了 200
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 260
盖伦 正在攻击 提莫, 提莫的血变成了 150
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 195
盖伦 正在攻击 提莫, 提莫的血变成了 100
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 130
盖伦 正在攻击 提莫, 提莫的血变成了 50
盖伦 正在攻击 提莫, 提莫的血变成了 0
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 65
提莫死了！
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 0
盲僧死了！
```

可以看到现在是交替打印，证明是多线程

## 三、创建多线程-实现 Runnable 接口

1、创建 Battle 类实现 Runnable 接口，启动的时候，首先创建一个 Battle 对象，然后在根据该 Battle 对象创建一个线程对象并启动

```java
Battle battle = new Battle(gareen,teemo);
new Thread(battle).start();
```

2、battle 对象实现了 Runnable 接口，所以有 run 方法，但是直接调用 run 方法，并不会启动一个新的线程，必须借助一个线程对象的 start 方法，才会启动一个新的线程

3、所以在创建 Thread 对象的时候，把 battle 作为构造方法的参数传递进去，这个线程启动的时候，就会去执行 battle.run 方法

代码实现：

```java
//1、定义 Battle 类，实现了 Runnable 接口，重写了 run 方法
class Battle implements Runnable{
     
    private Hero h1;
    private Hero h2;
 
    public Battle(Hero h1, Hero h2){
        this.h1 = h1;
        this.h2 = h2;
    }
 
    public void run(){
        while(!h2.isDead()){
            h1.attackHero(h2);
        }
    }
}

//2、测试
public class Test {

    public static void main(String[] args) {
        Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;
        gareen.damage = 50;

        Hero teemo = new Hero();
        teemo.name = "提莫";
        teemo.hp = 300;
        teemo.damage = 30;

        Hero bh = new Hero();
        bh.name = "赏金猎人";
        bh.hp = 500;
        bh.damage = 65;

        Hero leesin = new Hero();
        leesin.name = "盲僧";
        leesin.hp = 455;
        leesin.damage = 80;

        Battle battle1 = new Battle(gareen,teemo);
        new Thread(battle1).start();

        Battle battle2 = new Battle(bh,leesin);
        new Thread(battle2).start();
    }
}

//打印结果
盖伦 正在攻击 提莫, 提莫的血变成了 250
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 390
盖伦 正在攻击 提莫, 提莫的血变成了 200
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 325
盖伦 正在攻击 提莫, 提莫的血变成了 150
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 260
盖伦 正在攻击 提莫, 提莫的血变成了 100
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 195
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 130
盖伦 正在攻击 提莫, 提莫的血变成了 50
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 65
盖伦 正在攻击 提莫, 提莫的血变成了 0
提莫死了！
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 0
盲僧死了！
```

## 四、创建多线程-匿名内部类

使用匿名内部类，继承 Thread ，重写 run 方法，直接在 run 方法中写业务代码，匿名内部类的一个好处是可以很方便的访问外部的局部变量。前提是外部的局部变量需要被声明为 final（JDK 1.7 以后就不需要了）

代码实现：

```java
public class Test {

    public static void main(String[] args) {
        Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;
        gareen.damage = 50;

        Hero teemo = new Hero();
        teemo.name = "提莫";
        teemo.hp = 300;
        teemo.damage = 30;

        Hero bh = new Hero();
        bh.name = "赏金猎人";
        bh.hp = 500;
        bh.damage = 65;

        Hero leesin = new Hero();
        leesin.name = "盲僧";
        leesin.hp = 455;
        leesin.damage = 80;

        //匿名类
        Thread t1= new Thread(){
            public void run(){
                //匿名类中用到外部的局部变量teemo，必须把teemo声明为final
                //但是在JDK7以后，就不是必须加final的了
                while(!teemo.isDead()){
                    gareen.attackHero(teemo);
                }
            }
        };

        t1.start();

        Thread t2= new Thread(){
            public void run(){
                while(!leesin.isDead()){
                    bh.attackHero(leesin);
                }
            }
        };
        t2.start();
    }
}

//打印结果
盖伦 正在攻击 提莫, 提莫的血变成了 250
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 390
盖伦 正在攻击 提莫, 提莫的血变成了 200
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 325
盖伦 正在攻击 提莫, 提莫的血变成了 150
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 260
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 195
盖伦 正在攻击 提莫, 提莫的血变成了 100
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 130
盖伦 正在攻击 提莫, 提莫的血变成了 50
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 65
盖伦 正在攻击 提莫, 提莫的血变成了 0
提莫死了！
赏金猎人 正在攻击 盲僧, 盲僧的血变成了 0
盲僧死了！
```

## 五、总结

本篇文章我们介绍了三种启动线程的方式：

1、继承 Thread 类

2、实现 Runnable 接口

3、匿名内部类的方式

**注意：** 启动线程是 start 方法，run 方法并不能启动一个新的线程

好了，本篇文章到这里就结束了，感谢你的阅读🤝
