import { tryDo } from "./utils";

export class MessageType<ReqT, ResT> {
  constructor(public readonly type: string) {}
}

export interface MessageRequestOptions {
  timeout?: number;
}

export class MessageClient {
  private id = 0;

  private readonly connectionHandlers: Map<number, [(msg: any) => void, (reason?: any) => void]> = new Map();

  constructor(private readonly postMessage: (msg: any) => void) {}

  emit(message: any) {
    if (!Array.isArray(message)) {
      console.warn(`unexcpeted message format`, message);
      return;
    }
    const [requestId, _, req] = message;
    const handler = this.connectionHandlers.get(requestId);
    if (!handler) {
      console.warn(`unexcpeted message id ${requestId}`, message);
      return;
    }
    const [resolve, reject] = handler;
    if (req instanceof Error) {
      reject(req);
      return;
    }
    resolve(req);
  }

  request<ResT>(type: MessageType<void, ResT>, req?: void, options?: MessageRequestOptions): Promise<ResT>
  request<ReqT, ResT>(type: MessageType<ReqT, ResT>, req: ReqT, options?: MessageRequestOptions): Promise<ResT>
  request<ReqT, ResT>(type: MessageType<ReqT, ResT>, req: ReqT, options?: MessageRequestOptions): Promise<ResT> {
    const { promise, resolve, reject } = Promise.withResolvers<ResT>();
    const requestId = this.id++;
    this.connectionHandlers.set(requestId, [resolve, reject]);
    if (options?.timeout) {
      setTimeout(() => {
        reject();
      }, options.timeout);
    }
    this.postMessage([requestId, type.type, req]);
    return promise;
  }
}

export type MessageHandler<ReqT, ResT> = (req: ReqT) => ResT | Promise<ResT>;

export type MessageRoute<ReqT, ResT> = [MessageType<ReqT, ResT>, MessageHandler<ReqT, ResT>];

export class MessageServer<T extends MessageRoute<any, any>[]> {
  private readonly handlerMap: Map<string, MessageHandler<any, any>>;

  constructor(routes: T) {
    this.handlerMap = new Map(routes.map(([msg, handler]) => [msg.type, handler]));
  }

  async serve(message: any) {
    if (!Array.isArray(message)) {
      console.warn(`unexcpeted message format`, message);
      return;
    }
    const [requestId, type, req] = message;
    const handler = this.handlerMap.get(type);
    if (!handler) {
      console.warn(`unexcpeted message type ${type}`, message);
      return;
    }
    const res = await tryDo(() => handler(req), (e) => e);
    return [requestId, type, res];
  }
}
