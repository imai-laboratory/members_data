const fs = require("fs");
const path = require("path");

const members = require("./members.json");

const IMG_DIR = "./imgs";
const PAST_IMG_DIR = "./past_imgs";

// ファイル名が衝突した場合のファイル名変更関数
function renameFileWithIndex(filePath) {
    let index = 1;
    let baseName = path.basename(filePath, path.extname(filePath));
    let dirPath = path.dirname(filePath);
    let newName = `${baseName}_${index}${path.extname(filePath)}`;

    while (fs.existsSync(path.join(dirPath, newName))) {
        index++;
        newName = `${baseName}_${index}${path.extname(filePath)}`;
    }

    fs.renameSync(filePath, path.join(dirPath, newName));
}

function main() {
    fs.readdir(IMG_DIR, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${IMG_DIR}: ${err}`);
            return;
        }

        // members.jsonのすべてのメンバーのimgファイル名を収集する
        const memberImgs = [];
        for (const role of members) {
            for (const member of role.members) {
                if (member.img) {
                    memberImgs.push(member.img);
                }
            }
        }

        // imgsディレクトリのファイルを走査して、members.jsonに存在しないimgファイルをpast_imgsディレクトリに移動する
        for (const file of files) {
            if (fs.statSync(path.join(IMG_DIR, file)).isFile()) {
                if (!memberImgs.includes(file)) {
                    const srcPath = path.join(IMG_DIR, file);
                    const destPath = path.join(PAST_IMG_DIR, file);

                    // 同名のファイルが既に存在する場合、別名を付ける
                    if (fs.existsSync(destPath)) {
                        renameFileWithIndex(destPath);
                    }

                    fs.rename(srcPath, destPath, (err) => {
                        if (err) {
                            console.error(
                                `Error moving file ${srcPath} to ${destPath}: ${err}`
                            );
                        } else {
                            console.log(`Moved file ${srcPath} to ${destPath}`);
                        }
                    });
                }
            }
        }
    });
    console.log("Done.");
}

main();
