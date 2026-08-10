const PLAYLIST_ID="PLbQmWBgY2m1pTsKGnmvM703Ijl8zAKK1c";
let player=null,ready=false,repeat=false,shuffle=false,timer=null;
const $=id=>document.getElementById(id);
const fmt=s=>{if(!Number.isFinite(s))return"--:--";s=Math.floor(Math.max(0,s));return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`};

function clock(){ $("clock").textContent=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); }
clock();setInterval(clock,1000);

window.onYouTubeIframeAPIReady=()=>{
  player=new YT.Player("ytPlayer",{
    width:"1",height:"1",
    playerVars:{listType:"playlist",list:PLAYLIST_ID,controls:0,playsinline:1,rel:0},
    events:{
      onReady:e=>{ready=true;e.target.cuePlaylist({listType:"playlist",list:PLAYLIST_ID});},
      onStateChange:e=>{
        if(e.data===YT.PlayerState.PLAYING) updateMeta();
        if(e.data===YT.PlayerState.ENDED&&repeat) player.playVideo();
        if(e.data===YT.PlayerState.CUED) updateMeta();
      }
    }
  });
};

function updateMeta(){
  if(!ready)return;
  const d=player.getVideoData?.()||{};
  $("songTitle").textContent=d.title||"राजू मिस्त्री प्लेलिस्ट";
  $("artist").textContent=d.author||"YouTube Music";
  renderPlaylist(false);
}

setInterval(()=>{
  if(!ready)return;
  const t=player.getCurrentTime()||0,d=player.getDuration()||0;
  $("currentTime").textContent=fmt(t);
  $("duration").textContent=fmt(d);
  $("seek").value=d?(t/d)*100:0;
  $("playBtn").textContent=player.getPlayerState()===YT.PlayerState.PLAYING?"❚❚":"▶";
},500);

$("playBtn").onclick=()=>{if(!ready)return;player.getPlayerState()===YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo()};
$("nextBtn").onclick=()=>{if(ready){shuffle?player.playVideoAt(Math.floor(Math.random()*(player.getPlaylist()?.length||1))):player.nextVideo();setTimeout(updateMeta,350)}};
$("prevBtn").onclick=()=>{if(ready){player.previousVideo();setTimeout(updateMeta,350)}};
$("shuffleBtn").onclick=()=>{$("shuffleBtn").classList.toggle("on",shuffle=!shuffle);if(ready)player.setShuffle(shuffle)};
$("repeatBtn").onclick=()=>{$("repeatBtn").classList.toggle("on",repeat=!repeat)};
$("seek").oninput=e=>{if(ready)player.seekTo((player.getDuration()||0)*e.target.value/100,true)};
$("likeBtn").onclick=()=>{$("likeBtn").classList.toggle("active");$("likeBtn").textContent=$("likeBtn").classList.contains("active")?"♥":"♡"};

$("timerBtn").onclick=()=>$("timerBox").classList.toggle("open");
document.querySelectorAll(".timer-options button").forEach(b=>b.onclick=()=>{
  const m=Number(b.dataset.min);
  if(timer)clearTimeout(timer);
  if(!m){$("timerStatus").textContent="Timer off";return}
  $("timerStatus").textContent=`Music ${m} min baad stop hogi`;
  timer=setTimeout(()=>{if(ready)player.pauseVideo();$("timerStatus").textContent="Music stopped"},m*60000);
});

const sheet=$("playlistSheet");
$("playlistBtn").onclick=()=>{sheet.classList.add("open");sheet.setAttribute("aria-hidden","false");renderPlaylist(true)};
$("closePlaylist").onclick=()=>{sheet.classList.remove("open");sheet.setAttribute("aria-hidden","true")};

function renderPlaylist(force){
  if(!ready)return;
  const ids=player.getPlaylist?.()||[];
  $("playlistCount").textContent=ids.length?`${ids.length} tracks`:"Loading playlist…";
  if(!ids.length){
    $("playlistItems").innerHTML='<div class="p-item"><div class="p-info"><div class="p-title">Playlist loading…</div></div></div>';
    return;
  }
  const current=player.getPlaylistIndex?.()??-1;
  $("playlistItems").innerHTML=ids.map((id,i)=>`
    <div class="p-item ${i===current?"current":""}" data-index="${i}">
      <div class="p-num">${String(i+1).padStart(2,"0")}</div>
      <div class="p-info"><div class="p-title">Track ${i+1}</div><div class="p-sub">YouTube</div></div>
      <div class="p-play">${i===current?"▶":"›"}</div>
    </div>`).join("");
  document.querySelectorAll(".p-item[data-index]").forEach(item=>{
    item.onclick=()=>{
      player.playVideoAt(Number(item.dataset.index));
      sheet.classList.remove("open");
      sheet.setAttribute("aria-hidden","true");
      setTimeout(updateMeta,400);
    };
  });
}
