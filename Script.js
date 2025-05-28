const questionDiv = document.getElementById("question");
const Spinner = document.getElementById("spinnerMain");
let tempmax = 5;
let max = tempmax;
let ColorCollection = [];
let mainselectedColor = -1;
reset = true;

function isNumber(value) {
  if (value === null) return false;
  return !isNaN(value) && value.trim() !== "";
}

function showManual() {
  object = document.querySelector(".manual");
  if (object.classList.contains("active")) {
    object.classList.remove("active");
  } else {
    object.classList.add("active");
  }
}

function QuestionGet() {
  let ik = 0;
  fetch("data/Questions.json")
    .then((response) => {
      if (!response.ok) throw new Error("File not found");
      return response.json();
    })
    .then((data) => {
      ik = 1;
      const keys = Object.keys(data);
      const lastKey = keys[keys.length - 1];
      const lastQuestion = data[lastKey];
      max = tempmax = lastQuestion.rows;
      insertColorFromFile(lastQuestion.colors);
      inputInsert();
      getCellColors(lastQuestion.cells);
      borderSet();
    })
    .catch((error) => {
      console.error("Error loading file:", error);
    })
    .finally(() => {
      if (ik == 0) {
        while (true) {
          tempmax = prompt("Enter the row number:");
          if (isNumber(tempmax)) {
            tempmax = Number(tempmax);
            if (tempmax <= 3) {
              alert("There is no solution for number under 3");
              continue;
            }
            if (tempmax > 10) {
              alert("This will take time so try lower number");
              continue;
            }
            break;
          } else {
            alert("Please enter a valid number.");
          }
        }
        max = tempmax;
        inputInsert();
      }
    });
}

QuestionGet();

function getCellColors(cells) {
  for (const row in cells) {
    for (const col in cells[row]) {
      let obj = document.getElementById(row + "," + col);
      if (obj) {
        const colorIndex = cells[row][col];
        if (colorIndex >= 0 && colorIndex < ColorCollection.length) {
          obj.classList.add(`color-${colorIndex}`);
        }
      }
    }
  }
}

function borderSet() {
  for (let i = 0; i < max; i++) {
    for (let j = 0; j < max; j++) {
      borderValues(i, j);
    }
  }
}

function borderValues(i, j) {
  const cell = document.getElementById(`${i},${j}`);
  if (cell) {
    let TheClass = "";
    for (let i = 0; i < ColorCollection.length; i++) {
      if (cell.classList.contains(`color-${i}`)) {
        TheClass = `color-${i}`;
        break;
      }
    }
    if (j > 0) {
      const left = document.getElementById(`${i},${j - 1}`);
      if (!left.classList.contains(TheClass)) {
        cell.classList.add(`border-left`);
      } else {
        cell.classList.remove(`border-left`);
      }
    }
    if (j < max - 1) {
      const right = document.getElementById(`${i},${j + 1}`);
      if (!right.classList.contains(TheClass)) {
        cell.classList.add(`border-right`);
      } else {
        cell.classList.remove(`border-right`);
      }
    }

    if (i > 0) {
      const top = document.getElementById(`${i - 1},${j}`);
      if (!top.classList.contains(TheClass)) {
        cell.classList.add(`border-top`);
      } else {
        cell.classList.remove(`border-top`);
      }
    }
    if (i < max - 1) {
      const bottom = document.getElementById(`${i + 1},${j}`);
      if (!bottom.classList.contains(TheClass)) {
        cell.classList.add(`border-bottom`);
      } else {
        cell.classList.remove(`border-bottom`);
      }
    }
  }
}

function fourSizedCheck(i, j) {
  borderValues(i, j);
  if (i > 0) {
    borderValues(i - 1, j);
  }
  if (i < max - 1) {
    borderValues(i + 1, j);
  }
  if (j > 0) {
    borderValues(i, j - 1);
  }
  if (j < max - 1) {
    borderValues(i, j + 1);
  }
}

function inputInsert() {
  questionDiv.style.gridTemplateColumns = `repeat(${max}, 1fr)`;
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < max; row++) {
    for (let col = 0; col < max; col++) {
      const div = document.createElement("div");
      div.id = `${row},${col}`;
      div.classList.add("cell-input");

      div.addEventListener("click", () => AddColor(row, col));

      fragment.appendChild(div);
    }
  }

  questionDiv.innerHTML = "";
  questionDiv.appendChild(fragment);
}

function insertColorFromFile(colors) {
  colors.forEach((element) => {
    colorBoxControl(element);
  });
}

function colorBoxControl(element) {
  const selectedColor = element;
  ColorCollection.push(selectedColor);
  const newColor = document.createElement("button");
  colorIndex = ColorCollection.indexOf(selectedColor);
  const className = `color-${colorIndex}`;
  const styleTag =
    document.getElementById("dynamic-styles") || createStyleTag();
  try {
    styleTag.sheet.insertRule(
      `.${className} { background-color: ${selectedColor}; }`,
      styleTag.sheet.cssRules.length
    );
  } catch (err) {
    console.error("Insert rule failed:", err);
  }
  if (mainselectedColor == -1) {
    newColor.classList.add("color-active");
    mainselectedColor = ColorCollection.indexOf(selectedColor);
  }

  newColor.addEventListener("click", function (element) {
    let colorer = selectedColor;
    const target = element.target;
    if (target.classList.contains("color-active")) {
      mainselectedColor = -1;
      target.classList.remove("color-active");
    } else {
      document.querySelectorAll(".color-active").forEach((activeColor) => {
        activeColor.classList.remove("color-active");
      });
      mainselectedColor = ColorCollection.indexOf(colorer);
      target.classList.add("color-active");
    }
  });
  newColor.style.backgroundColor = selectedColor;
  document.getElementById("colors-t").appendChild(newColor);
}

function addColors() {
  if (document.getElementById("colorPicker")) return;

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.id = "colorPicker";
  colorInput.style.marginLeft = "10px";
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.style.marginLeft = "5px";
  saveButton.onclick = function () {
    colorBoxControl(colorInput.value);
    colorInput.remove();
    saveButton.remove();
  };
  document.querySelector(".selection-box").appendChild(colorInput);
  document.querySelector(".selection-box").appendChild(saveButton);
}
function createStyleTag() {
  const style = document.createElement("style");
  style.id = "dynamic-styles";
  document.head.appendChild(style);
  return style;
}

function AddColor(row, col) {
  let old = -1;
  let object = document.getElementById(row + "," + col);
  for (let i = 0; i < ColorCollection.length; i++) {
    if (object.classList.contains(`color-${i}`)) {
      old = i;
      object.classList.remove(`color-${i}`);
    }
  }
  if (mainselectedColor == -1) {
    fourSizedCheck(row, col);
    if (old == -1 && mainselectedColor == -1) alert("Please Select a Color");
    return;
  }
  if (
    object.classList.contains(`color-${mainselectedColor}`) ||
    old == mainselectedColor
  ) {
    object.classList.remove(`color-${mainselectedColor}`);
  } else {
    object.classList.add(`color-${mainselectedColor}`);
  }
  fourSizedCheck(row, col);
}
function resetall() {
  if (reset) {
    let objects = document.querySelectorAll(".Queen");
    objects.forEach((element) => {
      element.classList.remove("Queen");
    });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function wonTheGame() {
  for (let i = max - 1; i >= 0; i--) {
    await sleep(80);
    for (let j = max - 1; j >= 0; j--) {
      let object = document.getElementById(i + "," + j);

      object.classList.add("Won");
    }
  }
  for (let i = max - 1; i >= 0; i--) {
    await sleep(80);
    for (let j = max - 1; j >= 0; j--) {
      let object = document.getElementById(i + "," + j);
      object.classList.remove("Observe");
      object.classList.remove("Won");
    }
  }
}
let colorCount = [];
async function result() {
  for (let i = 0; i < ColorCollection.length; i++) {
    colorCount[i] = 0;
  }
  resetall();
  Spinner.style.display = "grid";
  await sleep(100);
  reset = false;
  let nonQueenCount = [];
  for (let i = 0; i < max; i++) {
    let flag = 0;
    for (let j = 0; j < max; j++) {
      let object = document.getElementById(i + "," + j);
      if (object.classList.contains("Queen")) {
        flag++;
      }
    }
    if (flag > 1) {
      alert("Not Possiable");
      return;
    } else if (flag == 0) {
      nonQueenCount.push(i);
    }
  }
  if (!placeQueen(0, nonQueenCount)) {
    alert("This Can't be Solved");
  } else {
    wonTheGame();
  }
  colorCount = [];
  Spinner.style.display = "none";
  reset = true;
}

function placeQueen(row, nonQueenCount) {
  if (row >= nonQueenCount.length) {
    return true;
  }

  for (let i = 0; i < max; i++) {
    let colorindex = -1;
    let object = document.getElementById(nonQueenCount[row] + "," + i);
    for (let i = 0; i < ColorCollection.length; i++) {
      if (object.classList.contains(`color-${i}`)) {
        colorindex = i;
      }
    }

    if (placement(nonQueenCount[row], i, colorindex)) {
      if (colorindex != -1) {
        colorCount[colorindex] = 1;
      }
      object.classList.add("Queen");
      if (placeQueen(row + 1, nonQueenCount)) {
        return true;
      }
      if (colorindex != -1) {
        colorCount[colorindex] = 0;
      }
      object.classList.remove("Queen");
    }
  }
  return false;
}

function placement(row, col, colorindex) {
  if (colorindex != -1) {
    if (colorCount[colorindex] != 0) {
      return false;
    }
  }
  for (let i = row; i >= 0; i--) {
    let object = document.getElementById(i + "," + col);
    if (object.classList.contains("Queen")) {
      return false;
    }
  }
  for (let i = col; i >= 0; i--) {
    let object = document.getElementById(row + "," + i);
    if (object.classList.contains("Queen")) {
      return false;
    }
  }
  for (let i = col; i < max; i++) {
    let object = document.getElementById(row + "," + i);
    if (object.classList.contains("Queen")) {
      return false;
    }
  }
  for (let i = row; i < max; i++) {
    let object = document.getElementById(i + "," + col);
    if (object.classList.contains("Queen")) {
      return false;
    }
  }

  // for(let i=row, j=col;i>=0&&j>=0;i--,j--){
  //         let object=document.getElementById(i+","+j);
  //         if(object.classList.contains("Queen")){
  //             return false
  //     }
  // }

  if (row > 0 && col > 0) {
    let object = document.getElementById(row - 1 + "," + (col - 1));
    if (object.classList.contains("Queen")) {
      return false;
    }
  }

  // for(let i=row, j=col;i<max&&j<max;i++,j++){
  //     let object=document.getElementById(i+","+j);
  //     if(object.classList.contains("Queen")){
  //         return false
  //     }
  // }

  if (row < max - 1 && col < max - 1) {
    let object = document.getElementById(row + 1 + "," + (col + 1));
    if (object.classList.contains("Queen")) {
      return false;
    }
  }

  // for(let i=row, j=col;i>=0&&j<max;i--,j++){
  //     let object=document.getElementById(i+","+j);
  //     if(object.classList.contains("Queen")){
  //         return false
  //     }
  // }

  if (row > 0 && col < max - 1) {
    let object = document.getElementById(row - 1 + "," + (col + 1));
    if (object.classList.contains("Queen")) {
      return false;
    }
  }

  // for(let i=row, j=col;j>=0&&i<max;j--,i++){
  //     let object=document.getElementById(i+","+j);
  //     if(object.classList.contains("Queen")){
  //         return false
  //     }
  // }

  if (row < max - 1 && col > 0) {
    let object = document.getElementById(row + 1 + "," + (col - 1));
    if (object.classList.contains("Queen")) {
      return false;
    }
  }

  return true;
}
