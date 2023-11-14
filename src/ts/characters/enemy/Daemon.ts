import Character from '../../Character';

export default class Daemon extends Character {
	attack = 10;

	defence = 10;

	attackRange = 4;

	movementRange = 1;

	constructor(level: number, type = 'daemon') {
		super(level, type);
	}
}