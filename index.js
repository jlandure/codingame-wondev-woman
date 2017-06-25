const size = parseInt(readline());
const unitsPerPlayer = parseInt(readline());
const writeAction = (action) => `${action.type} ${action.unit} ${action.move} ${action.build}`
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
    //TODO: contrer l'adversaire
    
    if(a.coeff == b.coeff) {
        return a.hauteurMove > b.hauteurMove
    }
    return a.coeff < b.coeff
}

const isDeadEnd = (x, y) => 
        !(x > 0 && y > 0 && x < size-1 && y < size-1
        && grid[x][y] != '.' 
        && (grid[x][y] <= unit.hauteur
        || grid[x][y] === (unit.hauteur + 1)))
const possibleMoves = ({x,y}) => {
    let count = 0
    
    if(isDeadEnd(x, y+1)) count++
    if(isDeadEnd(x+1, y+1)) count++
    if(isDeadEnd(x+1, y)) count++
    if(isDeadEnd(x+1, y-1)) count++
    if(isDeadEnd(x, y-1)) count++
    if(isDeadEnd(x+1, y+1)) count++
    if(isDeadEnd(x-1, y)) count++
    if(isDeadEnd(x-1, y-1)) count++
    if(isDeadEnd(x-1, y+1)) count++
    return 9 - count
}

const computeCoeffOnAction = (action) => {
    action.futurMove = computeFuturePosition(unit, action.move)
    action.futurMove.count = possibleMoves(action.futurMove)
    //printErr(JSON.stringify(action))
    action.futurBuild = computeFuturePosition(action.futurMove, action.build)
    action.futurBuild.hauteur += 1
    action.coeff = 0
    
    //jump to score
    if(unit.hauteur === 3 && action.futurMove.hauteur === 3) 
        action.coeff += 1000
    
    //apply game rules
    if(action.futurMove.hauteur === unit.hauteur) 
        action.coeff += 150
    if(action.futurMove.hauteur > unit.hauteur) 
        action.coeff += 200
    if(action.futurMove.hauteur - unit.hauteur < 0) 
        action.coeff -= 150
    if(action.futurMove.hauteur - unit.hauteur === -1) 
        action.coeff += 100
    if(action.futurBuild.hauteur - action.futurMove.hauteur === 1)
        action.coeff += 100
    //if(action.futurBuild.hauteur === 3)
    //    action.coeff -= 200
    if(action.futurBuild.hauteur - action.futurMove.hauteur >= 2)
        action.coeff -= 150
    
    //detect deadend    
    if(action.futurMove.count > 6) action.coeff += 100
    if(action.futurMove.count < 2) action.coeff -= 1001
    
    //avoid opponent
    if(distance(opponent, action.futurBuild) <= 1) action.coeff -= 150
    
    //ne pa builder sur les 3 si l'adversaire est loin
    //essayer de faire un carré. 
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
        legalActions.push({
            type: inputs[0],
            unit: parseInt(inputs[1]),
            move: inputs[2],
            build: inputs[3],
        })
    }
    let actions = legalActions.map(computeCoeffOnAction)
    actions = actions.sort(compareAction);
    lastAction = actions[0];
    if(actions.length <= 3) lastAction = actions[actions.length - 1]
    //printErr('lastAction>' + JSON.stringify(lastAction))
    //printErr(JSON.stringify(actions[1]))
    //printErr(JSON.stringify(actions[2]))
    
    print(writeAction(lastAction));
}

