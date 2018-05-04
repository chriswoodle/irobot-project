const spawn = require('child_process').spawnSync;

const scan = () => {
    const results = spawn('python', ['rplidar.py', 'out.txt']);
    const parts = results.split(' ');
    const front = parts[0];
    const right = parts[1];
    const back = parts[2];
    const left = parts[3];
    const a = parts[4];
    const b = parts[5];
    const c = parts[6];
    return { front, right, back, left, a, b, c };
};

module.exports = {
    scan: scan,
}