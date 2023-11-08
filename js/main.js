'use strict'

const MINE = '\u{1F4A3}'
const FLAG = '\u{26F3}'

const gRstBtnMods = {
    start: '🙂',
    inGame: '🤔',
    lost: '😞',
    Win: ' \u{1F63C}'
}

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
    isHint: false,
}

var gBoard
var gStartTime
var gInterval
var gTime
var gElHints
var gShownHintIdxs

function onInit() {
    buildBoard()
    renderBoard(gBoard)
}

function pickLevel(level) {

    switch (level) {
        case 'Meduim':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            break
        case 'Expert':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            break
        default:
            gLevel.SIZE = 8
            gLevel.MINES = 14
            break

    }

    buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
}

function startGame() {
    updateLife()
    gGame.isOn = true
    startTimer()

    changeRestartBtnImg('inGame')
    placeMines()
    setMinesNegsCount(gBoard)

    renderBoard(gBoard)
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
        const recSafety = 145
        var cell = getRndMineFreeCell(recSafety)
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

    if (gGame.isHint) {
        closeHint(rowIdx, colIdx)
        return
    }

    var cell = gBoard[rowIdx][colIdx]


    if (cell.isShown) return
    if (cell.isMarked) return

    if (!gGame.isOn) {
        startGame()
    }


    if (cell.isMine) {
        alert('BOOM')
        updateLife()
        checkGameOver()
        return
    }
    expandShown(gBoard, rowIdx, colIdx, true, false)

    renderBoard(gBoard)
    updateShown()
    checkGameOver()
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

function expandShown(board, rowIdx, colIdx, show, all) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var tempCell = board[i][j]
            if (j < 0 || j >= board[i].length) continue
            if (tempCell.isShown) continue
            if (all === false) {
                if (tempCell.isMine || tempCell.isMarked || tempCell.isShown) continue
            }
            board[i][j].isShown = show
            if (show === true) gGame.shownCount++
            else gGame.shownCount--

        }
    }

}

function checkGameOver() {

    if (gGame.markedCount === 2 && gGame.shownCount === 14)
        gameOver(true)
    else if (gGame.LIVES === 0) gameOver(false)

    return

}

function gameOver(isWin) {
    var endStr = ''
    var endTime = gTime + ''

    if (isWin) {
        endStr = 'Winner!!! your time: '
        changeRestartBtnImg('win')
        storeScore(endTime)
        renderScoreBoard()
    }
    else {
        endStr = 'You Lost!!! you time: '
        changeRestartBtnImg('Lost')
    }
    console.log(endTime)
    endStr += endTime

    alert(endStr)

    stopTimer()
    revealAll(gBoard)
    gGame.isOn = false
    return
}

function restartBtn() {
    gGame.isOn = false

    stopTimer()
    gTime = '00:00'
    document.querySelector('.timer').innerText = gTime

    updateLife()
    updateMark()
    updateShown()
    buildBoard()
    renderBoard(gBoard)
    changeRestartBtnImg()
}

function changeRestartBtnImg(status) {
    var elBtn = document.querySelector('.restart')
    var img = ''

    switch (status) {
        case 'inGame':
            img = gRstBtnMods.inGame
            break
        case 'lost':
            img = gRstBtnMods.lost
            break
        case 'win':
            img = gRstBtnMods.Win
            break
        default:
            img = gRstBtnMods.start
            break
    }
    elBtn.innerText = img
}

function updateLife() {
    gGame.LIVES--

    if (!gGame.isOn) gGame.LIVES = gLevel.MINES

    var elLife = document.querySelector('.lives span')

    elLife.textContent = gGame.LIVES


}

function updateShown() {
    if (!gGame.isOn) gGame.shownCount = 0
    var elShown = document.querySelector('.shows span')
    elShown.textContent = gGame.shownCount

}

function updateMark() {
    if (!gGame.isOn) gGame.markedCount = 0
    var elMark = document.querySelector('.mark span')
    elMark.textContent = gGame.markedCount

}

function updateTimer() {
    const currentTime = new Date().getTime()
    const elapsedTime = (currentTime - gStartTime) / 1000
    gTime = elapsedTime.toFixed(2)
    document.querySelector('.timer').innerText = gTime
}

function startTimer() {
    gStartTime = new Date().getTime()
    gInterval = setInterval(updateTimer, 37)
}

function stopTimer() {
    clearInterval(gInterval)
}



function revealAll() {
    const hiddens = document.querySelectorAll('.hidden')

    for (var i = 0; i < hiddens.length; i++) {
        hiddens[i].classList.remove('hidden')
    }
}

function getHint(elBtn) {

    gGame.isHint = true

    elBtn.classList.add('highlight')
}

function closeHint(idx, jdx) {
    gGame.isHint = false
    gShownHintIdxs = []
    hintCellshown(idx, jdx, true)


    setTimeout(hintCellshown, 1, idx, jdx, false)


    var elHint = document.querySelector('.highlight')
    elHint.style.visibility = 'hidden'
}

function hintCellshown(idx, jdx, show) {


    for (var i = idx - 1; i <= idx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = jdx - 1; j <= jdx + 1; j++) {
            var tempCell = gBoard[i][j]
            if (j < 0 || j >= gBoard[i].length) continue
            if (tempCell.isShown) {

                console.log(gShownHintIdxs)
                if (gShownHintIdxs.length > 0) {

                    if (gShownHintIdxs[0].i === i && gShownHintIdxs[0].j === j) {

                        gShownHintIdxs.splice(0, 1)
                        continue
                    }
                }
                var cell = {
                    i,
                    j
                }

                gShownHintIdxs.push(cell)
            }
            gBoard[i][j].isShown = show
        }
    }
    renderBoard(gBoard)
}







