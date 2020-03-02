const red = s => `\x1b[0;31m${s}\x1b[0;0m`;

// https://stackoverflow.com/questions/28409883/how-to-specify-enforce-a-specific-node-js-version-to-use-in-package-json
const checkNodeVersion = () => {
    const [currentMajor, currentMinor, currentPatch] = process.versions.node.split('.');
    let [reqMajor, reqMinor, reqPatch] = process.env.npm_package_engines_node.replace(/[^0-9.]/g, '').split('.');
    reqMajor = reqMajor || currentMajor;
    reqMinor = reqMinor || currentMinor;
    reqPatch = reqPatch || currentPatch;

    const versionCorrect = +currentMajor >= +reqMajor && +currentMinor >= +reqMinor && +currentPatch >= +reqPatch;
    if (!versionCorrect) {
        console.error(red`Pre-install failed:`);
        console.warn(`  Your node version is unsupported (wanted: ${process.env.npm_package_engines_node}, got: ${process.versions.node}).`);
        console.warn(`  Visit https://nodejs.org/en/download/ or use nvm (node version manager)`);
        console.warn(`  https://github.com/nvm-sh/nvm to download the most recent stable node version`);
        console.warn(`  with the latest bug fixes, performance improvements, and security patches.\n\n`);
        process.exit(1);
    }
};

checkNodeVersion();
