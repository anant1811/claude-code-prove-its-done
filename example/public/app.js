import { groupByDate, formatDate, initials } from "./logic.js";

const res = await fetch("./data/expenses.json");
const data = await res.json();

document.querySelector("#trip-name").textContent = data.name;
document.querySelector("#people").innerHTML = data.people
  .map((p) => `<span class="avatar" title="${p}">${initials(p)}</span>`)
  .join("");

const list = document.querySelector("#expenses");
list.innerHTML = groupByDate(data.expenses)
  .map(
    ([date, items]) => `
    <section class="day">
      <h3>${formatDate(date)}</h3>
      ${items
        .map(
          (e) => `
        <article class="expense">
          <div>
            <div class="title">${e.title}</div>
            <div class="meta">${e.paidBy} paid · split ${e.splitBetween.length} ways</div>
          </div>
          <div class="amount">₹${e.amount}</div>
        </article>`
        )
        .join("")}
    </section>`
  )
  .join("");
