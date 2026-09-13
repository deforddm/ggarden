const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    ['monarch','ladybug','grasshopper','firefly','water_strider','snail'].forEach(i => GG.Save.addCatch(i));
    ['bluegill','koi','catfish','bass','goldfish'].forEach(i => GG.Save.addFish(i));
    const d = GG.Save.data;
    d.sparkles = 9000;
    d.unlockedDecor = GG.DECOR.map(x => x.id).concat(GG.TANK_BGS.map(x => 'bg_' + x.id));
    d.terrariums = [
      { name: 'Meadow Jar', type: 'terrarium', bg: 'meadow',
        bugs: [{id:'monarch',x:200,y:130,s:1,seed:.2},{id:'firefly',x:430,y:180,s:1,seed:.5},
               {id:'ladybug',x:300,y:330,s:1,seed:.7},{id:'grasshopper',x:490,y:340,s:1,seed:.4}],
        fish: [],
        decor: [{id:'log',x:150,y:340,s:1,seed:.1},{id:'mushroom',x:360,y:335,s:1,seed:.9},{id:'fern',x:540,y:355,s:1,seed:.3}] },
      { name: 'Goldfish Bowl', type: 'aquarium', bg: 'clear',
        bugs: [], fish: [{id:'koi',x:230,y:170,s:1,seed:.3},{id:'goldfish',x:440,y:250,s:1,seed:.6},
               {id:'catfish',x:300,y:330,s:1,seed:.1},{id:'bluegill',x:150,y:260,s:1,seed:.8}],
        decor: [{id:'rock',x:130,y:368,s:1,seed:.5},{id:'fern',x:500,y:366,s:1,seed:.2},{id:'shell',x:330,y:372,s:1,seed:.4}] },
      { name: 'Riverbank', type: 'hybrid', bg: 'riverbank',
        bugs: [{id:'monarch',x:190,y:120,s:1,seed:.2},{id:'ladybug',x:420,y:270,s:1,seed:.6},
               {id:'water_strider',x:300,y:292,s:1,seed:.9}],
        fish: [{id:'bluegill',x:220,y:330,s:1,seed:.4},{id:'bass',x:440,y:350,s:1,seed:.7}],
        decor: [{id:'twig',x:120,y:278,s:1,seed:.1},{id:'mushroom',x:520,y:280,s:1,seed:.3}] }
    ];
    GG.Save.save();
    GG.Terrarium.index = 0; GG.Terrarium.open();
  });
  for (const [i, name] of [[0,'tank-terrarium'],[1,'tank-fish'],[2,'tank-hybrid']]) {
    await p.evaluate(n => { GG.Terrarium.index = n; GG.Terrarium.refresh(); }, i);
    await p.waitForTimeout(1400);
    await p.screenshot({ path: __dirname + '/shots/' + name + '.png' });
  }
  await b.close();
})();
