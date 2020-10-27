/* @target aftereffects */
/* global app, Panel, Shape*/

var scriptName = "points-n-handles";
// var USE_NATIVE_HANDLES = true;
var ERR_NO_PATHS = "<!> Select at least\none pathNo to control";
var ERR_CONVERT_SHAPES = "Convert shape items to Bezier paths\nbefore using.";
var RESULT_PTS_CREATED = " points were created on layer\n";
// var HELP_LAYERHANDLES = "Use new layers to control the pathNo.\nUse the layer transform tools to edit.";
// var HELP_NATIVECTRLS = "Use native shape layer controls to control the pathNo.\nAllows you to use the pen tool to edit.";
var TXT_DOTHETHINGSBTN = "Create Path Controls";
// var TXT_METHOD_PANEL = "Method";
// var TXT_NATIVECTRLS = "native point controls";
// var TXT_LAYERHANDLES = "handle layers";
var TXT_NEWCTRLBTN = "New point";
var NAME_CONTROL_GROUP = " control points";

function buildUI(thisObj) {
    // DIALOG
    // ======
    var pal = thisObj;
    if (!(pal instanceof Panel)) {
        pal = new Window('palette', scriptName, undefined, {
            resizeable: true
        });
    }

    if (pal !== null) {

        pal.text = "points-n-handles";
        pal.orientation = "column";
        pal.alignChildren = ["center", "top"];
        pal.spacing = 10;
        pal.margins = 16;

        var doTheThingsBtn = pal.add("button", undefined, undefined);
        doTheThingsBtn.name = "doTheThingsBtn";
        doTheThingsBtn.text = TXT_DOTHETHINGSBTN;

        // methodPanel
        // ======
        // var methodPanel = pal.add("panel", undefined, undefined);
        // methodPanel.text = TXT_METHOD_PANEL;
        // methodPanel.orientation = "column";
        // methodPanel.alignChildren = ["left", "top"];
        // methodPanel.spacing = 10;
        // methodPanel.margins = 10;

        // METHODGRP
        // =========
        // var methodGrp = methodPanel.add("group", undefined);
        // methodGrp.orientation = "column";
        // methodGrp.alignChildren = ["left", "center"];
        // methodGrp.spacing = 10;
        // methodGrp.margins = 0;

        // var nativeCtrls = methodGrp.add("radiobutton", undefined, undefined);
        // nativeCtrls.name = "nativeCtrls";
        // nativeCtrls.helpTip = HELP_NATIVECTRLS
        // nativeCtrls.text = TXT_NATIVECTRLS;
        // nativeCtrls.value = true;

        // var layerHandles = methodGrp.add("radiobutton", undefined, undefined);
        // layerHandles.name = "layerHandles";
        // layerHandles.helpTip = HELP_LAYERHANDLES
        // layerHandles.text = TXT_LAYERHANDLES;

        var newCtrlBtn = pal.add("button", undefined, undefined);
        newCtrlBtn.name = "newCtrlBtn";
        newCtrlBtn.text = TXT_NEWCTRLBTN;

        var infoText = pal.add("statictext", undefined, undefined);
        infoText.text = "";
        infoText.alignment = ["left", "top"];
        infoText.preferredSize.width = 200;
        infoText.preferredSize.height = 100;

        doTheThingsBtn.onClick = function() {
            app.beginUndoGroup(scriptName);
            if (app.project && app.project.activeItem) {
                var theLayers = app.project.activeItem.selectedLayers;
                infoText.text = "";
                for (var lyr = 0; lyr < theLayers.length; lyr++) {
                    var result = createPathControls(theLayers[lyr]);// nativeCtrls.value);
                    infoText.text += [result.converted + RESULT_PTS_CREATED + theLayers[lyr].name, result.warnings.join("\n")].join("\n");
                }
            } else {
                infoText.text = ERR_NO_PATHS
            }
            app.endUndoGroup();
        };
        pal.show();
    }



}

function createPathControls(theLayer){ //}, method) {
    var props = [];
    for (var prop = 0; prop < theLayer.selectedProperties.length; prop++) {
        props.push(theLayer.selectedProperties[prop]);
    }
    var result = {
        "converted": 0,
        "warnings": []
    };


    var thePaths = [];
    for (var p = 0; p < props.length; p++) {
        if (props[p].matchName === "ADBE Vector Shape - Group") {
            var shapeGrp = props[p].parentProperty.parentProperty; //the "content" property of a shape is elided
            // hence two layers up
            var xformGrp = shapeGrp.property("ADBE Vector Transform Group");
            var xformArr = [];
            for (var t = 1; t < xformGrp.numProperties; t++) {
                xformArr.push(xformGrp.property(t).value);
            }
            var thePath = {
                "shape": props[p].property("ADBE Vector Shape").value,
                "xform": xformArr,
                "shapeName": shapeGrp.name,
                "pathName": props[p].name,
                "parentLayer": theLayer
            };
            thePaths.push(thePath);
            result.converted++;
        } else if (props[p].matchName.match(/ADBE Vector Shape - (Star|Rect|Ellipse)/)) {
            result.warnings.push(ERR_CONVERT_SHAPES);
        }
    }
    for (var pathNo = 0; pathNo < thePaths.length; pathNo++) {
        var newExpression;
        // if (method === USE_NATIVE_HANDLES) {
            newExpression = makeNativePoint(thePaths[pathNo]);
        // } else {
        //     newExpression = makeControlLayers(thePath);
        // }
        theLayer.selectedProperties[pathNo].property("ADBE Vector Shape").expression = newExpression;
    }
    return result;
}

function makeNativePoint(thePath) {
    var newGroup = thePath.parentLayer.property("Contents").addProperty("ADBE Vector Group");
    newGroup.name = thePath.pathName + NAME_CONTROL_GROUP;
    for (var t = 0; t < thePath.xform.length; t++) {
        //the transfroms property group is 1-indexed, hence property(t+1)
        newGroup.property("ADBE Vector Transform Group").property(t + 1).setValue(thePath.xform[t]);
    }
    //step through all the verts in the pathNo
    var ctrlsExpression = [];
    for (var v = 0; v < thePath.shape.vertices.length; v++) {
        var newPoint = new Shape();
        newPoint.vertices = [thePath.shape.vertices[v]];
        newPoint.inTangents = [thePath.shape.inTangents[v]];
        newPoint.outTangents = [thePath.shape.outTangents[v]];
        var ctrlPointGrp = newGroup.content.addProperty("ADBE Vector Shape - Group");
        ctrlPointGrp.name = "ctrl " + (v + 1);
        ctrlPointGrp.property("ADBE Vector Shape").setValue(newPoint);
        ctrlsExpression.push("thisLayer.content('"+ newGroup.name+"').content('" + ctrlPointGrp.name + "').path")
    }
    var expression = "let ctrls = [\n" +ctrlsExpression.join(",\n  ") +"\n];\n"; 
    expression += "let pts =[];\n"
    expression += "let inTans =[];\n"
    expression += "let outTans =[];\n"
    expression += "for (i in ctrls){\n"
    expression += "  pts.push(ctrls[i].points()[0]);\n"
    expression += "  inTans.push(ctrls[i].inTangents()[0]);\n"
    expression += "  outTans.push(ctrls[i].outTangents()[0]);\n"
    expression += "}\n" 
    expression += "createPath(pts, inTans, outTans, " + thePath.shape.closed + ")";
    return expression;
}

// function makeControlLayers(thePath) {
//     //step through all the verts in the pathNo
//     var ctrlsExpression = [];
//     for (var v = 0; v < thePath.shape.vertices.length; v++) {
//         var newPointLayer = makeNewShapeLayer(pointHandleSize, thePath.shape.vertices[v], thePath.parentLayer);
//         makeNewShapeLayer(tangentHandleSize, thePath.shape.inTangents[v], newPointLayer);
//         makeNewShapeLayer(tangentHandleSize, thePath.shape.outTangents[v], newPointLayer);
//         ctrlsExpression.push("thisLayer.content('"+ newGroup.name+"').content('" + ctrlPointGrp.name + "').path")
//     }
//     var expression = "let ctrls = [\n" +ctrlsExpression.join(",\n  ") +"\n];\n"; 
//     expression += "let pts =[];\n"
//     expression += "let inTans =[];\n"
//     expression += "let outTans =[];\n"
//     expression += "for (i in ctrls){\n"
//     expression += "  pts.push(ctrls[i].points()[0]);\n"
//     expression += "  inTans.push(ctrls[i].inTangents()[0]);\n"
//     expression += "  outTans.push(ctrls[i].outTangents()[0]);\n"
//     expression += "}\n" 
//     expression += "createPath(pts, inTans, outTans, " + thePath.shape.closed + ")";
//     return expression;
// }
buildUI(this);