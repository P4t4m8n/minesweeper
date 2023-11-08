'use strict'

// neighbor loop
function countNeighbors(rowIdx, colIdx, mat) {
    var mineCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine) mineCount++
        }
    }
    return mineCount
}

//bubble sort

function sortNums1(nums) {
    var arrSize = nums.length

    for (var i = 0; i < arrSize - 1; i++) {
        for (var j = 0; j < arrSize - i - 1; j++) {
            if (nums[j] > nums[j + 1]) {
                var temp = nums[j]
                nums[j] = nums[j + 1]
                nums[j + 1] = temp
            }
        }
    }

    return nums
}

//random number gen

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}


