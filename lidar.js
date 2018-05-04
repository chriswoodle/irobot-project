const spawn = require('child_process').spawnSync;

const scan = () => {
    const results = spawn('python', ['/home/pi/robotics/rplidarbasic.py', 'out.txt']);
    const parts = results.output.toString().trim().split(':');
    const front = parseFloat(parts[0].substring(1));
    const right = parseFloat(parts[1]);
    const back = parseFloat(parts[2]);
    const left = parseFloat(parts[3]);
    const a = parseFloat(parts[4]);
    const b = parseFloat(parts[5]);
    const c = parseFloat(parts[6]);
    console.log(front, right, back, left);
    return { front, right, back, left, a, b, c };
};

module.exports = {
    scan: scan,
}