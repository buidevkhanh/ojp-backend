const signale = require('signale');
const fs = require('fs');
const child_proccess = require('child_process');
const path = require('path');
const { glob } = require('glob');

async function build() {
    try {
        try {
            child_proccess.execSync('rmdir build', {cwd: __dirname});
        } catch (error) {
            signale.warn(error);
        }
        await fs.mkdirSync('./build');
        signale.success(`Create build directory`);
        let listFile = glob.sync(
            path.join(process.cwd(), `**`)
        );
        listFile = listFile.map((file) => {
            return path.normalize(file);
        })
        const buildCompo = listFile.filter((file) => {
            return !file.includes('node_modules') && !file.includes('build');
        });
        const buildDirect = buildCompo.filter((file) => {
            return !path.normalize(file).includes('.') && path.normalize(file) !== path.normalize(__dirname);
        })
        const buildFile = buildCompo.filter((file) => {
            return !buildDirect.includes(file) && path.normalize(file) !== path.normalize(__dirname);;
        })
        buildDirect.forEach(async (directory) => {
            const destination = path.normalize(directory).replace(path.normalize(__dirname), path.normalize(path.join(__dirname, "build")));
            await fs.mkdirSync(destination);
        })

        buildFile.forEach(async (file) => {
            const destination = path.normalize(file).replace(path.normalize(__dirname), path.normalize(path.join(__dirname, "build")));
            fs.copyFileSync(file, destination);
            if(file.includes('.ts')) {
                child_proccess.execSync(`tsc --allowSyntheticDefaultImports --esModuleInterop --target es5 ${destination}`);
            }
        });

        buildFile.forEach(async (file) => {
            const destination = path.normalize(file).replace(path.normalize(__dirname), path.normalize(path.join(__dirname, "build")));
            if(file.includes(".ts")) {
                await fs.unlinkSync(destination);
            }
        })

        signale.success('build success');

    } catch (error) {
        signale.error(`Build failed ` + error);
    }
}

build();