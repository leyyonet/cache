import * as path from "node:path";
import * as fs from "node:fs";
import {obfuscate} from "javascript-obfuscator";
import {ObfuscatorOptions} from "javascript-obfuscator/index";

let deleteDir = false;
const settings = {
    compact: false,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayCallsTransform: false,
    stringArrayEncoding: [],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,
    target: 'node'
} as ObfuscatorOptions;

function clearDir(root: string, trg: string) {
    if (!deleteDir) {
        return;
    }
    const parts = fs.readdirSync(path.join(trg), { encoding: "utf8", withFileTypes: true });
    parts.forEach(part => {
        if (part.isDirectory()){
            clearDir(root, path.join(trg, part.name));
            return;
        }
        fs.unlinkSync(path.join(root, trg, part.name));
    });
    fs.rmdirSync(path.join(trg), {});
}
function obfuscateDir(root: string, src: string, trg: string) {
    if (!fs.existsSync(path.join(trg))) {
        fs.mkdirSync(path.join(trg));
    }
    else {
        clearDir(root, trg);
    }

    const parts = fs.readdirSync(path.join(src), { encoding: "utf8", withFileTypes: true });
    parts.forEach(part => {
        if (part.isDirectory()){
            obfuscateDir(root, path.join(src, part.name), path.join(trg, part.name));
            return;
        }
        console.log(`file: ${path.join(src, part.name)}`);
        const srcFile = path.join(root, src, part.name);
        const trgFile = path.join(root, trg, part.name);
        const content = fs.readFileSync(srcFile, { encoding: "utf8" });
        let code: string;
        if (path.extname(part.name) !== ".js") {
            code = content;
        }
        else {
            code = obfuscate(content, settings).getObfuscatedCode();
        }
        fs.writeFileSync(trgFile, code, { encoding: "utf8", flag: "w+" });
    });
}

obfuscateDir(__dirname, "../dist2/", "../dist/");