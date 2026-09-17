---
title: 丑数II（十六）
date: 2022-08-20 10:42:57
author: sweetying
tags:
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---
## 一、题目描述

这是 LeetCode 上的第二百六十四题：[丑数 II](https://leetcode.cn/problems/ugly-number-ii/)，难度为 **中等**。

Tag：「哈希表」、「堆（优先队列）」

给你一个整数 `n` ，请你找出并返回第 `n` 个 **丑数** 。

**丑数** 就是只包含质因数 `2`、`3` 和/或 `5` 的正整数。

**Tips**：

1、质数：除了 1 合它本身，不能被其他数整除，我们称为质数。如 2，3，5等等

2、质因数：就是一个数的约数，并且是质数。如 8 = 2 x 2 x 2，因为 2 也是质数，所以 2 是 8 的质因数

3、约数：a 能被 b 整除并且没有余数，我们就称 a 是 b 的倍数，b 是 a 的约数。如 12 = 2 x 2 x 3，那么 2，3都是 12 的约数

4、1 通常被视作丑数

5、丑数：就是只包含质因数 2、3 和 5 的正整数。如 1，2，3，4，5，6，8等等


示例 1：

```
输入：n = 10
输出：12
解释：[1, 2, 3, 4, 5, 6, 8, 9, 10, 12] 是由前 10 个丑数组成的序列。
```

示例 2：

```
输入：n = 1
输出：1
解释：1 通常被视为丑数。
```

**提示：**

1 <= n <= 1690

## 二、解题思路

本题使用最小堆的思想，最小堆中父节点的值要小于两个子节点。要得到从小到大的第 n 个丑数，我们可以使用最小堆实现。

初始时堆为空。首先将最小的丑数 1 加入堆。

每次取出堆顶元素 x，则 x 是堆中最小的丑数，由于 2x,3x,5x 也是丑数，因此将 2x,3x,5x 加入堆。

上述做法会导致堆中出现重复元素的情况。为了避免重复元素，可以使用哈希集合去重，避免相同元素多次加入堆。

在排除重复元素的情况下，第 n 次从最小堆中取出的元素即为第 n 个丑数。

代码实现：

```java
class Solution {
    public int nthUglyNumber(int n) {
        int[] factors = {2, 3, 5};
        Set<Long> seen = new HashSet<Long>();
        PriorityQueue<Long> heap = new PriorityQueue<Long>();
        seen.add(1L);
        heap.offer(1L);
        int ugly = 0;
        for (int i = 0; i < n; i++) {
            long curr = heap.poll();
            ugly = (int) curr;
            for (int factor : factors) {
                long next = curr * factor;
                if (seen.add(next)) {
                    heap.offer(next);
                }
            }
        }
        return ugly;
    }
}
```


## 三、总结

本道算法题难度为中等，使用最小堆 + 哈希表的思想能快速解决此需求。

好了，本篇文章到这里就结束了，感谢你的阅读🤝