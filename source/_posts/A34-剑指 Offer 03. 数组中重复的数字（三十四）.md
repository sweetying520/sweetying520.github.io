---
title: 剑指 Offer 03. 数组中重复的数字（三十四）
date: 2022-09-07 10:42:57
author: sweetying
tags:
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---

## 一、题目描述

这是 LeetCode 上：[剑指 Offer 03. 数组中重复的数字](https://leetcode.cn/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof/)，难度为 **简单**。

Tag：「数组」、「哈希表」

找出数组中重复的数字。

在一个长度为 n 的数组 nums 里的所有数字都在 0～n-1 的范围内。数组中某些数字是重复的，但不知道有几个数字重复了，也不知道每个数字重复了几次。请找出数组中任意一个重复的数字。

示例 1：

```java
输入：
[2, 3, 1, 0, 2, 5, 3]
输出：2 或 3 
```

**提示：**

1、2 <= n <= 100000

## 二、解题思路

1)、由于只需要找出数组中任意一个重复的数字，因此遍历数组，遇到重复的数字即返回。为了判断一个数字是否重复遇到，使用集合存储已经遇到的数字，如果遇到的一个数字已经在集合中，则当前的数字是重复数字。

> 初始化集合为空集合，重复的数字 repeat = -1，遍历数组中的每个元素：将该元素加入集合中，判断是否添加成功，如果添加失败，说明该元素已经在集合中，因此该元素是重复元素，将该元素的值赋给 repeat，并结束遍历返回 repeat

代码实现：

```java
class Solution {
    public int findRepeatNumber(int[] nums) {
        Set<Integer> set = new HashSet<Integer>();
        int repeat = -1;
        for (int num : nums) {
            if (!set.add(num)) {
                repeat = num;
                break;
            }
        }
        return repeat;
    }
}
```


复杂度分析

1、时间复杂度：O(n)。遍历数组一遍，使用哈希集合（HashSet），添加元素的时间复杂度为 O(1)，故总的时间复杂度是 O(n)。

2、空间复杂度：O(n)。不重复的每个元素都可能存入集合，因此占用 O(n) 额外空间。

## 三、总结

本道算法题难度为简单，使用 Set 集合不能添加重复元素的特性进行快速求解。

好了，本篇文章到这里就结束了，感谢你的阅读🤝