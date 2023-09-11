class CellMatrix {

    left = undefined;
    right = undefined;
    up = undefined;
    down = undefined;

    title = '';
    data = undefined;
    fields = undefined;
    attr = undefined;

    constructor(left = undefined, right = undefined, up = undefined, down = undefined) {
        this.inputTo(left, right, up, down)
    }

    inputTo(left = undefined, right = undefined, up = undefined, down = undefined) {
        this.left = left;
        this.right = right;
        this.up = up;
        this.down = down;
    }

    setData(data, fields, attr) {
        this.data = data;
        this.fields = fields;
        this.attr = attr;
        if (typeof data !== 'object' && typeof data !== 'function') this.title = data
    }

    getData() {
        let title = this.title;
        if (typeof this.data === 'function') {
            title = this.data(this.fields, this.attr)
        }
        return title;
    };
}

class Matrix {

    constructor(maxColumns, maxRows) {
        this.maxColumns = maxColumns;
        this.maxRows = maxRows;

        this.firstField = null;
        this.fields = {}

        for (let r = 0; r<this.maxRows; r++) {
            for (let c = 0; c<this.maxColumns; c++) {
                this.fields[`${r}_${c}`] = new CellMatrix();
            }
        }

        for (let c = 0; c<this.maxColumns; c++) {
            for (let r = 0; r<this.maxRows; r++) {
                this.fields[`${r}_${c}`].inputTo(
                    c>0 ? this.fields[`${r}_${c-1}`] : null,
                    c<this.maxColumns-1 ? this.fields[`${r}_${c+1}`] : null,
                    r>0 ? this.fields[`${r-1}_${c}`] : null,
                    r<this.maxRows-1 ? this.fields[`${r+1}_${c}`] : null
                )
            }
        }

        this.firstField = this.fields[`0_0`];
    }

    buildNewFields() {
        const newFields = {};

        let cursor = this.firstField;
        let row = 0;
        let notEndRows = true;
        while (notEndRows) {
            let notEndCols = true;
            let col = 0;
            let rowCursor = cursor;
            while (notEndCols) {
                newFields[`${row}_${col}`] = cursor;
                if (cursor.right === null) {
                    notEndCols = false;
                } else {
                    col++
                    cursor = cursor.right;
                }
            }
            if (cursor.down === null) {
                notEndRows = false;
            } else {
                row++;
                cursor = rowCursor.down;
            }
        }

        this.fields = newFields;
    }
    // toString
    // valueOf


    includeMatrixRowDown(row, col, data) {
        const maxColumns = this.maxColumns;
        const newColumns = data.maxColumns + col;

        //Если находятся за пределами текущей матрицы, то дополним её пустыми строками
        if (row>this.maxRows) while (row !== this.maxRows) this.newRow(this.maxRows);
        if (col>this.maxColumns) while (col !== this.maxColumns) this.newCol(this.maxColumns);

        for (let i=0; i<data.maxRows; i++) this.newRow(row);

        if (this.maxColumns < newColumns)
            for (let i=0; i<(newColumns-maxColumns); i++)
                this.newCol(this.maxColumns);

        for (let r=0; r<data.maxRows; r++)
            for (let c=0; c<data.maxColumns; c++)
                this.setData(r+row, c+col, data.fields[`${r}_${c}`].data);
    }

    includeMatrixReplace(row, col, data) {
        const maxColumns = this.maxColumns;
        const newColumns = data.maxColumns + col;

        //Если находятся за пределами текущей матрицы, то дополним её пустыми строками
        if (row>this.maxRows) while (row !== this.maxRows) this.newRow(this.maxRows);
        if (col>this.maxColumns) while (col !== this.maxColumns) this.newCol(this.maxColumns);

        for (let i=0; i<data.maxRows; i++) this.newRow(row);

        if (this.maxColumns < newColumns)
            for (let i=0; i<(newColumns-maxColumns); i++)
                this.newCol(this.maxColumns);

        for (let r=0; r<data.maxRows; r++)
            for (let c=0; c<data.maxColumns; c++)
                this.setData(r+row, c+col, data.fields[`${r}_${c}`].data);
    }

    newCol(colS= 0) {
        let prevCell = null;
        for (let row=0; row<this.maxRows; row++) {
            const cell = this.fields[`${row}_${colS}`] ?? null;

            // [0,0]
            const newCell = new CellMatrix(cell ? cell.left : this.fields[`${row}_${this.maxColumns-1}`], cell,prevCell, null)//(prevCell, , null, cell);

            if (colS === 0 && row === 0) this.firstField = newCell;
            if (prevCell) prevCell.down = newCell;
            if (cell && cell.left) cell.left.right = newCell;
            if (!cell) this.fields[`${row}_${this.maxColumns-1}`].right = newCell;
            prevCell = newCell;
        }
        this.maxColumns++;
        this.buildNewFields();
    }

    newRow(rowS= 0) {
        let prevCell = null;
        for (let col=0; col<this.maxColumns; col++) {
            let cell = this.fields[`${rowS}_${col}`] ?? null;
            const newCell = new CellMatrix(prevCell, null, cell ? cell.up : this.fields[`${this.maxRows-1}_${col}`], cell);
            if (rowS === 0 && col === 0) this.firstField = newCell;
            if (prevCell) prevCell.right = newCell;
            if (cell && cell.up) cell.up.down = newCell;
            if (!cell) this.fields[`${this.maxRows-1}_${col}`].down = newCell;
            prevCell = newCell;
        }
        this.maxRows++;
        this.buildNewFields();
    }

    delRow(rowS = this.maxRows-1) {
        for (let col=0; col<this.maxColumns; col++) {
            let cell = this.fields[`${rowS}_${col}`] ?? null;
            if (cell) {
                cell.up.down = cell.down;
                cell.down.up = cell.up;
            }
        }
        this.maxRows--;
        this.buildNewFields();
    }

    setData(row, col, data, options = {}) {
        if (data.constructor && data.constructor.name === "Matrix") {
            //Вставка таблицы в таблицу
            if (options.rowExpand)
                this.includeMatrixRowDown(row, col, data)
            else
                this.includeMatrixReplace(row, col, data)
        } else {
            this.fields[`${row}_${col}`].setData(data);
        }
    }

    getObject(rowS = 0,colS =0 , rowE = this.maxRows-1, colE = this.maxColumns-1) {
        const row = rowE - rowS;
        const col = colE - colS;

        let data = new Array(row);
        const sheet = {
            data: data
        };

        for (let r = rowS; r<rowE+1; r++) {
            sheet.data[r] = new Array(col);
            for (let c = colS; c<colE+1; c++) {
                const cell = this.fields[`${r}_${c}`];
                sheet.data[r][c] = cell.getData();
            }
        }

        return sheet;
    }
}




const matrix = new Matrix(5,3);
for (let c = 0; c<5; c++) {
    for (let r = 0; r<3; r++) {
        matrix.setData(r, c, `${r}_${c}`);
    }
}
console.log(matrix.getObject());


const inner_matrix = new Matrix(3,5);
for (let c = 0; c<3; c++) {
    for (let r = 0; r<5; r++) {
        inner_matrix.setData(r,c, `i ${r}_${c}`);
    }
}
console.log(inner_matrix.getObject());

// matrix.buildNewFields();

// matrix.setData(2,2 , inner_matrix, {rowExpand: true});
matrix.delRow(1);
console.log(matrix.getObject());

// matrix.newRow(2);
// matrix.newCol(2);
// console.log(matrix.getObject());
