

// {/* <Grid
//             item
//             xs={12}
//             container
//             direction="row"
//             justify="flex-end"
//             alignItems="center"
//           >
//             {/* <Tooltip TransitionComponent={Zoom} title="Add Schema From File">
//               <IconButton id="attach-file-button" onClick={openDialogBox}>
//                 <AttachFileIcon />
//               </IconButton>
//             </Tooltip> */}
//             {/* <Tooltip TransitionComponent={Zoom} title="Clear Schema">
//               <IconButton
//                 onClick={() =>
//                   this.setState({
//                     schemaJson: "",
//                   })
//                 }
//               >
//                 <ClearIcon />
//               </IconButton>
//             </Tooltip> */}

//             <Dialog
//               id="dropzone"
//               open={this.state.dialogIsOpen}
//               TransitionComponent={Transition}
//               keepMounted
//               onClose={closeDialogBox}
//               style={{ minWidth: "500px" }}
//               aria-labelledby="alert-dialog-slide-title"
//               aria-describedby="alert-dialog-slide-description"
//             >
//               <Grid container direction="row" justify="flex-end" alignItems="flex-start">
//                 <IconButton id="close-dropzone-button" onClick={closeDialogBox}>
//                   <ClearIcon />
//                 </IconButton>
//               </Grid>

//               <DialogContent>
//                 <Grid id="elements-drop-zone">
//                   <DropzoneArea
//                     showPreviews={true}
//                     onChange={async (files) => this.uploadElementsFiles(files)}
//                     showPreviewsInDropzone={false}
//                     dropzoneText="Drag and drop elements.JSON"
//                     useChipsForPreview
//                     previewGridProps={{
//                       container: { spacing: 1, direction: "row" },
//                     }}
//                     previewChipProps={{
//                       classes: { root: this.classes.previewChip },
//                     }}
//                     previewText="Selected files"
//                     clearOnUnmount={true}
//                     acceptedFiles={["application/json"]}
//                     filesLimit={1}
//                   />
//                 </Grid>
//                 <Grid id="types-drop-zone">
//                   <DropzoneArea
//                     showPreviews={true}
//                     onChange={async (files) => this.uploadTypesFiles(files)}
//                     showPreviewsInDropzone={false}
//                     dropzoneText="Drag and drop types.JSON"
//                     useChipsForPreview
//                     previewGridProps={{
//                       container: { spacing: 1, direction: "row" },
//                     }}
//                     previewChipProps={{
//                       classes: { root: this.classes.previewChip },
//                     }}
//                     previewText="Selected files"
//                     clearOnUnmount={true}
//                     acceptedFiles={["application/json"]}
//                     filesLimit={1}
//                   />
//                 </Grid>
//               </DialogContent>
//             </Dialog>
//           </Grid> */}