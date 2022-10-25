class ListItem {
    constructor(index, prevIndex, value) {
        this.index = index;
        this.prevIndex = prevIndex;
        this.value = value;
        this.nextIndexes = [];
    }
    getPrev() {
        return this.prevIndex;
    }
    getValue() {
        return this.value;
    }
    getIndex() {
        return this.index;
    }
    addNextIndex(index) {
        this.nextIndexes.push(index);
    }
}
class BranchingList {
    constructor() {
        this.items = [];
    }
    getItem(index) {
        return this.items[index];
    }
    addItem(value, addedToIndex = -1) {
        let item = new ListItem(this.items.length > 0 ? this.items.length : 0, addedToIndex, value);
        this.items.push(item);
        return this.items.length - 1;
    }
    getLength() {
        return this.items.length - 1;
    }
    getListFromLast() {
        let item = this.items[this.items.length - 1];
        let i = item.getIndex();
        let items = [];
        while (i != 0) {
            items.push(item.getValue());
            i = item.getIndex();
            item = this.getItem(item.getPrev());
        }
        return items;
    }
    getListFromIndex(index) {
        let item = this.getItem(index);
        let i = item.getIndex();
        let items = [];
        while (i != 0) {
            items.push(item.getValue());
            i = item.getIndex();
            item = this.getItem(item.getPrev());
        }
        return items;
    }
    findIndexByValue(value) {
        for (let item of this.items) {
            if (item.getValue()[0] == value[0] && item.getValue()[1] == value[1]) {
                return item.getIndex();
            }
        }
        return -1;
    }
}
class MazeSolver {
    constructor(mazeStr) {
        this.mazeMap = [];
        this.branchingList = new BranchingList();
        this.mazeStr = mazeStr;
        //this.displayMapString();
        this.mazeStringToArray();
        this.branchingList.addItem([this.mazeStartRow, this.mazeStartCol]);
        let result = this.expand([0]);
        this.displayMapTable();
        console.log(result);
    }
    displayMapString() {
        document.getElementById('MazeDiv').innerText = this.mazeStr;
    }
    displayMapTable() {
        let table = document.getElementById('MazeTable');
        table.innerHTML = "";
        let ri = 0;
        let ci = 0;
        for (let row of this.mazeMap) {
            let tr = document.createElement('tr');
            for (let col of row) {
                let td = document.createElement('td');
                td.innerText = col == -1 ? '#' : col.toString();
                td.setAttribute('data-position', ri.toString() + ',' + ci.toString());
                if (col == -1 || col == -3)
                    td.setAttribute('class', 'solid');
                tr.append(td);
                ci++;
            }
            table.append(tr);
            ci = 0;
            ri++;
        }
    }
    mazeStringToArray() {
        let row = [];
        let ri = 0;
        let ci = 0;
        for (let i = 0; i < this.mazeStr.length; i++) {
            let cn = this.charToNumber(this.mazeStr[i]);
            if (cn == -10) {
                this.mazeMap.push(row);
                row = [];
                ri++;
                ci = 0;
                continue;
            }
            else if (cn == -2) {
                this.mazeStartRow = ri;
                this.mazeStartCol = ci;
            }
            row.push(cn);
            ci++;
        }
    }
    /**
     *
     * @param branches starting points for new braches
     * @param currentStepCount
     * @param maxIterations
     * @param currentIteration
     * @returns number of steps to solve a maze, -1 if solution not found or if max iterations limit is exceeded
     * @description recursively expands path search adjacent to position brances[number, number][] until solution is found or iteration limit is exceeded
     */
    expand(branches, currentStepCount = 0, maxIterations = 1000, currentIteration = 0) {
        let newBranches = [];
        let exitFound = false;
        currentStepCount++;
        for (let i of branches) {
            let position = this.branchingList.getItem(i).getValue();
            /** up */
            if (position[0] - 1 >= 0 && [0, -3].includes(this.mazeMap[position[0] - 1][position[1]])) {
                newBranches.push(this.branchingList.addItem([position[0] - 1, position[1]], i));
                if (this.mazeMap[position[0] - 1][position[1]] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0] - 1][position[1]] = currentStepCount;
            }
            /** down */
            if (this.mazeMap[position[0] + 1] !== undefined && [0, -3].includes(this.mazeMap[position[0] + 1][position[1]])) {
                newBranches.push(this.branchingList.addItem([position[0] + 1, position[1]], i));
                if (this.mazeMap[position[0] + 1][position[1]] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0] + 1][position[1]] = currentStepCount;
            }
            /** left */
            if (position[1] - 1 >= 0 && [0, -3].includes(this.mazeMap[position[0]][position[1] - 1])) {
                newBranches.push(this.branchingList.addItem([position[0], position[1] - 1], i));
                if (this.mazeMap[position[0]][position[1] - 1] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0]][position[1] - 1] = currentStepCount;
            }
            /** right */
            if (position[1] < this.mazeMap[position[0]].length && [0, -3].includes(this.mazeMap[position[0]][position[1] + 1])) {
                newBranches.push(this.branchingList.addItem([position[0], position[1] + 1], i));
                if (this.mazeMap[position[0]][position[1] + 1] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0]][position[1] + 1] = currentStepCount;
            }
        }
        if (currentIteration < maxIterations && !exitFound) {
            currentIteration++;
            return this.expand(newBranches, currentStepCount, maxIterations, currentIteration);
        }
        else if (exitFound)
            return currentStepCount;
        else
            return -1;
    }
    /**
     *
     * @param char char of a maze input string
     * @returns corresponding number
     * @description Takes maze string and returns corresponding number
     * - 0: empty space (' ')
     * - -1: wall (#)
     * - -2: start (^)
     * - -3: end (E)
     * - -10: row change (\n)
     */
    charToNumber(char) {
        let cn = -1;
        switch (char) {
            case '#': {
                cn = -1;
                break;
            }
            case '^': {
                cn = -2;
                break;
            }
            case 'E': {
                cn = -3;
                break;
            }
            case '\n': {
                cn = -10;
                break;
            }
            default: {
                cn = 0;
                break;
            }
        }
        return cn;
    }
}
let maze;
const finput = document.getElementById('FileInput');
finput === null || finput === void 0 ? void 0 : finput.addEventListener('change', (event) => {
    let fr = new FileReader();
    let mz;
    fr.addEventListener("load", (event) => {
        mz = fr.result;
        maze = new MazeSolver(mz);
    }, false);
    fr.readAsText(finput.files[0]);
});
let table = document.getElementById('MazeTable');
table.addEventListener('mouseover', (event) => {
    const cell = event.target;
    const row = cell.parentElement;
    let pos = cell.getAttribute("data-position").split(",");
    let position = [+pos[0], +pos[1]];
    let index = maze.branchingList.findIndexByValue(position);
    let list = maze.branchingList.getListFromIndex(index);
    let cells = document.querySelectorAll('td:not(.solid)');
    cells.forEach((element) => {
        element.style.backgroundColor = "";
    });
    for (let val of list) {
        let td = document.querySelector('tr:nth-of-type(' + (val[0] + 1) + ') > td:nth-of-type(' + (val[1] + 1) + ')');
        td.style.backgroundColor = 'green';
    }
});
