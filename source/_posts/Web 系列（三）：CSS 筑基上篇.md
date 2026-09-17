---
title: Web 系列（三）：CSS 筑基上篇
date: 2022-10-26 10:15:13
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630921.jpeg
tags:
- 原创
- Web
categories:
- Web
- Web 快速入门
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281630921.jpeg)

## 前言

很高兴遇见你~

在本系列的上一篇文章中，我们介绍了 Web 必备的开发工具：VS Code + Chrome 浏览器，介绍了很多非常好用的插件和快捷键，还没有看过上一篇文章的朋友建议先去阅读[Web 系列（二）：Web 开发工具介绍](https://juejin.cn/post/7158479477717073934) 。

接下来我们介绍 Web 基础三件套中的 CSS

## 一、CSS 基础语法

CSS 全称 Cascading Style Sheets ，中文翻译：层叠样式表，我们可以使用它来装饰 HTML 页面。举个简单的例子：HTML 就好比你的身体，但是还没穿衣服😂，CSS 就是给你搭配一套豪华炫酷叼炸天的衣服，让你变得很漂亮。

### 1.1、CSS 语法规则

CSS 主要由三部分构成：

> 1、选择器
>
> 2、一对大括号：`{}`
>
> 3、一条或多条声明

示例：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631144.png" alt="image-20221026154840868.png" width="100%" />

1、选择器通常是你要改变样式的 HTML 标签

2、每条声明由`属性，冒号，属性值，分号` 4 部分组成

3、为了增强 CSS 可读性，建议每行只描述一个声明，行内样式表除外

另外需要**注意**：

在 CSS 内的注释以`/*`开始，以`*/`结束，如下示例：

```css
/* 注释 */
h1{
    /* 字体颜色：粉色 字体大小：40px */
    color: pink;
    font-size: 40px;
 }
```

## 二、CSS 引入方式

CSS 引入方式主要有三种：

> 1、内部样式表
>
> 2、外部样式表
>
> 3、行内样式表

### 2.1、内部样式表

内部样式表就是在一个 html 文件内部使用 CSS

#### 2.1.1、内部样式表使用

1、在 head 标签内部定义 style 标签，然后在 style 标签内部定义 CSS 即可，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <!-- 定义内部样式表 -->
    <style>
        /* 给 h1 定义 CSS 样式 */
        h1{
            /* 字体颜色：粉色 字体大小：40px */
            color: pink;
            font-size: 40px;
        }
    </style>
</head>
<body>
    <h1>erdai666</h1>
</body>
</html>
```

运行效果：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631060.png" alt="image-20221026172633783.png" width="100%" />

### 2.2、外部样式表

外部样式表就是在 html 文件外部定义一个`.css`后缀的文件，然后通过 link 标签链接该 css 文件

#### 2.2.1、外部样式表使用

1、在外部定义一个`.css`的文件


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631675.png" alt="image-20221026161548418.png" width="100%" />

2、在 head 标签内部定义 link 标签，然后通过 link 标签链接该 css 文件即可，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <!-- 方式一：使用 link 标签引用外部样式表 -->
    <link rel="stylesheet" href="css/index.css">
    <!-- 方式二：通过 import 引用
        import 是 css 提供的方式，出来的晚，兼容性差，它的渲染时机是在 html 加载后在被渲染
    -->
    <!-- <style>
        @import url("css/index.css");
    </style> -->
</head>
<body>
    <h1>erdai666</h1>
</body>
</html>
```

**注意**：上面讲了两种引用外部样式表的方式，建议使用方式一

### 2.3、行内样式表

行内样式表就是在标签内部使用 CSS

#### 2.3.1、行内样式表使用

直接在标签内部的 style 属性中定义 CSS 样式即可，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- 在标签内部使用 CSS -->
    <h1 style="color: pink; font-size: 40px;">erdai666</h1>
</body>
</html>
```

**Tips**：

1、当我们只需要在单个 html 文件里面使用 CSS 时，使用内部样式表

2、当多个 html 文件具有相同的 CSS 样式时，为了统一和维护，我们应该使用外部样式表

3、当我们只需要在一个标签上使用  CSS 样式时，使用行内样式表

因此大家需要根据自己的判断，选择合适的样式表

接下来抛出一个问题：如果我在一个 html 文件里面同时引用了上面三种，会是一种什么效果呢？

这里就涉及到了样式表的优先级，接着往下看

### 2.4、样式表优先级

我们通过结论的方式来论证，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  	<!-- 外部样式表，还是之前那个文件：粉色 字体 40px -->
    <link rel="stylesheet" href="css/index.css">
  	<!-- 内部样式表 -->
    <style>
      	/* 蓝色，字体 40px */
        h1{
            color: blue;
            font-size: 40px;
        }
    </style>
</head>
<body>
    <!-- 行内样式表：绿色，字体 40px-->
    <h1 style="color: green; font-size: 40px;">erdai666</h1>
</body>
</html>
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631764.png" alt="image-20221026172610437.png" width="100%" />

😯，展示了**绿色**，说明行内样式表的优先级最高

接下来我们把行内样式表给去掉，重新运行，你会发现展示了**蓝色**，说明行内样式表的优先级次高，最后才是外部样式表，因此我们可以得到一个优先级的结论：**行内样式表 > 内部样式表 > 外部样式表**

### 2.5、`!important` 规则

但是有一个例外😄：使用了 `!important`属性的优先级最高，享受 Vip 待遇，如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  	<!-- 外部样式表，还是之前那个文件：粉色 字体 40px -->
    <link rel="stylesheet" href="css/index.css">
  	<!-- 内部样式表 -->
    <style>
      	/* 蓝色，字体 40px */
        h1{
            color: blue !important;
            font-size: 40px;
        }
    </style>
</head>
<body>
    <!-- 行内样式表：绿色，字体 40px-->
    <h1 style="color: green; font-size: 40px;">erdai666</h1>
</body>
</html>
```

我们在内部样式表的 color 属性中加了一个`!import`修饰，此时就会优先使用内部样式表的 color 属性

**需要重点说明的是**：

1、使用`!important`是一个坏习惯，应该尽量避免，因为这破坏了样式表中的固有的级联规则 使得调试找 bug 变得更加困难了

2、当两条相互冲突的带有`!important`规则的声明被应用到相同的元素上时，拥有更大优先级的声明将会被采用

**使用建议**：

1、**一定**要优先考虑使用样式规则的优先级来解决问题而不是 `!important`

2、**只有**在需要覆盖全站或外部 CSS 的特定页面中使用 `!important`

3、**永远不要**在你的插件中使用 `!important`

4、**永远不要**在全站范围的 CSS 代码中使用 `!important`

## 三、CSS 选择器

CSS 选择器规定了 CSS 样式会被应用到哪些标签上

### 3.1、CSS 七大基础选择器

#### 3.1.1、id 选择器

id 选择器可以给标有特定 id 属性的 html 标签指定 CSS 样式

##### id 选择器使用

首先给 html 标签设置一个 id 的属性，然后在 CSS 中通过 `#id属性的值`来进行引用，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 2、在 CSS 中通过 #id属性的值 来指定要渲染的 html 标签 */
        #params{
            color: orange;
            font-size: 50px;
        }
    </style>
</head>
<body>
  <!-- 1、给 p 标签定义一个 id 属性，值为：params -->
  <p id="params">erdai666</p>
</body>
</html>
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631309.png" alt="image-20221026222037414.png" width="100%" />

#### 3.1.2、类选择器

类选择器可以给标有特定 class 属性的 html 标签指定 CSS 样式

##### 类选择器使用

首先给 html 标签设置一个 class 属性，然后在 CSS 中通过 `.class属性的值`来进行引用，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 2、在 CSS 中通过 .class属性的值 来指定要渲染的 html 标签 */
        .params{
            color: red;
            font-size: 50px;
        }
    </style>
</head>
<body>
  <!-- 1、给 p 标签定义 class 属性，值为：params -->
  <p class="params">erdai666</p>
</body>
</html>
```

效果展示：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631319.png" alt="image-20221026222930379.png" width="100%" />

#### 3.1.3、属性选择器

属性选择器可以给设置了该属性的标签指定 CSS 样式

##### 属性选择器使用

首先我们给标签设置一些属性，然后在 CSS 中通过 `标签名[属性名]`来进行引用，如果不写标签名，则表示对所有设置了该属性的标签指定 CSS 样式，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 2、在 CSS 中通过 [属性名] 来指定要渲染的 html 标签 */
        [title]{
            color: green;
            font-size: 50px;
        }
    </style>
</head>
<body>
  <!-- 1、给标签设置了相同的属性名：title -->
  <h1 title="erdai666">erdai666</h1>
  <a href="https://www.baidu.com/" title="百度">打开百度</a>
</body>
</html>
```

**注意**：上述如果我们这么写：`h1[title]` 或者这么写：`[title=erdai666]`，那么上面就只有 h1 标签会生效

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631137.png" alt="image-20221026223737596.png" width="100%" />

#### 3.1.4、伪类选择器

伪类选择器可以给触发了某种行为状态的标签指定 CSS 样式

##### 伪类选择器使用

这里以 a 标签为例子，它有以下几种状态：

> 1、link ：超链接的初始状态
>
> 2、visited ：超链接被访问的状态
>
> 3、hover ：鼠标悬停，即鼠标划过超链接时的状态
>
> 4、active ： 鼠标按下时超链接的状态

在 CSS 中通过 `标签名：属性状态`来进行引用，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <!-- 2、顺序必须为:  link--visited--hover--active -->
    <style>
        a:Link{
            color: yellow;
        }
        a:visited{
            color: red;
        }
        a:hover{
            color: orange;
        }
        a:active{
            color: green;
        }
    </style>
</head>
<body>
    <!-- 1、伪类选择器 主要针对超链接 a 标签-->
    <a href="https://www.baidu.com/">百度</a>
</body>
</html>
```

运行后，通过你对该链接的操作，它会展示出不同的颜色

#### 3.1.5、伪元素选择器

伪元素选择器可以通过附加指定的关键词来给标签指定 CSS 样式

##### 伪元素选择器使用

如下特定语法：

1、`标签::first-line` ：为某一个标签的第一行使用样式

2、`标签::first-letter` ：为某一个标签的首字母使用样式

3、`标签::before` ：在某个标签之前插入一些内容

4、`标签::after` ：在某个标签之后插入一些内容

定义好标签，在 CSS 中通过上述这种方式引用即可，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        h1::first-line{
            color: red;
        }
        h2::first-letter{
            color: green;
        }
        h3::before{
            content: "erdai666: ";
        }
        h4::after{
            content: " :erdai777";
        }
    </style>
</head>
<body>
  <h1>你可以使用 first-line 给这一行设置成红色</h1>
  <h2>你可以使用 first-letter 给这一行首字母设置成绿色</h2>
  <h3>你可以使用 before 给这一行前面插入一段话</h3>
  <h4>你可以使用 after 给这一行后面插入一段话</h4>
</body>
</html>
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631484.png" alt="image-20221026231526910.png" width="100%" />

#### 3.1.6、标签选择器

标签选择器可以给指定的标签指定 CSS 样式

**标签选择器使用**

首先定义好标签，然后在 CSS 中通过`标签名`来进行引用，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        h1{
            color: orange;
        }
        h2{
            color: red;
        }
        h3{
            color: green;
        }
        h4{
            color: blue;
        }
    </style>
</head>
<body>
  <h1>一级标题</h1>
  <h2>二级标题</h2>
  <h3>三级标题</h3>
  <h4>四级标题</h4>
</body>
</html>
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281631177.png" alt="image-20221026232034677.png" width="100%" />

#### 3.1.7、通配符选择器

通配符选择器可以给所有的标签指定 CSS 样式

##### 通配符选择器使用

首先定义几个标签，然后通过`*`来进行引用，如下示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 清除所有标签的外边距，內边距 */
        *{
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
     <h1>标题</h1>
     <div>11111</div>
     <ul>
        <li>1111</li>
        <li>2222</li>
        <li>3333</li>
     </ul>
</body>
</html>
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632349.png" alt="image-20221026232357410.png" width="100%" />

### 3.2、组合选择器

组合选择器主要由七大基础选择器组合而成

#### 3.2.1、群组选择器

群组选择器可以对一组基础选择器指定 CSS 样式

##### 群组选择器使用

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 群组选择器 */
        div,.boxp,h1{
            background-color: yellow;
        }
    </style>
</head>
<body>
    <div>1111111111</div>
    <p class="boxp">9999999</p>
    <h1>3333333333</h1>
</body>
</html>
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632598.png" alt="image-20221026232918991.png" width="100%" />

#### 3.2.2、后代选择器

后代选择器可以对指定的后代标签指定 CSS 样式

##### 后代选择器使用

语法规则：`标签 标签`，标签之间通过空格来进行指定，后一个标签是前一个标签的后代元素

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 后代选择器 */
        div span p{
            background-color: pink;
        }
    </style>
</head>
<body>
    <div>
      <span>
        <h1>
   			111111111
        </h1>
        <p>2222222222</p>
      </span>
    </div>
</body>
</html>
```

**注意**：上述后代选择器我们也可以这么写：`div p`，效果是一样的，意思就是找到 div 后代中所有的 p 标签，而不论 p 标签嵌套的有多深

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632437.png" alt="image-20221026233126017.png" width="100%" />

#### 3.2.3、子元素选择器

子元素选择器可以对标签的子元素指定 CSS 样式

##### 子元素选择器使用

语法规则：`标签 > 标签`，标签之间通过 > 来进行指定，后一个标签是前一个标签的直接后代元素

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 子元素选择器 */
        div > strong {
            background-color: red;
        }
    </style>
</head>

<body>
    <div>
        <strong>66666</strong>
    </div>
	  <div>
        <em>7777</em>
    </div>
</body>
</html>
```

效果展示：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632914.png" alt="image-20221026234007491.png" width="100%" />

#### 3.2.4、相邻兄弟选择器

相邻兄弟选择器可以给当前标签相邻的标签指定 CSS 样式

##### 相邻兄弟选择器使用

语法规则：`标签 + 标签`，标签之间通过 + 来进行指定，后一个标签是前一个标签的相邻元素，且两者需要有相同的父标签，如下示例：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 相邻选择器 */
        li + li {
            background-color: pink;
        }
    </style>
</head>

<body>
    <ul>
        <li>11111</li>
        <li>11111</li>
        <li>11111</li>
        <li>11111</li>
        <li>11111</li>
    </ul>
</body>
</html>
```

效果展示：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632230.png" alt="image-20221026234505823.png" width="100%" />

### 3.3、选择器优先级

上面学习了这么多选择器，如果同时作用于一个标签，肯定会产生优先级的问题，那么选择器的优先级是怎么一回事呢？

这里我们需要引入一个**权重**的概念，也就是每个选择器都拥有一个权重，权重越大，优先级就越高

##### 3.3.1、权重计算规则

1、第一优先级：`!important`会覆盖页面内任何位置的元素样式

2、行内样式表，如`style="color: green"`，权值为`1000`

3、id 选择器，如`#params`，权值为`0100`

4、类、伪类、属性选择器，如`.foo, a:hover, h1[title]`，权值为`0010`

5、标签、伪元素选择器，如`div::first-line`，权值为`0001`

6、通配符、子类选择器、相邻兄弟选择器，如`*, >, +`，权值为`0000`

因此我们可以得到一个**优先级的结论**：

**!import > 行内样式表 > id 选择器 > 类选择器 = 伪类选择器 = 属性选择器 > 标签选择器 = 伪元素选择器 > 通配符选择器 = 子类选择器 = 相邻兄弟选择器**

另外需要**注意**的是：

1、权重相同的情况下，位于后面的样式会覆盖前面的样式

2、群组选择器权重：组内所有选择器权重之和

3、后代选择器：所有选择器权重之和

## 四、总结

本篇文章我们介绍了：

1、CSS 的基础语法

2、CSS 的三种引入方式：

> 1、内部样式表
>
> 2、外部样式表
>
> 3、行内样式表

3、CSS 的七大基础选择器，以及由七大基础选择器组合成的组合选择器

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 参考和推荐

[b站web入门教程](https://www.bilibili.com/video/BV17z4y1D7Yj/)：通俗易懂，极力推荐

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](https://link.juejin.cn/?target=http%3A%2F%2Fm6z.cn%2F6jwi7b "http://m6z.cn/6jwi7b") ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
