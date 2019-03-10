export interface XMLHttpRequestI {
  onreadystatechange?: ((this: XMLHttpRequest, ev: Event) => any) | null;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  withCredentials?: boolean;
  Authorization?: string;
}
