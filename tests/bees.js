/* Checks the angry-bee and sting rules. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 700 }, hasTouch: true });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(800);

  const out = await p.evaluate(async () => {
    const r = [];
    const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
    const wait = ms => new Promise(s => setTimeout(s, ms));

    function setup(id, dx, dy) {
      GG.Critters.clear();
      GG.Player.reset(1520, 1600);
      GG.Player.stun = 0; GG.Player.stingCool = 0;
      GG.Player.angle = -Math.PI / 2; GG.Player.dir = 'up';
      GG.Critters.add(GG.BUG_BY_ID[id], 1520 + dx, 1600 + dy);
      return GG.Critters.list[0];
    }

    // 1. a miss near a bee angers her
    let bee = setup('honeybee', 0, -40);
    const net = GG.Player.netPoint();
    GG.Critters.angerNear(net.x, net.y, 66);
    ok('missing a swing angers a nearby bee', bee.angry > 0);

    // 2. a miss near a non-bee angers nothing
    let moth = setup('luna_moth', 0, -40);
    GG.Critters.angerNear(GG.Player.netPoint().x, GG.Player.netPoint().y, 66);
    ok('non-stinging bugs never get angry', !moth.angry);

    // 3. an angry bee closes in on Guin
    bee = setup('bumblebee', 0, -110);
    bee.angry = 7;
    const before = GG.dist(bee.x, bee.y, GG.Player.x, GG.Player.y);
    for (let i = 0; i < 40; i++) GG.Critters.update(0.03, GG.Player);
    const after = GG.dist(bee.x, bee.y, GG.Player.x, GG.Player.y);
    ok('an angry bee chases Guin', after < before - 15);

    // 4. reaching her lands a sting
    bee = setup('honeybee', 0, -16);
    bee.angry = 7;
    const stung = GG.Critters.checkSting(GG.Player);
    ok('an angry bee that reaches Guin stings', !!stung);
    if (stung) GG.Player.sting();
    ok('the bee is gone after stinging', GG.Critters.list.length === 0);

    // 5. stun rules
    ok('a sting leaves her dizzy', GG.Player.stun > 0);
    ok('she cannot swing while dizzy', GG.Player.startSwing() === false);
    function topSpeed(stunned) {
      GG.Player.reset(1520, 1600);
      GG.Player.stun = stunned ? 3 : 0;
      GG.Input.x = 0; GG.Input.y = -1; GG.Input.mag = 1;
      for (let i = 0; i < 60; i++) GG.Player.update(0.03, () => false);
      const v = GG.Player.speed;
      GG.Input.x = GG.Input.y = 0; GG.Input.mag = 0;
      return v;
    }
    const fast = topSpeed(false), slow = topSpeed(true);
    ok('she walks slower while dizzy (' + Math.round(slow) + ' vs ' + Math.round(fast) + ')', slow < fast * 0.75);
    GG.Player.stun = 2.4; GG.Player.stingCool = 5;

    // 6. no instant second sting
    GG.Player.stun = 0;
    const bee2 = setup2();
    function setup2() {
      GG.Critters.clear();
      GG.Critters.add(GG.BUG_BY_ID.honeybee, GG.Player.x, GG.Player.y - 16);
      const x = GG.Critters.list[0]; x.angry = 7; return x;
    }
    ok('a cooldown stops an instant second sting', GG.Critters.checkSting(GG.Player) === null);

    // 7. she recovers
    GG.Player.stun = 0; GG.Player.stingCool = 0;
    ok('she can swing again once she recovers', GG.Player.startSwing() !== false);

    // 8. a sting scatters the bugs around her
    GG.Player.swing = 0; GG.Player.stun = 0; GG.Player.stingCool = 0;
    GG.Critters.clear();
    GG.Critters.add(GG.BUG_BY_ID.ladybug, GG.Player.x + 40, GG.Player.y + 20);
    GG.Critters.add(GG.BUG_BY_ID.honeybee, GG.Player.x, GG.Player.y - 16);
    GG.Critters.list[1].angry = 7;
    GG.Critters.checkSting(GG.Player);
    ok('a sting scatters everything nearby', GG.Critters.list[0].flee > 0);

    // 9. the beehive
    GG.Critters.clear();
    const hive = GG.World.hive;
    GG.Critters.stirHive(hive.x, hive.y - 16);
    ok('poking the beehive releases angry bees',
      GG.Critters.list.length === 3 && GG.Critters.list.every(x => x.angry > 0 && x.def.sting));

    // 10. going indoors calms everyone
    GG.Critters.calmAll();
    ok('going indoors calms the bees', GG.Critters.list.every(x => x.angry === 0));

    // 11. angry bees are still catchable
    bee = setup('bumblebee', 0, -30);
    bee.angry = 7;
    GG.Player.stun = 0; GG.Player.stingCool = 0; GG.Player.swing = 0;
    GG.Player.startSwing();
    let caught = null;
    for (let i = 0; i < 12; i++) {
      GG.Player.swing -= 0.04;
      const pr = GG.Player.swingProgress();
      if (pr > 0.16 && pr < 0.8 && !caught) caught = GG.Critters.tryCatch(GG.Player);
    }
    ok('you can still catch an angry bee', !!caught);

    // 12. the bees calm down on their own
    bee = setup('honeybee', 0, -300);
    bee.angry = 0.05;
    for (let i = 0; i < 10; i++) GG.Critters.update(0.03, GG.Player);
    ok('a bee calms down on her own and flies off', bee.angry === 0 && bee.flee > 0);

    return r;
  });

  console.log(out.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(out.some(x => x.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
})();
