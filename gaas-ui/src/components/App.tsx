import { Box } from "@material-ui/core";
import React from "react";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./navigation-bar/AppRoutes";
import NavigationAppbar from "./navigation-bar/navigation-appbar";
import ViewGraph from "./view-graphs/view-graphs";

function App() {
    return (
        <Box
            display="flex"
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
                <Routes>
                    <Route path="/" element={<ViewGraph />} />
                    {AppRoutes.map((route: any) => (
                        <Route path={route.path} key={route.path} element={<route.component />} />
                    ))}
                </Routes>
            </Box>
        </Box>
    );
}

export default App;
