'use strict'


var gBoard = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: true
}

var gLevel = {
    size: 4,
    mines: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

const EMPTY = ' '
const MINE = '💣'
const FLAG = '🚩'
const UNMARKED = '<img src=" /imgs/unmarked.png">'



function onInit() {
    console.log('Hello')
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)

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
    board[0][0].isMine = true;
    board[2][3].isMine = true;
    return board
}

function placeMines() {

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



function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]

    if (currCell.isMarked) return


    elCell.innerText = currCell.isMine ? MINE : currCell.minesAroundCount
    if (elCell.innerText === MINE) {
        elCell.style.backgroundColor = '#c32929'
        currCell.isShow = true
    } else {
        elCell.style.backgroundColor = 'lightgrey'
        currCell.isShow = true
        gGame.shownCount++
    }


}


function onCellMarked(elCell) {


}

function checkGameOver() {


}

function expandShown(board, elCell, i, j) {


}