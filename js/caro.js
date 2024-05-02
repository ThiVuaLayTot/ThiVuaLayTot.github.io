function getBestMove(board, player) {
    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < 9; i++) {
        if (board[i].innerText === '') {
            board[i].innerText = 'X';
            let score = minimax(board, 0, false, -Infinity, Infinity, player === 'O' ? 'X' : 'O');
            board[i].innerText = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return [Math.floor(bestMove / 3), bestMove % 3];
}
function minimax(board, depth, isMaximizing, alpha, beta, player) {
    if (checkGameOver(board)) {
        return evaluateBoard(board, depth);
    }
    if (isMaximizing) {
        let maxScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i].innerText === '') {
                board[i].innerText = player;
                maxScore = Math.max(maxScore, minimax(board, depth + 1, false, alpha, beta, player === 'O' ? 'X' : 'O'));
                board[i].innerText = '';
                alpha = Math.max(alpha, maxScore);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i].innerText === '') {
                board[i].innerText = player;
                minScore = Math.min(minScore, minimax(board, depth + 1, true, alpha, beta, player === 'O' ? 'X' : 'O'));
                board[i].innerText = '';
                beta = Math.min(beta, minScore);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return minScore;
    }
}
function evaluateBoard(board, depth) {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a].innerText && board[a].innerText === board[b].innerText && board[a].innerText === board[c].innerText) {
            return board[a].innerText === 'X' ? 10 - depth : depth - 10;
        }
    }
    return 0;
}

const cells = document.getElementsByClassName('cell');
const resultDiv = document.getElementById('result');
let currentPlayer = 'O';
let gameOver = false;
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];
function makeMove(row, col) {
    if (cells[row * 3 + col].innerText === '' && !gameOver) {
        cells[row * 3 + col].innerText = currentPlayer;
        cells[row * 3 + col].classList.add(currentPlayer === 'O' ? 'player-cell' : 'opponent-cell');
        if (checkGameOver()) {
            gameOver = true;
            highlightWinningCells();
            displayResult();
        } else {
            currentPlayer = 'X';
            setTimeout(computerMove, 143); // Delay the computer move by 143 milliseconds
        }
    }
}
function computerMove() {
    if (gameOver) return;
    const bestMove = getBestMove(cells, currentPlayer);
    const [row, col] = bestMove;
    cells[row * 3 + col].innerText = 'X';
    cells[row * 3 + col].classList.add('opponent-cell');
    currentPlayer = 'O';
    if (checkGameOver()) {
        gameOver = true;
        highlightWinningCells();
        displayResult();
    }
}
function checkGameOver() {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (
            cells[a].innerText &&
            cells[a].innerText === cells[b].innerText &&
            cells[a].innerText === cells[c].innerText
        ) {
            return true;
        }
    }
    let isDraw = true;
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].innerText === '') {
            isDraw = false;
            break;
        }
    }
    return isDraw;
}
function highlightWinningCells() {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (
            cells[a].innerText &&
            cells[a].innerText === cells[b].innerText &&
            cells[a].innerText === cells[c].innerText
        ) {
            cells[a].classList.add('highlight');
            cells[b].classList.add('highlight');
            cells[c].classList.add('highlight');
        }
    }
}
function displayResult() {
    let winner = '';
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (
            cells[a].innerText &&
            cells[a].innerText === cells[b].innerText &&
            cells[a].innerText === cells[c].innerText
        ) {
            winner = cells[a].innerText;
            break;
        }
    }
    if (winner === 'O') {
        resultDiv.innerText = 'Bạn thắng!';
    } else if (winner === 'X') {
        resultDiv.innerText = 'Bạn thua!';
    } else {
        resultDiv.innerText = "Hòa!";
    }
}
function resetBoard() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].classList.remove('player-cell', 'opponent-cell', 'highlight');
    }
}
function resetGame() {
    resetBoard();
    resultDiv.innerText = '';
    currentPlayer = 'O';
    gameOver = false;
}
