const PLAYLIST_ID = "PLbQmWBgY2m1pTsKGnmvM703Ijl8zAKK1c";

const $ = (id) => document.getElementById(id);
const artwork = $("artwork");
const backdrop = $("backdrop");
const playBtn = $("playBtn");
const progress = $("progress");
const currentTimeEl = $("currentTime");
const durationEl = $("duration");
const trackTitle = $("trackTitle");
const trackArtist = $("trackArtist");
const playlistList = $("playlistList");
const playlistPanel = $("playlistPanel");
const timerPanel = $("timerPanel");
const timerStatus = $("timerStatus");

let player = null;
let ready = false;
let isShuffle = false;
let isRepeat = false;
let timerId = null;

function fmt(seconds){
  if(!Number.isFinite(seconds)) return "--:--";
  seconds = Math.max(0, Math.floor(seconds));
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2,"0");
  return `${m}:${s}`;
}

function updateClock(){
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString("en-IN",{
    hour:"2-digit", minute:"2-digit", hour12:true
  });
}
updateClock();
setInterval(updateClock, 1000);

async function randomAnime(){
  artwork.classList.add("swap");
  try{
    const r = await fetch("https://api.waifu.pics/sfw/waifu", {cache:"no-store"});
    if(!r.ok) throw new Error("anime api failed");
    const data = await r.json();
    if(data.url){
      artwork.onload = () => artwork.classList.remove("swap");
      artwork.src = data.url;
      backdrop.style.backgroundImage = `url("${data.url}")`;
      return;
    }
  }catch(e){}
  artwork.src = "https://placehold.co/900x900/111318/ffffff?text=Anime";
  backdrop.style.backgroundImage = "url('https://placehold.co/900x900/111318/ffffff?text=Anime')";
  artwork.classList.remove("swap");
}

function changeAnimeOnTrack(){
  randomAnime();
}

function syncPlayer(){
  if(!ready) return;
  const state = player.getPlayerState();
  playBtn.textContent = state === YT.PlayerState.PLAYING ? "❚❚" : "▶";
  const t = player.getCurrentTime() || 0;
  const d = player.getDuration() || 0;
  currentTimeEl.textContent = fmt(t);
  durationEl.textContent = fmt(d);
  progress.value = d ? (t/d)*100 : 0;
  if(state === YT.PlayerState.PLAYING) changeAnimeOnTrack();
}

function onYouTubeReady(){
  player = new YT.Player("ytPlayer",{
    height:"1", width:"1",
    playerVars:{
      listType:"playlist",
      list:PLAYLIST_ID,
      autoplay:0,
      controls:0,
      playsinline:1,
      rel:0
    },
    events:{
      onReady: (e) => {
        ready = true;
        e.target.cuePlaylist({listType:"playlist", list:PLAYLIST_ID});
        randomAnime();
        renderPlaylist();
      },
      onStateChange: (e) => {
        if(e.data === YT.PlayerState.PLAYING) playBtn.textContent = "❚❚";
        else playBtn.textContent = "▶";
        if(e.data === YT.PlayerState.PLAYING) changeAnimeOnTrack();
        if(e.data === YT.PlayerState.ENDED && isRepeat) player.playVideo();
      }
    }
  });
}
window.onYouTubeIframeAPIReady = onYouTubeReady;

function playPause(){
  if(!ready) return;
  const state = player.getPlayerState();
  if(state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
}

$("playBtn").addEventListener("click", playPause);

$("nextBtn").addEventListener("click",()=>{
  if(!ready) return;
  changeAnimeOnTrack();
  if(isShuffle){
    const n = Math.max(1, player.getPlaylist()?.length || 1);
    player.playVideoAt(Math.floor(Math.random()*n));
  }else player.nextVideo();
});

$("prevBtn").addEventListener("click",()=>{
  if(!ready) return;
  changeAnimeOnTrack();
  player.previousVideo();
});

$("shuffleBtn").addEventListener("click",()=>{
  isShuffle = !isShuffle;
  $("shuffleBtn").classList.toggle("active",isShuffle);
  if(ready) player.setShuffle(isShuffle);
});

$("repeatBtn").addEventListener("click",()=>{
  isRepeat = !isRepeat;
  $("repeatBtn").classList.toggle("active",isRepeat);
});

progress.addEventListener("input",()=>{
  if(!ready) return;
  const d = player.getDuration() || 0;
  player.seekTo((Number(progress.value)/100)*d,true);
});

setInterval(syncPlayer, 500);

function renderPlaylist(){
  if(!ready) return;
  const ids = player.getPlaylist?.() || [];
  if(!ids.length){
    playlistList.innerHTML = '<div class="empty">Playlist load hone ke baad songs yahan dikhenge.</div>';
    return;
  }
  playlistList.innerHTML = ids.map((id,i)=>`
    <div class="song" data-index="${i}">
      <span class="song-num">${String(i+1).padStart(2,"0")}</span>
      <div>
        <div class="song-title">Track ${i+1}</div>
        <div class="song-artist">YouTube Music</div>
      </div>
      <span class="song-duration">▶</span>
    </div>
  `).join("");
  playlistList.querySelectorAll(".song").forEach(el=>{
    el.addEventListener("click",()=>{
      player.playVideoAt(Number(el.dataset.index));
      changeAnimeOnTrack();
    });
  });
}

function togglePanel(panel, other){
  other.classList.remove("open");
  panel.classList.toggle("open");
}
$("playlistBtn").addEventListener("click",()=>togglePanel(playlistPanel,timerPanel));
$("queueBtn").addEventListener("click",()=>togglePanel(playlistPanel,timerPanel));
$("closePlaylist").addEventListener("click",()=>playlistPanel.classList.remove("open"));

$("timerBtn").addEventListener("click",()=>togglePanel(timerPanel,playlistPanel));
$("closeTimer").addEventListener("click",()=>timerPanel.classList.remove("open"));

$("likeBtn").addEventListener("click",()=>{
  $("likeBtn").classList.toggle("active");
  $("likeBtn").firstChild.textContent = $("likeBtn").classList.contains("active") ? "♥ " : "♡ ";
});

document.querySelectorAll(".timer-options button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const mins = Number(btn.dataset.min);
    if(timerId) clearTimeout(timerId);
    if(mins === 0){
      timerStatus.textContent = "Timer off";
      return;
    }
    timerStatus.textContent = `Music ${mins} min baad stop hogi`;
    timerId = setTimeout(()=>{
      if(ready) player.pauseVideo();
      timerStatus.textContent = "Music stopped";
    }, mins*60*1000);
  });
});

$("menuBtn").addEventListener("click",()=>{
  togglePanel(timerPanel,playlistPanel);
});
$("searchBtn").addEventListener("click",()=>{
  playlistPanel.classList.add("open");
  timerPanel.classList.remove("open");
  const input = document.querySelector(".playlist-list");
  if(input) input.scrollIntoView({behavior:"smooth",block:"nearest"});
});

randomAnime();
