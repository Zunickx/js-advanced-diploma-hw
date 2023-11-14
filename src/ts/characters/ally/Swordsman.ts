import Character from '../../Character';

export default class Swordsman extends Character {
	attack = 40;

	defence = 10;

	attackRange = 1;

	movementRange = 4;

	constructor(level: number, type = 'swordsman') {
		super(level, type);
	}
}