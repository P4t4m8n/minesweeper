'use strict'

const MINE = '\u{1F4A3}'
const FLAG = '\u{26F3}'
const HIDDEN_CELL = '🟫'

const gRstBtnMods = {
    start: '🙂',
    inGame: '🤔',
    lost: '😞',
    Win: ' \u{1F63C}'
}

const gNumClassName = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
var gMoves = []
var gMegaHints = []


var gScoreBoard = [{ name: 'John James Rambo', score: '40:00' },
{ name: 'Gruff Snake Plissken', score: '45:00' }, { name: 'UmpaLumpa', score: '50:00' }]

var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,1
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    LIVES: 0,
    isHint: false,
    safePick: 3,
    isSafe: false,
    isMegaHint: false,
    isManualMines: false,
}

var gBoard
var gStartTime
var gInterval
var gTime
var gElHints
var gShownHintIdxs
var gManualIdx

var gGameInfoSpans = document.querySelectorAll('.game-info span')

function onInit() {
    buildBoard()
    renderBoard(gBoard)
    updateScoreBoard('30:00', false)
    renderScoreBoard()
    gManualIdx = gLevel.MINES


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
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break

    }

    restartBtn()
}

function startGame() {
    updateLife()
    gGame.isOn = true

    startTimer()

    changeRestartBtnImg('inGame')
    if (gManualIdx === gLevel.MINES) placeMines()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function buildBoard() {

    gBoard = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
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
        var cell = getRndMineFreeCell()
        gBoard[cell.i][cell.j].isMine = true
    }

}

function getRndMineFreeCell() {
    var idx = getRandomInt(0, gBoard.length - 1)
    var jdx = getRandomInt(0, gBoard.length - 1)

    while (gBoard[idx][jdx].isMine ||
        gBoard[idx][jdx].isShown) {
        idx = getRandomInt(0, gBoard.length - 1)
        jdx = getRandomInt(0, gBoard.length - 1)
    }

    return { i: idx, j: jdx }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine || board[i][j].isShown) continue
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
                    innerImg = 'MINE'
                    className = 'mine'
                }
                else {
                    innerImg = cell.minesAroundCount
                    className = gNumClassName[innerImg]
                }
            }
            else {
                innerImg = HIDDEN_CELL
                className = gNumClassName[0]
            }


            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell ${className} numbers
            " onclick="onCellClicked(${i}, ${j})"
            oncontextmenu="onFlagClick(${i}, ${j})" >
            ${innerImg}</td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCells = document.querySelector('.mine-field-cells')
    elCells.innerHTML = strHTML
}

function renderScoreBoard() {

    var strHTML = `<tr>\n`

    for (var i = 0; i < gScoreBoard.length; i++) {
        strHTML += `<td>\n`
        var idxStr = i.toString()
        var tempName = localStorage.getItem(idxStr = i.toString())

        strHTML += `<td class="cell ${'leader-board-cell'}">${tempName}</td>`

    }
    strHTML += `</tr>\n`
    const elCells = document.querySelector('.leader-board-cells')
    elCells.innerHTML = strHTML
}

function onCellClicked(rowIdx, colIdx) {

    var cell = gBoard[rowIdx][colIdx]
    if (gGame.isManualMines) {
        if (cell.isMine) return
        cell.isMine = true
        onManualMines()
        return
    }

    if (gGame.isHint) {
        startGame()
        closeHint(rowIdx, colIdx)
        return
    }

    if (gGame.isMegaHint) {
        closeMegaHint(rowIdx, colIdx)
        return
    }



    if (cell.isShown) return
    if (cell.isMarked) return


    if (cell.isMine) {
        alert('BOOM')
        storeMoves(gMoves)
        updateLife()
        checkGameOver()
        return
    }

    if (!gGame.isOn) {
        startGame()
    }
    storeMoves(gMoves)

    if (cell.minesAroundCount > 0) {
        cell.isShown = true
        gGame.shownCount++
    }
    else expandShown(gBoard, rowIdx, colIdx)
    renderBoard(gBoard)
    updateShown()
    checkGameOver()
}

function onFlagClick(idx, jdx) {
    debugger
    var cell = gBoard[idx][jdx]

    if (gGame.isSafe) {
        cell.isMarked = true
        renderBoard(gBoard)
        setTimeout(closeSafeClick, 2000, idx, jdx)
        return
    }

    if (!gGame.isOn) return

    if (cell.isMarked) {
        gGame.markedCount--
        cell.isMarked = false
    }
    else {
        cell.isMarked = true
        gGame.markedCount++

    }
    updateMark()
    renderBoard(gBoard)
    checkGameOver()

}

function expandShown(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var cell = board[i][j]

            if (j < 0 || j >= board[i].length) continue
            if (cell.isShown) continue
            if (cell.isMine || cell.isMarked || cell.isShown) continue

            board[i][j].isShown = true
            gGame.shownCount++
            if (cell.minesAroundCount === 0) expandShown(board, i, j)



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
        updateScoreBoard(endTime, true)
        renderScoreBoard()
    }
    else {
        endStr = 'You Lost!!! you time: '
        changeRestartBtnImg('Lost')
    }
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

    var megaHitsBtn = document.getElementById("Mega")
    megaHitsBtn.style.visibility = 'visible'
    var megaHitsBtn = document.getElementById("ex")
    megaHitsBtn.style.visibility = 'visible'

    gManualIdx = gLevel.MINES
    updateLife()
    restartHint()
    updateMark()
    updateShown()
    buildBoard()
    renderBoard(gBoard)
    changeRestartBtnImg()
    resetSafe()
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

    if (!gGame.isOn) gGame.LIVES = 3
    gGameInfoSpans[0].textContent = gGame.LIVES
}

function updateShown() {
    if (!gGame.isOn) gGame.shownCount = 0
    gGameInfoSpans[1].textContent = gGame.shownCount

}

function updateMark() {
    if (!gGame.isOn) gGame.markedCount = 0
    gGameInfoSpans[2].textContent = gGame.markedCount

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
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++)
            gBoard[i][j].isShown = true
    }

}

function getHint(elBtn) {

    gGame.isHint = true
    gShownHintIdxs = []
    elBtn.classList.add('highlight')
}

function closeHint(idx, jdx) {
    if (gGame.isHint === true) gGame.isHint = false
    hintCellshown(idx, jdx, true)

    setTimeout(hintCellshown, 1000, idx, jdx, false)

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

function restartHint() {
    const elHintsBtns = document.querySelectorAll('.highlight')
    for (var i = 0; i < elHintsBtns.length; i++) {
        elHintsBtns[i].style.visibility = 'visible'
        elHintsBtns[i].classList.remove('highlight')
    }
    gMoves = []
}

function updateScoreBoard(endTime, isWin) {

    if (isWin === true) {
        var nameStr = prompt('Enter your name')

        for (var i = gScoreBoard.length - 1; i >= 0; i--) {
            if (parseInt(gScoreBoard[i].score) < parseInt(endTime)) break

            var tempCell = gScoreBoard[i]
            gScoreBoard[i] = { name: nameStr, score: endTime }
            if (i < 2) gScoreBoard[i + 1] = tempCell
        }
    }

    for (var j = 0; j < gScoreBoard.length; j++) {
        var temp = 'name: ' + gScoreBoard[j].name + '| score: ' + gScoreBoard[j].score
        var temp1 = j.toString()
        localStorage.setItem(temp1, temp);
    }
}

function onSafeClick() {
    if (gGame.safePick === 0) return
    gGame.safePick--
    gGame.isSafe = true

    if (!gGame.isOn) {
        startGame()
    }
    var loction = getRndMineFreeCell()
    onFlagClick(loction.i, loction.j)
    renderSafeClick()
}

function closeSafeClick(idx, jdx) {
    gGame.isSafe = false
    gBoard[idx][jdx].isMarked = false
    renderBoard(gBoard)
}

function resetSafe() {

    gGame.safePick = 3
    renderSafeClick()
}

function renderSafeClick() {
    var elBtn = document.querySelector('.safe-btn span')
    elBtn.textContent = gGame.safePick
}

function storeMoves(moves) {
    var newBoard = structuredClone(gBoard)
    // for (var i = 0; i < gBoard.length; i++)
    //     newBoard[i] = structuredClone(gBoard);

    var moveData = {
        board: newBoard,
        life: gGame.LIVES
    }
    moves.push(moveData)
}

function onUnDoClick() {
    if (gMoves < 1) return

    var cell = gMoves.pop()
    gBoard = cell.board
    gGame.LIVES = cell.life + 1

    updateLife()
    renderBoard(gBoard)
}

function clickDarkMod(elBtn) {


    var elBody = document.body
    elBody.classList.toggle("dark-mode")

    if (elBtn.innerText === 'Dark Mode') {
        elBtn.innerText = 'Light Mode'

    }
    else {
        elBtn.innerText = 'Dark Mode'

    }


}

function getMegaHint(elBtn) {

    gGame.isMegaHint = true
    if (!gGame.isOn) startGame()
    gShownHintIdxs = []
    elBtn.style.visibility = 'hidden'

}

function closeMegaHint(rowIdx, colIdx) {
    gMegaHints.push({ i: rowIdx, j: colIdx })
    console.log(gMegaHints)
    if (gMegaHints.length < 2) return

    showMegaHint(true)
    setTimeout(showMegaHint, 1000, false)
}

function showMegaHint(show) {
    for (var i = gMegaHints[0].i; i <= gMegaHints[1].i; i++) {
        for (var j = gMegaHints[0].j; j <= gMegaHints[1].j; j++) {
            var tempCell = gBoard[i][j]

            if (tempCell.isShown) {
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

function onManualMines() {
    if (gGame.isOn) return
    if (gManualIdx === 0) {
        gGame.isManualMines = false
        startGame()
        return
    }
    gGame.isManualMines = true
    gManualIdx--
}

function exterminator(elBtn) {
    if (!gGame.isOn) return

    elBtn.style.visibility = 'hidden'
    var mines = []

    for (var idx = 0; idx < gBoard.length; idx++) {
        for (var jdx = 0; jdx < gBoard[idx].length; jdx++)
            if (gBoard[idx][jdx].isMine) {
                mines.push({ i: idx, j: jdx })
            }
    }

    console.log(mines)
    debugger
    var top = 3
    if (gLevel.MINES === 2) top = 2
    for (var n = 0; n < top; n++) {

        var idx = getRandomInt(0, mines.length - 1 - n)
        var row = mines[idx].i
        var col = mines[idx].j

        gBoard[row][col].isMine = false
        mines.splice(idx, 1)
        gGame.markedCount++
        gGame.shownCount--
    }
    updateMark()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}











