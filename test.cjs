const { run } = require('node:test');
const { spec } = require('node:test/reporters');
const path = require('node:path');

const testFile = path.resolve(__dirname, 'tests/phase1.test.mjs');

let hasFailed = false;

const testStream = run({ files: [testFile] });
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
