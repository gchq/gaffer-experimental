import { IAuthClient } from './authclient';

export class RbacClient implements IAuthClient {
    public login(username: string, password: string, onSuccess: Function, onError: Function): void {
        throw new Error('Method not implemented.');
    }

    public setNewPasswordAndLogin(
        username: string,
        tempPassword: string,
        newPassword: string,
        onSuccess: Function,
        onError: Function
    ): void {
        throw new Error('Method not implemented.');
    }

    public signOut(onSuccess: Function, onError: Function): void {
        throw new Error('Method not implemented.');
    }
}
