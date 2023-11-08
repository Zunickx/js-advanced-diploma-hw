import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import {generateTeam} from './generators';
import {
  Bowman, Daemon, Magician, Swordsman, Undead, Vampire,
} from './Character';
import Team from './Team';
import GamePlay from './GamePlay';
import cursors from './cursors';
import GameState from './GameState';
import {compAction} from './compAction';
import attack from './Attack';

export default class GameController {
  constructor(gamePlay, stateService) { //конструктор класса принимает два параметра: gamePlay и stateService. Затем создаю объекты для игровых 
    //команд пользователя и компьютера, а также объект для состояния игры. Далее определяем обработчики событий для клика, наведения и ухода курсора с клетки 
    //игрового поля, а также функции для начала новой игры, сохранения и загрузки игры. Все функции привязываю к текущему контексту с помощью метода bind().
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.UserTeam = new Team([]);
    this.CompTeam = new Team([]);
    this.gameState = new GameState(this.gamePlay, this.UserTeam, this.CompTeam);

    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.newGame = this.newGame.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.loadGame = this.loadGame.bind(this);
  }

  events() { // определяем метод events() для класса, который добавляет обработчики событий для различных действий пользователя в игре (наведение, клик, 
    // начало новой игры, сохранение и загрузка игры). Метод использует методы объекта gamePlay для добавления обработчиков событий.
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addNewGameListener(this.newGame);
    this.gamePlay.addSaveGameListener(this.saveGame);
    this.gamePlay.addLoadGameListener(this.loadGame);
  }

  init() { // отображение игровой сцены и взаимодействия с пользователем
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.events();
    this.gamePlay.drawUi(themes.item(this.gameState.level)); // отображаем интерфейс игры, включая элементы управления и информацию о текущем состоянии игры
    this.displayCharacter(); // отображаем персонажа на экране
  }

  saveGame() { // сохраним текущее состояние игры с помощью сервиса состояния игры.
    this.stateService.save(this.gameState);
  }

  loadGame() { // загружаем сохраненное состояние игры с помощью сервиса состояния игры и обновляем текущее состояние игры на основе загруженных данных. 
    // Если сохраненное состояние игры отсутствует, выводим сообщение об ошибке и запускаем новую игру
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        this.UserTeam.deleteCharacter();
        this.CompTeam.deleteCharacter();
        this.UserTeam.addCharacters(loadGameState.UserTeam.team);
        this.CompTeam.addCharacters(loadGameState.CompTeam.team);

        this.gameState.isMove = 'user';
        this.gameState.block = loadGameState.block;
        this.gameState.level = loadGameState.level;
        this.gameState.point = loadGameState.point;
        this.gameState.history = loadGameState.history;
        this.gameState.UserTeam = this.UserTeam;
        this.gameState.CompTeam = this.CompTeam;
        this.gameState.currentIndex = null;
        this.gameState.currentMove = null;
        this.gameState.currentAttack = null;
        this.gameState.currentCharacter = null;
        this.gamePlay.drawUi(themes.item(this.gameState.level));
        this.gamePlay.redrawPositions([...this.gameState.arrTeam()]);
        this.gamePlay.showPoints(this.gameState.point);
      } else {
        throw new Error('There`s no game in memory');
      }
    } catch (err) {
      console.error(err);
      GamePlay.showMessage('There`s no game in memory');
      this.newGame();
    }
  }

  newGame() { // сбрасываем все предыдущие данные, устанавливаем начальный уровень и количество очков, очищая команды игроков и компьютера, 
    // обновляя интерфейс и отображая персонажей.
    this.gameState.block = false;
    this.gameState.history.push({
      level: this.gameState.level,
      points: this.gameState.point,
    });
    this.gameState.level = 1;
    this.gameState.point = 0;
    this.UserTeam.deleteCharacter();
    this.CompTeam.deleteCharacter();
    this.gameState.reset();
    this.gamePlay.drawUi(themes.item(this.gameState.level));
    this.displayCharacter();
  }

  createPosition(boardSize, range) { // создаем массив позиций arr на игровом поле для игры. Размер поля задается параметром boardSize, 
    // а диапазон позиций - параметром range. С помощью forEach проходим по каждому элементу диапазона и добавляем в массив arr все позиции на игровом поле, 
    // начиная с этого элемента и с шагом boardSize. В конце возвращаем полученный массив arr.
    const arr = [];
    range.forEach((elem) => {
      for (let i = elem; i < boardSize ** 2; i += boardSize) {
        arr.push(i);
      }
    });
    return arr;
  }

  displayCharacter() {
    let userTeam = [];
    let compTeam = [];
    const compPositionArr = this.createPosition(this.gamePlay.boardSize, [6, 7]);
    const userPositionArr = this.createPosition(this.gamePlay.boardSize, [0, 1]);
    switch (this.gameState.level) {
      case 1:
        userTeam = generateTeam([Bowman, Swordsman], 1, 2);
        compTeam = generateTeam([Vampire, Undead, Daemon], 1, 2);
        break;
      case 2:
        userTeam = generateTeam([Bowman, Swordsman, Magician], 1, 1);
        compTeam = generateTeam([Vampire, Undead, Daemon], 2,
          (userTeam.length + this.UserTeam.team.length));
        break;
      case 3:
        userTeam = generateTeam([Bowman, Swordsman, Magician], 2, 2);
        compTeam = generateTeam([Vampire, Undead, Daemon], 3,
          (userTeam.length + this.UserTeam.team.length));
        break;
      case 4:
        userTeam = generateTeam([Bowman, Swordsman, Magician], 3, 2);
        compTeam = generateTeam([Vampire, Undead, Daemon], 4,
          (userTeam.length + this.UserTeam.team.length));
        break;
      default:
        compTeam = generateTeam([Vampire, Undead, Daemon], 4, this.UserTeam.team.length);
    }

    // создаем новый массив userTeamPosition, в котором каждому персонажу из массива userTeam присваиваем случайную позицию из массива userPositionArr 
    // с помощью метода map. Для каждого персонажа создаем новый объект PositionedCharacter, который содержит информацию о персонаже и его позиции на 
    // игровом поле.

    const userTeamPosition = userTeam.map((elem) => {
      const userPosition = userPositionArr[Math.floor(Math.random() * userPositionArr.length)];
      return new PositionedCharacter(elem, userPosition);
    });

    const compTeamPosition = compTeam.map((elem) => {
      const userPosition = compPositionArr[Math.floor(Math.random() * compPositionArr.length)];
      return new PositionedCharacter(elem, userPosition);
    });

    this.gameState.UserTeam.addCharacters(userTeamPosition); // добавляем персонажей в команду пользователя
    this.gameState.CompTeam.addCharacters(compTeamPosition); // добавляем персонажей в команду компьютера
    this.gameState.reset(); // сбрасываем состояние игры
    this.gamePlay.drawUi(themes.item(this.gameState.level)); // отрисовываем поле игры
    this.gamePlay.redrawPositions([...this.gameState.arrTeam()]); // перерисовываем позиции персонажей
  }

  async onCellClick(index) {
    // TODO: react to click

    if (!this.gameState.block) {
      const indexInArr = this.gameState.arrUserPosition().indexOf(index);
      const indexInCompArr = this.gameState.arrCompPosition().indexOf(index);

      if (indexInArr !== -1) {
        if (index === this.gameState.currentIndex) {
          this.gamePlay.deselectCell(this.gameState.currentIndex); // удаляем старого персонажа
          this.gameState.reset();
          return;
        }
        if (this.gameState.currentIndex !== null) { // удалить старого и выбрать нового персонажа
          this.gamePlay.deselectCell(this.gameState.currentIndex);
          this.gameState.reset();
        }

        const item = [...this.gameState.UserTeam.team][indexInArr]; // выбрать персонажа и добавить желтый круг
        this.gamePlay.selectCell(index);
        this.gameState.currentIndex = index;
        this.gameState.currentCharacter = item;
        this.gameState.currentAttack = item.character.rangeAttack;
        this.gameState.currentMove = item.character.rangeMove;
      } else if (this.gameState.currentRangeMove().has(index)
        && indexInCompArr === -1) { // перемещаем персонажа пользователя
        this.gamePlay.deselectCell(this.gameState.currentIndex);
        this.gamePlay.deselectCell(index);
        this.gameState.currentCharacter.position = index;
        this.gameState.reset();
        this.gameState.isMove = 'comp';
        this.gamePlay.redrawPositions(this.gameState.arrTeam());

        compAction(this.gameState); // response action computer
      } else if (this.gameState.currentIndex !== null && indexInCompArr !== -1 // attack on computer
        && this.gameState.currentRange().has(index)) {
        const indexComp = this.gameState.arrCompPosition().indexOf(index);
        const compCharacter = this.CompTeam.team[indexComp];
        const response = await attack(this.gameState.currentCharacter, compCharacter, this.gameState);
        if (response === 'next') {
          this.gameState.level += 1;
          for (const item of this.UserTeam.team) {
            this.gameState.point += item.character.health;
          }
          if (this.gameState.level <= 4) {
            this.levelUp();
          }

          this.displayCharacter();
          this.gamePlay.showPoints(this.gameState.point);
          return;
        }
        const action = await compAction(this.gameState); // response action computer
        if (action === 'dead') { // dead user character
          this.gamePlay.deselectCell(this.gameState.currentIndex);
          this.gamePlay.deselectCell(index);
          this.gamePlay.setCursor(cursors.auto);
          this.gameState.reset();
        }
      } else if (indexInCompArr !== -1 && !this.gameState.currentRange().has(index)
        && this.gameState.currentIndex !== null) { // show error
        this.gamePlay.setCursor(cursors.notallowed);
        GamePlay.showError('This isn`t allowed action');
      } else if (indexInCompArr !== -1) { // show error
        GamePlay.showError('This isn`t your character');
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter

    if (!this.gameState.block) {
      const indexInArr = this.gameState.arrPositions().indexOf(index);
      const indexInCompArr = this.gameState.arrCompPosition().indexOf(index);
      const indexInUserArr = this.gameState.arrUserPosition().indexOf(index);

      if (indexInArr !== -1) {
        const item = this.gameState.arrTeam()[indexInArr];
        const message = `🎖${item.character.level}⚔${item.character.attack}🛡${item.character.defence}❤${item.character.health}`;
        this.gamePlay.showCellTooltip(message, index);
      }

      if (indexInUserArr !== -1) {
        this.gamePlay.setCursor(cursors.pointer);
      }

      if (this.gameState.currentIndex !== null) { // показать место, которое персонаж может атаковать
        if (this.gameState.currentRange().has(index) && indexInArr === -1) {
          this.gamePlay.selectCell(index, 'green');
        }

        // показать место, куда персонаж может двигаться
        if (this.gameState.currentRangeMove().has(index) && this.gameState.arrPositions().indexOf(index) === -1) {
          this.gamePlay.setCursor(cursors.pointer);
        }
      }

      // добавить красный кружок и перекрестие курсора на врага, если он находится в текущем диапазоне пользовательского персонажа, или добавить перекрестие запрещено
      // если он не в текущем диапазоне.
      if (this.gameState.currentIndex !== null && !this.gameState.currentRange().has(index) && indexInCompArr !== -1) {
        this.gamePlay.setCursor(cursors.notallowed);
      } else if (this.gameState.currentIndex !== null && indexInCompArr !== -1) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave

    if (!this.gameState.block) {
      const indexInArr = this.gameState.arrPositions().indexOf(index);
      const indexInCompArr = this.gameState.arrCompPosition().indexOf(index);
      const indexInUserArr = this.gameState.arrUserPosition().indexOf(index);

      if ((this.gameState.currentRange().has(index) && indexInArr === -1)
        || (this.gameState.currentRange().has(index) && indexInCompArr !== -1)) {
        this.gamePlay.setCursor(cursors.auto);
        this.gamePlay.deselectCell(index);
      }

      if ((this.gameState.currentRangeMove() !== null && this.gameState.currentRangeMove().has(index)
        && indexInArr === -1) || indexInUserArr !== -1) {
        this.gamePlay.setCursor(cursors.auto);
      }

      if (this.gameState.currentIndex !== null) {
        this.gamePlay.setCursor(cursors.auto);
      }
    }
  }

  levelUp() {
    for (const item of this.UserTeam.team) {
      const current = item.character;
      current.level += 1;
      current.attack = this.upAttackDefence(current.attack, current.health);
      current.defence = this.upAttackDefence(current.defence, current.health);
      current.health = (current.health + 80) < 100 ? current.health + 80 : 100;
    }
  }

  upAttackDefence(attackBefore, life) {
    return Math.floor(Math.max(attackBefore, attackBefore * (1.6 - life / 100)));
  }
}
