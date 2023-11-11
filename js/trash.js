//from render board
// else if (cell.isShown) {
//     if (cell.isMine) {
//         className = 'mine'
//         innerImg = MINE
//     }
//     else {
//         className = gNumClassName[innerImg]
//         innerImg = cell.minesAroundCount
//     }
// }


function expandShown(idxS, jdxS, show = true, idxE = idxS + 1, jdxE = jdxS + 1, mode = 'click') {
    debugger

    for (var i = idxS - 1; i <= idxE; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = jdxS - 1; j <= jdxE; j++) {
            var tempCell = gBoard[i][j]
            if (j < 0 || j >= gBoard[i].length) continue
            if (mode !== 'click') {
                expanedHints(i, j, show, tempCell)
                continue
            }
            expandeClick(i, j, tempCell)
        }
        gBoard[i][j].isShown = show
        renderBoard(gBoard)
    }
}

function expanedHints(idx, jdx, show, boardCell) {
    if (boardCell.isShown) {
        if (gShownHintIdxs.length > 0) {
            if (gShownHintIdxs[0].i === idx && gShownHintIdxs[0].j === jdx) {
                gShownHintIdxs.splice(0, 1)
                return
            }
        }
        var cell = {
            i,
            j
        }
        gShownHintIdxs.push(cell)
    }
    gBoard[idx][jdx].isShown = show
}



function expandeClick(rowIdx, colIdx, cell) {

    if (cell.isMine || cell.isMarked || cell.isShown) return

    // gBoard[rowIdx][j].isShown = true
    gGame.shownCount++
    if (cell.minesAroundCount === 0) expandShown(rowIdx, colIdx)



}