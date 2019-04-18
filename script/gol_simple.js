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

if (oCanv.getContext)
      var canvX = oCanv.getContext('2d');

//*******************************
// Initialization
//*******************************

// game settings
const GRID_SIZEX = 60;                 // number of cells across x access
const GRID_SIZEY = 40;                 // number of cells across y access
const CELL_SIZE = 10;                  // size of cells in pixels
const GRID_COLOR = '#FFFFFF';          // color of grid lines
const GRID_BG = "#DDDDEE";               // color of background
const CELL_COLOR = '#0000FF';          // color of live cells
const BORDER_COLOR_PAUSED = "#000";    // color of non-interactible cell border when paused
const BORDER_COLOR_PLAY = "#8F8";      // color of non-interactible cell border when unpaused
const BUTTON_COLOR = document.getElementById("btPlay").style.color;


var censusManager = {
      cellGrid: [],        // Array of X columns
      cellGridY: [],       // Nested Array of individual Y cells in an X column
      toggleList: [],      // list of cells to be toggled on next step
      playSpeed: 30,       // steps per second
      playActive: false    // false = pause, true = play.
}

//initialize cellgrid
resetGrid(censusManager);

//*******************************
// Core functions
//*******************************

// core app loop - runs a single step in gol sequence
function runSequence(censusManager = censusManager) {
      calcNextStep(censusManager);
      loadStep(censusManager);
      updateRender(canvX, censusManager);
}

// calculate the next step in play sequence
// updates the toggle list which is then pushed to load step
function calcNextStep(censusManager = censusManager) {
      censusManager.toggleList = [];

      for (var x = 1; x < GRID_SIZEX - 1; x++) {
            for (var y = 1; y < GRID_SIZEY - 1; y++) {
                  // initialize live neighbor count
                  var liveAdj = 0;

                  // count live neighbors
                  if (censusManager.cellGrid[x - 1][y - 1] == true) liveAdj++;  // check NW neighbor
                  if (censusManager.cellGrid[x    ][y - 1] == true) liveAdj++;  // check N neighbor
                  if (censusManager.cellGrid[x + 1][y - 1] == true) liveAdj++;  // check NE neighbor
                  if (censusManager.cellGrid[x - 1][y    ] == true) liveAdj++;  // check W neighbor
                  if (censusManager.cellGrid[x + 1][y    ] == true) liveAdj++;  // check E neighbor
                  if (censusManager.cellGrid[x - 1][y + 1] == true) liveAdj++;  // check SW neighbor
                  if (censusManager.cellGrid[x    ][y + 1] == true) liveAdj++;  // check S neighbor
                  if (censusManager.cellGrid[x + 1][y + 1] == true) liveAdj++;  // check SE neighbor

                  // If this cell is alive AND live neighbors < 2 or > 3
                  if (((censusManager.cellGrid[x][y]) && ((liveAdj < 2) || (liveAdj > 3))) ||
                        // or if this cell is dead and live neighbors == 3
                        ((!censusManager.cellGrid[x][y]) && (liveAdj == 3)))
                        // Then toggle (spawn if dead, die if live)
                        censusManager.toggleList.push([x, y]);
            }
      }

}

// updates the next step by updating cellGrid and cellGridY and renders it to the grid
function loadStep(censusManager, preset = censusManager.toggleList, canvS = canvX) {
      if (!Array.isArray(preset)) return false;

      for (var x = 0; x < GRID_SIZEX; x++)
            preset.forEach(presetElement => {
                  if (presetElement[0] == x)
                        censusManager.cellGrid[x][presetElement[1]] = !censusManager.cellGrid[x][presetElement[1]];
            })

      return true;
}

// Allow the loading of preset pattern data
function loadPreset(censusManager, preset, offsetX = 0, offsetY = 0, canvS = canvX) {
      resetGrid(censusManager);
      if (!Array.isArray(preset)) return false;

      for (var x = 0; x < GRID_SIZEX; x++) {
            // create a temporary column (x) to insert into array later
            var tempX = [];
            for (var i = 0; i < GRID_SIZEX; i++) { tempX[i] = false; }            

            preset.forEach(pElement => { // for each element (coordinate) in the preset
                  // if this coord's x value is the current x row
                  if (pElement[0] + offsetX == x)
                        //insert this coordinate as true in the appropriate y cell
                        tempX[pElement[1] + offsetY] = true;
            })
            censusManager.cellGrid[x] = tempX;
      }
      updateRender(canvS, censusManager, false);
      return true;
}

// creates a blank field
function resetGrid(censusManager, canvS = canvX) {
      for (var x = 0; x < GRID_SIZEX; x++) {
            for (var y = 0; y < GRID_SIZEY; y++) {
                  censusManager.cellGridY[y] = false;
            }
            censusManager.cellGrid[x] = censusManager.cellGridY;
      }
}

// updates the canvas to reflect censusManager's data
function updateRender(canvS, censusManager, checkToggleList) {
      if (checkToggleList){
            censusManager.toggleList.forEach(function(tElement){ // for each cell in toggle list
                  // if cell is currently off, turn it on
                  if (censusManager.cellGrid[tElement[0]][tElement[1]])
                        cFillCell(canvS, tElement[0], tElement[1]);
                  // if cell is ccurrent on, turn it off
                  if (!censusManager.cellGrid[tElement[0]][tElement[1]])
                        cClearCell(canvS, tElement[0], tElement[1]);
                  })
            }
      else
            for (var x = 1; x < GRID_SIZEX - 1; x++) {
                  for (var y = 1; y < GRID_SIZEY - 1; y++) {
                        if (censusManager.cellGrid[x][y])
                              cFillCell(canvS, x, y);
                        else
                              cClearCell(canvS, x, y);
                  }
            }

      drawGrid(GRID_COLOR);
}

//*******************************
// Pattern Presets
//*******************************

// Toad
var ppToad = [[1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1]];

// Gibberish
var ppGibberish = [[0, 1], [3, 1], [2, 4], [8, 4], [1, 3], [1, 2], [3, 2], [0, 4], [0, 2]];

// 2 dots
var pp2dots = [[2, 0], [0, 2]];

// Gosper's Glider Gun
var ppGGGun = [[1, 7], [1, 8], [2, 7], [2, 8], [11, 7], [11, 8], [11, 9], [12, 6], [12, 10], [13, 5],
[13, 11], [14, 5], [14, 11], [15, 8], [16, 6], [16, 10], [17, 7], [17, 8], [17, 9],
[18, 8], [21, 5], [21, 6], [21, 7], [22, 5], [22, 6], [22, 7], [23, 4], [23, 8],
[25, 3], [25, 4], [25, 8], [25, 9], [35, 5], [35, 6], [36, 5], [36, 6]];

//==========================================================
// Canvas Renderer 
//==========================================================

// grid ------------------
canvX.strokeStyle = GRID_COLOR;

drawGrid("black");

function drawGrid(cVal) {
      canvX.strokeStyle = cVal;

      for (var i = 1; i <= GRID_SIZEY - 1; i++) {
            canvX.beginPath();
            canvX.moveTo(CELL_SIZE + .5, i * CELL_SIZE + .5);
            canvX.lineTo((GRID_SIZEX - 1) * CELL_SIZE + .5, i * CELL_SIZE + .5);
            canvX.stroke();
      }

      for (var i = 1; i <= GRID_SIZEX - 1; i++) {
            canvX.beginPath();
            canvX.moveTo(i * CELL_SIZE + .5, CELL_SIZE + 0.5);
            canvX.lineTo(i * CELL_SIZE + .5, (GRID_SIZEY - 1) * CELL_SIZE + .5);
            canvX.stroke();
      }
}

colorBorder(BORDER_COLOR_PAUSED);

// color noninteractive border cells
function colorBorder(cVal) {
      canvX.fillStyle = cVal;
      canvX.fillRect(0, 0, CELL_SIZE * GRID_SIZEX, CELL_SIZE);
      canvX.fillRect(0, 0, CELL_SIZE, GRID_SIZEY * CELL_SIZE);
      canvX.fillRect(0, CELL_SIZE * (GRID_SIZEY - 1), CELL_SIZE * GRID_SIZEX, GRID_SIZEY * CELL_SIZE);
      canvX.fillRect((GRID_SIZEX - 1) * CELL_SIZE, 0, CELL_SIZE * GRID_SIZEX, GRID_SIZEY * CELL_SIZE);
}

// Renders a cell at x, y
function cFillCell(canv, x, y, color = CELL_COLOR) {
      canv.fillStyle = color;
      canv.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 1, CELL_SIZE - 1);
}

// Unrenders a cell at x, y
function cClearCell(canv, x, y, color = GRID_BG) {
      canv.fillStyle = color;
      canv.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 1, CELL_SIZE - 1);
}

// Unrenders all cells
function cClearAllCells(canv) {
      for (var i = 1; i <= GRID_SIZEX - 2; i++) {
            for (var j = 1; j <= GRID_SIZEY - 2; j++) {
                  canv.fillStyle = GRID_BG;
                  canv.fillRect(i * CELL_SIZE + .5, j * CELL_SIZE + .5, CELL_SIZE - 1, CELL_SIZE - 1)
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

      var cellX = (relX - (relX % CELL_SIZE)) / CELL_SIZE;
      var cellY = (relY - (relY % CELL_SIZE)) / CELL_SIZE;

      if (censusManager.cellGrid[cellX][cellY]) {
            drawErase = false;
            toggleCell(cellX, cellY);
      }
      else {
            toggleCell(cellX, cellY);
            drawErase = true;
      }

}
// end mouse drag drawing when mouse is let go
oCanv.onmouseup = function () {
      mouseDown = false;
}

// end mouse drag drawing when mouse leaves canvas area
oCanv.onmouseout = function () {
      mouseDown = false;
}

// draw/erase event
oCanv.onmousemove = function (event) {
      if (mouseDown) {
            var elem = this.getBoundingClientRect();

            var relX = event.clientX - elem.left;
            var relY = event.clientY - elem.top;

            var cellX = (relX - (relX % CELL_SIZE)) / CELL_SIZE;
            var cellY = (relY - (relY % CELL_SIZE)) / CELL_SIZE;

            if ((cellX != 0) && (cellY != 0) && (cellX != GRID_SIZEX) && (cellY != GRID_SIZEY))

                  if (drawErase != censusManager.cellGrid[cellX][cellY]) {
                        toggleCell(cellX, cellY);
                  }
      }
}

function toggleCell(cellX, cellY) {
      // get current X column and make a temporary copy of it
      var tempX = [];
      
      for (var i = 0; i < GRID_SIZEY; i++)
            tempX[i] = censusManager.cellGrid[cellX][i];

      tempX[cellY] = !(censusManager.cellGrid[cellX][cellY]);

      censusManager.cellGrid[cellX] = tempX;

      updateRender(canvX, censusManager);
}

//==========================================================
// UI - Form Controls
//==========================================================
btPause = document.getElementById("btPause");
btPlay = document.getElementById("btPlay");
btStep = document.getElementById("btStep");
btSpeed01 = document.getElementById("btSpeed01");
btSpeed10 = document.getElementById("btSpeed10");
btSpeed20 = document.getElementById("btSpeed20");
btSpeed30 = document.getElementById("btSpeed30");
btReset = document.getElementById("btReset");
slPreset = document.getElementById("sl-presets");
btLoadPreset = document.getElementById("btLoadPreset");

var outputX = function () {
      runSequence(censusManager);
}

function setPlayMode(playMode) {
      if (playMode) stepPlayer = setInterval(outputX, 1000 / censusManager.playSpeed);
      else if (typeof stepPlayer !== 'undefined')
            clearInterval(stepPlayer);
}

btPlay.onclick = function () {
      if (!censusManager.playActive) {
            colorBorder(BORDER_COLOR_PLAY);
            this.style.backgroundColor = BORDER_COLOR_PLAY;
            setPlayMode(true);
            censusManager.playActive = true;
      }
}

btPause.onclick = function () {
      colorBorder(BORDER_COLOR_PAUSED);
      btPlay.style.backgroundColor = BUTTON_COLOR;
      setPlayMode(false);
      censusManager.playActive = false;
}

btReset.onclick = function () {
      colorBorder(BORDER_COLOR_PAUSED);
      btPlay.style.backgroundColor = BUTTON_COLOR;
      if (censusManager.playActive) {
            setPlayMode(false);
            censusManager.playActive = false;
      }
      resetGrid(censusManager);
}

btStep.onclick = function () {
      colorBorder(BORDER_COLOR_PAUSED);
      btPlay.style.backgroundColor = BUTTON_COLOR;
      if (censusManager.playActive) {
            setPlayMode(false);
            censusManager.playActive = false;
            runSequence(censusManager);
      }
      else {
            runSequence(censusManager);
      }
}

function setSpeedAtPlay(speed) {
      setPlayMode(false);
      censusManager.playSpeed = speed;
      setPlayMode(true);

}

btSpeed01.onclick = function () {
      if (censusManager.playActive)
            setSpeedAtPlay(1);
      else censusManager.playSpeed = 1;
}

btSpeed10.onclick = function () {
      if (censusManager.playActive)
            setSpeedAtPlay(10);
      else censusManager.playSpeed = 10;
}

btSpeed20.onclick = function () {
      if (censusManager.playActive)
            setSpeedAtPlay(20);
      else censusManager.playSpeed = 20;
}

btSpeed30.onclick = function () {
      if (censusManager.playActive)
            setSpeedAtPlay(30);
      else censusManager.playSpeed = 30;
}

// Presets form

btLoadPreset.onclick = function () {
      if (slPreset.value == "poToad")
            loadPreset(censusManager, ppToad, GRID_SIZEX / 2, GRID_SIZEY / 2);

      if (slPreset.value == "poGibberish")
            loadPreset(censusManager, ppGibberish, GRID_SIZEX / 2, GRID_SIZEY / 2);

      if (slPreset.value == "poGGGun")
            loadPreset(censusManager, ppGGGun, 4, 4);
}

//=====================================================================
// Let's just go ahead and load Gosper Glider Gun as a default
//=====================================================================

loadPreset(censusManager, ppGGGun, 2, 2);