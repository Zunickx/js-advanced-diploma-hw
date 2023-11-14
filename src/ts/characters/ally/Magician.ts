import Character from '../../Character';

export default class Magician extends Character {
	attack = 10;

	defence = 40;

	attackRange = 4;

	movementRange = 1;

	constructor(level: number, type = 'magician') {
		super(level, type);
	}
}