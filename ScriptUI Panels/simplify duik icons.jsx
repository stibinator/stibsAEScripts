// @target aftereffects
/* global app, PREFType, Panel*/
function simplifyDuikIcons(
    theLayer,
    defaultOpacity,
    defaultSize,
    deleteIcons,
    deleteAnchors,
    deleteIK,
    makeNewIcons,
    makeNewAnchors,
    anchorBrightness) {
    if (deleteIcons) {
        var icon = theLayer.property("Contents").property("Icon");
        if (icon) {
            icon.remove();
        }
    }
    if (deleteAnchors) {
        var anchor = theLayer.property("Contents").property("Anchor");
        if (anchor) {
            anchor.remove();
        }
    }
    if (deleteIK) {
        var ik = theLayer.property("Contents").property("IK");
        if (ik) {
            ik.remove();
        }
        var ikLine = theLayer.property("Contents").property("IK Line");
        if (ikLine) {
            ikLine.remove();
        }
    }

    var boneColour = getLabelColour(theLayer);
    var anchorColour = boneColour * anchorBrightness;
    if (makeNewAnchors) {
        newShape(theLayer, "ADBE Vector Shape - Ellipse", "Anchor", [defaultSize / 4, defaultSize / 4], false, anchorColour, 100);
    }
    if (makeNewIcons) {
        newShape(theLayer, "ADBE Vector Shape - Rect", "Icon", [defaultSize, defaultSize], boneColour, false, defaultOpacity);
    }
}

function newShape(theLayer, shapeStr, shapeName, shapeSizeArr, fillColour, strokeColour, shapeOpac) {
    var newRect = theLayer.property("Contents").addProperty(shapeStr);
    newRect.name = shapeName;
    var shapeType = shapeStr.split(" ");
    shapeType = shapeType[shapeType.length - 1];
    newRect.property("ADBE Vector " + shapeType + " Size").setValue(shapeSizeArr);
    if (fillColour) {
        var newFill = theLayer.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        newFill.property("ADBE Vector Fill Color").setValue(fillColour);
        newFill.property("ADBE Vector Fill Opacity").setValue(shapeOpac);
    }
    if (strokeColour) {
        var newStroke = theLayer.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        newStroke.property("ADBE Vector Stroke Color").setValue(strokeColour);
        newStroke.property("ADBE Vector Stroke Opacity").setValue(shapeOpac);
    }
}

function asciiToRGB(str) {
    var base = 20;
    var arr = [0, 0, 0];
    var hexArr = [0, 0, 0];
    for (var i = 1, l = str.length; i < l; i++) {
        var hex = Number(str.charCodeAt(i)).toString(base);
        hexArr[i - 1] = hex;
        var theRGB = parseInt(hex, 16) / 255;
        arr[i - 1] = theRGB;
    }
    // alert(hexArr);
    return arr;
}

function getLabelColour(theLayer) {
    var label = theLayer.label;

    var sect = "Label Preference Color Section 5";
    var key = "Label Color ID 2 # " + label.toString();
    var prefType = PREFType.PREF_Type_MACHINE_INDEPENDENT
    var thePref = app.preferences.getPrefAsString(sect, key, prefType);
    // alert(asciiToRGB(thePref));
    return asciiToRGB(thePref);

}


var scriptName = "simplify Duik Icons";

function buildUI(thisObj) {

    /*
    Code for Import https://scriptui.joonas.me — (Triple click to select): 
    {"activeId":17,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":null,"windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Dialog","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":"deletBox","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Delete","preferredSize":[220,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-2":{"id":2,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"deleteIconsChkBx","text":"Icons","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"deleteAnchorsChkBx","text":"Anchors","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"deleteIKChkBx","text":"IK","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":"CreatBox","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Create","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-6":{"id":6,"type":"Checkbox","parentId":5,"style":{"enabled":true,"varName":"createIconsChkBx","text":"Icons","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Checkbox","parentId":5,"style":{"enabled":true,"varName":"createAnchorsChkBx","text":"Anchors","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"Slider","parentId":18,"style":{"enabled":true,"varName":"iconOpacitySlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-12":{"id":12,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Size","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-13":{"id":13,"type":"Slider","parentId":12,"style":{"enabled":true,"varName":"iconSizeSlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-14":{"id":14,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Brightness","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-15":{"id":15,"type":"Slider","parentId":14,"style":{"enabled":true,"varName":"iconSizeSlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-16":{"id":16,"type":"Divider","parentId":5,"style":{"enabled":true,"varName":null}},"item-17":{"id":17,"type":"DropDownList","parentId":22,"style":{"enabled":true,"varName":"iconshape","text":"DropDownList","listItems":"Square,Circle,Polygon,Star","preferredSize":[60,0],"alignment":null,"selection":2,"helpTip":null}},"item-18":{"id":18,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Size","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-20":{"id":20,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Brightness","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-21":{"id":21,"type":"Slider","parentId":20,"style":{"enabled":true,"varName":"iconSizeSlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-22":{"id":22,"type":"Group","parentId":5,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-23":{"id":23,"type":"Slider","parentId":22,"style":{"enabled":true,"varName":"iconPoints","preferredSize":[106,0],"alignment":null,"helpTip":null}},"item-24":{"id":24,"type":"Group","parentId":5,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-25":{"id":25,"type":"DropDownList","parentId":24,"style":{"enabled":true,"varName":"anchorShape","text":"DropDownList","listItems":"Square,Circle,Polygon,Star","preferredSize":[60,0],"alignment":null,"selection":2,"helpTip":null}},"item-26":{"id":26,"type":"Slider","parentId":24,"style":{"enabled":true,"varName":"anchorPoints","preferredSize":[106,0],"alignment":null,"helpTip":null}},"item-27":{"id":27,"type":"Button","parentId":0,"style":{"enabled":true,"varName":null,"text":"Simplify selected Duik bones","justify":"center","preferredSize":[220,0],"alignment":null,"helpTip":null}}},"order":[0,27,1,2,3,4,5,6,18,11,20,21,22,17,23,16,7,12,13,14,15,24,25,26],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
    */

    // DIALOG
    // ======
    if (thisObj instanceof Panel) {
        var pal = thisObj;
    } else {
        pal = new Window("palette", scriptName, undefined, {
            resizeable: true
        });
    }
    if (pal !== null) {
        pal.orientation = "column";
        pal.alignChildren = ["left", "top"];
        pal.spacing = 10;
        pal.margins = 16;

        var DoTheThingsBtn = pal.add("button", undefined, undefined, {
            name: "DoTheThingsBtn"
        });
        DoTheThingsBtn.text = "Simplify selected Duik bones";
        DoTheThingsBtn.preferredSize.width = 220;

        // DELETBOX
        // ========
        var deletBox = pal.add("panel", undefined, undefined);
        deletBox.text = "Delete";
        deletBox.orientation = "column";
        deletBox.alignChildren = ["left", "top"];
        deletBox.spacing = 10;
        deletBox.margins = 10;
        deletBox.preferredSize.width = 200;
        var deleteIconsChkBx = deletBox.add("checkbox", undefined, undefined, {
            name: "deleteIconsChkBx"
        });
        deleteIconsChkBx.text = "Icons";
        deleteIconsChkBx.preferredSize.width = 200;

        var deleteAnchorsChkBx = deletBox.add("checkbox", undefined, undefined, {
            name: "deleteAnchorsChkBx"
        });
        deleteAnchorsChkBx.text = "Anchors";

        var deleteIKChkBx = deletBox.add("checkbox", undefined, undefined, {
            name: "deleteIKChkBx"
        });
        deleteIKChkBx.text = "IK";

        // CREATBOX
        // ========
        var CreatBox = pal.add("panel", undefined, undefined, {
            name: "CreatBox"
        });
        CreatBox.text = "Create";
        CreatBox.orientation = "column";
        CreatBox.alignChildren = ["left", "top"];
        CreatBox.spacing = 10;
        CreatBox.margins = 10;

        var createIconsChkBx = CreatBox.add("checkbox", undefined, undefined, {
            name: "createIconsChkBx"
        });
        createIconsChkBx.text = "Icons";

        // PANEL1
        // ======
        var panel1 = CreatBox.add("panel", undefined, undefined, {
            name: "panel1"
        });
        panel1.text = "Size";
        panel1.orientation = "column";
        panel1.alignChildren = ["left", "top"];
        panel1.spacing = 10;
        panel1.margins = [10, 4, 10, 4];

        var iconOpacitySlider = panel1.add("slider", undefined, undefined, undefined, undefined, {
            name: "iconOpacitySlider"
        });
        iconOpacitySlider.helpTip = "Icon size";
        iconOpacitySlider.minvalue = 0;
        iconOpacitySlider.maxvalue = 100;
        iconOpacitySlider.value = 50;
        iconOpacitySlider.preferredSize.width = 176;

        // PANEL2
        // ======
        var panel2 = CreatBox.add("panel", undefined, undefined, {
            name: "panel2"
        });
        panel2.text = "Brightness";
        panel2.orientation = "column";
        panel2.alignChildren = ["left", "top"];
        panel2.spacing = 10;
        panel2.margins = [10, 4, 10, 4];

        var iconSizeSlider = panel2.add("slider", undefined, undefined, undefined, undefined, {
            name: "iconSizeSlider"
        });
        iconSizeSlider.helpTip = "Icon size";
        iconSizeSlider.minvalue = 10;
        iconSizeSlider.maxvalue = 500;
        iconSizeSlider.value = 60;
        iconSizeSlider.preferredSize.width = 176;

        // GROUP1
        // ======
        var group1 = CreatBox.add("group", undefined, {
            name: "group1"
        });
        group1.orientation = "row";
        group1.alignChildren = ["left", "center"];
        group1.spacing = 10;
        group1.margins = 0;

        var shape_array = ["Square", "Circle", "Polygon", "Star"];
        var iconshape = group1.add("dropdownlist", undefined, undefined, {
            name: "iconshape",
            items: shape_array
        });
        iconshape.selection = 1;
        iconshape.preferredSize.width = 60;

        var iconPoints = group1.add("slider", undefined, undefined, undefined, undefined, {
            name: "iconPoints"
        });
        iconPoints.minvalue = 3;
        iconPoints.maxvalue = 16;
        iconPoints.value = 6;
        iconPoints.preferredSize.width = 106;

        // CREATBOX
        // ========
        var divider1 = CreatBox.add("panel", undefined, undefined, {
            name: "divider1"
        });
        divider1.alignment = "fill";

        var createAnchorsChkBx = CreatBox.add("checkbox", undefined, undefined, {
            name: "createAnchorsChkBx"
        });
        createAnchorsChkBx.text = "Anchors";

        // PANEL3
        // ======
        var panel3 = CreatBox.add("panel", undefined, undefined, {
            name: "panel3"
        });
        panel3.text = "Size";
        panel3.orientation = "column";
        panel3.alignChildren = ["left", "top"];
        panel3.spacing = 10;
        panel3.margins = [10, 4, 10, 4];

        var anchorSizeSlider = panel3.add("slider", undefined, undefined, undefined, undefined, {
            name: "anchorSizeSlider"
        });
        anchorSizeSlider.helpTip = "Icon size";
        anchorSizeSlider.minvalue = 0;
        anchorSizeSlider.maxvalue = 100;
        anchorSizeSlider.value = 50;
        anchorSizeSlider.preferredSize.width = 176;

        // PANEL4
        // ======
        var panel4 = CreatBox.add("panel", undefined, undefined, {
            name: "panel4"
        });
        panel4.text = "Brightness";
        panel4.orientation = "column";
        panel4.alignChildren = ["left", "top"];
        panel4.spacing = 10;
        panel4.margins = [10, 4, 10, 4];

        var anchorBrightnessSlider = panel4.add("slider", undefined, undefined, undefined, undefined, {
            name: "anchorBrightnessSlider"
        });
        anchorBrightnessSlider.helpTip = "Icon size";
        anchorBrightnessSlider.minvalue = 0;
        anchorBrightnessSlider.maxvalue = 100;
        anchorBrightnessSlider.value = 50;
        anchorBrightnessSlider.preferredSize.width = 176;

        // GROUP2
        // ======
        var group2 = CreatBox.add("group", undefined, {
            name: "group2"
        });
        group2.orientation = "row";
        group2.alignChildren = ["left", "center"];
        group2.spacing = 10;
        group2.margins = 0;

        var anchorShape = group2.add("dropdownlist", undefined, undefined, {
            name: "anchorShape",
            items: shape_array
        });
        anchorShape.selection = 1;
        anchorShape.preferredSize.width = 60;

        var anchorPoints = group2.add("slider", undefined, undefined, undefined, undefined, {
            name: "anchorPoints"
        });
        anchorPoints.minvalue = 3;
        anchorPoints.maxvalue = 16;
        anchorPoints.value = 6;
        anchorPoints.preferredSize.width = 106;

        DoTheThingsBtn.onClick = function() {
            alert("hello fron an IIFY");
            app.beginUndoGroup("simplify Duik Bones");
            var selectedBones = app.project.activeItem.selectedLayers;
            for (var b in selectedBones) {
                var theLayer = selectedBones[b];
                simplifyDuikIcons(
                    theLayer,
                    iconOpacitySlider.value,
                    anchorSizeSlider.value,
                    deleteIconsChkBx.value,
                    deleteAnchorsChkBx.value,
                    deleteIKChkBx.value,
                    createIconsChkBx.value,
                    createAnchorsChkBx.value,
                    anchorBrightnessSlider.value/100)
            }

            app.endUndoGroup();
        };


        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
    }
}

buildUI(this);