export const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

export type RequestConfig = {
    baseUrl: string;
    headers?: Record<string, string>;
    params?: Record<string, string | null>;
    body?: Record<string, string | null>;
    transformRequest?: RequestTransformer;
    xsrfHeaderName?: string;
}

type RequestTransformParams = {
    url: string;
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    headers?: Record<string, string>;
    params?: Record<string, string | null>;
    body?: Record<string, string | null> | FormData | null;
    // responseType?: 'arrayBuffer' | 'blob' | 'json' | 'text';
    abortSignal?: AbortSignal;
}

type RequestTransformResult = Partial<RequestTransformParams> & Pick<RequestTransformParams, 'url' | 'method'>;

export type RequestTransformer = (request: RequestTransformParams) => RequestTransformResult;

export class Requester {

    _config: RequestConfig;

    constructor(config: RequestConfig) {
        this._config = config;
    }

    get config() {
        return this._config;
    }

    transformRequestParams(input: RequestTransformParams): RequestTransformResult {
        const config = this.config;
        const ourHeaders: Record<string, string> = {};
        if (csrf != null && csrf !== '') {
            // TODO handle case when xsrfHeaderName is not set
            ourHeaders[config.xsrfHeaderName!] = csrf;
        }

        const headers = { ...config.headers, ...ourHeaders, ...input.headers };
        const params = { ...config.params, ...input.params };
        let { body } = input;
        const url = config.baseUrl + input.url;
        const method = input.method;

        if (method !== 'get') {

            if (body instanceof FormData) {
                // FormData
                // FIXME this seems overly complicated
                if (config.body != null) {
                    Object.entries(config.body).forEach(([key, value]) => {
                        (body as FormData).append(key, value!);
                    });
                }
            } else {
                // JSON
                body = { ...body, ...config.body };
            }
        }
        /** @type {RequestTransformResultInternal} */
        let transformed = {
            url,
            method,
            headers,
            params,
            body,
        }
        if (config.transformRequest != null) {
            const transformResult = config.transformRequest(transformed);
            transformed = { ...transformed, ...transformResult };
        }
        return transformed;
    }

    getDownloadUrl(adapter: string, node: { path: string, url?: string }): string {
        if (node.url != null) {
            return node.url
        }
        const transform = this.transformRequestParams({
            url: '',
            method: 'get',
            params: { q: 'download', adapter, path: node.path }
        });
        return URLfromParams(transform);
    }

    getPreviewUrl(adapter: string, node: { path: string, url?: string }): string {
        if (node.url != null) {
            return node.url
        }
        const transform = this.transformRequestParams({
            url: '',
            method: 'get',
            params: { q: 'preview', adapter, path: node.path }
        });
        return URLfromParams(transform);
    }

    // FIXME this is way too complex
    async send(input: RequestTransformParams): Promise<Response> {
        const reqParams = this.transformRequestParams(input);
        // const responseType = input.responseType || 'json';

        const init = {
            method: reqParams.method,
            headers: { ...reqParams.headers },
            signal: input.abortSignal,
            // body: '',
        };
        const url = URLfromParams(reqParams);
        if (reqParams.method !== 'get' && reqParams.body != null) {
            if (reqParams.body instanceof FormData) {
                // FormData
                (init as RequestInit).body = reqParams.body;
            } else {
                // JSON
                (init as RequestInit).body = JSON.stringify(reqParams.body);
                init.headers['Content-Type'] = 'application/json';
            }
        }
        const response = await fetch(url, init);
        if (response.ok) {
            return response;
        }
        throw await response.json();
    }
}

export function buildRequester(userConfig: string | RequestConfig): Requester {
    const fixedConfig = (typeof userConfig === 'string') ? { baseUrl: userConfig } : userConfig;

    const config: RequestConfig = {
        headers: {},
        params: {},
        body: {},
        xsrfHeaderName: 'X-CSRF-Token',
        ...fixedConfig,
    };

    return new Requester(config);
};

function URLfromParams(req: RequestTransformParams): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.params ?? {})) {
        if (value != null) {
            params.append(key, value);
        }
    }
    return req.url + '?' + params.toString()
}
