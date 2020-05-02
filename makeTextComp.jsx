/* @target aftereffects */

/* @includepath "./(lib)"
 @include  "getproperties.jsx"
 @include "incrementCompName.jsx" */

/* global app, TextLayer, makeUniqueCompName */


app.beginUndoGroup("preCompText");
var currentComp = app.project.activeItem;
var currentTextLayers = currentComp.selectedLayers;
for (var i =0; i < currentTextLayers.length; i++){
    if (currentTextLayers[i] instanceof TextLayer){
        var theText = currentTextLayers[i];
        var posEffect = theText.Effects.addProperty('Point Control');
        posEffect.name = 'temp-delete';
        posEffect.property('Point').expression = '[sourceRectAtTime(t = time, includeExtents = true).width, sourceRectAtTime(t = time, includeExtents = true).height]';
        var dimensions = posEffect.property('Point').valueAtTime(0, false);
        posEffect.remove();
        var theName = makeUniqueCompName(theText.name + '_preComp');
        var newComp = app.project.items.addComp(theName, Math.round(dimensions[0]), Math.round(dimensions[1]), currentComp.pixelAspect, currentComp.duration, currentComp.frameRate);
        newComp.layers.addText(theText.sourceText);
    }
}
app.endUndoGroup();