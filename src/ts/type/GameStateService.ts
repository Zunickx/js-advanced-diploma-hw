import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import { positionedCharacterToClassType } from './utils';
import Character from './Character';

export default class GameStateService {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  save(state: Object) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  load(): { // Функция load() объявлена с возвращаемым типом объекта, который содержит следующие поля: theme, characters, userTeam, allyTeam, enemyTeam
		theme: string,
		characters: PositionedCharacter[],
		userTeam: Character[],
		allyTeam: PositionedCharacter[],
		enemyTeam: PositionedCharacter[],
	} | undefined {
		try {
			const storageObject = JSON.parse(this.storage.getItem('state') ?? ''); // Создаем переменную storageObject, в которую парсим JSON-объект из хранилища с ключом 'state'. 
			// Если объект не найден, то присваивается пустая строка.

			// eslint-disable-next-line max-len
			const positionedUser = storageObject.userTeam.map((item: PositionedCharacter) => positionedCharacterToClassType(item)); // Создаем переменную positionedUser, в которой
			//происходит отображение элементов массива userTeam объекта storageObject с помощью метода map(), преобразуя каждый элемент в экземпляр класса PositionedCharacter с помощью 
			//функции positionedCharacterToClassType().

			// eslint-disable-next-line max-len
			const positionedEnemies = storageObject.enemyTeam.map((item: PositionedCharacter) => positionedCharacterToClassType(item)); // Создаем переменную positionedEnemies, 
			// в которой происходит отображение элементов массива enemyTeam объекта storageObject с помощью метода map(), преобразуя каждый элемент в экземпляр класса PositionedCharacter с 
			// помощью функции positionedCharacterToClassType().
			const characters: PositionedCharacter[] = positionedUser.concat(positionedEnemies); // объединяем массивы positionedUser и positionedEnemies с помощью метода concat().

			// eslint-disable-next-line max-len
			const userTeam: Character[] = positionedUser.map((item: PositionedCharacter) => item.character); //  Создаём переменную userTeam, в которую происходит отображение элементов 
			// массива positionedUser с помощью метода map(), извлекая поле character из каждого элемента.

			return { // Возвращаем объект с полями theme, characters, userTeam, allyTeam и enemyTeam, содержащий информацию из переменных storageObject.theme, characters, 
				// userTeam, positionedUser и positionedEnemies.
				theme: storageObject.theme,
				characters,
				userTeam,
				allyTeam: positionedUser,
				enemyTeam: positionedEnemies
			};

		// Обрабатываем ошибку при выполнении кода: вывод сообщения об ошибке с помощью функции GamePlay.showError() и возврат значения undefined
		} catch (e) {
			GamePlay.showError('У Вас нет сохранений');
			return undefined;
		}
	}
}