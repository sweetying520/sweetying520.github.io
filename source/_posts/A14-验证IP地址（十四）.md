---
title: 验证IP地址（十四）
date: 2022-08-18 10:42:57
author: sweetying
tags: 
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---
## 一、题目描述

这是 LeetCode 上的第四百六十八题：[验证IP地址](https://leetcode.cn/problems/validate-ip-address/)，难度为 **中等**。

Tag：「字符串」

给定一个字符串 `queryIP`。如果是有效的 IPv4 地址，返回 `"IPv4"` ；如果是有效的 IPv6 地址，返回 `"IPv6"` ；如果不是上述类型的 IP 地址，返回 `"Neither"` 。

**有效的IPv4地址** 是 `“x1.x2.x3.x4”` 形式的IP地址。 其中 `0 <= xi <= 255` 且 `xi` **不能包含** 前导零。例如: `“192.168.1.1”` 、 `“192.168.1.0”` 为有效IPv4地址， `“192.168.01.1”` 为无效IPv4地址; `“192.168.1.00”` 、 `“192.168@1.1”` 为无效IPv4地址。

**一个有效的IPv6地址** 是一个格式为`“x1:x2:x3:x4:x5:x6:x7:x8”` 的IP地址，其中:

-   `1 <= xi.length <= 4`
-   `xi` 是一个 **十六进制字符串** ，可以包含数字、小写英文字母( `'a'` 到 `'f'` )和大写英文字母( `'A'` 到 `'F'` )。
-   在 `xi` 中允许前导零。

如 `"2001:0db8:85a3:0000:0000:8a2e:0370:7334"` 和 `"2001:db8:85a3:0:0:8A2E:0370:7334"` 是有效的 IPv6 地址，而 `"2001:0db8:85a3::8A2E:037j:7334"` 和 `"02001:0db8:85a3:0000:0000:8a2e:0370:7334"` 是无效的 IPv6 地址。

示例 1：

```
输入： queryIP = "172.16.254.1"
输出： "IPv4"
解释： 有效的 IPv4 地址，返回 "IPv4"
```

示例 2：

```
输入： queryIP = "2001:0db8:85a3:0:0:8A2E:0370:7334"
输出： "IPv6"
解释： 有效的 IPv6 地址，返回 "IPv6"
```

示例 3：

```
输入： queryIP = "256.256.256.256"
输出： "Neither"
解释： 既不是 IPv4 地址，又不是 IPv6 地址
```

**提示：**

`queryIP` 仅由英文字母，数字，字符 `.` 和 `:` 组成。

## 二、解题思路

1）、判断 queryIP 是否包含`.`，如果包含，那么我们需要判断其是否为 IPv4 地址；如果不包含，我们则判断其是否为 IPv6 地址

2）、对于 IPv4 地址而言，它包含 4 个部分，用`.`隔开。因此我们可以存储相邻两个`.`出现的位置 last 和 cur（当考虑首个部分时，last=−1；当考虑最后一个部分时，cur=n，其中 n 是字符串的长度），那么子串 queryIP[last+1..cur−1] 就对应着一个部分。我们需要判断：

> 1、它的长度是否在 [1,3] 之间（虽然这一步没有显式要求，但提前判断可以防止后续计算值时 32 位整数无法表示的情况）；
> 
> 2、它是否只包含数字；
>
> 3、它的值是否在 [0,255] 之间；
> 
> 4、它是否不包含前导零。具体地，如果它的值为 0，那么该部分只能包含一个 0，即 (cur−1)−(last+1)+1=1；如果它的值不为 0，那么该部分的第一个数字不能为 0，即 queryIP[last+1] 不为 0。

3）、对于 IPv6 地址而言，它包含 8 个部分，用`:`隔开。同样地，我们可以存储相邻两个`:`出现的位置 last 和 cur，那么子串 queryIP[last+1..cur−1] 就对应着一个部分。我们需要判断：

> 1、它的长度是否在 [1,4] 之间；
>
> 2、它是否只包含数字，或者 a-f，或者 A-F；

除了上述情况以外，如果我们无法找到对应数量的部分，那么给定的字符串也不是一个有效的 IP 地址。

代码实现：

```java
class Solution {
    public String validIPAddress(String queryIP) {
        if (queryIP.indexOf('.') >= 0) {
            // IPv4
            int last = -1;
            for (int i = 0; i < 4; ++i) {
                int cur = (i == 3 ? queryIP.length() : queryIP.indexOf('.', last + 1));
                if (cur < 0) {
                    return "Neither";
                }
                if (cur - last - 1 < 1 || cur - last - 1 > 3) {
                    return "Neither";
                }
                int addr = 0;
                for (int j = last + 1; j < cur; ++j) {
                    if (!Character.isDigit(queryIP.charAt(j))) {
                        return "Neither";
                    }
                    addr = addr * 10 + (queryIP.charAt(j) - '0');
                }
                if (addr > 255) {
                    return "Neither";
                }
                if (addr > 0 && queryIP.charAt(last + 1) == '0') {
                    return "Neither";
                }
                if (addr == 0 && cur - last - 1 > 1) {
                    return "Neither";
                }
                last = cur;
            }
            return "IPv4";
        } else {
            // IPv6
            int last = -1;
            for (int i = 0; i < 8; ++i) {
                int cur = (i == 7 ? queryIP.length() : queryIP.indexOf(':', last + 1));
                if (cur < 0) {
                    return "Neither";
                }
                if (cur - last - 1 < 1 || cur - last - 1 > 4) {
                    return "Neither";
                }
                for (int j = last + 1; j < cur; ++j) {
                    if (!Character.isDigit(queryIP.charAt(j)) && !('a' <= Character.toLowerCase(queryIP.charAt(j)) && Character.toLowerCase(queryIP.charAt(j)) <= 'f')) {
                        return "Neither";
                    }
                }
                last = cur;
            }
            return "IPv6";
        }
    }
}
```

复杂度分析：

1、时间复杂度：O(n)，其中 n 是字符串 queryIP 的长度。我们只需要遍历字符串常数次。

2、空间复杂度：O(1)，只使用到常数个变量。

## 三、总结

本道算法题难度为中等，关键是一些细节需要考虑到位

好了，本篇文章到这里就结束了，感谢你的阅读🤝