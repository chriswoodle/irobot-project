const roomba = require('./roomba');
const lidar = require('./lidar');

const OPEN_WALL_THRESHOLD_DISTANCE = 500;

/*
 * Grid is 4x4
 * {} {} {} {}
 * {} {} {} {}
 * {} {} {} {}
 * {} {} {} {}
 */
const map = [
    [{}, {}, {}, {}],
    [{}, {}, {}, {}],
    [{}, {}, {}, {}],
    [{}, {}, {}, {}],
];

// path of locations visited 
const path = [];

const location = { x: 0, y: 0 };

/*
 *      north
 * west       east
 *      south 
 */
const directions = ['north', 'east', 'south', 'west'];
let direction = 'east';

const isMapComplete = () => {
    let isComplete = true;
    map.forEach((row) => {
        row.forEach((place) => {
            if (place.visited !== true) isComplete = false;
        });
    })
    return isComplete;
};

const getNeighbors = () => {
    const north = { x: location.x, y: location.y - 1 };
    const east = { x: location.x + 1, y: location.y };
    const south = { x: location.x, y: location.y + 1 };
    const west = { x: location.x - 1, y: location.y };
    // console.log(north, east, south, west);
    return { north, east, south, west };
}

// distances [front,right,back,left]
const setNeighborWeights = (neighbors, distances) => {
    console.log(neighbors, distances);
    let index = directions.indexOf(direction);
    for (let distanceIndex = 0; distanceIndex < 4; distanceIndex++) {
        neighbors[directions[index]].distance = distances[distanceIndex];
        console.log(distances[distanceIndex]);
        if (distances[distanceIndex] > OPEN_WALL_THRESHOLD_DISTANCE) {
            console.log('open')
            // Open path
            neighbors[directions[index]].weight = 1;
        } else {
            // Wall
            neighbors[directions[index]].weight = null;
        }

        index++
        if (!(index < 4)) {
            // wrap back around directions array
            index = 0;
        }
    }
    // console.log(neighbors);
    map[location.x][location.y].neighbors = map[location.x][location.y].neighbors || {}
    Object.keys(neighbors).forEach((d) => {
        if (neighbors[d].x >= 0 && neighbors[d].y >= 0 && neighbors[d].x < 4 && neighbors[d].y < 4) {
            map[location.x][location.y].neighbors[d] = neighbors[d];
        }
    })
    console.log(map[location.x][location.y]);
}

const visit = (callback) => {
    console.log('visit')
    if (map[location.x][location.y].visited === true) {
        console.log('visited');
        return callback();
    }
    const distances = lidar.scan();
    setNeighborWeights(getNeighbors(), distances);
    map[location.x][location.y].visited = true;
    callback();
}

const move = (callback) => {
    console.log('move')
    let target;
    let index = directions.indexOf(direction);
    console.log(map[location.x][location.y].neighbors);
    for (let checkIndex = 0; checkIndex < 4; checkIndex++) {
        index++
        if (!(index < 4)) {
            // wrap back around directions array
            index = 0;
        }
        const neighbor = map[location.x][location.y].neighbors[directions[index]];
        if (neighbor && map[neighbor.x][neighbor.y].visited !== true && map[location.x][location.y].neighbors[directions[index]].weight) {
            target = { direction: directions[index], x: neighbor.x, y: neighbor.y };
            break;
        }
    }
    console.log(target);
    if (target) {
        turnTo(target.direction, () => {
            console.log('turntocomplete');
            path.push(target);
            location.x = target.x;
            location.y = target.y;
            roomba.moveForward(callback);
        });

    } else {
        const previous = path.pop();
        console.log('pop path!', previous);
        turnTo(previous.direction, () => {
            console.log('turntocomplete');
            location.x = path[path.length - 1].x;
            location.y = path[path.length - 1].y;
            roomba.moveReverse(callback);
        });
    }
}

const turnTo = (d, callback) => {
    let index = directions.indexOf(direction);
    const go = () => {
        console.log('go')
        if (directions[index] == d) return callback();
        roomba.turn(() => {
            index++
            if (!(index < 4)) {
                // wrap back around directions array
                index = 0;
            }
            direction = directions[index];
            go();
        })
    }
    go();
};

const printMap = () => {
    map.forEach((row) => {
        row.forEach((place) => {
            if (place.visited === true) {
                process.stdout.write('V');
            } else {
                process.stdout.write('X');
            }
        });
        process.stdout.write('\n');
    });
};

setTimeout(() => {
    console.log('starting');

    const go = () => {
        if (isMapComplete() === true) return;
        visit(() => {
            printMap();
            console.log('LOCATION: ', location)
            move(() => {
                console.log('MAP: ', map);
                console.log('PATH: ', path);
                setTimeout(go, 1000);
            });
        });
    }
    go();
    console.log('done');
}, 3000);

console.log(map);