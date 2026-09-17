---
title: 组合总和 II（三十二）
date: 2022-09-05 10:42:57
author: sweetying
tags:
- 原创
- 数据结构和算法
categories:
- 数据结构和算法
- 算法
---

## 一、题目描述

这是 LeetCode 上的第四十题：[组合总和 II](https://leetcode.cn/problems/combination-sum-ii/description/)，难度为 **中等**。

Tag：「数组」、「回溯」

给定一个候选人编号的集合 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。

candidates 中的每个数字在每个组合中只能使用一次 。

注意：解集不能包含重复的组合。 

示例 1：

```java
输入: candidates = [10,1,2,7,6,1,5], target = 8,
输出:
[
[1,1,6],
[1,2,5],
[1,7],
[2,6]
]
```

示例 2：

```java
输入: candidates = [2,5,2,1,2], target = 5,
输出:
[
[1,2,2],
[5]
]
```

**提示：**

1、1 <= candidates.length <= 100

2、1 <= candidates[i] <= 50

3、1 <= target <= 30

## 二、解题思路

由于我们需要求出所有和为 target 的组合，并且每个数只能使用一次，因此我们可以使用递归 + 回溯的方法来解决这个问题：

我们用 dfs(pos,rest) 表示递归的函数，其中 pos 表示我们当前递归到了数组 candidates 中的第 pos 个数，而 rest 表示我们还需要选择和为 rest 的数放入列表作为一个组合；

对于当前的第 pos 个数，我们有两种方法：选或者不选。如果我们选了这个数，那么我们调用 dfs(pos+1,rest−candidates[pos]) 进行递归，注意这里必须满足 rest≥candidates[pos]。如果我们不选这个数，那么我们调用 dfs(pos+1,rest) 进行递归；

在某次递归开始前，如果 rest 的值为 0，说明我们找到了一个和为 target 的组合，将其放入答案中。每次调用递归函数前，如果我们选了那个数，就需要将其放入列表的末尾，该列表中存储了我们选的所有数。在回溯时，如果我们选了那个数，就要将其从列表的末尾删除。

上述算法就是一个标准的递归 + 回溯算法，但是它并不适用于本题。这是因为题目描述中规定了解集不能包含重复的组合，而上述的算法中并没有去除重复的组合。

例如当 candidates=[2,2]，target=2 时，上述算法会将列表 [2] 放入答案两次。

因此，我们需要改进上述算法，在求出组合的过程中就进行去重的操作。我们可以考虑将相同的数放在一起进行处理，也就是说，如果数 x 出现了 y 次，那么在递归时一次性地处理它们，即分别调用选择0,1,⋯,y 次 x 的递归函数。这样我们就不会得到重复的组合。具体地：

我们使用一个哈希映射（HashMap）统计数组 candidates 中每个数出现的次数。在统计完成之后，我们将结果放入一个列表 freq 中，方便后续的递归使用。

列表 freq 的长度即为数组 candidates 中不同数的个数。其中的每一项对应着哈希映射中的一个键值对，即某个数以及它出现的次数。
在递归时，对于当前的第 pos 个数，它的值为 freq[pos][0]，出现的次数为 freq[pos][1]，那么我们可以调用 dfs(pos+1,rest−i×freq[pos][0])，即我们选择了这个数 i 次。这里 i 不能大于这个数出现的次数，并且 i×freq[pos][0] 也不能大于 rest。同时，我们需要将 i 个 freq[pos][0] 放入列表中。

这样一来，我们就可以不重复地枚举所有的组合了。

我们还可以进行什么优化（剪枝）呢？一种比较常用的优化方法是，我们将 freq 根据数从小到大排序，这样我们在递归时会先选择小的数，再选择大的数。这样做的好处是，当我们递归到 dfs(pos,rest) 时，如果 freq[pos][0] 已经大于 rest，那么后面还没有递归到的数也都大于 rest，这就说明不可能再选择若干个和为 rest 的数放入列表了。此时，我们就可以直接回溯。

代码实现：

```java
class Solution {
    List<int[]> freq = new ArrayList<int[]>();
    List<List<Integer>> ans = new ArrayList<List<Integer>>();
    List<Integer> sequence = new ArrayList<Integer>();

    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        for (int num : candidates) {
            int size = freq.size();
            if (freq.isEmpty() || num != freq.get(size - 1)[0]) {
                freq.add(new int[]{num, 1});
            } else {
                ++freq.get(size - 1)[1];
            }
        }
        dfs(0, target);
        return ans;
    }

    public void dfs(int pos, int rest) {
        if (rest == 0) {
            ans.add(new ArrayList<Integer>(sequence));
            return;
        }
        if (pos == freq.size() || rest < freq.get(pos)[0]) {
            return;
        }

        dfs(pos + 1, rest);

        int most = Math.min(rest / freq.get(pos)[0], freq.get(pos)[1]);
        for (int i = 1; i <= most; ++i) {
            sequence.add(freq.get(pos)[0]);
            dfs(pos + 1, rest - i * freq.get(pos)[0]);
        }
        for (int i = 1; i <= most; ++i) {
            sequence.remove(sequence.size() - 1);
        }
    }
}

//上述解法我们还可以优化写的更加简洁一点，如下：
class Solution {
    List<List<Integer>> res = new ArrayList<>();
    List<Integer> path = new ArrayList<>();
    int sum = 0;
    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        // 先进行排序
        Arrays.sort(candidates);
        backtrack(0, candidates, target);
        return res;
    }

    public void backtrack(int start, int[] candidates, int target) {
        if (sum == target) {
            res.add(new ArrayList<>(path));
            return;
        }
        // 剪枝操作
        for (int i = start; i < candidates.length && sum + candidates[i] <= target; ++i) {
            // 去重
            if (i > start && candidates[i] == candidates[i - 1]) continue;
            path.add(candidates[i]);
            sum += candidates[i];
            backtrack(i + 1, candidates, target);
            sum -= candidates[i];
            path.remove(path.size() - 1);
        }
    }
}
```

复杂度分析

1、时间复杂度：O(2^n×n)，其中 n 是数组 candidates 的长度。在大部分递归 + 回溯的题目中，我们无法给出一个严格的渐进紧界，故这里只分析一个较为宽松的渐进上界。在最坏的情况下，数组中的每个数都不相同，那么列表 freq 的长度同样为 n。在递归时，每个位置可以选或不选，如果数组中所有数的和不超过 target，那么 2^n 种组合都会被枚举到；在 target 小于数组中所有数的和时，我们并不能解析地算出满足题目要求的组合的数量，但我们知道每得到一个满足要求的组合，需要 O(n) 的时间将其放入答案中，因此我们将 O(2^n) 与 O(n) 相乘，即可估算出一个宽松的时间复杂度上界。

由于 O(2^n×n) 在渐进意义下大于排序的时间复杂度 O(nlogn)，因此后者可以忽略不计。

2、空间复杂度：O(n)。除了存储答案的数组外，我们需要 O(n) 的空间存储列表 freq、递归中存储当前选择的数的列表、以及递归需要的栈。

## 三、总结

本道算法题难度为中等，一个清晰的思路：递归 + 回溯 + 去重。按照这三个点然后在实现的过程中注意细节方能正确的解答出来

好了，本篇文章到这里就结束了，感谢你的阅读🤝