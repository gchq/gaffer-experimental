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

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { AppBar, Drawer, IconButton, ListItemText, MenuItem, MenuList, Toolbar, Typography } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            marginRight: 20,
        },
        drawer: {
            width: 240,
        },
        fullList: {
            width: "auto",
            flexDirection: "row",
        },
        appBar: {
            transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        listItem: {},
        listItemText: {
            "& span, & svg": {
                fontSize: "20px",
            },
        },
    })
);

const NavigationDrawer: React.FC = (props: any) => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === "keydown" &&
            ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
        ) {
            return;
        }
        setIsOpen(open);
    };

    const activeRoute = (routeName: any) => props.location.pathname === routeName;

    return (
        <div>
            <div>
                <AppBar
                    position="static"
                    className={classes.appBar}
                    id={"navigation-appbar"}
                    aria-label={"navigation-appbar"}
                >
                    <Toolbar>
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h4"
                            className={classes.title}
                            id={"Kai-main-title"}
                            aria-label={"Kai-main-title"}
                        >
                            Kai
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>

            <Drawer
                classes={{ paper: classes.drawer }}
                open={isOpen}
                onClose={toggleDrawer(false)}
                id={"navigation-drawer"}
                aria-label={"navigation-drawer"}
            >
                <div
                    className={classes.fullList}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <MenuList id={"navigation-drawer-menu-list"} aria-label={"navigation-drawer-menu-list"}>
                        {AppRoutes.map((prop, key) => (
                            <NavLink to={prop.path} style={{ color: "inherit", textDecoration: "inherit" }} key={key}>
                                <MenuItem className={classes.listItem} selected={activeRoute(prop.path)}>
                                    <ListItemText
                                        classes={{ primary: classes.listItemText }}
                                        primary={prop.sidebarName}
                                    />
                                </MenuItem>
                            </NavLink>
                        ))}
                    </MenuList>
                </div>
            </Drawer>
        </div>
    );
};

export default NavigationDrawer;
