const form = document.querySelector('form')
const ul = document.querySelector('ul')
const input = document.getElementById('title')
const button = document.getElementById('clearButton')

let goals = localStorage.getItem('goals')
    ? JSON.parse(localStorage.getItem('goals'))
    : []

localStorage.setItem('goals', JSON.stringify(goals))
const data = JSON.parse(localStorage.getItem('goals'))

//Returns the number of days between date 1 and date 2,
//positive means date1 is later, negative means date 2 is later
function compareTwoDates(year1, month1, day1, year2, month2, day2) {
    const utc1 = Date.UTC(year1, month1, day1);
    const utc2 = Date.UTC(year2, month2, day2);

    return Math.floor((utc1 - utc2) / (1000*60*60*24)); //convert difference to days
}

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

let todayString = yyyy + '-' + mm + '-' + dd;
let dateForm = document.getElementById('dateForm');
dateForm.value = todayString;
dateForm.min = todayString;

//Rebuilds the entire list from storage.
function refresh() {
    let list = document.getElementById("list")
    list.innerHTML = "";
    let curUl = null;
    let numberOverdue = 0;
    let numberToday = 0;
    let numberTommorrow = 0;
    let numberLater = 0;

    console.log(goals);
    if (goals.length === 0) {
        list.innerHTML = "<p id=emptyMessage> there is nothing here... </p>";
        return;
    }

    for (let i = 0; i < goals.length; i++) {
        if (compareTwoDates(goals[i].year, goals[i].month, goals[i].day, yyyy, mm, dd) < 0) {
            if (numberOverdue === 0) {
                let overdueHeader = document.createElement("h2");
                let txt = document.createTextNode("Overdue:")
                overdueHeader.appendChild(txt);
                list.appendChild(overdueHeader)
                let overdueUl = document.createElement("ul")
                list.appendChild(overdueUl);
                curUl = overdueUl;
            }
            numberOverdue++;
        }

        else if (compareTwoDates(goals[i].year, goals[i].month, goals[i].day, yyyy, mm, dd) === 0) {
            if (numberToday === 0) {
                let todayHeader = document.createElement("h2");
                let txt = document.createTextNode("Today's List:")
                todayHeader.appendChild(txt);
                list.appendChild(todayHeader)
                let todayUl = document.createElement("ul")
                list.appendChild(todayUl);
                curUl = todayUl;
            }
            numberToday++;
        }
        else if (compareTwoDates(goals[i].year, goals[i].month, goals[i].day, yyyy, mm, dd) === 1) {
            if (numberTommorrow === 0) {
                let tommorrowHeader = document.createElement("h2");
                let txt = document.createTextNode("Tommorrow's List:")
                tommorrowHeader.appendChild(txt);
                list.appendChild(tommorrowHeader)
                let tommorrowUl = document.createElement("ul")
                list.appendChild(tommorrowUl);
                curUl = tommorrowUl;
            }
        }
        else {
            if (numberLater === 0) {
                let laterHeader = document.createElement("h2");
                let txt = document.createTextNode("Later:")
                laterHeader.appendChild(txt);
                list.appendChild(laterHeader)
                let laterUl = document.createElement("ul")
                list.appendChild(laterUl);
                curUl = laterUl;
            }
            numberLater++;
        }

        if (i >= 20 && numberLater) return;

        //create elements
        const li = document.createElement('li')
        var span = document.createElement("SPAN");
        var txt = document.createTextNode(goals[i].text);
        span.className = "item";
        span.appendChild(txt);
        li.appendChild(span);
        curUl.appendChild(li)

        span = document.createElement("SPAN");
        txt = document.createTextNode("delete");
        span.className = "close";
        span.appendChild(txt);
        li.appendChild(span);

        span = document.createElement("SPAN");
        txt = document.createTextNode("edit");
        span.className = "edit";
        span.appendChild(txt);
        li.appendChild(span);

        if (compareTwoDates(goals[i].year, goals[i].month, goals[i].day, yyyy, mm, dd) > 1) {
            let p = document.createElement("p");
            txt = document.createTextNode(goals[i].month + "/" + goals[i].day + "/" + goals[i].year);
            p.className = "furtherDate";
            p.appendChild(txt);
            li.appendChild(p);
        }

        let hr = document.createElement("hr");
        hr.className = "solid";
        li.appendChild(hr);

        let close = document.getElementsByClassName("close")
        let edit = document.getElementsByClassName("edit")
        let lists = document.querySelectorAll('li');
        i = lists.length - 1;
        let items= document.getElementsByClassName("item")

        if (goals[i].checked) {
            items[i].classList.toggle("checked");
            lists[i].classList.toggle("checked");
            edit[i].style.display = "none";
        }

        lists[i].id = i.toString();

        close[i].onclick = function() {
            let deleteId = parseInt(this.parentElement.id)
            var div = this.parentElement;
            div.remove();
            goals.splice(deleteId, 1);
            localStorage.setItem('goals', JSON.stringify(goals))

            refresh();
        }

        edit[i].onclick = function() {
            let newText = prompt("Enter new item title:");
            if (newText !== "" && newText !== null) {
                let editId = parseInt(this.parentElement.id)
                lists[editId].firstChild.nodeValue = newText;
                goals[editId].text = newText;
                localStorage.setItem('goals', JSON.stringify(goals))
                refresh()
            }
        }

        items[i].onclick = function() {
            items[i].classList.toggle("checked");
            lists[i].classList.toggle("checked");
            if (goals[i].checked) {
                goals[i].checked = false;
                edit[i].style.display = "inline";
            }
            else {
                goals[i].checked = true;
                edit[i].style.display = "none";
            }
            localStorage.setItem('goals', JSON.stringify(goals))
        }
    }
}

form.addEventListener('submit', function (e) {
    let removeMessage = document.getElementById('emptyMessage');
    if (removeMessage !== null) removeMessage.remove();
    e.preventDefault()
    let date = dateForm.value;
    let year = parseInt(date.substring(0,4));
    let month = parseInt(date.substring(5,7));
    let day = parseInt(date.substring(8));

    let item = {
        text: input.value,
        checked: false,
        year: year,
        month: month,
        day: day
    }

    let placed = false;

    for (let i = 0; i < goals.length; i++) {
        if (compareTwoDates(item.year, item.month, item.day, goals[i].year, goals[i].month, goals[i].day) < 1) {
            goals.splice(i, 0, item);
            placed = true;
            break;
        }
    }

    if (placed === false) goals.push(item)

    localStorage.setItem('goals', JSON.stringify(goals))
    refresh();
    input.value = ''
})

button.addEventListener('click', function () {
    goals = [];
    localStorage.setItem('goals', "[]");
    refresh();
})

refresh()

//discontinued
const liMaker = (item) => {

    let list = document.querySelectorAll('li');
    let placed = false;
    let placedLocation = 0;
    const li = document.createElement('li')
    li.textContent = item.text
    for (let i = 0; i < list.length; i++) {
        if (compareTwoDates(item.year, item.month, item.day, goals[i].year, goals[i].month, goals[i].day) < 1) {
            ul.insertBefore(li, list[i]);
            placed = true;
            placedLocation = i;
            break;
        }
    }

    if (placed === false) {
        ul.appendChild(li)
        placedLocation = list.length;
    }

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("delete");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    span = document.createElement("SPAN");
    txt = document.createTextNode("edit");
    span.className = "edit";
    span.appendChild(txt);
    li.appendChild(span);

    let hr = document.createElement("hr");
    hr.className = "solid";
    li.appendChild(hr);

    let close = document.getElementsByClassName("close")
    let edit = document.getElementsByClassName("edit")
    list = document.querySelectorAll('li');
    i = list.length - 1;

    if (placedLocation < list.length - 1) {
        for (i = 0; i < list.length; i++) {
            list[i].id = i.toString()
        }
    }
    else list[i].id = i.toString();

    close[placedLocation].onclick = function() {
        let deleteId = parseInt(this.parentElement.id)
        var div = this.parentElement;
        div.remove();
        goals.splice(deleteId, 1);
        localStorage.setItem('goals', JSON.stringify(goals))

        let list = document.querySelectorAll('li');
        for (let i = 0; i < goals.length; i++) {
            list[i].id = i.toString()
        }

        if (goals.length === 0) {
            appendEmptyMessage()
        }
    }

    edit[placedLocation].onclick = function() {
        let newText = prompt("Enter new item title:");
        if (newText !== "" && newText !== null) {
            let editId = parseInt(this.parentElement.id)
            list[editId].firstChild.nodeValue = newText;
            goals[editId].text = newText;
            localStorage.setItem('goals', JSON.stringify(goals))
        }
    }

}
