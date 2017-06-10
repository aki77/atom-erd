'use babel';

import path from 'path';

const resolveFromPackage = (packageName, fileName) => {
  const packageRoot = atom.packages.resolvePackagePath(packageName);
  return path.join(packageRoot, 'lib', fileName);
};

const requireFromPackage = (packageName, fileName) =>
  require(resolveFromPackage(
    packageName,
    fileName,
  )); /* eslint import/no-dynamic-require:0, global-require:0 */

export { requireFromPackage };
