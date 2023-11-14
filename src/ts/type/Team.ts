import Character from './Character';

/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here

  private readonly _characters: Array<Character>; // Класс Team имеет приватное свойство _characters, которое является массивом объектов типа Character.

	constructor(characters: Array<Character>) { // принимаеv аргумент characters, который является массивом объектов типа Character, и присваивает его значение свойству _characters.
		this._characters = characters;
	}

	get characters(): Array<Character> { // Геттер characters возвращает значение свойства _characters.
		return this._characters;
	}

	has(character: Character) { // Метод has принимает аргумент character типа Character и проверяет, содержится ли данный объект в массиве _characters. 
		// Если содержится, то метод возвращает true, иначе - false.
		return this._characters.includes(character);
	}
}
