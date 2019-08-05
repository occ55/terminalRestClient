import { appendFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { reqUncached } from "./Helpers/Require";
import { RequestIdGen } from "./Helpers/IdGen";
import { TRequest } from "./Helpers/RequestType";


export enum FileTypes {
  js = "js",
  json = "json",
  binary = "binary",
  xml = "xml"
}

export enum ResourceTypes {
  body = "body",
  context = "context",
  query = "query",
  header = "header",
  request = "request"
}

export interface IResource<ModuleT = any> {
  path: string;
  fileName: string;
  type: FileTypes,
  idendifier: string;
  resourceType: ResourceTypes;
  module?: ModuleT;
}

export interface INode {
  path: string;
  parent?: INode;
  children: INode[];
  context: Record<string, IResource>;
  body: Record<string, IResource>;
  query: Record<string, IResource>;
  header: Record<string, IResource>;
  request: Record<string, IResource>;
  contextModuleMap: Record<string, Record<string, any>>;
}


/*
request id tasidigi icin requestin yeri ile ilgili islemlerde
tree nin degisimi onemli degil, gerektiginde lookup yapilir.

tree de degisim olursa context yenilenmeli
* */

export class Tree {
  static Root: INode;
  static AllNodes: Record<string, INode> = {};

  static CreateResource(fileName: string, filePath: string) {
    const parts = fileName.split(".");
    const ext = parts.pop() || "";
    const type = parts.pop() || "";
    const ident = parts.join(".");
    if (!(type in ResourceTypes)) {
      return;
    }
    const resource: IResource = {
      fileName: fileName,
      path: filePath,
      type: ext as FileTypes,
      resourceType: type as ResourceTypes,
      idendifier: ident || "default",
    };
    if (!(ext in FileTypes)) {
      resource.type = FileTypes.binary;
    }
    return resource;
  }

  static Find(fn: (node: INode) => boolean, node: INode = this.Root): INode[] {
    if (fn(node)) {
      return [node];
    } else {
      const arr = [];
      for (const child of node.children) {
        const result = this.Find(fn, child);
        if (result) {
          arr.push(...result);
        }
      }
      return arr;
    }
  }

  static FindFirstContext(identifier: string, node: INode): Record<string, any> {
    if (identifier in node.contextModuleMap) {
      return node.contextModuleMap[identifier];
    } else if (node.parent) {
      return this.FindFirstContext(identifier, node.parent);
    } else return {};
  }

  static async CreateNode(Path: string, Parent?: INode): Promise<INode> {
    const node: INode = {
      path: Path,
      parent: Parent,
      children: [],
      body: {},
      context: {},
      header: {},
      query: {},
      request: {},
      contextModuleMap: {},
    };
    const fns: Function[] = [];
    const files = readdirSync(Path);
    for (const file of files) {
      const filePath = join(Path, file);
      if (statSync(filePath).isDirectory()) {
        fns.push(async () => {
          const cnode = await this.CreateNode(filePath, node);
          node.children.push(cnode);
        });
      } else {
        const res = this.CreateResource(file, filePath);
        if (res) {
          node[res.resourceType][res.idendifier] = res;
        }
      }
    }
    for (const resName in node.request) {
      const res = node.request[resName];
      if (res.type === FileTypes.js && res.resourceType === ResourceTypes.request) {
        let module: TRequest = reqUncached(res.path);
        if (!module.ID) {
          appendFileSync(res.path, `\nmodule.exports.ID = "${RequestIdGen()}";\n`);
          module = reqUncached(res.path);
        }
        res.module = module;
      }
    }
    //console.log(node.path);
    //context build
    const defContextRes = node.context["default"];
    if (defContextRes) {
      const parentC = this.FindFirstContext(defContextRes.idendifier, node);
      const module = reqUncached(defContextRes.path);
      const currentContext = typeof module === "function" ? await module(parentC) : module;
      node.contextModuleMap[defContextRes.idendifier] = { ...parentC, ...currentContext };
    }
    for (const cName in node.context) {
      const c = node.context[cName];
      if (c.idendifier === "default") continue;
      const parentC = this.FindFirstContext(c.idendifier, node);
      const parentDefC = this.FindFirstContext("default", node);
      const module = reqUncached(c.path);
      const currentContext = typeof module === "function" ? await module({ ...parentDefC, ...parentC }) : module;
      //console.log(parentDefC, parentC, currentContext);
      node.contextModuleMap[c.idendifier] = { ...parentDefC, ...parentC, ...currentContext };
    }
    this.AllNodes[node.path] = node;
    await Promise.all(fns.map(f => f()));
    return node;
  };

  static async Build() {
    //wathcer i kapat
    this.Root = await this.CreateNode(global.Ex.Root);
    //watcher i ac
  }

}