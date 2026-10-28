const HEX = "0123456789abcdef";

export function makeUuid() {
  let out = "";

  for (let index = 0; index < 36; index += 1) {
    if (index === 8 || index === 13 || index === 18 || index === 23) {
      out += "-";
    } else if (index === 14) {
      out += "4";
    } else if (index === 19) {
      out += HEX[8 + Math.floor(Math.random() * 4)];
    } else {
      out += HEX[Math.floor(Math.random() * 16)];
    }
  }

  return out;
}
