// Constants

const INITIAL_TIMER_VALUE = "00:00";
const INITIAL_FUEL_COUNTER_VALUE = 10;
const FUEL_INCREASE_STEP = 10;
const FUEL_DECREASE_STEP = 1;
const INITIAL_SCORE = 0;
const MAX_STARS_COUNT = 5;
const MAX_PARACHUTES_COUNT = 3;
const MAX_BIRDS_COUNT = 8;
const MAX_CLOUDS_COUNT = 10;
const STARS_GAP = 300;
const PARACHUTES_GAP = 400;
const BIRDS_GAP = 300;
const CLOUDS_GAP = 250;
const ACTIVE_CLASSNAME = "active";
const MIN_VOLUME_LEVEL = 0;
const MAX_VOLUME_LEVEL = 1;

const Key = {
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  KEY_W: "KeyW",
  KEY_S: "KeyS",
  KEY_A: "KeyA",
  KEY_D: "KeyD",
  SPACE: "Space",
};

const SoundPath = {
  BACKGROUND: "./sound/background.mp3",
  FINISH: "./sound/finish.mp3",
  HIT: "./sound/hit.mp3",
  STAR: "./sound/star.mp3",
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
const scoreCounterWrapper = statePanelElement.querySelector(".score-counter");
const fuelCounterWrapper = statePanelElement.querySelector(".fuel-counter");
const togglePauseButton = statePanelElement.querySelector(".pause-toggler");
const toggleSoundButton = statePanelElement.querySelector(".sound-toggler");

const resultsModalElement = gameWrapper.querySelector(".results-modal");
const playAgainButton = resultsModalElement.querySelector(".play-again");
const starsResultElement = resultsModalElement.querySelector(
  ".result-stars .result-value"
);
const timeResultElement = resultsModalElement.querySelector(
  ".result-time .result-value"
);
const prevStarsResultElement = resultsModalElement.querySelector(
  ".prev-result-stars .result-value"
);
const prevTimeResultElement = resultsModalElement.querySelector(
  ".prev-result-time .result-value"
);

// Sounds

const backgroundAudio = new Audio(SoundPath.BACKGROUND);
const finishAudio = new Audio(SoundPath.FINISH);
const hitAudio = new Audio(SoundPath.HIT);
const starAudio = new Audio(SoundPath.STAR);

// Initial values

const initialGameState = {
  isStarted: false,
  isPaused: false,
  isOver: false,
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

const initialParachuteData = {
  position: {
    x: 0,
    y: 0,
  },
  speed: 2,
  template: document.querySelector("#parachute"),
  width: 50,
  height: 66,
};

const initialBirdData = {
  position: {
    x: 0,
    y: 0,
  },
  speed: 1,
  template: document.querySelector("#bird"),
  width: 46,
  height: 50,
  xBackgroundPosition: 0,
};

const initialCloudData = {
  position: {
    x: 0,
    y: 0,
  },
  speed: 0.5,
  template: document.querySelector("#cloud"),
  width: 77,
  height: 54,
};

// Useful variables

const playgroundWidth = playgroundElement.clientWidth;
const playgroundHeight = playgroundElement.clientHeight;

// Utilities

const createElementFromTemplate = (template) =>
  template.content.cloneNode(true).querySelector("*");

const hideElement = (element) => {
  element.classList.add("hidden");
};

const showElement = (element) => {
  element.classList.remove("hidden");
};

const areObjectsIntersected = (firstObjData, secondObjData) =>
  firstObjData.position.x <= secondObjData.position.x + secondObjData.width &&
  firstObjData.position.x + firstObjData.width >= secondObjData.position.x &&
  firstObjData.position.y <= secondObjData.position.y + secondObjData.height &&
  firstObjData.position.y + firstObjData.height >= secondObjData.position.y;

const playSound = (sound) => {
  sound.currentTime = 0;
  sound.play();
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
    isPaused,
    isOver,
    previousScore,
    previousTime,
    currentScore,
    currentTime,
    fontSize,
  }) {
    this.isStarted = isStarted;
    this.isPaused = isPaused;
    this.isOver = isOver;
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
  constructor({ startTime, initialValue }) {
    this.startTime = startTime;
    this.currentValue = initialValue;
    this.pauseTime = null;
    this.overTime = null;
  }
}

class ScoreCounterDataModel {
  constructor(initialValue) {
    this.value = initialValue;
  }
}

class FuelCounterDataModel {
  constructor(initialValue) {
    this.value = initialValue;
    this.previousDecrease = 0;
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

class SpriteObjectDataModel {
  constructor({
    position,
    speed,
    template,
    width,
    height,
    xBackgroundPosition,
  }) {
    this.position = position;
    this.speed = speed;
    this.template = template;
    this.width = width;
    this.height = height;
    this.xBackgroundPosition = xBackgroundPosition;
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

class SpriteGameObjectView extends GameObjectView {
  constructor(props) {
    super(props);
    this._xBackgroundPosition = props.xBackgroundPosition;
    this._width = props.width;
  }

  _animate = () => {
    this._xBackgroundPosition += this._width;
    this._element.style.backgroundPosition = `${this._xBackgroundPosition}px 0`;
  };

  move(position) {
    if (!this._element) return;

    this._position = position;

    this._element.style.left = `${position.x}px`;
    this._element.style.top = `${position.y}px`;
    requestAnimationFrame(this._animate);
  }
}

class CounterView {
  constructor(value) {
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
const birdsData = [];
const cloudsData = [];
const parachutesData = [];
const starsData = [];

let planeData = {};
let timerData = {};
let scoreCounterData = {};
let fuelCounterData = {};

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

const handlePauseKeyDown = (evt) => {
  if (evt.code === Key.SPACE) {
    pauseGame();
  }
};

const handleTogglePauseButtonClick = () => {
  pauseGame();
};

const handleToggleSoundButtonClick = () => {
  toggleSoundButton.classList.toggle(ACTIVE_CLASSNAME);

  backgroundAudio.volume =
    backgroundAudio.volume === MIN_VOLUME_LEVEL
      ? MAX_VOLUME_LEVEL
      : MIN_VOLUME_LEVEL;
  finishAudio.volume =
    finishAudio.volume === MIN_VOLUME_LEVEL
      ? MAX_VOLUME_LEVEL
      : MIN_VOLUME_LEVEL;
  hitAudio.volume =
    hitAudio.volume === MIN_VOLUME_LEVEL ? MAX_VOLUME_LEVEL : MIN_VOLUME_LEVEL;
  starAudio.volume =
    starAudio.volume === MIN_VOLUME_LEVEL ? MAX_VOLUME_LEVEL : MIN_VOLUME_LEVEL;
};

const handlePlayAgainButtonClick = () => {
  gameState.isOver = false;
  gameState.previousScore = gameState.currentScore;
  gameState.previousTime = gameState.currentTime;
  gameState.currentScore = 0;
  gameState.currentTime = INITIAL_TIMER_VALUE;

  hideElement(resultsModalElement);

  initGame();
};

// Game functions

const pauseGame = () => {
  gameState.isPaused = !gameState.isPaused;

  if (backgroundAudio.paused) {
    backgroundAudio.play();
  } else {
    backgroundAudio.pause();
  }

  timerData.startTime = timerData.pauseTime
    ? timerData.startTime + (Date.now() - timerData.pauseTime)
    : timerData.startTime;
  timerData.pauseTime = timerData.pauseTime ? null : Date.now();

  togglePauseButton.classList.toggle(ACTIVE_CLASSNAME);
};

// Game over functions

const saveResults = () => {
  gameState.currentScore = scoreCounterData.value;
  gameState.currentTime = timerData.currentValue;
};

const showResults = () => {
  showElement(resultsModalElement);

  if (gameState.previousTime) {
    prevStarsResultElement.textContent = gameState.previousScore;
    prevTimeResultElement.textContent = gameState.previousTime;

    showElement(prevStarsResultElement.parentNode);
    showElement(prevTimeResultElement.parentNode);
  }

  starsResultElement.textContent = gameState.currentScore;
  timeResultElement.textContent = gameState.currentTime;
};

const overGame = () => {
  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;

  saveResults();
  showResults();

  gameState.isStarted = false;
  gameState.isOver = true;
};

// Data creation

const createPlaneData = () => {
  planeData = new PlaneDataModel({
    ...initialPlaneData,
    position: { ...initialPlaneData.position },
  });
};

const createTimerData = () => {
  timerData = new TimerDataModel({
    startTime: Date.now(),
    initialValue: INITIAL_TIMER_VALUE,
  });
};

const createScoreCounterData = () => {
  scoreCounterData = new ScoreCounterDataModel(INITIAL_SCORE);
};

const createFuelCounterData = () => {
  fuelCounterData = new FuelCounterDataModel(INITIAL_FUEL_COUNTER_VALUE);
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

const createParachutesData = () => {
  const positionIterator = new ObjectPositionIterator({
    minMainAxisPosition: 0,
    maxMainAxisPosition: playgroundWidth - initialParachuteData.width,
    minCrossAxisPosition: 0 - initialParachuteData.height,
    mainAxisGap: PARACHUTES_GAP,
    crossAxisGap: -PARACHUTES_GAP,
  });

  for (let i = 0; i < MAX_PARACHUTES_COUNT; i++) {
    const { mainAxis: x, crossAxis: y } = positionIterator.next();

    parachutesData.push({
      ...initialParachuteData,
      position: { x, y },
    });
  }
};

const createBirdsData = () => {
  const positionIterator = new ObjectPositionIterator({
    minMainAxisPosition: 0,
    maxMainAxisPosition: playgroundHeight - initialBirdData.height,
    minCrossAxisPosition: playgroundWidth + initialBirdData.width,
    mainAxisGap: BIRDS_GAP,
    crossAxisGap: BIRDS_GAP,
  });

  for (let i = 0; i < MAX_BIRDS_COUNT; i++) {
    const { mainAxis: y, crossAxis: x } = positionIterator.next();

    birdsData.push({
      ...initialBirdData,
      position: { x, y },
    });
  }
};

const createCloudsData = () => {
  const positionIterator = new ObjectPositionIterator({
    minMainAxisPosition: 0,
    maxMainAxisPosition: playgroundHeight - initialBirdData.height,
    minCrossAxisPosition: playgroundWidth + initialBirdData.width,
    mainAxisGap: CLOUDS_GAP,
    crossAxisGap: CLOUDS_GAP,
  });

  for (let i = 0; i < MAX_BIRDS_COUNT; i++) {
    const { mainAxis: y, crossAxis: x } = positionIterator.next();

    cloudsData.push({
      ...initialCloudData,
      position: { x, y },
    });
  }
};

// Rendering

const renderTimer = () => {
  const timerInstance = new CounterView(timerData.currentValue);
  timeCounterWrapper.append(timerInstance.render());

  const updateTimer = () => {
    if (gameState.isOver) {
      timerInstance.destroy();
      timerData = {};
      return;
    }

    if (!gameState.isStarted) return;

    if (!gameState.isPaused) {
      const timeFromStart = (Date.now() - timerData.startTime) / 1000;
      timerData.currentValue = Math.round(timeFromStart % 60);

      timerInstance.update(timerData.currentValue);
    }

    requestAnimationFrame(updateTimer);
  };

  requestAnimationFrame(updateTimer);
};

const renderScoreCounter = () => {
  const scoreCounterInstance = new CounterView(scoreCounterData.value);
  scoreCounterWrapper.append(scoreCounterInstance.render());

  const updateScoreCounter = () => {
    if (gameState.isOver) {
      scoreCounterInstance.destroy();
      scoreCounterData = {};
      return;
    }

    if (!gameState.isStarted) return;

    scoreCounterInstance.update(scoreCounterData.value);

    requestAnimationFrame(updateScoreCounter);
  };

  requestAnimationFrame(updateScoreCounter);
};

const renderFuelCounter = () => {
  const fuelCounterInstance = new CounterView(fuelCounterData.value);
  fuelCounterWrapper.append(fuelCounterInstance.render());

  const updateFuelCounter = () => {
    if (gameState.isOver) {
      fuelCounterInstance.destroy();
      fuelCounterData = {};
      return;
    }

    if (!gameState.isStarted) return;

    if (!gameState.isPaused) {
      const timeFromStart = (Date.now() - timerData.startTime) / 1000;
      const seconds = Math.round(timeFromStart % 60);
      fuelCounterData.value -=
        fuelCounterData.previousDecrease === seconds ? 0 : FUEL_DECREASE_STEP;
      fuelCounterData.previousDecrease = seconds;

      fuelCounterInstance.update(fuelCounterData.value);

      if (fuelCounterData.value === 0) {
        overGame();
        finishAudio.play();
      }
    }

    requestAnimationFrame(updateFuelCounter);
  };

  requestAnimationFrame(updateFuelCounter);
};

const renderPlane = () => {
  const changePlaneDirection = (directions) => {
    planeData.directions = { ...planeData.directions, ...directions };
  };

  const handleKeyDown = (evt) => {
    if (evt.code === Key.KEY_W || evt.code === Key.ARROW_UP) {
      changePlaneDirection({ top: true });
    }

    if (evt.code === Key.KEY_S || evt.code === Key.ARROW_DOWN) {
      changePlaneDirection({ bottom: true });
    }

    if (evt.code === Key.KEY_A || evt.code === Key.ARROW_LEFT) {
      changePlaneDirection({ left: true });
    }

    if (evt.code === Key.KEY_D || evt.code === Key.ARROW_RIGHT) {
      changePlaneDirection({ right: true });
    }
  };

  const handleKeyUp = (evt) => {
    if (evt.code === Key.KEY_W || evt.code === Key.ARROW_UP) {
      changePlaneDirection({ top: false });
    }

    if (evt.code === Key.KEY_S || evt.code === Key.ARROW_DOWN) {
      changePlaneDirection({ bottom: false });
    }

    if (evt.code === Key.KEY_A || evt.code === Key.ARROW_LEFT) {
      changePlaneDirection({ left: false });
    }

    if (evt.code === Key.KEY_D || evt.code === Key.ARROW_RIGHT) {
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
    if (gameState.isOver) {
      planeInstance.destroy();
      planeData = {};
      return;
    }

    if (!gameState.isStarted) return;

    if (!gameState.isPaused) {
      changePlanePosition();
    }

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

  const removeStar = (instance, index) => {
    instance.destroy();
    starsData.splice(index, 1);
    regenerateStars();
  };

  const moveStar = (data, instance, index) => () => {
    if (gameState.isOver) {
      removeStar(instance, index);
      return;
    }

    if (!gameState.isStarted) return;

    if (!gameState.isPaused) {
      if (!isStarInViewport(data)) {
        removeStar(instance, index);
        return;
      }

      if (areObjectsIntersected(planeData, data)) {
        playSound(starAudio);
        removeStar(instance, index);
        scoreCounterData.value++;
        return;
      }

      data.position.y += data.speed;
      instance.move(data.position);
    }

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

const renderParachutes = () => {
  const isParachuteInViewport = (data) => data.position.y < playgroundHeight;

  const regenerateParachutes = () => {
    if (parachutesData.length > 0) return;

    createParachutesData();
    renderParachutes();
  };

  const removeParachute = (instance, index) => {
    instance.destroy();
    parachutesData.splice(index, 1);
    regenerateParachutes();
  };

  const moveParachute = (data, instance, index) => () => {
    if (gameState.isOver) {
      removeParachute(instance, index);
      return;
    }

    if (!gameState.isStarted) return;

    if (!gameState.isPaused) {
      if (!isParachuteInViewport(data)) {
        removeParachute(instance, index);
        return;
      }

      if (areObjectsIntersected(planeData, data)) {
        playSound(starAudio);
        removeParachute(instance, index);
        fuelCounterData.value += FUEL_INCREASE_STEP;
        return;
      }

      data.position.y += data.speed;
      instance.move(data.position);
    }

    requestAnimationFrame(moveParachute(data, instance));
  };

  const renderParachute = (data, index) => {
    const instance = new GameObjectView({
      template: data.template,
      position: data.position,
    });
    playgroundElement.append(instance.render());

    requestAnimationFrame(moveParachute(data, instance, index));
  };

  parachutesData.forEach(renderParachute);
};

const renderBirds = () => {
  const isBirdInViewport = (data) => data.position.x + data.width > 0;

  const regenerateBirds = () => {
    if (birdsData.length > 0) return;

    createBirdsData();
    renderBirds();
  };

  const removeBird = (instance, index) => {
    instance.destroy();
    birdsData.splice(index, 1);
    regenerateBirds();
  };

  const moveBird = (data, instance, index) => () => {
    if (gameState.isOver) {
      removeBird(instance, index);
      return;
    }

    if (!gameState.isStarted) return;

    if (!gameState.isPaused) {
      if (!isBirdInViewport(data)) {
        removeBird(instance, index);
        return;
      }

      if (areObjectsIntersected(planeData, data)) {
        playSound(hitAudio);
        removeBird(instance, index);
        overGame();
        return;
      }

      data.position.x -= data.speed;
      instance.move(data.position);
    }

    requestAnimationFrame(moveBird(data, instance));
  };

  const renderBird = (data, index) => {
    const instance = new SpriteGameObjectView({
      template: data.template,
      position: data.position,
      xBackgroundPosition: data.xBackgroundPosition,
      width: data.width,
    });
    playgroundElement.append(instance.render());

    requestAnimationFrame(moveBird(data, instance, index));
  };

  birdsData.forEach(renderBird);
};

const renderClouds = () => {
  const isCloudInViewport = (data) => data.position.x + data.width > 0;

  const regenerateClouds = () => {
    if (cloudsData.length > 0) return;

    createCloudsData();
    renderClouds();
  };

  const removeCloud = (instance, index) => {
    instance.destroy();
    cloudsData.splice(index, 1);
    regenerateClouds();
  };

  const moveCloud = (data, instance, index) => () => {
    if (gameState.isOver) {
      removeCloud(instance, index);
      return;
    }

    if (!gameState.isStarted) return;

    if (!gameState.isPaused) {
      if (!isCloudInViewport(data)) {
        removeCloud(instance, index);
        return;
      }

      data.position.x -= data.speed;
      instance.move(data.position);
    }

    requestAnimationFrame(moveCloud(data, instance));
  };

  const renderCloud = (data, index) => {
    const instance = new GameObjectView({
      template: data.template,
      position: data.position,
    });
    playgroundElement.append(instance.render());

    requestAnimationFrame(moveCloud(data, instance, index));
  };

  cloudsData.forEach(renderCloud);
};

// Game functions

const createAllData = () => {
  createPlaneData();
  createTimerData();
  createScoreCounterData();
  createFuelCounterData();
  createStarsData();
  createParachutesData();
  createBirdsData();
  createCloudsData();
};

const renderAllObjects = () => {
  renderPlane();
  renderTimer();
  renderScoreCounter();
  renderFuelCounter();
  renderStars();
  renderParachutes();
  renderBirds();
  renderClouds();
};

const initGame = () => {
  gameState.isStarted = true;
  document.addEventListener("keydown", handlePauseKeyDown);
  togglePauseButton.addEventListener("click", handleTogglePauseButtonClick);

  backgroundAudio.loop = true;
  backgroundAudio.play();

  createAllData();
  renderAllObjects();
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

toggleSoundButton.addEventListener("click", handleToggleSoundButtonClick);

playAgainButton.addEventListener("click", handlePlayAgainButtonClick);
