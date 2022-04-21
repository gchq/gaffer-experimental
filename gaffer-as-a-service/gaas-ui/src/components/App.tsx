/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

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
