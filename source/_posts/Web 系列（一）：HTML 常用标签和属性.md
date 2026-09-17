---
title: Web 系列（一）：HTML 常用标签和属性
date: 2022-10-17 17:24:00
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632885.jpeg
tags: 
- 原创
- Web
categories:
- Web
- Web 快速入门
---
![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632885.jpeg)

## 前言

很高兴遇见你~

最近基于 Github 折腾出了一个自己的[博客网站](https://sweetying520.github.io/)，发现里面使用到的技术都是 Web 相关的，自己想修改一些效果也需要用到这些，这勾起了我学习 Web 的一个兴趣。

另外当前大环境下，只是掌握移动端开发是不够的，我们应该向大前端这个方向去发展，去学习 Flutter ，Web 开发，提升自己的核心竞争力。

学习 Web 我们就要掌握基础三件套：HTML，CSS，JavaScript。

本篇文章我们主要介绍 HTML 相关的重点内容
## 一、HTML 基础语法
### 1.1、HTML 标签
我们写的 HTML 静态网页就是由 HTML 标签定义的

HTML 标签主要分为两种:

1、双标签

2、单标签

#### 1.1.1、双标签

双标签也称常规标签或双标记，语法格式如下：
> <开始标签>内容</结束标签>

示例：
```html
<p>我是一个段落</p>
```

#### 1.1.2、单标签

单标签也称空标记或单标记，语法格式如下：
> <开始标签>或<开始标签/>

示例：
```html
<br> //等价 <br/>
```

**tips**：对于单标签，建议大家使用 `<br/>` 这种带 / 的，这样可以保证我们一个书写的规范

### 1.2、HTML 标签语法

* HTML 标签以开始标签起始
* HTML 标签以结束标签终止
* 标签的内容是开始标签与结束标签之间的内容
* 单标签没有内容
* 单标签在开始标签中进行关闭（以开始标签的结束而结束）
* 大多数 HTML 标签可拥有属性

### 1.3、HTML 嵌套
大多数 HTML 标签可以嵌套，HTML 静态网页就是由相互嵌套的 HTML 标签构成

示例：
```html
<!DOCTYPE html>
<html>
    <head>
       <title>我是一个标题</title>
    </head>
    <body>
        <p>我是一个段落</p>
    </body>
</html>

```

### 1.4、实例解析

还是上面 1.3 这个例子：

1、`<!DOCTYPE html>` 主要用于告诉浏览器使用 HTML5 来进行标签的解析

2、html 是一个网页的根标签，它主要包含固定的两部分：
```html
<html>
    <!-- 头部 -->
    <head>
    </head>
    <!-- 主体部分 -->
    <body>
    </body>
</html>
```
3、我们可以在 head 或 body 部分进行标签嵌套实现我们想要的效果

**tips**：

1、虽然说 HTML 标签对大小写不敏感，例如：`<P>等同于<p>`，但还是建议大家统一使用小写标签，因为 W3C 在 HTML 4 中就推荐我们使用小写，而在未来 XHTML 版本中会强制我们使用小写

2、如下写法：

```html
<p>我是一个段落
```

上述代码我们没有写结束标签，但在浏览器中也能正常显示，因为结束标签是可选的，但是最好不要依赖这种写法，因为忘记使用结束标签会产生不可预料的结果或错误

## 二、标题 h1~h6

1、h1～h6 标签主要用来定义 HTML 标题，独占一行，数字越小等级越高

2、属性：

| 属性  | 值                                                           | 说明                     |
| ----- | ------------------------------------------------------------ | ------------------------ |
| align | left ：左边对齐<br>right ：右边对齐<br>center ：中间对齐<br>justify ：两端对齐 | 规定标题在 HTML 中的排列 |

如下代码：

```html
<!-- 使用 html5 进行标签的解析 -->
<!DOCTYPE html>
<!-- 语言英语 -->
<html lang="en">
<head>
    <!-- 告诉浏览器使用 UTF-8 来进行解码 -->
    <meta charset="UTF-8">
    <!-- 显示在网页的标题 -->
    <title>我是标题</title>
</head>
<body>
    <!-- 内容部分：1～6级标题 -->
    <h1>一级标题</h1>
    <h2>二级标题</h2>
    <h3>三级标题</h3>
    <h4>四级标题</h4>
    <h5>五级标题</h5>
    <h6>六级标题</h6>
</body>
</html>
```

效果展示：

![image-20221017193252786.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632953.png)

## 三、段落 p

1、p 标签主要用于标记一个段落，独占一行

2、属性同标题标签

如下代码：

```html
<!-- 使用 html5 进行标签的解析 -->
<!DOCTYPE html>
<!-- 语言英语 -->
<html lang="en">
<head>
    <!-- 告诉浏览器使用 UTF-8 来进行解码 -->
    <meta charset="UTF-8">
    <!-- 显示在网页的标题 -->
    <title>我是段落</title>
</head>
<body>
    <!-- 内容部分：p段落 -->
    <p align="center">段落1</p>
    <p>段落2</p>
    <p>段落3</p>
</body>
</html>
```

效果展示：

![image-20221017194115729.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281632843.png)

## 四、HTML 文本格式化标签

### 4.1、加粗标签 b or strong 

我们可以使用 b 或 strong 标签对一段文本进行加粗

示例：

```html
<b>文本加粗</b>
<strong>文本加粗</strong>
```

**tips**：建议使用 strong 标签，起到一个强调作用

### 4.2、斜体标签 i or em 

我们可以使用 i 或 em 标签对一段文本进行加粗

示例：

```html
<i>文本倾斜</i>
<em>文本倾斜</em>
```

**tips**：建议使用 em 标签，起到一个强调作用

### 4.3、删除线标签 s or del 

我们可以使用 del 标签对一段文本标记为删除

示例：

```html
<s>文本删除线效果</s>
<del>文本删除线效果</del>
```

**tips**：建议使用 del 标签，起到一个强调作用

### 4.4、下划线标签 u 

我们可以使用 u 标签对一段文本添加下划线

示例：

```html
<u>文本删除线效果</u>
```

### 4.5、上下标标签 sup，sub 

我们可以使用 sup，sub 标签对一段文本标记上下标

示例：

```html
<sup>[1]</sup>
<sub>[2]</sub>
```

### 4.6、水平线标签 hr 

1、我们可以使用 hr 标签显示一条水平线，它是一个单标签

```html
<hr> //等价 <hr/>
```

2、属性：

| 属性    | 值                                                           | 说明                       |
| ------- | ------------------------------------------------------------ | -------------------------- |
| align   | left ：左边对齐<br>right ：右边对齐<br>center ：中间对齐<br> | 规定水平线在 HTML 中的排列 |
| noshade | noshade                                                      | 规定水平线呈现为纯色       |
| size    | pixels：像素值                                               | 规定水平线的高度           |
| width   | pixels: 像素值<br>%：百分比宽度                              | 规定水平线的宽度           |



### 4.7、综合案例

我们使用上述学习到的格式化标签做一个综合案例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>推广反诈 app</title>
</head>
<body>
    <h1>秦始皇穿越推广反诈 app</h1>
    <!-- 水平线 -->
    <hr/>
    <p>
        <!-- 上下标，换行 -->
        近日，陕西西安，一段秦始皇<sup>[1]</sup>在兵马俑<sub>[2]</sub>广场宣传反诈 app 的视频走红<br/>
        <!-- 加粗-->
        <strong>由演员扮演的秦始皇随机问路人是否下载反诈 app，未下载会被士兵拖走</strong>
        <br/>
        <!-- 加粗倾斜 -->
        <strong><em>相关负责人称，希望利用秦始皇这个 IP，以地域文化和诙谐幽默的方式，传递正能量</em></strong>
        <!-- 删除线，下划线 -->
        <p>门票不要<del>998</del>，不要98，<u>只要 9.8</u></p>

    </p>
</body>
</html>
```

![image-20221017201219915.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633592.png)

## 五、HTML 中的特殊符号

| 特殊符号 | value                                                        |
| -------- | ------------------------------------------------------------ |
| 尖角号   | `&lt;` ：左尖角号<br>`&gt;` ：右尖角号                       |
| 空格     | `&emsp;` ：占据的宽度正好是一个中文的宽度，且基本不受字体的影响 |
| 版权     | `&copy;`                                                     |
| 商标     | `&trade;`<br>`&reg;`                                         |

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>特殊符号</title>
</head>
<body>
    <!-- 尖角号 -->
    <p>
       hr 标签的用法是这样的 &lt;hr noshade/&gt;
    </p>
    <p>
        <hr noshade/>
    </p>
    <!-- 空格 -->
    <p>&emsp;&emsp;赵钱孙李，周吴郑王</p>
    <!-- 版权 -->
    <p>&copy;</p>
    <!-- 受保护的商标 -->
    <p>&reg;</p>
    <!-- 未受保护的商标 -->
    <p>&trade;</p>
    <!-- emoji -->
    <p>&#128512;</p>
    <p>&#128513;</p>
    <p>&#128514;</p>
</body>
</html>
```

效果图：

![image-20221017202748615.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633988.png)

## 六、分区 div 和 span

1、div 标签主要用来划分页面的区域，独占一行

2、span 标签主要用于在文本独立修饰的时候，内容有多宽就占用多宽的空间距离

3、div 属性：

| 属性  | 值                                                           | 说明                                |
| ----- | ------------------------------------------------------------ | ----------------------------------- |
| align | left ：左边对齐<br>right ：右边对齐<br>center ：中间对齐<br>justify ：两端对齐 | 规定 div 划分的区域在 HTML 中的排列 |

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <h2>div标签，用来划分页面的区域，独占一行</h2>
    <!-- div -->
    <div align="center">111111</div>
    <div>22222</div>

    <h2>span标签，主要应用在文本独立修饰的时候，内容有多宽就占用多宽的空间距离</h2>
    <!-- span 里面使用到了 css 行内样式表 -->
    <h3><span>体育</span><span style="color: red;">sports</span></h3>

</body>
</html>
```

效果展示：

![image-20221018111504355.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633029.png)

## 七、列表 ol、ul、dl

### 7.1、ol + li 构成有序列表

1、将 li 作为 ol 的孩子标签就可以构成一个有序列表，如下：

```html
<ol>
  <li>把冰箱打开</li>
  <li>大象放进去</li>
  <li>冰箱关上门</li>
</ol>
```

2、ol 常用属性：

| 属性     | 值                                                           | 说明                 |
| -------- | ------------------------------------------------------------ | -------------------- |
| reversed | reversed                                                     | 指定列表倒序         |
| start    | number 类型                                                  | 指定列表编号的起始值 |
| type     | a ：小写英文字母编号<br/>A ：大写英文字母编号<br/>i ：小写罗马数字编号<br/>I ：大写罗马数字编号<br/>1 ：阿拉伯数字编号（默认） | 规定列表的类型       |

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>有序列表</title>
</head>
<body>
    <!-- 大写英文字母编号，从 C 开始 -->
    <ol type="A" start="3">
        <li>把冰箱打开</li>
        <li>大象放进去</li>
        <li>冰箱关上门</li>
    </ol>
</body>
</html>
```

效果展示：

![image-20221018112817936.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633997.png)

### 7.2、ul + li 构成无序列表

1、将 li 作为 ul 的孩子标签就可以构成一个无序列表，如下：

```html
<ul>
  <li>吃饭</li>
  <li>睡觉</li>
  <li>撸码</li>
</ul>
```

2、ul 常用属性：

| 属性 | 值                                                           | 说明               |
| ---- | ------------------------------------------------------------ | ------------------ |
| type | disc ：实心圆<br/>circle ：空心圆<br>square ：实心正方形<br>none ：无 | 规定列表的符号类型 |

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>无序列表</title>
</head>
<body>
    <!-- 定义列表的符号类型为实心正方形 -->
    <ul type="square">
        <li>吃饭</li>
        <li>睡觉</li>
        <li>撸码</li>
    </ul>
</body>
</html>
```

效果展示：

![image-20221018113436180.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633616.png)

### 7.3、dl + dt + dd 构成自定义列表

1、将 dt ，dd 作为 dl 的孩子节点就可以构成一个自定义列表，如下：

```html
<dl>
  <dt>Coffee</dt>
    <dd>Black hot drink</dd>
  <dt>Milk</dt>
    <dd>White cold drink</dd>
</dl>
```

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>自定义列表</title>
</head>
<body>
    <dl>
        <dt>Coffee</dt>
          <dd>Black hot drink</dd>
        <dt>Milk</dt>
          <dd>White cold drink</dd>
      </dl>
</body>
</html>
```

效果展示：

![image-20221018113949759.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633068.png)

## 八、图片 img

1、img 标签可以将图片显示在 HTML 中，它是一个单标签

2、img 标签常用属性

| 属性   | 值              | 说明                                   |
| ------ | --------------- | -------------------------------------- |
| src    | url：图片的路径 | url 可以是网络图片路径和本地图片路径   |
| alt    | text：文本      | 当图片加载失败时就会显示这个文本的信息 |
| width  | pixels：像素值  | 规定图片的宽度                         |
| height | pixels：像素值  | 规定图片的高度                         |

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>图片</title>
</head>
<body>
    <img 
    src="https://img.lianzhixiu.com/uploads/210106/37-21010609363aS.jpg" 
    alt="图片加载 error" 
    width="400px"
    height="400px"/>
</body>
</html>

```

效果展示：

![image-20221018141828808.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633224.png)

## 九、超链接 a

1、a 标签主要用于定义一个超链接，如下：

```html
<a href="https://www.baidu.com/">打开百度搜索</a>
```

2、常用属性

| 属性   | 值                                               | 说明                                             |
| ------ | ------------------------------------------------ | ------------------------------------------------ |
| href   | url                                              | 跳转链接的 url                                   |
| title  | text                                             | 鼠标放在链接上出来的悬浮文字                     |
| target | `_blank` ：新窗口打开<br/>`_self` ：当前页面打开 | 规定在何处打开目前 url，仅在 href 属性存在时使用 |

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>超链接</title>
</head>
<body>
  	 <!-- 在新页面打开当前链接 -->
     <a href="https://www.baidu.com/" title="百度" target="_blank">打开百度搜索</a>
</body>
</html>
```

效果展示：

![image-20221018143448433.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281633985.png)

## 十、HTML 表格

### 10.1、常用表格标签

组成 HTML 表格的标签有很多，我们介绍常用的：

| 标签    | 说明           |
| ------- | -------------- |
| table   | 定义表格       |
| caption | 定义表格标题   |
| th      | 定义表格的表头 |
| tr      | 定义表格的行   |
| td      | 定义表格的单元 |

### 10.2、常用表格标签属性

#### 10.2.1、table 标签属性

| 属性        | 值                                                           | 说明                                   |
| ----------- | ------------------------------------------------------------ | -------------------------------------- |
| width       | pixels ：像素值<br/>% ：百分比                               | 表格的宽度，可以是像素值也可以是百分比 |
| height      | pixels ：像素值<br/>% ：百分比                               | 表格的高度，可以是像素值也可以是百分比 |
| border      | 数值                                                         | 表格边框                               |
| bordercolor | rgb(x,x,x)  ：rgb 组成的颜色<br/>#xxxxxx ：十六进制颜色<br/>colorname ：颜色的英文名称 | 表格边框颜色                           |
| bgcolor     | rgb(x,x,x)  ：rgb 组成的颜色<br/>#xxxxxx ：十六进制颜色<br/>colorname ：颜色的英文名称 | 表格背景颜色                           |
| align       | left ：左边<br/>center ： 中间<br/>right ：右边              | 表格在 HTML 中的对齐方式               |
| cellspacing | pixels ：像素值<br/>                                         | 单元格与单元格之间的间距               |
| cellpadding | pixels ：像素值<br/>                                         | 单元格的内间距                         |

#### 10.2.2、th 标签属性

| 属性    | 值                                                           | 说明                                       |
| ------- | ------------------------------------------------------------ | ------------------------------------------ |
| width   | pixels ：像素值<br/>% ：百分比                               | 表头单元格宽度，可以是像素值也可以是百分比 |
| height  | pixels ：像素值<br/>% ：百分比                               | 表头单元格高度，可以是像素值也可以是百分比 |
| bgcolor | rgb(x,x,x)  ：rgb 组成的颜色<br/>#xxxxxx ：十六进制颜色<br/>colorname ：颜色的英文名称 | 表头单元格的背景颜色                       |
| align   | left ：左边<br/>center ： 中间<br/>right ：右边              | 表头单元格文字水平对齐方式                 |
| valign  | top ：上<br/>middle ： 中<br/>bottom ：下                    | 表头单元格文字垂直对齐方式                 |
| rowspan | 数值                                                         | 表头单元格行合并                           |
| colspan | 数值                                                         | 表头单元格列合并                           |

#### 10.2.3、tr 标签属性

| 属性    | 值                                                           | 说明                                   |
| ------- | ------------------------------------------------------------ | -------------------------------------- |
| height  | pixels ：像素值<br/>% ：百分比                               | 当前行高度，可以是像素值也可以是百分比 |
| bgcolor | rgb(x,x,x)  ：rgb 组成的颜色<br/>#xxxxxx ：十六进制颜色<br/>colorname ：颜色的英文名称 | 当前行的背景颜色                       |
| align   | left ：左边<br/>center ： 中间<br/>right ：右边              | 当前行文字水平对齐方式                 |
| valign  | top ：上<br/>middle ： 中<br/>bottom ：下                    | 当前行文字垂直对齐方式                 |

#### 10.2.4、td 标签属性

| 属性    | 值                                                           | 说明                                   |
| ------- | ------------------------------------------------------------ | -------------------------------------- |
| width   | pixels ：像素值<br/>% ：百分比                               | 单元格宽度，可以是像素值也可以是百分比 |
| height  | pixels ：像素值<br/>% ：百分比                               | 单元格高度，可以是像素值也可以是百分比 |
| bgcolor | rgb(x,x,x)  ：rgb 组成的颜色<br/>#xxxxxx ：十六进制颜色<br/>colorname ：颜色的英文名称 | 单元格的背景颜色                       |
| align   | left ：左边<br/>center ： 中间<br/>right ：右边              | 单元格文字水平对齐方式                 |
| valign  | top ：上<br/>middle ： 中<br/>bottom ：下                    | 单元格文字垂直对齐方式                 |
| rowspan | 数值                                                         | 行合并                                 |
| colspan | 数值                                                         | 列合并                                 |

### 10.3、综合案例

接下来我们使用上述学习的 HTML 表格标签实现一个综合案例

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>表格综合案例</title>
</head>
<body>
    <table border="1" cellspacing="0" cellpadding="0" align="center" bordercolor="pink">
        <caption style="color: red;">会员登记系统</caption>
        <tr height="50" align="center">
            <th><span style="color: red;">key</span></th>
            <th colspan="3"><span style="color: red;">value</span></th>
        </tr>
        <tr height="50" align="center">
            <td width="100"><span style="color: pink;">会员姓名</span></td>
            <td width="300"></td>
        </tr>
        <tr height="50" align="center">
            <td width="100"><span style="color: pink;">出生日期</span></td>
            <td width="300"></td>
        </tr>
        <tr height="50" align="center">
            <td><span style="color: pink;">身份证号</span></td>
            <td colspan="3"></td>
        </tr>
        <tr height="50" align="center">
            <td><span style="color: pink;">通信地址</span></td>
            <td colspan="3"></td>
        </tr>
        <tr height="50" align="center">
            <td><span style="color: pink;">联系电话</span></td>
            <td colspan="3"></td>
        </tr>
        <tr height="50" align="center">
            <td><span style="color: pink;">会员卡号</span></td>
            <td colspan="3"></td>
        </tr>
    </table>
</body>
</html>
```

效果展示：

![image-20221018151549235.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281634664.png)

## 十一、HTML 表单

### 11.1、常用表单标签

HTML 表单的标签有很多，我们介绍常用的：

| 标签            | 说明                                               |
| --------------- | -------------------------------------------------- |
| form            | 定义用户输入的表单                                 |
| input           | 定义输入域                                         |
| label           | 定义标签                                           |
| select + option | 定义下拉列表，select：下拉列表 opton：具体的每一项 |
| button          | 定义一个点击按钮                                   |

### 11.2、常用表单标签属性

#### 11.2.1、form 标签属性

| 属性   | 值           | 说明                     |
| ------ | ------------ | ------------------------ |
| action | url          | 发送表单数据的 url       |
| method | get<br/>post | 发送表单数据的 HTTP 方法 |

#### 11.2.2、input 标签属性

| 属性        | 值                                                           | 说明                                          |
| ----------- | ------------------------------------------------------------ | --------------------------------------------- |
| type        | button<br/>checkbox<br/>color<br/>date<br/>datetime<br/>datetime-local<br/>email<br/>file<br/>hidden<br/>image<br/>month<br/>number<br/>password<br/>radio<br/>range<br/>reset<br/>search<br/>submit<br/>tel<br/>text<br/>time<br/>url | 指定 input 标签要显示的类型                   |
| value       | text                                                         | 指定 input 标签的值                           |
| placeholder | text                                                         | 提示文案                                      |
| name        | text                                                         | 指定 input 标签的名称，也用于提交服务器的 key |

#### 11.2.3、select 标签属性

| 属性     | 值   | 说明                                       |
| -------- | ---- | ------------------------------------------ |
| disabled |      | 禁用下拉列表                               |
| multiple |      | 可选择多个选项                             |
| name     | text | 定义下拉列表的名称，也用于提交服务器的 key |

#### 11.2.4、option 标签属性

| 属性     | 值   | 说明                   |
| -------- | ---- | ---------------------- |
| disabled |      | 禁用当前项             |
| value    | text | 定义提交服务器的 value |

#### 11.2.5、button 标签属性

| 属性    | 值                          | 说明                                   |
| ------- | --------------------------- | -------------------------------------- |
| name    | text                        | 定义按钮的名称，也用于提交服务器的 key |
| type    | button<br/>reset<br/>submit | 规定按钮的类型                         |
| value   | text                        | 规定按钮的初始值                       |
| onclick |                             | 按钮点击后的回调                       |

### 11.3、综合案例

接下来我们使用上面学习到的表单标签实现一个用户信息登记系统

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>表单综合案例</title>
</head>
<body>
    <h1>用户信息登记系统</h1>
    <form action="https://www.baidu.com/" method="get" >
        姓名：
        <br/>
        <input type="text" placeholder="请输入用户姓名" name="name">
        <br/>
        <br/>
        性别：
        <br/>
        <label for="male">男</label>
        <input type="radio" name="sex" id="male" value="male"/>
        <label for="female">女</label>
        <input type="radio" name="sex" id="female" value="female"/>
        <br/>
        <br/>
        <label for="face">颜值</label>
        <select id="face" name="face">
            <option value="900">70</option>
            <option value="80">80</option>
            <option value="90">90</option>
            <option value="100">100</option>
        </select>
        <br/>
        <br/>
        兴趣爱好：
        <br/>
        <label for="palyball">打篮球</label>
        <input type="checkbox" name="hobby" id="palyball" value="palyball"/>
        <label for="climb">爬山</label>
        <input type="checkbox" name="hobby" id="climb" value="climb"/>
        <label for="code">写代码</label>
        <input type="checkbox" name="hobby" id="code" value="code"/>
        <br/>
        <br/>
        <input type="submit" value="提交用户信息">
        <br/>
        <br/>
        <button type="button" onclick="alert('每天进步一厘米，加油打工人！！！')">点我送你一句话</button>
    </form>
</body>
</html>
```

效果展示：

1、初始效果

![image-20221018163152674.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281634973.png)

2、填写用户信息并提交服务器

![image-20221018163248560.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281634610.png)

![image-20221018163308247.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281634514.png)

3、点击`点我送你一句话`按钮

![image-20221018163429448.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281634480.png)

## 十二、框架 iframe(内嵌网页)

1、我们可以使用 iframe 标签内嵌一个网页

```html
<iframe src="https://www.hao123.com/"  >
```

2、属性

| 属性        | 值                             | 说明                                   |
| ----------- | ------------------------------ | -------------------------------------- |
| width       | pixels ：像素值<br/>% ：百分比 | 定义按钮的名称，也用于提交服务器的 key |
| height      | pixels ：像素值<br/>% ：百分比 | 规定按钮的类型                         |
| frameborder | 1 ：有边框<br/>0 ：无边框      | 规定是否显示 iframe 标签的边框         |
| src         | url                            | 目标网页链接                           |

示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>iframe标签</title>
</head>
<body>
    <h1 align="center">iframe 标签用于内嵌一个网页</h1>
    <iframe src="https://www.hao123.com/" width="100%" height="600px" frameborder="1">
</iframe>
</body>
</html>
```

效果展示：

![image-20221018164537784.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281634024.png)

## 十三、总结

本篇文章我们介绍了：

1、HTML 基础语法

2、HTML 常用标签和属性：

> 1、标题：h1~h6
>
> 2、段落：p
>
> 3、HTML 文本格式化标签：b，strong，i，em，s，del，u，sup，sub，hr
>
> 4、HTML 中的特殊符号：`&lt;`，`&gt;`，`&emsp;`，`&copy;`，`&trade;`，`&reg;`
>
> 5、区：div 和 span
>
> 6、列表：ol + li，ul + li，dl + dt + dd
>
> 7、图片：img
>
> 8、超链接：a
>
> 9、HTML 表格：table，caption，th，tr，td
>
> 10、HTML 表单：form，input，label，select + option，button
>
> 11、框架 iframe

3、学习标签后做的综合案例

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 参考和推荐

[b站web入门教程](https://www.bilibili.com/video/BV17z4y1D7Yj/)：通俗易懂，极力推荐

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](https://link.juejin.cn/?target=http%3A%2F%2Fm6z.cn%2F6jwi7b "http://m6z.cn/6jwi7b") ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！