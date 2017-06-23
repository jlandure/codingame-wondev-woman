const size = parseInt(readline());
const unitsPerPlayer = parseInt(readline());
const writeAction = (action) => `${action.type} ${action.unit} ${action.move} ${action.build}`
let unit
let opponent
let lastAction
const grid = []
const computeFuturePosition = (unit, direction) => {
    let {x, y} = unit
    switch(direction) {
        case 'NE':
        case 'NW':
        case 'N': x--;break;
        case 'SE':
        case 'SW':
        case 'S': x++;break;
    }
    switch(direction) {
        case 'NW':
        case 'SW':
        case 'W': y--;break;
        case 'NE':
        case 'SE':
        case 'E': y++;break;
    }
    return {x: x, y: y, hauteur: parseInt(grid[x][y])}
}
    
const compareAction = (a, b) => {
    //TODO: contrer l'adversaire
    
    if(a.coeff == b.coeff) {
        return a.hauteurMove > b.hauteurMove
    }
    return a.coeff < b.coeff
}

const computeCoeffOnAction = (action) => {
    action.futurMove = computeFuturePosition(unit, action.move)
    action.futurBuild = computeFuturePosition(action.futurMove, action.build)
    action.coeff = 0
    if(unit.hauteur === 3 && action.futurMove.hauteur === 3) action.coeff += 1000
    if(action.futurMove.hauteur === unit.hauteur) action.coeff += 150
    if(action.futurMove.hauteur > unit.hauteur) action.coeff += 200
    if(action.futurMove.hauteur - unit.hauteur < 0) action.coeff -= 150
    if(action.futurBuild.hauteur - action.futurMove.hauteur === 1) action.coeff += 100
    return action
}
// game loop
while (true) {
    for (var i = 0; i < size; i++) {
        var row = readline();
        grid[i] = row.split('')
    }
    const units = []
    const opponents = []
    const legalActions = []
    for (var i = 0; i < unitsPerPlayer; i++) {
        var inputs = readline().split(' ');
        unit = {x: parseInt(inputs[1]), y: parseInt(inputs[0])}
        unit.hauteur = grid[unit.x][unit.y]
        units.push(unit)
    }
    for (var i = 0; i < unitsPerPlayer; i++) {
        var inputs = readline().split(' ');
        opponent = {x: parseInt(inputs[1]), y: parseInt(inputs[0])}
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
    let actions = legalActions.map(computeCoeffOnAction)
    actions = actions.sort(compareAction);
    printErr(JSON.stringify(actions[0]))
    printErr(JSON.stringify(actions[1]))
    printErr(JSON.stringify(actions[2]))

    lastAction = actions[0];
    print(writeAction(lastAction));
}
