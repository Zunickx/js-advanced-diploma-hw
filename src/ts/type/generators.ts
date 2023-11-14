import Team from './Team';
import Character from './Character';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/ally/Bowman';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */

export function* characterGenerator( // Объявление функции генератора characterGenerator с параметрами allowedTypes (массив разрешенных типов персонажей) и maxLevel (максимальный уровень).
	allowedTypes: Array<new (level: number) => Character>,
	maxLevel: number
) {
  // TODO: write logic here
    while (true) {
      const level = Math.ceil(Math.random() * maxLevel); // Создадим переменную level, в которую сохраняется случайное целое число от 1 до maxLevel с помощью метода Math.random() и Math.ceil().
      const index = Math.floor(Math.random() * allowedTypes.length); // Создадим переменную index, в которую сохраняется случайный индекс от 0 до длины массива allowedTypes с помощью метода Math.random() и Math.floor().
      yield new allowedTypes[index](level); // Возвратим новый экземпляр класса из массива allowedTypes с использованием случайного индекса и уровня, сохраненного в переменной level.
    }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(
	allowedTypes: Array<new (level: number) => Character>,
	maxLevel: number,
	characterCount: number
): Team {
  // TODO: write logic here

  const generator = characterGenerator(allowedTypes, maxLevel); // Создаём переменную generator, в которую сохраняется результат вызова генераторной функции 
  // characterGenerator с передачей ей параметров allowedTypes и maxLevel.

	const characters: Array<Character> = []; // Создаём пустой массив characters, в котором будут храниться персонажи.
	for (let i = 0; i < characterCount; i++) { // 
		const character = generator.next().value!; // Создаём переменную character, в которую сохраняется значение, возвращенное вызовом метода next() на объекте generator
		characters.push(character); // Добавляем значения переменной character в массив characters.
	}
	return new Team(characters); // Возвращаем новоый экземпляр класса Team с массивом characters в качестве аргумента
}

/**
 * Возвращает последовательность чисел
 */
export function range(start: number, end: number, step: number = 1) { // Объявим функции range с параметрами start (начальное значение), end (конечное значение) и step (шаг увеличения).
	const ans = []; // Создадим пустой массив ans, в котором будут храниться числа из заданного диапазона
	for (let i = start; i < end; i += step) {
		ans.push(i);
	}
	return ans; // Возвратим массив ans в качестве результата выполнения функции range.
}

export function randomPosition(availablePositions: Array<number>, countPositions: number) {
	const array = []; // Внутри функции создается пустой массив array
	for (let i = 0; i < countPositions; i++) {

		// На каждой итерации выбирается случайный индекс из массива availablePositions с помощью Math.random() и Math.floor(). Этот индекс используется для удаления одного 
		// элемента из массива availablePositions с помощью метода splice(), и этот элемент добавляется в массив array с помощью метода push().
		const index = Math.floor(Math.random() * availablePositions.length);
		array.push(availablePositions.splice(index, 1));
	}
	return array.flat(); // возвращаем массив array, который содержит выбранные случайным образом позиции
}

export function attackRadius(position: number, radius: number, size: number) {
	const arr = [];

	// создается массив possiblePositions с помощью функции range, который содержит все возможные позиции в радиусе атаки от заданной позиции. 
	// Для этого используется выражение position - size * radius, которое указывает на начальную позицию, и position + size * radius + 1, которое указывает на конечную позицию. 
	// Также в качестве шага используется размер поля size.
	const possiblePositions = range( 
		position - size * radius,
		position + size * radius + 1,
		size
	);
	// eslint-disable-next-line max-len

	// создаем массив verticalPositions, который содержит только те позиции из possiblePositions, которые находятся в пределах размера поля size * size. Это делается с помощью 
	// метода filter(), который принимает функцию обратного вызова и возвращает новый массив, содержащий только те элементы, для которых функция вернула true.
	const verticalPositions = possiblePositions.filter((value) => value >= 0 && value < size * size);
	const verticalPositionsIterator = verticalPositions.values(); // создаем итератор verticalPositionsIterator, который будет использоваться для перебора элементов массива verticalPositions.
	let positionIterator = verticalPositionsIterator.next().value; // создаем переменную positionIterator, которая хранит значение первого элемента массива verticalPositionsIterator
	for (let i = 0; i < size; i++) {
		const indexes = range(size * i, size * (i + 1)); // создается массив indexes с помощью функции range, который содержит все позиции в текущей строке поля

		if (indexes.includes(positionIterator)) { // проверяем, содержит ли массив indexes значение переменной positionIterator. Если да, то с помощью метода filter() выбираются только 
			// те позиции из массива indexes, которые находятся в радиусе атаки от заданной позиции. Этот новый массив добавляется в массив arr с помощью метода push().

			// eslint-disable-next-line @typescript-eslint/no-loop-func,max-len
			arr.push(indexes.filter((value) => value <= positionIterator + radius && value >= positionIterator - radius));
			positionIterator = verticalPositionsIterator.next().value; // Обновим переменную positionIterator с помощью метода next() итератора verticalPositionsIterator, чтобы перейти к следующему элементу.
		}
	}
	return arr.flat(); // возвращаем массив arr, который содержит все позиции в радиусе атаки от заданной позиции. Для того чтобы получить одномерный массив, используется метод flat(), 
	//который "разворачивает" вложенные массивы.
}

export function movementRadius(position: number, radius: number, size: number) {
	const arr = [];
	const possiblePositions = range(
		position - size * radius,
		position + size * radius + 1,
		size
	);
	const verticalPositions = possiblePositions.filter((value) => value >= 0 && value < size * size);
	const positionIndex = verticalPositions.indexOf(position);

	// Создадим два массива: topPositions и bottomPositions. topPositions содержит все позиции из verticalPositions до заданной позиции, а bottomPositions содержит все позиции 
	// из verticalPositions после заданной позиции. Это делается с помощью метода slice(), который возвращает новый массив, содержащий элементы из исходного массива в указанном диапазоне. 
	// Массив topPositions также обращается с помощью метода reverse(), чтобы элементы были в обратном порядке.
	const topPositions = verticalPositions.slice(0, positionIndex).reverse();
	const bottomPositions = verticalPositions.slice(positionIndex); 
	
	for (let i = 0; i < radius; i++) {
		for (let j = 0; j < size; j++) {
			const indexes = range(size * j, size * (j + 1)); // Внутри вложенных циклов создаем массив indexes с помощью функции range, который содержит все позиции в текущей строке поля.
			
			// с помощью метода includes() проверяется, содержит ли массив indexes значение текущей позиции из массива topPositions. Если да, то с помощью функции range создается массив a, 
			// который содержит все позиции в радиусе движения от текущей позиции.
			if (indexes.includes(topPositions[i])) {
				const a = range(topPositions[i] - (i + 1), topPositions[i] + (i + 2), i + 1);

				// с помощью метода filter() выбираются только те позиции из массива a, которые находятся в текущей строке поля. 
				// Этот новый массив добавляется в массив arr с помощью метода push().
				arr.push(a.filter((item) => indexes.includes(item)));
			}
			if (indexes.includes(bottomPositions[i + 1])) {
				const b = range(bottomPositions[i + 1] - (i + 1), bottomPositions[i + 1] + (i + 2), i + 1);
				arr.push(b.filter((item) => indexes.includes(item)));
			}
		}
	}
	for (let j = 0; j < size; j++) {
		const indexes = range(size * j, size * (j + 1));
		if (indexes.includes(bottomPositions[0])) {
			const c = range(bottomPositions[0] - radius, bottomPositions[0] + radius + 1);
			arr.push(c.filter((item) => indexes.includes(item)));
		}
	}
	return arr.flat(); // возвращает массив arr, который содержит все позиции в радиусе движения от заданной позиции. Для того чтобы получить одномерный массив, 
	//используется метод flat(), который "разворачивает" вложенные массивы.
}

export function generatePositionedEnemies(boardSize: number) {
	// const enemy = [Daemon, Undead, Vampire];
	const enemy = [Bowman];
	const countEnemy = 3;
	const enemies = generateTeam(enemy, 4, countEnemy);
	const positionsEnemy = range(boardSize - 2, boardSize * boardSize - boardSize, 8)
		.concat(range(boardSize - 1, boardSize * boardSize - boardSize, 8));
	const randomPositionsEnemy = randomPosition(positionsEnemy, countEnemy);
	return enemies.characters.map(
		(item, idx) => new PositionedCharacter(item, randomPositionsEnemy[idx])
	);
}

export function generatePositionedAllies(boardSize: number) {
	// const ally = [Bowman, Magician, Swordsman];
	const ally = [Bowman];
	const countAlly = 3;
	const allies = generateTeam(ally, 4, countAlly);
	const positionsAlly = range(0, boardSize * boardSize - boardSize, 8)
		.concat(range(1, boardSize * boardSize - boardSize + 1, 8));
	const randomPositionsAlly = randomPosition(positionsAlly, countAlly);
	return allies.characters.map(
		(item, idx) => new PositionedCharacter(item, randomPositionsAlly[idx])
	);
}