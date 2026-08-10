const PLAYLIST_ID="PLbQmWBgY2m1pTsKGnmvM703Ijl8zAKK1c";
let player=null,ready=false,repeat=false,shuffle=false,timer=null;
const $=x=>document.getElementById(x);
const fmt=s=>{if(!Number.isFinite(s))return"--:--";s=Math.floor(Math.max(0,s));return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`};
function tick(){ $("clock").textContent=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); } tick();setInterval(tick,1000);

window.onYouTubeIframeAPIReady=()=>{player=new YT.Player("yt",{width:"1",height:"1",playerVars:{listType:"playlist",list:PLAYLIST_ID,controls:0,playsinline:1,rel:0},events:{onReady:e=>{ready=true;e.target.cuePlaylist({listType:"playlist",list:PLAYLIST_ID})},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING)meta();if(e.data===YT.PlayerState.ENDED&&repeat)player.playVideo()}}})};
function meta(){if(!ready)return;let d=player.getVideoData?.()||{};$("title").textContent=d.title||"राजू मिस्त्री प्लेलिस्ट";$("artist").textContent=d.author||"YouTube Music"}
setInterval(()=>{if(!ready)return;let t=player.getCurrentTime()||0,d=player.getDuration()||0;$("cur").textContent=fmt(t);$("dur").textContent=fmt(d);$("seek").value=d?t/d*100:0;$("play").textContent=player.getPlayerState()===YT.PlayerState.PLAYING?"❚❚":"▶";meta()},500);

$("play").onclick=()=>{if(!ready)return;player.getPlayerState()===YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo()};
$("next").onclick=()=>{if(ready)shuffle?player.playVideoAt(Math.floor(Math.random()*(player.getPlaylist()?.length||1))):player.nextVideo()};
$("prev").onclick=()=>{if(ready)player.previousVideo()};
$("shuffle").onclick=()=>{$("shuffle").classList.toggle("on",shuffle=!shuffle);if(ready)player.setShuffle(shuffle)};
$("repeat").onclick=()=>{$("repeat").classList.toggle("on",repeat=!repeat)};
$("seek").oninput=e=>{if(ready)player.seekTo((player.getDuration()||0)*e.target.value/100,true)};
$("like").onclick=()=>{$("like").classList.toggle("active");$("like").textContent=$("like").classList.contains("active")?"♥":"♡"};
$("timer").onclick=()=>{$("timerBox").classList.toggle("open")};
document.querySelectorAll(".timer-options button").forEach(b=>b.onclick=()=>{let m=+b.dataset.min;if(timer)clearTimeout(timer);if(!m){$("timerStatus").textContent="Timer off";return}$("timerStatus").textContent=`Music ${m} min baad stop hogi`;timer=setTimeout(()=>{if(ready)player.pauseVideo();$("timerStatus").textContent="Music stopped"},m*60000)});
$("playlist").onclick=()=>{if(ready){let ids=player.getPlaylist?.()||[];alert(ids.length?`Playlist connected • ${ids.length} tracks`:"Playlist loading…")}};
