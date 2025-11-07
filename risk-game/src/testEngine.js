import { GameEngine } from './gameEngine/gameEngine.js'; // or adjust the path
import { Player, Territory, Continent } from './gameEngine/gameEngine.js'
///TESTING ENGINE _ REMOVE ONCE SUCCESFULL

const player1 = new Player(1, [], 20, 0, [], 0, 20);
const player2 = new Player(2, [], 20, 1, [], 0, 20);
const players = [player1, player2];

const territory1 = new Territory('T1', 0, null, ['T2'], 'C1');
const territory2 = new Territory('T2', 0, null, ['T1'], 'C1');
const territories = [territory1, territory2];

const continent1 = new Continent('C1', ['T1', 'T2']);
const continents = [continent1];

const engine = new GameEngine(players, territories, continents);
engine.initialiseGame();
console.log(engine);