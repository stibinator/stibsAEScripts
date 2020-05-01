/* jshint ignore:start */
// Code here will be ignored by JSHint.
/// @includepath "./(lib)"
/// @include "spacetransforms.jsx"
/// @include "vectormaths.jsx"
/* jshint ignore:end */
recurseParents = false; //true;
bakeAllMotion = false;
app.beginUndoGroup("unparent");
var theComp = app.project.activeItem;
var theLayers = theComp.selectedLayers;
var posNull = makeTempNull(app.project.activeItem);
var currTime = app.project.activeItem.time;

for (var i = 0; i < theLayers.length; i++) {
    var currLayer = theLayers[i];
    var pos = currLayer.transform.position;
    //if the unparenting isn't happening on a keyframe we need to make a new keyframe
    var posKeys = [];
    var rot = currLayer.transform.rotation;
    var rotKeys = [];
    var scale = currLayer.transform.scale;
    var scaleKeys = [];

    var theParent = currLayer.parent;
    //find theParent
    if (theParent) {
        var currPos = toWorldPos(currLayer, currLayer.transform.anchorPoint.valueAtTime(currTime, true), currTime, posNull);
        var currRot = toWorldRotation(currLayer, currTime);
        var currScale = toWorldScale(currLayer, currTime);
        //there may be a grandparent
        theGrandParent = theParent.parent;
        //get the world transforms of the layer at each keyframe
        var nearestFrameToIn = Math.floor(currLayer.inPoint / theComp.frameDuration) * theComp.frameDuration;
        if (bakeAllMotion) {
            for (var t = nearestFrameToIn; t <= currLayer.outPoint; t += theComp.frameDuration) {
                var worldPos = toWorldPos(currLayer, currLayer.transform.anchorPoint.valueAtTime(t, true), t, posNull);
                posKeys.push(worldPos);
                var worldRot = toWorldRotation(currLayer, t);
                rotKeys.push(worldRot);
                var worldScale = toWorldScale(currLayer, t);
                scaleKeys.push(worldScale);
            }
        } else {
            for (var k = 1; k <= pos.numKeys; k++) {
                var t = pos.keyTime(k);
                var worldPos = toWorldPos(currLayer, currLayer.transform.anchorPoint.valueAtTime(t, true), t, posNull);
                posKeys.push(worldPos);
            }
            for (var k = 1; k <= rot.numKeys; k++) {
                var t = rot.keyTime(k);
                var worldRot = toWorldRotation(currLayer, t);
                rotKeys.push(worldRot);
            }
            for (var k = 1; k <= scale.numKeys; k++) {
                var t = scale.keyTime(k);
                var worldScale = toWorldScale(currLayer, t);
                scaleKeys.push(worldScale);
            }
        }

        //goodby mum and dad
        currLayer.parent = (theGrandParent && recurseParents)
            ? theGrandParent
            : null;
        //now set the transforms for the new setup
        //pos
        for (var k = 0; k < posKeys.length; k++) {
            //k+1 to deal with adobe's weird 1-based indexing
            var t = pos.keyTime(k + 1);
            pos.setValueAtTime(t, posKeys[k]);
        }
        //make an additional keyframe if the playhead isn't currently on a keyframe
        //or set the value if no keyframes are set for this property
        if (posKeys.length > 0) {
            pos.setValueAtTime(currTime, currPos);
        } else {
            pos.setValue(currPos);
        }
        //rot
        for (var k = 0; k < rotKeys.length; k++) {
            var t = rot.keyTime(k + 1);
            rot.setValueAtTime(t, rotKeys[k]);
        }
        //make an additional keyframe if the playhead isn't currently on a keyframe
        //or set the value if no keyframes are set for this property
        if (rotKeys.length > 0) {
            rot.setValueAtTime(currTime, currRot);
        } else {
            rot.setValue(currRot);
        }
        //scale
        for (var k = 0; k < scaleKeys.length; k++) {
            var t = scale.keyTime(k + 1);
            scale.setValueAtTime(t, scaleKeys[k]);
        }
        //make an additional keyframe if the playhead isn't currently on a keyframe
        //or set the value if no keyframes are set for this property
        if (scaleKeys.length > 0) {
            scale.setValueAtTime(currTime, currScale);
        } else {
            scale.setValue(currScale);
        }

    }
}

removeTempNull(posNull);
app.endUndoGroup();
