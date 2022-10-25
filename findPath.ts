class ListItem {
    index: number;
    prevIndex: number;
    nextIndexes: number[];
    value: [number, number];

    constructor(index: number, prevIndex: number, value: [number, number]){
        this.index = index;
        this.prevIndex = prevIndex;
        this.value = value;
        this.nextIndexes = [];
    }

    getPrev(): number {
        return this.prevIndex;
    }

    getValue(): [number, number] {
        return this.value;
    }

    getIndex(): number {
        return this.index;
    }

    addNextIndex(index: number) {
        this.nextIndexes.push(index);
    }
}

class BranchingList {
    items: ListItem[];

    constructor(){
        this.items = [];
    }

    getItem(index: number): ListItem
    {
        return this.items[index];
    }

    addItem(value: [number, number], addedToIndex: number = -1): number {
        let item = new ListItem(this.items.length > 0 ? this.items.length : 0, addedToIndex, value);
        this.items.push(item);
        return this.items.length - 1;
    }

    getLength(): number {
       return  this.items.length - 1;
    }

    getListFromLast(): [number, number][]
    {
        let item = this.items[this.items.length - 1];
        let i = item.getIndex();
        let items: [number, number][] = [];
        while(i != 0)
        {
            items.push(item.getValue());
            i = item.getIndex();
            item = this.getItem(item.getPrev());
        }

        return items;
    }

    getListFromIndex(index: number): [number, number][]
    {
        let item = this.getItem(index);
        let i = item.getIndex();
        let items: [number, number][] = [];

        while(i != 0)
        {
            items.push(item.getValue());
            i = item.getIndex();
            item = this.getItem(item.getPrev());
        }

        return items;
    }

    findIndexByValue(value: [number, number]): number
    {
        for(let item of this.items)
        {
            if(item.getValue()[0] == value[0] && item.getValue()[1] == value[1] )
            {
                return item.getIndex();
            }
        }
        return -1;
    }

}

class MazeSolver {
    mazeStr: string;
    mazeMap: number[][] = [];
    mazeStartRow: number;
    mazeStartCol: number;
    branchingList: BranchingList

    constructor(mazeStr: string)
    {
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
        let ri: number = 0;
        let ci: number = 0;
        for(let row of this.mazeMap)
        {
            let tr = document.createElement('tr');
            for(let col of row)
            {
                let td = document.createElement('td');
                td.innerText = col == -1 ? '#' : col.toString();
                td.setAttribute('data-position', ri.toString() + ',' + ci.toString());
                if(col == -1 || col == -3)
                    td.setAttribute('class', 'solid');


                tr.append(td);
                ci++;
            }
            table.append(tr);
            ci = 0;
            ri++;
        }
    }

    mazeStringToArray()
    {   
        let row: number[] = [];
        let ri: number = 0;
        let ci: number = 0;
        for(let i = 0; i < this.mazeStr.length; i++)
        {
            let cn: number = this.charToNumber(this.mazeStr[i]);
            if(cn == -10)
            {
                this.mazeMap.push(row);
                row = [];
                ri++;
                ci = 0;    
                continue;
            } else if (cn == -2)
            {
                this.mazeStartRow = ri;
                this.mazeStartCol = ci;
            }
           
            row.push(cn);
            ci++;
        }
    }

    /**
     * 
     * @param branches 
     * @param currentStepCount 
     * @param maxIterations 
     * @param currentIteration 
     * @returns number of steps to solve a maze, -1 if solution not found or if max iterations limit is exceeded
     * @description recursively expands path search adjacent to position brances[number, number][] until solution is found or iteration limit is exceeded
     */
    expand(branches: number[], currentStepCount: number = 0, maxIterations: number = 1000, currentIteration: number = 0): number
    {
        let newBranches: number[] = [];
        let exitFound = false;
        
        currentStepCount++;
        for(let i of branches)
        {
            let position = this.branchingList.getItem(i).getValue();
            /** up */
            if(position[0] - 1 >= 0 && [0, -3].includes(this.mazeMap[position[0] - 1][position[1]])) {
                newBranches.push(this.branchingList.addItem([position[0] - 1, position[1]], i));
                if(this.mazeMap[position[0] - 1][position[1]] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0] - 1][position[1]] = currentStepCount;
            }
            /** down */
            if(this.mazeMap[position[0] + 1] !== undefined  && [0, -3].includes(this.mazeMap[position[0] + 1][position[1]])) {
                newBranches.push(this.branchingList.addItem([position[0] + 1, position[1]], i));
                if(this.mazeMap[position[0] + 1][position[1]] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0] + 1][position[1]] = currentStepCount;
            }
            /** left */
            if(position[1] - 1 >= 0 && [0, -3].includes(this.mazeMap[position[0]][position[1] - 1])) {
                newBranches.push(this.branchingList.addItem([position[0], position[1] - 1], i));
                if(this.mazeMap[position[0]][position[1] - 1] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0]][position[1] - 1] = currentStepCount;
            }
            /** right */
            if(position[1] < this.mazeMap[position[0]].length && [0, -3].includes(this.mazeMap[position[0]][position[1] + 1])) {
                newBranches.push(this.branchingList.addItem([position[0], position[1] + 1], i));
                if(this.mazeMap[position[0]][position[1] + 1] == -3) {
                    exitFound = true;
                    break;
                }
                this.mazeMap[position[0]][position[1] + 1] = currentStepCount;
            }      
        }
        
        if(currentIteration < maxIterations && !exitFound)
        {
            currentIteration++;
            return this.expand(newBranches, currentStepCount, maxIterations, currentIteration);
        }
        else if(exitFound)
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
    charToNumber(char: string): number {
        let cn = -1;
        switch(char)
        {
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



let maze: MazeSolver;

const finput = document.getElementById('FileInput') as HTMLInputElement;
finput?.addEventListener('change', (event)=>{
    let fr: FileReader = new FileReader();
    let mz: string;

    fr.addEventListener("load", (event) => {
        mz = fr.result as string;
        maze = new MazeSolver(mz);
    }, false);

    fr.readAsText(finput.files[0]);
});


let table = document.getElementById('MazeTable');
table.addEventListener('mouseover', (event)=>{
    const cell = event.target as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    let pos = cell.getAttribute("data-position").split(",")
    let position: [number, number] =  [+pos[0], +pos[1]];
    
    let index: number = maze.branchingList.findIndexByValue(position);
    let list: [number, number][] = maze.branchingList.getListFromIndex(index);
    
    let cells = document.querySelectorAll('td:not(.solid)');
    cells.forEach((element: HTMLElement) => {
        element.style.backgroundColor = "";
    });

    for(let val of list )
    {
        let td = document.querySelector('tr:nth-of-type('+ (val[0] + 1) +') > td:nth-of-type(' + (val[1] + 1) + ')') as HTMLElement;
        td.style.backgroundColor = 'green';
    }
})

