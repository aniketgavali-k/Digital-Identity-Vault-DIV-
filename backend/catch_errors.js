const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('npx tsc --noEmit', {encoding: 'utf8'});
  fs.writeFileSync('ts_errors.log', result);
} catch (e) {
  fs.writeFileSync('ts_errors.log', e.stdout);
}
