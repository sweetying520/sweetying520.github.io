---
title: Flutter 系列（十）：手撸 GetX 状态管理核心源码实现
date: 2022-11-20 16:54:26
author: sweetying
tags: 
- 原创
- Flutter
categories:
- Flutter
---

## 一、依赖注入管理核心源码实现

```dart
class Mobx{
  static S put<S>(S dependency,{String? tag}){
    return MobxInstance().put<S>(dependency,tag: tag);
  }

  static S find<S>({String? tag}){
    return MobxInstance().find<S>(tag: tag);
  }

  static bool delete<S>({String? tag}){
    return MobxInstance().delete<S>(tag: tag);
  }
}

class _InstanceBuilderFactory<T>{

  T dependency;

  _InstanceBuilderFactory(this.dependency);
}

class MobxInstance{
  static MobxInstance? instance;

  MobxInstance._();

  factory MobxInstance() => instance ??= MobxInstance._();

  final _single = <String,_InstanceBuilderFactory>{};

  String _getKey(Type type,String? tag){
    return tag == null ? type.toString() : type.toString() + tag;
  }

  S put<S>(S dependency,{String? tag}){
    final newKey = _getKey(S, tag);
    _single.putIfAbsent(newKey, () => _InstanceBuilderFactory(dependency));
    return find<S>(tag: tag);
  }

  S find<S>({String? tag}){
    final newKey = _getKey(S, tag);
    if(_single.containsKey(newKey)){
      return _single[newKey]!.dependency;
    }
    throw '"$newKey" not found';
  }

  bool delete<S>({String? tag}){
    final newKey = _getKey(S, tag);
    if(_single.containsKey(newKey)){
      _single.remove(newKey);
      print('"$newKey" removed success');
      return true;
    }
    print('"$newKey" Already removed');
    return false;
  }
}
```

## 二、GetBuilder + Controller.update 核心源码实现

```dart
typedef MobXCallback = void Function();
//监听器
mixin MobxNotifier{
  final _updaters = <MobXCallback>[];
  final _updatersGroupIds = <Object?,List<MobXCallback>>{};

  void notifyUpdate(){
    if(_updaters.isNotEmpty){
      for (var element in _updaters) {
        element();
      }
    }
  }

  void notifyIdUpdate(Object? id){
    if(_updatersGroupIds.isEmpty)return;

    if(_updatersGroupIds.containsKey(id)){
      var listGroup = _updatersGroupIds[id];
      listGroup?.forEach((element) {
        element();
      });
    }
  }

  void removeListener(MobXCallback callback){
    if(_updaters.contains(callback)){
      _updaters.remove(callback);
    }
  }

  void removeListenerId(Object? id,MobXCallback callback){
    if(_updatersGroupIds.containsKey(id)){
      _updatersGroupIds[id]?.remove(callback);
    }
    _updaters.remove(callback);
  }

  void addListener(MobXCallback callback){
    _updaters.add(callback);
  }

  void addListenerId(Object? id,MobXCallback callback){
    _updatersGroupIds[id] ??= <MobXCallback>[];
    _updatersGroupIds[id]?.add(callback);
  }

  void dispose(){
    print('notifier dispose');
    _updaters.clear();
    _updatersGroupIds.clear();
  }
}
//Controller 基类
class MobxController with MobxNotifier {
  void update([List<Object>? ids]) {
    if (ids == null) {
      notifyUpdate();
    } else {
      for (var element in ids) {
        notifyIdUpdate(element);
      }
    }
  }
}

typedef MobControllerBuilder<T extends MobxController> = Widget Function(T controller);
//MobxBuilder
class MobxBuilder<T extends MobxController> extends StatefulWidget {
  final MobControllerBuilder<T> builder;
  final Object? id;
  final String? tag;
  final bool autoRemove;

  const MobxBuilder({Key? key, required this.builder, this.id, this.tag, this.autoRemove = true}) : super(key: key);

  @override
  State<MobxBuilder> createState() => _MobxBuilderState<T>();
}

class _MobxBuilderState<T extends MobxController> extends State<MobxBuilder<T>> {

  late T controller;

  @override
  void initState() {
    super.initState();

    controller = MobxInstance().find<T>(tag: widget.tag);
    if(widget.id == null){
      controller.addListener(() {
        if(mounted){
          setState(() {

          });
        }
      });
    }else{
      controller.addListenerId(widget.id, () {
        if(mounted){
          setState(() {

          });
        }
      });
    }
  }

  @override
  void dispose() {
    if(widget.autoRemove){
      MobxInstance().delete(tag: widget.tag);
    }
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.builder(controller);
  }
}
```

## 三、 Obx + obs 核心源码实现

```dart
import 'package:flutter/material.dart';

typedef MyVoidCallback = void Function();
typedef MyValueGetter<T> = T Function();

class MyRxObservable{

  final listeners = <MyVoidCallback>[];


  void add(MyVoidCallback listener) => listeners.add(listener);

  void remove(MyVoidCallback listener) => listeners.remove(listener);

  void notify(){
    for (var value in listeners) {
      value();
    }
  }

  void dispose(){
    listeners.clear();
  }
}

class MyRxNotifier{

  static MyRxNotifier? proxy;

  final myRxObservable = MyRxObservable();
  final map = <MyRxObservable,String>{};

  bool get canUpdate => map.isNotEmpty;

  void addListener(MyRxObservable observable){
    if(!map.containsKey(observable)){
      observable.add(() {
        myRxObservable.notify();
      });
      map[observable] = '';
    }
  }

  static T notifyChildren<T>(MyRxNotifier myRxNotifier,MyValueGetter<T> builder){
    final _observer = MyRxNotifier.proxy;
    MyRxNotifier.proxy = myRxNotifier;
    final result = builder();
    if(!myRxNotifier.canUpdate){
      MyRxNotifier.proxy = _observer;
      throw 'nofityChildren error exception';
    }
    MyRxNotifier.proxy = _observer;
    return result;
  }

}

abstract class MyRx<T>{

  MyRxObservable myRxObservable = MyRxObservable();

  bool firstRebuild = true;

  T _value;

  MyRx(this._value);

  set value(T value){
    if(_value == value && !firstRebuild)return;
    firstRebuild = false;
    _value = value;

    myRxObservable.notify();
  }

  T get value{
    MyRxNotifier.proxy?.addListener(myRxObservable);
    return _value;
  }
}

class MyRxInt extends MyRx<int>{

  MyRxInt(int value) : super(value);

  MyRxInt operator +(int num){
    value = value + num;
    return this;
  }

  MyRxInt operator -(int num){
    value = value - num;
    return this;
  }
}

extension MyIntExtension on int{
  MyRxInt get mbx => MyRxInt(this);
}


class Mbx extends StatefulWidget {

  final MyValueGetter<Widget> builder;

  const Mbx(this.builder,{Key? key}) : super(key: key);

  @override
  State<Mbx> createState() => _MbxState();
}

class _MbxState extends State<Mbx> {

  MyRxNotifier myRxNotifier = MyRxNotifier();

  @override
  void initState() {
    super.initState();

    myRxNotifier.myRxObservable.add(() {
      if(mounted){
        setState(() {

        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MyRxNotifier.notifyChildren(myRxNotifier, widget.builder);
  }
}

class MyEasyBindWidget extends StatefulWidget {
  const MyEasyBindWidget(
      {Key? key,
      this.bind,
      this.tag,
      this.binds,
      this.tags,
      required this.child})
      : super(key: key);

  final Object? bind;
  final String? tag;

  final List<Object>? binds;
  final List<String>? tags;

  final Widget child;

  @override
  State<MyEasyBindWidget> createState() => _MyEasyBindWidgetState();
}

class _MyEasyBindWidgetState extends State<MyEasyBindWidget> {
  @override
  Widget build(BuildContext context) {
    return widget.child;
  }

  @override
  void dispose() {
    _closeController();
    _closeControllers();
    super.dispose();
  }

  void _closeController() {
    if(widget.bind == null){
      return;
    }

    var key = widget.bind.runtimeType.toString() + (widget.tag ?? '');
    MyEasy.delete(key: key);
  }

  void _closeControllers() {
    if(widget.binds == null){
      return;
    }

    for(int i = 0; i < widget.binds!.length; i++){
      var type = widget.binds![i].runtimeType.toString();
      if(widget.tags == null || widget.tags?.isEmpty == true){
        MyEasy.delete(key: type);
      }else{
        var key = type + (widget.tags![i]);
        MyEasy.delete(key: key);
      }
    }
  }
}
```

## 四、效果验证

## 五、总结