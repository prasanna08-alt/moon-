import React, { useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './styles.css';
import './fx.css';

gsap.registerPlugin(ScrollTrigger);

const starData = Array.from({ length: 150 }, (_, i) => ({
  left: `${(i * 37.71 + (i % 7) * 11.3) % 100}%`,
  top: `${(i * 61.17 + (i % 11) * 4.7) % 100}%`,
  size: `${i % 13 === 0 ? 3 : i % 4 === 0 ? 2 : 1}px`,
  delay: `${(i % 17) * -0.23}s`,
  duration: `${2.5 + (i % 8) * 0.5}s`,
}));

function Stars({ count = 150 }) {
  return <div className="starfield" aria-hidden="true">{starData.slice(0, count).map((s, i) => <i key={i} style={{ ...s, animationDelay: s.delay, animationDuration: s.duration }} />)}</div>;
}
function Planet({ className = '' }) { return <div className={`planet ${className}`} aria-hidden="true"><span className="planet-crater c1"/><span className="planet-crater c2"/><span className="planet-crater c3"/><span className="planet-crater c4"/></div>; }
function MoonImage({ id = 'a' }) { return <svg className="moon-svg" viewBox="0 0 200 200" aria-hidden="true"><defs><filter id={`lunar-${id}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".022 .03" numOctaves="6" seed="11" result="n"/><feDiffuseLighting in="n" lighting-color="#e2dcd2" surfaceScale="4" diffuseConstant="1.15"><feDistantLight azimuth="215" elevation="46"/></feDiffuseLighting></filter><radialGradient id={`shade-${id}`} cx=".3" cy=".28" r=".85"><stop offset=".4" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#01030a" stopOpacity=".94"/></radialGradient><clipPath id={`disc-${id}`}><circle cx="100" cy="100" r="100"/></clipPath></defs><g clipPath={`url(#disc-${id})`}><rect width="200" height="200" filter={`url(#lunar-${id})`}/><circle cx="62" cy="70" r="16" fill="#3a3f4d" opacity=".35"/><circle cx="118" cy="120" r="22" fill="#2f3441" opacity=".3"/><circle cx="140" cy="62" r="11" fill="#3a3f4d" opacity=".3"/><circle cx="100" cy="100" r="100" fill={`url(#shade-${id})`}/></g></svg>; }
function Astronaut() { return <svg viewBox="0 0 160 220" aria-hidden="true"><rect x="38" y="62" width="84" height="92" rx="30" fill="#e9edf6"/><rect x="26" y="78" width="26" height="58" rx="13" fill="#d5dbe9" transform="rotate(18 39 107)"/><rect x="108" y="74" width="26" height="58" rx="13" fill="#d5dbe9" transform="rotate(-24 121 103)"/><rect x="48" y="146" width="26" height="62" rx="13" fill="#dfe4f0" transform="rotate(8 61 177)"/><rect x="88" y="146" width="26" height="62" rx="13" fill="#dfe4f0" transform="rotate(-14 101 177)"/><rect x="62" y="92" width="36" height="22" rx="5" fill="#3d63b8"/><circle cx="80" cy="44" r="36" fill="#f3f5fb"/><ellipse cx="80" cy="46" rx="25" ry="21" fill="#10183a"/><ellipse cx="72" cy="40" rx="9" ry="5" fill="#6d8fe6" opacity=".6"/></svg>; }
function Header({ soundOn, onToggleSound }) { return <header className="topbar"><a className="brand" href="#home"><span className="brand-mark">✦</span> BEYOND THE MOON</a><span className="top-note">A JOURNEY THROUGH THE COSMOS</span><div className="top-actions"><button className="sound-toggle" onClick={onToggleSound} aria-label={soundOn ? 'Pause background music' : 'Play background music'}><span className={soundOn ? 'sound-dot is-playing' : 'sound-dot'} />{soundOn ? 'SOUND ON' : 'PLAY SOUND'}</button><a className="menu-link" href="#journey">EXPLORE <span>↘</span></a></div></header>; }
function SectionLabel({ number, children }) { return <div className="section-label"><span>{number}</span><span className="label-line"/>{children}</div>; }
function App() {
  const root = useRef(null);
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  const toggleSound = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { try { await audio.play(); setSoundOn(true); } catch { setSoundOn(false); } }
    else { audio.pause(); setSoundOn(false); }
  };
  useLayoutEffect(() => {
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.85 });
    let rafId;
    const tick = (time) => { lenis.raf(time * 1000); rafId = requestAnimationFrame(tick); };
    rafId = requestAnimationFrame(tick);
    lenis.on('scroll', ScrollTrigger.update);

    const cleanup = [];
    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray('.cinematic-stage > .scene');
      if (!scenes.length) return;
      gsap.set(scenes, { autoAlpha: 0, scale: 1.055, y: 24, transformOrigin: '50% 50%' });
      gsap.set(scenes[0], { autoAlpha: 1, scale: 1, y: 0 });
      gsap.set('.topbar', { autoAlpha: 1 });

      // One pinned viewport. Scroll progress cross-fades/zooms scenes INSIDE it;
      // the browser never slides the individual sections through the viewport.
      const cinematic = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.scroll-track',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.15,
          invalidateOnRefresh: true,
        }
      });

      const HOLD = 1; // first beat of the timeline: the moon zooms forward alone
      scenes.forEach((scene, index) => {
        if (index === 0) {
          cinematic.to('.hero-moon-wrap', { scale: 5, duration: HOLD, ease: 'power2.in' }, 0);
          cinematic.to('.hero-copy', { y: -40, autoAlpha: 0, duration: 0.4, ease: 'none' }, 0);
          cinematic.to('.hero-aurora', { yPercent: 40, autoAlpha: 0, duration: HOLD, ease: 'none' }, 0);
          return;
        }
        const previous = scenes[index - 1];
        const at = index - 1 + HOLD;
        cinematic.set(scene, { autoAlpha: 1, scale: 1.12, y: 26 }, at);
        cinematic.to(previous, { autoAlpha: 0, scale: 0.94, y: -18, duration: 0.82 }, at);
        cinematic.to(scene, { autoAlpha: 1, scale: 1, y: 0, duration: 0.9 }, at);
        const copy = scene.querySelector('.reveal, .hero-copy, .final-copy');
        if (copy) cinematic.fromTo(copy, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out' }, at + 0.18);
      });

      // Scroll-linked celestial movement inside each scene.
      cinematic.to('.solar-orbit', { rotation: '+=42', duration: 1, ease: 'none' }, 2.7 + HOLD);
      cinematic.to('.ring-one', { rotation: '+=38', duration: 1, ease: 'none' }, 4.0 + HOLD);
      cinematic.to('.ring-two', { rotation: '-=42', duration: 1, ease: 'none' }, 4.0 + HOLD);
      cinematic.to('.comet', { x: -150, y: 130, rotation: -12, duration: 1, ease: 'none' }, 5.0 + HOLD);
      cinematic.to('.aurora-ribbon', { xPercent: 12, rotation: 4, scaleY: 1.12, duration: 1, ease: 'none' }, 6.0 + HOLD);
      cinematic.to('.exoplanet-sphere', { rotation: 14, scale: 1.08, duration: 1, ease: 'none' }, 7.0 + HOLD);
      cinematic.to('.constellation-lines', { strokeDashoffset: -45, duration: 1, ease: 'none' }, 8.0 + HOLD);
      cinematic.to('.final-planet', { scale: 1.2, rotation: 12, duration: 1, ease: 'none' }, 9.0 + HOLD);

      cinematic.fromTo('.portal', { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 1.1 + HOLD);
      cinematic.fromTo('.astro', { y: 120, rotate: -20, autoAlpha: 0 }, { y: -40, rotate: 14, autoAlpha: 1, duration: 1.4, ease: 'none' }, 1.1 + HOLD);
      cinematic.fromTo('.moon-mini', { y: -60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 1.2 + HOLD);
      cinematic.to('.portal', { rotation: 30, duration: 1, ease: 'none' }, 1.9 + HOLD);
      cinematic.to('.sun-core', { scale: 1.4, duration: 1, ease: 'none' }, 2.7 + HOLD);

      // Mouse parallax: each [data-depth] element drifts at its own depth.
      const depthEls = gsap.utils.toArray('[data-depth]');
      const onMove = (e) => { const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5; depthEls.forEach((el) => { const d = +el.dataset.depth; gsap.to(el, { x: -nx * d, y: -ny * d, duration: 1.4, ease: 'power3.out', overwrite: 'auto' }); }); };
      window.addEventListener('mousemove', onMove);
      gsap.utils.toArray('.starfield').forEach((stars, i) => { gsap.to(stars, { scale: 1.12 + i * 0.01, ease: 'none', scrollTrigger: { trigger: '.scroll-track', start: 'top top', end: 'bottom bottom', scrub: 1.5 } }); });
      cleanup.push(() => window.removeEventListener('mousemove', onMove));

      gsap.utils.toArray('.starfield').forEach((stars, i) => {
        gsap.to(stars, { y: i % 2 ? -24 : 18, x: i % 2 ? 12 : -10, ease: 'none', scrollTrigger: {
          trigger: '.scroll-track', start: 'top top', end: 'bottom bottom', scrub: 1.5
        }});
      });
    }, root);

    return () => { cleanup.forEach((f) => f()); ctx.revert(); lenis.destroy(); cancelAnimationFrame(rafId); };
  }, []);

  return <main ref={root}>
    <audio ref={audioRef} src="/beyond-moon-soundtrack.mp3" loop preload="auto" />
    <Header soundOn={soundOn} onToggleSound={toggleSound} />
    <div className="scroll-track"><div className="cinematic-stage">
    <section className="hero scene" id="home"><Stars count={150}/><div className="nebula nebula-blue"/><div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/>
      <div className="hero-aurora"/><div className="hero-moon-wrap"><div className="pulse-ring" style={{'--s':1.7,'--d':0}}/><div className="pulse-ring dashed" style={{'--s':2.2,'--d':.8}}/><div className="pulse-ring" style={{'--s':2.9,'--d':1.6}}/><div className="pulse-ring" style={{'--s':3.7,'--d':2.4}}/><div className="pulse-ring dashed" style={{'--s':4.6,'--d':3.2}}/><div className="hero-moon" data-depth="12"><MoonImage id="hero"/></div></div>
      <div className="hero-copy"><span className="hero-tag">AN IMMERSIVE SPACE EXPERIENCE</span><h1>Beyond The Moon</h1><p>Somewhere between the known and the infinite, a new universe is waiting. Scroll, and let the journey carry you past the edge of the sky.</p><div className="hero-quote">“A little further than you imagined.”</div><a className="scroll-cue" href="#journey"><span className="scroll-line"/> SCROLL TO EXPLORE <b>↓</b></a></div>
      <div className="coordinates">29° 58′ 31″ N<br/>THE OUTER FRONTIER</div><div className="vertical-note">A LITTLE FURTHER THAN YOU IMAGINED</div>
    </section>
    <section className="river-section scene"><Stars count={190}/><div className="river-glow"/><div className="river-band river-band-one"/><div className="river-band river-band-two"/><div className="river-copy reveal"><SectionLabel number="01">A GALACTIC CURRENT</SectionLabel><h2>A River<br/><em>of Stars.</em></h2><p>Billions of distant suns spill across the darkness, tracing a luminous path through our galaxy.</p></div><span className="edge-caption">MILKY WAY / DEEP FIELD</span></section>
    <section className="moon-stage scene" id="journey"><Stars count={85}/><div className="huge-halo"/><div className="moon-copy reveal"><SectionLabel number="02">LEAVE THE SURFACE</SectionLabel><h2>Leave the<br/><em>Surface.</em></h2><p>Beyond the quiet glow of our nearest neighbour lies a universe full of wonder. Take a breath, look up, and let the journey begin.</p><span className="tiny-stat">384,400 KM <small>FROM HOME</small></span></div><div className="portal"><div className="portal-inner"/></div><div className="moon-mini" data-depth="10"><MoonImage id="mini"/></div><div className="astro"><div data-depth="34"><div className="astro-bob"><Astronaut/></div></div></div><span className="edge-caption">LUNAR ORBIT / 00:01</span></section>
    <section className="solar-section scene"><Stars count={100}/><div className="solar-copy reveal"><SectionLabel number="03">THE UNIVERSE NEVER ENDS</SectionLabel><h2>The Universe<br/><em>Never Ends.</em></h2><p>An endless ocean of galaxies, worlds, and distant light stretches beyond everything we know.</p></div><div className="solar-art"><div className="solar-orbit orbit-1"><i className="mini-planet mercury"/></div><div className="solar-orbit orbit-2"><i className="mini-planet venus"/></div><div className="solar-orbit orbit-3"><i className="mini-planet earth"/></div><div className="solar-orbit orbit-4"><i className="mini-planet mars"/></div><div className="solar-orbit orbit-5"><i className="mini-planet jupiter"/></div><div className="sun-core"/><div className="sun-rays"/></div><div className="solar-caption"><span>01 — 08</span><span>PLANETS IN ORBIT</span></div></section>
    <section className="nebula-section scene"><Stars count={95}/><div className="nebula nebula-pink"/><div className="nebula nebula-cyan"/><div className="nebula-copy reveal"><SectionLabel number="06">WHERE STARS ARE BORN</SectionLabel><h2>Where stars<br/><em>are born.</em></h2><p>Inside vast clouds of dust and gas, gravity gathers the ingredients for creation. Every star begins with a spark.</p><a className="text-link" href="#orbit">DISCOVER THE UNSEEN <span>↗</span></a></div><div className="nebula-dust dust-a"/><div className="nebula-dust dust-b"/><div className="nebula-dust dust-c"/></section>
    <section className="orbit-section scene" id="orbit"><Stars count={90}/><div className="orbit-copy reveal"><SectionLabel number="05">THE ASTEROID BELT</SectionLabel><h2>The Asteroid<br/><em>Belt.</em></h2><p>Rock and ice drift through the darkness, remnants of a world that never formed.</p></div><div className="asteroid-field">{Array.from({length:44},(_,i)=><i key={i} style={{"--i":i,"--angle":`${i*137.5}deg`}}/> )}</div><div className="orbit-art"><div className="ring ring-one"/><div className="ring ring-two"/><div className="ring ring-three"/><div className="orbit-center">∞</div><span className="orbit-dot dot-a"/><span className="orbit-dot dot-b"/><span className="orbit-dot dot-c"/></div><span className="edge-caption">ORBITAL MECHANICS / 00:04</span></section>
    <section className="comet-section scene"><Stars count={115}/><div className="comet-copy reveal"><SectionLabel number="07">SUPERNOVA</SectionLabel><h2>A Star's Final<br/><em>Light.</em></h2><p>In a final burst of brilliance, a dying star scatters the elements that will one day become new worlds.</p></div><div className="comet"><span className="comet-tail"/><span className="comet-head"/><span className="comet-spark"/></div><div className="comet-line"/></section>
    <section className="aurora-section scene"><Stars count={65}/><div className="aurora-glow"/><div className="aurora-ribbon ribbon-a"/><div className="aurora-ribbon ribbon-b"/><div className="aurora-ribbon ribbon-c"/><div className="aurora-copy reveal"><SectionLabel number="08">WHERE LIGHT ENDS</SectionLabel><h2><em>Where Light Ends.</em></h2><p>At the edge of a black hole, space and time bend into the unknown.</p><span className="aurora-coords">66° 33′ N — THE POLAR SKY</span></div></section>
    <section className="exoplanet-section scene"><Stars count={115}/><div className="exoplanet-copy reveal"><SectionLabel number="09">WORLDS BEYOND OUR SUN</SectionLabel><h2>Another<br/><em>Earth?</em></h2><p>Far beyond our solar system, distant planets circle unfamiliar stars. Somewhere among them, a new world waits to be discovered.</p><span className="exo-distance">LIGHT YEARS FROM HOME</span></div><div className="exoplanet-sphere"><Planet className="planet exoplanet-surface"/><span className="exo-orbit-line"/><span className="exo-moon"/></div><span className="edge-caption">EXOPLANET / DEEP SPACE</span></section>
    <section className="constellation-section scene"><Stars count={100}/><div className="constellation-copy reveal"><SectionLabel number="10">STORIES WRITTEN IN LIGHT</SectionLabel><h2>Stories written<br/><em>in light.</em></h2><p>Across generations, we have connected distant stars into maps, myths, and meaning. The sky is a canvas without an edge.</p></div><svg className="constellation-map" viewBox="0 0 900 550" aria-hidden="true"><g className="constellation-lines"><path d="M70 310 L170 210 L270 250 L350 110 L455 160 L530 80 L640 150 L720 105 L820 230 L730 340 L610 300 L530 410 L390 360 L270 430 L170 370 Z"/><path d="M350 110 L390 360 M455 160 L610 300 M70 310 L270 430 M640 150 L610 300"/></g>{[[70,310],[170,210],[270,250],[350,110],[455,160],[530,80],[640,150],[720,105],[820,230],[730,340],[610,300],[530,410],[390,360],[270,430],[170,370]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%4===0?4:2.5} className="star-point"/>)}</svg><span className="constellation-name">URSA MINOR · THE LITTLE BEAR</span></section>
    <section className="final-section scene"><Stars count={140}/><div className="final-nebula"/><div className="final-planet"><Planet className="moon"/></div><div className="final-copy reveal"><div className="eyebrow"><span/> YOUR JOURNEY CONTINUES <span/></div><h2>Beyond<br/><em>the Moon.</em></h2><p>The universe is bigger than we can imagine.<br/>And this is only the beginning.</p><a href="#home" className="return-button">RETURN TO THE BEGINNING <span>↑</span></a></div><footer><span>© 2026 BEYOND THE MOON</span><span>MADE FOR THE CURIOUS</span><a href="#home">BACK TO TOP ↑</a></footer></section>
    </div></div>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
