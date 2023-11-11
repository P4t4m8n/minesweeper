'use strict'

const MINE = '\u{1F4A3}'
const FLAG = '\u{26F3}'
const HIDDEN_CELL = '🟫'
const LIFES = ['❤️', '❤️❤️', '❤️❤️❤️']

const gRstBtnMods = {
    start: '🙂',
    inGame: '🤔',
    lost: '😞',
    Win: ' \u{1F63C}'
}

const gNumClassName = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
var gMoves = [] //arr to store last moves for undo btn
var gMegaHints = [] // store loction of i and j for mega hint


var gScoreBoard = [{ name: 'John James Rambo', score: '40:00' },
{ name: 'Gruff Snake Plissken', score: '45:00' }, { name: 'UmpaLumpa', score: '50:00' }] // to fill score board

var gLevel = { //store board size and num of mines
    SIZE: 4,
    MINES: 2
}
var gGame = { //store current game information
    isOn: false,
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

var gBoard // game board
var gStartTime // start game time
var gInterval // interval for update time
var gTime // hold time for the leaderboard and win condition check
// var gElHints // NEED TO FIND USE
var gShownHintIdxs = [] //  store shown cells the prevent hiding them after hint close
var gManualIdx //use for manual mine placement

var gGameInfoSpans = document.querySelectorAll('.game-info span')//hold game informtion html

function onInit() {
    buildBoard()
    renderBoard(gBoard)
    updateScoreBoard('30:00', false)
    renderScoreBoard()

    gManualIdx = gLevel.MINES
}

function pickLevel(level) { // set board size and mines, restart game

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

function startGame() { // start game update life start timer set mines render board

    updateLife()

    gGame.isOn = true

    startTimer()
    changeRestartBtnImg('inGame')
    if (gManualIdx === gLevel.MINES) placeMines()//check if manual mine placment
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    storeMoves(gMoves)

}

function buildBoard() { // create board bad on gLevel

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

function getRndMineFreeCell() { //returns an object with a free cell location for mine placement
    var idx = getRandomInt(0, gBoard.length - 1)
    var jdx = getRandomInt(0, gBoard.length - 1)

    while (gBoard[idx][jdx].isMine ||
        gBoard[idx][jdx].isShown) {
        idx = getRandomInt(0, gBoard.length - 1)
        jdx = getRandomInt(0, gBoard.length - 1)
    }

    return { i: idx, j: jdx }
}

function setMinesNegsCount(board) { //count number of mines around each board cell
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine || board[i][j].isShown) continue
            board[i][j].minesAroundCount = countNeighbors(i, j, board)
        }
    }
}

function renderBoard(board) {// render board and assign class for css style
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[i].length; j++) {
            const cell = board[i][j]

            var className = ''
            var innerImg = ''

            if (cell.isMarked) {
                className = 'flag'
                innerImg = FLAG
            }

            else if (cell.isShown) {
                if (cell.isMine) {
                    innerImg = MINE
                    className = 'mine'
                }
                else {
                    innerImg = cell.minesAroundCount
                    className = gNumClassName[innerImg] + ' numbers'
                }
            }
            else {
                innerImg = ''
                className = 'coverd'
            }

            strHTML += `\t<td data-i="${i}" data-j="${j}"
                class="cell ${className} 
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
    const placeStr = ['1: ', '2: ', "3: "]

    for (var i = 0; i < gScoreBoard.length; i++) {
        var tempName = localStorage.getItem(i.toString())
        var tempStr = placeStr[i]
        strHTML += `<td class="cell ${'leader-board-cell'}">${tempStr + tempName}</td>`

    }
    strHTML += `</tr>\n`
    const elCells = document.querySelector('.leader-board-cells')
    elCells.innerHTML = strHTML
}

function onCellClicked(rowIdx, colIdx) {//on left click

    var cell = gBoard[rowIdx][colIdx]

    if (gGame.isManualMines) {
        if (cell.isMine) return
        cell.isMine = true
        onManualMines()
        return
    }

    if (gGame.isHint) {
        if (!gGame.isOn) startGame()
        closeHint(rowIdx, colIdx)
        return
    }

    if (gGame.isMegaHint) {
        closeMegaHint(rowIdx, colIdx)
        return
    }

    if (cell.isShown) return
    if (cell.isMarked) return

    storeMoves(gMoves)

    if (cell.isMine) {
        alert('BOOM')
        updateLife()
        checkGameOver()
        return
    }

    if (!gGame.isOn) {
        cell.isShown = true
        gGame.shownCount++
        startGame()
    }


    if (cell.minesAroundCount > 0) {
        cell.isShown = true
        gGame.shownCount++
    }


    else expandShown(gBoard, rowIdx, colIdx)

    renderBoard(gBoard)
    updateShown()
    checkGameOver()
}

function onFlagClick(idx, jdx) {//right click
    var cell = gBoard[idx][jdx]

    if (gGame.isSafe) { //active if safe click is on, func call from btn
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

function checkGameOver() {

    if (gGame.markedCount === 2 && gGame.shownCount === 14)
        gameOver(true)
    else if (gGame.LIVES < 0) gameOver(false)

    return

}

function gameOver(isWin) {//finish game in case of win or loss all life
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
    revealAll()
    renderBoard(gBoard)

    gGame.isOn = false
    
    return
}

function restartBtn() {//restart from btn or inside func restart the game to start a new one
    gGame.isOn = false

    stopTimer()
    gTime = '00:00'
    document.querySelector('.timer').innerText = gTime

    var megaHitsBtn = document.getElementById("Mega")
    megaHitsBtn.style.visibility = 'visible'
    var megaHitsBtn = document.getElementById("ex")
    megaHitsBtn.style.visibility = 'visible'

    gManualIdx = gLevel.MINES
    gMegaHints = []

    updateLife()
    restartHint()
    updateMark()
    updateShown()
    buildBoard()
    renderBoard(gBoard)
    changeRestartBtnImg()
    resetSafe()
}

function changeRestartBtnImg(status) {//restart btn img
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

    if (!gGame.isOn) gGame.LIVES = 2

    gGameInfoSpans[2].textContent = LIFES[gGame.LIVES]
}

function updateShown() {
    if (!gGame.isOn) gGame.shownCount = 0
    gGameInfoSpans[1].textContent = gGame.shownCount

}

function updateMark() {
    if (!gGame.isOn) gGame.markedCount = 0
    gGameInfoSpans[1].textContent = gGame.markedCount

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
        var temp = gScoreBoard[j].name + gScoreBoard[j].score
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
    if (moves < 1) {

    }

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

function hintCellshown(idxS, jdxS, show, idxE = idxS + 1, jdxE = jdxS + 1) {
    for (var i = (gGame.isMegaHint) ? idxS : idxS - 1; i <= idxE; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = (gGame.isMegaHint) ? jdxS : jdxS - 1; j <= jdxE; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
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

function expandShown(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            var cell = board[i][j]

            if (cell.isShown) continue
            if (cell.isMine || cell.isMarked || cell.isShown) continue

            board[i][j].isShown = true
            gGame.shownCount++
            if (cell.minesAroundCount === 0) expandShown(board, i, j)



        }
    }

}

function restartHint() {
    const elHintsBtns = document.querySelectorAll('.highlight')
    for (var i = 0; i < elHintsBtns.length; i++) {
        elHintsBtns[i].style.visibility = 'visible'
        elHintsBtns[i].classList.remove('highlight')
    }
    gMoves = []
}
function getMegaHint(elBtn) {
    gGame.isMegaHint = true
    if (!gGame.isOn) startGame()
    elBtn.style.visibility = 'hidden'

}

function closeMegaHint(rowIdx, colIdx) {

    gMegaHints.push({ i: rowIdx, j: colIdx })
    if (gMegaHints.length < 2) return

    var startIdx = gMegaHints[0].i
    var startJdx = gMegaHints[0].j
    var endIdx = gMegaHints[1].i
    var endJdx = gMegaHints[1].j

    hintCellshown(startIdx, startJdx, true, endIdx, endJdx)

    setTimeout(hintCellshown, 1000, startIdx, startJdx, false, endIdx, endJdx)
    setTimeout(function () { gGame.isMegaHint = false }, 2000)

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











