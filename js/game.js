'use strict'


// Constants and Globals
const gLevels = [
    { size: 4, mines: 2, lives: 1 },    // Easy
    { size: 8, mines: 14, lives: 2 },   // Medium
    { size: 12, mines: 32, lives: 3 }   // Hard
]

const EMPTY = ' '
const MINE = '💣'
const FLAG = '🚩'


const victorySound = new Audio('sounds/victory.wav');
const mineSound = new Audio('sounds/gameover.wav');
const flagSound = new Audio('sounds/flag.mp3');
const emptySound = new Audio('sounds/empty.mp3');

mineSound.volume = 0.2;
victorySound.volume = 0.5;

// Game State
var gTimerInterval
var gGameStartTime
var gTimerStarted = false
var gLevel = gLevels[0]
var gBoard

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isFirstClick: true,
    lives: 0,
    mines: 0
}

var gCurrentLevelIndex = 0 // Default to Easy level




// Initialization Functions
function onInit() {
    gGame.isOn = false
    gGame.markedCount = 0
    gGame.shownCount = 0
    gGame.lives = gLevel.lives
    updateLivesDisplay()
    gGame.mines = gLevel.mines
    updateMineAndFlagCount()

    document.getElementById('timer').innerText = "0.000s"
    clearInterval(gTimerInterval)
    gTimerStarted = false
    gGame.isFirstClick = true

    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)

    
    const smileyButton = document.querySelector('.smiley-button')
    smileyButton.innerText = '😊'
}



function setLevel(levelIndex) {
    gLevel = gLevels[levelIndex]
    onInit()
}

// Game Interaction Functions
function restartGame() {
    onInit()
    closeModal()
    
}

function openInstructions() {
    document.querySelector('.instructions-modal').style.display = 'block';
}

function closeInstructions() {
    document.querySelector('.instructions-modal').style.display = 'none';
}

// Board Functions
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
    return board
}

function placeMines(firstI, firstJ) {
    var minesPlaced = 0


    while (minesPlaced < gLevel.mines) {
        const i = Math.floor(Math.random() * gLevel.size)
        const j = Math.floor(Math.random() * gLevel.size)

        if (isCellSafe(i, j, firstI, firstJ) && !gBoard[i][j].isMine) {
            gBoard[i][j].isMine = true
            minesPlaced++
        }

        if (minesPlaced >= gLevel.mines) break
    }

    if (minesPlaced < gLevel.mines) {
        console.warn('Could not place all mines after multiple attempts. Please check the logic.');
    }
}



function isCellSafe(i, j, firstI, firstJ) {

    if (i === firstI && j === firstJ) return false

    if (Math.abs(i - firstI) <= 1 && Math.abs(j - firstJ) <= 1) return false

    return true
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



// Rendering Functions

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


// Game Logic Functions
function checkWin() {
    var correctFlags = 0
    const totalCells = gLevel.size * gLevel.size
    const revealedCells = gGame.shownCount
    const totalMines = gLevel.mines


    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j];
            if (cell.isMine && cell.isMarked) {
                correctFlags++
            }
        }
    }


    const nonMineCells = totalCells - totalMines
    console.log(`Revealed Cells: ${revealedCells}, Correct Flags: ${correctFlags}, Total Cells: ${totalCells}, Lives: ${gGame.lives}`);


    if (correctFlags === totalMines && revealedCells === nonMineCells) {
        gGame.isOn = false
        victorySound.play()
        clearInterval(gTimerInterval)

        const smileyButton = document.querySelector('.smiley-button')
        smileyButton.innerText = '🏅'
    }
}



function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && cell.isShown) {
                if (gGame.lives > 1) {
                    gGame.lives--
                    updateLivesDisplay()
                    
                    const minesLeftElement = document.getElementById('minesLeft')
                    minesLeftElement.innerText = Math.max(0, parseInt(minesLeftElement.innerText) - 1)
                    return

                } else {
                    gGame.lives = 0
                    updateLivesDisplay()
                    
                    const smileyButton = document.querySelector('.smiley-button')
                    smileyButton.innerText = '😵‍💫'
                    mineSound.play()
                    showModal('Game Over ! You lost all lives.')
                    gGame.isOn = false
                    clearInterval(gTimerInterval);
                }
            }
        }
    }
}




// User Interaction Functions

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        gGame.isOn = true
    }

    if (gGame.isFirstClick) {
        placeMines(i, j)
        setMinesNegsCount(gBoard)
        gGame.isFirstClick = false
    }

    // Reveal the clicked cell
    var currCell = gBoard[i][j];
    if (currCell.isMarked || currCell.isShown) return


    if (!gTimerStarted) {
        startTimer()
        gTimerStarted = true
    }


    currCell.isShown = true;
    elCell.classList.add('revealed')

    if (currCell.isMine) {
        elCell.innerHTML = `<img src="imgs/bomb.png" alt="Bomb" style="width: 30px; height: 30px;">`
        elCell.classList.add('mine')
        gGame.shownCount++
        
           
        gGame.mines--
        document.getElementById('minesLeft').innerText = gGame.mines
        document.getElementById('flagsLeft').innerText = gGame.mines


        if (gGame.lives > 1) {
            gGame.lives--;
            updateLivesDisplay();

        } else {
            gGame.lives = 0;
            updateLivesDisplay();
            const smileyButton = document.querySelector('.smiley-button');
            smileyButton.innerText = '😵‍💫';
            mineSound.play();
            showModal('Game Over! You lost all lives.');
            gGame.isOn = false;
            clearInterval(gTimerInterval);
        }
        return
    } else {
        elCell.innerText = currCell.minesAroundCount;
        elCell.classList.add(`cell-${currCell.minesAroundCount}`);
        gGame.shownCount++;
        emptySound.play();

        if (currCell.minesAroundCount === 0) {
            expandShown(gBoard, elCell, i, j);
        }
        checkWin()
    }
}


function onCellMarked(elCell, i, j) {
    console.log(`Marked Count Before: ${gGame.markedCount}`);
    
    const currCell = gBoard[i][j]
    if (currCell.isShown) return

    currCell.isMarked = !currCell.isMarked
    if (currCell.isMarked) {
        gGame.markedCount++;
    } else {
        gGame.markedCount--;
    }
    const minesLeft = gLevel.mines - gGame.markedCount
    document.getElementById('minesLeft').innerText = minesLeft
    document.getElementById('flagsLeft').innerText = minesLeft

    elCell.innerHTML = currCell.isMarked ? `<img src="imgs/flag.png" alt="Flag" style="width: 25px; height: 25px;">` : EMPTY;
    elCell.classList.toggle('flag', currCell.isMarked);

    if (currCell.isMarked) {
        flagSound.play()
    }

    checkWin()
    console.log(`Marked Count After: ${gGame.markedCount}`);
}



// Expansion Functions

function expandShown(board, elCell, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
            if (row < 0 || col < 0 || row >= board.length || col >= board[0].length) continue;
            const neighborCell = board[row][col];
            if (!neighborCell.isShown && !neighborCell.isMine) {
                const neighborEl = document.querySelector(`.cell-${row}-${col}`);
                onCellClicked(neighborEl, row, col)
            }
        }
    }
}




// Timer Functions

function startTimer() {
    gGameStartTime = Date.now()
    gTimerInterval = setInterval(() => {
        const elapsedTime = Date.now() - gGameStartTime // Get total elapsed time
        const elapsedSeconds = Math.floor(elapsedTime / 1000) // Full seconds
        const elapsedMilliseconds = Math.floor((elapsedTime % 1000) / 10) // Convert to milliseconds
        document.getElementById('timer').innerText = `${elapsedSeconds}.${elapsedMilliseconds.toString().padStart(3, '0')}s`; // Format: seconds.milliseconds
    }, 10)
}



// UI Update Functions

function updateMineAndFlagCount() {
    const minesStart = gGame.mines
    document.getElementById('minesLeft').innerText = minesStart;
    document.getElementById('flagsLeft').innerText = minesStart;
    
}

function updateLivesDisplay() {
    const livesCounter = document.querySelector('.livesCounter')
    livesCounter.innerText = gGame.lives
}

function showModal(message) {
    document.querySelector('.modalMessage').innerText = message
    document.querySelector('.modal').style.display = "block"
}

function closeModal() {
    document.querySelector('.modal').style.display = "none"
}




