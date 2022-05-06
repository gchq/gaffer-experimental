/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { withStyles } from "@material-ui/core";

const GlobalStyles = withStyles({
    "@global": {
        "*": {
            boxSizing: "border-box",
            margin: 0,
            padding: 0,
        },
        html: {
            "-webkit-font-smoothing": "antialiased",
            "-moz-osx-font-smoothing": "grayscale",
            height: "100%",
            width: "100%",
        },
        body: {
            height: "100%",
            width: "100%",
        },
        "#root": {
            height: "100%",
            width: "100%",
        },
    },
})(() => null);

export default GlobalStyles;