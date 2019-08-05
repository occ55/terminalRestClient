import { FileTypes, INode, IResource, ResourceTypes, Tree } from "./Tree";
import { reqUncached } from "./Helpers/Require";
import { IBuiltRequest, TBodyType, TRequest } from "./Helpers/RequestType";
import { https } from "./Protocols/https";
import { http } from "./Protocols/http";
import { http2 } from "./Protocols/http2";
import { ws } from "./Protocols/ws";

export const Protocols: Record<string,
  typeof https
  | typeof http
  | typeof http2
  | typeof ws> = {};

export abstract class Request {
  Send() {

  }
}

export class RequestBuilder {
  static async Build(source: string | INode, identifier?: string) {
    if (typeof source === "string") {
      source = Tree.Find(n => n.path === source, Tree.Root)[0];
      if (!source) {
        throw new Error(`Cant form request, ${source}, ${identifier}`);
      }
    }
    if (Object.keys(source.request).length === 0 ||
      (identifier && !source.request[identifier] && !source.request["default"])
    ) {
      throw new Error(`Cant form request with node, ${JSON.stringify(source.path)}, ${identifier}`);
    }
    if (!identifier) {
      if (source.request["default"]) {
        identifier = "default";
      } else {
        identifier = source.request[0].idendifier;
      }
    }
    const builtData = await this.BuildSanitized(source, identifier);
    return new Protocols[builtData.request.protocol](builtData);
  }

  private static async LoadResourceAsObject(
    context: any,
    req: TRequest,
    resource?: IResource,
  ) {
    if (!resource) return {};
    if (resource.type === FileTypes.js) {
      const moduleObj = reqUncached(resource.path);
      if (typeof moduleObj === "function") {
        //normal function
        return await moduleObj(context, req) || {};
      } else if (typeof moduleObj.before === "function" || typeof moduleObj.after === "function") {
        //before veya after i olan module
        if (typeof moduleObj.before === "function") {
          return await (moduleObj.before as any)(context, req) || {};
        } else {
          return {};
        }
      } else {
        //duz obje
        return moduleObj;
      }
    } else if (resource.type === FileTypes.json) {
      try {
        return require(resource.path);
      } catch (ex) {
        console.log(`invalid json at ${resource.path}`);
        return {};
      }
    } else {
      return {};
    }
  }

  private static async LoadResourceAsObjectAfter(
    context: any,
    req: TRequest,
    built: IBuiltRequest,
    resource?: IResource,
  ) {
    if (!resource) return {};
    if (resource.type === FileTypes.js) {
      const moduleObj = reqUncached(resource.path);
      if (typeof moduleObj.before === "function" || typeof moduleObj.after === "function") {
        //before veya after i olan module
        if (typeof moduleObj.after === "function") {
          return await (moduleObj.after as any)(context, req, built) || {};
        } else {
          return {};
        }
      } else {
        return {};
      }
    } else if (resource.type === FileTypes.json) {
      return {};
    } else {
      return {};
    }
  }

  private static async BuildResources(
    source: INode,
    identifier: string,
    name: ResourceTypes,
    context: any,
    req: TRequest,
  ) {
    const result = {};
    const resToPush: Record<string, any>[] = [];
    if ((req as any)[name]) {
      resToPush.push((req as any)[name]);
    }
    for (let cNode = source; cNode != null; cNode = cNode.parent!) {
      const res: undefined | IResource = cNode[name][identifier];
      let defRes: undefined | IResource;
      if (identifier !== "default") {
        defRes = cNode[name]["default"];
      }
      const [resObj, defResObj] = [
        await this.LoadResourceAsObject(context, req, res),
        await this.LoadResourceAsObject(context, req, defRes),
      ];
      resToPush.push(resObj, defResObj);
    }
    Object.assign(result, ...resToPush.reverse());
    return result;
  }

  private static async BuildResourcesAfter(
    source: INode,
    identifier: string,
    name: ResourceTypes,
    context: any,
    req: TRequest,
    built: IBuiltRequest,
  ) {
    const result = {};
    const resToPush: Record<string, any>[] = [];
    for (let cNode = source; cNode != null; cNode = cNode.parent!) {
      const res: undefined | IResource = cNode[name][identifier];
      let defRes: undefined | IResource;
      if (identifier !== "default") {
        defRes = cNode[name]["default"];
      }
      const [resObj, defResObj] = [
        await this.LoadResourceAsObjectAfter(context, req, built, res),
        await this.LoadResourceAsObjectAfter(context, req, built, defRes),
      ];
      resToPush.push(resObj, defResObj);
    }
    Object.assign(result, ...resToPush.reverse());
    return result;
  }

  private static async BuildBody(source: INode, identifier: string, bodyType: TBodyType, context: any, req: TRequest): Promise<{
    type: TBodyType,
    value?: string | Buffer | Record<any, string>,
    path?: string
  }> {
    if (bodyType === "json") {
      const obj = await this.BuildResources(source, identifier, ResourceTypes.body, context, req);
      return {
        type: "json",
        value: obj,
      };
    }
    if (req.body) {
      return {
        type: bodyType,
        value: req.body,
      };
    }
    for (let cNode = source; cNode != null; cNode = cNode.parent!) {
      const res: undefined | IResource = cNode["body"][identifier];
      let defRes: undefined | IResource;
      if (identifier !== "default") {
        defRes = cNode["body"]["default"];
      }
      if (res && res.type === bodyType) {
        return {
          type: bodyType,
          path: res.path,
        };
      } else if (defRes && defRes.type === bodyType) {
        return {
          type: bodyType,
          path: defRes.path,
        };
      }
    }
    return {
      type: bodyType,
    };
  }


  private static async BuildSanitized(source: INode, identifier: string) {
    const context = Tree.FindFirstContext(identifier, source);
    const reqRes = source.request[identifier] || source.request["default"];
    const req: TRequest = typeof reqRes.module.Properties === "function"
      ? reqRes.module.Properties(context)
      : reqRes.module.Properties;
    const data: Record<ResourceTypes, Record<string, any>> = {} as any;
    for (const rt in ResourceTypes) {
      if (rt === ResourceTypes.request || rt === ResourceTypes.context) continue;
      if (rt === ResourceTypes.body) {
        data[rt as ResourceTypes] = await this.BuildBody(source, identifier, req.bodyType, context, req);
      } else {
        data[rt as ResourceTypes] = await this.BuildResources(source, identifier, rt as ResourceTypes, context, req);
      }
    }
    const built = {
      context,
      identifier,
      node: source,
      body: data.body,
      header: data.header,
      query: data.query,
      request: req,
      requestRes: reqRes,
      requestModule: reqRes.module,
    } as IBuiltRequest;
    for (const rt in ResourceTypes) {
      if (rt === ResourceTypes.request || rt === ResourceTypes.context || rt === ResourceTypes.body) continue;
      Object.assign(
        data[rt as ResourceTypes],
        await this.BuildResourcesAfter(source, identifier, rt as ResourceTypes, context, req, built),
      );
    }
    return built;
  }
}