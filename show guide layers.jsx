/* @target AfterEffects */
/* global app, CompItem*/
app.beginUndoGroup("show Guide layers");
var theComp = app.project.activeItem;
if (theComp instanceof CompItem){
    for (var i = 1; i <= theComp.numLayers; i++){
        if (theComp.layer(i).guideLayer){theComp.layer(i).enabled = true;
        }
    }   
}
app.endUndoGroup();