function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.scorePoints      = document.querySelector(".score-points");
  this.bestContainer    = document.querySelector(".best-container");
  this.bestPoints       = document.querySelector(".best-points");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
  this.points = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score, metadata.points);
    self.updateBestScore(metadata.bestScore, metadata.bestPoints);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var img       = document.createElement("img");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  // inner.textContent = tile.value;
  // img.style.width = '100%';
  img.src = "style/img/" + Math.min(tile.value, 16384) + ".jpg";
  img.alt = dogName(tile.value);
  img.draggable = false;
  wrapper.setAttribute('aria-label', dogName(tile.value) + ', ' + tile.value);
  inner.appendChild(img);
  var label = document.createElement('span');
  label.className = 'tile-value';
  label.textContent = tile.value.toLocaleString('en-US');
  inner.appendChild(label);

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score, points) {
  this.clearContainer(this.scoreContainer);
  this.clearContainer(this.scorePoints);

  var difference = score - this.score;
  this.score = score;
	var pointDifference = points - this.points;
	this.points = points;

  // this.scoreContainer.textContent = this.score;
	this.scorePoints.textContent = this.points;
  this.scoreContainer.textContent = dogName(this.score);

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    // addition.textContent = "+" + difference;
    addition.textContent = dogName(this.score);

    this.scoreContainer.appendChild(addition);
  }

	if (pointDifference > 0) {
		var punti = document.createElement("div");
		punti.classList.add("score-addition");
		punti.textContent = "+" + pointDifference;
		this.scorePoints.appendChild(punti);
	}
};

HTMLActuator.prototype.updateBestScore = function (bestScore, bestPoints) {
  this.bestContainer.textContent = dogName(bestScore);
  this.bestPoints.textContent = bestPoints;

	// var difference = score - this.score;
	// this.score = score;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You reached 2,048!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);

};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

