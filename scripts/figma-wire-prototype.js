// One call: lay out the numbered screen frames in a row under the board, label them, wire On-click → next (Dissolve 300 ms), loop back, set flow start.
const page = figma.currentPage;
const kids = [...page.children];
const board = kids.find(n => /board/i.test(n.name));
if (board) board.name = board.name.replace(/Â/g, '');
const screens = kids.filter(n => /^\d /.test(n.name)).sort((a, b) => parseInt(a.name) - parseInt(b.name));
if (!screens.length) return 'no numbered screens found: ' + kids.map(n => n.name).join(' | ');
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
const x0 = board ? board.x + 96 : 0, y0 = board ? board.y + board.height + 140 : 0, gap = 80;
const title = figma.createText(); title.fontName = { family: 'Inter', style: 'Semi Bold' }; title.fontSize = 22;
title.characters = 'PROTOTYPE  ·  press Play (▶) and click the watch to move through the states';
title.fills = [{ type: 'SOLID', color: { r: .62, g: .62, b: .66 } }]; title.x = x0; title.y = y0 - 56; page.appendChild(title);
screens.forEach((s, i) => {
  s.x = x0 + i * (368 + gap); s.y = y0;
  if ('clipsContent' in s) s.clipsContent = true;
  const t = figma.createText(); t.fontName = { family: 'Inter', style: 'Semi Bold' }; t.fontSize = 16;
  t.characters = s.name.replace(/^\d+ /, '').toUpperCase(); t.fills = [{ type: 'SOLID', color: { r: .62, g: .62, b: .66 } }];
  t.x = s.x; t.y = y0 + s.height + 22; page.appendChild(t);
});
for (let i = 0; i < screens.length; i++) {
  const next = screens[(i + 1) % screens.length];
  await screens[i].setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: next.id, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.3 }, resetScrollPosition: true }] }]);
}
page.flowStartingPoints = [{ nodeId: screens[0].id, name: screens[0].name.replace(/^\d+ /, '').split(' · ')[0] + ' prototype' }];
return 'wired ' + screens.map(s => s.name + ' [' + s.type + ']').join(' → ');
