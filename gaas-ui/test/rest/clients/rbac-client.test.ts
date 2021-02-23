import { IAuthClient } from '../../../src/rest/clients/authclient';
import { RbacClient } from '../../../src/rest/clients/rbac-client';

const rbacClient: IAuthClient = new RbacClient();

describe('RBAC Client', () => {
    it('should throw not implemented error when login is called', () => {
        expect(() =>
            rbacClient.login(
                'username',
                'password',
                () => {},
                () => {}
            )
        ).toThrow(new Error('Method not implemented.'));
    });
    it('should throw not implemented error when set new password and login function is called', () => {
        expect(() =>
            rbacClient.setNewPasswordAndLogin(
                'username',
                'password',
                'new-password',
                () => {},
                () => {}
            )
        ).toThrow(new Error('Method not implemented.'));
    });
    it('should throw not implemented error when signout is called', () => {
        expect(() =>
            rbacClient.signOut(
                () => {},
                () => {}
            )
        ).toThrow(new Error('Method not implemented.'));
    });
});
