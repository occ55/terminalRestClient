import { Explorer } from "./Explorer";
import { join } from "path";
import { Tree } from "./Tree";

export async function Init() {
  InitExplorer();
  await InitTree();
}

async function InitTree() {
  await Tree.Build();
}

function InitExplorer() {
  global.Ex = new Explorer(join("../", process.argv[2] || "Workspaces", process.argv[3] || "Test"));
  global.$ = global.Ex.$;
  global.$$ = global.Ex.$$;
  global.cd = global.Ex.Navigate.bind(global.Ex);
  //global.ls = global.Ex.List.bind(global.Ex);
  Object.defineProperty(global, "ls", {
    get: global.Ex.List.bind(global.Ex),
    enumerable: true,
    configurable: true,
  });
  global.clear = console.clear.bind(console);
}