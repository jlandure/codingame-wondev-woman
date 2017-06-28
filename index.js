const size = parseInt(readline());
const unitsPerPlayer = parseInt(readline());
const writeAction = (action) => `${action.type} ${action.unitIndex} ${action.move} ${action.build}`
let lastAction
const nbActionUnit = [0, 0];
let opponents = []
let units = []
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

const isDeadEnd = (x, y, hauteur) => 
        !(x > 0 && y > 0 && x < size-1 && y < size-1
        && grid[x][y] != '.' 
        && grid[x][y] <= hauteur+1)
const possibleMoves = ({x,y}) => {
    let count = 0
    let hauteur = grid[x][y]
    if(isDeadEnd(x, y+1, hauteur)) count++
    if(isDeadEnd(x+1, y+1, hauteur)) count++
    if(isDeadEnd(x+1, y, hauteur)) count++
    if(isDeadEnd(x+1, y-1, hauteur)) count++
    if(isDeadEnd(x, y-1, hauteur)) count++
    if(isDeadEnd(x+1, y+1, hauteur)) count++
    if(isDeadEnd(x-1, y, hauteur)) count++
    if(isDeadEnd(x-1, y-1, hauteur)) count++
    if(isDeadEnd(x-1, y+1, hauteur)) count++
    return 9 - count
}

const computeCoeffOnAction = (action) => {
    action.coeff = 0
    if(action.type === 'MOVE&BUILD') {
        action.futurMove = computeFuturePosition(action.unit, action.move)
        action.futurMove.count = possibleMoves(action.futurMove)
        action.futurBuild = computeFuturePosition(action.futurMove, action.build)
        action.futurBuild.hauteur += 1
        
        action.count = possibleMoves(action.unit)
        if(action.count === 0)
            action.coeff += 1500
        if(action.unit.hauteur === 3)
            action.coeff -= 500
        
        //jump to score
        if(action.futurMove.hauteur === 3 
            && action.futurMove.count !== 0)
            action.coeff += 2000
        
        //apply game rules on move
        if(action.futurMove.hauteur === unit.hauteur) 
            action.coeff += 300
        if(action.futurMove.hauteur > unit.hauteur) 
            action.coeff += 1500
        if(action.futurMove.hauteur < unit.hauteur) 
            action.coeff -= 300
        //apply game rules on build
        if(action.futurBuild.hauteur - action.futurMove.hauteur === 1)
            action.coeff += 100
        if(action.futurBuild.hauteur === 3)
            action.coeff += 500
        if(action.futurBuild.hauteur === 4)
            action.coeff -= 300
        if(action.futurBuild.hauteur - action.futurMove.hauteur >= 2)
            action.coeff -= 500
        //avoid build blocking units
        const otherUnit = units[action.unitIndex === 0 ? 1 : 0]

        if(distance(action.futurBuild, otherUnit) <= 1)
            if(isDeadEnd(action.futurBuild.x, action.futurBuild.y, {hauteur: grid[otherUnit.x][otherUnit.y]})) {
                action.coeff -= 500        
            }
            
        
        //detect deadend    
        //if(action.futurMove.count > 6) 
        //    action.coeff += 100
        //if(action.futurMove.count < 2)
        //    action.coeff -= 1500
        if(action.futurMove.count === 0)
            action.coeff -= 1500
        
        //avoid opponent
        if(((opponents[0] && distance(opponents[0], action.futurBuild) <= 2)
            || (opponents[1] && distance(opponents[1], action.futurBuild) <= 2))
            && grid[action.futurBuild.x][action.futurBuild.y] >= 2) 
            //opponent will go up
            action.coeff -= 300
        
        if((opponents[0] && distance(opponents[0], action.futurBuild) > 3)
            || (opponents[1] && distance(opponents[1], action.futurBuild) > 3))
            //opponent will go up
            action.coeff += 500
            
        if((opponents[0] && distance(opponents[0], action.futurMove) <= 2)
            || (opponents[1] && distance(opponents[1], action.futurMove) <= 2)) {
            //opponent will push
            action.coeff -= 500
            if(action.unit.hauteur === 3) action.coeff -= 500
            }
    }
    
    if(action.type === 'PUSH&BUILD') {

        action.coeff += 2000;
        action.futurePush = computeFuturePosition(action.unit, action.move)
        action.futureLanding = computeFuturePosition(action.futurePush, action.build)
        if(action.futurePush.hauteur === 2)
            action.coeff += 500
        if(action.futureLanding.hauteur === 3)
            action.coeff -= 500
        if(action.futurePush > action.futureLanding.hauteur)
            //opponent down
            action.coeff += 1000
        let possibleMovesForOpponent = possibleMoves(action.futureLanding)
        printErr('possibleMovesForOpponent>' + possibleMovesForOpponent)
        if(possibleMovesForOpponent === 0)
            action.coeff += 2000
        if(possibleMovesForOpponent < 6)
            action.coeff += 1000
        
    }
    
    return action
}
// game loop
while (true) {
    for (var i = 0; i < size; i++) {
        var row = readline();
        grid[i] = row.split('')
    }
    const legalActions = []
    units = []
    for (var i = 0; i < unitsPerPlayer; i++) {
        var inputs = readline().split(' ');
        unit = {x: parseInt(inputs[1]), y: parseInt(inputs[0])}
        unit.hauteur = grid[unit.x][unit.y]
        units.push(unit)
    }
    opponents = []
    for (var i = 0; i < unitsPerPlayer; i++) {
        var inputs = readline().split(' ');
        opponent = {x: parseInt(inputs[1]), y: parseInt(inputs[0])}
        if(opponent.x !== -1) 
            opponents.push(opponent)
    }
    var nbLegalActions = parseInt(readline());
    if(nbLegalActions === 0) {print("ACCEPT-DEFEAT This is the end!"); break;}

    for (var i = 0; i < nbLegalActions; i++) {
        var inputs = readline().split(' ');
        let unitOnAction = parseInt(inputs[1])
        legalActions.push({
            type: inputs[0],
            unitIndex: parseInt(unitOnAction),
            unit: units[unitOnAction],
            move: inputs[2],
            build: inputs[3],
        })
    }
    
    let actions = legalActions
    //choose the unit ?
    const diffActionUnit = nbActionUnit[0] - nbActionUnit[1]
    if(diffActionUnit > 5 && grid[units[0].x][units[0].y] >= 2)
        actions = actions.filter((action) => action.unitIndex === 1)
    if(diffActionUnit < -5 && grid[units[1].x][units[1].y] >= 2)
        actions = actions.filter((action) => action.unitIndex === 0)
    if(actions.length === 0) 
        //reset if no action for choosen unit
        actions = legalActions
    actions = actions.map(computeCoeffOnAction)
    actions = actions.sort(compareAction)
    lastAction = actions[0]
    nbActionUnit[lastAction.unitIndex] += 1
    print(writeAction(lastAction));
}
