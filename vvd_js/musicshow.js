!(function() {
  function show() {
    if(!isMobile()){
       //如果是 PC 端
       if (location.href === "https://sweetying520.github.io/"){
            //简单判断首页，因为我的域名是https://sweetying520.github.io，所以首页就会触发
            //直接把音乐框隐藏
       		$("#music_div").attr("style","display:none;");
            //滚动条事件
       		$(window).scroll(function(){
       			//获取滚动条的滑动距离
       			var scroH = $(this).scrollTop();
       			//滚动条的滑动距离大于120，就显示，反之就隐藏
       			if(scroH >= 120){
       				$("#music_div").attr("style","display:block;position:fixed;z-index:10000;bottom:350px;left:0px;");
       			}else if(scroH < 120){
       				$("#music_div").attr("style","display:none;");
       			}
       		 })
       	}
    }else{
        //直接把音乐框隐藏
        $("#music_div").attr("style","display:none;");
    }
  }

  // 判断浏览器函数
  function isMobile(){
   if(window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
    return true; // 移动端
   }else{
    return false; // PC端
   }
  }

  show();
})();

