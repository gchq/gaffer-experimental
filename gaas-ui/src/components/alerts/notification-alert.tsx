import React from 'react';
import Alert from '@material-ui/lab/Alert';

export enum AlertType {
    SUCCESS = 'success',
    FAILED = 'error',
}

export interface INotificationAlertProps {
    alertType: AlertType;
    message: string;
}

export class NotificationAlert extends React.Component<INotificationAlertProps> {
    
    public render() {
        return (
            <Alert id='notification-alert' severity={this.props.alertType}>
                {this.props.message}
            </Alert>
        );
    }
}
