import React from 'react';
import { Button, Card, CardActions, CardContent, Grid, makeStyles, Toolbar, Typography } from '@material-ui/core';
import ReactJson from 'react-json-view';
import GitHubIcon from '@material-ui/icons/GitHub';
import { exampleElementsSchema } from './example-elements-schema';
import { exampleTypesSchema } from './example-types-schema';

export default class UserGuide extends React.Component<{}, {}> {
    constructor(props: object) {
        super(props);
    }

    private classes: any = makeStyles((theme) => ({
        root: {
            width: '100%',
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
        },
        card: {
            maxWidth: 345,
        },
    }));

    public render() {
        return (
            <main>
                <Toolbar />
                <Grid container justify="center" className={this.classes.root} style={{ marginTop: 30 }}>
                    <Card className={this.classes.card} style={{ maxWidth: 800 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                Add Graphs
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                When creating a new graph you need a unique Graph Name, an Elements Schema and a Types
                                Schema. Type in a unique name in the Graph Name text field.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Type in the elements in the Schema Elements JSON textarea.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Type in the types in the Schema Types JSON textarea.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                You can import elements and types by clicking the document icon. For either elements or
                                types, you can only import a single JSON file. You can remove your uploaded files by
                                clicking on the clear icon next to the name of your file in the selected files section.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Once you exit the dialog box, your imported elements and types will appear in the
                                elements and types textareas. You can edit the imported elements or types by typing in
                                the elements or types textarea.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Click Add Graph to add your graph. If your elements or types are invalid, it will give
                                you an error.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Note: Make sure your elements and types are surrounded by curly brackets(
                                {'{}'}).
                            </Typography>
                        </CardContent>

                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                View Graphs
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                View your graphs in the View Graphs section.
                            </Typography>
                        </CardContent>

                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                Elements and Types
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                An Elements Schema and a Types Schema is merged to form a Full Schema.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Example Schema Elements:
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                The Elements schema is made of edges and entities, as shown below.
                            </Typography>
                            <div id="example-elements-schema">
                                <ReactJson
                                    src={exampleElementsSchema}
                                    theme="summerfruit:inverted"
                                    displayDataTypes={false}
                                    displayObjectSize={false}
                                />
                            </div>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Example Schema Types:
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                The Types schema is made of types, as shown below.
                            </Typography>
                            <div id="example-types-schema">
                                <ReactJson
                                    src={exampleTypesSchema}
                                    theme="summerfruit:inverted"
                                    displayDataTypes={false}
                                    displayObjectSize={false}
                                />
                            </div>
                        </CardContent>

                        <CardActions style={{ justifyContent: 'center' }}>
                            <Button
                                id="gaffer-documentation-button"
                                startIcon={<GitHubIcon />}
                                variant="contained"
                                color="primary"
                                target="_blank"
                                href="https://gchq.github.io/gaffer-doc/summaries/getting-started.html"
                            >
                                Gaffer Documentation
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </main>
        );
    }
}
