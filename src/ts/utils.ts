import { range } from './generators';
import Character from './Character';
import PositionedCharacter from './PositionedCharacter';
import Bowman from '../ts/characters/ally/Bowman';
import Magician from '../ts/characters/ally/Magician';
import Swordsman from '../ts/characters/ally/Swordsman';
import Daemon from '../ts/characters/enemy/Daemon';
import Undead from '../ts/characters/enemy/Undead';
import Vampire from '../ts/characters/enemy/Vampire';

/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index: number, boardSize: number) : string {
  // TODO: ваш код будет тут

  switch (true) { // оператор switch необходим для проверки различных условий. В каждом случае, если условие выполняется, возвращается соответствующая строка, определяющая тип плитки.
		case index === 0:
			return 'top-left';
		case index === boardSize - 1:
			return 'top-right';
		case index === boardSize ** 2 - boardSize:
			return 'bottom-left';
		case index === boardSize ** 2 - 1:
			return 'bottom-right';
		case range(1, boardSize - 1).includes(index):
			return 'top';
		case range(boardSize ** 2 - boardSize + 1, boardSize ** 2 - 1).includes(index):
			return 'bottom';
		case range(boardSize, boardSize ** 2 - boardSize, boardSize).includes(index):
			return 'left';
		case range(boardSize * 2 - 1, boardSize ** 2 - 1, boardSize).includes(index):
			return 'right';
		default:
			return 'center'; // Если ни одно из вышеперечисленных условий не выполняется, то возвращается строка 'center', указывающая на центральную часть доски.
	}
}

export function calcHealthLevel(health: number) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

// вычисляем урон, наносимый атакующим персонажем целевому персонажу. Урон рассчитывается как разность между атакой атакующего персонажа и защитой целевого персонажа, 
// но не может быть меньше 10% от атаки атакующего персонажа. 
export function dealDamage(attacker: Character, target: Character) {
	return Math.max(attacker.attack - target.defence, attacker.attack * 0.1); // Функция возвращает значение урона.
}

// генерируем случайный индекс, используя функцию Math.random(), и округляем его до ближайшего целого числа с помощью функции Math.floor(). 
export function randomElementFromArray(array: any[]) {
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex]; // Затем функция возвращает элемент массива, соответствующий сгенерированному индексу.
}

export function characterToClassType(value: Character) {
	// eslint-disable-next-line max-len
	const charactersClassesNames: Array<new (level: number) => Character> = [Bowman, Magician, Swordsman, Daemon, Undead, Vampire]; // Объявление массива charactersClassesNames, содержащего классы 
  // Bowman, Magician, Swordsman, Daemon, Undead, Vampire. Классы имеют конструкторы, принимающие параметр level.

	// eslint-disable-next-line @typescript-eslint/no-shadow,max-len
	const indexClassName = charactersClassesNames.findIndex((className) => className.name.toLowerCase() === value.type); // Нахождим индекс класса в массиве charactersClassesNames, 
  // у которого имя класса совпадает с типом персонажа value.
	const character = new charactersClassesNames[indexClassName](value.level); // Создадим новый экземпляр класса с помощью конструктора найденного класса и параметра level из value.
	character.level = value.level; // Присвоим полям нового экземпляра значения из соответствующих полей value.
	character.health = value.health;
	character.attack = value.attack;
	character.defence = value.defence;
	return character; // Возвратим созданный экземпляр класса
}

export function positionedCharacterToClassType(value: PositionedCharacter) {
	const character = characterToClassType(value.character);
	return new PositionedCharacter(character, value.position);
}