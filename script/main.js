// Constants

const INITIAL_TIMER_VALUE = "00:00";
const MAX_STARS_COUNT = 5;
const STARS_GAP = 300;

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

const initialStarData = {
  position: {
    x: 0,
    y: 0,
  },
  speed: 2,
  template: document.querySelector("#star"),
  width: 40,
  height: 38,
};

// Useful variables

const playgroundWidth = playgroundElement.clientWidth;
const playgroundHeight = playgroundElement.clientHeight;

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
    x + width < playgroundWidth &&
    y > 0 &&
    y + height < playgroundHeight
  );
};

// Utility classes

class ObjectPositionIterator {
  constructor({
    minMainAxisPosition,
    maxMainAxisPosition,
    minCrossAxisPosition,
    mainAxisGap,
    crossAxisGap,
  }) {
    this._min = minMainAxisPosition;
    this._max = maxMainAxisPosition;
    this._mainAxisGap = mainAxisGap;
    this._crossAxisGap = crossAxisGap;
    this._prevCrossAxisPosition = minCrossAxisPosition;
    this._prevMainAxisPosition = minMainAxisPosition;
  }

  _hasNext(position) {
    return this._max > position;
  }

  next() {
    const possibleMinMainAxisPosition =
      this._prevMainAxisPosition + this._mainAxisGap;
    const hasNext = this._hasNext(possibleMinMainAxisPosition);
    const currentMinMainAxisPosition = hasNext
      ? possibleMinMainAxisPosition
      : this._min;

    const position = {
      mainAxis:
        Math.random() * (this._max - currentMinMainAxisPosition) +
        currentMinMainAxisPosition,
      crossAxis: this._hasNext(possibleMinMainAxisPosition)
        ? this._prevCrossAxisPosition
        : this._prevCrossAxisPosition + this._crossAxisGap,
    };

    this._prevMainAxisPosition = position.mainAxis;
    this._prevCrossAxisPosition = position.crossAxis;

    return position;
  }
}

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

class FallingObjectDataModel {
  constructor({ position, speed, template, width, height }) {
    this.position = position;
    this.speed = speed;
    this.template = template;
    this.width = width;
    this.height = height;
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
    if (!this._element) return;

    this._element.remove();
    this._element = null;
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
let starsData = [];

// Game functions

// Data creation

const createTimerData = () => {
  timerData = new TimerDataModel(Date.now());
};

const createStarsData = () => {
  const positionIterator = new ObjectPositionIterator({
    minMainAxisPosition: 0,
    maxMainAxisPosition: playgroundWidth - initialStarData.width,
    minCrossAxisPosition: 0 - initialStarData.height,
    mainAxisGap: STARS_GAP,
    crossAxisGap: -STARS_GAP,
  });

  for (let i = 0; i < MAX_STARS_COUNT; i++) {
    const { mainAxis: x, crossAxis: y } = positionIterator.next();

    starsData.push({
      ...initialStarData,
      position: { x, y },
    });
  }
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

  const planeInstance = new GameObjectView({
    template: planeData.template,
    position: planeData.position,
  });

  playgroundElement.append(planeInstance.render());

  const normalizePlanePosition = () => {
    if (planeData.position.x < 0) {
      planeData.position.x = 0;
    }

    if (planeData.position.x + planeData.width > playgroundWidth) {
      planeData.position.x = playgroundWidth - planeData.width;
    }

    if (planeData.position.y < 0) {
      planeData.position.y = 0;
    }

    if (planeData.position.y + planeData.height > playgroundHeight) {
      planeData.position.y = playgroundHeight - planeData.height;
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

const renderStars = () => {
  const isStarInViewport = (data) => data.position.y < playgroundHeight;

  const regenerateStars = () => {
    if (starsData.length > 0) return;

    createStarsData();
    renderStars();
  };

  const moveStar = (data, instance, index) => () => {
    if (!gameState.isStarted) return;

    if (!isStarInViewport(data)) {
      instance.destroy();
      starsData.splice(index, 1);
      regenerateStars();

      return;
    }

    data.position.y += data.speed;
    instance.move(data.position);

    requestAnimationFrame(moveStar(data, instance));
  };

  const renderStar = (data, index) => {
    const instance = new GameObjectView({
      template: data.template,
      position: data.position,
    });
    playgroundElement.append(instance.render());

    requestAnimationFrame(moveStar(data, instance, index));
  };

  starsData.forEach(renderStar);
};

// Game functions

const initGame = () => {
  gameState.isStarted = true;

  createTimerData();
  createStarsData();

  renderPlane();
  renderTimer();
  renderStars();
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
