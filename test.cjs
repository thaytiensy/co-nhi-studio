const { run } = require('node:test');
const { spec } = require('node:test/reporters');
const path = require('node:path');
const fs = require('node:fs');

const testDir = path.resolve(__dirname, 'tests');
const testFiles = fs.readdirSync(testDir)
  .filter(f => f.endsWith('.test.mjs'))
  .sort()
  .map(f => path.resolve(testDir, f));

let hasFailed = false;

const testStream = run({ files: testFiles });
testStream.compose(new spec()).pipe(process.stdout);

testStream.on('test:fail', () => {
  hasFailed = true;
  process.exitCode = 1;
});

testStream.on('end', () => {
  if (hasFailed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
