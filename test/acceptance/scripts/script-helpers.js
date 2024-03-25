import { expect } from 'chai';
import * as path from 'path';
import * as util from 'util';
import * as child_process from 'child_process';

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

export { runScriptWithArgument, expectLines };
