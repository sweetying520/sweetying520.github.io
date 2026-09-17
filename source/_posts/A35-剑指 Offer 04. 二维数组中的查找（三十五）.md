---
title: 剑指 Offer 04. 二维数组中的查找（三十五）
date: 2022-09-08 10:42:57
author: sweetying
tags:
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---

## 一、题目描述

这是 LeetCode 上：[剑指 Offer 04. 二维数组中的查找](https://leetcode.cn/problems/er-wei-shu-zu-zhong-de-cha-zhao-lcof/)，难度为 **中等**。

Tag：「数组」、「二分查找」

在一个 n * m 的二维数组中，每一行都按照从左到右 非递减 的顺序排序，每一列都按照从上到下 非递减 的顺序排序。请完成一个高效的函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。

示例 1：

现有矩阵 matrix 如下：

```java
[
  [1,   4,  7, 11, 15],
  [2,   5,  8, 12, 19],
  [3,   6,  9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30]
]
```

给定 target = 5，返回 true。

给定 target = 20，返回 false。

**提示：**

1、0 <= n <= 1000

2、0 <= m <= 1000

## 二、解题思路

### 法一：双重遍历

我们直接双重 for 循环遍历整个矩阵 matrix，判断 target 是否出现即可。

代码实现：

```java
class Solution {
    public boolean findNumberIn2DArray(int[][] matrix, int target) {
        for (int[] row : matrix) {
            for (int element : row) {
                if (element == target) {
                    return true;
                }
            }
        }
        return false;
    }
}
```

复杂度分析

1、时间复杂度：O(n^2)。两重 for 循环

2、空间复杂度：O(1)。仅使用常数个变量

### 法二：二分查找

由于矩阵 matrix 中每一行的元素都是升序排列的，因此我们可以对每一行都使用一次二分查找，判断 target 是否在该行中，从而判断 target 是否出现。

代码实现：

```java
class Solution {
    public boolean findNumberIn2DArray(int[][] matrix, int target) {
        for (int[] row : matrix) {
            int index = search(row, target);
            if (index >= 0) {
                return true;
            }
        }
        return false;
    }

    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = (high - low) / 2 + low;
            int num = nums[mid];
            if (num == target) {
                return mid;
            } else if (num > target) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return -1;
    }
}
```
复杂度分析

1、时间复杂度：O(nlogn)。对一行使用二分查找的时间复杂度为 O(logn)，最多需要进行 n 次二分查找。

2、空间复杂度：O(1)。

## 三、总结

本道算法题难度为中等，使用双重 for 循环能够快速求解，进一步使用二分查找能优化算法的时间复杂度。

好了，本篇文章到这里就结束了，感谢你的阅读🤝