/**
 * Entry point of app: don't change this
 */
import GamePlay from './GamePlay';
import GameController from './GameController';
import GameStateService from './GameStateService';

const container = document.getElementById('game-container');
if (container) {
	const gamePlay = new GamePlay(container);
	const stateService = new GameStateService(localStorage);
	const gameCtrl = new GameController(gamePlay, stateService);
	gameCtrl.init();
}

// don't write your code here
