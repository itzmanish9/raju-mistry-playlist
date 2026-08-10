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
const sheet=$("playlistSheet"), items=$("playlistItems"), count=$("playlistCount");
$("playlist").onclick=()=>{sheet.classList.add("open"); renderPlaylist();};
$("closeSheet").onclick=()=>sheet.classList.remove("open");

function renderPlaylist(){
  if(!ready){
    items.innerHTML='<div class="p-item"><div class="p-info"><div class="p-title">Playlist loading…</div><div class="p-sub">Please wait</div></div></div>';
    return;
  }
  const ids=player.getPlaylist?.()||[];
  count.textContent=ids.length?`${ids.length} tracks`:"Playlist loading…";
  if(!ids.length){
    items.innerHTML='<div class="p-item"><div class="p-info"><div class="p-title">No tracks loaded yet</div><div class="p-sub">Try again in a moment</div></div></div>';
    return;
  }
  const current=player.getPlaylistIndex?.() ?? -1;
  items.innerHTML=ids.map((id,i)=>`
    <div class="p-item ${i===current?"current":""}" data-index="${i}">
      <div class="p-num">${String(i+1).padStart(2,"0")}</div>
      <div class="p-info">
        <div class="p-title">Track ${i+1}</div>
        <div class="p-sub">Tap to play</div>
      </div>
      <div class="p-play">${i===current?"▶":"›"}</div>
    </div>`).join("");
  items.querySelectorAll(".p-item").forEach(item=>{
    item.onclick=()=>{
      const i=Number(item.dataset.index);
      player.playVideoAt(i);
      sheet.classList.remove("open");
      setTimeout(meta,250);
      setTimeout(renderPlaylist,450);
    };
  });
}

