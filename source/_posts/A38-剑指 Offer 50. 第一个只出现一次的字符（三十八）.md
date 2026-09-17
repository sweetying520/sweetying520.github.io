---
title: 剑指 Offer 50. 第一个只出现一次的字符（三十八）
date: 2022-09-11 10:42:57
author: sweetying
tags:
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---

## 一、题目描述

这是 LeetCode 上：[剑指 Offer 50. 第一个只出现一次的字符](https://leetcode.cn/problems/di-yi-ge-zhi-chu-xian-yi-ci-de-zi-fu-lcof/)，难度为 **简单**。

Tag：「哈希表」、「字符串」

在字符串 s 中找出第一个只出现一次的字符。如果没有，返回一个单空格。 s 只包含小写字母。

示例 1：

```java
输入：s = "abaccdeff"
输出：'b'
```

示例 2：

```java
输入：s = "" 
输出：' '
```

**提示：**

1、0 <= s 的长度 <= 50000

## 二、解题思路

我们可以对方法一进行修改，使得第二次遍历的对象从字符串变为哈希映射。

具体地，对于哈希映射中的每一个键值对，键表示一个字符，值表示它的首次出现的索引（如果该字符只出现一次）或者 −1（如果该字符出现多次）。当我们第一次遍历字符串时，设当前遍历到的字符为 c，如果 c 不在哈希映射中，我们就将 c 与它的索引作为一个键值对加入哈希映射中，否则我们将 c 在哈希映射中对应的值修改为 −1。

在第一次遍历结束后，我们只需要再遍历一次哈希映射中的所有值，找出其中不为 −1 的最小值，即为第一个不重复字符的索引，然后返回该索引对应的字符。如果哈希映射中的所有值均为 −1，我们就返回空格。

代码实现：

```java
class Solution {
    public char firstUniqChar(String s) {
        Map<Character, Integer> position = new HashMap<Character, Integer>();
        int n = s.length();
        for (int i = 0; i < n; ++i) {
            char ch = s.charAt(i);
            if (position.containsKey(ch)) {
                position.put(ch, -1);
            } else {
                position.put(ch, i);
            }
        }
        int first = n;
        for (Map.Entry<Character, Integer> entry : position.entrySet()) {
            int pos = entry.getValue();
            if (pos != -1 && pos < first) {
                first = pos;
            }
        }
        return first == n ? ' ' : s.charAt(first);
    }
}
```

复杂度分析

1、时间复杂度：O(n)。两次 for 循环相加为 2n，忽略常数项，则时间复杂度为：O(n)

2、空间复杂度：O(n)。哈希表中存放的数据，长度为字符串的长度 n

## 三、总结

本道算法题难度为简单，使用哈希表存放出现元素的索引进行了快速求救，实际上也可以存放元素出现的频次，思路差不多。

好了，本篇文章到这里就结束了，感谢你的阅读🤝