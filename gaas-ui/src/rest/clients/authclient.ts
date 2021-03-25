export interface IAuthClient {
    login(username: string, password: string, onSuccess: Function, onError: Function): void;
    setNewPasswordAndLogin(
        username: string,
        tempPassword: string,
        newPassword: string,
        onSuccess: Function,
        onError: Function
    ): void;
    signOut(onSuccess: Function, onError: Function): void;
}
