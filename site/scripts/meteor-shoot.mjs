// Screenshots of the Meteor Madness dashboard (running at <url>) and the impact-physics sweep computed with the app's
// own functions.   node scripts/meteor-shoot.mjs <url> <shots dir> <data dir>
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const [url, shots, dataDir] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
p.on('dialog', (d) => d.dismiss());
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForFunction(() => document.querySelector('#close-approaches-count')?.textContent?.trim() !== '-', null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(2500);
await p.screenshot({ path: `${shots}/01.png` });
const tab = async (name) => { await p.click(`.nav-tab[data-tab="${name}"]`); await p.waitForTimeout(1200); };
await tab('close-approaches'); await p.click('#fetch-approaches'); await p.waitForSelector('#approaches-table tbody tr', { timeout: 60000 }); await p.waitForTimeout(2500);
await p.screenshot({ path: `${shots}/02.png` });
await tab('fireballs'); await p.click('#fetch-fireballs'); await p.waitForSelector('#fireballs-table tbody tr', { timeout: 60000 }); await p.waitForTimeout(3000);
await p.screenshot({ path: `${shots}/03.png` });
await tab('prediction'); await p.click('.choice-option[data-method="custom"]'); await p.waitForTimeout(800);
const set = async (id, v) => p.evaluate(([id, v]) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]);
await set('diameter', '300'); await set('velocity', '20000'); await set('angle', '45');
await p.selectOption('#density-type', 'stony').catch(() => {});
await set('impact-lat', '40.7'); await set('impact-lon', '-74.0');
await p.waitForTimeout(800);
await p.screenshot({ path: `${shots}/04.png` });
await p.click('#run-simulation'); await p.waitForSelector('.outcome-card', { timeout: 60000 }); await p.waitForTimeout(4000);
await p.evaluate(() => document.getElementById('globe-3d')?.scrollIntoView({ block: 'start' })); await p.waitForTimeout(1500);
await p.screenshot({ path: `${shots}/05.png` });
await p.evaluate(() => document.querySelector('.outcome-card')?.scrollIntoView({ block: 'start' })); await p.waitForTimeout(800);
await p.screenshot({ path: `${shots}/06.png` });
await tab('simulation'); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
await p.screenshot({ path: `${shots}/07.png` });
// physics sweep with the app's own functions (global in app.js)
const sweep = await p.evaluate(() => {
  const out = [];
  for (const d of [10, 20, 50, 100, 200, 500, 1000, 2000]) {
    const mass = calculateMass(d, 3000), energy = calculateKineticEnergy(mass, 20000);
    const crater = calculateCraterDiameter(energy, 45);
    out.push({ d, mt: calculateTntEquivalent(energy), crater: crater.diameter, depth: crater.depth, blastKm: calculateBlastRadius(energy, 45),
      seismic: calculateSeismicMagnitude(energy, 45), tsunamiM: calculateTsunamiHeight(energy, 45) });
  }
  return { velocity: 20000, density: 3000, angle: 45, rows: out };
});
writeFileSync(`${dataDir}/sweep.json`, JSON.stringify(sweep, null, 2));
console.log(JSON.stringify(sweep.rows));
await b.close();
