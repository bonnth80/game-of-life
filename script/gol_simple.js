// Conway's game of life rules:
// Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

// Note to self: Chrome reports nested arrays in an awkward way... to visualize nested array reports
// as you would your grid, first flip vertically, then rotate 90 degrees clockwise

//*******************************
// Canvas
//*******************************
var oCanv = document.querySelector('canvas');

if (oCanv.getContext) var canvX = oCanv.getContext('2d');

//*******************************
// Initialization
//*******************************

// game settings
let grid_sizeX = 120; // number of cells across x access
let grid_sizeY = 80; // number of cells across y access
let cell_size = 5; // size of cells in pixels
let gridColor = '#FFFFFF'; // color of grid lines
let gridBG = '#EEF'; // color of background
let cellColor = '#338'; // color of live cells
let borderColorPaused = '#556'; // color of non-interactible cell border when paused
let borderColorPlay = '#9C9'; // color of non-interactible cell border when unpaused
let buttonColor = document.getElementById('btPlay').style.color;

let censusManager = {
  cellGrid: [], // Array of X columns
  toggleList: [], // list of cells to be toggled on next step
  playSpeed: 30, // steps per second
  playActive: false, // false = pause, true = play.
};

//initialize cellgrid
resetGrid(censusManager);

//*******************************
// Core functions
//*******************************

// core app loop - runs a single step in gol sequence
function runSequence(censusManager = censusManager) {
  calculateNextStep(censusManager);
  populateCellData(censusManager);
  updateRender(canvX, censusManager);
}

// calculate the next step in play sequence
// updates the toggle list which is then pushed to load step
function calculateNextStep(censusManager = censusManager) {
  censusManager.toggleList = [];

  for (var x = 1; x < grid_sizeX - 1; x++) {
    for (var y = 1; y < grid_sizeY - 1; y++) {
      var liveCount = getNeighborCount(censusManager.cellGrid, x, y);

      // If this cell is alive AND live neighbors < 2 or > 3
      if (
        (censusManager.cellGrid[x][y] && (liveCount < 2 || liveCount > 3)) ||
        // or if this cell is dead and live neighbors == 3
        (!censusManager.cellGrid[x][y] && liveCount == 3)
      )
        // Then toggle (spawn if dead, die if alive)
        censusManager.toggleList.push([x, y]);
    }
  }
}

function getNeighborCount(cellGrid = censusManager.cellGrid, x, y) {
  var liveCount = 0;

  liveCount +=
    cellGrid[x - 1][y - 1] + // check NW neighbor
    cellGrid[x][y - 1] + // check N neighbor
    cellGrid[x + 1][y - 1] + // check NE neighbor
    cellGrid[x - 1][y] + // check W neighbor
    cellGrid[x + 1][y] + // check E neighbor
    cellGrid[x - 1][y + 1] + // check SW neighbor
    cellGrid[x][y + 1] + // check S neighbor
    cellGrid[x + 1][y + 1]; // check SE neighbor

  return liveCount;
}

// update census data using toggle list
function populateCellData(censusManager, preset = censusManager.toggleList) {
  if (!Array.isArray(preset)) return false;

  preset.forEach((pElement) => {
    censusManager.cellGrid[pElement[0]][pElement[1]] =
      !censusManager.cellGrid[pElement[0]][pElement[1]];
  });

  return true;
}

// Allow the loading of preset pattern data
function loadPreset(
  censusManager,
  preset,
  offsetX = 0,
  offsetY = 0,
  canvS = canvX
) {
  resetGrid(censusManager);
  if (!Array.isArray(preset)) return false;

  for (var x = 0; x < grid_sizeX; x++) {
    var tempX = [];
    for (var i = 0; i < grid_sizeX; i++) {
      tempX[i] = false;
    }

    preset.forEach((pElement) => {
      if (pElement[0] + offsetX == x) tempX[pElement[1] + offsetY] = true;
    });
    censusManager.cellGrid[x] = tempX;
  }
  updateRender(canvS, censusManager, false);
  return true;
}

// creates a blank field
function resetGrid(censusManager) {
  let yGrid = [];
  censusManager.cellGrid = [];
  for (var x = 0; x < grid_sizeX; x++) {
    for (var y = 0; y < grid_sizeY; y++) {
      yGrid.push(false);
    }
    censusManager.cellGrid[x] = yGrid;
    yGrid = [];
  }
}

// updates the canvas to reflect censusManager's data
function updateRender(canvS, censusManager, useToggleList = true) {
  if (useToggleList) {
    // save performance by only checking cells effected by toggle list
    censusManager.toggleList.forEach(function (tElement) {
      // for each cell in toggle list
      // if cell is currently off, turn it on
      if (censusManager.cellGrid[tElement[0]][tElement[1]])
        cFillCell(canvS, tElement[0], tElement[1]);
      // if cell is currently on, turn it off
      if (!censusManager.cellGrid[tElement[0]][tElement[1]])
        cClearCell(canvS, tElement[0], tElement[1]);
    });
  } else
    for (var x = 1; x < grid_sizeX - 1; x++) {
      for (var y = 1; y < grid_sizeY - 1; y++) {
        if (censusManager.cellGrid[x][y]) cFillCell(canvS, x, y);
        else cClearCell(canvS, x, y);
      }
    }
}

//==========================================================
// Canvas Renderer
//==========================================================

// grid ------------------
canvX.strokeStyle = gridColor;

function drawGrid(cVal) {
  canvX.strokeStyle = gridColor;

  canvX.beginPath();
  for (var i = 1; i <= grid_sizeY - 1; i++) {
    canvX.moveTo(cell_size + 0.5, i * cell_size + 0.5);
    canvX.lineTo((grid_sizeX - 1) * cell_size + 0.5, i * cell_size + 0.5);
  }

  for (var i = 1; i <= grid_sizeX - 1; i++) {
    canvX.moveTo(i * cell_size + 0.5, cell_size + 0.5);
    canvX.lineTo(i * cell_size + 0.5, (grid_sizeY - 1) * cell_size + 0.5);
  }
  canvX.stroke();
}

colorBorder(borderColorPaused);

// color noninteractive border cells
function colorBorder(cVal) {
  canvX.fillStyle = cVal;
  canvX.fillRect(0, 0, cell_size * grid_sizeX, cell_size);
  canvX.fillRect(0, 0, cell_size, grid_sizeY * cell_size);
  canvX.fillRect(
    0,
    cell_size * (grid_sizeY - 1),
    cell_size * grid_sizeX,
    grid_sizeY * cell_size
  );
  canvX.fillRect(
    (grid_sizeX - 1) * cell_size,
    0,
    cell_size * grid_sizeX,
    grid_sizeY * cell_size
  );
}

// Renders a cell at x, y
function cFillCell(canv, x, y, color = cellColor) {
  canv.fillStyle = color;
  canv.fillRect(
    x * cell_size + 1,
    y * cell_size + 1,
    cell_size - 1,
    cell_size - 1
  );
}

// Unrenders a cell at x, y
function cClearCell(canv, x, y, color = gridBG) {
  canv.fillStyle = color;
  canv.fillRect(
    x * cell_size + 1,
    y * cell_size + 1,
    cell_size - 1,
    cell_size - 1
  );
}

// Unrenders all cells
function cClearAllCells(canv) {
  for (var i = 1; i <= grid_sizeX - 2; i++) {
    for (var j = 1; j <= grid_sizeY - 2; j++) {
      canv.fillStyle = gridBG;
      canv.fillRect(
        i * cell_size + 0.5,
        j * cell_size + 0.5,
        cell_size - 1,
        cell_size - 1
      );
    }
  }
}

//==========================================================
// UI - Canvas Mouse Events
//==========================================================

var mouseDown = false;
var drawErase = false;

// get location for first mouse click drag and start drawing (or erasing)
// starts erase drag if cell is present, starts draw drag if cell is NOT present
oCanv.onmousedown = function (event) {
  mouseDown = true;

  var elem = this.getBoundingClientRect();

  var relX = event.clientX - elem.left;
  var relY = event.clientY - elem.top;

  var cellX = (relX - (relX % cell_size)) / cell_size;
  var cellY = (relY - (relY % cell_size)) / cell_size;

  if (
    cellX > 0 &&
    cellX < grid_sizeX - 1 &&
    cellY > 0 &&
    cellY < grid_sizeY - 1
  ) {
    if (censusManager.cellGrid[cellX][cellY]) {
      drawErase = false;
      toggleCell(cellX, cellY);
    } else {
      toggleCell(cellX, cellY);
      drawErase = true;
    }
  }
};
// end mouse drag drawing when mouse is let go
oCanv.onmouseup = function () {
  mouseDown = false;
};

// end mouse drag drawing when mouse leaves canvas area
oCanv.onmouseout = function () {
  mouseDown = false;
};

// draw/erase event
oCanv.onmousemove = function (event) {
  if (mouseDown) {
    var elem = this.getBoundingClientRect();

    var relX = event.clientX - elem.left;
    var relY = event.clientY - elem.top;

    var cellX = (relX - (relX % cell_size)) / cell_size;
    var cellY = (relY - (relY % cell_size)) / cell_size;

    if (
      cellX > 0 &&
      cellX < grid_sizeX - 1 &&
      cellY > 0 &&
      cellY < grid_sizeY - 1
    )
      if (drawErase != censusManager.cellGrid[cellX][cellY]) {
        toggleCell(cellX, cellY);
      }
  }
};

function toggleCell(cellX, cellY) {
  // get current X column and make a temporary copy of it
  var tempX = censusManager.cellGrid[cellX];
  tempX[cellY] = !censusManager.cellGrid[cellX][cellY];
  censusManager.cellGrid[cellX] = tempX;

  if (censusManager.cellGrid[cellX][cellY]) cFillCell(canvX, cellX, cellY);
  else cClearCell(canvX, cellX, cellY);

  //updateRender(canvX, censusManager, false);
}

//*******************************
// Pattern Presets
//*******************************

var presetPatterns = {
  ppGGGun: {
    displayName: 'Gosper Glider Gun',
    listValue: 'poGGGun',
    offsetX: 5,
    offsetY: 0,
    patternData: [
      [1, 7],
      [1, 8],
      [2, 7],
      [2, 8],
      [11, 7],
      [11, 8],
      [11, 9],
      [12, 6],
      [12, 10],
      [13, 5],
      [13, 11],
      [14, 5],
      [14, 11],
      [15, 8],
      [16, 6],
      [16, 10],
      [17, 7],
      [17, 8],
      [17, 9],
      [18, 8],
      [21, 5],
      [21, 6],
      [21, 7],
      [22, 5],
      [22, 6],
      [22, 7],
      [23, 4],
      [23, 8],
      [25, 3],
      [25, 4],
      [25, 8],
      [25, 9],
      [35, 5],
      [35, 6],
      [36, 5],
      [36, 6],
    ],
  },
  ppToad: {
    displayName: 'Toad',
    listValue: 'poToad',
    offsetX: 20,
    offsetY: 18,
    patternData: [
      [1, 0],
      [2, 0],
      [3, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  ppGibberish: {
    displayName: 'Gibberish',
    listValue: 'poGibberish',
    offsetX: 20,
    offsetY: 18,
    patternData: [
      [0, 1],
      [1, 4],
      [3, 1],
      [2, 4],
      [2, 5],
      [3, 5],
      [7, 4],
      [8, 4],
      [8, 5],
      [1, 3],
      [1, 2],
      [3, 2],
      [0, 4],
      [0, 2],
      [10, 5],
      [10, 6],
      [11, 4],
      [11, 4],
      [11, 4],
      [12, 3],
      [12, 7],
    ],
  },
  ppAcorn: {
    displayName: 'Acorn',
    listValue: 'poAcorn',
    offsetX: 80,
    offsetY: 36,
    patternData: [
      [1, 1],
      [3, 2],
      [0, 3],
      [1, 3],
      [4, 3],
      [5, 3],
      [6, 3],
    ],
  },
  ppRPentomino: {
    displayName: 'R-Pentomino',
    listValue: 'poRPentomino',
    offsetX: 60,
    offsetY: 36,
    patternData: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  },
  ppSpaceship: {
    displayName: 'Spaceship',
    listValue: 'poSpaceship',
    offsetX: 1,
    offsetY: 18,
    patternData: [
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 1],
      [0, 2],
      [5, 2],
      [5, 3],
      [0, 4],
      [4, 4],
      [2, 5],
    ],
  },
};

//==========================================================
// UI - Form Controls
//==========================================================
var btPause = document.getElementById('btPause');
var btPlay = document.getElementById('btPlay');
var btStep = document.getElementById('btStep');
var btSpeed01 = document.getElementById('btSpeed01');
var btSpeed10 = document.getElementById('btSpeed10');
var btSpeed20 = document.getElementById('btSpeed20');
var btSpeed30 = document.getElementById('btSpeed30');
var btReset = document.getElementById('btReset');
var slPreset = document.getElementById('sl-presets');
// var btLoadPreset = document.getElementById("btLoadPreset");
var btRandom = document.getElementById('btRandom');
var btToggleColors = document.getElementById('btToggleColors');
var btColorLive = document.getElementById('colorLive');
var btColorDead = document.getElementById('colorDead');
var btColorBorder = document.getElementById('colorBorder');
var btColorActive = document.getElementById('colorActive');
var btColorGrid = document.getElementById('colorGrid');
var btToggleSizes = document.getElementById('btToggleSizes');
var txtHorizontal = document.getElementById('txtHorizontal');
var txtVertical = document.getElementById('txtVertical');
var lblInfoCellSize = document.getElementById('info-cellSize');
var lblInfoColumns = document.getElementById('info-columns');
var lblInfoRows = document.getElementById('info-rows');
var lblInfoCellCount = document.getElementById('info-cellCount');

btSpeed30.style.backgroundColor = borderColorPlay;

var outputX = function () {
  runSequence(censusManager);
};

function setPlayMode(bRunSimulation) {
  if (bRunSimulation)
    stepPlayer = setInterval(outputX, 1000 / censusManager.playSpeed);
  else if (typeof stepPlayer !== 'undefined') clearInterval(stepPlayer);
}

function setSpeedAtPlay(speed) {
  setPlayMode(false);
  censusManager.playSpeed = speed;
  setPlayMode(true);
}

function resetSHL(iList) {
  // list of items to set bg color
  if (!Array.isArray(iList)) {
    console.warning(
      'gol_simple.js: no overload for resetSHL(iList) for passed arguments'
    );
    return false;
  }
  iList.forEach((el) => {
    el.style.backgroundColor = buttonColor;
  });
}

btPlay.onclick = function () {
  if (!censusManager.playActive) {
    colorBorder(borderColorPlay);
    this.style.backgroundColor = borderColorPlay;
    setPlayMode(true);
    censusManager.playActive = true;
  }
};

btPause.onclick = function () {
  colorBorder(borderColorPaused);
  btPlay.style.backgroundColor = buttonColor;
  setPlayMode(false);
  censusManager.playActive = false;
};

btReset.onclick = function () {
  colorBorder(borderColorPaused);
  btPlay.style.backgroundColor = buttonColor;
  if (censusManager.playActive) {
    setPlayMode(false);
    censusManager.playActive = false;
  }
  resetGrid(censusManager);
  updateRender(canvX, censusManager, false);
};

btStep.onclick = function () {
  colorBorder(borderColorPaused);
  btPlay.style.backgroundColor = buttonColor;
  if (censusManager.playActive) {
    setPlayMode(false);
    censusManager.playActive = false;
    runSequence(censusManager);
  } else {
    runSequence(censusManager);
  }
};

btSpeed01.onclick = function () {
  this.style.backgroundColor = borderColorPlay;
  resetSHL([btSpeed10, btSpeed20, btSpeed30]);
  if (censusManager.playActive) setSpeedAtPlay(1);
  else censusManager.playSpeed = 1;
};

btSpeed10.onclick = function () {
  resetSHL([btSpeed01, btSpeed20, btSpeed30]);
  this.style.backgroundColor = borderColorPlay;
  if (censusManager.playActive) setSpeedAtPlay(10);
  else censusManager.playSpeed = 10;
};

btSpeed20.onclick = function () {
  this.style.backgroundColor = borderColorPlay;
  resetSHL([btSpeed01, btSpeed10, btSpeed30]);
  if (censusManager.playActive) setSpeedAtPlay(20);
  else censusManager.playSpeed = 20;
};

btSpeed30.onclick = function () {
  this.style.backgroundColor = borderColorPlay;
  resetSHL([btSpeed01, btSpeed10, btSpeed20]);
  if (censusManager.playActive) setSpeedAtPlay(30);
  else censusManager.playSpeed = 30;
};

slPreset.onchange = function () {
  var q;

  Object.keys(presetPatterns).forEach((el) => {
    q = presetPatterns[el];
    if (q.listValue == slPreset.value)
      loadPreset(censusManager, q.patternData, q.offsetX, q.offsetY);
  });
};

btRandom.onclick = function () {
  var randSet = [];
  for (var x = 1; x < grid_sizeX - 1; x++) {
    for (var y = 1; y < grid_sizeY - 1; y++) {
      if (Math.floor(Math.random() * 2)) {
        randSet.push([x, y]);
      }
    }
  }

  loadPreset(censusManager, randSet, 0, 0);
};

var showSizes = false;
var showColors = false;

function toggleColors() {
  var ctColors = document.getElementsByClassName('ct-color')[0];

  if (!showColors) {
    ctColors.style.height = '158px';
    ctColors.style.padding = '4px';
    ctColors.style.border = ' 1px solid #BBBBBB';
  } else {
    ctColors.style.height = '0px';
    ctColors.style.padding = '0px 4px';
    ctColors.style.border = 'none';
  }

  showColors = !showColors;
}

function toggleSizes() {
  var ctSizes = document.getElementsByClassName('ct-sizes')[0];

  if (!showSizes) {
    ctSizes.style.height = '100px';
    // ctSizes.style.padding = "4px";
    ctSizes.style.border = ' 1px solid #BBBBBB';
  } else {
    ctSizes.style.height = '0px';
    // ctSizes.style.padding = "0px 4px";
    ctSizes.style.border = 'none';
  }

  showSizes = !showSizes;
}

btToggleColors.onclick = function () {
  //    border:              1px solid #BBBBBB;
  if (showSizes) toggleSizes();
  toggleColors();
};

btColorLive.onchange = function () {
  cellColor = btColorLive.value;
  updateRender(canvX, censusManager, false);
};

btColorDead.onchange = function () {
  gridBG = btColorDead.value;
  updateRender(canvX, censusManager, false);
};

btColorBorder.onchange = function () {
  borderColorPaused = btColorBorder.value;
  if (!censusManager.playActive) colorBorder(borderColorPaused);
};

btColorActive.onchange = function () {
  borderColorPlay = btColorActive.value;
  if (censusManager.playActive) colorBorder(borderColorPlay);
};

btColorGrid.onchange = function () {
  gridColor = btColorGrid.value;
  drawGrid(gridColor);
};

btToggleSizes.onclick = function () {
  //    border:              1px solid #BBBBBB;
  if (showColors) toggleColors();
  toggleSizes();
};

txtVertical.onchange = function () {
  var vVal = parseInt(txtVertical.value);
  if (vVal === NaN) {
    txtVertical.value = grid_sizeY;
    alert('gol_simple.js\ncannot parse vertical value');
    return 0;
  }
  if (vVal % 4 != 0) {
    txtVertical.value = grid_sizeY;
    alert('gol_simple.js\nvertical value must be divisible by 4');
    return 0;
  }
  if (vVal < 4 || vVal > 200) {
    txtVertical.value = grid_sizeY;
    alert('gol_simple.js\nvertical value out of range (4 - 200');
    return 0;
  }

  txtHorizontal.value = (vVal * 3) / 2;

  grid_sizeX = txtHorizontal.value;
  grid_sizeY = vVal;
  cell_size = 600 / grid_sizeX;

  resetGrid(censusManager);
  updateRender(canvX, censusManager, false);
  colorBorder(borderColorPaused);
  drawGrid(gridColor);
  updateCellStatistics();
};

txtHorizontal.onchange = function () {
  var hVal = parseInt(txtHorizontal.value);
  if (hVal === NaN) {
    txtHorizontal.value = grid_sizeX;
    alert('gol_simple.js\ncannot parse horizontal value');
    return 0;
  }
  if (hVal % 6 != 0) {
    txtHorizontal.value = grid_sizeX;
    alert('gol_simple.js\nhorizontal value must be divisible by 6');
    return 0;
  }
  if (hVal < 6 || hVal > 300) {
    txtHorizontal.value = grid_sizeX;
    alert('gol_simple.js\nhorizontal value out of range (6 - 300)');
    return 0;
  }

  txtVertical.value = (hVal * 2) / 3;

  grid_sizeX = hVal;
  grid_sizeY = txtVertical.value;
  cell_size = 600 / grid_sizeX;

  resetGrid(censusManager);
  updateRender(canvX, censusManager, false);
  colorBorder(borderColorPaused);
  drawGrid(gridColor);
  updateCellStatistics();
};

function updateCellStatistics() {
  lblInfoCellSize.innerHTML = '';
  if (cell_size != Math.floor(cell_size)) lblInfoCellSize.innerHTML = '~';
  lblInfoCellSize.innerHTML += Math.floor(cell_size) + 'px';

  lblInfoColumns.innerHTML = grid_sizeX - 2;
  lblInfoRows.innerHTML = grid_sizeY - 2;
  lblInfoCellCount.innerHTML = (grid_sizeX - 2) * (grid_sizeY - 2);
}

//==========================================================
// Data - Preset Initialization
//==========================================================
// Presets form
Object.keys(presetPatterns).forEach((el) => {
  slPreset.innerHTML +=
    '<option value="' +
    presetPatterns[el].listValue +
    '">' +
    presetPatterns[el].displayName +
    '</option>';
});

//==========================================================
// Some toy I'm working on... may be something.. may be nothing
//==========================================================

function arrOfStrToPData(arr, toStr = false) {
  // converts an array of binary strings like:
  // ["000000",
  // "011111",
  // "100001",
  // "000001",
  // "100010",
  // "001000",
  // "000000"]

  var str = toStr ? [] : '[';

  for (var i = 0; i < arr.length; i++) {
    var n = m[i].split('');
    for (var j = 0; j < n.length; j++) {
      if (n[j] == '1')
        if (toStr) str += '[' + i + ', ' + j + '],';
        else str.push([j, i]);
    }
  }

  if (toStr) str += ']';
  return str;
}

//=====================================================================
// Initialize starting pattern
//=====================================================================

loadPreset(
  censusManager,
  presetPatterns.ppGGGun.patternData,
  presetPatterns.ppGGGun.offsetX,
  presetPatterns.ppGGGun.offsetY
);
