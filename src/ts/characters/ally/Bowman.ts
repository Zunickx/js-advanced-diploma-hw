import Character from '../../type/Character';

export default class Bowman extends Character {
	attack = 25;

	defence = 25;

	attackRange = 2;

	movementRange = 2;

	constructor(level: number, type = 'bowman') {
		super(level, type);
	}
}