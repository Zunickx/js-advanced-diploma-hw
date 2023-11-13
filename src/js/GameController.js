import GamePlay from './GamePlay';
import GameStateService from './GameStateService';
import {
	attackRadius, generatePositionedAllies, generatePositionedEnemies, movementRadius
} from './generators';
import PositionedCharacter from './PositionedCharacter';
import cursors from './cursors';
import { EnemiesVSAlly } from './type/EnemiesVSAlly';
import { dealDamage, randomElementFromArray } from './utils';
import Character from './Character';
import ThemesIterator from './themes/ThemesIterator';
import GameState from './GameState';
import Team from './Team';

export default class GameController {
	private readonly gamePlay: GamePlay;

	private stateService: GameStateService;

	private positionedCharacters: PositionedCharacter[] = [];

	private themes: ThemesIterator = new ThemesIterator('prairie');

	private userTeam?: Team;

	private positionedAllies: PositionedCharacter[] = [];

	private positionedEnemies: PositionedCharacter[] = [];

	constructor(gamePlay: GamePlay, stateService: GameStateService) {
		this.gamePlay = gamePlay;
		this.stateService = stateService;
	}

	init() {
		this.gamePlay.drawUi(this.themes.currentTheme); // при помощи метода drawUi() вызываем создание игрового пользовательского интерфейса с использованием текущей темы
		const { boardSize } = this.gamePlay;

		this.positionedAllies = generatePositionedAllies(boardSize); // генерируем позиций союзников на игровом поле.

		this.positionedEnemies = generatePositionedEnemies(boardSize); // генерации позиций врагов на игровом поле.

		this.positionedCharacters = this.positionedAllies.map((item) => item); // Создаем массив positionedCharacters путем объединения массивов positionedAllies и positionedEnemies.
		this.positionedEnemies.forEach((item) => {
			this.positionedCharacters.push(item);
		});

		// eslint-disable-next-line max-len
		this.userTeam = new Team(this.positionedAllies.map((positionedAlly) => positionedAlly.character)); // Создаем новый объект команды для команды пользователя, используя массив positionedAllies.

		this.gamePlay.redrawPositions(this.positionedCharacters); // Вызываем метод redrawPositions() для обновления игрового поля с позиционированными персонажами.

    // Добавляем события для клика, наведения и ухода с ячейки с помощью методов addCellClickListener(), addCellEnterListener() и addCellLeaveListener().
		this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
		this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
		this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    // Добавляется новое событие для перезапуска игры путем вызова метода init() снова.
		this.gamePlay.addNewGameListener(() => this.init());
		this.gamePlay.addSaveGameListener(() => { // Добавляем событие сохранения игры для сохранения состояния игры с использованием метода stateService.save().
			const state = {
				userTeam: this.positionedAllies,
				enemyTeam: this.positionedEnemies,
				theme: this.themes.currentTheme
			};
			this.stateService.save(state);
		});

    // Добавляем событие загрузки игры для загрузки состояния игры с использованием метода stateService.load() и обновления игры с загруженным состоянием.
		this.gamePlay.addLoadGameListener(() => {
			const state = this.stateService.load();
			if (state) {
				const loadGame = GameState.from(state);
				this.themes = new ThemesIterator(loadGame.theme);
				this.gamePlay.drawUi(this.themes.currentTheme);
				this.positionedAllies = state.allyTeam;
				this.positionedEnemies = state.enemyTeam;
				this.positionedCharacters = loadGame.characters;
				this.userTeam = new Team(loadGame.userTeam);
				this.gamePlay.redrawPositions(this.positionedCharacters);
			}
		});
	}

	onCellClick(index: number) {

    // Сначала ищем персонажа в выбранной ячейке с помощью метода find() и сохраняем его в переменную positionedCharacter.
		const positionedCharacter = this.positionedCharacters.find(
			(character) => character.position === index
		);

    // Проверяем наличие текущего выбранного персонажа и возможность перемещения на выбранную ячейку в пределах радиуса перемещения. 
    // Если условия выполняются, делаем перемещение персонажа, обновление игрового поля и вызов метода attackEnemy() для атаки врага
		if (this.gamePlay.currentCharacter && !positionedCharacter && movementRadius(
			this.gamePlay.currentCharacter?.position,
			this.gamePlay.currentCharacter?.character.movementRange,
			this.gamePlay.boardSize
		).includes(index)) {
			this.gamePlay.deselectCell(index);
			this.gamePlay.deselectCell(this.gamePlay.currentCharacter.position);
			this.gamePlay.currentCharacter.position = index;
			this.gamePlay.redrawPositions(this.positionedCharacters);
			this.gamePlay.currentCharacter = undefined;
			this.gamePlay.setCursor(cursors.auto);
			this.attackEnemy();
		}

		if (!positionedCharacter) { // Если в выбранной ячейке нет персонажа, выполнение метода завершается.
			return;
		}

    // Если в выбранной ячейке находится персонаж из команды пользователя, этот персонаж становится текущим выбранным персонажем, а ячейка выделяется.
		if (this.userTeam?.has(positionedCharacter.character)) {
			if (this.gamePlay.currentCharacter?.position) {
				this.gamePlay.deselectCell(this.gamePlay.currentCharacter.position);
			}
			this.gamePlay.currentCharacter = positionedCharacter;
			this.gamePlay.selectCell(index);
		} else if (this.gamePlay.currentCharacter) {  //Если текущий выбранный персонаж совершает атаку на врага, происходит расчет урона, уменьшение здоровья врага, 
      // отображение урона на игровом поле, обновление состояния игры и проверка на возможность перехода к следующему уровню.
			if (attackRadius(
				this.gamePlay.currentCharacter?.position,
				this.gamePlay.currentCharacter?.character.attackRange,
				this.gamePlay.boardSize
			).includes(index)
				&& !this.userTeam?.has(positionedCharacter.character)
			) {
				this.gamePlay.deselectCell(this.gamePlay.currentCharacter.position);
				const damage = dealDamage(
					this.gamePlay.currentCharacter.character,
					positionedCharacter.character
				);
				positionedCharacter.character.health -= damage;
				this.gamePlay.showDamage(index, `${damage}`).then(() => {
					this.deathCharacter(positionedCharacter.character);
					this.gamePlay.redrawPositions(this.positionedCharacters);
					const enemies = this.enemies();
					this.gamePlay.currentCharacter = undefined;
					this.gamePlay.setCursor(cursors.auto);
					if (enemies && enemies.length) {
						this.attackEnemy();
					} else {
						const allies = this.allies();
						allies?.forEach((ally) => {
							ally.character.levelUP();
						});
						const { boardSize } = this.gamePlay;
						const positionedEnemies = generatePositionedEnemies(boardSize);
						this.positionedCharacters = this.positionedCharacters.concat(positionedEnemies);
						const nextTheme = this.themes.next();
						if (nextTheme !== 'prairie') {
							this.gamePlay.drawUi(nextTheme);
							this.gamePlay.redrawPositions(this.positionedCharacters);
						} else {
							this.gamePlay.clearEvents();
						}
					}
				});
			} else {
				GamePlay.showError('Недопустимое действие'); // Если текущий выбранный персонаж не может совершить атаку на выбранную ячейку, выводится сообщение об ошибке.
			}
		} else {
			GamePlay.showError('Выберите своего персонажа'); // Если не выбран текущий персонаж, выводится сообщение о необходимости выбора своего персонажа.
		}
	}

	onCellEnter(index: number) {
		const character = this.positionedCharacters.find( // ищем персонажа в переменной positionedCharacters с позицией, соответствующей индексу ячейки.
			(positionedCharacter) => positionedCharacter.position === index
		)?.character;
		if (character) {
			this.gamePlay.showCellTooltip(character.toString(), index); // если персонаж найден, его имя отображается в виде подсказки над ячейкой.
		}
		if (this.gamePlay.currentCharacter) { // проверяем наличие текущего активного персонажа 
			if (character) { // если персонаж существует, то устанавливаем соответствующий курсор в зависимости от принадлежности персонажа к команде пользователя и его возможных действий.
				if (this.userTeam?.has(character)) {
					this.gamePlay.setCursor(cursors.pointer);
				} else if (attackRadius( // Изменение цвета ячейки, если персонаж атакует или может переместиться в нее
					this.gamePlay.currentCharacter.position,
					this.gamePlay.currentCharacter.character.attackRange,
					this.gamePlay.boardSize
				).includes(index)) {
					this.gamePlay.setCursor(cursors.crosshair);
					this.gamePlay.selectCell(index, 'red');
				} else {
					this.gamePlay.setCursor(cursors.notallowed);
				}
			} else if (movementRadius( // проверяем доступность перемещения персонажа в ячейку и ее подсветка зеленым цветом, если она входит в радиус перемещения.
				this.gamePlay.currentCharacter.position,
				this.gamePlay.currentCharacter.character.movementRange,
				this.gamePlay.boardSize
			).includes(index)) {
				this.gamePlay.setCursor(cursors.pointer);
				this.gamePlay.selectCell(index, 'green');
			} else {
				this.gamePlay.setCursor(cursors.notallowed);  // Установка курсора "недоступно", если ячейка не доступна для перемещения персонажа
			}
		}
	}

  // Когда игрок уводит курсор мыши из ячейки, функция onCellLeave вызывается для скрытия подсказки, которая могла появиться при наведении на эту ячейку. 
  // Также функция отменяет выделение ячейки, если индекс ячейки не соответствует позиции текущего активного персонажа.
	onCellLeave(index: number) {
		this.gamePlay.hideCellTooltip(index);
		if (index !== this.gamePlay?.currentCharacter?.position) {
			this.gamePlay.deselectCell(index);
		}
	}

	attackEnemy() {

    // получаем массивы союзников и врагов из объекта, к которому принадлежит данная функция
		const allies = this.allies();
		const enemies = this.enemies();
		const attackAlly = allies?.reduce((array, ally: PositionedCharacter) => { // перебираем массив союзников и фильтрации массива врагов, чтобы найти врагов, которые могут атаковать союзника. 
      // Если такие враги найдены, то создается массив attackAlly, содержащий пары союзник-враги, которые могут атаковать этого союзника
			const enemiesAttackers = enemies?.filter((enemy) => {
				const attackPositionsEnemy = attackRadius(
					enemy.position,
					enemy.character.attackRange,
					this.gamePlay.boardSize
				);
				return attackPositionsEnemy.includes(ally.position);
			});
			if (enemiesAttackers?.length) { // проверяем, есть ли союзники, которые могут быть атакованы
				const item: EnemiesVSAlly = [ally, enemiesAttackers];
				array.push(item);
			}
			return array;
		}, <EnemiesVSAlly[]>[]);
		if (attackAlly?.length) { // Если такие союзники найдены, то выбирается случайный союзник и случайный враг из атакующих его врагов
			const randomAttackAlly = randomElementFromArray(attackAlly);
			const [attackedAlly, attackerEnemies] = randomAttackAlly;
			const attackerEnemy = randomElementFromArray(attackerEnemies);
			const damage = dealDamage( // вызывая функцию dealDamage, ведется расчета урона, который нанесет враг союзнику, и уменьшается здоровье союзника на этот урон. 
				attackerEnemy.character,
				attackedAlly.character
			);

      // После этого отображается анимация урона на игровом поле, и если здоровье союзника становится меньше или равно 0, вызывается функция deathCharacter() для обработки смерти союзника.
			attackedAlly.character.health -= damage;
			this.gamePlay.showDamage(attackedAlly.position, `${damage}`).then(() => {
				this.deathCharacter(attackedAlly.character);
				this.gamePlay.redrawPositions(this.positionedCharacters);
				if (!this.allies()?.length) {
					this.gamePlay.clearEvents();
				}
			});

      // Если не было найдено союзников, которые могут быть атакованы, то происходит перемещение случайного врага по игровому полю. 
      // Для этого выбираются возможные позиции для перемещения врага с помощью функции movementRadius(), затем из этих позиций удаляются занятые другими персонажами, 
      // и случайно выбирается новая позиция для врага
		} else if (enemies) {
			const randomEnemy = randomElementFromArray(enemies);
			const possiblePositions = movementRadius(
				randomEnemy.position,
				randomEnemy.character.movementRange,
				this.gamePlay.boardSize
			);
			const positionsCharacters = this.positionedCharacters.map((character) => character.position);
			// eslint-disable-next-line max-len
			const positions = possiblePositions.filter((position) => !positionsCharacters.includes(position));
			randomEnemy.position = randomElementFromArray(positions);
		}
	}

	deathCharacter(character: Character) { // данная функция вызывается в случае, если здоровье союзника становится меньше или равно 0, что означает его смерть. 
    // В этом случае функция производит фильтрацию массива positionedCharacters, удаляя из него позицию умершего союзника. Таким образом, убирается умерший персонаж из игрового поля, 
    // чтобы он больше не участвовал в боевых действиях
		if (character.health <= 0) {
			// eslint-disable-next-line max-len
			this.positionedCharacters = this.positionedCharacters.filter((positionedCharacter) => positionedCharacter.character !== character);
		}
	}

  // Функции allies() и enemies() возвращают массивы союзников и врагов соответственно, находящихся в игровом поле. Для этого они используем метод filter(), 
  // который проходит по массиву positionedCharacters и возвращает только те элементы, для которых условие внутри стрелочной функции возвращает true. В случае allies(), 
  // условие проверяет, содержит ли userTeam персонажа из positionedCharacters, а в случае enemies() - не содержит ли.

Таким образом, функции allies() и enemies() позволяют получить список союзников и врагов из массива positionedCharacters, основываясь на принадлежности персонажей к командам.
	allies() {
		return this.positionedCharacters.filter((value) => this.userTeam?.has(value.character));
	}

	enemies() {
		return this.positionedCharacters.filter((value) => !this.userTeam?.has(value.character));
	}
}