---
title: 剑指 Offer 09. 用两个栈实现队列（三十九）
date: 2022-09-12 10:42:57
author: sweetying
tags:
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---

## 一、题目描述

这是 LeetCode 上：[剑指 Offer 09. 用两个栈实现队列](https://leetcode.cn/problems/yong-liang-ge-zhan-shi-xian-dui-lie-lcof/)，难度为 **简单**。

Tag：「栈」、「队列」

用两个栈实现一个队列。队列的声明如下，请实现它的两个函数 appendTail 和 deleteHead ，分别完成在队列尾部插入整数和在队列头部删除整数的功能。(若队列中没有元素，deleteHead 操作返回 -1 )

示例 1：

```java
输入：
["CQueue","appendTail","deleteHead","deleteHead","deleteHead"]
[[],[3],[],[],[]]
输出：[null,null,3,-1,-1]
```

示例 2：

```java
输入：
["CQueue","deleteHead","appendTail","appendTail","deleteHead","deleteHead"]
[[],[],[5],[2],[],[]]
输出：[null,-1,null,null,5,2]
```

**提示：**

1、1 <= values <= 10000

2、最多会对 appendTail、deleteHead 进行 10000 次调用

## 二、解题思路

将一个栈当作输入栈，用于压入 appendTail 传入的数据；另一个栈当作输出栈，用于 deleteHead 操作。

每次 deleteHead 时，若输出栈为空则将输入栈的全部数据依次弹出并压入输出栈，这样输出栈从栈顶往栈底的顺序就是队列从队首往队尾的顺序。


代码实现：

```java
class CQueue {
    Deque<Integer> inStack;
    Deque<Integer> outStack;

    public CQueue() {
        inStack = new ArrayDeque<Integer>();
        outStack = new ArrayDeque<Integer>();
    }

    public void appendTail(int value) {
        inStack.push(value);
    }

    public int deleteHead() {
        if (outStack.isEmpty()) {
            if (inStack.isEmpty()) {
                return -1;
            }
            in2out();
        }
        return outStack.pop();
    }

    private void in2out() {
        while (!inStack.isEmpty()) {
            outStack.push(inStack.pop());
        }
    }
}
```

复杂度分析

1、时间复杂度：appendTail 为 O(1)，deleteHead 为均摊 O(1)。对于每个元素，至多入栈和出栈各两次，故均摊复杂度为 O(1)。

2、空间复杂度：O(n)。其中 n 是操作总数。对于有 n 次 appendTail 操作的情况，队列中会有 n 个元素，故空间复杂度为 O(n)。

## 三、总结

本道算法题难度为简单，我们使用双栈：一个输入栈，一个输出栈，经过两次栈操作，他就变成了一个队列。

> 1、栈特点：元素先进后出
> 
> 2、队列特点：元素先进先出

好了，本篇文章到这里就结束了，感谢你的阅读🤝