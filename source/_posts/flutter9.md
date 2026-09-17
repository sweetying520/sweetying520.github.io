---
title: Flutter 项目开发及技术选型
date: 2022-11-27 16:57:59
tags:
---

## 前言

从 0 开发一个 Flutter 项目，要想做好，我们需要考虑的东西还是很多的。例如：

1、如何搭建一个好的开发框架让我们的项目结构清晰，可维护性好，可扩展性高？

2、如何进行 Flutter 技术选型，加速我们的开发效率？

3、如何将项目进行高效的团队协作，避免团队成员间出现代码提交冲突，代码覆盖等问题？

带着问题去思考，下面分享一下我在实际开发中的一些经验和心得。

## 一、组件化方案和要点

Flutter 中如何做到像 Android 一样使用组件化开发呢？

### 1.1、Flutter Project Type 介绍

在我们新建一个 Flutter 项目时，可以选择 5 种类型的 Project Type ，如下图：

![image-20221127174814675.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281609266.png)

#### 1.1.1、Application

这种类型的主体是 Flutter，其中包含 Android，iOS 等项目，主要用于纯 Flutter 开发。

#### 1.1.2、Plugin

这种类型主要用来开发 Flutter 插件。

> Flutter 无法实现的功能，使用原生来实现，然后通过 Flutter 插件在 Flutter 项目中使用原生实现的功能

#### 1.1.3、Package

这种类型是纯 Flutter 模块，不需要原生代码实现，没有 Android iOS 目录。一般用于通用模块或者特定业务的模块划分。

#### 1.1.4、Module

这种类型的主体是原生项目，用于在 Android，iOS 项目中添加 Flutter 模块，进行原生与 Flutter 的混合开发。

#### 1.1.5、Skeleton

从 Flutter 2.5 开始支持这种类型，它主要是为开发提供一种较好的项目模板，不在是默认的 Couter app。
模板中可以看到路由、资源、多语言、状态管理，文件夹等最佳实践方法

### 1.2、组件化项目创建

了解了 Project type，接下来我们就可以根据自己的实际需求去创建一个组件化的 Flutter 项目，举个例子：

1、我想进行纯 Flutter 项目的组件化开发，那么是不是可以采用：**Application + Package 的方式**

2、根据业务进行业务组件和基础组件的划分：

> 业务组件：与业务相关联的组件
>
> 基础组件：与业务无关的组件

我们可以新建两个文件夹：

> pkg_base：放与业务无关的基础组件
>
> pkg_biz：放与业务相关的业务组件

接下来我们对上面的理论进行实践，如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309281609281.png" alt="image-20221127185517524.png" style="zoom:50%;" />

可以看到：

1、我创建了一个 FlutterWanAndroid 的 Application 项目

2、创建了两个文件夹：

> pkg_base 下放了我们新建的与业务无关的基础 Package 组件
>
> pkg_biz 下放了我们新建的与业务相关的业务 Package 组件

3、业务 Package 组件我们划分了：实现层和 export 层（接口层），其他组件依赖 export 层进行通信而不需要依赖具体实现层

这样我们就搭建好了一个最基础的组件化项目

### 1.3、配置依赖

### 1.4、组件化路由管理

接下来就是各组件间的路由管理，这里我们使用 GetX，简单的介绍一下 Getx：

> GetX 是 Flutter 上一个轻量且强大的状态管理框架，它不仅包含了**状态管理**，还有**路由管理，主题管理，国际化多语言管理，网络请求，数据验证，Dialog，Snackbar** 等功能











