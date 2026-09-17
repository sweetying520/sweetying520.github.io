---
title: coroutine
date: 2022-09-13 10:29:25
tags:
---

源代码：

```kotlin
class CoroutineActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_coroutine)

        startCoroutine()
    }

    private fun startCoroutine() {
        val funTest: suspend CoroutineScope.() -> Unit = {
            println("funTest")
            suspendFun1()
            suspendFun2()
        }

        GlobalScope.launch(Dispatchers.Default, block = funTest)
    }

    suspend fun suspendFun1(){
        println("suspendFun1")
    }

    suspend fun suspendFun2(){
        println("suspendFun2")
    }
}
```

反编译后的代码：

```java
public final class CoroutineActivity extends AppCompatActivity {
   protected void onCreate(@Nullable Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      this.setContentView(1300001);
      this.startCoroutine();
   }

   private final void startCoroutine() {
      Function2 funTest = (Function2)(new Function2((Continuation)null) {
        //当前状态机：默认为 0
         int label;

         //协程体被转换成 invokeSuspend 函数的调用
         @Nullable
         public final Object invokeSuspend(@NotNull Object $result) {
            Object var3 = IntrinsicsKt.getCOROUTINE_SUSPENDED();
            CoroutineActivity var10000;
            switch(this.label) {
            case 0:
               ResultKt.throwOnFailure($result);
               String var2 = "funTest";
               System.out.println(var2);
               var10000 = CoroutineActivity.this;
               //状态机状态设置为 1
               this.label = 1;
               //suspendFun1 函数调用
               if (var10000.suspendFun1(this) == var3) {
                  return var3;
               }
               break;
            case 1:
               //异常处理
               ResultKt.throwOnFailure($result);
               break;
            case 2:
                //异常处理
               ResultKt.throwOnFailure($result);
               return Unit.INSTANCE;
            default:
               throw new IllegalStateException("call to 'resume' before 'invoke' with coroutine");
            }

            var10000 = CoroutineActivity.this;
           	//状态机状态设置为 2
            this.label = 2;
           	//suspendFun2 函数调用
            if (var10000.suspendFun2(this) == var3) {
               return var3;
            } else {
               return Unit.INSTANCE;
            }
         }

         //创建 Continuation
         @NotNull 
         public final Continuation create(@Nullable Object value, @NotNull Continuation completion) {
            Intrinsics.checkNotNullParameter(completion, "completion");
            Function2 var3 = new <anonymous constructor>(completion);
            return var3;
         }
				
         //实际是调用 invokeSuspend
         public final Object invoke(Object var1, Object var2) {
            return ((<undefinedtype>)this.create(var1, (Continuation)var2)).invokeSuspend(Unit.INSTANCE);
         }
      });
      BuildersKt.launch$default((CoroutineScope)GlobalScope.INSTANCE, (CoroutineContext)Dispatchers.getDefault(), (CoroutineStart)null, funTest, 2, (Object)null);
   }

   @Nullable
   public final Object suspendFun1(@NotNull Continuation $completion) {
      String var2 = "suspendFun1";
      System.out.println(var2);
      return Unit.INSTANCE;
   }

   @Nullable
   public final Object suspendFun2(@NotNull Continuation $completion) {
      String var2 = "suspendFun2";
      System.out.println(var2);
      return Unit.INSTANCE;
   }
}
```

上述代码：

1、funTest 协程体两个重要方法：

> invokeSuspend
>
> create

2、suspendFun1，suspendFun2 方法多了一个 Contination 参数，这也是普通函数无法调起挂机函数的原因



