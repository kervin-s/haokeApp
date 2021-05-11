;(function(){
	var calc = function(){
		var docElement = document.documentElement;
		var clientWidthValue = docElement.clientWidth
		docElement.style.fontSize = 20*(clientWidthValue/375) + 'px';
	}
	calc();
	window.addEventListener('resize',calc);
})();
