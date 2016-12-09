(function(){
	$(document).ready(function(){

		var players = window.janus_players = {};
		
		players.player1 = videojs('video_src_1');
		players.player2 = videojs('video_src_2');
		players.active = players.player1;
		
		
		$('a.video_start').click(function(e){
			$.each(players, function(index){
				this.play();
				console.log("PLAY: ",index);
			});
		});
		$('a.video_stop').click(function(e){
			$.each(players, function(index){
				this.pause();
				console.log("PAUSE: ",index);
			});
		});
		
		
		$('a.janus_switch').on('mousedown mouseup', function mouseState(e) {
		    if (e.type == "mousedown") {
		        //code triggers on hold
		        console.log("hold");
		        players.active = players.player2;
		        updateActiveVideoState();
		    }
		    else if(e.type == "mouseup"){
		    	console.log("let go");
		    	players.active = players.player1;
		    	updateActiveVideoState();
		    }
		});
		

		$('a.janus_start').click(function(e){
			$.each(players, function(index){
				this.play();
				console.log("PLAY: ", index);
			});
			CrossfadeSample.play();
			CrossfadeSample.playing = true;
			CrossfadeSample.panToLeft();
		});
		
		$('a.janus_stop').click(function(e){
			$.each(players, function(index){
				this.pause();
				console.log("PAUSE: ", index);
			});
			CrossfadeSample.stop();
			CrossfadeSample.playing = false;
		});
		
		
		var updateActiveVideoState = function(){
			$(players.player1.el()).parent().removeClass('active');
			$(players.player2.el()).parent().removeClass('active');
			$(players.active.el()).parent().addClass('active');
			
			if( $(players.active.el()).attr('id').indexOf('video_src_1') > -1 ){
				CrossfadeSample.panToLeft();
			}
			else{
				CrossfadeSample.panToRight();
			}
		};
		
		// initial setup::
		updateActiveVideoState();
	});
})();