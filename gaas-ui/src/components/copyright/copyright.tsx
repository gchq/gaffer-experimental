import Typography from "@material-ui/core/Typography";
import React from "react";

export function Copyright() {
    return (
        <Typography variant="body1" color="textSecondary" align="center">
            {"Copyright © "}
            {new Date().getFullYear()} Crown Copyright.
        </Typography>
    );
}
