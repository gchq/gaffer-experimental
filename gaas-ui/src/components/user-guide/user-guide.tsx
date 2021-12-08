import { Box, Button, Card, CardActions, CardContent, Grid, Toolbar, Typography } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import React from "react";
import ReactJson from "react-json-view";
import { Copyright } from "../copyright/copyright";
import { exampleElementsSchema } from "./example-elements-schema";
import { exampleTypesSchema } from "./example-types-schema";

export default class UserGuide extends React.Component<{}, {}> {
    public render() {
        return (
            <main aria-label="User-Guide-Page">
                <Toolbar />
                <Grid container justify="center" style={{ marginTop: 30 }}>
                    <Card style={{ maxWidth: 800 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                Create Graphs
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                When creating a new graph you need a unique Graph Name, an Elements Schema and a Types
                                Schema. Type in a unique name in the Graph Name text field.
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                Type in the elements in the Schema Elements JSON textarea.
                            </Typography>
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                Type in the types in the Schema Types JSON textarea.
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                You can import elements and types by clicking the document icon. For either elements or
                                types, you can only import a single JSON file. You can remove your uploaded files by
                                clicking on the clear icon next to the name of your file in the selected files section.
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                Once you exit the dialog box, your imported elements and types will appear in the
                                elements and types textareas. You can edit the imported elements or types by typing in
                                the elements or types textarea.
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                Click Create Graph to add your graph. If your elements or types are invalid, it will
                                give you an error.
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                Note: Make sure your elements and types are surrounded by curly brackets(
                                {"{}"}).
                            </Typography>
                            <Box my={3} />
                            <Typography gutterBottom variant="h5" component="h2">
                                View Graphs
                            </Typography>
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                View your graphs in the View Graphs section.
                            </Typography>
                            <Box my={3} />
                            <Typography gutterBottom variant="h5" component="h2">
                                Elements and Types
                            </Typography>
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                An Elements Schema and a Types Schema is merged to form a Full Schema.
                            </Typography>
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                Example Schema Elements:
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                The Elements schema is made of edges and entities:
                            </Typography>
                            <Box my={1} />
                            <div id="example-elements-schema">
                                <ReactJson
                                    name={false}
                                    src={exampleElementsSchema}
                                    theme="bright"
                                    collapsed={false}
                                    displayDataTypes={false}
                                    displayObjectSize={false}
                                />
                            </div>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                Example Schema Types:
                            </Typography>
                            <Box my={1} />
                            <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                The Types schema is made of types:
                            </Typography>
                            <Box my={1} />
                            <div id="example-types-schema">
                                <ReactJson
                                    name={false}
                                    collapsed={false}
                                    src={exampleTypesSchema}
                                    theme="bright"
                                    displayDataTypes={false}
                                    displayObjectSize={false}
                                />
                            </div>
                            <Box my={3} />
                            <Grid id={"schema-builder-tutorial"}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Schema Builder
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    This feature is in the Create Graph section below the Graph Id, Description and
                                    Storetype. Click the Schema Builder button to access this feature.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    The Schema builder allows you to build your elements and types schemas.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Required fields are indicated by *.
                                </Typography>
                                <Box my={1} />
                                <Typography gutterBottom variant="h5" component="h3">
                                    Types Schema
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Click on Add Type.
                                </Typography>
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    The following fields are mandatory: Type Name, Description, and Class. The following
                                    fields are optional: Aggregate Function, Serialiser, and Validate Functions.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    For Aggregate Function, Serialiser, and Validate Functions, you can either type in
                                    the text areas or click on the buttons for an easier way to build them.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    In Validate Functions, hover over the JSON viewer and click the plus button to add
                                    values. You can also edit or delete any values you've added (hover to access this
                                    functionality).
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    In Validate Functions, you can add multiple key value pairs. Each pair you add will
                                    appear in the table. You can delete the key value pair by clicking the delete icon.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Once you have filled out the details for the type, click Add Type. You can add
                                    another type or exit the dialogue to view your Types Schema.
                                </Typography>
                                <Box my={1} />
                                <Typography gutterBottom variant="h5" component="h3">
                                    Elements Schema
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    The elements schema can only be built after adding Types using the Add-Type
                                    functionality.
                                </Typography>
                                <Box my={1} />
                                <Typography gutterBottom variant="h5" component="h4">
                                    Edges
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Click Add Edge
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    The following fields are mandatory: Edge Name, Description, Source, Destination,
                                    Directed. The following fields are optional: Property, GroupBy.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    For Properties and Group By, you can either type in the text areas or click on the
                                    buttons for an easier way to build them.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Once you have filled out the details for the Edge, click Add Edge. You can add
                                    another Edge or exit the dialogue to view the Edge added to your Elements Schema.
                                </Typography>
                                <Box my={1} />
                                <Typography gutterBottom variant="h5" component="h4">
                                    Entities
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Click Add Entity
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    The following fields are mandatory: Entity Name, Description and Vertex. The
                                    property field is optional.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    For Properties, you can either type in the text areas or click on the buttons for an
                                    easier way to build them.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Once you have filled out the details for the Entity, click Add Entity. You can add
                                    another Entity or exit the dialogue to view the Entity added to your Elements
                                    Schema.
                                </Typography>
                                <Box my={1} />
                                <Typography gutterBottom variant="h5" component="h2">
                                    Schema Builder Notes
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    If you import Elements and/or Types schemas or use the Schema Elements JSON/ Schema
                                    Types JSON text areas in Create Graph, you can still access these in the Schema
                                    Builder.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    After importing or using the text areas, you can use the Schema Builder to edit or
                                    build upon what you already have. So, if you make changes to the Schemas in the
                                    Schema Builder, you will be using the updated version when you create a graph.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    In the Schema Builder, the section that displays the Elements and Types Schema is
                                    interactive. You can Edit, Delete or Copy. To access this functionality, hover your
                                    mouse over the schemas section.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    You can use the Schema Builder to build a Types Schema only. The Create Schema
                                    button is activated once you have made a Types Schema.
                                </Typography>
                                <Box my={1} />
                                <Typography variant="body1" style={{ color: "#0000000" }} component="p">
                                    Since an Elements Schema requires Types, you need to have a Types Schema to build
                                    one. You can do this by importing, typing in the Schema Types JSON text area in
                                    Create Graph or using Add Types in the Schema Builder.
                                </Typography>
                            </Grid>
                        </CardContent>

                        <CardActions style={{ justifyContent: "center" }}>
                            <Button
                                id="gaffer-documentation-button"
                                startIcon={<GitHubIcon />}
                                variant="contained"
                                color="primary"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://gchq.github.io/gaffer-doc/summaries/getting-started.html"
                            >
                                Gaffer Documentation
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Box pt={4}>
                    <Copyright />
                </Box>
            </main>
        );
    }
}
