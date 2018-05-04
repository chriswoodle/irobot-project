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
    let index = directions.indexOf(direction);
    for (let distanceIndex = 0; distanceIndex < 4; distanceIndex++) {
        neighbors[directions[index]].distance = distances[distanceIndex];
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
        if (neighbors[d].x >= 0 && neighbors[d].y >= 0) {
            map[location.x][location.y].neighbors[d] = neighbors[d];
        }
    })
    console.log(map[location.x][location.y]);
}

const visit = () => {
    console.log('visit')
    const distances = lidar.scan();
    setNeighborWeights(getNeighbors(), distances);
    map[location.x][location.y].visited = true;
}

const move = (callback) => {
    console.log('move')
    let target;
    Object.keys(map[location.x][location.y].neighbors).forEach((key) => {
        const neighbor = map[location.x][location.y].neighbors[key];
        if (map[neighbor.x][neighbor.y].visited !== true) {
            target = { direction: key, x: neighbor.x, y: neighbor.y };
        }
    });
    if (target) {
        turnTo(target.direction);
        path.push(target);
        roomba.moveForward(callback)
    } else {
        const previous = path.pop();
        turnTo(previous.direction);
        roomba.moveReverse(callback)
    }
}

const turnTo = (d) => {
    let index = directions.indexOf(direction);
    go();
    const go = () => {
        if (directions[index] == d) return;
        roomba.turn(() => {
            direction = directions[index];
            index++
            if (!(index < 4)) {
                // wrap back around directions array
                index = 0;
            }
            go();
        })
    }
};

setTimeout(() => {
    console.log('starting');
    go();

    const go = () => {
        if (isMapComplete() === true) return;
        visit();
        move(() => {
            console.log(map);
            go();
        });
    }
    console.log('done');
}, 3000);
console.log(map);