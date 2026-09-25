import { test } from "node:test";
import assert from "node:assert/strict";
import { groupByDate, initials } from "../public/logic.js";

const fixture = [
  { id: 1, date: "2026-10-02", title: "Hotel", paidBy: "Ash", amount: 1200, splitBetween: ["Ash", "Riya"] },
  { id: 2, date: "2026-10-01", title: "Cab", paidBy: "Riya", amount: 300, splitBetween: ["Ash", "Riya"] },
  { id: 3, date: "2026-10-02", title: "Dinner", paidBy: "Riya", amount: 800, splitBetween: ["Ash", "Riya"] },
];

test("groupByDate sorts days and keeps items together", () => {
  const groups = groupByDate(fixture);
  assert.deepEqual(groups.map(([d]) => d), ["2026-10-01", "2026-10-02"]);
  assert.equal(groups[1][1].length, 2);
});

test("initials", () => {
  assert.equal(initials("meera"), "M");
});
