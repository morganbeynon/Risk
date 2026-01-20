import { Territory } from './GameEngine';

let linkRoutes = [];

export function getLinkRoutes() {
    return linkRoutes;
}
class mapGeneration{
findGroup(startID, territories){
        const visited = new Set();
        const startTerr = territories.find(t => t.id === startID)
        if (!startTerr || startTerr.owner === null){
            return new Set()
        }
        const stack = [startID];
        while (stack.length > 0){
            const id = stack.pop();
            if (!visited.has(id)){
                visited.add(id)
                const terr = territories.find(t => t.id == id)
                if (!terr){
                    continue;
                }
                for (const adj of terr.adjacent){
                    const adjTerr = territories.find(t => t.id === adj)
                    if (adjTerr &&  adjTerr.owner !== null && !visited.has(adj)){
                        stack.push(adj)
                    }
                }
            }
        }
        return visited
    }

    findAllGroups(territories){
        const groups = [];
        const visitedTotal = new Set();

        for (const terr of territories){
            if (terr.owner !== null){
            const id = terr.id
            if (!visitedTotal.has(id)){
                const group = this.findGroup(id, territories)
                groups.push(group)
                for (const terr of group){
                    visitedTotal.add(terr)
                }
            }
        }
    }
    console.log("GROUP SIZES:", groups.map(g => g.size))
    return groups
    }

    findDisconnectedTerritories(territories){
        let groups = this.findAllGroups(territories)
        let disconnected = []
        let isDisconnected = false
        if (groups.length > 1){
            disconnected = groups
            isDisconnected = true
        }
        console.log(disconnected)
        return {isDisconnected, disconnected}
    }
    
    manhattanDistance(terrA, terrB) {
        return Math.abs(terrA.row - terrB.row) + Math.abs(terrA.col - terrB.col);
    }

    calcDistance(linkNum,group1, group2, territories){
        if (!group1.size || !group2.size){
            return []
        }
        const minDistA = Array(linkNum).fill(Number.MAX_VALUE)
        let pairs = Array(linkNum).fill(null)
        for (const terr1 of group1){
            const territory1 = territories.find(t1 => t1.id == terr1)
            for (const terr2 of group2){
                const territory2 = territories.find(t2 => t2.id == terr2)
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
    }

    linkRouteCalc(link){
        const start = link[0]
        const end = link[1]
        const route = [start]
        let [x, y] = start.split(",").map(Number)
        let [endX, endY] = end.split(",").map(Number)
  
        while (x !== endX || y !== endY){
            if (x < endX){
                x += 1
            }
            else if(x > endX){
                x -= 1
            }
            if(y < endY){
                y += 1
            }
            else if(y > endY){
                y -= 1
            }
            let id = `${x},${y}`
            route.push(id)
        }
        return route
    }

    addLinkDirection(route){
        for (let i = 1; i < route.length-1; i++){
            let [currX, currY] = route[i].split(",").map(Number)
            let [nextX, nextY] = route[i+1].split(",").map(Number)
            let direction = ""

            if (currX == nextX && currY != nextY){
                direction = "Horizontal"
            }
            else if(currX != nextX && currY == nextY){
                direction = "Vertical"
            }
            else{
                if ((nextX > currX && nextY > currY) || (nextX < currX && nextY < currY)){
                    direction = "Diagonal Right"
                } 
                else if ((nextX > currX && nextY < currY) || (nextX < currX && nextY > currY)){
                    direction = "Diagonal Left"
                }
            }
            route[i] = `${currX},${currY},${direction}`
        }
        return route
    }

    calcLinks(territories){
        let results = this.findDisconnectedTerritories(territories)
        const {isDisconnected, disconnected} = results
        const links = []
        if(isDisconnected){
            const linkNum = 1
            //const linkNum = Math.max(1, Math.round(disconnected.length * Math.random() * 2))
            const numGroups = disconnected.length
            const linkPerGroup = Math.max(1,Math.floor(linkNum/numGroups))
            
            for (let i = 0; i < numGroups - 1; i++) {
                const pairs = this.calcDistance(1,disconnected[i],disconnected[i + 1])
                if (pairs[0]) {
                    links.push(pairs[0])
                }
            }
            const routes = []
            for (const link of links) {
                const route = this.linkRouteCalc(link)
                routes.push(this.addLinkDirection(route))
            }
            console.log(routes)
            return routes   
        }
        return links
    }
    
    createLinks(territories){
        let routes = this.calcLinks()
        let positionRoutes = []
        for (const route of routes){
            let linkNum = 0;
            const len = route.length
            let startEnd = []
            for (const link of route){
                const [lX,lY, direction] = link.split(",")
                if (linkNum == 0){
                    startEnd.push(`${lX},${lY}`)
                }
                else if(linkNum == len -1){
                    startEnd.push(`${lX},${lY}`)
                }
                const currTerritory = territories.find(
                    t => t.row === Number(lX) && t.col === Number(lY)
                )

                if (currTerritory && currTerritory.owner == null){
                    currTerritory.isLink = true
                    currTerritory.linkDirection = direction
                }
                linkNum +=1
            }
            positionRoutes.push(startEnd)
        }
        linkRoutes = positionRoutes;
    }

    createTerritories(){
        const territories = []
        for (let row = 0; row < 15; row++){
           for( let col = 0; col < 15; col++){
                
                    const neighbours = this.getNeighbours(row,col)
                    const id = `${row},${col}`
                    const territory = new Territory( row,col, id, 0, null, neighbours, null, false, null)
                    territories.push(territory)

            } 
        }
        return territories

    }
        
    assignTerritories(){
        const shuffledTerritories = [...this.territories].sort(() => Math.random() - 0.5)
        for (let i = 0; i < shuffledTerritories.length; i++){
            const makeCheck = Math.round(Math.random()) * 3
            if (makeCheck < 1/3){
                const currentPlayer = this.players[i % this.players.length]
                const currentTerritory = shuffledTerritories[i]
                currentTerritory.owner = currentPlayer.id
                currentTerritory.troopCount = 1
                currentPlayer.territories.push(currentTerritory.id)
            }
        }
    }


}