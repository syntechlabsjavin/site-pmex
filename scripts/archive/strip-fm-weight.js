const fs = require("fs");
const p = "dist/family-medicine.html";
let h = fs.readFileSync(p, "utf8");
h = h.replace(
  ".fm-outcomes :is(h3,h4){font-weight:700!important;letter-spacing:normal!important;color:#505050!important}.fm-outcomes h4{font-weight:600!important;letter-spacing:1px!important}.fm-outcomes .font-extrabold{font-weight:800!important}",
  ""
);
h = h.replace(/ style="[^"]*font-weight:[^"]*"/g, "");
fs.writeFileSync(p, h);
console.log("font-weight left", (h.match(/font-weight/g) || []).length);
