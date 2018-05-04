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
const direction = 'east';

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
    const distances = lidar.scanDistances();
    setNeighborWeights(getNeighbors(), distances);
    map[location.x][location.y].visited = true;
}

const move = () => {
    let target;
    Object.keys(map[location.x][location.y].neighbors).forEach((key) => {
        const neighbor = map[location.x][location.y].neighbors[key];
        if (map[neighbor.x][neighbor.y].visited !== true) {
            target = { direction: key, x: neighbor.x, y: neighbor.y };
        }
    });
    if (target) {
        turnTo(target.direction);
        roomba.moveForward()
        path.push(target);
    } else {
        const previous = path.pop();
        turnTo(previous.direction);
        roomba.moveReverse()
    }
}

const turnTo = (d) => {
    let index = directions.indexOf(direction);
    while (directions[index] != target) {
        roomba.turn()
        direction = directions[index];
        index++
        if (!(index < 4)) {
            // wrap back around directions array
            index = 0;
        }
    }
};

while (false && isMapComplete()) {
    //const distances = lidar.scanDistances()
    visit();
    move();

}

console.log(map);