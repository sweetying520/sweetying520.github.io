---
title: 一篇就够系列：Java 六大设计原则和常用设计模式
date: 2022-10-31 00:43:21
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281520219.jpeg
tags:
- 原创
- Java
- 设计模式
- 一篇就够
categories:
- Java
- 设计模式
---
![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281520219.jpeg)

## 前言

很高兴遇见你~

设计模式是我们编程的基础，掌握好常用的设计模式，能让我们写出可扩展，可维护，可复用的高质量代码。

## 一、什么是设计模式？

设计模式是被广泛使用，软件开发者编码经验的一个总结。使用设计模式的目的是为了让我们写出来的代码更容易被别人理解，具有高可复用性，可扩展性和可维护性

## 二、设计模式遵循的六大原则

### 2.1、开闭原则

简单理解：**对扩展开放，对修改关闭**

开闭原则是最基础的一个原则，其他 5 个原则都是开闭原则的具体形态，而开闭原则才是真正的精神领袖

举个书店卖书的例子：

```java
//1、定义书籍的接口
interface IBook {

    //名称
    String getName();
    //价格
    int getPrice();
    //作则
    String getAuthor();
}

//2、具体实现类：小说书
class NovelBook implements IBook{

    private final String name;
    private final int price;
    private final String author;

    public NovelBook(String name, int price, String author) {
        this.name = name;
        this.price = price;
        this.author = author;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public int getPrice() {
        return price;
    }

    @Override
    public String getAuthor() {
        return author;
    }
}

//3、书店，模拟卖书
public class BookStore {

    private final static List<IBook> BOOK_LIST = new ArrayList<>();

    static {
        BOOK_LIST.add(new NovelBook("天龙八部", 3200, "金庸"));
        BOOK_LIST.add(new NovelBook("巴黎圣母院", 3300, "雨果"));
        BOOK_LIST.add(new NovelBook("悲惨世界", 3400, "雨果"));
        BOOK_LIST.add(new NovelBook("水浒传", 3500, "施耐庵"));
    }

    public static void main(String[] args) {
        NumberFormat numberFormat = NumberFormat.getCurrencyInstance();
        numberFormat.setMaximumFractionDigits(2);
        System.out.println("书店卖出的书籍如下: ");
        for (IBook book : BOOK_LIST) {
            System.out.println("书籍名称： " + book.getName() 
                               + "\t书籍作者： " + book.getAuthor() 
                               + "\t书籍价格： " + numberFormat.format(book.getPrice() / 100) + "元");
        }
    }
}

//打印结果
书店卖出的书籍如下: 
书籍名称： 天龙八部	书籍作者： 金庸	书籍价格： ￥32.00元
书籍名称： 巴黎圣母院	书籍作者： 雨果	书籍价格： ￥33.00元
书籍名称： 悲惨世界	书籍作者： 雨果	书籍价格： ￥34.00元
书籍名称： 水浒传	书籍作者： 施耐庵	书籍价格： ￥35.00元

```

上面的代码我们就实现了书店模拟买书的情况，但是如果我要搞个打折活动，上面的功能是不支持的，因此我们需要对程序去扩展，如下：

```java
//继承当前书籍的实现类，对获取价格的方法进行修改打折
class OffNovelBook extends NovelBook{

    public OffNovelBook(String name, int price, String author) {
        super(name, price, author);
    }

    @Override
    public int getPrice() {
        int originPrice = super.getPrice();
        int offPrice = 0;
      	//大于 34 块，打 8 折，否则打 9 折
        if(originPrice > 3400){
            offPrice = (int) (originPrice * 0.8);
        }else {
            offPrice = (int) (originPrice * 0.9);
        }
        return offPrice;
    }
}


public class BookStore {
    private final static List<IBook> BOOK_LIST = new ArrayList<>();

    static {
        BOOK_LIST.add(new OffNovelBook("天龙八部", 3200, "金庸"));
        BOOK_LIST.add(new OffNovelBook("巴黎圣母院", 3300, "雨果"));
        BOOK_LIST.add(new OffNovelBook("悲惨世界", 3400, "雨果"));
        BOOK_LIST.add(new OffNovelBook("水浒传", 3500, "施耐庵"));
    }

    public static void main(String[] args) {
        NumberFormat numberFormat = NumberFormat.getCurrencyInstance();
        numberFormat.setMaximumFractionDigits(2);
        System.out.println("书店卖出的书籍如下: ");
        for (IBook book : BOOK_LIST) {
            System.out.println("书籍名称： " + book.getName() + "\t书籍作者： " + book.getAuthor() + "\t书籍价格： " + numberFormat.format(book.getPrice() / 100) + "元");
        }
    }
}
//打印结果
书店卖出的书籍如下: 
书籍名称： 天龙八部	书籍作者： 金庸	书籍价格： ￥28.00元
书籍名称： 巴黎圣母院	书籍作者： 雨果	书籍价格： ￥29.00元
书籍名称： 悲惨世界	书籍作者： 雨果	书籍价格： ￥30.00元
书籍名称： 水浒传	书籍作者： 施耐庵	书籍价格： ￥28.00元

```

### 2.2、里氏替换原则

简单理解：**使用基类的地方可以使用子类替换**

以士兵拿枪击杀敌人为例：

```java
//1、定一一个使用枪的接口
interface AbstractGun {
    void shoot();
}

//2、具体实现1：手枪
class HandGun implements AbstractGun{
    @Override
    public void shoot() {
        System.out.println("手枪射击");
    }
}

//3、具体实现2：机枪
class MachineGun implements AbstractGun{
    @Override
    public void shoot() {
        System.out.println("机枪射击");
    }
}

//3、具体实现3：步枪
class RifleGun implements AbstractGun{
    @Override
    public void shoot() {
        System.out.println("步枪射击");
    }
}

//4、定义一个士兵 
class Soldier {
    //持有的枪
    private AbstractGun gun;

    //设置枪
    public void setAbstractGun(AbstractGun gun){
        this.gun = gun;
    }

    //击杀敌人
    public void killEnemy(){
        System.out.println("开始kill敌人");
        this.gun.shoot();
    }
}

//5、客户端测试类
public class Client {
    public static void main(String[] args) {
      	//创建一个士兵的实例
        Soldier soldier = new Soldier();
      	//设置枪 基类存在的地方可以用子类替换具体体现
        soldier.setAbstractGun(new HandGun());
      	//击杀敌人
        soldier.killEnemy();
    }
}

//打印结果
开始kill敌人
手枪射击
```

UML类图如下:

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281520538.png" alt="image-20210302200400755" style="zoom:100%;" width="100%"/>

### 2.3、依赖倒置原则

简单理解：**面向接口编程**

举个司机开车的例子：

```java
//定义一个开车的接口
interface ICar {

    /**
     * 开车
     */
    void run();
}

//定义一个开车的司机接口
interface IDriver {

    /**
     * 开车
     * @param iCar ICar接口
     */
    void driver(ICar iCar);
}

//开车的具体实现类1
class Benz implements ICar{
    @Override
    public void run() {
        System.out.println("开奔驰车");
    }
}

//开车的具体实现类1
class BWM implements ICar{
    @Override
    public void run() {
        System.out.println("开宝马车");
    }
}

//司机的具体实现类
class Driver implements IDriver{

    @Override
    public void driver(ICar iCar) {
        iCar.run();
    }
}

//测试类
public class Client {
    public static void main(String[] args) {
      	//定义接口引用，具体实现则是对应接口的实现类，这就是面向接口编程，即多态，实现类之间不直接发生依赖关系
        IDriver iDriver = new Driver();
        ICar benz = new Benz();
        iDriver.driver(benz);
    }
}

//打印结果
开奔驰车
```

### 2.4、迪米特法则

简单理解：**一个对象对另一个对象应该尽可能少的了解**

例如：老师命令班长清点学生人数，那么老师只有和班长有交流，下达这个命令给班长，其余的事情交给班长做就行了，具体实现：

```java
//学生
class Student {
  
}

//班长
class ClassLeader {
    private final List<Student> studentList;
  
    public ClassLeader(List<Student> studentList) {
        this.studentList = studentList;
    }

    //清点学生人数
    public void countStudentList(){
        System.out.println("学生的人数是: " + studentList.size());
    }
}

//老师
class Teacher {
    //下达命令给班长
    public void command(ClassLeader classLeader){
        classLeader.countStudentList();
    }
}

//测试类
public class Client {
    public static void main(String[] args) {
        List<Student> studentList = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            studentList.add(new Student());
        }
        ClassLeader classLeader = new ClassLeader(studentList);
        Teacher teacher = new Teacher();
        teacher.command(classLeader);
    }
}

//打印结果
学生的人数是: 20
```

### 2.5、接口隔离原则

简单理解：**使用多个接口，比使用单个接口要好**

例如：每个人的审美观不一样，张三认为颜值高就是美女，即使身材和气质一般；李四认为身材好就行，不在乎颜值和气质；而王五则认为颜值和身材都是外在，只要有气质，那就是美女。这时，我们就要分开的去定义接口了，代码实现：

```java
//颜值高
interface IGoodLookingGirl {
    void goodLooking();
}

//气质出众
interface IGreatTemperamentGirl {
    void greatTemperament();
}

//身材好
interface INiceFigureGirl {
    void niceFigure();
}

//具体实现类
class PrettyGirl implements IGoodLookingGirl,IGreatTemperamentGirl,INiceFigureGirl{

    private String name;

    public PrettyGirl(String name) {
        this.name = name;
    }

    @Override
    public void goodLooking() {
        System.out.println(this.name + "颜值很高");
    }

    @Override
    public void greatTemperament() {
        System.out.println(this.name + "气质出众");
    }

    @Override
    public void niceFigure() {
        System.out.println(this.name + "身材很好");
    }
}

//搜索抽象类
abstract class AbstractSearcher {

    protected IGoodLookingGirl goodLookingGirl;
    protected IGreatTemperamentGirl greatTemperamentGirl;
    protected INiceFigureGirl niceFigureGirl;

    public AbstractSearcher(IGoodLookingGirl goodLookingGirl, IGreatTemperamentGirl greatTemperamentGirl, INiceFigureGirl niceFigureGirl) {
        this.goodLookingGirl = goodLookingGirl;
        this.greatTemperamentGirl = greatTemperamentGirl;
        this.niceFigureGirl = niceFigureGirl;
    }

    public abstract void show();
}

//具体搜索实现
class Searcher extends AbstractSearcher {
    
public Searcher(IGoodLookingGirl goodLookingGirl, IGreatTemperamentGirl greatTemperamentGirl, INiceFigureGirl 	niceFigureGirl) {
        super(goodLookingGirl, greatTemperamentGirl, niceFigureGirl);
 }

    @Override
    public void show() {
        System.out.println("美女信息如下: ");
        if(super.goodLookingGirl != null)
        super.goodLookingGirl.goodLooking();
        if(super.niceFigureGirl != null)
        super.niceFigureGirl.niceFigure();
        if(super.greatTemperamentGirl != null)
        super.greatTemperamentGirl.greatTemperament();
    }
}

//测试类
public class Client {
   public static void main(String[] args) {
      PrettyGirl prettyGirl = new PrettyGirl("lily");
      Searcher searcher = new Searcher(prettyGirl,prettyGirl,null);
      searcher.show();
   }
}

//打印结果
美女信息如下: 
lily颜值很高
lily气质出众
```

### 2.6、单一职责原则

简单理解：**一个类或接口只负责一件事情**

例如：以打电话为例，打电话大致流程分为：拨号，通话，挂断。我们设计一个接口：

```java
public interface IPhone {

    /**
     * 拨号
     */
    void dial();

    /**
     * 通话
     */
    void call();

    /**
     * 挂断
     */
    void hangUp();
}
```

上面这个接口设计看上去没什么问题，但是我们具体分析一下，拨号和挂断属于协议连接，通话属于数据传送，一个接口里面承担了两个职责，这是不符合单一职责的，因此我们可以进行如下改造：

```java
public interface IConnectionManage {

    /**
     * 拨号
     */
    void dial();
    
    /**
     * 挂断
     */
    void hangUp();
}

public interface IDataTransform {

    /**
     * 通话
     */
    void call();
}
```

将其拆分成两个接口，每个接口只承担一个职责，这样就完美了

## 三、常用的设计模式

### 3.1、工厂模式

工厂模式不是一种单独的设计模式，而是3种功能相近的设计模式的总称，如下：

为了方便理解，我们以创建口罩为例子来说明：

#### 3.1.1、简单工厂模式

定义：**简单工厂模式拥有唯一的工厂类，工厂类根据传入的参数经过 if-else 条件判断决定去创建哪个产品**

举例说明：

我们定义一个口罩的接口，它下面有高端口罩和低端口罩两种产品子类，现在我们使用简单工厂模式去创建他们：

```java
//定义一个口罩的接口
interface IMask{
    void show();
}

//口罩的具体实现，高端口罩
class HighMask implements IMask{

    @Override
    public void show() {
        System.out.println("我是高端口罩");
    }
}

//口罩的具体实现，低端口罩
class LowMask implements IMask{

    @Override
    public void show() {
        System.out.println("我是低端口罩");
    }
}

//简单工厂拥有唯一的工厂类
class MaskFactory{
    public IMask createMask(String type){
        IMask mask = null;
        if("高端口罩".equals(type)){
            mask = new HighMask();
        }else if("低端口罩".equals(type)){
            mask = new LowMask();
        }
        return mask;
    }
}

//测试类
public class FactoryClient {

    public static void main(String[] args) {
        MaskFactory maskFactory = new MaskFactory();
        IMask mHighMask = maskFactory.createMask("高端口罩");
        IMask mLowMask = maskFactory.createMask("低端口罩");
        mHighMask.show();
        mLowMask.show();
    }
}

//打印结果
我是高端口罩
我是低端口罩
```

**缺点:**  当我新增产品子类又要去新增if-else条件判断，不符合开闭原则，针对这种情况我们可以使用工厂方法模式

#### 3.1.2、工厂方法模式

定义：**工厂方法模式拥有多个工厂，利用多态去创建不同的产品对象，避免了简单工厂模式冗余的 if-else 条件判断**

我们给不同的产品子类创建一个对应的工厂：

```java
//定义一个口罩的接口
interface IMask{
    void show();
}

//口罩的具体实现，高端口罩
class HighMask implements IMask{

    @Override
    public void show() {
        System.out.println("我是高端口罩");
    }
}

//口罩的具体实现，低端口罩
class LowMask implements IMask{

    @Override
    public void show() {
        System.out.println("我是低端口罩");
    }
}

//定义生产口罩的工厂接口
interface IMaskFactory{
    IMask createMask();
}

//高端口罩工厂类
class HighMaskFactory implements IMaskFactory{

    @Override
    public IMask createMask() {
        return new HighMask();
    }
}

//低端口罩工厂类
class LowMaskFactory implements IMaskFactory{

    @Override
    public IMask createMask() {
        return new LowMask();
    }
}

//测试类
public class FactoryClient {

    public static void main(String[] args) {
        IMaskFactory mHighMaskFactory = new HighMaskFactory();
        IMaskFactory mLowMaskFactory = new LowMaskFactory();
        IMask mHighMask = mHighMaskFactory.createMask();
        IMask mLowMask = mLowMaskFactory.createMask();
        mHighMask.show();
        mLowMask.show();
    }
}

//打印结果
我是高端口罩
我是低端口罩
```

**缺点：** 当我新增的不同类型的产品，例如防护服，而且也分为高端防护服和低端防护服，依次类推，那么我们针对这些产品子类都需要去创建一个工厂子类，工厂子类将会变的非常多，针对这种情况我们可以使用抽象工厂模式

#### 3.1.3、抽象工厂模式

定义：**抽象工厂模式会把不同产品子类进行分组，组内不同的产品子类对应同一个工厂子类的不同创建方法，这样就减少了工厂子类的创建**

例如我们刚才说的，这个时候我们又新增了高端防护服和低端防护服，那么这个时候我们就可以划分高端产品和低端产品两个分组，高端产品包括高端口罩和高端防护服，低端产品包括低端口罩和低端防护服，针对这个产品分组，我们就只需要创建高端工厂和低端工厂就ok了，这样就减少了工厂子类的创建：

```java
//定义一个口罩的接口
interface IMask{
    void show();
}

//口罩的具体实现，高端口罩
class HighMask implements IMask{

    @Override
    public void show() {
        System.out.println("我是高端口罩");
    }
}

//口罩的具体实现，低端口罩
class LowMask implements IMask{

    @Override
    public void show() {
        System.out.println("我是低端口罩");
    }
}

//定义防护服的接口
interface IProtectiveSuit{
    void show();
}

//防护服的具体实现，高端防护服
class HighProtectiveSuit implements IProtectiveSuit{

    @Override
    public void show() {
        System.out.println("我是高端防护服");
    }
}

//防护服的具体实现，低端防护服
class LowProtectiveSuit implements IProtectiveSuit{

    @Override
    public void show() {
        System.out.println("我是低端防护服");
    }
}

//定义工厂接口
interface IFactory{
    IMask createMask();
    IProtectiveSuit createSuit();
}

//高端工厂
class HighFactory implements IFactory{

    @Override
    public IMask createMask() {
        return new HighMask();
    }

    @Override
    public IProtectiveSuit createSuit() {
        return new HighProtectiveSuit();
    }
}

//低端工厂
class LowFactory implements IFactory{

    @Override
    public IMask createMask() {
        return new LowMask();
    }

    @Override
    public IProtectiveSuit createSuit() {
        return new LowProtectiveSuit();
    }
}

//测试类
public class FactoryClient {

    public static void main(String[] args) {
        IFactory mHighFactory = new HighFactory();
        IFactory mLowFactory = new LowFactory();

        IMask mHighMask = mHighFactory.createMask();
        IProtectiveSuit mHighProtectiveSuit = mHighFactory.createSuit();

        IMask mLowMask = mLowFactory.createMask();
        IProtectiveSuit mLowProtectiveSuit = mLowFactory.createSuit();

        mHighMask.show();
        mHighProtectiveSuit.show();
        mLowMask.show();
        mLowProtectiveSuit.show();
    }
}

//打印结果
我是高端口罩
我是高端防护服
我是低端口罩
我是低端防护服
```

#### 3.1.4、工厂方法模式和抽象工厂模式的异同

异：

> 1、工厂方法模式针对的是单个产品等级结构，而抽象工厂模式针对的是多个产品的等级结构
>
> 2、工厂方法模式每个具体的工厂只能创建一种产品对象，而抽象工厂模式的具体工厂能创建多个产品对象

同：

> 1、工厂方法模式和抽象工厂模式的抽象产品都拥有多个具体的实现产品
>
> 2、工厂方法模式和抽象工厂模式的抽象工厂类都有多个具体的实现工厂类

### 3.2、策略模式

定义：**定义一系列的算法，并可以实现自由的切换**

举个古装大侠打斗的例子：

```java
//定义一个攻击招式的接口
interface IAttack{
    void attack();
}

//定一个抽象的角色类
abstract class Role{

    protected String name;
    private IAttack iAttack;

    public Role(String name) {
        this.name = name;
    }

    public void setiAttack(IAttack iAttack) {
        this.iAttack = iAttack;
    }

    public void attack(){
        iAttack.attack();
    }
}

//具体角色类
class MyRole extends Role{

    public MyRole(String name) {
        super(name);
    }
}

//攻击招式的具体实现
class MyAttack implements IAttack{

    @Override
    public void attack() {
        System.out.println("降龙十八掌");
    }
}

//攻击招式的具体实现
class MyAttack2 implements IAttack{

    @Override
    public void attack() {
        System.out.println("乾坤大挪移");
    }
}

//测试类
public class StrategyClient2 {

    public static void main(String[] args) {
        MyRole myRole = new MyRole("乔峰");
        myRole.setiAttack(new MyAttack());
      	//具体使用什么招式攻击 由客户端自己决定
      	//myRole.setiAttack(new MyAttack2());
        System.out.println(myRole.name + ": ");
        myRole.attack();
    }
}

//打印结果
乔峰: 
降龙十八掌
```

### 3.3、状态模式

定义：**对象内部状态的改变会改变其行为**

举个电视机开关机的例子：

```java
//定义电视机的状态
interface TvState{
    void nextChannel();
    void prevChannel();
    void turnUp();
    void turnDown();
}

//具体实现 关机状态
class PowerOfferState implements TvState{

    @Override
    public void nextChannel() {

    }

    @Override
    public void prevChannel() {

    }

    @Override
    public void turnUp() {

    }

    @Override
    public void turnDown() {

    }
}

//具体实现 开机状态
class PowerOnState implements TvState{

    @Override
    public void nextChannel() {
        System.out.println("下一个频道");
    }

    @Override
    public void prevChannel() {
        System.out.println("上一个频道");
    }

    @Override
    public void turnUp() {
        System.out.println("调高音量");
    }

    @Override
    public void turnDown() {
        System.out.println("调低音量");
    }
}

//电源接口
interface PowerController{
    void powerOff();
    void powerOn();
}

//电视遥控器
class TvController implements PowerController{

    private TvState tvState;

    public void setTvState(TvState tvState) {
        this.tvState = tvState;
    }

    @Override
    public void powerOff() {
        setTvState(new PowerOfferState());
        System.out.println("关机了");
    }

    @Override
    public void powerOn() {
        setTvState(new PowerOnState());
        System.out.println("开机了");
    }


    public void nextChannel() {
        tvState.nextChannel();
    }

    public void prevChannel() {
        tvState.prevChannel();
    }

    public void turnUp() {
        tvState.turnUp();
    }

    public void turnDown() {
        tvState.turnDown();
    }
}

//测试类
public class StateClient {
    public static void main(String[] args) {
        TvController tvController = new TvController();
        tvController.powerOn();
        tvController.nextChannel();
        tvController.turnUp();
        tvController.powerOff();
        tvController.turnUp();
        tvController.prevChannel();
        tvController.turnDown();
    }
}

//打印结果
开机了
下一个频道
调高音量
关机了
```

### 3.4、代理模式

代理模式主要是使用代理对象劫持原始对象，达到对原始对象的控制

代理模式分为：

> 1、静态代理
>
> 2、动态代理

#### 3.4.1、静态代理

```java
//1、定义一个代理接口
public interface ITestProxy {

    void test();

    void login();

    void register();
}

//2、实现类
public class TestProxy implements ITestProxy{

    @Override
    public void test(){
        System.out.println("被代理对象执行了 test 方法");
    }

    @Override
    public void login() {
        System.out.println("被代理对象执行了 login 方法");
    }

    @Override
    public void register() {
        System.out.println("被代理对象执行了 register 方法");

    }
}

//3、代理类
public class StaticProxy implements ITestProxy{

    private final ITestProxy testProxy;

    public StaticProxy(ITestProxy testProxy) {
        this.testProxy = testProxy;
    }


    @Override
    public void test(){
        System.out.println("testBefore...");
        testProxy.test();
        System.out.println("testAfter...");
    }

    @Override
    public void login() {
        System.out.println("loginBefore...");
        testProxy.login();
        System.out.println("loginAfter...");
    }

    @Override
    public void register() {
        testProxy.register();
    }
}

//4、测试
public class Client {
    public static void main(String[] args) {
        //静态代理
        TestProxy testProxy = new TestProxy();
        StaticProxy staticProxy = new StaticProxy(testProxy);
        staticProxy.test();
        staticProxy.login();
        staticProxy.register();
    }
}
//打印结果
testBefore...
被代理对象执行了 test 方法
testAfter...
loginBefore...
被代理对象执行了 login 方法
loginAfter...
被代理对象执行了 register 方法
```

可以看到，上述我们使用代理对象 StaticProxy 劫持了原始对象 TestProxy，并插入了一些 log 打印

#### 3.4.2、动态代理

动态代理主要分两种：

> 1、JDK 动态代理
>
> 2、cglib 动态代理

##### 3.4.2.1、JDK 动态代理

```java
//1、定义一个代理接口
public interface ITestProxy {

    void test();

    void login();

    void register();
}

//2、实现类
public class TestProxy implements ITestProxy{

    @Override
    public void test(){
        System.out.println("被代理对象执行了 test 方法");
    }

    @Override
    public void login() {
        System.out.println("被代理对象执行了 login 方法");
    }

    @Override
    public void register() {
        System.out.println("被代理对象执行了 register 方法");

    }
}

//3、定义一个动态代理 Handler
public class LogHandler implements InvocationHandler {

    final Object target;

    public LogHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if("test".equals(method.getName())){
            System.out.println("testBefore...");
            Object invoke = method.invoke(target, args);
            System.out.println("testAfter...");
            return invoke;
        }else if("login".equals(method.getName())){
            System.out.println("loginBefore...");
            Object invoke = method.invoke(target, args);
            System.out.println("loginAfter...");
            return invoke;
        }
        return method.invoke(target,args);
    }
}

//4、测试
public class Client {
    public static void main(String[] args) {
        //JDK 动态代理
        ClassLoader classLoader = ITestProxy.class.getClassLoader();
        Class<?>[] interfaces = new Class[]{ITestProxy.class};
      	//动态代理对象
        ITestProxy iTestProxy = (ITestProxy) Proxy.newProxyInstance(classLoader, interfaces, new LogHandler(new TestProxy()));
        iTestProxy.test();
        iTestProxy.login();
        iTestProxy.register();
    }

//打印结果
testBefore...
被代理对象执行了 test 方法
testAfter...
loginBefore...
被代理对象执行了 login 方法
loginAfter...
被代理对象执行了 register 方法
```

动态代理使用起来比较简单，关键方法是：`java.langlreflect`包下的 `Proxy`的`newProxyInstance`方法

另外**需要注意**：**JDK 动态代理中被代理对象必须要实现一个接口。如果有一个需要被代理的对象没有实现接口，那么它就代理不了**

如果我想实现被代理对象没有实现接口的这种方式要怎么办呢？

答：使用 cglib 动态代理

##### 3.4.2.2、cglib 动态代理

首先我们需要进入，cglib 这个库：

```groovy
implementation 'cglib:cglib:3.2.6'
```

接着来进行具体实现：

```java
//1、定义一个需要被代理对象，可以看到 TestProxy 没有实现任何接口
public class TestProxy{

    public void test(){
        System.out.println("被代理对象执行了 test 方法");
    }

    public void login() {
        System.out.println("被代理对象执行了 login 方法");
    }

    public void register() {
        System.out.println("被代理对象执行了 register 方法");

    }
}

//2、定义 cglib 代理类
public class CglibProxy implements MethodInterceptor {

    //被代理对象
    private final Object object;

    public CglibProxy(Object object) {
        this.object = object;
    }

    public Object getProxyInstance(){
        //工具类
        Enhancer enhancer = new Enhancer();
        //设置父类
        enhancer.setSuperclass(object.getClass());
        //设置回调函数
        enhancer.setCallback(this);
        //常见代理对象并返回
        return enhancer.create();
    }

    @Override
    public Object intercept(Object proxyObject, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        if("test".equals(method.getName())){
            System.out.println("testBefore...");
            Object invoke = method.invoke(object, args);
            System.out.println("testAfter...");
            return invoke;
        }else if("login".equals(method.getName())){
            System.out.println("loginBefore...");
            Object invoke = method.invoke(object, args);
            System.out.println("loginAfter...");
            return invoke;
        }
        return method.invoke(object,args);
    }
}

//3、测试
public class Client {
    public static void main(String[] args) {
        //cglib 动态代理
        TestProxy testProxy = new TestProxy();
        final TestProxy cgLibTestProxy = (TestProxy) new CglibProxy(testProxy).getProxyInstance();
        cgLibTestProxy.test();
        cgLibTestProxy.login();
        cgLibTestProxy.register();
    }
}

//打印结果
testBefore...
被代理对象执行了 test 方法
testAfter...
loginBefore...
被代理对象执行了 login 方法
loginAfter...
被代理对象执行了 register 方法
```

可以看到 cglib 动态代理我们主要使用了 Enhancer 工具类以及实现了 MethodInterceptor 接口

**Tips**： 如果被代理类对象实现了接口就使用 JDK 动态代理，否则使用 cglib 动态代理

### 3.5、单例模式

单例模式共有 5 种写法：

> 1、懒汉式
>
> 2、饿汉式
>
> 3、双重检查式
>
> 4、静态内部类式
>
> 5、枚举式

#### 3.5.1、懒汉式

```java
public class LazySingleton {

    private static LazySingleton instance;

    private LazySingleton(){

    }

    public synchronized static LazySingleton getInstance(){
        if(instance == null){
            instance = new LazySingleton();
        }
        return instance;
    }
}
```

这种方式每次调用 getInstance 方法的时候都会进行同步，造成不必要的同步开销

#### 3.5.2、饿汉式

```java
public class HungrySingleton {

    private static HungrySingleton instance = new HungrySingleton();

    private HungrySingleton(){

    }

    public static HungrySingleton getInstance(){
        return instance;
    }
}
```

这种方式会在类加载的时候就完成实例的创建，如果从始至终没有使用该实例，则会造成内存的浪费

#### 3.5.3、双重检查式

```java
public class DoubleCheckSingleton {

    private volatile static DoubleCheckSingleton instance;

    private DoubleCheckSingleton(){

    }

    public static  DoubleCheckSingleton getInstance(){
        if(instance == null){
            synchronized (DoubleCheckSingleton.class){
                if(instance == null){
                    instance = new DoubleCheckSingleton();
                }
            }
        }
        return instance;
    }
}
```

这种方式相对来说比较完美一些，但是在 jdk 1.5 之前，高并发的情况下，还是会存在一些问题。如下代码：

```java
instance = new DoubleCheckSingleton();
```

上述这行代码实际上并不是一个原子操作，它最终会被编译成多条指令，主要做了三件事情：

> 1、给 instance 实例分配内存
>
> 2、调用 DoubleCheckSingleton 构造函数，初始化成员字段
>
> 3、将 instance 指向分配的内存（此时 instance 就不为 null 了）

在 JDK 1.5 之前，高并发的情况下 2，3 的顺序是无法保证的，可能为：1-2-3，也可能为：1-3-2。在 JDK 1.5 之后，官方具体化了 volitile 关键字，上述 instance 对象每次都会从主内存读取。当然，volatile 关键字或多或少会影响性能，但是考虑到程序的正确性，这点牺牲也是值得的

优点：资源利用率高，第一次调用 getInstance 方法单例对象才会被实例化，效率高。

缺点：第一次加载稍慢，在 jdk 1.5 之前可能会失效

#### 3.5.4、静态内部类式

```java
public class StaticInnerClassSingleton {

    private StaticInnerClassSingleton(){

    }

    private static final class Holder{
        private static final StaticInnerClassSingleton INSTANCE = new StaticInnerClassSingleton();
    }

    public static StaticInnerClassSingleton getInstance(){
        return Holder.INSTANCE;
    }
}

```

第一次调用 getInstance 方法时才会去加载 Holder 并初始化 INSTANCE，这样既保证了线程的安全也保证了实例的唯一性

#### 3.5.5、枚举式

```java
public enum EnumSingleton {
    INSTANCE;
}
```

默认枚举的实例是线程安全的，并且在任何情况下都是单例，但是这种方式可读性不高

### 3.6、建造者模式

建造者模式主要用来构建对象，将对象的构建与表示进行分离，它更加注重对象的构建过程

```java
public class Computer {

    private final String cpu;
    private final String ram;
    private final String rom;

    private Computer(Builder builder){
        cpu = builder.cpu;
        ram = builder.ram;
        rom = builder.rom;
    }

    public String getCpu() {
        return cpu;
    }

    public String getRam() {
        return ram;
    }

    public String getRom() {
        return rom;
    }

    public static class Builder{
        private  String cpu;
        private  String ram;
        private  String rom;


        public Builder cpu(String cpu) {
            this.cpu = cpu;
            return this;
        }


        public Builder ram(String ram) {
            this.ram = ram;
            return this;
        }


        public Builder rom(String rom) {
            this.rom = rom;
            return this;
        }

        public Computer build(){
            return new Computer(this);
        }
    }

    public static void main(String[] args) {
        final Computer computer = new Computer.Builder()
                .cpu("英特尔")
                .ram("8G")
                .rom("128G")
                .build();

        System.out.println(computer.getCpu());
        System.out.println(computer.getRam());
        System.out.println(computer.getRom());
    }
}

//打印结果
英特尔
8G
128G
```

### 3.7、原型模式

原型模式主要用于构建对象，通过拷贝原型对象来创建新的对象，拷贝方式主要分为两种：

> 1、浅拷贝
>
> 2、深拷贝

#### 3.7.1、浅拷贝

拷贝一个对象时，如果对象里面的是基本类型，则拷贝的是基本类型的值。如果对象里面是引用类型，则拷贝的是引用类型的地址，此时并没有开辟新的内存空间

```java
class Test {

    static class Student implements Cloneable{
        public String name;

        public Student(String name) {
            this.name = name;
        }

        @Override
        public String toString() {
            return "Student{" +
                    "name='" + name + '\'' +
                    '}';
        }

        @NonNull
        @Override
        protected Student clone()  {
            try {
                return (Student) super.clone();
            } catch (CloneNotSupportedException e) {
                e.printStackTrace();
            }
            return null;
        }
    }


    public static void main(String[] args) {
        //浅拷贝
        ArrayList<Student> stringList = new ArrayList<>();
        Student stu = new Student("erdai");
        stringList.add(stu);
        stringList.add(new Student("erdai666"));
        System.out.println(stringList);
        //浅拷贝核心代码
        ArrayList<Student> newStringList = (ArrayList<Student>) stringList.clone();
        System.out.println(newStringList);
        //改变 stu 内的值，结果两个集合的值都变了
        stu.name = "erdai777";
        System.out.println(stringList);
        System.out.println(newStringList);
    }
}

//打印结果
[Student{name='erdai'}, Student{name='erdai666'}]
[Student{name='erdai'}, Student{name='erdai666'}]
[Student{name='erdai777'}, Student{name='erdai666'}]
[Student{name='erdai777'}, Student{name='erdai666'}]
```

#### 3.7.2、深拷贝

拷贝一个对象时，如果对象里面的是基本类型，则拷贝的是基本类型的值，如果对象里面是引用类型，则将引用类型也拷贝一份，此时开辟了新的内存空间

```java
class Test {

    static class Student implements Cloneable{
        public String name;

        public Student(String name) {
            this.name = name;
        }

        @Override
        public String toString() {
            return "Student{" +
                    "name='" + name + '\'' +
                    '}';
        }

        @NonNull
        @Override
        protected Student clone()  {
            try {
                return (Student) super.clone();
            } catch (CloneNotSupportedException e) {
                e.printStackTrace();
            }
            return null;
        }
    }


    public static void main(String[] args) {
        //深拷贝
        ArrayList<Student> stringList = new ArrayList<>();
        Student stu = new Student("erdai");
        stringList.add(stu);
        stringList.add(new Student("erdai666"));
        System.out.println(stringList);
      	//深拷贝核心代码
        ArrayList<Student> newStringList = new ArrayList<>();
        for (Student student : stringList) {
            newStringList.add(student.clone());
        }
        System.out.println(newStringList);
        //改变 stu 内的值，只有 StringList 的值会变，newStringList 不会变
        stu.name = "erdai777";
        System.out.println(stringList);
        System.out.println(newStringList);
    }
}

//打印结果
[Student{name='erdai'}, Student{name='erdai666'}]
[Student{name='erdai'}, Student{name='erdai666'}]
[Student{name='erdai777'}, Student{name='erdai666'}]
[Student{name='erdai'}, Student{name='erdai666'}]
```

### 3.8、适配器模式

适配器模式主要用于适配另外一个不兼容的对象一起工作，主要分 3 种方式：

> 1、类适配
>
> 2、对象适配
>
> 3、接口适配

#### 3.8.1、类适配

```java
//1、定义一个需要被适配的类
class Adaptee{
    public void adaptee(){
        System.out.println("调用了被适配的方法");
    }
}

//2、定义一个目标接口
interface Target{
    void request();
}

//现在我们需要在目标接口的 request 方法中调用 Adaptee 的 adaptee 方法，如何实现呢？

//3、定义一个适配器的类
class Adapter extends Adaptee implements Target{

    @Override
    public void request(){
        System.out.println("通过适配器，连接目标方法");
        super.adaptee();
    }
}

//4、测试
public class ClassClient {

 
    public static void main(String[] args){
        Target target = new Adapter();
        target.request();
    }
}

//打印结果
通过适配器，连接目标方法
调用了被适配的方法
```

#### 3.8.2、对象适配

电源适配器：将 200V 的电话转换为 5V 输出

```java
//1、定义一个电压的接口
interface AC{
    int outputAC();
}

//2、定义一个 220V 的实现类
class AC220 implements AC{

    @Override
    public int outputAC(){
        return 220;
    }
}

//3、适配器接口，outputDC5V 方法用于将输入的电压变为 5V 后输出
interface DC5Adapter{
    int outputDC5V(AC ac);
}

//4、实现电源适配器
class PowerAdapter implements DC5Adapter{

    @Override
    public int outputDC5V(AC ac){
        int outputAC = ac.outputAC();
        //变压器
        int adapterOutput = outputAC / 44;
        System.out.println("收到：" + outputAC + "V的电压，通过适配器转换，输出为：" + adapterOutput + "V");
        return adapterOutput;
    }
}

//5、测试
public class ObjectClient {

    public static void main(String[] args) {
        DC5Adapter adapter = new PowerAdapter();
        AC ac = new AC220();
        adapter.outputDC5V(ac);
    }
}

//打印结果
收到：220V的电压，通过适配器转换，输出为：5V
```

#### 3.8.3、接口适配

在实际开发中，经常会遇到接口中定义了太多的方法，而有些方法我们是用不到的，此时我们就可以通过适配器模式适配接口

```java
//1、定义一个接口，里面有两个抽象方法
interface ITest{
  void test();
  void test1();
}

//2、定义一个适配器的抽象类
abstract class AdapterWrapper implements ITest{

    @Override
    public void test() {
        
    }

    @Override
    public void test1() {

    }
}

//3、接下来，我们就可以继承适配器的抽象类，然后去选择需要实现的方法
class Test extends AdapterWrapper{
   @Override
    public void test() {
        System.out.println("erdai666");
    }
}

//4、测试
public class InterfaceClient {

    public static void main(String[] args) {
        Test test = new Test();
        test.test();
    }
}

//打印结果
erdai666
```

### 3.9、装饰者模式

装饰者模式主要用于装饰一个类，达到功能增强的目的

如下例子：我想吃个蛋炒饭，但是单独一个蛋炒饭我觉得不好吃，我想在上面加火腿，加牛肉。我们使用装饰者模式来实现它

```java
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

### 3.10、外观模式

外观模式主要用于简化系统的使用，它对外提供一个高层接口，并将子系统的功能进行封装

```java
//1、提供一些子系统的类
class CPU{
    public void startup(){
        System.out.println("cpu startup");
    }

    public void shutdowm(){
        System.out.println("cpu shutdowm");
    }
}

class RAM{
    public void startup(){
        System.out.println("ram startup");
    }

    public void shutdowm(){
        System.out.println("ram shutdowm");
    }
}

class ROM{
    public void startup(){
        System.out.println("rom startup");
    }

    public void shutdowm(){
        System.out.println("rom shutdowm");
    }
}

//2、外观类
class Computer{
    private CPU cpu;
    private RAM ram;
    private ROM rom;

    public Computer(){
        cpu = new CPU();
        ram = new RAM();
        rom = new ROM();
    }

    public void startup(){
        cpu.startup();
        ram.startup();
        rom.startup();
    }

    public void shutdowm(){
        cpu.shutdowm();
        ram.shutdowm();
        rom.shutdowm();
    }
}

//3、测试
public class FacadeClient {

    public static void main(String[] args) {
        Computer computer = new Computer();
        computer.startup();
        computer.shutdowm();
    }
}

//打印结果
cpu startup
ram startup
rom startup
cpu shutdowm
ram shutdowm
rom shutdowm
```

外观模式优点：

1、将对子系统的依赖转换为对外观类的依赖

2、对外部隐藏子系统的具体实现

3、增强了安全性

### 3.11、桥接模式

桥接模式主要用于抽象与实现之间的桥接，实现二者的解耦

例子：画圆形和长方形，并给他们涂上不同的颜色

```java
//1、创建画颜色的接口：桥接接口
interface DrawAPI{
    void drawColor();
}

//2、创建实现类
class RedDraw implements DrawAPI{
    @Override
    public void drawColor(){
        System.out.println("red color");
    }
}

class GreenDraw implements DrawAPI{
    @Override
    public void drawColor(){
        System.out.print("green color");
    }
}

//3、定义一个抽象类 Shape（形状）：持有 DrawAPI 的 引用
abstract class Shape{
    protected DrawAPI drawAPI;

    public Shape(DrawAPI drawAPI){
        this.drawAPI = drawAPI;
    }

    public abstract void draw();
}

//4、实现类，画具体的形状，并添加颜色
class Circle extends Shape{

    public Circle(DrawAPI drawAPI) {
        super(drawAPI);
    }

    @Override
    public void draw() {
        System.out.print("draw Circle with ");
        drawAPI.drawColor();
    }
}


class Rectangle extends Shape{

    public Rectangle(DrawAPI drawAPI) {
        super(drawAPI);
    }

    @Override
    public void draw() {
        System.out.print("draw Rectangle with ");
        drawAPI.drawColor();
    }
}

//测试
public class BridgeClient {

    public static void main(String[] args) {
        Shape redCircle = new Circle(new RedDraw());
        Shape greenRectangle = new Rectangle(new GreenDraw());

        redCircle.draw();
        greenRectangle.draw();
    }
}

//打印结果
draw Circle with red color
draw Rectangle with green color
```

桥接模式优点：

1、把事物和其具体实现分开，使得他们各自可以独立的变化

2、桥接接口作为你一个维度，抽象类作为一个维度，两则可以随意组合

### 3.12、组合模式

组合模式的特点就是把一组相似的对象，当作一个单一的对象

```java
//1、定义一个抽象类
abstract class Component{
    public abstract void operation();

    public void add(Component component){

    }

    public void remove(Component component){

    }
}

//2、定义一组相似的实现类
class ComponentImpl1 extends Component{

    @Override
    public void operation() {
        System.out.println("ComponentImpl1 operation");
    }
}

class ComponentImpl2 extends Component{

    @Override
    public void operation() {
        System.out.println("ComponentImpl2 operation");
    }
}

//3、定义一个组合类
class Combine extends Component{

    private final List<Component> list = new ArrayList<>();

    @Override
    public void operation() {
        for (Component component : list) {
            component.operation();
        }
    }

    @Override
    public void add(Component component) {
        list.add(component);
    }

    @Override
    public void remove(Component component) {
        list.remove(component);
    }
}

//4、测试
public class CombineClient {

    public static void main(String[] args) {
        Component c1 = new ComponentImpl1();
        Component c2 = new ComponentImpl2();
        Component combine = new Combine();
        combine.add(c1);
        combine.add(c2);
        combine.operation();
        combine.remove(c2);
        combine.operation();
    }
}

//打印结果
ComponentImpl1 operation
ComponentImpl2 operation
ComponentImpl1 operation
```

### 3.13、观察者模式

观察者模式主要用于当一个对象改变，其他对象能收到这种变化

```java
//1、定义一个观察者的接口
interface Observer {
    fun onChange(o: Any?)
}


//2、定义一个被观察者的接口
interface Observable {
    fun addObserver(observer: Observer?)
    fun removeObserver(observer: Observer?)
    fun changeEvent(o: Any?)
}

//3、定义一个被观察者的实现类
class ObservableImpl : Observable {

    private val observers: MutableList<Observer>

    init {
        observers = LinkedList()
    }

    override fun addObserver(observer: Observer?) {
        if (observer == null) return
        if (observers.contains(observer)) return
        observers.add(observer)
    }

    override fun removeObserver(observer: Observer?) {
        if (observer == null) return
        if (observers.contains(observer)) {
            observers.remove(observer)
        }
    }

    override fun changeEvent(o: Any?) {
        for (observer in observers) {
            observer.onChange(o)
        }
    }
}

//4、定义一个观察者的实现类
class ObserverImpl : Observer {

    override fun onChange(o: Any?) {
        println("${javaClass.simpleName}: $o")
    }
}

//5、测试
fun main() {
    val observable: Observable = ObservableImpl()
    val observer1: Observer = ObserverImpl()
    val observer2: Observer = ObserverImpl()
    val observer3: Observer = ObserverImpl()
    observable.addObserver(observer1)
    observable.addObserver(observer2)
    observable.addObserver(observer3)
    observable.changeEvent("erdai666")
}

//6、打印结果
ObserverImpl: erdai666
ObserverImpl: erdai666
ObserverImpl: erdai666
```

### 3.14、模版方法模式

模版方法模式定义了一套算法框架，将一些步骤交由具体的字类去实现

模版方法模式主要有以下角色：

> 1、抽象类：定义了一套算法框架
>
> 2、具体实现类

```java
//1、抽象类：定义了一套算法框架
abstract class Game{
    abstract void init();
    abstract void startPlay();
    abstract void endPlay();

    //模版方法
    public final void play(){
        //初始化游戏
        init();
        //开始游戏
        startPlay();
        //结束游戏
        endPlay();
    }
}

//2、定义实现类
class LOL extends Game{

    @Override
    void init() {
        System.out.println("LOL initialized！start play...");
    }

    @Override
    void startPlay() {
        System.out.println("LOL started，enjoy it...");
    }

    @Override
    void endPlay() {
        System.out.println("LOL finished...");
    }
}

//3、测试
public class TemplateClient {
    public static void main(String[] args) {
        Game game = new LOL();
        game.play();
    }
}

//打印结果
LOL initialized！start play...
LOL started，enjoy it...
LOL finished...
```

### 3.15、责任链模式

```java
//1、定义一个责任链的抽象类
abstract class AbstractLogger{
    public static int INFO = 1;
    public static int DEBUG = 2;
    public static int ERROR = 3;
    protected int level;

    //责任链的下一个元素
    protected AbstractLogger nextLogger;

    public void setNextLogger(AbstractLogger nextLogger){
        this.nextLogger = nextLogger;
    }

    public void logMessage(int level,String message){
        if(this.level <= level){
            write(message);
        }

        if(nextLogger != null){
            nextLogger.logMessage(level,message);
        }
    }

    abstract protected void write(String message);
}

//2、创建实现类
class ConsoleLogger extends AbstractLogger{

    public ConsoleLogger(int level){
        this.level = level;
    }

    @Override
    protected void write(String message) {
        System.out.println("Standard Console::Logger：" + message);
    }
}

class ErrorLogger extends AbstractLogger{

    public ErrorLogger(int level){
        this.level = level;
    }

    @Override
    protected void write(String message) {
        System.out.println("Error::Logger：" + message);
    }
}


class FileLogger extends AbstractLogger{

    public FileLogger(int level){
        this.level = level;
    }

    @Override
    protected void write(String message) {
        System.out.println("File::Logger：" + message);
    }
}

//测试
public class ChainClient {

    private static AbstractLogger getChain(){
        AbstractLogger errorLogger = new ErrorLogger(AbstractLogger.ERROR);
        AbstractLogger fileLogger = new FileLogger(AbstractLogger.DEBUG);
        AbstractLogger consoleLogger = new ConsoleLogger(AbstractLogger.INFO);

        errorLogger.setNextLogger(fileLogger);
        fileLogger.setNextLogger(consoleLogger);
        return errorLogger;
    }

    public static void main(String[] args) {
        AbstractLogger chain = getChain();

        chain.logMessage(AbstractLogger.INFO,"This is an information.");
        chain.logMessage(AbstractLogger.DEBUG,"This is a debug level information.");
        chain.logMessage(AbstractLogger.ERROR,"This is an error information.");
    }
}

//打印结果
Standard Console::Logger：This is an information.
File::Logger：This is a debug level information.
Standard Console::Logger：This is a debug level information.
Error::Logger：This is an error information.
File::Logger：This is an error information.
Standard Console::Logger：This is an error information.
```

### 3.16、解释器模式

解释器模式就是定义一个解释器的规则去解释对象

```java
//1、创建一个解释器的接口
interface Expression{
    boolean interpret(String context);
}

//2、创建实现类
class TerminalExpression implements Expression{
    private final String data;

    public TerminalExpression(String data) {
        this.data = data;
    }

    @Override
    public boolean interpret(String context) {
        return context.contains(data);
    }
}

class OrExpression implements Expression{

    private Expression expression1;
    private Expression expression2;

    public OrExpression(Expression expression1, Expression expression2) {
        this.expression1 = expression1;
        this.expression2 = expression2;
    }

    @Override
    public boolean interpret(String context) {
        return expression1.interpret(context) || expression2.interpret(context);
    }
}

class AndExpression implements Expression{

    private Expression expression1;
    private Expression expression2;

    public AndExpression(Expression expression1, Expression expression2) {
        this.expression1 = expression1;
        this.expression2 = expression2;
    }

    @Override
    public boolean interpret(String context) {
        return expression1.interpret(context) && expression2.interpret(context);
    }
}

//3、规则，测试
public class InterpretClient {

    //规则：小明和二代都是男的
    public static Expression getMaleExpression(){
        Expression xiaoming = new TerminalExpression("小明");
        Expression erdai = new TerminalExpression("二代");
        return new OrExpression(xiaoming, erdai);
    }

    //规则：小红是已婚的
    public static Expression getMarriedWomenExpression(){
        Expression xiaohong = new TerminalExpression("小红");
        Expression married = new TerminalExpression("已婚");
        return new AndExpression(xiaohong, married);
    }

    public static void main(String[] args) {
        Expression isMale = getMaleExpression();
        Expression isMarriedWomen = getMarriedWomenExpression();

        System.out.println("二代是男的？：" + isMale.interpret("二代"));
        System.out.println("小红是否已经结婚了？：" + isMarriedWomen.interpret("小红已婚"));
    }
}

//打印结果
二代是男的？：true
小红是否已经结婚了？：true
```

### 3.17、中介者模式

中介者模式主要是通过提供一个中介类来降低多个对象之间的通信复杂度

```java
//1、创建一个统一行为的接口
interface Mediator{
    void showMessage(String message);
}

//2、创建实现类
class User implements Mediator{
    @Override
    public void showMessage(String message){
        System.out.println("User：" + message);
    }
}

//3、创建中介类
class ChatRoom implements Mediator{

    @Override
    public void showMessage(String message) {
        (new User()).showMessage(message);
    }
}

//4、测试
public class MediatorClient {
    public static void main(String[] args) {
        Mediator room = new ChatRoom();
        room.showMessage("Hi，erdai");
    }
}

//打印结果
User：Hi，erdai
```

### 3.18、迭代器模式

迭代器模式主要用于顺序访问集合对象的元素，而不需要知道其底层表示

```java
//1、创建接口
interface Iterator{
    boolean hasNext();
    Object next();
}

interface Container{
    Iterator getIterator();
}

//2、创建实现类
class NameRepository implements Container{
    String[] names = {"小明","小红","二代"};

    @Override
    public Iterator getIterator() {
        return new NameIterator();
    }


    private class NameIterator implements Iterator{

        int index;

        @Override
        public boolean hasNext() {
            return index < names.length;
        }

        @Override
        public Object next() {
            if(hasNext()){
                return names[index++];
            }
            return null;
        }
    }
}

//3、测试
public class IteratorClient {

    public static void main(String[] args) {
        NameRepository nameRepository = new NameRepository();
        final Iterator iterator = nameRepository.getIterator();
        while (iterator.hasNext()){
            String name = (String) iterator.next();
            System.out.println(name);
        }
    }
}

//打印结果
小明
小红
二代
```

### 3.19、享元模式

享元模式主要用于减少创建对象的数量，减少内存占用，提高性能

```java
//1、创建一个学生类
class Student {
    private String name;
    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}

//2、享元工厂类
class StudentFactory {
    private static final Map<Object,Object> stuMap = new HashMap<>();

    public static Student getStudent(String key){
        if(stuMap.containsKey(key)){
            return (Student) stuMap.get(key);
        }else{
            Student stu = new Student();
            stuMap.put(key, stu);
            return stu;
        }
    }
}

//3、测试
public class EnjoyClient {

    private static final String[] keys = new String[]{"二代","小明","小红","张三","李四","二代","小红"};

    public static void main(String[] args) {
        for (String key : keys) {
            final Student student = StudentFactory.getStudent(key);
            student.setName(key);
            System.out.println(student.getName() + " HashCode："+ student.hashCode());
        }
    }
}

//打印结果
二代 HashCode：93122545
小明 HashCode：2083562754
小红 HashCode：1239731077
张三 HashCode：557041912
李四 HashCode：1134712904
二代 HashCode：93122545
小红 HashCode：1239731077
```

### 3.20、访问者模式

访问者模式主要就是通过访问者类去访问对象元素并进行相关操作

```java
//1、创建待访问的元素对象接口
interface Subject{
    void accept(Visitor visitor);
    String getSubject();
}
//2、创建访问者接口
interface Visitor{
    void visit(Subject sub);
}

//3、创建各自的实现类
class MySubject implements Subject{

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    @Override
    public String getSubject() {
        return "love";
    }
}

class MyVisitor implements Visitor{

    @Override
    public void visit(Subject sub) {
        System.out.println("visit the subject：" + sub.getSubject());
    }
}

//4、测试
public class VisitorClient {
    public static void main(String[] args) {
        Subject subject = new MySubject();
        Visitor visitor = new MyVisitor();
        subject.accept(visitor);
    }
}

//打印结果
visit the subject：love
```

### 3.21、命令模式

命令模式用于给不同的对象下达不同的命令

```java
//1、创建一个命令接口
interface Order{
    void execute();
}

//2、创建一个请求类
class Stock{
    private String name = "ABC";
    private int quantity = 10;

    public void buy(){
        System.out.println("buy，name：" + name + " quantity：" + quantity);
    }

    public void sell(){
        System.out.println("sell，name：" + name + " quantity：" + quantity);
    }
}

//3、常见命令的实现类，实现不同的命令
class BuyStock implements Order{

    private final Stock stock;

    public BuyStock(Stock stock) {
        this.stock = stock;
    }

    @Override
    public void execute() {
        stock.buy();
    }
}

class SellStock implements Order{

    private final Stock stock;

    public SellStock(Stock stock) {
        this.stock = stock;
    }

    @Override
    public void execute() {
        stock.sell();
    }
}

//4、创建命令的调用类
class Broker{

    private List<Order> orderList = new ArrayList<>();

    public void takeOrder(Order order){
        orderList.add(order);
    }

    public void placeOrders(){
        for (Order order : orderList) {
            order.execute();
        }
    }
}

//5、测试
public class OrderClient {
    public static void main(String[] args) {
        Stock stock = new Stock();

        BuyStock buyStock = new BuyStock(stock);
        SellStock sellStock = new SellStock(stock);

        Broker broker = new Broker();
        broker.takeOrder(buyStock);
        broker.takeOrder(sellStock);

        broker.placeOrders();
    }
}

//打印结果
buy，name：ABC quantity：10
sell，name：ABC quantity：10
```

### 3.22、备忘录模式

备忘录模式主要用于保存对象的某个状态，以便在适当的时候恢复对象

```java
//1、创建一个备忘录类
class Memento{
    public String value;

    public Memento(String value) {
        this.value = value;
    }
}
//2、创建一个原始类
class Original{
    public String value;

    public Original(String value) {
        this.value = value;
    }

    public Memento createMemento(){
        return new Memento(value);
    }

    public void restoreMemento(Memento memento){
        this.value = memento.value;
    }
}

//3、创建一个存储备忘录的类
class Storage{
    public Memento memento;

    public Storage(Memento memento) {
        this.memento = memento;
    }
}

//4、测试
public class MementoClient {

    public static void main(String[] args) {
        //创建原始类
        Original original = new Original("erdai666");
        //创建一个存储类存储备忘录
        Storage storage = new Storage(original.createMemento());

        //修改原始类的状态
        original.value = "erdai";

        //回复原初始类的状态
        original.restoreMemento(storage.memento);
        System.out.println(original.value);

    }
}

//打印结果
erdai666
```

## 四、总结

本篇文章我们介绍了：

1、Java 六大设计原则，并都进行了举例说明：

> 1、开闭原则
>
> 2、里氏替换原则
>
> 3、依赖倒置原则
>
> 4、迪米特法则
>
> 5、接口隔离原则
>
> 6、单一指责原则

其中，开闭原则是最基础的原则，其他原则都是开闭原则的具体形态

2、24 种设计模式，并进行了举例说明

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281520937.jpeg" alt="yuque_mind.jpeg" style="zoom:50%;" />

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](http://m6z.cn/6jwi7b) ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
