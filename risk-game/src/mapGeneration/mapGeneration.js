import { Territory } from '../gameEngine/gameEngine.js';

const MapGeneration= {
    
    //Link Functions 
    getConnectingTerritories(x,y){
        //Uses recursive territory checker
        let connectingNeighbours = new Set();
        let visited = new Set();
        this.recursiveTerritoryChecker(x,y,connectingNeighbours,visited)
        return connectingNeighbours
    },

    recursiveTerritoryChecker(x,y,connectingNeighbours, visited){
        let initialNeighbours = this.getNeighbours(x,y)
        let id = `${x},${y}`
        visited.add(id)
        //Iterates each neighbour calling the function recursively
        for (let i = 0; i < initialNeighbours.length; i++) {
            const currentNeighbour = initialNeighbours[i]
            if (!visited.has(currentNeighbour)){

                const terr = this.territories.find(t => t.id === currentNeighbour)
                if (terr){

                    if (
                        terr.owner === this.getCurrentPlayer().id ||
                        terr.isLink === true
                    ) {
                        connectingNeighbours.add(currentNeighbour)
                        const [nx, ny] = currentNeighbour.split(',').map(Number)
                        this.recursiveTerritoryChecker(nx, ny, connectingNeighbours, visited)
                    }
                }
            }
        }
        //Same approach using links
        for (const [a, b] of this.linkRoutes) {
            if (!(a !== id && b !== id)){
                const linkedID = a === id ? b : a
                if (!visited.has(linkedID)){
                    const terr = this.territories.find(t => t.id === linkedID)
                    if (terr){
                        if (
                            terr.owner === this.getCurrentPlayer().id ||
                            terr.isLink === true
                        ) {
                            connectingNeighbours.add(linkedID)
                            const [lx, ly] = linkedID.split(',').map(Number)
                            this.recursiveTerritoryChecker(lx, ly, connectingNeighbours, visited)
                        }
                    }
                }
            }
        }

        return connectingNeighbours
    },


    createTerritories(){
        //iterate 6x6 grid, creating blank territories
        this.territories = []
        for (let row = 0; row < 6; row++){
        for( let col = 0; col < 6; col++){
                    const neighbours = this.getNeighbours(row,col)
                    const id = `${row},${col}`
                    const territory = new Territory( row,col, id, 0, null, neighbours, false, null)
                    this.territories.push(territory)
            } 
        }

    },
            
    assignTerritories(){
        //Shuffle and distribute 1 territory per player
        const shuffledTerritories = [...this.territories].sort(() => Math.random() - 0.5)
        let index = 0
        let playableTerrs = []
        for (let i = 0; i < this.players.length; i++) {
            playableTerrs.push(shuffledTerritories[i]);
        }

        for (let i = this.players.length; i < shuffledTerritories.length; i++){
            if (Math.random() < 0.65){
                playableTerrs.push(shuffledTerritories[i])
            }
        }
        //distribute rest evenly
        for (const terr of playableTerrs){
            const currentPlayer = this.players[index % this.players.length]
            const currentTerritory = terr
            currentTerritory.owner = currentPlayer.id
            currentTerritory.troopCount = 1
            currentPlayer.territories.push(currentTerritory.id)
            index++;
        }
        
    },

    attemptLinks(){
        //Start the link process
        this.resetLinks()
        //Check for disconnected groups and begin link calc if so
        const {disconnected} = this.findDisconnectedTerritories()
        if (disconnected.length <= 1){
            return true
        }
        this.createLinks(disconnected)
        const { isDisconnected } = this.findDisconnectedTerritories()
        return !isDisconnected
    },

    resetLinks(){
        //Clears link routes
        this.linkRoutes = []
        for(const terr of this.territories){
            terr.isLink = false
            terr.linkDirection = null
        }
    },

    findDisconnectedTerritories(){
        let groups = this.findAllGroups()
        //Returns boolean representing if map is connected and groups of territories
        let disconnected = []
        let isDisconnected = false
        if (groups.length > 1){
            disconnected = groups
            isDisconnected = true
        }
        console.log("Disconnected", disconnected)
        return {isDisconnected, disconnected}
    },

    findAllGroups(){
        const groups = [];
        const visitedTotal = new Set();
        //iterates each territory, returning set groups
        for (const terr of this.territories){
            if (terr.owner !== null || terr.isLink === true){
                const id = terr.id
                if (!visitedTotal.has(id)){
                    const group = this.findGroup(id)
                    groups.push(group)
                    for (const terr of group){
                        visitedTotal.add(terr)
                    }
                }
            }
        }
    console.log("GROUP SIZES:", groups.map(g => g.size))
    return groups
    },

    findGroup(startID){
        //Find the all attaching territories to a territory
        const visited = new Set();
        const startTerr = this.territories.find(t => t.id === startID)
        if (!startTerr || startTerr.owner === null){
            return new Set()
        }
        const stack = [startID];
        while (stack.length > 0){
            const id = stack.pop();
            if (!visited.has(id)){
                visited.add(id)
                const terr = this.territories.find(t => t.id == id)
                if (!terr){
                    continue;
                }
                for (const adj of terr.adjacent){
                    const adjTerr = this.territories.find(t => t.id === adj)
                    if (
                        adjTerr &&
                        (adjTerr.owner !== null || adjTerr.isLink === true) &&
                        !visited.has(adj)
                    ){
                        stack.push(adj)
                    }
                }

                for (const [a, b] of this.linkRoutes){
                    if (a === id && !visited.has(b)) stack.push(b)
                    if (b === id && !visited.has(a)) stack.push(a)
                }
            }
        }
        return visited
    },

    createLinks(disconnected) {
        this.linkRoutes = [];
        //calculate links
        const pairs = this.calcLinks(disconnected);
        const positionRoutes = [];
        //Create routes
        for (const pair of pairs) {
            let route =
                this.linkRouteCalc(pair) ||
                this.linkRouteCalc([pair[1], pair[0]]);

            if (!route) {
                console.warn("No route found for", pair);
                continue;
            }
            //orthognalise  and add direction
            const orthRoute = this.orthogonalisePath(route) || route;
            const linkDirections = this.addLinkDirection(orthRoute);
            //change link territory attributes
            for (const cell of orthRoute) {
                const [x, y] = cell.split(",").map(Number);
                const terr = this.findTerritory(x, y);

                if (terr && terr.owner === null) {
                    terr.isLink = true;
                    terr.linkDirection = linkDirections.get(cell);
                }
            }

            positionRoutes.push([orthRoute[0], orthRoute.at(-1)]);
        }

        this.linkRoutes = positionRoutes;
    },

    calcLinks(disconnected) {
        const links = [];
        if (disconnected.length <= 1) return links;
        const remaining = [...disconnected];
        const connected = [remaining.shift()]; 
        //iterate groups 
        while (remaining.length) {
            let minDist = Infinity;
            let minPair = null;
            let removeIndex = -1;

            for (let i = 0; i < connected.length; i++) {
                for (let j = 0; j < remaining.length; j++) {
                    //find smallest distance between groups
                    const pair = this.calcDistance(1, connected[i], remaining[j])[0];
                    if (!pair) continue;
                    const terr1 = this.territories.find(t => t.id === pair[0]);
                    const terr2 = this.territories.find(t => t.id === pair[1]);
                    const dist = this.manhattanDistance(terr1, terr2);
                    if (dist < minDist) {
                        minDist = dist;
                        minPair = pair;
                        removeIndex = j;
                    }
                }
            }
            //select shortest pair
            if (minPair) {
                links.push(minPair);
                connected.push(remaining.splice(removeIndex, 1)[0]);
            } else {
                console.log("Failed to link all groups");
                break;
            }
        }

        return links;
    },

    calcDistance(linkNum,group1, group2){
        if (!group1.size || !group2.size){
            return []
        } 
        const minDistA = Array(linkNum).fill(Number.MAX_VALUE)
        let pairs = Array(linkNum).fill(null)
        //compare every potential pair
        for (const terr1 of group1){
            const territory1 = this.territories.find(t1 => t1.id == terr1)
            for (const terr2 of group2){
                //Use manhattan distance
                const territory2 = this.territories.find(t2 => t2.id == terr2)
                let distance = this.manhattanDistance(territory1, territory2)
                let pair = [territory1.id, territory2.id]
                for (let i = 0; i < minDistA.length; i++){
                    if (distance < minDistA[i]){
                        for (let j = linkNum - 1; j > i; j--) {
                            minDistA[j] = minDistA[j - 1];
                            pairs[j] = pairs[j - 1];
                        }
                        minDistA[i] = distance
                        pairs[i] = pair
                        break
                    }
                }
            }
        }
        return pairs
    },

    manhattanDistance(terrA, terrB) {
        return Math.abs(terrA.row - terrB.row) + Math.abs(terrA.col - terrB.col);
    },

    //BFS to find shorted route for links
    linkRouteCalc(link){
        //get start, end of route
        const start = link[0]
        const end = link[1]
        //Route initiates with start terr
        const route = [[start]]
        const visited = new Set()
        visited.add(start)
        //Exhaust all options
        while (route.length > 0){
            //Get latest route pair of territories and get end terr
            const path = route.shift()
            const curr = path[path.length -1]
            //return if route is at end
            if (curr == end){
                return path;
            }
            const terr = this.territories.find(t => t.id === curr)
            if (!terr){
                continue
            }

            //Iterate territory neighbours, validate and add to route if so.
            for (const neigh of this.getDirectNeighbours(terr.row, terr.col)) {
                if (visited.has(neigh)) continue;

                const neighTerr = this.territories.find(t => t.id === neigh)
                if (!neighTerr){
                    continue;
                }

                if (neighTerr.owner === null || neigh === end) {
                    visited.add(neigh);
                    route.push([...path, neigh]);
                }
            }
        } 
        return null 
    },

    getDirectNeighbours(x,y){
            //FOR LINKS - does not look at diagonals
            let directions = [[1,0], [-1,0], [0,1], [0,-1]]
            const neighbours = []
            for (const [px, py] of directions){
                let rx = x + px
                let ry = y + py
                if (rx < 6 && ry < 6 && rx >= 0 && ry >= 0){
                    neighbours.push(`${rx},${ry}`)
                }
            }
            return neighbours
    },


    orthogonalisePath(route) {
        //Get route and create visited set
        const result = [route[0]]
        const visited = new Set(result)
        //Iterate from second territory in route
        for (let i = 1; i < route.length; i++) {
            //get territory and one previous
            const [x1, y1] = route[i - 1].split(",").map(Number)
            const [x2, y2] = route[i].split(",").map(Number)
            //Check for diagonal move
            if (x1 !== x2 && y1 !== y2) {
                //Create corner and validate it, add if suitable
                const mid = `${x2},${y1}`
                const midTerr = this.territories.find(t => t.id === mid)
                if (
                    midTerr &&
                    midTerr.owner === null &&
                    midTerr.isLink === false
                ) {
                    if (!visited.has(mid)) {
                        result.push(mid)
                        visited.add(mid)
                    }
                    
                } else {
                    return null 
                }
                
            }
            //Push end terr and return
            const end = `${x2},${y2}`
            if (!visited.has(end)) {
                result.push(end)
                visited.add(end)
            }
        }

        return result
    },

    addLinkDirection(route) {
        const directions = new Map();

        for (let i = 0; i < route.length; i++) {
            const [cx, cy] = route[i].split(",").map(Number);
            let dir = null;

            if (i === 0) {
                // First cell: look at next
                const [nx, ny] = route[i + 1].split(",").map(Number);
                if (nx !== cx) dir = "Vertical";
                else dir = "Horizontal";
            } else if (i === route.length - 1) {
                // Last cell: look at previous
                const [px, py] = route[i - 1].split(",").map(Number);
                if (px !== cx){
                    dir = "Vertical";
                }
                else{ 
                        dir = "Horizontal";
                    }
            } else {
                // Middle cell: look at previous and next
                const [px, py] = route[i - 1].split(",").map(Number);
                const [nx, ny] = route[i + 1].split(",").map(Number);

                const dxPrev = px-cx;
                const dyPrev = py-cy;
                const inOrient = this.cornerOrientation(dxPrev, dyPrev)

                const dxNext = nx - cx;
                const dyNext = ny - cy;
                const outOrient = this.cornerOrientation(dxNext, dyNext)

                // Straight line
                if ((inOrient == "N" && outOrient == "S" || inOrient == "S" && outOrient == "N") || (inOrient == "W" && outOrient == "E" || inOrient == "E" && outOrient == "W")) {
                    if(inOrient == "N" || inOrient == "S"){
                        dir = "Vertical"
                    }
                    else{
                        dir = "Horizontal"
                    }
                } else {
                    // Determine corner type
                    if ((inOrient == "S" && outOrient == "E") || (inOrient == "E" && outOrient == "S")){
                        dir = "CornerSE";
                    }
                    else if ((inOrient == "N" && outOrient == "E") || (inOrient == "E" && outOrient == "N")){
                        dir = "CornerNE";
                    }
                    else if ((inOrient == "S" && outOrient == "W") || (inOrient == "W" && outOrient == "S")){
                        dir = "CornerSW";
                    }
                    else if ((inOrient == "N" && outOrient == "W") || (inOrient == "W" && outOrient == "N")){
                        dir = "CornerNW";
                    }
                }
            }

            directions.set(`${cx},${cy}`, dir);
        }

        return directions;
    },

    //Returns one of four cardinal directions
    cornerOrientation(dx, dy) {
        if (dx === -1 && dy === 0) {
            return "N"; // up
        } 
        else if (dx === 1 && dy === 0) {
            return "S"; // down
        } 
        else if (dx === 0 && dy === 1) {
            return "E"; // right
        } 
        else if (dx === 0 && dy === -1) {
            return "W"; // left
        } 
        else {
            return null;
        }
    },

}
export { MapGeneration };