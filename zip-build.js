import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const outputDir = path.join(__dirname, 'release');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const output = fs.createWriteStream(path.join(outputDir, 'president-says-extension.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    console.log(`\n🎉 배포용 압축 파일이 완성되었습니다!`);
    console.log(`위치: ${path.join(outputDir, 'president-says-extension.zip')}`);
    console.log(`크기: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', (err) => { throw err; });
archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
