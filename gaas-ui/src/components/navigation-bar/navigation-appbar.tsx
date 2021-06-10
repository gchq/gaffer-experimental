import React, { useState } from "react";
import { NavLink, withRouter } from "react-router-dom";
import Routes from "./Routes";
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
    const [username, setUsername] = useState("");

    const activeRoute = (routeName: string) => props.location.pathname === routeName;

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

    const buildUsername = () => (username.includes("@") ? username.slice(0, username.indexOf("@")) : username);

    return (
        <div className={classes.root} aria-label={"navigation-appbar"}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar} id={"main-appbar"} aria-label={"main-appbar"}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Kai: Graph As A Service
                    </Typography>
                    <LoginModal onLogin={(username) => setUsername(username)} />
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
                        <List
                            id={"navigation-drawer-list"}
                            aria-label={"navigation-drawer-list"}
                        >
                            <ListItem className={classes.listItem}>
                                <ListItemAvatar>
                                    <Avatar style={{color: "#ffffff", backgroundColor:"#5A7C81"}}>{username.slice(0, 1)}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    id="signedin-user-details"
                                    primary={buildUsername()}
                                    secondary={username}
                                />
                            </ListItem>
                        </List>
                        <Divider />
                        <List >
                            {Routes.map((prop, key) => (
                                <NavLink
                                    to={prop.path}
                                    style={{ color: "inherit", textDecoration: "inherit" }}
                                    key={key}
                                >
                                    <ListItem className={classes.listItem} selected={activeRoute(prop.path)}>
                                        <ListItemIcon>{getSideNavIcon(prop.sidebarName)}</ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.listItemText }}
                                            primary={prop.sidebarName}
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

export default withRouter(NavigationAppbar);
