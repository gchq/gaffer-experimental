import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
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
      <React.Fragment >
        <TableRow className={classes.root} hover aria-label={"view-graphs-table"}>
            <TableCell aria-label={"expand-row-icon"}>
                <IconButton id={"expand-row-button-" + index}
                            aria-label={row.getId()+"-expand-button"} size="small" onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
            <TableCell component="th" scope="row" aria-label={"row-id"}>{row.getId()}</TableCell>
            <TableCell aria-label={"graph-store-type"}><Avatar style={{color: "white", backgroundColor:"#5A7C81"}}> {row.getStoreType()}</Avatar></TableCell>
            <TableCell aria-label={"graph-status"}><StatusChip status={row.getStatus()} /></TableCell>
            <TableCell aria-label={"graph-url"}><a href={row.getUrl()} target="_blank" rel="noreferrer">{row.getUrl()}</a></TableCell>
            <TableCell aria-label={"delete-graph"}>
                <Tooltip TransitionComponent={Zoom} title={`Delete ${row.getId()}`}>
                    <IconButton
                        id={"view-graphs-delete-button-" + index}
                        aria-label={row.getId()+"-delete-button"}
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
                <Table size="small" aria-label="graph-details">
                <TableBody>
                    <TableRow aria-label={"graph-description"}>
                        <TableCell component="th" scope="row">Description: {row.getDescription()}</TableCell>
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
    return (props.status === "UP") ? <Chip icon={<CheckRoundedIcon style={{color: "#ffffff"}}/>} label={props.status} style={{color: "#ffffff", backgroundColor:"#5A7C81"}} /> : <Chip icon={<WarningRoundedIcon style={{color: "#ffffff"}}/>} label={props.status} style={{ color: "#ffffff",backgroundColor: "#EB0052"}} />;
}

const useRowStyles = makeStyles({
root: {
    "& > *": {
    borderBottom: "unset",
    },
},
});
