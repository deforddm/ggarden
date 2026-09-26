/* v1.20: tapping Play on a new game (or a save from before v1.20) opens the
   "My character" screen first. Every suite calls this straight after Play:
   if the screen is up it taps "Let's go!", otherwise it does nothing. */
module.exports = async function passCharSelect(p) {
  await p.waitForTimeout(150);
  const open = await p.evaluate(() => {
    const e = document.getElementById('screen-char');
    return !!e && !e.classList.contains('hidden');
  }).catch(() => false);
  if (open) {
    await p.evaluate(() => document.getElementById('char-go').click());
    await p.waitForTimeout(250);
  }
};
