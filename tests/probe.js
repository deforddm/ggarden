const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 700 }, hasTouch: true });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(600);
  await p.click('#btn-play');
  await p.waitForTimeout(800);

  // 1. deterministic catch test
  const catchResult = await p.evaluate(async () => {
    const out = [];
    for (const id of ['monarch','ladybug','dragonfly','snail','mantis','firefly','water_strider','grasshopper']) {
      GG.Critters.clear();
      GG.Player.reset(1520, 1600);
      GG.Player.angle = -Math.PI/2; GG.Player.dir = 'up';
      const def = GG.BUG_BY_ID[id];
      GG.Critters.add(def, 1520, 1600 - 34);
      GG.Player.swing = 0;
      GG.Player.startSwing();
      let caught = null;
      for (let i=0;i<12;i++){
        GG.Player.swing -= 0.04;
        const pr = GG.Player.swingProgress();
        if (pr>0.16 && pr<0.8 && !caught) caught = GG.Critters.tryCatch(GG.Player);
      }
      out.push(id + ':' + (caught ? 'CAUGHT' : 'MISS'));
    }
    return out;
  });
  console.log('CATCH TEST:', catchResult.join(' '));

  // 2. fps measurement while walking
  await p.evaluate(() => { GG.Player.reset(2400, 700); window.__frames=0;
    (function f(){ window.__frames++; requestAnimationFrame(f); })(); });
  await p.keyboard.down('ArrowLeft');
  await p.waitForTimeout(3000);
  await p.keyboard.up('ArrowLeft');
  const frames = await p.evaluate(() => window.__frames);
  console.log('FPS (forest, 3s):', Math.round(frames/3));

  // 3. spawn coverage: what appears where and when
  const cov = await p.evaluate(() => {
    const res = {};
    const spots = { meadow:[900,1000], garden:[1520,1500], forest:[2400,700], pond:[760,1750], hill:[400,400], orchard:[2000,1450] };
    for (const phase of ['morning','day','evening','night']) {
      for (const k in spots) {
        const cands = GG.Critters.eligible(k, phase, false);
        res[k+'/'+phase] = cands.length;
      }
    }
    return res;
  });
  const zero = Object.keys(cov).filter(k => cov[k] === 0);
  console.log('SPAWN TABLE min:', Math.min(...Object.values(cov)), 'empty combos:', zero.join(',') || 'none');

  // 4. world overview map
  await p.evaluate(() => {
    const cv = document.createElement('canvas');
    cv.id='overview'; cv.width=800; cv.height=600;
    cv.style.cssText='position:fixed;left:0;top:0;z-index:99';
    document.body.appendChild(cv);
    const c = cv.getContext('2d');
    c.scale(0.25,0.25);
    const cam={x:0,y:0};
    const W=GG.World;
    for (let cy=0;cy<6;cy++) for (let cx=0;cx<8;cx++) c.drawImage(W.chunkCanvas(cx,cy), cx*400, cy*400);
    W.drawWater(c, cam, 1);
    for (const pr of W.props) { const fn=GG.Props[pr.type]; if(fn) fn(c, pr.x, pr.y, pr.r, 1, pr.seed, pr.col||pr.label); }
    c.setTransform(1,0,0,1,0,0);
    c.strokeStyle='#fff'; c.lineWidth=1;
    c.fillStyle='#f00';
    c.beginPath(); c.arc(W.DOOR.x*0.25, W.DOOR.y*0.25, 5, 0, 7); c.fill();
  });
  await p.waitForTimeout(600);
  await (await p.$('#overview')).screenshot({ path: __dirname + '/shots/overview.png' });

  if (errs.length) console.log('ERRORS:\n'+errs.join('\n')); else console.log('no errors');
  await b.close();
})();
