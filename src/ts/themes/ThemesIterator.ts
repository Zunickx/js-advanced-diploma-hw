import themes from './themes';

export default class ThemesIterator {
	private readonly values: string[] = themes; // Создадим приватное только для чтения поле values, которое содержит массив строк из объекта themes.

	private index: number; // Создадим приватное поле index типа number.

	currentTheme: string; // Создадим публичное поле currentTheme типа string

	constructor(currentTheme: string) {
		this.currentTheme = currentTheme;
		this.index = this.values.indexOf(currentTheme);
	}

	next(): string {
		++this.index;
		if (this.index === this.values.length) {
			this.index = 0;
		}
		this.currentTheme = this.values[this.index];

		return this.currentTheme;
	}
}