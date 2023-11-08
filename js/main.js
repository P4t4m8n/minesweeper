'use strict'

const MINE = '*'
const CELL = '_'

var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

    gGame.isOn = true

    console.table(gBoard)
}

function buildBoard(size = 4) {
    gBoard = []
    for (var i = 0; i < size; i++) {
        gBoard[i] = []
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,

            }
            gBoard[i][j] = cell
        }
    }

    for (var i = 0; i <gLevel.MINES; i++) {
        
        var cell = getRndMineFreeCell()
        cell.isMine = true
    }

}

function getRndMineFreeCell() {
    var idx = getRandomInt(0, gBoard.length-1)
    var jdx = getRandomInt(0, gBoard.length-1)
    if (gBoard[idx][jdx].isMine) getRndMineFreeCell()
    return gBoard[idx][jdx]
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) continue
            board[i][j].minesAroundCount = countNeighbors(i, j, board)
        }
    }
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[i].length; j++) {
            const cell = board[i][j]
            var className = (cell.isMine) ? 'mine' : 'cell'
            var innerStr = (className === 'mine') ? MINE : cell.minesAroundCount
            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell ${className} hidden" onclick="onCellClicked(this, ${i}, ${j})" >${innerStr}</td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCells = document.querySelector('.mine-field-cells')
    elCells.innerHTML = strHTML
}

function onCellClicked(elCell, rowIdx, colIdx) {
    if (!gGame.isOn) return
    var cell = gBoard[rowIdx][colIdx]

    cell.isShown = true

    if (cell.isMine) {
        revealAll(gBoard)
        alert('BOOM!!!')
        gGame.isOn = false
        return
    }

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isMine) continue
            const elSeat = document.querySelector
                (`[data-i="${i}"][data-j="${j}"]`)
            elSeat.classList.remove('hidden')
        }
    }

}

function onCellMarked(elCell) { }

function checkGameOver() { }

function expandShown(board, elCell, i, j) { }

function revealAll() {
    const hiddens = document.querySelectorAll('.hidden')
    for (var i = 0; i < hiddens.length; i++) {
        hiddens[i].classList.remove('hidden')
    }

}






