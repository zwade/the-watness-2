import * as path from "path";

import * as fs from "fs-extra";
import sharp from "sharp";
import mkdirp from "mkdirp";

const WIDTH = 630;
const HEIGHT = 393;

type FileElement =
    | { kind: "file", name: string, path: string }
    | { kind: "folder", name: string, path: string }
    ;

async function getFiles(baseDir: string) {
    let files = await fs.readdir(baseDir);
    let elements = await Promise.all(files.map(async (file) => {
        if (file[0] === ".") {
            return undefined;
        }

        let filePath = path.join(baseDir, file);

        let stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            return { kind: "folder", name: file, path: filePath };
        } else if (stats.isFile()) {
            return { kind: "file", name: file, path: filePath };
        }
    }));

    return elements.filter((elt): elt is FileElement => elt !== undefined);
}

function pack32be(value: number) {
    value = Math.floor(value);
    return Buffer.from([
        (value / 256 ** 3) % 256,
        (value / 256 ** 2) % 256,
        (value / 256 ** 1) % 256,
        (value / 256 ** 0) % 256,
    ]);
}

function pasteBuffer(b1: Buffer, b2: Buffer, loc: number) {
    for (let i = 0; i < b2.length; i++) {
        b1[loc + i] = b2[i];
    }
}

function insertBuffer(b1: Buffer, b2: Buffer, loc: number) {
    let result = Buffer.alloc(b1.length + b2.length);
    for (let i = 0; i < b1.length + b2.length; i++) {
        if (i < loc) {
            result[i] = b1[i];
        } else if (i < loc + b2.length) {
            result[i] = b2[i-loc];
        } else {
            result[i] = b1[i-b2.length];
        }
    }
    return result;
}

async function createPict(filePath: string) {
    let result = await fs.readFile(path.join(__dirname, "template.pict"));
    let image = sharp(filePath);
    let imageData = await image.resize({ width: WIDTH, height: HEIGHT }).toFormat("jpg").toBuffer();
    if (imageData.length % 2 === 1) {
        imageData = Buffer.concat([imageData, Buffer.from([0])]);
    }
    let imageSize = pack32be(imageData.length);
    let pictSize = pack32be(imageData.length + 154);
    pasteBuffer(result, pictSize, 576);
    pasteBuffer(result, imageSize, 692);
    result = insertBuffer(result, imageData, 734);
    return result;
}

async function main() {
    let inputDirectory = path.join(__dirname, "../witness-shots/");
    let outputDirectory = path.join(__dirname, "../witness-stills/picts/");

    await mkdirp(outputDirectory);

    (await getFiles(inputDirectory))
        .filter(({ kind }) => kind === "folder")
        .forEach(async ({ name: folderName, path: folderPath }) =>
            (await getFiles(folderPath))
            .filter(({ kind }) => kind === "file")
            .forEach(async ({ name: fullFileName, path: filePath }) => {
                let pict = await createPict(filePath);
                let fileBaseName = fullFileName.split(".")[0];
                let fileName = `${folderName}-${fileBaseName}.pict`;
                let outputFilePath = path.join(outputDirectory, fileName);
                console.log(outputFilePath);
                await fs.writeFile(outputFilePath, pict);
            }));
}

main();
