import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Routes from "./navigation-bar/Routes";
import NavigationAppbar from "./navigation-bar/NavigationAppbar";

function App() {
    return (
        <div style={{ display: "flex" }}>
            <NavigationAppbar />
            <Switch>
                <Redirect exact from="/" to="/AddGraph" />
                {Routes.map((route: any) => (
                    <Route exact path={route.path} key={route.path}>
                        <route.component />
                    </Route>
                ))}
            </Switch>
        </div>
    );
}

export default App;
