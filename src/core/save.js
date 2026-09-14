/* Saving and loading the player's garden.

   There are two slots. The MAIN slot is Guin's garden and it is the only one
   that ever loads on its own. The GUEST slot is a short visit for a friend:
   it starts empty every time, saves to a key of its own, and can be thrown
   away without touching Guin's. Nothing a guest does can reach the main
   save - they are separate keys and only one is loaded at a time. */
(function (GG) {
  'use strict';
  var KEY = 'guins-garden-save-v1';
  var GUEST_KEY = 'guins-garden-guest-v1';
  var SLOT_KEY = 'guins-garden-slot';

  function fresh() {
    return {
      v: 1,
      name: 'Guin',
      sparkles: 0,
      caught: {},          // bugId -> { count, first(ms) }
      caughtFish: {},      // fishId -> { count, first(ms) }
      friends: {},         // animalId -> { count, first(ms) }  (Garden Friends)
      companion: null,     // the friend tagging along today
      hats: {},            // animalId -> hatId  (silly hats for your friends)
      homeFriends: [],     // friends waiting for her indoors
      fruit: {},           // fruitId -> { count, first(ms) }  (picked in the orchard and the hills)
      seen: {},            // bugId -> { count, first(ms) }  (met but never caught - the look-only ones)
      terrariums: [
        { name: 'My First Terrarium', type: 'terrarium', bg: 'meadow', decor: [], bugs: [], fish: [], friends: [] }
      ],
      unlockedDecor: ['leaf', 'pebble', 'twig', 'mushroom'],
      unlockedTanks: 1,
      clock: 8 * 60,       // in-game minutes past midnight
      day: 1,
      totalCatches: 0,
      seenIntro: false,
      seenHouseTip: false,
      seenBeeTip: false,
      stings: 0,
      muted: false,
      settings: { music: 0.5, ambience: 0.7, sfx: 0.8 },
      version: null,            // the build she last played; drives "What's new"
      guest: false,
      guestName: ''
    };
  }

  GG.Save = {
    data: fresh(),
    fresh: fresh,
    slot: 'main',

    key: function () { return this.slot === 'guest' ? GUEST_KEY : KEY; },

    /* Which slot was in use last time the page was open? A guest visit is
       remembered only so a reload mid-visit does not dump them into Guin's
       garden; "Back to Guin's garden" clears it. */
    rememberedSlot: function () {
      try { return localStorage.getItem(SLOT_KEY) === 'guest' ? 'guest' : 'main'; }
      catch (e) { return 'main'; }
    },

    setSlot: function (slot) {
      this.slot = (slot === 'guest') ? 'guest' : 'main';
      try { localStorage.setItem(SLOT_KEY, this.slot); } catch (e) {}
    },

    /* Start a guest visit: a brand new garden in the guest slot. Guin's save
       is not read, not written, and not touched in any way. */
    startGuest: function (name) {
      this.setSlot('guest');
      this.data = fresh();
      this.data.guest = true;
      this.data.name = name || 'Friend';
      this.data.guestName = this.data.name;
      this.data.version = GG.VERSION || null;
      this.data.seenIntro = true;
      this.data.settings = this.readSettings();
      this.save();
      return this.data;
    },

    /* End the visit and go back to Guin's garden. The guest's garden is
       wiped, because it was only ever a visit. */
    endGuest: function () {
      try { localStorage.removeItem(GUEST_KEY); } catch (e) {}
      this.setSlot('main');
      return this.load();
    },

    isGuest: function () { return this.slot === 'guest'; },

    /* Sound settings follow the device, not the garden, so a guest visit
       does not turn the music off for Guin (or leave it blaring). */
    readSettings: function () {
      var base = { music: 0.5, ambience: 0.7, sfx: 0.8 };
      try {
        var raw = localStorage.getItem('guins-garden-settings');
        if (raw) {
          var v = JSON.parse(raw);
          for (var k in base) if (typeof v[k] === 'number') base[k] = GG.clamp(v[k], 0, 1);
        }
      } catch (e) {}
      return base;
    },
    writeSettings: function () {
      try {
        localStorage.setItem('guins-garden-settings', JSON.stringify(this.data.settings));
      } catch (e) {}
    },

    load: function () {
      try {
        var raw = localStorage.getItem(this.key());
        if (raw) {
          var d = JSON.parse(raw);
          var base = fresh();
          for (var k in base) if (!(k in d)) d[k] = base[k];
          if (!d.terrariums || !d.terrariums.length) d.terrariums = base.terrariums;
          d.terrariums.forEach(function (t) {
            if (!t.fish) t.fish = [];
            if (!t.bugs) t.bugs = [];
            if (!t.decor) t.decor = [];
            if (!t.type) {
              // tanks made before there were three kinds
              t.type = (t.bg === 'aquarium') ? 'aquarium' : 'terrarium';
            }
            var wantKind = t.type === 'aquarium' ? 'water'
              : t.type === 'hybrid' ? 'hybrid'
                : t.type === 'habitat' ? 'habitat' : 'land';
            if (!GG.TANK_BY_ID || !GG.TANK_BY_ID[t.bg] || GG.TANK_BY_ID[t.bg].kind !== wantKind) {
              t.bg = GG.defaultSceneFor ? GG.defaultSceneFor(t.type) : 'meadow';
            }
            if (t.type === 'terrarium') t.fish = [];
            /* Only creatures that can actually live in this tank stay in it.
               A fish tank keeps its rock-pool creatures; a terrarium keeps its
               land ones. Anything in the wrong tank goes back to the book -
               nothing is lost, it just has to be placed again. */
            if (GG.bugFitsTank) {
              t.bugs = t.bugs.filter(function (x) {
                return GG.bugFitsTank(GG.BUG_BY_ID[x.id], t.type);
              });
            } else if (t.type === 'aquarium') {
              t.bugs = [];
            }
          });
          this.data = d;
        }
      } catch (e) { this.data = fresh(); }
      this.data.guest = (this.slot === 'guest');
      this.data.settings = this.readSettings();
      if (!this.data.friends) this.data.friends = {};
      if (!this.data.hats) this.data.hats = {};
      if (!this.data.fruit) this.data.fruit = {};
      if (!this.data.seen) this.data.seen = {};
      if (!this.data.homeFriends) this.data.homeFriends = [];
      /* only friends she has actually made can be waiting at the house, and
         the one walking with her is not also sitting indoors */
      this.data.homeFriends = this.data.homeFriends.filter(function (id) {
        return GG.ANIMAL_BY_ID && GG.ANIMAL_BY_ID[id];
      }.bind(this)).filter(function (id) {
        return this.hasFriend(id) && id !== this.data.companion;
      }.bind(this));
      /* every tank grew a friends list when Garden Habitats arrived */
      (this.data.terrariums || []).forEach(function (t) {
        if (!t.friends) t.friends = [];
      });
      if (this.data.companion && !this.data.friends[this.data.companion]) {
        this.data.companion = null;
      }
      /* the look-only creatures are never caught, so an old save that somehow
         has one in the caught list or in a tank is tidied up */
      if (GG.BUG_BY_ID) {
        for (var ck in this.data.caught) {
          if (GG.BUG_BY_ID[ck] && GG.BUG_BY_ID[ck].lookOnly) {
            this.data.seen[ck] = this.data.seen[ck] || this.data.caught[ck];
            delete this.data.caught[ck];
          }
        }
        (this.data.terrariums || []).forEach(function (t) {
          t.bugs = (t.bugs || []).filter(function (x) {
            return !(GG.BUG_BY_ID[x.id] && GG.BUG_BY_ID[x.id].lookOnly);
          });
        });
      }
      /* fruit arrived in v1.12, so drop any fruit id this build does not know */
      if (GG.FRUIT_BY_ID) {
        var keepFruit = {};
        for (var fk in this.data.fruit) {
          if (GG.FRUIT_BY_ID[fk]) keepFruit[fk] = this.data.fruit[fk];
        }
        this.data.fruit = keepFruit;
      }
      return this.data;
    },
    save: function () {
      try { localStorage.setItem(this.key(), JSON.stringify(this.data)); } catch (e) {}
    },
    /* Wipe THIS slot only. */
    reset: function () {
      var keep = this.data.settings;
      this.data = fresh();
      this.data.settings = keep || this.readSettings();
      this.data.guest = (this.slot === 'guest');
      this.data.version = GG.VERSION || null;
      this.save();
    },
    has: function (id) { return !!this.data.caught[id]; },
    countOf: function (id) { var c = this.data.caught[id]; return c ? c.count : 0; },
    totalSpecies: function () {
      /* the look-only ones count too, once she has met them */
      return Object.keys(this.data.caught).length + Object.keys(this.data.seen || {}).length;
    },
    hasFish: function (id) { return !!this.data.caughtFish[id]; },
    countOfFish: function (id) { var c = this.data.caughtFish[id]; return c ? c.count : 0; },
    totalFish: function () { return Object.keys(this.data.caughtFish).length; },
    hasFriend: function (id) { return !!(this.data.friends && this.data.friends[id]); },
    countOfFriend: function (id) {
      var c = this.data.friends && this.data.friends[id];
      return c ? c.count : 0;
    },
    totalFriends: function () { return Object.keys(this.data.friends || {}).length; },
    /* The look-only creatures are met, not caught. Meeting one is what opens
       its page in the Bug Book. */
    hasSeen: function (id) { return !!(this.data.seen && this.data.seen[id]); },
    countOfSeen: function (id) {
      var c = this.data.seen && this.data.seen[id];
      return c ? c.count : 0;
    },
    totalSeen: function () { return Object.keys(this.data.seen || {}).length; },
    addSeen: function (id) {
      if (!this.data.seen) this.data.seen = {};
      var c = this.data.seen[id];
      var isNew = !c;
      if (!c) c = this.data.seen[id] = { count: 0, first: Date.now() };
      c.count++;
      this.save();
      return isNew;
    },
    /* "found it" for the Bug Book: caught it, or - for a look-only one - met it */
    found: function (def) {
      if (!def) return false;
      return def.lookOnly ? this.hasSeen(def.id) : this.has(def.id);
    },
    hasFruit: function (id) { return !!(this.data.fruit && this.data.fruit[id]); },
    countOfFruit: function (id) {
      var c = this.data.fruit && this.data.fruit[id];
      return c ? c.count : 0;
    },
    totalFruit: function () { return Object.keys(this.data.fruit || {}).length; },
    addFruit: function (id) {
      if (!this.data.fruit) this.data.fruit = {};
      var c = this.data.fruit[id];
      var isNew = !c;
      if (!c) c = this.data.fruit[id] = { count: 0, first: Date.now() };
      c.count++;
      return isNew;
    },
    hatOf: function (id) { return (this.data.hats || {})[id] || null; },
    setHat: function (id, hatId) {
      if (!this.data.hats) this.data.hats = {};
      if (!this.data.homeFriends) this.data.homeFriends = [];
      /* only friends she has actually made can be waiting at the house, and
         the one walking with her is not also sitting indoors */
      this.data.homeFriends = this.data.homeFriends.filter(function (id) {
        return GG.ANIMAL_BY_ID && GG.ANIMAL_BY_ID[id];
      }.bind(this)).filter(function (id) {
        return this.hasFriend(id) && id !== this.data.companion;
      }.bind(this));
      if (hatId) this.data.hats[id] = hatId; else delete this.data.hats[id];
      this.save();
    },
    addFriend: function (id) {
      if (!this.data.friends) this.data.friends = {};
      if (!this.data.hats) this.data.hats = {};
      if (!this.data.homeFriends) this.data.homeFriends = [];
      /* only friends she has actually made can be waiting at the house, and
         the one walking with her is not also sitting indoors */
      this.data.homeFriends = this.data.homeFriends.filter(function (id) {
        return GG.ANIMAL_BY_ID && GG.ANIMAL_BY_ID[id];
      }.bind(this)).filter(function (id) {
        return this.hasFriend(id) && id !== this.data.companion;
      }.bind(this));
      var c = this.data.friends[id];
      var isNew = !c;
      if (!c) c = this.data.friends[id] = { count: 0, first: Date.now() };
      c.count++;
      this.save();
      return isNew;
    },
    addFish: function (id) {
      var c = this.data.caughtFish[id];
      var isNew = !c;
      if (!c) c = this.data.caughtFish[id] = { count: 0, first: Date.now() };
      c.count++;
      this.data.totalCatches++;
      this.save();
      return isNew;
    },
    addCatch: function (id) {
      var c = this.data.caught[id];
      var isNew = !c;
      if (!c) c = this.data.caught[id] = { count: 0, first: Date.now() };
      c.count++;
      this.data.totalCatches++;
      this.save();
      return isNew;
    }
  };
})(window.GG = window.GG || {});
