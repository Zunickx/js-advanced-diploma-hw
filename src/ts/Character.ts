/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */

export default abstract class Character {
	attackRange: number;

	movementRange: number;

	level: number = 0;

	attack: number = 0;

	defence: number = 0;

	health: number = 50;

	type: string;

	protected constructor(level: number, type: string) {
		this.type = type;
		this.attackRange = 0;
		this.movementRange = 0;
		for (let i = 0; i < level; i++) {
			this.levelUP();
		}
	}

	toString() {
		return `\u{1F396} ${this.level} \u{2694} ${this.attack} \u{1F6E1} ${this.defence} \u{2764} ${this.health}`;
	}

	levelUP() {
		if (this.level) {
			if (this.health > 20) {
				this.health = 100;
			} else {
				this.health += 80;
			}
			this.level += 1;
			this.attack = this.improvingPerformance(this.attack);
			this.defence = this.improvingPerformance(this.defence);
		} else {
			this.level += 1;
		}
	}

	improvingPerformance(attribute: number) {
		return Math.max(attribute, (attribute * (80 + this.health)) / 100);
	}
}
