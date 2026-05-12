import { Player, Territory, Card, GameEngine } from "../gameEngine.js";
import { describe, it, expect, beforeEach, vi } from "vitest";
 //make player 
function makePlayer(id, territories = [], deployableTroops = 5, cards = []) {
    return new Player(id, `socket_${id}`, territories, 0, 0, 0, deployableTroops, cards, "red", false, false);
}
 
//Small two player engine
function makeEngine() {
    const p1 = makePlayer("John", ["0,0"]);
    const p2 = makePlayer("Jane",   ["0,1"]);
 
    const t1 = new Territory(0, 0, "0,0", 5, "John", ["0,1"]);
    const t2 = new Territory(0, 1, "0,1", 3, "Jane",   ["0,0"]);
 
    Territory.instances = [];
 
    const engine = new GameEngine([p1, p2], [t1, t2], 0, 0);
    engine.roundCount = 1;
    engine.linkRoutes = [];
    return { engine, p1, p2, t1, t2 };
}
//Engine for connected terrs
function makeConnectedEngine() {
    const { engine, p1, t1, t2 } = makeEngine()
    t2.owner = "John";
    p1.territories.push("0,1"); 
    t1.troopCount = 6;
    t2.troopCount = 2;
 
    vi.spyOn(engine, "getConnectingTerritories").mockReturnValue(new Set(["0,1"])); 
    return { engine, p1, t1, t2 }
}
//Engine with eliminated player
function makeEliminatedEngine() {
    const p1 = makePlayer("John", ["0,0"]);
    const p2 = makePlayer("Lewis", [])
    const p3 = makePlayer("Jane",   ["0,1"]);
 
    const t1 = new Territory(0, 0, "0,0", 5, "John", ["0,1"]);
    const t2 = new Territory(0, 1, "0,1", 3, "Jane",   ["0,0"]);
 
    Territory.instances = [];
 
    const engine = new GameEngine([p1, p2, p3], [t1, t2], 0, 0);
    engine.roundCount = 1;
    engine.linkRoutes = [];
    return { engine, p1, p2, t1, t2 };
}

describe("deploy()", () => {
    it("increases troops in owned territories", () =>{
        const {engine, p1, t1} = makeEngine()
        const pre = t1.troopCount
        engine.deploy(p1,t1,3)
        
        expect(t1.troopCount).toBe(pre + 3)
    })
    it("reduces players deployable troops", () =>{
        const {engine, p1, t1} = makeEngine()
        p1.deployableTroops = 8
        engine.deploy(p1,t1,3)
        expect(p1.deployableTroops).toBe(5)
    })
    it("increases players placed troops", () =>{
        const {engine, p1, t1} = makeEngine()
        p1.placedTroops = 0
        engine.deploy(p1,t1,3)
        expect(p1.placedTroops).toBe(3)
    })
    it("rejects deployment to a territory owned by another player", () => {
        const { engine, p1, t2 } = makeEngine(); 
        const result = engine.deploy(p1, t2, 2);
 
        expect(result).toEqual({ error: "INVALID_ATTACK_OWNED_TERRITORY" });
    });
    it("returns false if the player is not found in the engine", () => {
        const { engine, t1 } = makeEngine();
        const kate = makePlayer("Kate");
        const result = engine.deploy(kate, t1, 1);
 
        expect(result).toBe(false);
    });
    it("handles string amounts by coercing to a number", () => {
        const { engine, p1, t1 } = makeEngine();
        const pre = t1.troopCount;
        engine.deploy(p1, t1, "3");
        expect(t1.troopCount).toBe(pre + 3);
    });
});

//Test attack
describe("attack()", () =>{
    it("returns error when attacking owned territory", () => {
        const { engine, p1, t1 } = makeEngine();
        const result = engine.attack(p1, t1, t1);
 
        expect(result).toEqual({ error: "INVALID_ATTACK_OWNED_TERRITORY" });
    })
    it("returns error when attacking non adjacent territory", () => {
        const { engine, p1, p2, t1 } = makeEngine();
        const badTerr = new Territory(5, 5, "5,5", 2, "Jane", []);
        engine.territories.push(badTerr);
        p2.territories.push("5,5");
        const result = engine.attack(p1, t1, badTerr);
 
        expect(result).toEqual({ error: "INVALID_ATTACK_NOT_ADJACENT" });
    })
    it("returns error when attacking territory with 1 troop", () => {
        const { engine, p1, p2, t1, t2 } = makeEngine();
        t1.troopCount = 1
        const badTerr = new Territory(5, 5, "5,5", 2, "Jane", []);
        const result = engine.attack(p1, t1, t2);
 
        expect(result).toEqual({ error: "INVALID_ATTACK_NO_TROOPS" });
    })
    it("transfers territory ownership on attacker win", () => {
        const { engine, p1, p2, t1, t2 } = makeEngine();
        t1.troopCount = 10;
        t2.troopCount = 1;
 
        let callCount = 0;
        vi.spyOn(Math, "random").mockImplementation(() => {
            callCount++;
            if (callCount % 2 == 0){
                return 0.99;
            }
            return 0.1;
        });
 
        const result = engine.attack(p1, t1, t2);
 
        expect(result.result).toBe(true);
        expect(t2.owner).toBe("John");
        expect(p1.territories).toContain("0,1");
        expect(p2.territories).not.toContain("0,1");
        vi.restoreAllMocks();
    });
    it("transfers card on attacker win", () => {
        const { engine, p1, p2, t1, t2 } = makeEngine();
        t1.troopCount = 10;
        t2.troopCount = 1;
 
        let callCount = 0;
        vi.spyOn(Math, "random").mockImplementation(() => {
            callCount++;
            if (callCount % 2 == 0){
                return 0.99;
            }
            return 0.1;
        });
 
        const result = engine.attack(p1, t1, t2);
 
        expect(p1.cards.length).toBeGreaterThan(0);
        expect(p1.recievedCard).toBe(true);
        vi.restoreAllMocks();
    });
    it("doesnt transfers card on 2nd attacker win", () => {
        const { engine, p1, p2, t1, t2 } = makeEngine();
        t1.troopCount = 10;
        t2.troopCount = 1;
        p1.recievedCard = true;
        let callCount = 0;
        vi.spyOn(Math, "random").mockImplementation(() => {
            callCount++;
            if (callCount % 2 == 0){
                return 0.99;
            }
            return 0.1;
        });
 
        const result = engine.attack(p1, t1, t2);
 
        expect(p1.cards.length).toBe(0);
        vi.restoreAllMocks();
    });
    it("transfers eliminated defender's cards to the attacker", () => {
        const { engine, p1, p2, t1, t2 } = makeEngine();
        t1.troopCount = 10;
        t2.troopCount = 1;
        const defenderCard = new Card(99, "0,1", "Tank");
        p2.cards = [defenderCard];
        let callCount = 0
        vi.spyOn(Math, "random").mockImplementation(() => {
            callCount++;
            if (callCount % 2 == 0){
                return 0.99;
            }
            return 0.1;
        });
        engine.attack(p1, t1, t2);
 
        expect(p1.cards.map(c => c.id)).toContain(99);
        expect(p2.cards.length).toBe(0);
        expect(p2.beat).toBe(true);
        vi.restoreAllMocks();
    });
 
    it("returns result:false when the attack fails", () => {
        const { engine, p1, t1, t2 } = makeEngine();
        t1.troopCount = 2;
        t2.troopCount = 10;
 
       let callCount = 0
        vi.spyOn(Math, "random").mockImplementation(() => {
            callCount++;
            if (callCount % 2 == 0){
                return 0.1;
            }
            return 0.99;
        });
 
        const result = engine.attack(p1, t1, t2);
 
        expect(result.result).toBe(false);
        expect(t2.owner).toBe("Jane"); 
        vi.restoreAllMocks();
    });
})

//Reinforce 
describe("reinforce()", () => {
    it("moves troops to destination", () =>{
        const {engine,p1, p2, t1 ,t2} = makeConnectedEngine();
        engine.reinforce(p1,t1,t2,3);

        expect(t1.troopCount).toBe(3);
        expect(t2.troopCount).toBe(5);
    })
    it("rejects move with more troops than allocated", () =>{
        const {engine,p1, p2, t1 ,t2} = makeConnectedEngine();
        t1.troopCount = 1
        const result = engine.reinforce(p1,t1,t2,3);
        
        expect(result).toEqual({ error: "INVALID_ATTACK_ONE_TROOP" });
        expect(t1.troopCount).toBe(1);
    })
    it("rejects reinforcing a territory owned by another player", () => {
        const { engine, p1, t1 } = makeEngine();
        const enemyTerr = new Territory(0, 2, "0,2", 2, "Jane", ["0,1"]);
        engine.territories.push(enemyTerr);
 
        vi.spyOn(engine, "getConnectingTerritories").mockReturnValue(new Set(["0,2"]));
        const result = engine.reinforce(p1, t1, enemyTerr, 2);
 
        expect(result).toEqual({ error: "INVALID_ATTACK_NOT_OWNED" });
        vi.restoreAllMocks();
    });
    it("rejects reinforcing between disconnected territories", () => {
        const { engine, p1, t1, t2 } = makeEngine();
        t2.owner = "John";

        vi.spyOn(engine, "getConnectingTerritories").mockReturnValue(new Set());
        const result = engine.reinforce(p1, t1, t2, 2);
 
        expect(result).toEqual({ error: "INVALID_ATTACK_NOT_ADJACENT" });
        vi.restoreAllMocks();
    });
})

//test checkWinner
describe("checkWinner()", () => {
    it("returns winner correctly", () => {
        const { engine, p1, t1, t2 } = makeEngine();
        t2.owner = "John"
        const result = engine.checkWinner()
        expect(result).toEqual(p1)
    })
    it("returns null when there is no winner", () => {
        const { engine, p1, t1, t2 } = makeEngine();
        const result = engine.checkWinner()
        expect(result).toEqual(null)
    })
    it("returns null when no territories are owned", () => {
        const { engine, t1, t2 } = makeEngine();
        t1.owner = null;
        t2.owner = null;
        const result = engine.checkWinner()

        expect(result).toEqual(null)
    });
})

//test checkCards
describe("checkCards()", () => {
    function cardSet(...types) {
        return types.map((type, i) => new Card(i + 1, "0,4", type));
    }
    it("returns 10 when cards are 1 of a kind", () =>{
        const {engine, p1} = makeEngine()
        p1.cards = cardSet("Soldier", "Cavalry", "Tank")
        const {checkOut, cardValues, removeCards} = engine.checkCards(p1)

        expect(checkOut).toBe(true)
        expect(cardValues).toBe(10)
        expect(removeCards).toHaveLength(3)
    })
    it("returns 7 when there are 3 tanks", () =>{
        const {engine, p1} = makeEngine()
        p1.cards = cardSet("Tank", "Tank", "Tank")
        const {checkOut, cardValues, removeCards} = engine.checkCards(p1)

        expect(checkOut).toBe(true)
        expect(cardValues).toBe(7)
        expect(removeCards).toHaveLength(3)
    })
    it("returns 5 when there are 3 cavalry", () =>{
        const {engine, p1} = makeEngine()
        p1.cards = cardSet("Cavalry", "Cavalry", "Cavalry")
        const {checkOut, cardValues, removeCards} = engine.checkCards(p1)

        expect(checkOut).toBe(true)
        expect(cardValues).toBe(5)
        expect(removeCards).toHaveLength(3)
    })
    it("returns 3 when there are 3 Soldiers", () =>{
        const {engine, p1} = makeEngine()
        p1.cards = cardSet("Soldier", "Soldier", "Soldier")
        const {checkOut, cardValues, removeCards} = engine.checkCards(p1)

        expect(checkOut).toBe(true)
        expect(cardValues).toBe(3)
        expect(removeCards).toHaveLength(3)
    })
    it("returns false when there isnt a match", () =>{
        const {engine, p1} = makeEngine()
        p1.cards = cardSet("Tank", "Cavalry", "Cavalry")
        const {checkOut, cardValues, removeCards} = engine.checkCards(p1)

        expect(checkOut).toBe(false)
        expect(removeCards).toHaveLength(0)
    })
    it("returns territory bonus when card linked to owned territory", () =>{
        const {engine, p1} = makeEngine()
        p1.cards = [
            new Card(1, "0,0", "Soldier"),
            new Card(2, "9,9", "Cavalry"),
            new Card(3, "9,9", "Tank"),
        ];
        const {checkOut, cardValues, removeCards} = engine.checkCards(p1)

        expect(checkOut).toBe(true)
        expect(cardValues).toBe(12)
        expect(removeCards).toHaveLength(3)
    })
    it("returns territory bonus only once when multiple cards linked to owned territory", () =>{
        const {engine, p1} = makeEngine()
        p1.cards = [
            new Card(1, "0,0", "Soldier"),
            new Card(2, "0,0", "Cavalry"),
            new Card(3, "9,9", "Tank"),
        ];
        const {checkOut, cardValues, removeCards} = engine.checkCards(p1)

        expect(checkOut).toBe(true)
        expect(cardValues).toBe(12)
        expect(removeCards).toHaveLength(3)
    })
})

//test reinforcementValue
describe("reinforcementValue()", () => {
    it("returns 3 during round 0 regardless of territory count", () => {
        const { engine, p1 } = makeEngine();
        engine.roundCount = 0;
        p1.territories = Array(20).fill("x");
 
        expect(engine.reinforcementValue(p1)).toBe(3);
    });
 
    it("returns 3 when the player owns up to 3 territories", () => {
        const { engine, p1 } = makeEngine();
        engine.roundCount = 1;
        p1.territories = ["a", "b", "c"];
 
        expect(engine.reinforcementValue(p1)).toBe(3);
    });
 
    it("returns 5 for 6 territories", () => {
        const { engine, p1 } = makeEngine();
        engine.roundCount = 1;
        p1.territories = Array(6).fill("x");
 
        expect(engine.reinforcementValue(p1)).toBe(5);
    });
 
    it("returns 7 for 9 territories", () => {
        const { engine, p1 } = makeEngine();
        engine.roundCount = 1;
        p1.territories = Array(9).fill("x");
 
        expect(engine.reinforcementValue(p1)).toBe(7);
    });
});

//Test nextTurn
describe("nextTurn()", () => {
    it("progresses turn", () => {
        const {engine} = makeEngine()
        engine.turn = 0
        engine.nextTurn()
        expect(engine.turn).toBe(1)
    })
    it("wraps around player list", () => {
        const {engine} = makeEngine()
        engine.turn = 1
        engine.nextTurn()
        expect(engine.turn).toBe(0)
    })
    it("skips eliminated player", () =>{
        const {engine} = makeEliminatedEngine()
        engine.turn = 0
        engine.nextTurn()
        expect(engine.turn).toBe(2)
    })
    it("resets phase number on new turn", () => {
        const {engine} = makeEngine()
        engine.phaseNumber = 2
        engine.nextTurn()
        expect(engine.phaseNumber).toBe(0)
    })
    it("increments roundCount when the last player's turn ends", () => {
        const { engine } = makeEngine();
        engine.turn = 1;
        const pre = engine.roundCount;
 
        engine.nextTurn();
 
        expect(engine.roundCount).toBe(pre + 1);
    });
    it("calculates deployable troops on new turn", () => {
        const { engine, p2 } = makeEngine();
        engine.roundCount = 1;
        p2.territories = Array(6).fill("x");
        engine.turn = 0;
 
        engine.nextTurn();

        expect(p2.deployableTroops).toBe(5)
    })
})

//test nextPhase
describe("nextPhase()", () => {
    it("Deploy to Attack", () => {
        const { engine } = makeEngine();
        engine.phaseNumber = 0;
 
        engine.nextPhase();
 
        expect(engine.getPhase()).toBe("Attack");
    });
 
    it("Attack to Reinforce", () => {
        const { engine } = makeEngine();
        engine.phaseNumber = 1;
 
        engine.nextPhase();
 
        expect(engine.getPhase()).toBe("Reinforce");
    });
 
    it("Reinforce to Deploy", () => {
        const { engine } = makeEngine();
        engine.phaseNumber = 2;
        engine.turn = 0;
 
        engine.nextPhase();
 
        expect(engine.turn).toBe(1);
        expect(engine.getPhase()).toBe("Deploy");
    });
})

//test checkAdjacency
describe("checkAdjacency()", () => {
    it("returns true in Attack mode for adjacent territories", () => {
        const { engine, t1, t2 } = makeEngine();
 
        expect(engine.checkAdjacency(t1, t2, "Attack")).toBe(true);
    });
 
    it("returns false in Attack mode for non-adjacent territories", () => {
        const { engine, t1 } = makeEngine();
        const badTerr = new Territory(5, 5, "5,5", 2, "Bob", []);
 
        expect(engine.checkAdjacency(t1, badTerr, "Attack")).toBe(false);
    });
 
    it("returns true in Attack mode when connected with linkRoute", () => {
        const { engine, t1 } = makeEngine();
        const linkTerr = new Territory(5, 5, "5,5", 2, "Bob", []);
        engine.territories.push(linkTerr);
        engine.linkRoutes = [["0,0", "5,5"]];
 
        expect(engine.checkAdjacency(t1, linkTerr, "Attack")).toBe(true);
    });
 
    it("uses BFS connectivity for Reinforce mode", () => {
        const { engine, t1, t2 } = makeEngine();
        vi.spyOn(engine, "getConnectingTerritories").mockReturnValue(new Set(["0,1"]));
 
        expect(engine.checkAdjacency(t1, t2, "Reinforce")).toBe(true);
        vi.restoreAllMocks();
    });
 
    it("returns false in Reinforce mode when the territory is not reachable", () => {
        const { engine, t1, t2 } = makeEngine();
        vi.spyOn(engine, "getConnectingTerritories").mockReturnValue(new Set());
        expect(engine.checkAdjacency(t1, t2, "Reinforce")).toBe(false);
 
        vi.restoreAllMocks();
    });
})

//test moveAfterAttack
describe("moveAfterAttack()", () => {
    it("reduces source troops and increases destination troops", () => {
        const { engine, t1, t2 } = makeEngine();
        t1.troopCount = 8;
        t2.troopCount = 1;
 
        engine.moveAfterAttack(t1, t2, 5);
 
        expect(t1.troopCount).toBe(3);
        expect(t2.troopCount).toBe(6);
    });
});