// ================================================================
// AUDIO ENGINE (Web Audio API — 仮BGM & SE)  v0.1.3
// ================================================================
const Audio = (() => {
  let ctx = null, bgmBusGain = null, seBusGain = null, bgmNode = null, bgmGain = null;
  let bgmMuted = false, seMuted = false, currentBgm = null, bgmVol = 0.35, seVol = 0.35;
  let desiredBgm = 'home';

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      bgmBusGain = ctx.createGain();
      seBusGain = ctx.createGain();
      bgmBusGain.gain.value = bgmMuted ? 0 : bgmVol;
      seBusGain.gain.value = seMuted ? 0 : seVol;
      bgmBusGain.connect(ctx.destination);
      seBusGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function makeNoise(freq, dur, type, vol, detune) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      if (detune) osc.detune.value = detune;
      g.gain.value = vol || 0.1;
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.connect(g); g.connect(seBusGain);
      osc.start(); osc.stop(c.currentTime + dur);
    } catch(e) {}
  }

  function makeClick(freq, dur, vol) {
    try {
      const c = getCtx();
      const buf = c.createBuffer(1, Math.ceil(c.sampleRate*(dur||0.04)), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*Math.exp(-i/(c.sampleRate*(dur||0.04)*0.3));
      const src = c.createBufferSource();
      const flt = c.createBiquadFilter();
      const g = c.createGain();
      flt.type = 'bandpass'; flt.frequency.value = freq||600;
      src.buffer = buf; g.gain.value = vol||0.1;
      src.connect(flt); flt.connect(g); g.connect(seBusGain);
      src.start();
    } catch(e) {}
  }

  function playSE(name) {
    if (seMuted) return;
    try { getCtx(); } catch(e){ return; }
    switch(name) {
      case 'hover': makeClick(1100,0.02,0.05); break;
      case 'click': makeClick(600,0.04,0.1); break;
      case 'confirm': makeNoise(740,0.06,'triangle',0.08); break;
      case 'dice':
        for(let i=0;i<6;i++) setTimeout(()=>makeClick(400+Math.random()*400,0.03,0.12),i*40);
        setTimeout(()=>{ makeNoise(120,0.15,'sine',0.2); makeNoise(60,0.08,'square',0.15); },260);
        break;
      case 'item':
        makeNoise(880,0.08,'sine',0.12); 
        setTimeout(()=>makeNoise(1100,0.12,'sine',0.10),80);
        setTimeout(()=>makeNoise(1320,0.15,'sine',0.08),160);
        break;
      case 'danger':
        makeNoise(80,0.3,'sawtooth',0.15); makeNoise(120,0.2,'square',0.1); break;
      case 'combat':
        makeNoise(200,0.08,'sawtooth',0.18); makeNoise(80,0.15,'sine',0.15); break;
      case 'combatHit':
        makeNoise(150,0.12,'square',0.2); makeNoise(60,0.08,'sine',0.18);
        setTimeout(()=>makeNoise(100,0.1,'sawtooth',0.12),60);
        break;
      case 'flee':
        for(let i=0;i<3;i++) setTimeout(()=>makeClick(300+i*100,0.04,0.1),i*50);
        break;
      case 'levelMove':
        [440,554,659,880].forEach((f,i)=>setTimeout(()=>makeNoise(f,0.2,'sine',0.12),i*80));
        break;
      case 'trophy':
        [523,659,784,1047].forEach((f,i)=>setTimeout(()=>makeNoise(f,0.25,'sine',0.13),i*100));
        break;
      case 'save':
        [660,880].forEach((f,i)=>setTimeout(()=>makeNoise(f,0.12,'sine',0.1),i*90));
        break;
      case 'load':
        [523,659,784].forEach((f,i)=>setTimeout(()=>makeNoise(f,0.1,'triangle',0.08),i*70));
        break;
      case 'gameover':
        [220,185,156,131].forEach((f,i)=>setTimeout(()=>makeNoise(f,0.5,'sawtooth',0.18),i*300));
        setTimeout(()=>makeNoise(60,1.5,'sine',0.2),1200);
        break;
      case 'death':
        makeNoise(80,0.5,'square',0.2);
        setTimeout(()=>makeNoise(40,2,'sine',0.15),200);
        break;
    }
  }

  function stopBgm() {
    if (bgmNode) { try{ bgmNode.stop(); }catch(e){} bgmNode=null; }
    if (bgmGain) { try{ bgmGain.disconnect(); }catch(e){} bgmGain=null; }
    currentBgm = null;
  }

  function makeDrone(freq, type, vol, detune) {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type||'sine'; osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    g.gain.value = vol||0.1;
    osc.connect(g);
    return {osc, g};
  }

  function startBgm(name) {
    desiredBgm = name || desiredBgm;
    if (bgmMuted) { currentBgm = null; return; }
    if (currentBgm === name) return;
    stopBgm();
    currentBgm = name;
    try {
      const c = getCtx();
      bgmGain = c.createGain();
      bgmGain.gain.value = 0;
      bgmGain.connect(bgmBusGain);
      const nodes = [];

      if (name === 'home') {
        const d1=makeDrone(55,'sine',0.25), d2=makeDrone(110,'triangle',0.12,3), d3=makeDrone(82.5,'sine',0.08,-5);
        const lfo=c.createOscillator(), lfoG=c.createGain();
        lfo.frequency.value=0.08; lfoG.gain.value=0.06;
        lfo.connect(lfoG); lfoG.connect(d1.g.gain); lfo.start();
        [d1,d2,d3].forEach(d=>{ d.osc.start(); d.g.connect(bgmGain); nodes.push(d.osc); });
        nodes.push(lfo);
        const creak=()=>{ if(currentBgm!=='home')return; try{ const o=c.createOscillator(),g=c.createGain(); o.type='sawtooth'; o.frequency.value=800+Math.random()*400; g.gain.value=0.02; g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.5); o.connect(g); g.connect(bgmGain); o.start(); o.stop(c.currentTime+0.5); }catch(e){} setTimeout(creak,4000+Math.random()*6000); };
        setTimeout(creak,2000);

      } else if (name === 'level0') {
        const h1=makeDrone(60,'sine',0.2), h2=makeDrone(120,'square',0.06,2), h3=makeDrone(180,'sine',0.04,-3);
        [h1,h2,h3].forEach(d=>{ d.osc.start(); d.g.connect(bgmGain); nodes.push(d.osc); });
        const flicker=()=>{ if(currentBgm!=='level0')return; try{ const dur=0.05+Math.random()*0.1, buf=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate), dd=buf.getChannelData(0); for(let i=0;i<dd.length;i++) dd[i]=(Math.random()*2-1)*0.04; const src=c.createBufferSource(),flt=c.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=3000; flt.Q.value=5; src.buffer=buf; src.connect(flt); flt.connect(bgmGain); src.start(); }catch(e){} setTimeout(flicker,2000+Math.random()*8000); };
        setTimeout(flicker,1500);
        const thump=()=>{ if(currentBgm!=='level0')return; try{ const o=c.createOscillator(),g=c.createGain(); o.type='sine'; o.frequency.value=40; g.gain.value=0.08; g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.4); o.connect(g); g.connect(bgmGain); o.start(); o.stop(c.currentTime+0.4); }catch(e){} setTimeout(thump,8000+Math.random()*12000); };
        setTimeout(thump,4000);

      } else if (name === 'level1') {
        const d1=makeDrone(40,'sine',0.22), d2=makeDrone(80,'triangle',0.1,5), d3=makeDrone(55,'sawtooth',0.04,-8);
        const lfo=c.createOscillator(),lfoG=c.createGain(); lfo.frequency.value=0.05; lfoG.gain.value=0.05;
        lfo.connect(lfoG); lfoG.connect(d1.g.gain); lfo.start();
        [d1,d2,d3].forEach(d=>{ d.osc.start(); d.g.connect(bgmGain); nodes.push(d.osc); });
        nodes.push(lfo);
        const ping=()=>{ if(currentBgm!=='level1')return; try{ const o=c.createOscillator(),g=c.createGain(); o.type='triangle'; o.frequency.value=600+Math.random()*300; g.gain.value=0.06; g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+1.5); o.connect(g); g.connect(bgmGain); o.start(); o.stop(c.currentTime+1.5); }catch(e){} setTimeout(ping,5000+Math.random()*10000); };
        setTimeout(ping,3000);
      }

      bgmGain.gain.setValueAtTime(0, c.currentTime);
      bgmGain.gain.linearRampToValueAtTime(1, c.currentTime+3);
      bgmNode = { stop: ()=>nodes.forEach(n=>{ try{n.stop();}catch(e){} }) };
    } catch(e) { console.warn('BGM error:',e); }
  }

  function setBgmVol(v) {
    bgmVol = Math.max(0,Math.min(1,parseFloat(v)||0));
    if (bgmBusGain) bgmBusGain.gain.value = bgmMuted ? 0 : bgmVol;
  }

  function setSeVol(v) {
    seVol = Math.max(0,Math.min(1,parseFloat(v)||0));
    if (seBusGain) seBusGain.gain.value = seMuted ? 0 : seVol;
  }

  function toggleBgmMute() {
    bgmMuted = !bgmMuted;
    if (bgmBusGain) bgmBusGain.gain.value = bgmMuted ? 0 : bgmVol;
    if (bgmMuted) stopBgm();
    else startBgm(desiredBgm || currentBgm || 'home');
    return bgmMuted;
  }

  function toggleSeMute() {
    seMuted = !seMuted;
    if (seBusGain) seBusGain.gain.value = seMuted ? 0 : seVol;
    return seMuted;
  }

  return { playSE, startBgm, stopBgm, setBgmVol, setSeVol, toggleBgmMute, toggleSeMute };
})();

function playSE(name) { Audio.playSE(name); }
function setBgmVol(v) { Audio.setBgmVol(v); }
function setSeVol(v) { Audio.setSeVol(v); }

function toggleBgmMute() {
  const m = Audio.toggleBgmMute();
  const btn = document.getElementById('bgm-mute-btn');
  if (btn) btn.textContent = m ? '🔇' : '🔊';
}

function toggleSeMute() {
  const m = Audio.toggleSeMute();
  const btn = document.getElementById('se-mute-btn');
  if (btn) btn.textContent = m ? '🔕' : '🔔';
}

function setMasterVol(v) {
  Audio.setBgmVol(v);
  Audio.setSeVol(v);
}

function toggleMute() {
  toggleBgmMute();
  toggleSeMute();
}
