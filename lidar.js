const spawn = require('child_process').spawnSync;

const scan = () => {
    const results = spawn('python', ['/home/pi/robotics/rplidarbasic.py', 'out.txt']);
    const parts = results.output.toString().trim().split(' ');
    const front = parts[0].substring(1);
    const right = parts[1];
    const back = parts[2];
    const left = parts[3];
    const a = parts[4];
    const b = parts[5];
    const c = parts[6];
    console.log(front, right, back, left);
    return { front, right, back, left, a, b, c };
};

module.exports = {
    scan: scan,
}