import child_process from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import util from 'node:util';

import { expect } from 'chai';

const exec = util.promisify(child_process.exec);

async function runScriptWithArgument(scriptFileName, args = [], options = {}) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const { stdout, stderr } = await exec(`${path.join(scriptsDirectory, scriptFileName)} ${args.join(' ')}`, options);
  return { stdout: stdout.split('\n'), stderr: stderr.split('\n') };
}

function expectLines(expectedLines, lines) {
  expectedLines.forEach((expectedLine, index) => {
    if (expectedLine.exec) {
      expect(lines[index]).to.match(expectedLine);
    } else {
      expect(lines[index]).to.eql(expectedLine);
    }
  });
  expect(lines).to.have.lengthOf(expectedLines.length);
}

export { expectLines, runScriptWithArgument };
