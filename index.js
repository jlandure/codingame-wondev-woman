const size = parseInt(readline());
const unitsPerPlayer = parseInt(readline());
const writeAction = (action) => `${action.type} ${action.unitIndex} ${action.move} ${action.build}`
let unit
let opponent
let lastAction
const grid = []
const distance = (origin, destination) =>
  Math.sqrt(
      Math.pow(destination.x - origin.x, 2) +
      Math.pow(destination.y - origin.y, 2)
  )
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
    if(a.coeff == b.coeff) {
        return a.hauteurMove > b.hauteurMove
    }
    return a.coeff < b.coeff
}

const isDeadEnd = (x, y, unit) => 
        !(x > 0 && y > 0 && x < size-1 && y < size-1
        && grid[x][y] != '.' 
        && (grid[x][y] <= unit.hauteur
        || grid[x][y] === (unit.hauteur + 1)))
const possibleMoves = ({x,y}, unit) => {
    let count = 0
    
    if(isDeadEnd(x, y+1, unit)) count++
    if(isDeadEnd(x+1, y+1, unit)) count++
    if(isDeadEnd(x+1, y, unit)) count++
    if(isDeadEnd(x+1, y-1, unit)) count++
    if(isDeadEnd(x, y-1, unit)) count++
    if(isDeadEnd(x+1, y+1, unit)) count++
    if(isDeadEnd(x-1, y, unit)) count++
    if(isDeadEnd(x-1, y-1, unit)) count++
    if(isDeadEnd(x-1, y+1, unit)) count++
    return 9 - count
}

const computeCoeffOnAction = (action) => {
    if(action === 'MOVE&BUILD') {
            action.futurMove = computeFuturePosition(action.unit, action.move)
        action.futurMove.count = possibleMoves(action.futurMove, action.unit)
        //printErr(JSON.stringify(action))
        action.futurBuild = computeFuturePosition(action.futurMove, action.build)
        action.futurBuild.hauteur += 1
        action.coeff = 0
        
        //jump to score
        if(unit.hauteur === 3 && action.futurMove.hauteur === 3) 
            action.coeff += 1000
        
        //apply game rules on move
        if(action.futurMove.hauteur === 3)
            action.coeff += 750
        if(action.futurMove.hauteur === unit.hauteur) 
            action.coeff += 250
        if(action.futurMove.hauteur > unit.hauteur) 
            action.coeff += 500
        if(action.futurMove.hauteur < unit.hauteur) 
            action.coeff -= 300
        //apply game rules on build
        if(action.futurBuild.hauteur - action.futurMove.hauteur === 1)
            action.coeff += 100
        if(action.futurBuild.hauteur >= 3)
            action.coeff -= 200
        if(action.futurBuild.hauteur - action.futurMove.hauteur >= 2)
            action.coeff -= 50
        //detect deadend    
        if(action.futurMove.count > 6) 
            action.coeff += 100
        if(action.futurMove.count < 2) 
            action.coeff -= 750
        
        //avoid opponent
        if(distance(opponent, action.futurBuild) <= 2) 
            action.coeff -= 300
    }
    
    //use the other unit: not working
    //if(lastAction && lastAction.unitIndex === action.unitIndex) 
    //    count
    //    action.coeff -= 300
    
    // si je suis à 2 alors sautez par terre mais ne pas builder le 2 :/ => build pour remonter
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
        let unitOnAction = parseInt(inputs[1])
        legalActions.push({
            type: inputs[0],
            unitIndex: unitOnAction,
            unit: units[unitOnAction],
            move: inputs[2],
            build: inputs[3],
        })
    }
    
    let actions = legalActions.map(computeCoeffOnAction)
    //choose the unit ?
    actions = actions.sort(compareAction);
    lastAction = actions[0];

    print(writeAction(lastAction));
}

