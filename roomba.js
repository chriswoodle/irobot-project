const robot = require("create-oi");

robot.init({ serialport: "/dev/ttyUSB1", version: 1 })

robot.on('ready', function () {
    // twirl towards freedom
    // this.rotate(100);

});

const moveForward = () => {
    robot.drive(100, 0);
    setTimeout(() => {
        stop();
    }, 6000);
};

const moveReverse = () => {
    robot.drive(-100, 0);
    setTimeout(() => {
        stop();
    }, 6000);
};

const turn = () => {
    robot.rotate(-100);
    setTimeout(() => {
        stop();
    }, 4350 / 2);
}

const stop = () => {
    robot.drive(0, 0);
    robot.rotate(0);
}

robot.on('bump', function (bumpEvent) {
    console.log(bumpEvent);
    robot.drive(0, 0);
    robot.rotate(0);
    robot.drive(-100, 0);
    setTimeout(() => {
        stop();
    }, 1000);
});

module.exports = {
    // straighten: straighten,
    // center: center,
    moveForward: moveForward,
    moveReverse: moveReverse,
    turn: turn
}

function exitHandler(options, err) {
    console.log('stopping robot...');
    try {
        robot.rotate(0);
    }
    catch (error) {

    }
    setTimeout(() => {
        process.exit();
    }, 200);
}

//do something when app is closing
process.on('SIGINT', exitHandler);