(function(){
  var son=document.getElementById('son');
  var bouton=document.getElementById('jouer');
  var curseur=document.getElementById('curseur');
  var ecoule=document.getElementById('ecoule');
  var reste=document.getElementById('reste');
  var pictoPlay=document.getElementById('picto-play');
  var pictoPause=document.getElementById('picto-pause');
  var attrape=false;

  function mmss(s){
    s=Math.max(0,Math.round(s||0));
    var m=Math.floor(s/60), r=s%60;
    return m+':'+(r<10?'0':'')+r;
  }
  function duree(){
    return (son.duration && isFinite(son.duration)) ? son.duration : Number(son.dataset.sec||0);
  }
  function peindre(){
    var d=duree();
    var p=d>0?Math.min(1,son.currentTime/d):0;
    if(!attrape) curseur.value=String(Math.round(p*1000));
    curseur.style.setProperty('--part',(p*100).toFixed(2)+'%');
    ecoule.textContent=mmss(son.currentTime);
    reste.textContent=mmss(d);
  }
  function etat(joue){
    bouton.setAttribute('aria-pressed',joue?'true':'false');
    bouton.setAttribute('aria-label',joue?'Mettre en pause':'Écouter');
    pictoPlay.hidden=joue;
    pictoPause.hidden=!joue;
  }

  bouton.addEventListener('click',function(){
    if(son.paused){
      bouton.dataset.charge='1';
      var p=son.play();
      if(p&&p.catch) p.catch(function(){bouton.dataset.charge='0';});
    } else son.pause();
  });
  son.addEventListener('playing',function(){bouton.dataset.charge='0';etat(true);});
  son.addEventListener('play',function(){etat(true);});
  son.addEventListener('pause',function(){bouton.dataset.charge='0';etat(false);});
  son.addEventListener('ended',function(){etat(false);});
  son.addEventListener('timeupdate',peindre);
  son.addEventListener('loadedmetadata',peindre);

  curseur.addEventListener('pointerdown',function(){attrape=true;});
  curseur.addEventListener('input',function(){
    var d=duree();
    curseur.style.setProperty('--part',(Number(curseur.value)/10).toFixed(2)+'%');
    if(d>0) ecoule.textContent=mmss(d*Number(curseur.value)/1000);
  });
  curseur.addEventListener('change',function(){
    var d=duree();
    attrape=false;
    if(d>0) son.currentTime=d*Number(curseur.value)/1000;
  });

  // Les commandes de l'écran verrouillé. Une méditation s'écoute les yeux
  // fermés : sans ça, mettre en pause demanderait de rallumer l'écran et de
  // retrouver l'onglet.
  if('mediaSession' in navigator && window.MediaMetadata){
    navigator.mediaSession.metadata=new MediaMetadata({
      title:son.dataset.titre, artist:son.dataset.podcast,
      artwork:[{src:son.dataset.art,sizes:'1024x1024',type:'image/webp'}]
    });
    navigator.mediaSession.setActionHandler('play',function(){son.play();});
    navigator.mediaSession.setActionHandler('pause',function(){son.pause();});
  }

  peindre();
})();
