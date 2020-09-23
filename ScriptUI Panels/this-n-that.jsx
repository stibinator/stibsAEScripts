//@target aftereffects
//this-n-that ©2016 Stephen Dixon
//
//selects nth layers
/* global app, Panel, recalculate */

var scriptName = 'this-n-that';


function buildUI(thisObj) {
    var logicList = ['set', 'and (intersect)', 'or (add)', 'xor (difference)', 'count selected only'];
    var pal;

    if (thisObj instanceof Panel) {
        pal = thisObj;
    } else {
        pal = new Window('palette', scriptName, undefined, {
            resizeable: true
        });
    }

    if (pal !== null) {
        var modeGrp = pal.add('group');
        modeGrp.orientation = 'row';
        var layerMode = modeGrp.add("radiobutton", undefined, "Layers");
        var keyMode = modeGrp.add("radiobutton", undefined, "Keys");
        layerMode.value = true;
        var bttnGrp = pal.add('group');
        bttnGrp.orientation = 'row';
        var selectBttn = bttnGrp.add('button', undefined, 'select');
        var deselectBttn = bttnGrp.add('button', undefined, 'deselect');
        var selectionModePanel = pal.add('panel', undefined, 'select:');
        selectionModePanel.orientation = 'column';
        selectionModePanel.alignChildren = 'left';
        selectionModePanel.size = {
            width: 180,
            height: undefined
        };
        var nthGrp = selectionModePanel.add('group');
        nthGrp.orientation = 'row';
        nthGrp.minimumSize = {
            width: 120,
            height: undefined
        };
        nthGrp.add('staticText', undefined, 'select every');
        var nthText = nthGrp.add('editText', undefined, '2');
        var suffixTxt = nthGrp.add('staticText', undefined, 'nd');
        nthText.minimumSize = {
            width: 30,
            height: undefined
        };
        suffixTxt.minimumSize = {
            width: 30,
            height: undefined
        };
        var offsetGrp = selectionModePanel.add('group');
        offsetGrp.minimumSize = {
            width: 120,
            height: undefined
        };
        offsetGrp.add('staticText', undefined, 'starting from');
        var offsetText = offsetGrp.add('editText', undefined, '1');
        offsetText.minimumSize = {
            width: 30,
            height: undefined
        };
        var randomChckBx = selectionModePanel.add('checkbox', undefined, 'random');
        var logicGrp = pal.add('group');
        logicGrp.orientation = 'row';
        logicGrp.add('staticText', undefined, 'logic');
        var logicDDown = logicGrp.add('dropDownList', undefined, logicList);
        logicDDown.selection = 0;
    }

    offsetText.onChange = function() {
        offsetText.text = '' + ((Math.abs(parseInt(offsetText.text, 10)) || 1));
    };

    nthText.onChange = function() {
        var val = (parseInt(nthText.text, 10) || 0);
        nthText.text = '' + ((Math.abs(val) || 0));
        var teens = val % 100;
        var ones = val % 10;

        if ((teens < 20 & teens > 10) || (ones > 3) || (ones === 0)) {
            suffixTxt.text = 'th';
        } else if (ones === 1) {
            suffixTxt.text = 'st';
        } else if (ones === 2) {
            suffixTxt.text = 'nd';
        } else if (ones === 3) {
            suffixTxt.text = 'rd';
        }
        pal.layout.layout(recalculate);
    };


    function findNth(i, nth, offset, randoz, sense, numIndexes) {
        // returns true if the index is the nth
        // so much off-by-one!
        var result;
        //setting sense to false inverts the output
        if (nth === 1) { //de/select em all
            return ((i >= offset - 1) && sense);
        }
        if (randoz) {
            //select 1/nth of the layers - since they are sorted randomly this selects a precise proportion, at random
            result = ((i >= offset) && (i < (offset + 1 + (numIndexes - offset) / nth)));
            return (sense === result);
        }
        //selection based on index
        result = ((i >= offset - 1) && (i - (offset - 1)) % nth === 0);
        return (sense === result);
    }

    function makeLayerIndexArr(originalLayers, randoz, logic, offset) {
        //returns an array of integers, being the indexes of the layers we're selecting from
        var i;
        var theIndexes = [];
        //put the indices into an array.
        if (logic === 'select in current') {
            for (i = 1; i <= originalLayers.length; i++) {
                if (originalLayers[i].selected) {
                    theIndexes.push(originalLayers[i].index);
                }
            }
        } else {
            for (i = 1; i <= originalLayers.length; i++) {
                theIndexes.push(originalLayers[i].index);
            }
        }
        //..so that we can sort them for the random function
        if (randoz) {
            var nonRandomIndexes = theIndexes.slice(0, offset - 1);
            var randomIndexes = theIndexes.slice(offset - theIndexes.length - 1)
            randomIndexes.sort(function() {
                return (1 - Math.random() * 2);
            });
            theIndexes = nonRandomIndexes.concat(randomIndexes);
        }
        return theIndexes;
    }

    function makeKFIndexArr(theProperty, randoz, logic, offset) {
        //returns an array of integers, being the indexes of the keyframes we're selecting from
        var i;
        var theIndexes = [];
        //put the indices into an array.
        if (logic === 'select in current') {
            theIndexes = theProperty.selectedKeys;
        } else {
            for (i = 1; i <= theProperty.numKeys; i++) {
                theIndexes.push(i);
            }
        }
        //..so that we can sort them for the random function
        if (randoz) {
            var nonRandomIndexes = theIndexes.slice(0, offset - 1);
            var randomIndexes = theIndexes.slice(offset - theIndexes.length - 1)
            randomIndexes.sort(function() {
                return (1 - Math.random() * 2);
            });
            theIndexes = nonRandomIndexes.concat(randomIndexes);
        }else{
            theIndexes.sort(function(a, b) {
                return (a - b);
            });
        }
        return theIndexes;
    }

    function selectLayers(sense) {
        // do the hoo-hah
        var originalLayers = app.project.activeItem.layers;
        var i;
        var nth = parseInt(nthText.text, 10);
        var offset = parseInt(offsetText.text, 10);
        var logic = logicDDown.selection.text;
        var isNth;
        var isSelxd;
        var theIndexes = [];
        var randoz = randomChckBx.value;
        app.beginUndoGroup('this-n-that');
        try {

            theIndexes = makeLayerIndexArr(originalLayers, randoz, logic, offset);
            var numIndexes = theIndexes.length;

            for (i = 0; i < numIndexes; i++) {
                // is the layer on the list?
                isNth = findNth(i, nth, offset, randoz, sense, numIndexes);
                // isNth = isNth & (originalLayers[theIndexes[i]].index >= offset);
                // apply the logic
                isSelxd = originalLayers[theIndexes[i]].selected;
                if (logic === 'set' || logic === 'select in current') {
                    originalLayers[theIndexes[i]].selected = isNth;
                } else if (logic === 'and (intersect)') {
                    originalLayers[theIndexes[i]].selected = isNth & isSelxd;
                } else if (logic === 'or (add)') {
                    originalLayers[theIndexes[i]].selected = isNth || isSelxd;
                } else if (logic === 'xor (difference)') {
                    originalLayers[theIndexes[i]].selected = (!(isNth & isSelxd)) & (isNth || isSelxd);
                }
            }

        } catch (e) {
            alert(e);
        }
        app.endUndoGroup();
    }

    function includes(arr, element) {
        var isInArr = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == element) {
                isInArr = true
            }
        }
        return isInArr;
    }

    function selectKeys(sense) {
        // do the hoo-hah
        var theProps = app.project.activeItem.selectedProperties;
        var i;
        var nth = parseInt(nthText.text, 10);
        var offset = parseInt(offsetText.text, 10);
        var logic = logicDDown.selection.text;
        var isNth;
        var isSelxd;
        var theIndexes = [];
        var randoz = randomChckBx.value;
        app.beginUndoGroup('this-n-that');
        try {
            for (var p = 0; p < theProps.length; p++) {
                var theProp = theProps[p];
                theIndexes = makeKFIndexArr(theProp, randoz, logic, offset);
                var numIndexes = theIndexes.length;
                var selectedKFs = theProp.selectedKeys;
                for (i = 0; i < numIndexes; i++) {
                    // is the layer on the list?
                    isNth = findNth(i, nth, offset, randoz, sense, numIndexes);
                    // apply the logic
                    isSelxd = includes(selectedKFs, theIndexes[i]);
                    if (logic === 'set' || logic === 'select in current') {
                        theProp.setSelectedAtKey(theIndexes[i], isNth);
                    } else if (logic === 'and (intersect)') {
                        theProp.setSelectedAtKey(theIndexes[i], (isNth & isSelxd));
                    } else if (logic === 'or (add)') {
                        theProp.setSelectedAtKey(theIndexes[i], (isNth || isSelxd));
                    } else if (logic === 'xor (difference)') {
                        theProp.setSelectedAtKey(theIndexes[i], (!(isNth & isSelxd)) & (isNth || isSelxd));
                    }
                }
            }
        } catch (e) {
            alert(e);
        }

        app.endUndoGroup();
    }

    selectBttn.onClick = function() {
        if (layerMode.value) {
            selectLayers(true);
        } else {
            selectKeys(true);
        }
    };

    deselectBttn.onClick = function() {
        if (layerMode.value) {
            selectLayers(false);
        } else {
            selectKeys(false);
        }
    };


    //actually build the GUI

    if (pal instanceof Window) {
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }
}

buildUI(this);