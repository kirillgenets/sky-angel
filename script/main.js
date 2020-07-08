// Constants

const INITIAL_TIMER_VALUE = "00:00";

const Keys = {
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  KEY_W: "KeyW",
  KEY_S: "KeyS",
  KEY_A: "KeyA",
  KEY_D: "KeyD",
};

// DOM-elements

const body = document.body;
const gameWrapper = body.querySelector(".game");
const playgroundElement = gameWrapper.querySelector(".playground");
const startModalElement = gameWrapper.querySelector(".start-modal");
const startGameButton = startModalElement.querySelector(".start-game");
const statePanelElement = gameWrapper.querySelector(".state-panel");
const increaseFontSizeButton = statePanelElement.querySelector(".fontsize-up");
const decreaseFontSizeButton = statePanelElement.querySelector(
  ".fontsize-down"
);
const timeCounterWrapper = statePanelElement.querySelector(".time-counter");

// Initial values

const initialGameState = {
  isStarted: false,
  previousScore: 0,
  previousTime: null,
  currentScore: 0,
  currentTime: null,
  fontSize: 14,
};

const initialPlaneData = {
  position: {
    x: 0,
    y: 0,
  },
  speed: 3,
  directions: {
    top: false,
    bottom: false,
    left: false,
    right: false,
  },
  template: document.querySelector("#plane"),
  width: 100,
  height: 38,
};

// Utilities

const createElementFromTemplate = (template) => {
  return template.content.cloneNode(true).querySelector("*");
};

const hideElement = (element) => {
  element.classList.add("hidden");
};

const showElement = (element) => {
  element.classList.remove("hidden");
};

const isGameObjectInViewport = (gameObject) => {
  const {
    position: { x, y },
    width,
    height,
  } = gameObject;
  return (
    x > 0 &&
    x + width < playgroundElement.clientWidth &&
    y > 0 &&
    y + height < playgroundElement.clientHeight
  );
};

// Data models

class GameStateModel {
  constructor({
    isStarted,
    previousScore,
    previousTime,
    currentScore,
    currentTime,
    fontSize,
  }) {
    this.isStarted = isStarted;
    this.previousScore = previousScore;
    this.previousTime = previousTime;
    this.currentScore = currentScore;
    this.currentTime = currentTime;
    this.fontSize = fontSize;
  }
}

class PlaneDataModel {
  constructor({ position, speed, directions, template, width, height }) {
    this.position = position;
    this.speed = speed;
    this.directions = directions;
    this.template = template;
    this.width = width;
    this.height = height;
  }
}

class TimerDataModel {
  constructor(startTime) {
    this.startTime = startTime;
    this.pauseTime = null;
    this.overTime = null;
  }
}

// View classes

class GameObjectView {
  constructor({ template, position }) {
    this._element = null;
    this._template = template;
    this._position = position;
  }

  render() {
    this._element = createElementFromTemplate(this._template);
    this._element.style.left = `${this._position.x}px`;
    this._element.style.top = `${this._position.y}px`;

    return this._element;
  }

  destroy() {
    this._element.remove();
    this._element = null;
  }

  move() {}
}

class PlaneView extends GameObjectView {
  constructor(props) {
    super(props);
  }

  move(position) {
    if (!this._element) return;

    this._position = position;

    this._element.style.left = `${position.x}px`;
    this._element.style.top = `${position.y}px`;
  }
}

class CounterView {
  constructor({ value }) {
    this._element = null;
    this._value = value;
  }

  render() {
    this._element = document.createElement("span");
    this._element.className = "counter-value";
    this._element.textContent = this._value;

    return this._element;
  }

  destroy() {
    this._element.remove();
    this._element = null;
  }

  update(newValue) {
    this._value = newValue;
    this._element.textContent = this._value;
  }
}

// Mutable game objects

const gameState = new GameStateModel(initialGameState);
const planeData = new PlaneDataModel(initialPlaneData);
let timerData = {};

// Game functions

// Data creation

const createTimerData = () => {
  timerData = new TimerDataModel(Date.now());
};

// Rendering

const renderTimer = () => {
  const timerInstance = new CounterView({ value: INITIAL_TIMER_VALUE });
  timeCounterWrapper.append(timerInstance.render());

  const updateTimer = () => {
    const timeFromStart = (Date.now() - timerData.startTime) / 1000;
    const minutes = Math.round(timeFromStart / 60);
    const seconds = Math.round(timeFromStart % 60);
    const timerValue = `${minutes > 9 ? minutes : `0${minutes}`}:${
      seconds > 9 ? seconds : `0${seconds}`
    }`;

    timerInstance.update(timerValue);

    requestAnimationFrame(updateTimer);
  };

  requestAnimationFrame(updateTimer);
};

const renderPlane = () => {
  const changePlaneDirection = (directions) => {
    planeData.directions = { ...planeData.directions, ...directions };
  };

  const handleKeyDown = (evt) => {
    if (evt.code === Keys.KEY_W || evt.code === Keys.ARROW_UP) {
      changePlaneDirection({ top: true });
    }

    if (evt.code === Keys.KEY_S || evt.code === Keys.ARROW_DOWN) {
      changePlaneDirection({ bottom: true });
    }

    if (evt.code === Keys.KEY_A || evt.code === Keys.ARROW_LEFT) {
      changePlaneDirection({ left: true });
    }

    if (evt.code === Keys.KEY_D || evt.code === Keys.ARROW_RIGHT) {
      changePlaneDirection({ right: true });
    }
  };

  const handleKeyUp = (evt) => {
    if (evt.code === Keys.KEY_W || evt.code === Keys.ARROW_UP) {
      changePlaneDirection({ top: false });
    }

    if (evt.code === Keys.KEY_S || evt.code === Keys.ARROW_DOWN) {
      changePlaneDirection({ bottom: false });
    }

    if (evt.code === Keys.KEY_A || evt.code === Keys.ARROW_LEFT) {
      changePlaneDirection({ left: false });
    }

    if (evt.code === Keys.KEY_D || evt.code === Keys.ARROW_RIGHT) {
      changePlaneDirection({ right: false });
    }
  };

  const planeInstance = new PlaneView({
    template: planeData.template,
    position: planeData.position,
  });

  playgroundElement.append(planeInstance.render());

  const normalizePlanePosition = () => {
    if (planeData.position.x < 0) {
      planeData.position.x = 0;
    }

    if (
      planeData.position.x + planeData.width >
      playgroundElement.clientWidth
    ) {
      planeData.position.x = playgroundElement.clientWidth - planeData.width;
    }

    if (planeData.position.y < 0) {
      planeData.position.y = 0;
    }

    if (
      planeData.position.y + planeData.height >
      playgroundElement.clientHeight
    ) {
      planeData.position.y = playgroundElement.clientHeight - planeData.height;
    }
  };

  const changePlanePosition = () => {
    planeData.position.y -= planeData.directions.top && planeData.speed;
    planeData.position.y += planeData.directions.bottom && planeData.speed;

    planeData.position.x += planeData.directions.right && planeData.speed;
    planeData.position.x -= planeData.directions.left && planeData.speed;

    normalizePlanePosition();
    planeInstance.move(planeData.position);
  };

  const movePlain = () => {
    if (!gameState.isStarted) return;

    changePlanePosition();

    requestAnimationFrame(movePlain);
  };

  requestAnimationFrame(movePlain);

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
};

const initGame = () => {
  gameState.isStarted = true;

  createTimerData();

  renderPlane();
  renderTimer();
};

// Main event handlers

const handleStartGameButtonClick = () => {
  hideElement(startModalElement);
  initGame();
};

const handleIncreaseFontSizeButtonClick = () => {
  body.style.fontSize = `${++gameState.fontSize}px`;
};

const handleDecreaseFontSizeButtonClick = () => {
  body.style.fontSize = `${--gameState.fontSize}px`;
};

// Main event listeners

startGameButton.addEventListener("click", handleStartGameButtonClick);

increaseFontSizeButton.addEventListener(
  "click",
  handleIncreaseFontSizeButtonClick
);

decreaseFontSizeButton.addEventListener(
  "click",
  handleDecreaseFontSizeButtonClick
);
