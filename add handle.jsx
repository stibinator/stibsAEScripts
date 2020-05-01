/* global app */
//add a handle to all unparented layers
//@target aftereffects
function addHandleNull(theLayer, theHandle) {
    if (theLayer){
        if (! theLayer.parent) {
            theLayer.parent = theHandle;
        }
    }
}

function addCompHandle() {
    var proj = app.project;
    var scriptName = "create handle";
    var existingLayers = [];
    // change this to true if you want to leave locked layers untouched.
    var unlockedOnly = false;
    if (proj) {

        var comp = app.project.activeItem;
        if (comp) {
            //make a separate array containing all the layers
            //to avoid weirdness when we add a null
            var theLayers = comp.selectedLayers;
            if (theLayers.length > 0) {
            //use selected layers if some layers are selected,
                for (var i = 0; i < theLayers.length; i++) {
                    existingLayers.push(theLayers[i]);
                }
            } else {
                // use all if not
                for (var i = 1; i <= comp.layers.length; i++) {
                    existingLayers.push(comp.layers[i]);
                }
            }
            //here comes the hoo-ha:
            app.beginUndoGroup(scriptName);
            //make the handle layer
            var theHandle = comp.layers.addNull();
            theHandle.name = "comp handle";
            //loop through and parent the layers to the handle
            for (var i = 0; i < existingLayers.length; i++) {
                if ((unlockedOnly && (!existingLayers[i].locked)) | (!unlockedOnly)) {
                    addHandleNull(existingLayers[i], theHandle);
                }
            }
            //thus ends the hoo-ha
            app.endUndoGroup();
        } else {
            alert("Please select a comp to use this script", scriptName);
        }
    } else {
        alert("Please open a project first to use this script, you silly rabbit", scriptName);
    }
}

addCompHandle();
