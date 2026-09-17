---
title: 多线程交互（四）
date: 2022-09-13 21:01:36
author: sweetying
tags: 
- 原创
- Java
- 多线程
categories:
- Java
- 多线程
---

## 问题

线程之间有交互通知的需求，考虑如下情况：

**有两个线程，处理同一个英雄，一个加血，一个减血。**

**减血的线程，发现血量 = 1，就停止减血，知道加血的线程为英雄加了血，加可以继续减血。**

## 一、不好的解决方式

1）、故意设计减血线程频率更高，盖伦的血量迟早会到达 1

2）、减血线程中使用 while 循环判断 hp 是否为 1，如果是 1 就不停的循环，知道加血线程回复了血量

3）、这种方式会大量占用 cpu ，拖慢性能

代码实现：

```java
//1、新建一个 Hero 类
public class Hero{
    public String name;
    public float hp;
      
    public int damage;
      
    public synchronized void recover(){
        hp=hp+1;
    }    
 
    public synchronized void hurt(){
            hp=hp-1;   
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

//2、测试
public class TestThread {

    public static void main(String[] args) {

        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;

        Thread t1 = new Thread(){
            public void run(){
                while(true){

                    //因为减血更快，所以盖伦的血量迟早会到达1
                    //使用while循环判断是否是1，如果是1就不停的循环
                    //直到加血线程回复了血量
                    while(gareen.hp==1){
                        continue;
                    }

                    gareen.hurt();
                    System.out.printf("t1 为%s 减血1点,减少血后，%s的血量是%.0f%n",gareen.name,gareen.name,gareen.hp);
                    try {
                        Thread.sleep(10);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

            }
        };
        t1.start();

        Thread t2 = new Thread(){
            public void run(){
                while(true){
                    gareen.recover();
                    System.out.printf("t2 为%s 回血1点,增加血后，%s的血量是%.0f%n",gareen.name,gareen.name,gareen.hp);

                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

            }
        };
        t2.start();

    }
}

//打印结果
t1 为盖伦 减血1点,减少血后，盖伦的血量是615
t2 为盖伦 回血1点,增加血后，盖伦的血量是616
t1 为盖伦 减血1点,减少血后，盖伦的血量是615
t1 为盖伦 减血1点,减少血后，盖伦的血量是614
...

```

## 二、使用 wait 和 notify 进行线程交互

1）、在 Hero 类中：hurt() 减血方法：当 hp = 1 的时候，执行 this.wait()，this.wait() 表示让占有 this 的线程等待，并临时释放占有。

2）、进入 hurt() 方法的线程必然是减血线程，this.wait() 会让减血线程临时释放堆 this 的占有，这样加血线程，就有机会进行 recover() 加血方法了。

3）、recover() 加血方法：增加了血量，执行 this.notify()。

4）、 this.notify() 表示通知那些等待在 this 的线程，可以苏醒过来了。等待在 this 的线程，恰恰是减血线程。

5）、一旦 recover() 结束，加血线程释放了 this，减血线程，就可以重新占有 this，并执行后面的减血工作。

![image-20221227114708310](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281627825.png)

代码实现：

```java
//1、Hero 类改造
class Hero {
    public String name;
    public float hp;

    public int damage;

    public synchronized void recover() {
        hp = hp + 1;
        System.out.printf("%s 回血1点,增加血后，%s的血量是%.0f%n", name, name, hp);
        // 通知那些等待在this对象上的线程，可以醒过来了，如第20行，等待着的减血线程，苏醒过来
        this.notify();
    }

    public synchronized void hurt() {
        if (hp == 1) {
            try {
                // 让占有this的减血线程，暂时释放对this的占有，并等待
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        hp = hp - 1;
        System.out.printf("%s 减血1点,减少血后，%s的血量是%.0f%n", name, name, hp);
    }

    public void attackHero(Hero h) {
        h.hp -= damage;
        System.out.format("%s 正在攻击 %s, %s的血变成了 %.0f%n", name, h.name, h.name, h.hp);
        if (h.isDead())
            System.out.println(h.name + "死了！");
    }

    public boolean isDead() {
        return 0 >= hp ? true : false;
    }
}

//2、测试
public class TestThread {

    public static void main(String[] args) {

        final Hero gareen = new Hero();
        gareen.name = "盖伦";
        gareen.hp = 616;

        Thread t1 = new Thread(){
            public void run(){
                while(true){

                    gareen.hurt();
                    try {
                        Thread.sleep(10);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

            }
        };
        t1.start();

        Thread t2 = new Thread(){
            public void run(){
                while(true){
                    gareen.recover();

                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

            }
        };
        t2.start();

    }
}

//打印结果
盖伦 减血1点,减少血后，盖伦的血量是615
盖伦 回血1点,增加血后，盖伦的血量是616
盖伦 减血1点,减少血后，盖伦的血量是615
盖伦 减血1点,减少血后，盖伦的血量是614
...
盖伦 回血1点,增加血后，盖伦的血量是2
盖伦 减血1点,减少血后，盖伦的血量是1
盖伦 回血1点,增加血后，盖伦的血量是2
盖伦 减血1点,减少血后，盖伦的血量是1
...
```

## 三、关于 wait，notify，notifyAll

这里需要强调的是，wait 方法和 notify 方法，并**不是Thread线程上的方法**，它们是 Object 上的方法。

因为所有的 Object 都可以被用来作为同步对象，所以准确的讲，wait 和 notify 是同步对象上的方法。

wait() 的意思是： 让占用了这个同步对象的**线程**，临时释放当前的占用，并且等待。 所以调用wait是有前提条件的，一定是在synchronized块里，否则就会出错。

notify() 的意思是：通知**一个**等待在这个同步对象上的线程，**你**可以苏醒过来了，有机会重新占用当前对象了。

notifyAll() 的意思是：通知**所有的**等待在这个同步对象上的线程，**你们**可以苏醒过来了，有机会重新占用当前对象了。

## 四、总结

本篇文章我们通过一个多线程交互的问题，引出了对 wait ，notify 的介绍和使用，注意 wait ，notify 等方法都是 Object 上的方法，因为所有的 Object 都可以当作同步对象，所以更准确的讲，wait 和 notify 是同步对象上的方法。

好了，本篇文章到这里就结束了，感谢你的阅读🤝
