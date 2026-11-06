const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'dist');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
const patterns = {
  withHeroActions: 0,
  solidGreenPill: 0,
  softSagePill: 0,
  heroActionPill: 0,
  btnG: 0,
  btnP: 0,
  orderDemoFirst: 0,
  orderAssessFirst: 0,
};
const samples = [];

for (const f of files) {
  const t = fs.readFileSync(path.join(dir, f), 'utf8');
  const m = t.match(/class="[^"]*hero-actions[^"]*"[\s\S]{0,900}?<\/div>/);
  if (!m) continue;
  const block = m[0];
  const hasPill = block.includes('hero-action-pill');
  const hasLink = block.includes('hero-action-link');
  if (!hasPill && !hasLink) continue;
  patterns.withHeroActions += 1;
  const solid = /bg-\[#3f9a4b\]/.test(block) && /hero-action-pill/.test(block);
  const soft = /bg-\[#AAD39C\]/.test(block) && /hero-action-pill/.test(block);
  const btnG = /btn-g/.test(block);
  const btnP = /btn-p/.test(block);
  const demoIdx = block.search(/Book a Demo|Schedule a Demo/i);
  const assessIdx = block.search(/Revenue Assessment|Get Free/i);
  if (solid) patterns.solidGreenPill += 1;
  if (soft) patterns.softSagePill += 1;
  if (hasPill) patterns.heroActionPill += 1;
  if (btnG) patterns.btnG += 1;
  if (btnP) patterns.btnP += 1;
  if (demoIdx >= 0 && assessIdx >= 0) {
    if (demoIdx < assessIdx) patterns.orderDemoFirst += 1;
    else patterns.orderAssessFirst += 1;
  }
  if (samples.length < 12) {
    samples.push({
      f,
      solid,
      soft,
      btnG,
      btnP,
      demoFirst: demoIdx >= 0 && assessIdx >= 0 ? demoIdx < assessIdx : null,
      snippet: block.replace(/\s+/g, ' ').slice(0, 260),
    });
  }
}

console.log(JSON.stringify({ patterns, samples }, null, 2));
