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

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
