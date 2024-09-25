'use strict'

const gLevels = [
    { size: 4, mines: 2 },    // Easy
    { size: 8, mines: 12 },   // Medium
    { size: 12, mines: 30 }   // Hard
]

const victorySound = new Audio('sounds/victory.wav');
const mineSound = new Audio('sounds/gameover.wav');
const flagSound = new Audio('sounds/flag.mp3');
const emptySound = new Audio('sounds/empty.mp3');
mineSound.volume = 0.5;
victorySound.volume = 0.5;

var gTimerInterval
var gGameStartTime
var gTimerStarted = false

var gLevel = gLevels[0]
var gBoard

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gCurrentLevelIndex = 0 // Default to Easy level

const EMPTY = ' '
const MINE = '💣'
const FLAG = '🚩'
const UNMARKED = '<img src=" /imgs/unmarked.png">'



function onInit() {
    gGame.isOn = true
    gGame.markedCount = 0
    gGame.shownCount = 0
    document.getElementById('timer').innerText = "0.000s"
    clearInterval(gTimerInterval)
    gTimerStarted = false
    gBoard = buildBoard(gLevel.size)
    placeMines()
    renderBoard(gBoard)
    updateMineAndFlagCount()


}


function buildBoard(size) {
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    // board[0][0].isMine = true;
    // board[2][3].isMine = true;
    return board
}

function placeMines() {
    var minesPlaced = 0
    while (minesPlaced < gLevel.mines) {
        const i = Math.floor(Math.random() * gLevel.size)
        const j = Math.floor(Math.random() * gLevel.size)
        if (isCellSafe(i, j)) {
            gBoard[i][j].isMine = true;
            minesPlaced++;
        }
    }
}

function isCellSafe(i, j) {
    return !gBoard[i][j].isMine;
}



function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (!cell.isMine) {
                cell.minesAroundCount = countNegs(board, i, j)

            }
        }
    }
}



function renderBoard(board) {
    setMinesNegsCount(gBoard)
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" title="${i}-${j}"
                        onclick="onCellClicked(this,${i},${j})" 
                        oncontextmenu="onCellMarked(this,${i},${j}); return false">
                        ${EMPTY} 
                        </td>`
        }
        strHTML += '</tr>'
        console.log(board)
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}


function updateMineAndFlagCount() {
    document.getElementById('minesLeft').innerText = gLevel.mines // Total mines
    document.getElementById('flagsLeft').innerText = gLevel.mines - gGame.markedCount // Flags left
}



function checkWin() {
    var correctFlags = 0; // Count correctly flagged mines
    var totalCells = gLevel.size * gLevel.size; // Total cells
    var revealedCells = gGame.shownCount; // Revealed cells count

    // Iterate through the board to count flags and revealed cells
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j];
            if (cell.isMine && cell.isMarked) {
                correctFlags++; // Count correctly flagged mines
            }
        }
    }

    // Check win condition
    if (revealedCells + correctFlags === totalCells && correctFlags === gLevel.mines) {
        alert('Congratulations! You win!')
        gGame.isOn = false
        victorySound.play()
        clearInterval(gTimerInterval)
    }
}


function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return;

    if (!gTimerStarted) {
        startTimer()
        gTimerStarted = true // Set the flag to true
    }

    var currCell = gBoard[i][j];
    if (currCell.isMarked) return

    currCell.isShown = true;
    elCell.classList.add('revealed');

    if (currCell.isMine) {
        // elCell.innerText = MINE
        elCell.innerHTML = `<img src="imgs/bomb.png" alt="Bomb" style="width: 30px; height: 30px;">`;
        elCell.classList.add('mine');
        mineSound.play()
        checkGameOver()
    } else {
        elCell.innerText = currCell.minesAroundCount
        gGame.shownCount++
        emptySound.play()

        if (currCell.minesAroundCount === 0) {
            expandShown(gBoard, elCell, i, j);
        }
        checkWin()
    }
}




function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]
    if (currCell.isShown) return

    currCell.isMarked = !currCell.isMarked; // Toggle marked state
    gGame.markedCount += currCell.isMarked ? 1 : -1; // Update marked count

    elCell.innerHTML = currCell.isMarked ? `<img src="imgs/flag.png" alt="Flag" style="width: 25px; height: 25px;">` : EMPTY;
    // elCell.innerText = currCell.isMarked ? FLAG : EMPTY; // Update display for marking
    // elCell.classList.toggle('flag', currCell.isMarked)

    if (currCell.isMarked) {
        elCell.classList.add('flag');
    } else {
        elCell.classList.remove('flag');
    }


    if (currCell.isMarked) {
        flagSound.play();  // Play flag sound
    }

    updateMineAndFlagCount() // Update the displayed counts

    checkWin()
}



function checkGameOver() {
    // Check if the last clicked cell was a mine
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && cell.isShown) {
                alert('Game Over! You clicked a mine!');
                gGame.isOn = false // End the game
                clearInterval(gTimerInterval)
                return
            }
        }
    }
}



function expandShown(board, elCell, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
            if (row < 0 || col < 0 || row >= board.length || col >= board[0].length) continue;
            const neighborCell = board[row][col];
            if (!neighborCell.isShown && !neighborCell.isMine) {
                onCellClicked(document.querySelector(`.cell-${row}-${col}`), row, col);
            }
        }
    }
}


function setLevel(levelIndex) {
    gLevel = gLevels[levelIndex] // Set the selected level
    onInit()
}



function startTimer() {
    gGameStartTime = Date.now(); // Record the start time
    gTimerInterval = setInterval(() => {
        const elapsedTime = Date.now() - gGameStartTime; // Get total elapsed time
        const elapsedSeconds = Math.floor(elapsedTime / 1000); // Full seconds
        const elapsedMilliseconds = Math.floor((elapsedTime % 1000) / 10); // Convert to milliseconds
        document.getElementById('timer').innerText = `${elapsedSeconds}.${elapsedMilliseconds.toString().padStart(3, '0')}s`; // Format: seconds.milliseconds
    }, 10); // Update every 10 ms for more accuracy
}
