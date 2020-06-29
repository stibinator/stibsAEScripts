// In-n-out by stib ©2016 Stephen Dixon sequences layers in a variety of ways
/* @target aftereffects */
/* include ../(lib)/jsextras.jsx */
/* global app, Panel, CompItem, timeToCurrentFormat, currentFormatToTime, writeln */

var fns = {
    linear: 'linear',
    exponential: 'exponential',
    sigmoid: 'sigmoid',
    random: 'random'
};
var orders = {
    index: 'index',
    random: 'random',
    selection: 'selection',
    current: 'current order',
    alphabetical: 'alphabetical',
};

var IN = 0;
var OUT = 1;
var inAndOut = ["in point", "out point"];
// ----------------- Maths fun -----------------------------
function exponential(x, p) {
    //return a value 0-1 based on the exponential function, of order p
    if (x <= 0) {
        return 0;
    }

    if (x >= 1) {
        return 1;
    }

    return Math.pow(x, p);
}

function sigmoid(x, p) {
    // sigmoid function for 0<=x<=1 returns a variable s-shaped slope where 0<=y<=1,
    // and that always passes through [0,0] and [1,1] took a while to figure out
    // see https://www.desmos.com/calculator/40sqnfw8hf

    if (x <= 0) {
        return 0;
    }
    if (x >= 1) {
        return 1;
    }

    if (p > 0) {
        var g = function(n) {
            return (Math.pow(1 / n, p));
        };
        return g(1 - x) / (g(x) + g(1 - x));
    }
    return 1;
}

// ----------- useful ------------------------
function defaultFor(arg, val, replaceNullandEmptyVals) {
    if (replaceNullandEmptyVals) {
        return ((typeof(arg) !== 'undefined') || (arg === null) || (arg === [])) ?
            val :
            arg;
    }
    return (typeof(arg) !== 'undefined') ?
        arg :
        val;
}

// ----------- timeconversions--------------------
function percentToHMSF(percent, acomp) {
    var theComp = defaultFor(acomp, app.project.activeItem);
    if (theComp instanceof CompItem) {
        return timeToCurrentFormat(percent * theComp.duration / 100, 1 / theComp.frameDuration);
    }
    return false;
}

//here comes the hoo-ha
function sequenceLayers(order, firstTime, lastTime, ease, easePower, regularity, doInPoints, theComp, moveNotTrim, firstInOrOut, lastInOrOut) { //}, randoz) {
    var shouldDoInPoints = doInPoints;
    var i;
    if (!theComp) {
        alert('choose some layers in a comp');
    } else {
        var theLayers = theComp.selectedLayers;
        // if no layers are selected do all of them, lightwave style.
        // if (theLayers.length === 0) {
        //   theLayers = [];
        //   // what were Adobe thinking when they didn't make comp.layers a proper array?
        //   for (i = 1; i <= theComp.layers.length; i++) {
        //     theLayers[i] = theComp.layers[i];
        //   }
        // }
        if (theLayers.length > 2) {
            switch (order) {
                case orders.index:
                    theLayers
                        .sort(function(a, b) {
                            return (a.index - b.index);
                        });
                    break;
                case orders.random:
                    theLayers
                        .sort(function() {
                            return (1 - Math.random() * 2);
                        });
                    break;
                case orders.current:
                    theLayers
                        .sort(function(a, b) {
                            return (a.inPoint - b.inPoint);
                        });
                    break;
                case orders.alphabetical:
                    theLayers
                        .sort(function(a, b) {
                            if (a.name === b.name) {
                                return 0;
                            }
                            return (a.name > b.name) ?
                                -1 :
                                1;
                        });
                    break;
            }
            var numLayers = theLayers.length;
            var n = numLayers - 1; //just for readability

            if (moveNotTrim) {
                if (firstInOrOut === OUT & doInPoints) {
                    firstTime -= theLayers[0].outPoint - theLayers[0].inPoint;
                } else if (firstInOrOut === IN & !doInPoints) {
                    firstTime += theLayers[0].outPoint - theLayers[0].inPoint;
                }

                if (lastInOrOut === OUT & doInPoints) {
                    lastTime -= theLayers[n].outPoint - theLayers[n].inPoint;
                } else if (lastInOrOut === IN & !doInPoints) {
                    lastTime += theLayers[n].outPoint - theLayers[n].inPoint;
                }
            }


            var fDur = theComp.frameDuration;
            var timeSpan = lastTime - firstTime;
            var startOffset;
            var outOffset; //the offset between the layer's start time and its in-point, and its active duration
            var myTime = 0;
            var layerIndex = 0;
            for (i = 0; i < numLayers; i++) {
                layerIndex = i;
                if (regularity < 1 && i > 0 && i < (numLayers - 1)) { //always make the first and last keyframe on time
                    //although we're using the layer index as the input it doesn't have to be an integer. This adds some irregularity
                    //this took a while:
                    layerIndex = i + Math.random() * (1 - regularity) * (((n - 1) / n) - (n - i) / (n - 1)); //randomise layers so they can start at any
                    // time between when the last layer could start and the next might, but make
                    // sure the first and last layers start on time this should be simple, but we
                    // have to make sure that there isn't always a gap after the first layer or
                    // before the last this spreads the randomness. Trust me, I worked it out on
                    // paper.
                }

                switch (ease) {
                    case fns.linear:
                        myTime = firstTime + timeSpan * layerIndex / (numLayers - 1);
                        break;
                    case fns.exponential:
                        myTime = firstTime + timeSpan * exponential(layerIndex / (numLayers - 1), easePower);
                        break;
                    case fns.sigmoid:
                        myTime = firstTime + timeSpan * sigmoid(layerIndex / (numLayers - 1), easePower);
                        break;
                    default: //kompletelely randoz
                        myTime = firstTime + timeSpan * Math.random();
                }

                var theLayer = theLayers[i];
                if (moveNotTrim) { //move the layer
                    if (shouldDoInPoints) {
                        startOffset = theLayer.inPoint - theLayer.startTime;
                        theLayer.startTime = Math.round(myTime / fDur) * fDur - startOffset; //round it to the nearest frame boundary
                    } else {
                        outOffset = theLayer.outPoint - theLayer.startTime;
                        theLayer.startTime = Math.round(myTime / fDur) * fDur - outOffset; //round it to the nearest frame boundary
                    }
                } else { //trim the in or out point
                    if (doInPoints) {
                        var currentOutPoint = theLayer.outPoint;
                        theLayer.inPoint = Math.min(Math.round(myTime / fDur) * fDur, currentOutPoint - fDur);
                        theLayer.outPoint = currentOutPoint;
                    } else {
                        var currentInPoint = theLayer.inPoint;
                        theLayer.outPoint = Math.max(Math.round(myTime / fDur) * fDur, currentInPoint + fDur );
                    //    alert(theLayer.outPoint);
                    //    theLayer.inPoint = currentInPoint;
                    }
                }
            }
        }
    }
}

// function makeFamilies(theLayers){
//   var i;
//   var families = [];
//   for ( i = 0; i < theLayers.length; i++) {
//     if (contains(theLayers, theLayers[i].parent)){
//
//     }
//   }
// }


function buildGUI(thisObj) {
    var theComp = (app.project.activeItem || {
        duration: 60,
        frameDuration: 1 / 25,
        time: 0
    });
    var theWindow = (thisObj instanceof Panel) ?
        thisObj :
        new Window('pavarte', thisObj.scriptTitle, undefined, {
            resizeable: true
        });

    // we need a comp for things like the sliders which are set based on the
    // duration, and for the frameDuration, so we'll set up a dummy object

    var mainGroup = theWindow.add("group{orientation:'column',alignment:['left','top'],alignChildren:['left','top']" +
        '}');


    //need orders and functions as an array for the dropdowns
    var orderList = [];
    for (i in orders) {
        orderList.push(orders[i]);
    }
    // var doTheStuff = mainGroup.add('button', undefined, 'Sequence layers');
    var orderPanel = mainGroup.add('panel{text: "Sequence order"}');
    var orderDropDown = orderPanel.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], orderList);

    var trimMovePanel = mainGroup.add('panel{orientation:"row", text: "method"}')
    var trimOrMove = trimMovePanel.add("group{orientation:'row'}");
    var moveChckBox = trimOrMove.add('radiobutton', [undefined, undefined, 75, 16], 'move');
    var trimChckBox = trimOrMove.add('radiobutton', [undefined, undefined, 75, 16], 'trim');
    // var slideChckBox = trimOrMove.add('radiobutton', [undefined, undefined, 76, 16], 'slide');

    var inoutPanel = mainGroup.add('panel{orientation:"column", alignChildren: "left", text: "alignment"}', undefined);
    var inOrOut = inoutPanel.add("group{orientation:'row'}", );
    var inChckBox = inOrOut.add('radiobutton', [undefined, undefined, 75, 16], 'inPoints');
    var outChckBox = inOrOut.add('radiobutton', [undefined, undefined, 161, 16], 'outPoints');

    var firstPanel = mainGroup.add('panel', undefined, 'first');
    var firstInOutCurrentGrp = firstPanel.add("group{orientation:'row'}");
    var firstInOrOutDD = firstInOutCurrentGrp.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], inAndOut);
    var firstBttn = firstInOutCurrentGrp.add('button', undefined, 'set to current');
    var firstGrp = firstPanel.add("group{orientation:'row'}");
    var firstSlider = firstGrp.add('slider', undefined, 0, 0, 100);
    var firstHmsfText = firstGrp.add('editText', [
        undefined, undefined, 66, 28
    ], percentToHMSF(0, theComp) || "00:00:00:00");

    var lastPanel = mainGroup.add('panel', undefined, 'last');
    var lastInOutCurrentGrp = lastPanel.add("group{orientation:'row'}");
    var lastInOrOutDD = lastInOutCurrentGrp.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], inAndOut);
    var lastBttn = lastInOutCurrentGrp.add('button', undefined, 'set to current');
    var lastGrp = lastPanel.add("group{orientation:'row'}");
    var lastSlider = lastGrp.add('slider', undefined, 100, 0, 100);
    var lastHmsfText = lastGrp.add('editText', [
        undefined, undefined, 66, 28
    ], percentToHMSF(100, theComp) || "00:00:10:00");

    var functionList = [];
    for (var i in fns) {
        functionList.push(fns[i]);
    }
    var easingPanel = mainGroup.add("panel{ alignChildren: 'left', text: 'easing'}", undefined, 'easing');
    var easingRow = easingPanel.add("group{orientation:'column', alignChildren: 'left'}");
    var fnTypeDropDown = easingRow.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], functionList);
    var pwrGrp = easingPanel.add("group{orientation:'row'}");
    var pwrSlider = pwrGrp.add('slider', undefined, 0.5, 0, 1);
    var pwrEdit = pwrGrp.add('editText', [undefined, undefined, 66, 28], '' + pwrSlider.value);

    var regularityPanel = mainGroup.add('panel', undefined, 'regularity');
    var regularityGrp = regularityPanel.add("group{orientation:'row'}");
    var regularitySlider = regularityGrp.add('slider', undefined, 100, -200, 100);



    firstInOrOutDD.selection = IN;
    lastInOrOutDD.selection = OUT;
    fnTypeDropDown.selection = 1;
    pwrSlider.size = {
        width: 170,
        height: 10
    };
    regularitySlider.size = firstSlider.size = lastSlider.size = {
        width: 170,
        height: 10
    };

    inChckBox.value = true;
    moveChckBox.value = true;
    theWindow.preferredSize = 'width: -1, height: -1';
    theWindow.alignChildren = ['left', 'top'];
    theWindow.margins = [10, 10, 10, 10];
    orderDropDown.selection = 0;


    firstSlider.onChanging = function() {
        //update the edit box,
        firstHmsfText.text = percentToHMSF(firstSlider.value, theComp);

        // //and the other sliders
        // lastSlider.value = Math.max(firstSlider.value, lastSlider.value);

        // //propogate to the edittext box
        // lastHmsfText.text = percentToHMSF(lastSlider.value, theComp);
    };



    lastSlider.onChanging = function() {
        //update the edit box,
        try {
            lastHmsfText.text = percentToHMSF(lastSlider.value, theComp);

            // //and the other sliders
            // firstSlider.value = Math.min(firstSlider.value, lastSlider.value);

            // //propogate to the edittext box
            // firstHmsfText.text = percentToHMSF(firstSlider.value, theComp);
        } catch (e) {
            writeln(e);
            firstHmsfText.text = timeToCurrentFormat(0, 25)
            lastHmsfText.text = timeToCurrentFormat(60, 25);
            firstSlider.value = 0;
            lastSlider.value = 60;
        }
    }
    lastSlider.onChange =
        regularitySlider.onChange =
        firstSlider.onChange =
        moveChckBox.onChange =
        orderDropDown.onChange =
        firstInOrOutDD.onChange =
        lastInOrOutDD.onChange =
        function() {
            doTheThings();
        }

    firstHmsfText.onChange = function() {
        //parse the user input
        try {
            var parsedTime = currentFormatToTime(firstHmsfText.text, theComp.frameRate);
            //propogate it to the slider
            firstSlider.value = parsedTime / theComp.duration * 100;

            //update the other slider if there are conflicts
            lastSlider.value = Math.max(firstSlider.value, lastSlider.value);

            //normalise the value back to the editbox
            firstHmsfText.text = timeToCurrentFormat(parsedTime, theComp.frameRate, true);
            doTheThings();
        } catch (e) {
            writeln(e);
            firstHmsfText.text = timeToCurrentFormat(0, 25);
            firstSlider.value = 0;
        }
    };

    lastHmsfText.onChange = function() {
        //parse the user input
        try {
            var parsedTime = currentFormatToTime(lastHmsfText.text, theComp.frameRate);
            //propogate it to the slider
            lastSlider.value = parsedTime / theComp.duration * 100;

            //update the other slider if there are conflicts
            firstSlider.value = Math.min(firstSlider.value, lastSlider.value);

            //normalise the value back to the editbox
            lastHmsfText.text = timeToCurrentFormat(parsedTime, theComp.frameRate);
            doTheThings();
        } catch (e) {
            writeln(e);
            lastHmsfText.text = timeToCurrentFormat(theComp.duration, 25);
            lastSlider.value = theComp.duration;
        }
    };
    //convert slider position into useful values for the functions


    firstBttn.onClick = function() {
        theComp = app.project.activeItem;
        if (!theComp) {
            alert('no comp is active');
        } else {
            //propogate it to the slider
            firstSlider.value = theComp.time / theComp.duration * 100;

            //update the other slider if there are conflicts
            lastSlider.value = Math.max(firstSlider.value, lastSlider.value);

            //propogate the value to the editbox
            firstHmsfText.text = percentToHMSF(firstSlider.value);
            doTheThings();
        }
    };

    lastBttn.onClick = function() {
        theComp = app.project.activeItem;
        if (!theComp) {
            alert('no comp is active');
        } else {
            //propogate it to the slider
            lastSlider.value = theComp.time / theComp.duration * 100;

            //update the other slider if there are conflicts
            firstSlider.value = Math.min(firstSlider.value, lastSlider.value);

            //propogate the value to the editbox
            lastHmsfText.text = percentToHMSF(lastSlider.value);
            doTheThings();
        }
    };

    //These functions map linear slider values to more useful values for the functions
    const sliderPower = 0.5;

    function mapSliderToVal(n) {
        return (n > 0.999) ? //deal with 1 / 0 issues
            1000 :
            Math.max(0, Math.pow(1 / (1 - n) - 1, sliderPower));
    }

    function mapEditToVal(n) {
        return 1 - 1 / (Math.pow(n, 1 / sliderPower) + 1);
    }

    fnTypeDropDown.onChange = function() {
        if (fnTypeDropDown.selection.index === 0) {
            pwrSlider.value = 0.5;
            pwrEdit.value = '1';
        }
        doTheThings();
    };

    pwrEdit.onChange = function() {
        if (fnTypeDropDown.selection.index === 0) {
            fnTypeDropDown.selection = 1;
        }
        pwrSlider.value = mapEditToVal(parseFloat(pwrEdit.text, 10));
        doTheThings();
    };

    pwrSlider.onChange = function() {

        if (fnTypeDropDown.selection.index === 0) {
            fnTypeDropDown.selection = 1;
        }
        pwrEdit.text = '' + Math.round(mapSliderToVal(pwrSlider.value) * 1000) / 1000;
        doTheThings();
    };



    trimChckBox.onClick =
        moveChckBox.onClick =
        function() {
            firstInOrOutDD.visible =
                lastInOrOutDD.visible =
                moveChckBox.value;
            // doTheThings();
        }

    inChckBox.onClick =
        outChckBox.onClick = function() {
            if (!trimChckBox.value) {
                doTheThings();
            }
        };


    function doTheThings() {
        theComp = app.project.activeItem;
        if (theComp) {
            app.beginUndoGroup('sequence layers plus');
            var order = orderDropDown.selection.text;
            var firstTime = theComp.duration * firstSlider.value / 100;
            var lastTime = theComp.duration * lastSlider.value / 100;
            var ease = fnTypeDropDown.selection.text;
            var easePower = mapSliderToVal(pwrSlider.value);
            var regularity = regularitySlider.value / 100;
            var doInPoints = inChckBox.value;
            var moveNotTrim = moveChckBox.value;
            var firstInOrOut = firstInOrOutDD.selection.index;
            var lastInOrOut = lastInOrOutDD.selection.index;
            sequenceLayers(order, firstTime, lastTime, ease, easePower, regularity, doInPoints, theComp, moveNotTrim, firstInOrOut, lastInOrOut); //, randozCheckbox.value);
            app.endUndoGroup();
        }
    }

    if (theWindow instanceof Window) {
        theWindow.center();
        theWindow.show();
    } else {
        theWindow
            .layout
            .layout(true);
    }
}

buildGUI(this);