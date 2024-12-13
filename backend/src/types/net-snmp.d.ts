declare module 'net-snmp' {
  export interface SessionOptions {
    port?: number;
    timeout?: number;
    retries?: number;
    transport?: string;
    version?: number;
    idBitsSize?: number;
    context?: string;
  }

  export interface VarBind {
    oid: string;
    type: number;
    value: any;
  }

  export interface Session {
    get(oids: string[], callback: (error: Error | null, varbinds: VarBind[]) => void): void;
    close(): void;
    on(event: string, callback: (error: Error) => void): void;
  }

  export function createSession(target: string, community: string, options?: SessionOptions): Session;
}