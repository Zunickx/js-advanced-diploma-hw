import Character from '../../Character';

export default class Vampire extends Character {
	attack = 25;

	defence = 25;

	attackRange = 2;

	movementRange = 2;

	constructor(level: number, type = 'vampire') {
		super(level, type);
	}
}