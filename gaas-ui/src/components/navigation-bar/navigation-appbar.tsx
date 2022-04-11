import React, { useEffect, useState } from "react";
import AppRoutes from "./AppRoutes";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
    AppBar,
    Avatar,
    CssBaseline,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import VisibilityIcon from "@material-ui/icons/Visibility";
import LocalLibraryIcon from "@material-ui/icons/LocalLibrary";
import CategoryIcon from "@material-ui/icons/Category";
import LoginModal from "../login/login-modal";
import { NavLink } from "react-router-dom";
import { Config } from "../../rest/config";
import { GetWhoAmIRepo } from "../../rest/repositories/get-whoami-repo";
import { GaaSRestApiErrorResponse } from "../../rest/http-message-interfaces/error-response-interface";
import { AuthSidecarClient } from "../../rest/clients/auth-sidecar-client";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        closeButton: {
            position: "absolute",
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            marginRight: 20,
            flexGrow: 1,
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        icon: {
            color: "#696666",
            margin: "20px",
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerContainer: {
            overflow: "auto",
        },
        // necessary for content to be below app bar
        toolbar: theme.mixins.toolbar,
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: "flex-end",
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
            backgroundColor: "#607D8B",
            boxShadow: "0px 0px 0px 0px",
            zIndex: theme.zIndex.drawer + 1,
        },
        listItem: {
            color: "#696666",
        },
        listItemText: {
            "& span, & svg": {
                fontSize: "20px",
            },
        },
        button: {
            textTransform: "none",
        },
    })
);

const NavigationAppbar: React.FC = (props: any) => {
    // @ts-ignore
    const classes = useStyles();
    const [userEmail, setUserEmail] = useState("");
    const [requiredFields, setRequiredFields] = useState<Array<string>>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const getSideNavIcon = (sidebarName: string) => {
        switch (sidebarName) {
            case "Create Graph":
                return <AddCircleOutlineIcon />;
            case "View Graphs":
                return <VisibilityIcon />;
            case "Cluster Namespaces":
                return <CategoryIcon />;
            case "User Guide":
                return <LocalLibraryIcon />;

            default:
                return null;
        }
    };
    const getUserEmail = async () => {
        try {
            const email = await new GetWhoAmIRepo().getWhoAmI();
            setUserEmail(email);
        } catch (e) {
            setErrorMessage(
                `Failed to get user email: ${(e as GaaSRestApiErrorResponse).title}: ${
                    (e as GaaSRestApiErrorResponse).detail
                }`
            );
        }
    };
    const getWhatAuth = async () => {
        try {
            const whatAuthInfo = await new AuthSidecarClient().getWhatAuth();
            setRequiredFields(whatAuthInfo.requiredFields);
        } catch (e) {
            setErrorMessage(`Failed to setup Login`);
        }
    };

    const buildUsername = () => (userEmail.includes("@") ? userEmail.slice(0, userEmail.indexOf("@")) : userEmail);
    useEffect(() => {
        if (Config.REACT_APP_API_PLATFORM === "OPENSHIFT") {
            getUserEmail();
        }
        getWhatAuth();
    }, []);
    const displayUserEmail = () => {
        if (userEmail) {
            return (
                <ListItem className={classes.listItem}>
                    <ListItemAvatar>
                        <Avatar style={{ color: "#ffffff", backgroundColor: "#5A7C81" }}>
                            {userEmail.slice(0, 1)}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        id="signedin-user-details"
                        primary={buildUsername().toUpperCase()}
                        secondary={userEmail}
                    />
                </ListItem>
            );
        } else {
            return (
                <ListItem className={classes.listItem}>
                    <ListItemText id="user-details-error-message" secondary={errorMessage} />
                </ListItem>
            );
        }
    };
    return (
        <div className={classes.root} aria-label={"navigation-appbar"}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar} id={"main-appbar"} aria-label={"main-appbar"}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Kai: Graph As A Service
                    </Typography>
                    {requiredFields.length > 0 && <LoginModal onLogin={(username) => setUserEmail(username)} />}
                </Toolbar>
            </AppBar>

            <nav className={classes.drawer}>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    id={"navigation-drawer"}
                    aria-label={"navigation-drawer"}
                >
                    <Toolbar />
                    <div className={classes.drawerContainer}>
                        <List id={"navigation-drawer-list"} aria-label={"navigation-drawer-list"}>
                            {displayUserEmail()}
                        </List>
                        <Divider />
                        <List>
                            {AppRoutes.map((route: any) => (
                                <NavLink
                                    to={route.path}
                                    style={{ color: "inherit", textDecoration: "inherit" }}
                                    key={route.key}
                                >
                                    <ListItem className={classes.listItem} selected={route.path}>
                                        <ListItemIcon>{getSideNavIcon(route.sidebarName)}</ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.listItemText }}
                                            primary={route.sidebarName}
                                        />
                                    </ListItem>
                                </NavLink>
                            ))}
                        </List>
                        <Divider />
                    </div>
                </Drawer>
            </nav>
        </div>
    );
};

export default NavigationAppbar;
