'use strict'

const MINE = '\u{1F4A3}'
const FLAG = '\u{26F3}'
var gBtnMods = {
    normal: '🙂',
    lost: '😞',
    Win: '🙂'
}
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    LIVES: 0,

}

function onInit() {
    buildBoard()
    renderBoard(gBoard)
}

function startGame() {
    updateLife()
    gGame.isOn = true

    placeMines()
    setMinesNegsCount(gBoard)

    renderBoard(gBoard)
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
}

function placeMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var recSafety = 151
        var cell = getRndMineFreeCell()
        cell.isMine = true
    }

}

function getRndMineFreeCell(recSafety) {
    var idx = getRandomInt(0, gBoard.length - 1)
    var jdx = getRandomInt(0, gBoard.length - 1)

    if (recSafety <= 0) return null

    if (gBoard[idx][jdx].isMine &&
        gBoard[idx][jdx].isShown)
        getRndMineFreeCell(recSafety - 1)

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

            var className
            var innerImg

            if (cell.isMarked) {
                innerImg = FLAG
                className = 'flag'
            }
            else if (cell.isShown) {
                if (cell.isMine) {
                    innerImg = MINE
                    className = 'mine'
                }
                else {
                    innerImg = cell.minesAroundCount
                    className = 'number'
                }
            }
            else {
                innerImg = ''
                className = 'emepty'
            }


            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell ${className} 
           " onclick="onCellClicked(${i}, ${j})"
             oncontextmenu="onFlagClick(${i}, ${j})" >
            ${innerImg}</td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCells = document.querySelector('.mine-field-cells')
    elCells.innerHTML = strHTML
}

function onCellClicked(rowIdx, colIdx) {


    var cell = gBoard[rowIdx][colIdx]


    if (cell.isShown) return
    if (cell.isMarked) return

    if (!gGame.isOn) {
        startGame()
    }


    if (cell.isMine) {
        alert('BOOM')
        updateLife()
        return
    }

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var tempCell = gBoard[i][j]
            if (j < 0 || j >= gBoard[i].length) continue
            if (tempCell.isMine || tempCell.isMarked || tempCell.isShown) continue
            gBoard[i][j].isShown = true
            gGame.shownCount++

        }
    }
    renderBoard(gBoard)
    updateShown()
    checkGameOver()
}

function checkGameOver() {
    if (gGame.markedCount + gGame.shownCount === gBoard.length ** 2)
        alert('winner')

}

function expandShown(board, elCell, i, j) {

}

function revealAll() {
    const hiddens = document.querySelectorAll('.hidden')

    for (var i = 0; i < hiddens.length; i++) {
        hiddens[i].classList.remove('hidden')
    }
}

function gameOver() {
    alert('GAME OVER!!!')
    revealAll(gBoard)
    gGame.isOn = false
    return
}

function updateLife() {
    gGame.LIVES--

    if (!gGame.isOn) gGame.LIVES = gLevel.MINES

    var elLife = document.querySelector('.lives span')
    console.log(elLife)
    elLife.textContent = gGame.LIVES
    if (gGame.LIVES === 0) gameOver()


}

function onFlagClick(idx, jdx) {

    var cell = gBoard[idx][jdx]
    console.log(cell)
    console.log(idx)
    console.log(jdx)
    if (cell.isMarked) {
        gGame.markedCount--
        cell.isMarked = false
    }
    else {
        cell.isMarked = true
        gGame.markedCount++

    }
    console.log(cell)
    console.log(gGame)
    console.table(gBoard)
    updateMark()
    renderBoard(gBoard)
    checkGameOver()

}

function updateShown() {
    var elShown = document.querySelector('.shows span')
    elShown.textContent = gGame.shownCount

}
function updateMark() {
    var elMark = document.querySelector('.mark span')
    elMark.textContent = gGame.markedCount

}






