---
title: 一篇就够系列：GooglePlay 应用内评价，应用内更新
date: 2023-01-06 10:26:01
author: sweetying
index_img: https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261440219.jpeg
tags: 
- 原创
- Android
- GooglePlay
categories:
- Android
- GooglePlay
---

![](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261440219.jpeg)

## 前言

1、我们都希望自己开发的 App 得到肯定，通常的做法是在应用内预置一个弹窗，在合适的时机弹出，并引导用户去商店评价。

2、App 开发中，应用内更新是必不可少的，国内常见的做法是在 App 中实现下载并安装，但是如果要上架 GooglePlay，这种做法会过不了审核。

接下来我们就使用 GooglePlay 应用内评价和应用内更新实现上面两个需求。

**注意**： GooglePlay 应用内评价和应用内更新只适用于 GooglePlay 上上架的 App，国内的应用商店并不适用

## 一、GooglePlay 应用内评价

### 1.1、设备要求

1、需 5.0 或更高版本的 Android 设备

2、 Android 设备安装了 Google Play 商店

### 1.2、Play Core 库要求

如需在你的应用中集成 GooglePlay 应用内评价，库版本必须使用 1.8.0：

```groovy
dependencies {
    //核心库
    implementation 'com.google.android.play:core:1.8.0'
    //项目使用了 Kotlin 可以集成
    implementation 'com.google.android.play:core-ktx:1.8.0'
}
```

或者更高版本的[Play Core 库](https://developer.android.com/guide/playcore?hl=zh-cn)，目前最新版本如下：

```groovy
dependencies {
    //核心库
    implementation 'com.google.android.play:review:2.0.1'
    //项目使用了 Kotlin 可以集成
    implementation 'com.google.android.play:review-ktx:2.0.1'
}
```

### 1.3、集成 GooglePlay 应用内评价

#### 1.3.1、添加 Gradle 远程依赖

在 app 的 build.gradle 中添加如下依赖：

```groovy
//核心库
implementation 'com.google.android.play:review:2.0.1'
//项目使用了 Kotlin 可以集成
implementation 'com.google.android.play:review-ktx:2.0.1'
```

#### 1.3.2、初始化 GooglePlay 应用内评价

```java
/**
  * 初始化 GooglePlay 应用内评价
  */
fun initInnerReview(){
   //1、通过 ReviewManagerFactory 创建 ReviewManager 对象，用于启动应用内评价的流程
   manager = ReviewManagerFactory.create(MyApplication.getInstance())
   //2、获取 ReviewInfo 对象。当我们判断可以让用户进行评价时，使用 ReviewManager 创建一个请求，
   //用于真正启动应用内评价流程。这里我们可以先缓存好 ReviewInfo 对象。
   val request = manager?.requestReviewFlow()
   request?.addOnCompleteListener {
      if(it.isSuccessful){
          reviewInfo = it.result
          Log.d("erdai", "init: get reviewInfo sucess")
      }else{
          Log.d("erdai", "init: get reviewInfo failed")
      }
   }
}
```

#### 1.3.3、启动 GooglePlay 应用内评价

```java
/**
  * 启动应用内评价
  *
  * @param activity 当前 Activity
  */
fun innerReview(activity: Activity){
  //调用 launchReviewFlow 来启动评价流程，剩下的事情就交给 Google 了
  reviewInfo?.apply {
    val flow = manager?.launchReviewFlow(activity, this)
    flow?.addOnCompleteListener {
        if(it.isSuccessful){
            Log.d("erdai", "innerReview: launchReviewFlow success")
        }else{
            Log.d("erdai", "innerReview: launchReviewFlow failed")
        }
    }
  }
}
```

#### 1.3.4、完整代码

我们可以将 GooglePlay 应用内评价的代码进行封装，放到一个单例里面：

```kotlin
/**
 * function: GooglePlay 应用内 app 辅助类
 */
object GooglePlayInnerAppHelper {

    /**
     * ReviewInfo 对象
     */
    var reviewInfo: ReviewInfo? = null

    /**
     * ReviewManager 对象
     */
    var manager: ReviewManager? = null

    /**
     * 初始化 GooglePlay 应用内评价
     */
    fun initInnerReview(){
        //1、通过 ReviewManagerFactory 创建 ReviewManager 对象，用于启动应用内评价的流程
        manager = ReviewManagerFactory.create(MyApplication.getInstance())
        //2、获取ReviewInfo对象。当我们判断可以让用户进行评价时，使用ReviewManager创建一个任务，
        //用于真正启动应用内评价流程。这里谷歌文档中建议提前一点缓存好 ReviewInfo 对象。
        val request = manager?.requestReviewFlow()
        request?.addOnCompleteListener {
            if(it.isSuccessful){
                reviewInfo = it.result
                Log.d("erdai", "init: get reviewInfo sucess")
            }else{
                Log.d("erdai", "init: get reviewInfo failed")
            }
        }
    }

    /**
     * 应用内评价
     *
     * @param activity 当前 Activity
     */
    fun innerReview(activity: Activity){
        //调用 launchReviewFlow 来启动评价流程，剩下的事情就交给 Google 了
        reviewInfo?.apply {
            val flow = manager?.launchReviewFlow(activity, this)
            flow?.addOnCompleteListener {
                if(it.isSuccessful){
                    Log.d("erdai", "innerReview: launchReviewFlow success")
                }else{
                    Log.d("erdai", "innerReview: launchReviewFlow failed")
                }
            }
        }
    }
}
```

在合适的时机，以我的为例子：

> 在 Application 的 onCreate 里面初始化 GooglePlay 应用内评价，然后在项目的首页启动 GooglePlay 应用内评价。

进行调用即可。

### 1.4、测试

上述集成代码比较简单，主要还是测试比较麻烦，测试的方式有多种，讲下我推荐的一种：

1、将你的应用打包成 .aab 格式的文件上传到 GooglePlay 的 Internal testing（内测）渠道：


![image-20230106152628078.png](https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261441119.png)

上传到  Internal testing 渠道的好处就是只要你没有进行评价，那么每次都会进行评价弹窗提示。Production（生产）渠道则不会。

2、将你的 GooglePlay 账号加入到内测渠道中，然后从 GooglePlay 商店中下载应用：


<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261441991.png" alt="image-20230106154045505.png" width="50%" />

可以看到，GooglePlay 商店会提示你是一个内测账号

**注意：** 这里不能使用受保护的用户账号（如企业账号），我当时就是使用了企业分配的 GooglePlay 账号导致一直弹不出评价弹窗。需要改用 Gmail 账号，后面使用私人的 Gmail 账号，就成功的弹出了评价弹窗。

3、保证你使用的 GooglePlay 账号没有评价过该应用，如果评价了也弹不出来

### 1.5、效果展示

如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261441147.gif" alt="ezgif.com-gif-maker.gif" width="30%" />

## 二、GooglePlay 应用内更新

### 2.1、设备要求

1、需 5.0 或更高版本的 Android 设备

2、 Android 设备安装了 Google Play 商店

### 2.2、Play Core 库要求

如需在你的应用中集成 GooglePlay 应用内评价，库版本必须使用 1.8.0：

```groovy
dependencies {
    //核心库
    implementation 'com.google.android.play:core:1.8.0'
    //项目使用了 Kotlin 可以集成
    implementation 'com.google.android.play:core-ktx:1.8.0'
}
```

或者更高版本的[Play Core 库](https://developer.android.com/guide/playcore?hl=zh-cn)，目前最新版本如下：

```groovy
dependencies {
    //核心库
    implementation 'com.google.android.play:app-update:2.0.1'
    //项目使用了 Kotlin 可以集成
    implementation 'com.google.android.play:app-update-ktx:2.0.1'
}
```

### 2.3、集成 GooglePlay 应用内更新

#### 2.3.1、添加 Gradle 远程依赖

在 app 的 build.gradle 中添加如下依赖：

```groovy
//核心库
implementation 'com.google.android.play:app-update:2.0.1'
//项目使用了 Kotlin 可以集成
implementation 'com.google.android.play:app-update-ktx:2.0.1'
```

#### 2.3.2、启动应用内更新

GooglePlay 应用内更新方式有两种：

1、立即更新

2、灵活更新

##### 2.3.2.1、立即更新

立即更新你也可以理解为强制更新，它会打断用户与 app 的交互，弹出一个新的页面提示你升级

代码实现：

```kotlin
/**
  * 应用内强制更新
  */
fun innerAppForceUpdate(activity: Activity) {
    val appUpdateManager = AppUpdateManagerFactory.create(MyApplication.getInstance())
    appUpdateManager.appUpdateInfo.addOnSuccessListener {
        if (it.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE && 
           it.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
            //启动强制更新
            appUpdateManager.startUpdateFlowForResult(it,
                AppUpdateType.IMMEDIATE,
                activity,
                UPDATE_REQUEST_CODE)
         }
    }
}
```

##### 2.3.2.2、灵活更新

灵活更新不会打断用户与 app 的交互，它是在后台静默下载新版本，等下在完了在提示更新

代码实现：

```kotlin
/**
 * 应用内灵活更新
 */
fun innerAppSmartUpdate(activity: Activity) {
    val appUpdateManager = AppUpdateManagerFactory.create(MyApplication.getInstance())
    appUpdateManager.appUpdateInfo.addOnSuccessListener {
        if (it.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE && 
            it.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
            //灵活更新
            val installListener = object : InstallStateUpdatedListener {
                override fun onStateUpdate(installState: InstallState) {
                    if(installState.installStatus() == InstallStatus.DOWNLOADING){
                      	//下载中，我们可以在此获取进度给用户进行提示
                      	//已下载文件字节大小
                				val bytesDownloaded = installState.bytesDownloaded()
                				//文件总的字节大小
                				val totalBytesToDownload = installState.totalBytesToDownload()
                      	//todo 对于户进行下载进度提示
                      	
                    } else if (installState.installStatus() == InstallStatus.DOWNLOADED) {
                        //通知用户更新已下载完毕，重启以安装应用
                        appUpdateManager.unregisterListener(this)
                        appUpdateManager.completeUpdate()
                    }
                }
            }
            appUpdateManager.registerListener(installListener)
            appUpdateManager.startUpdateFlowForResult(it,
                AppUpdateType.FLEXIBLE,
                activity,
                UPDATE_REQUEST_CODE)
        }
    }
}
```

#### 2.3.3、完整代码

同样的，我们可以对其进行封装，放到一个单例里面：

```kotlin
/**
 * function: GooglePlay 应用内 app 辅助类
 */
object GooglePlayInnerAppHelper {
    
    const val UPDATE_REQUEST_CODE: Int = 0x001

    /**
     * 应用内强制更新
     */
    fun innerAppForceUpdate(activity: Activity) {
        val appUpdateManager = AppUpdateManagerFactory.create(MyApplication.getInstance())
        appUpdateManager.appUpdateInfo.addOnSuccessListener {
            if (it.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE && it.isUpdateTypeAllowed(
                    AppUpdateType.IMMEDIATE)
            ) {
                //强制更新
                appUpdateManager.startUpdateFlowForResult(it,
                    AppUpdateType.IMMEDIATE,
                    activity,
                    UPDATE_REQUEST_CODE)
            }
        }
    }

    /**
     * 应用内灵活更新
     */
    fun innerAppSmartUpdate(activity: Activity) {
        val appUpdateManager = AppUpdateManagerFactory.create(MyApplication.getInstance())
        appUpdateManager.appUpdateInfo.addOnSuccessListener {
            if (it.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                it.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                //灵活更新
                val installListener = object : InstallStateUpdatedListener {
                    override fun onStateUpdate(installState: InstallState) {
                        if(installState.installStatus() == InstallStatus.DOWNLOADING){
                            //下载中，我们可以在此获取进度给用户进行提示
                            //已下载文件字节大小
                            val bytesDownloaded = installState.bytesDownloaded()
                            //文件总的字节大小
                            val totalBytesToDownload = installState.totalBytesToDownload()
                            //todo 对于户进行下载进度提示

                        } else if (installState.installStatus() == InstallStatus.DOWNLOADED) {
                            //通知用户更新已下载完毕，重启以安装应用
                            appUpdateManager.unregisterListener(this)
                            appUpdateManager.completeUpdate()
                        }
                    }
                }
                appUpdateManager.registerListener(installListener)
                appUpdateManager.startUpdateFlowForResult(it,
                    AppUpdateType.FLEXIBLE,
                    activity,
                    UPDATE_REQUEST_CODE)
            }
        }
    }
}
```

在合适的时机，以我的为例子，立即更新和灵活更新结合使用：

> 根据后台下发配置，判断是使用立即更新还是灵活更新

### 2.4、测试

我们需要做以下三步：

1、打包高版本 .aab 格式的文件上传到 GooglePlay 的 Internal testing（内测）渠道，将 GooglePlay 账号，添加到内测渠道

**注意：** 此时无受保护的用户账号要求，因此这里你可以使用企业账号

2、确保你目前使用的账号至少从 GooglePlay 下载过一次应用，因为只有拥有应用的用户帐号才可以使用应用内更新

3、还原到低版本，使用 AndroidStudio 编译打包即可

### 2.5、效果展示

#### 2.5.1、后台下发配置立即更新

如下图：

<img src="https://raw.githubusercontent.com/sweetying520/picgo/master/img/202309261441491.gif" alt="force_update.gif" width="30%" />

立即更新给我们新开了一个页面进行下载，等待下载完成会自动给你更新并重启应用。

#### 2.5.2、后台下发配置灵活更新

如下图：

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b60edcf4b299437890de09ceef15f1ad~tplv-k3u1fbpfcp-watermark.image?" alt="smart_update.gif" width="30%" />

灵活更新会在后台静默下载，等下载完成会自动给你更新并重启应用。

## 三、总结

本篇文章我们介绍了：

1、GooglePlay 应用内评价

2、GooglePlay 应用内更新

两者集成过程比较简单，主要就是测试效果比较麻烦，按照我文中的步骤，问题不大。

好了，本篇文章到这里就结束了，希望能给你带来帮助 🤝

**感谢你阅读这篇文章**

### 参考和推荐

[GooglePlay 应用内评价官方文档](https://developer.android.com/guide/playcore/in-app-review?hl=zh-cn)

[GooglePlay 应用内更新官方文档](https://developer.android.com/guide/playcore/in-app-updates?hl=zh-cn&from_wecom=1)

> **你的点赞，评论，是对我巨大的鼓励！**
>
> 欢迎关注我的**公众号：**  [**sweetying**](https://link.juejin.cn/?target=http%3A%2F%2Fm6z.cn%2F6jwi7b "http://m6z.cn/6jwi7b") ，文章更新可第一时间收到
>
> 如果**有问题**，公众号内有加我微信的入口，在技术学习、个人成长的道路上，我们一起前进！
