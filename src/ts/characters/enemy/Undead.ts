import Character from '../../type/Character';

export default class Undead extends Character {
	attack = 40;

	defence = 10;

	attackRange = 1;

	movementRange = 4;

	constructor(level: number, type = 'undead') {
		super(level, type);
	}
}