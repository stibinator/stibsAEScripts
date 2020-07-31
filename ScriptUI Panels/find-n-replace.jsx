// @includepath "../(lib)"
// @include  "getproperties.jsx"

/* global app, Panel, getPropertiesWithExpressionsFromLayer */
// regexp find and replace for expressions

var FindNReplaceText = "Find 'n replace"
var selectedOnlyLabel = '..on selected layers only';
var selectedPropsOnlyLabel = '..on selected properties only';
var includeLockedLabel = ' Include locked layers';
var findNReplaceUndoGrpLabel = "freeze all expressions";
var noSelectedLayersText = "No layers selected, silly rabbit";
var globalLabel = "Global";
var insensitiveLabel = "Case-insensitive";
var multiLineLabel = "Multi Line";
var newLineSpaceLabel = "'.' matches newline";

//global vars
var scriptName = "Find 'n Replace in Expressions";

function buildUI(thisObj) {
    if (thisObj instanceof Panel) {
        var pal = thisObj;
    } else {
        pal = new Window("palette", scriptName, undefined, {
            resizeable: true
        });
    }
    if (pal !== null) {
        var xpPanel = pal.add('panel', undefined, "Search Patterns");
        xpPanel.orientation = 'column';
        xpPanel.alignChildren = 'left';
        xpPanel.size = {
            width: 180,
            height: undefined
        };

        var patternBox = xpPanel.add("edittext",[
            undefined, undefined, 200, 22
        ], "search pattern");
        var replaceBox = xpPanel.add("edittext",[
            undefined, undefined, 200, 22
        ], "replacement text");

        var gChkBx = xpPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], globalLabel);
        var iChkBx = xpPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], insensitiveLabel);
        var mChkBx = xpPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], multiLineLabel);
        var sChkBx = xpPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], newLineSpaceLabel);

        var findNReplaceBtn = xpPanel.add("button", [
            undefined, undefined, 200, 22
        ], FindNReplaceText);
        findNReplaceBtn.enabled = false;

        var selectedOnlyCheckbox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], selectedOnlyLabel);

        selectedOnlyCheckbox.value = false;
        selectedOnlyCheckbox.oldValue = false;
        var selectedPropsOnlyCheckbox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], selectedPropsOnlyLabel);

        selectedPropsOnlyCheckbox.value = false;
        selectedPropsOnlyCheckbox.oldValue = false;
        var includeLockedCheckBox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], includeLockedLabel);

        includeLockedCheckBox.value = false;
        includeLockedCheckBox.oldValue = false; // see below

        selectedOnlyCheckbox.onClick = function() {
            // turn off "include locked layers" checkbox, because it doesn't make sense with the "selected only" checkbox on.
            if (selectedOnlyCheckbox.value) {
                // remember the value so it can be reinstated when I uncheck the "selected only" checkbox
                includeLockedCheckBox.oldValue = includeLockedCheckBox.value;
                includeLockedCheckBox.enabled = false;
                includeLockedCheckBox.value = false; // uncheck it so that it's unambiguous
                selectedPropsOnlyCheckbox.enabled = true;
                selectedPropsOnlyCheckbox.value = selectedPropsOnlyCheckbox.oldValue;
            } else {
                includeLockedCheckBox.enabled = true;
                // reinstate the "include locked layers" value
                includeLockedCheckBox.value = includeLockedCheckBox.oldValue;
                selectedPropsOnlyCheckbox.oldValue = selectedPropsOnlyCheckbox.value;
                //turn off the selected properties only checkbox
                selectedPropsOnlyCheckbox.enabled = false;
                selectedPropsOnlyCheckbox.value = false;
            }
        };
        selectedPropsOnlyCheckbox.onClick = function() {
            // turn off "include locked layers" checkbox, because it doesn't make sense with the "selected only" checkbox on.
            if (selectedPropsOnlyCheckbox.value) {
                // remember the value so it can be reinstated when I uncheck the "selected only" checkbox
                includeLockedCheckBox.oldValue = includeLockedCheckBox.value;
                includeLockedCheckBox.enabled = false;
                includeLockedCheckBox.value = false; // uncheck it so that it's unambiguous
                selectedOnlyCheckbox.value = true; //check the selected layers checkbox
            } else {
                includeLockedCheckBox.enabled = true;
                // reinstate the "include locked layers" value
                includeLockedCheckBox.value = includeLockedCheckBox.oldValue;
            }
        };
        includeLockedCheckBox.onClick = function() {
            // turn off "selected" checkbox, because it doesn't make sense with the "selected only" checkbox on.
            if (includeLockedCheckBox.value) {
                // remember the value so it can be reinstated when I uncheck the "include locked" checkbox
                selectedOnlyCheckbox.oldValue = selectedOnlyCheckbox.value;
                selectedOnlyCheckbox.enabled = false;
                selectedOnlyCheckbox.value = false; // uncheck it so that it's unambiguous
                //turn off the selected properties only checkbox, remembering its value
                selectedPropsOnlyCheckbox.oldValue = selectedPropsOnlyCheckbox.value;
                selectedPropsOnlyCheckbox.enabled = false;
                selectedPropsOnlyCheckbox.value = false;
            } else {
                selectedOnlyCheckbox.enabled = true;
                // reinstate the "selected only" value
                selectedOnlyCheckbox.value = selectedOnlyCheckbox.oldValue;
                //and the selected props checkbox
                selectedPropsOnlyCheckbox.enabled = true;
                selectedPropsOnlyCheckbox.value = selectedPropsOnlyCheckbox.oldValue;
            }
        };

        patternBox.onChange = function() {
            findNReplaceBtn.enabled = (patternBox.text.length > 0);
        }

        findNReplaceBtn.onClick = function() {
            app.beginUndoGroup(findNReplaceUndoGrpLabel);
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            var theFlags = "";
            if (gChkBx.value) {
                theFlags += "g";
            }
            if (iChkBx.value) {
                theFlags += "i";
            }
            if (mChkBx.value) {
                theFlags += "m";
            }
            if (sChkBx.value) {
                theFlags += "s";
            }
            if (theLayers.length > 0) {
                findNReplaceInExpressions(
                    theLayers,
                    includeLockedCheckBox.value,
                    selectedPropsOnlyCheckbox.value,
                    patternBox.text,
                    replaceBox.text,
                    theFlags
                );
            }
            app.endUndoGroup();
        };
    }
    if (pal instanceof Window) {
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }

}

// actually build the UI
buildUI(this);

//here comes the real hoo-hah
function getTheLayers(selectedOnly) {
    var theLayersList = [];
    if (selectedOnly) {
        if (app.project.activeItem.selectedLayers.length > 0) {
            theLayersList = app.project.activeItem.selectedLayers;
        } else {
            alert(noSelectedLayersText);
        }
    } else {
        for (var i = 1; i <= app.project.activeItem.layers.length; i++) {
            theLayersList.push(app.project.activeItem.layers[i]);
        }
    }
    return theLayersList;
}

function findNReplaceInExpressions(
    theLayers,
    includeLocked,
    onlySelectedProps,
    thePattern,
    replaceString,
    regexpFlags
) {
    var expressionProps = getExpressions(theLayers, includeLocked, onlySelectedProps);
    // start ALL inactive expressions, including paused ones
    for (var i = 0; i < expressionProps.length; i++) {
        var theRegeExp = new RegExp(thePattern, regexpFlags);
        expressionProps[i].expression = expressionProps[i].expression.replace(theRegeExp, replaceString);
    }
}



function getExpressions(theLayers, includeLocked, onlySelectedProps) {
    var theProps = [];
    var newProps;
    for (var i = 0; i < theLayers.length; i++) {
        //check to see if the layer is locked if neccessary
        if (theLayers[i].locked === false || includeLocked) {
            newProps = getPropertiesWithExpressionsFromLayer(theLayers[i], onlySelectedProps);
            for (var j = 0; j < newProps.length; j++) {
                theProps.push(newProps[j]);
            }
        }
    }
    return theProps;
}