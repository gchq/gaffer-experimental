import { Box } from "@material-ui/core";
import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import NavigationAppbar from "./navigation-bar/navigation-appbar";
import Routes from "./navigation-bar/Routes";

function App() {
    return (
            <Box display="flex"
                 justifyContent="center"
                 flexDirection="row"
                 alignItems="center"
                 id={"kai-main-component"}
                 aria-label={"kai-main-component"}
            >
                <Box display="flex" alignSelf="left" id={"navigation-appbar-and-drawer"}>
                    <NavigationAppbar />
                </Box>
                <Box display="flex" alignSelf="right" alignItems="right" justifyContent="right">
                    <Switch>
                        <Redirect exact from="/" to="/graphs" />
                        {Routes.map((route: any) => (
                            <Route exact path={route.path} key={route.path}>
                                <route.component />
                            </Route>
                        ))}
                    </Switch>
                </Box>

            </Box>

    );
}

export default App;
