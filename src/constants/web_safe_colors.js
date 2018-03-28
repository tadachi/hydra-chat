import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  cyan,
  teal,
  green,
  lightGreen,
  orange
} from "material-ui/colors";

let colors = [];

for (const p of [400, 700, 900]) {
  colors.push(red[p]);
}

for (const p of [300, 600, 900]) {
  colors.push(pink[p]);
}

for (const p of [300, 600, 900]) {
  colors.push(purple[p]);
}

for (const p of [300, 600, 900]) {
  colors.push(deepPurple[p]);
}

for (const p of [300, 600, 900]) {
  colors.push(indigo[p]);
}

for (const p of [500, 900]) {
  colors.push(blue[p]);
}

for (const p of [700, 900]) {
  colors.push(cyan[p]);
}

for (const p of [400, 600, 900]) {
  colors.push(teal[p]);
}

for (const p of [600, 900]) {
  colors.push(green[p]);
}

for (const p of [700, 900]) {
  colors.push(lightGreen[p]);
}

for (const p of [800, 900]) {
  colors.push(orange[p]);
}

colors.push(purple["A200"]);

export default colors;
