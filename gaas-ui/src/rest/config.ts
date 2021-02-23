const _env = window as any;

export class Config {
    static REACT_APP_API_PLATFORM = checkAPIPlatform();
    static REACT_APP_KAI_REST_API_HOST = checkAPIHost();
    static REACT_APP_COGNITO_USERPOOLID = checkCognitoUserPoolId();
    static REACT_APP_COGNITO_CLIENTID = checkCognitoClientId();
    static REACT_APP_AUTH_ENDPOINT = checkAuthEndpoint();
}
function checkCognitoClientId(): string | undefined {
    if(_env.REACT_APP_COGNITO_CLIENTID === undefined){
        return process.env.REACT_APP_COGNITO_CLIENTID;
    }
    return _env.REACT_APP_COGNITO_CLIENTID;
}
function checkCognitoUserPoolId(): string | undefined {
    if(_env.REACT_APP_COGNITO_USERPOOLID === undefined){
        return process.env.REACT_APP_COGNITO_USERPOOLID;
    }
    return _env.REACT_APP_COGNITO_USERPOOLID;
}
function checkAPIPlatform(): string | undefined {
    if(_env.REACT_APP_API_PLATFORM === undefined) {
        return process.env.REACT_APP_API_PLATFORM;
    }
    return _env.REACT_APP_API_PLATFORM;
}
function checkAPIHost(): string | undefined {
    if ( _env.REACT_APP_KAI_REST_API_HOST === undefined) {
        return process.env.REACT_APP_KAI_REST_API_HOST;
    }
    return _env.REACT_APP_KAI_REST_API_HOST
}
function checkAuthEndpoint(): string | undefined {
    if (_env.REACT_APP_AUTH_ENDPOINT === undefined) {
        return process.env.REACT_APP_AUTH_ENDPOINT;
    }
    return _env.REACT_APP_AUTH_ENDPOINT;
}