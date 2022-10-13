!(function() {
  function show() {
    if(isPC()){
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
       				$("#music_div").attr("style","display:block;position:fixed;z-index:100;bottom:0px;left:30px;");
       			}else if(scroH < 120){
       				$("#music_div").attr("style","display:none;");
       			}
       		 })
       	}
    }
  }

  /*是否是 PC 端*/
  function isPC() {
     var userAgentInfo = navigator.userAgent;
     var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
     var flag = true;
     for (var v = 0; v < Agents.length; v++) {
         if (userAgentInfo.indexOf(Agents[v]) > 0) {
              flag = false;
              break;
         }
     }
     return flag;
  }

  show();
})();

