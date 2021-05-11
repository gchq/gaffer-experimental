import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import Zoom from "@material-ui/core/Zoom";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import React from "react";
import { Graph } from "../../domain/graph";

interface IProps {
    row: Graph;
    index: number;
    onClickDelete(graphId: string):void;
}

export function MainGraphTableRow(props: IProps) {
    const { row, index, onClickDelete } = props;
    const [open, setOpen] = React.useState(false);
    const classes = useRowStyles();

    return (
      <React.Fragment>
        <TableRow className={classes.root} hover>
            <TableCell>
                <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
            <TableCell component="th" scope="row">{row.getId()}</TableCell>
            <TableCell><StatusChip status={row.getStatus()} /></TableCell>
            <TableCell><a href={row.getUrl()} target="_blank" rel="noreferrer">{row.getUrl()}</a></TableCell>
            <TableCell>
                <Tooltip TransitionComponent={Zoom} title={`Delete ${row.getId()}`}>
                    <IconButton
                        id={"view-graphs-delete-button-" + index}
                        onClick={async () => onClickDelete(row.getId())}
                    >
                        <DeleteOutlineOutlinedIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Typography variant="h6" gutterBottom component="div">
                  Details
                </Typography>
                <Table size="small" aria-label="grapg-details">
                <TableHead>
                    <TableRow>
                        <TableCell>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell component="th" scope="row">{row.getDescription()}</TableCell>
                    </TableRow>
                </TableBody>
              </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
}

function StatusChip(props: { status: string }) {
    return (props.status === "UP") ? <Chip icon={<CheckRoundedIcon />} label={props.status} /> : <Chip icon={<WarningRoundedIcon />} label={props.status} color="secondary" />;
}

const useRowStyles = makeStyles({
root: {
    "& > *": {
    borderBottom: "unset",
    },
},
});
