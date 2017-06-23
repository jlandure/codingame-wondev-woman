const size = parseInt(readline());
const unitsPerPlayer = parseInt(readline());
const writeAction = (action) => `${action.type} ${action.unit} ${action.move} ${action.build}`
let unit
let opponent
let lastAction
const grid = []
const computeFutureMove = (unit, action) => {
    ({x, y} = unit)
    switch(action.move) {
        case 'NE':
        case 'NW':
        case 'N': x--;break;
        case 'SE':
        case 'SW':
        case 'S': x++;break;
    }
    switch(action.x) {
        case 'NW':
        case 'SW':
        case 'W': y--;break;
        case 'NE':
        case 'SE':
        case 'E': y++;break;
    }
    printErr('action [' + action.move + '] futurMove>' + JSON.stringify(unit) + '>' + JSON.stringify({x, y}))
    return {x, y}
}
    
const compareAction = (a, b) => {
    const futurMoveA = computeFutureMove(unit, a)
    const futurMoveB = computeFutureMove(unit, b)
    printErr(grid[futurMoveA.x][futurMoveA.y] + ' vs b=' + grid[futurMoveB.x][futurMoveB.y])
    return grid[futurMoveA.x][futurMoveA.y] > grid[futurMoveB.x][futurMoveB.y]
}
const chooseAction = (actions) => actions.sort(compareAction);
// game loop
while (true) {
    for (var i = 0; i < size; i++) {
        var row = readline();
        grid[i] = parseInt(row.split(''))
    }
    const units = []
    const opponents = []
    const legalActions = []
    for (var i = 0; i < unitsPerPlayer; i++) {
        var inputs = readline().split(' ');
        unit = {y: parseInt(inputs[0]), x: parseInt(inputs[1])}
        units.push(unit)
    }
    for (var i = 0; i < unitsPerPlayer; i++) {
        var inputs = readline().split(' ');
        opponent = {y: parseInt(inputs[0]), x: parseInt(inputs[1])}
        opponents.push(opponent)
    }
    var nbLegalActions = parseInt(readline());
    for (var i = 0; i < nbLegalActions; i++) {
        var inputs = readline().split(' ');
        legalActions.push({
            type: inputs[0],
            unit: parseInt(inputs[1]),
            move: inputs[2],
            build: inputs[3],
        })
    }
    chooseAction(legalActions)
    lastAction = legalActions[0];
    print(writeAction(lastAction));
}
