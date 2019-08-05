console._clear = console.clear.bind(console);
console.clear = function() {
  console._clear();
  if (global.Ex) {
    console.log(global.Ex.ReadablePath);
  }
  //running requests vs
};