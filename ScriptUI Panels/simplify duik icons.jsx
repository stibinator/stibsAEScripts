// @target aftereffects
/* global app, Panel, ShapeLayer*/

var scriptName = "Simplify Duik Icons";
var SHAPE_NAMES = ["Square", "Circle", "Polygon", "Star"];
var HANDLEPREFIX = "Handle_";

//initialise the label colours
var userLabelColours = readLabelColoursFromPrefs();

function simplifyDuikIcons(
    theLayer,
    deleteIcons,
    deleteAnchors,
    deleteIK,
    makeNewIcons,
    iconSize,
    iconOpacity,
    iconShape,
    iconPoints,
    makeNewAnchors,
    anchorSize,
    anchorBrightness,
    anchorShape,
    anchorPoints) {

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
    var anchorColour = boneColour * anchorBrightness / 100;
    var iconSizeArr = (iconShape < 2) ? [iconSize, iconSize] : [iconSize, iconSize / 2];
    var anchorSizeArr = (anchorShape < 2) ? [anchorSize, anchorSize] : [anchorSize, anchorSize / 2];
    if (makeNewAnchors) {
        newShape(theLayer, "Anchor", anchorSizeArr, false, anchorColour, 100, anchorShape, anchorPoints);
    }
    if (makeNewIcons) {
        newShape(theLayer, "Icon", iconSizeArr, boneColour, false, iconOpacity, iconShape, iconPoints);
    }
}

function newShape(theLayer, shapeName, shapeSizeArr, fillColour, strokeColour, shapeOpac, shapeType, shapePoints) {
    var shapeStr = ["Rect", "Ellipse", "Star", "Star"];
    var newGroup = theLayer.property("Contents").addProperty("ADBE Vector Group");
    newGroup.name = shapeName;
    var newShapeItem = newGroup.content.addProperty("ADBE Vector Shape - " + shapeStr[shapeType]);

    if (shapeType > 1) {
        newShapeItem.property("ADBE Vector Star Type").setValue(2);
        newShapeItem.property("ADBE Vector Star Points").setValue(shapePoints);
        newShapeItem.property("ADBE Vector Star Outer Radius").setValue(shapeSizeArr[0]);
        if (shapeType > 2) {
            newShapeItem.property("ADBE Vector Star Type").setValue(1);
            newShapeItem.property("ADBE Vector Star Inner Radius").setValue(shapeSizeArr[1])
        }
    } else {
        newShapeItem.property("ADBE Vector " + shapeStr[shapeType] + " Size").setValue(shapeSizeArr);
    }
    if (fillColour) {
        var newFill = newGroup.content.addProperty("ADBE Vector Graphic - Fill");
        newFill.property("ADBE Vector Fill Color").setValue(fillColour);
        newFill.property("ADBE Vector Fill Opacity").setValue(shapeOpac);
    }

    if (strokeColour) {
        var newStroke = newGroup.content.addProperty("ADBE Vector Graphic - Stroke");
        newStroke.property("ADBE Vector Stroke Color").setValue(strokeColour);
        newStroke.property("ADBE Vector Stroke Opacity").setValue(shapeOpac);
    }
}

// @target aftereffects
/* global app, Folder */
// eslint-disable-next-line no-unused-vars
function readLabelColoursFromPrefs() {
    try {
        // returns an array of colour objects corresponding to the label colours in the user's prefs
        // colours are 8-bit rgb values with r g and b components
        // eg. [{r: 255, g: 123, b:0}]
        app.preferences.saveToDisk(); //flush any unsaved prefs to disk
        var versionStr = "" + app.version.match(/[0-9]+.[0-9]+/);
        var prefsFilePath = Folder.userData.absoluteURI + "/Adobe/After Effects/" + versionStr + "/Adobe After Effects " + versionStr + " Prefs-indep-general.txt";
        var prefs = new File(prefsFilePath);
        var labelColours = [];
        if (prefs.exists) {
            prefs.open("r")
            var line = prefs.readln();
            var notDoneYet = true
            while ((!prefs.eof) & notDoneYet) {
                if (line.match(/\["Label Preference Color Section.*/)) {
                    line = prefs.readln();
                    while (line) {
                        var labelNum = line.match(/"Label Color ID 2 # ([0-9]+)"/);
                        var labelVal = line.match(/.*= FF(.*)/);
                        var encodedData = labelVal[1];
                        var inQuotes = false;
                        var colourStr = "";
                        var colour = {
                            "r": 0,
                            "g": 0,
                            "b": 0
                        }
                        for (var i = 0; i < encodedData.length; i++) {
                            if (encodedData[i] === '"') {
                                inQuotes = !inQuotes;
                            } else {
                                if (inQuotes) {
                                    colourStr += encodedData.charCodeAt(i).toString(16)
                                } else {
                                    colourStr += encodedData[i];
                                }
                            }
                        }

                        colour.r = parseInt(colourStr.slice(0, 2), 16)
                        colour.g = parseInt(colourStr.slice(2, 4), 16)
                        colour.b = parseInt(colourStr.slice(4), 16)
                        // label colours aren't stored in numerical order, but in alphabetical order, I think. 
                        // Anyway parsing the labelNum assigns the right label to the right index.
                        labelColours[parseInt(labelNum[1], 10)] = colour;
                        line = prefs.readln();
                    }
                    notDoneYet = false;
                }
                line = prefs.readln();
            }
            prefs.close();
            return labelColours;
        } else {
            return false;
        }
    } catch (e) {
        alert(e);
        return false;
    }
}

function getLabelColour(theLayer) {
    if (!userLabelColours) {
        userLabelColours = readLabelColoursFromPrefs();
    }
    var label = theLayer.label;
    return [userLabelColours[label].r / 255, userLabelColours[label].g / 255, userLabelColours[label].b / 255];
}

function updateNumberField(offset) {
    try {
        var pts = parseInt(this.text);
        if (isNaN(pts)) {
            pts = 6
        }
        if (!(typeof offset === 'undefined' || offset === null)) {
            pts += offset;
        }
        if (pts < 3) {
            pts = 3
        }
        this.text = "" + pts;
    } catch (e) {
        this.text = "6"
    }
}


function myPrefs(prefList) {
    this.prefs = {};

    this.parsePref = function(val, prefType) {
        switch (prefType) {
            case "integer":
                return parseInt(val, 10);
            case "float":
                return parseFloat(val);
            case "bool":
                return (val === "true")
            default:
                return val
        }
    }

    this.getPref = function(preference) {
        if (app.settings.haveSetting(scriptName, preference.name)) {
            this.prefs[preference.name] = this.parsePref(app.settings.getSetting(scriptName, preference.name), preference.prefType);
        } else {
            this.prefs[preference.name] = preference.factoryDefault;
            this.setPref(preference.name, preference.factoryDefault);
        }
    }

    this.setPref = function(prefname, value) {
        if (this.prefs[prefname] !== value) {
            this.prefs[prefname] = value;
            app.settings.saveSetting(scriptName, prefname, value);
        }
    }


    for (var p = 0; p < prefList.length; p++) {
        this.getPref(prefList[p]);
    }
}

function buildUI(thisObj) {

    /*
    Code for Import https://scriptui.joonas.me — (Triple click to select): 
    {"activeId":17,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":null,"windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Dialog","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":"deletBox","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Delete","preferredSize":[220,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-2":{"id":2,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"deleteIconsChkBx","text":"Icons","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"deleteAnchorsChkBx","text":"Anchors","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"deleteIKChkBx","text":"IK","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":"CreatBox","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Create","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-6":{"id":6,"type":"Checkbox","parentId":5,"style":{"enabled":true,"varName":"createIconsChkBx","text":"Icons","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Checkbox","parentId":5,"style":{"enabled":true,"varName":"createAnchorsChkBx","text":"Anchors","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"Slider","parentId":18,"style":{"enabled":true,"varName":"iconOpacitySlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-12":{"id":12,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Size","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-13":{"id":13,"type":"Slider","parentId":12,"style":{"enabled":true,"varName":"iconSizeSlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-14":{"id":14,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Opacity","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-15":{"id":15,"type":"Slider","parentId":14,"style":{"enabled":true,"varName":"iconSizeSlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-16":{"id":16,"type":"Divider","parentId":5,"style":{"enabled":true,"varName":null}},"item-17":{"id":17,"type":"DropDownList","parentId":22,"style":{"enabled":true,"varName":"iconshape","text":"DropDownList","listItems":"Square,Circle,Polygon,Star","preferredSize":[60,0],"alignment":null,"selection":2,"helpTip":null}},"item-18":{"id":18,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Size","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-20":{"id":20,"type":"Panel","parentId":5,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Opacity","preferredSize":[0,0],"margins":[4,10,4,10],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-21":{"id":21,"type":"Slider","parentId":20,"style":{"enabled":true,"varName":"iconSizeSlider","preferredSize":[176,0],"alignment":null,"helpTip":"Icon size"}},"item-22":{"id":22,"type":"Group","parentId":5,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-23":{"id":23,"type":"Slider","parentId":22,"style":{"enabled":true,"varName":"iconPoints","preferredSize":[106,0],"alignment":null,"helpTip":null}},"item-24":{"id":24,"type":"Group","parentId":5,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-25":{"id":25,"type":"DropDownList","parentId":24,"style":{"enabled":true,"varName":"anchorShape","text":"DropDownList","listItems":"Square,Circle,Polygon,Star","preferredSize":[60,0],"alignment":null,"selection":2,"helpTip":null}},"item-26":{"id":26,"type":"Slider","parentId":24,"style":{"enabled":true,"varName":"anchorPoints","preferredSize":[106,0],"alignment":null,"helpTip":null}},"item-27":{"id":27,"type":"Button","parentId":0,"style":{"enabled":true,"varName":null,"text":"Simplify selected Duik bones","justify":"center","preferredSize":[220,0],"alignment":null,"helpTip":null}}},"order":[0,27,1,2,3,4,5,6,18,11,20,21,22,17,23,16,7,12,13,14,15,24,25,26],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
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
        DoTheThingsBtn.text = "Create Handle";
        DoTheThingsBtn.preferredSize.width = 220;

        // DELETBOX
        // ========
        var deletBox = pal.add("panel", undefined, undefined);
        deletBox.text = "Delete DuIK Icons";
        deletBox.orientation = "row";
        deletBox.alignChildren = ["left", "top"];
        deletBox.spacing = 10;
        deletBox.margins = 10;
        deletBox.preferredSize.width = 200;
        var deleteIconsChkBx = deletBox.add("checkbox", undefined, undefined);
        deleteIconsChkBx.name = "deleteIconsChkBx";

        deleteIconsChkBx.text = "Icons";
        deleteIconsChkBx.preferredSize.width = 60;

        var deleteAnchorsChkBx = deletBox.add("checkbox", undefined, undefined);
        deleteAnchorsChkBx.name = "deleteAnchorsChkBx"

        deleteAnchorsChkBx.text = "Anchors";
        deleteAnchorsChkBx.preferredSize.width = 60;

        var deleteIKChkBx = deletBox.add("checkbox", undefined, undefined);
        deleteIKChkBx.name = "deleteIKChkBx"

        deleteIKChkBx.text = "IK";
        deleteIKChkBx.preferredSize.width = 60;

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

        var createIconsChkBx = CreatBox.add("checkbox", undefined, undefined);
        createIconsChkBx.name = "createIconsChkBx"

        createIconsChkBx.text = "Icons";

        // PANEL2
        // ======
        var icnSizePanel = CreatBox.add("panel", undefined, undefined, {
            name: "icnSizePanel"
        });
        icnSizePanel.text = "Icon size";
        icnSizePanel.orientation = "row";
        icnSizePanel.alignChildren = ["left", "top"];
        icnSizePanel.spacing = 10;
        icnSizePanel.margins = [10, 4, 10, 4];

        var iconSizeSlider = icnSizePanel.add("slider", undefined, undefined, undefined, undefined);
        iconSizeSlider.name = "iconSizeSlider"
        iconSizeSlider.helpTip = "Icon size, from 5 - 500";
        iconSizeSlider.minvalue = 20;
        iconSizeSlider.maxvalue = 100;
        iconSizeSlider.preferredSize.width = 146;
        var iconSizeText = icnSizePanel.add("statictext", undefined, iconSizeSlider.value);
        iconSizeText.preferredSize.width = 20;
        // PANEL1
        // ======
        var iconOpacityPanel = CreatBox.add("panel", undefined, undefined, {
            name: "iconOpacityPanel"
        });
        iconOpacityPanel.text = "Icon Opacity";
        iconOpacityPanel.orientation = "column";
        iconOpacityPanel.alignChildren = ["left", "top"];
        iconOpacityPanel.spacing = 10;
        iconOpacityPanel.margins = [10, 4, 10, 4];

        var iconOpacitySlider = iconOpacityPanel.add("slider", undefined, undefined, undefined, undefined);
        iconOpacitySlider.name = "iconOpacitySlider"
        iconOpacitySlider.helpTip = "Icon opacity";
        iconOpacitySlider.minvalue = 0;
        iconOpacitySlider.maxvalue = 100;
        iconOpacitySlider.preferredSize.width = 176;


        // GROUP1
        // ======
        var icnShapeGrp = CreatBox.add("group", undefined, {
            name: "icnShapeGrp"
        });
        icnShapeGrp.orientation = "row";
        icnShapeGrp.alignChildren = ["left", "center"];
        icnShapeGrp.spacing = 10;
        icnShapeGrp.margins = 0;

        var iconShapeDDList = icnShapeGrp.add("dropdownlist", undefined, undefined, {
            items: SHAPE_NAMES
        });
        iconShapeDDList.name = "iconShapeDDList"
        iconShapeDDList.preferredSize.width = 90;

        // ----------[-] iconPoints [+] grouplet ----------
        var iconPointsMinusBtn = icnShapeGrp.add("Button", undefined, undefined, {
            name: "iconPointsMinusBtn"
        });
        iconPointsMinusBtn.text = "-";
        iconPointsMinusBtn.preferredSize.width = 20;
        var iconPoints = icnShapeGrp.add("edittext", undefined, undefined, undefined, undefined);
        iconPoints.name = "iconPoints";
        iconPoints.preferredSize.width = 30;
        iconPoints.update = updateNumberField;
        var iconPointsPlusBtn = icnShapeGrp.add("Button", undefined, undefined, {
            name: "iconPointsPlusBtn"
        });
        iconPointsPlusBtn.text = "+";
        iconPointsPlusBtn.preferredSize.width = 20;

        // CREATBOX
        // ========
        var divider1 = CreatBox.add("panel", undefined, undefined, {
            name: "divider1"
        });
        divider1.alignment = "fill";

        var createAnchorsChkBx = CreatBox.add("checkbox", undefined, undefined);
        createAnchorsChkBx.name = "createAnchorsChkBx"

        createAnchorsChkBx.text = "Anchors";

        // PANEL4
        // ======
        var anchorSizePanel = CreatBox.add("panel", undefined, undefined, {
            name: "anchorSizePanel"
        });
        anchorSizePanel.text = "Anchor Size";
        anchorSizePanel.orientation = "row";
        anchorSizePanel.alignChildren = ["left", "top"];
        anchorSizePanel.spacing = 10;
        anchorSizePanel.margins = [10, 4, 10, 4];

        var anchorSizeSlider = anchorSizePanel.add("slider", undefined, undefined, undefined, undefined);
        anchorSizeSlider.name = "anchorSizeSlider"
        anchorSizeSlider.helpTip = "Anchor size from 0 - 500";
        anchorSizeSlider.minvalue = 20;
        anchorSizeSlider.maxvalue = 100;
        anchorSizeSlider.preferredSize.width = 146;
        var anchorSizeText = anchorSizePanel.add("statictext", undefined, anchorSizeSlider.value);
        anchorSizeText.preferredSize.width = 20;

        // PANEL3
        // ======
        var anchorBrightnessPanel = CreatBox.add("panel", undefined, undefined, {
            name: "anchorBrightnessPanel"
        });
        anchorBrightnessPanel.text = "Anchor Brightness";
        anchorBrightnessPanel.orientation = "column";
        anchorBrightnessPanel.alignChildren = ["left", "top"];
        anchorBrightnessPanel.spacing = 10;
        anchorBrightnessPanel.margins = [10, 4, 10, 4];

        var anchorBrightnessSlider = anchorBrightnessPanel.add("slider", undefined, undefined, undefined, undefined);
        anchorBrightnessSlider.name = "anchorBrightnessSlider"
        anchorBrightnessSlider.helpTip = "Brightness of anchor stroke, from black to white";
        anchorBrightnessSlider.minvalue = 0;
        anchorBrightnessSlider.maxvalue = 150;
        anchorBrightnessSlider.preferredSize.width = 176;

        // GROUP2
        // ======
        var anchorShapeGroup = CreatBox.add("group", undefined, {
            name: "anchorShapeGroup"
        });
        anchorShapeGroup.orientation = "row";
        anchorShapeGroup.alignChildren = ["left", "center"];
        anchorShapeGroup.spacing = 10;
        anchorShapeGroup.margins = 0;

        var anchorShapeDDList = anchorShapeGroup.add("dropdownlist", undefined, undefined, {
            items: SHAPE_NAMES
        });
        anchorShapeDDList.name = "anchorShapeDDList"
        anchorShapeDDList.preferredSize.width = 90;

        // ----------[-] anchorPoints [ grouplet ----------+]
        var anchorPointsMinusBtn = anchorShapeGroup.add("Button", undefined, undefined, {
            name: "anchorPointsMinusBtn"
        });
        anchorPointsMinusBtn.text = "-";
        anchorPointsMinusBtn.preferredSize.width = 20;
        var anchorPoints = anchorShapeGroup.add("edittext", undefined, undefined, undefined, undefined);
        anchorPoints.name = "anchorPoints";
        anchorPoints.preferredSize.width = 30;
        anchorPoints.update = updateNumberField;

        var anchorPointsPlusBtn = anchorShapeGroup.add("Button", undefined, undefined, {
            name: "anchorPointsPlusBtn"
        });
        anchorPointsPlusBtn.text = "+";
        anchorPointsPlusBtn.preferredSize.width = 20;

        // ------------------------- Preferences ---------------------------------

        var prefs = new myPrefs(
            [{
                name: "deleteIconsChkBx",
                factoryDefault: true,
                prefType: "bool"
            }, {
                name: "deleteAnchorsChkBx",
                factoryDefault: true,
                prefType: "bool"
            }, {
                name: "deleteIKChkBx",
                factoryDefault: true,
                prefType: "bool"
            }, {
                name: "createIconsChkBx",
                factoryDefault: true,
                prefType: "bool"
            }, {
                name: "iconSizeSlider",
                factoryDefault: 50,
                prefType: "float"
            }, {
                name: "iconOpacitySlider",
                factoryDefault: 50,
                prefType: "float"
            }, {
                name: "iconShapeDDList",
                factoryDefault: 1,
                prefType: "integer"
            }, {
                name: "iconPoints",
                factoryDefault: 6,
                prefType: "integer"
            }, {
                name: "createAnchorsChkBx",
                factoryDefault: 1,
                prefType: "bool"
            }, {
                name: "anchorSizeSlider",
                factoryDefault: 10,
                prefType: "float"
            }, {
                name: "anchorBrightnessSlider",
                factoryDefault: 10,
                prefType: "float"
            }, {
                name: "anchorShapeDDList",
                factoryDefault: 0,
                prefType: "integer"
            }, {
                name: "anchorPoints",
                factoryDefault: 6,
                prefType: "integer"
            }]
        );
        deleteIconsChkBx.value = prefs.prefs[deleteIconsChkBx.name];
        deleteAnchorsChkBx.value = prefs.prefs[deleteAnchorsChkBx.name];
        deleteIKChkBx.value = prefs.prefs[deleteIKChkBx.name];
        createIconsChkBx.value = prefs.prefs[createIconsChkBx.name];
        iconSizeSlider.value = prefs.prefs[iconSizeSlider.name];
        iconOpacitySlider.value = prefs.prefs[iconOpacitySlider.name];
        createAnchorsChkBx.value = prefs.prefs[createAnchorsChkBx.name];
        anchorSizeSlider.value = prefs.prefs[anchorSizeSlider.name];
        anchorBrightnessSlider.value = prefs.prefs[anchorBrightnessSlider.name];
        iconShapeDDList.selection = prefs.prefs[iconShapeDDList.name];
        anchorShapeDDList.selection = prefs.prefs[anchorShapeDDList.name];

        iconPoints.text = prefs.prefs[iconPoints.name];
        anchorPoints.text = prefs.prefs[anchorPoints.name];

        // initialise the text
        var scaledIconSize = Math.round(500 * (Math.pow(iconSizeSlider.value / 100, 3)));
        var scaledAnchorSize = Math.round(500 * (Math.pow(anchorSizeSlider.value / 100, 3)));
        iconSizeText.text = scaledIconSize;
        anchorSizeText.text = scaledAnchorSize;
        //--------------callbacks -----------------------

        deleteIconsChkBx.onClick =
            deleteAnchorsChkBx.onClick =
            deleteIKChkBx.onClick =
            createIconsChkBx.onClick =
            createAnchorsChkBx.onClick =
            function() {
                prefs.setPref(this.name, this.value);
            }

        iconSizeSlider.onChange =
            anchorSizeSlider.onChange =
            function() {
                prefs.setPref(this.name, this.value);
                scaledIconSize = Math.round(500 * (Math.pow(iconSizeSlider.value / 100, 3)));
                scaledAnchorSize = Math.round(500 * (Math.pow(anchorSizeSlider.value / 100, 3)));
                iconSizeText.text = scaledIconSize;
                anchorSizeText.text = scaledAnchorSize;
                doTheThings();
            }
        iconOpacitySlider.onChange =
            anchorBrightnessSlider.onChange =
            function() {
                prefs.setPref(this.name, this.value);
                doTheThings();
            }

        iconShapeDDList.onChange =
            anchorShapeDDList.onChange =
            function() {
                prefs.setPref(this.name, this.selection.index)
                doTheThings();
            };

        iconPoints.onChange = function() {
            this.update();
            prefs.setPref(this.name, parseInt(this.text));
            doTheThings();
        };
        anchorPoints.onChange = function() {
            this.update();
            prefs.setPref(this.name, parseInt(this.text))
            doTheThings();
        };

        iconPointsPlusBtn.onClick = function() {
            iconPoints.update(1);
            prefs.setPref(iconPoints.name, parseInt(iconPoints.text));
            doTheThings();
        }
        iconPointsMinusBtn.onClick = function() {
            iconPoints.update(-1);
            prefs.setPref(iconPoints.name, parseInt(iconPoints.text));
            doTheThings();
        }

        anchorPointsPlusBtn.onClick = function() {
            anchorPoints.update(1)
            prefs.setPref(anchorPoints.name, parseInt(anchorPoints.text))
            doTheThings();
        }
        anchorPointsMinusBtn.onClick = function() {
            anchorPoints.update(-1);
            prefs.setPref(anchorPoints.name, parseInt(anchorPoints.text))
            doTheThings();
        }


        // ------------------------- do the things -------------------------------
        DoTheThingsBtn.onClick = function() {
            app.beginUndoGroup("simplify Duik Bones");
            doTheThings()

            app.endUndoGroup();
        };


        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }

    }

    function doTheThings() {
        try {
            if (app.project && app.project.activeItem) {
                var selectedBones = app.project.activeItem.selectedLayers;
                if (selectedBones.length === 0) {
                    var newShapeLyr = app.project.activeItem.layers.addShape();
                    newShapeLyr.selected = true;
                    selectedBones = app.project.activeItem.selectedLayers;
                    selectedBones[0].name = "Handle";
                }

                var iconPointsInt = parseInt(iconPoints.text);
                var anchorPointsInt = parseInt(anchorPoints.text);


                for (var b = 0; b < selectedBones.length; b++) {
                    var theLayer = selectedBones[b];
                    if (!(theLayer instanceof ShapeLayer)) {
                        var newShape = app.project.activeItem.layers.addShape();
                        newShape.name = HANDLEPREFIX + theLayer.name;
                        //if the layer isn't a shape layer, create one and make it the parent of the layer
                        if (theLayer.parent) {
                            newShape.parent = theLayer.parent;
                            newShape.threeDLayer = theLayer.threeDLayer;
                            newShape.position.setValue(theLayer.position.value);
                            newShape.rotation.setValue(theLayer.rotation.value);
                            newShape.scale.setValue(theLayer.scale.value);
                            theLayer.parent = newShape;
                            theLayer = newShape;
                        }
                    }
                    simplifyDuikIcons(
                        theLayer,
                        deleteIconsChkBx.value,
                        deleteAnchorsChkBx.value,
                        deleteIKChkBx.value,
                        createIconsChkBx.value,
                        scaledIconSize,
                        iconOpacitySlider.value,
                        iconShapeDDList.selection.index,
                        iconPointsInt,
                        createAnchorsChkBx.value,
                        scaledAnchorSize,
                        anchorBrightnessSlider.value,
                        anchorShapeDDList.selection.index,
                        anchorPointsInt
                    );
                }
            }
        } catch (e) {
            alert(e);
        }
    }
}

buildUI(this);