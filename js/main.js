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

const gameWrapper = document.querySelector(".game");
const playgroundElement = gameWrapper.querySelector(".playground");
const startModalElement = gameWrapper.querySelector(".start-modal");
const startGameButton = startModalElement.querySelector(".start-game");

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

// Main event listeners

startGameButton.addEventListener("click", handleStartGameButtonClick);
