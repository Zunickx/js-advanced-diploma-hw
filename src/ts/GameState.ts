import PositionedCharacter from './PositionedCharacter'; 
import Character from './Character';

export default class GameState { // принимаем объект с полями theme (тема), characters (персонажи) и userTeam (команда пользователя). 
  // Метод from создает новый объект GameState с этими полями и возвращает его.
	static from({ characters, theme, userTeam }: {
		theme: string,
		characters: PositionedCharacter[],
		userTeam: Character[]
	}) {
		return {
			theme,
			characters,
			userTeam
		};
	}
}