// Utilities

const createElementFromTemplate = (template) => {
  const wrapper = document.createElement("div");
  wrapper.append(template.content.cloneNode(true));

  return wrapper;
};

// Data models

class GameStateModel {
  constructor() {
    this.isStarted = false;
    this.previousScore = 0;
    this.previousTime = null;
    this.currentScore = 0;
    this.currentTime = null;
    this.fontSize = 14;
  }
}

class PlaneDataModel {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.speed = 2;
  }
}

// View classes

class GameObject {
  constructor() {
    this._element = null;
  }

  render() {
    return (this._element = createElementFromTemplate());
  }

  destroy() {
    this._element.remove();
    this._element = null;
  }

  move() {}
}

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

// Mutable game objects

const planeData = new PlaneDataModel();
const gameState = new GameStateModel();

// Game functions

const initGame = () => {
  gameState.isStarted = true;
};

// Main event handlers

const handleStartGameButtonClick = () => {
  initGame();
};

const handleIncreaseFontSizeButtonClick = () => {
  console.log("lol");
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
