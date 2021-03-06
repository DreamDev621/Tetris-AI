"use strict";

const COLOR = {
    grey: () => fill(127, 127, 127),
    cyan: () => fill(0, 255, 255),
    yellow: () => fill(255, 255, 0),
    purple: () => fill(128, 0, 128),
    green: () => fill(0, 255, 0),
    red: () => fill(255, 0, 0),
    blue: () => fill(0, 0, 255),
    orange: () => fill(255, 127, 0),
    black: () => fill(0, 0, 0),
    white: () => fill(255, 255, 255),
};

// representation of the game grid
class Grid {
    constructor(width, height, cellSize) {
        // mathematical representation of the grid

        // width in cells
        this.width = width;

        // height in cells
        this.height = height;

        // size of cells in pixels
        this.cellSize = cellSize;

        // dimensions of the grid in pixels
        this.pixel = {
            height: this.height * this.cellSize,
            width: this.width * this.cellSize,
        };

        // array as graphical representation of the grid
        this.cells = [];
        this.init();
    }

    // initialize the cells
    init() {
        // create a new array for each row of the grid
        for (let row = 0; row < this.height; row++) {
            this.cells[row] = [];
            // and fill each row with cells
            for (let col = 0; col < this.width; col++) {
                this.cells[row][col] = new Cell(col, row, this.cellSize);
            }
        }
    }

    // reset grid to default (remove all pieces)
    reset() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++)
                this.cells[row][col].reset();
        }
    }

    // draw entirety of the grid - CALLED IN GAME LOOP
    draw() {
        this.drawCells();
        this.drawOutline();
    }

    // draw all cells of the grid
    drawCells() {
        // set outline thickness for cells
        strokeWeight(1);

        // call draw() for each cell in each row
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                this.cells[row][col].draw();
            }
        }
    }

    // draw the grids border/outline
    drawOutline() {
        strokeWeight(8);

        stroke(0);
        // left border
        line(0, 0, 0, this.pixel.height);
        // upper border
        line(0, 0, this.pixel.width, 0);
        // right border
        line(this.pixel.width, 0, this.pixel.width, this.pixel.height);
        // bottom border
        line(0, this.pixel.height, this.pixel.width, this.pixel.height);
    }

    // insert a piece into the grid, so that it's drawn
    insertPiece(piece) {
        // iterate through the piece's cells
        for (let row = 0; row < piece.size; row++) {
            for (let col = 0; col < piece.size; col++) {
                // if the cell is occupied, draw it
                if (piece.representation[row][col]) {
                    // activate the state of the cell
                    this.cells[piece.y + row][piece.x + col].fill(piece.color);
                }
            }
        }
    }

    // stop a piece from being drawn into the grid
    clearPiece(piece) {
        for (let row = 0; row < piece.size; row++) {
            for (let col = 0; col < piece.size; col++) {
                if (piece.representation[row][col]) {
                    this.cells[piece.y + row][piece.x + col].reset();
                }
            }
        }
    }

    // check for full lines and clear them
    clearFullLines() {
        // keep track of how many lines are cleared to update score
        let lines = 0;

        // for every line in the grid
        for (let row = this.height - 1; row >= 0; row--) {
            // check if it's full
            if (this.isLineFull(row)) {
                // if yes, clear it
                this.clearLine(row);

                // and increase the number of lines cleared
                lines++;
                updateLines();

                // because every line is shifted down one row
                // we have to check the same line again
                row++;
            }
        }

        // update score
        updateScore(lines);

        // update level if necessary in Tetris NES style
        if (GAME.linescleared >= (GAME.level + 1) * 10) {
            updateLevel();
        }
    }

    // check if a row is full
    isLineFull(row) {
        for (let col = 0; col < this.width; col++) {
            if (!this.cells[row][col].active) {
                return false;
            }
        }
        return true;
    }

    // remove a line from the grid
    clearLine(n) {
        // change the state of the cells in the line to inactive
        // shift all cells above the line down one row
        for (let row = n; row > 0; row--) {
            for (let col = 0; col < this.width; col++) {
                let cellabove = this.cells[row - 1][col];
                this.cells[row][col].active = cellabove.active;
                this.cells[row][col].color = cellabove.color;
            }
        }
        // reset the first row
        for (let col = 0; col < this.width; col++) {
            this.cells[0][col].reset();
        }
    }

    // check if a piece is in a valid position
    isValid(piece) {
        for (let row = 0; row < piece.size; row++) {
            for (let col = 0; col < piece.size; col++) {
                if (piece.representation[row][col] != 0) {
                    let gridRow = piece.y + row;
                    let gridCol = piece.x + col;

                    // check if piece is inside the grid
                    if (
                        gridRow < 0 ||
                        gridRow >= this.height ||
                        gridCol < 0 ||
                        gridCol >= this.width
                    ) {
                        return false;
                    }

                    // check if piece overlaps with another piece
                    if (this.cells[gridRow][gridCol].active) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

// representation of the singles cells in the grid
class Cell {
    constructor(x, y, size) {
        this.color = COLOR.white;
        this.active = false;
        this.size = size;
        this.offset = new Vector(x * this.size, y * this.size);
    }

    // fill cell with a color
    fill(color) {
        this.active = true;
        this.color = color;
    }

    // reset cell to empty
    reset() {
        this.color = COLOR.white;
        this.active = false;
    }

    draw() {
        // set fill color to color of current cell
        this.color();

        // set stroke color to black
        stroke(200);

        strokeWeight(1);

        // draw cell
        square(this.offset.x, this.offset.y, CELL_SIZE);
    }
}
