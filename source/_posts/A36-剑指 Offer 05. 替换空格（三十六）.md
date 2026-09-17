---
title: 剑指 Offer 05. 替换空格（三十六）
date: 2022-09-09 10:42:57
author: sweetying
tags:
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---

## 一、题目描述

这是 LeetCode 上：[剑指 Offer 05. 替换空格](https://leetcode.cn/problems/ti-huan-kong-ge-lcof/)，难度为 **简单**。

Tag：「字符串」

请实现一个函数，把字符串 s 中的每个空格替换成"%20"。

示例 1：

```java
输入：s = "We are happy."
输出："We%20are%20happy."
```

**提示：**

1、0 <= s 的长度 <= 10000

## 二、解题思路

### 法一：迭代替换

由于每次替换从 1 个字符变成 3 个字符，使用字符数组可方便地进行替换。建立字符数组地长度为 s 的长度的 3 倍，这样可保证字符数组可以容纳所有替换后的字符。

> 1、获得 s 的长度 length
>
> 2、创建字符数组 array，其长度为 length * 3
>
> 3、初始化 size 为 0，size 表示替换后的字符串的长度
>
> 4、从左到右遍历字符串 s
>
> > 1、获得 s 的当前字符 c，如果字符 c 是空格，则令 array[size] = '%'，array[size + 1] = '2'，array[size + 2] = '0'，并将 size 的值加 3
> >
> > 2、如果字符 c 不是空格，则令 array[size] = c，并将 size 的值加 1
>
> 5、遍历结束之后，size 的值等于替换后的字符串的长度，从 array 的前 size 个字符创建新字符串，并返回新字符串

代码实现：

```java
class Solution {
    public String replaceSpace(String s) {
        int length = s.length();
        char[] array = new char[length * 3];
        int size = 0;
        for (int i = 0; i < length; i++) {
            char c = s.charAt(i);
            if (c == ' ') {
                array[size++] = '%';
                array[size++] = '2';
                array[size++] = '0';
            } else {
                array[size++] = c;
            }
        }
        String newStr = new String(array, 0, size);
        return newStr;
    }
}
```

复杂度分析

1、时间复杂度：O(n)。遍历字符串 s 一遍。

2、空间复杂度：O(n)。额外创建字符数组，长度为 s 的长度的 3 倍。

### 法二：使用语言自带 Api

Java 给我们提供了 replaceAll 方法，可完成快速替换

代码实现：

```java
class Solution {
    public String replaceSpace(String s) {
        return s.replaceAll(" ","%20");
    }
}
```

复杂度分析

1、时间复杂度：O(n)。内部使用了 do while 循环。

2、空间复杂度：O(n)。内部使用了 StringBuffer 进行拼接替换。


## 三、总结

本道算法题难度为简单，直接遍历替换即可，也可使用语言自带的 Api 进行快速求解。

好了，本篇文章到这里就结束了，感谢你的阅读🤝