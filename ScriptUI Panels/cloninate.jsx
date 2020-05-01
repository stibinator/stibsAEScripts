// @target aftereffects
//the cloninator clones an item in a comp and creates a
// new source for it in the project (c)2016 Stephen Dixon
/// @includepath "../(lib)"
/// @include "duplicate layer source.jsx"


var scriptName = 'cloninateLayer';

function reinstateButton(theButton) { //reinstate a button with an oldValue property
  if (!theButton.enabled) { //turn on the footage button and reinstate its value if needs be
    theButton.value = theButton.oldValue;
    theButton.enabled = true;
  }
}

function findDuplicateSourceItems(theName) {
  var allItems = app.project.items;
  var j;
  for (j = 1; j <= allItems.length; j++) {
    if (app.project.items[j].name === theName) {
      return true;
    }
  }

  return false;
}
function cloninateComp(originalComp, recursionLimit, recurseFootageToo, recursionDepth) {
  var newSource;
  var oldSource;
  var otherLayers;
  var i;
  var nsLyr;
  var re;
  var m;
  var oldSourceSerial;
  var oldSourceBaseName;
  var newSourceSerial;
  var wasLocked;
  var otherLayer;

  // recursionLimit < 0 means infinite. We start at recursion level = 0 so if the
  // user has limited it to 0 recursions only dupe the outer layer
  if (recursionLimit < 0 || recursionDepth <= recursionLimit) {
          

      //easy peasy, the source is a comp
        newSource = oldSource.duplicate();
        if (recurseFootageToo) {
          for (i = 1; i <= newSource.layers.length; i++) {
            //cloninateLayer, recursing, with footage, replacing
            $.writeln ("newSource.layers["+i+"].name " + newSource.layers[i].name);
            cloninateLayer(newSource.layers[i], recursionLimit, recurseFootageToo, true, recursionDepth + 1);
          }
        } else {
          for (nsLyr = 1; nsLyr <= newSource.layers.length; nsLyr++) {
            // cloninate all the comp layers in the new comp,
            if (newSource.layers[nsLyr].source !== null) {
              //  ignore footage layers
              if (newSource.layers[nsLyr].source.typeName === 'Composition') {
                //cloninateLayer, recursively, not the footage, replace the source layers
                cloninateLayer(newSource.layers[nsLyr], recursionLimit, recurseFootageToo, true, recursionDepth + 1);
              }
            }
          }
        }
      } 

        // now rename the source with a unique name find a serialnumber suffix if one exists e.g. mypic.jpg_1 
        // everyone stand back… 
        // the RE matches any string that doesn't
        // end in a number, followed by a number. eg foo99bar_9 will match
        // (foo99bar_)(9)
        re = /(.*[^\d])*(\d*)$/;

        m = oldSource.name.match(re);
        oldSourceSerial = m[2];
        oldSourceBaseName = m[1];

        //default serial number
        newSourceSerial = 1;

        // if no match, then the source doesn't have a serial number. One of these
        // should catch it
        if (typeof(oldSourceSerial) === 'undefined' || oldSourceSerial === '' || isNaN(parseInt(oldSourceSerial, 10))) {
          // since there was no serial we add a separator onto the base name so that it
          // becomes basename_1 etc
          oldSourceBaseName = oldSource.name + '_';
        } else {
          //there was a serial number, so increment it
          newSourceSerial = 1 + parseInt(oldSourceSerial, 10);
        }

        if (!oldSourceBaseName) {
          oldSourceBaseName = oldSource.name;
        } //shouldn't happen, but you know, regex..
        // we need to check to see if a source layer with the new serial number exists,
        // and if it does we keep incrementing the serial until it doesn't
        while (findDuplicateSourceItems('' + oldSourceBaseName + newSourceSerial)) {
          newSourceSerial++;
        }

        //set the name of the new source layer
        newSource.name = '' + oldSourceBaseName + newSourceSerial;
      }

function cloninateLayer(originalLayer, recursionLimit, recurseFootageToo, replaceOriginal, recursionDepth) {
  var newSource;
  var oldSource;
  var otherLayers;
  var i;
  var nsLyr;
  var re;
  var m;
  var oldSourceSerial;
  var oldSourceBaseName;
  var newSourceSerial;
  var wasLocked;
  var otherLayer;

  // recursionLimit < 0 means infinite. We start at recursion level = 0 so if the
  // user has limited it to 0 recursions only dupe the outer layer
  if (recursionLimit < 0 || recursionDepth <= recursionLimit) {
      oldSource = originalLayer.source;
      otherLayers = originalLayer.containingComp.layers;
    
    if (!isValid(oldSource)) {
      // shape and text layers have no source - no point duplicating them in nested comps but
      // we will duplicate them in this comp if the user wants to say, duplicate all
      // the layers selected
      if (recursionDepth === 0 && !replaceOriginal) {
        newLayer = originalLayer.duplicate();
      }
    } else {
      if (oldSource.typeName === 'Composition') {
      //easy peasy, the source is a comp
        newSource = oldSource.duplicate();
        if (recurseFootageToo) {
          for (i = 1; i <= newSource.layers.length; i++) {
            //cloninateLayer, recursing, with footage, replacing
            $.writeln ("newSource.layers["+i+"].name " + newSource.layers[i].name);
            cloninateLayer(newSource.layers[i], recursionLimit, recurseFootageToo, true, recursionDepth + 1);
          }
        } else {
          for (nsLyr = 1; nsLyr <= newSource.layers.length; nsLyr++) {
            // ignore all source-less layers,
            if (newSource.layers[nsLyr].source !== null) {
              //  ignore footage layers
              if (newSource.layers[nsLyr].source.typeName === 'Composition') {
                //cloninateLayer, recursively, not the footage, replace the source layers
                cloninateLayer(newSource.layers[nsLyr], recursionLimit, recurseFootageToo, true, recursionDepth + 1);
              }
            }
          }
        }
      } else {
        // not a composition
        // the layer is a footage layer - but it could be a solid
       
        if (!(oldSource.mainSource.file)) { //looks like we got a solid layer or a camera
          //This next bit is a bit hacky make a new solid
          newLayer = app.project.activeItem.layers.addSolid(oldSource.mainSource.color, oldSource.name, oldSource.width, oldSource.height, oldSource.pixelAspect);

          //set newSource to the source of that solid
          newSource = newLayer.source;

          // delete the solid from the comp - which doesn't delete it from the project. So
          // when we duplicate the layer we can replace its source with the new solid
          // thus keeping all the attributes of the duplicated layer, but creating a new
          // source
          app.project.activeItem.layer(newLayer.index).remove();
        } else {
          //the source is a footage item, but not a solid so duplicate the source
          newSource = duplicateLayerSource(originalLayer);
       }

        // now rename the source with a unique name find a serialnumber suffix if one exists e.g. mypic.jpg_1 
        // everyone stand back… 
        // the RE matches any string that doesn't
        // end in a number, followed by a number. eg foo99bar_9 will match
        // (foo99bar_)(9)
        re = /(.*[^\d])*(\d*)$/;

        m = oldSource.name.match(re);
        oldSourceSerial = m[2];
        oldSourceBaseName = m[1];

        //default serial number
        newSourceSerial = 1;

        // if no match, then the source doesn't have a serial number. One of these
        // should catch it
        if (typeof(oldSourceSerial) === 'undefined' || oldSourceSerial === '' || isNaN(parseInt(oldSourceSerial, 10))) {
          // since there was no serial we add a separator onto the base name so that it
          // becomes basename_1 etc
          oldSourceBaseName = oldSource.name + '_';
        } else {
          //there was a serial number, so increment it
          newSourceSerial = 1 + parseInt(oldSourceSerial, 10);
        }

        if (!oldSourceBaseName) {
          oldSourceBaseName = oldSource.name;
        } //shouldn't happen, but you know, regex..
        // we need to check to see if a source layer with the new serial number exists,
        // and if it does we keep incrementing the serial until it doesn't
        while (findDuplicateSourceItems('' + oldSourceBaseName + newSourceSerial)) {
          newSourceSerial++;
        }

        //set the name of the new source layer
        newSource.name = '' + oldSourceBaseName + newSourceSerial;
      }
      //now back to the comp. Duplicate the layer
      newLayer = originalLayer.duplicate();
      
      wasLocked = false;
      //replacing the original layer means duplicating and deleting
      if (replaceOriginal) {
        if (originalLayer.locked) {
          originalLayer.locked = false;
          wasLocked = true;
        }
        //we're killing the parent, so we need the replacement to adopt its children
        for (otherLayer = 1; otherLayer <= otherLayers.length; otherLayer++) {
          if (otherLayers[otherLayer].parent === originalLayer) {
            otherLayers[otherLayer].parent = newLayer;
          }
        }
        //delete
        originalLayer.remove();
      }

      //and set the source of that layer to the newly created project source item
      
      newLayer.replaceSource(newSource, fixExpressions = true);
      
      if (wasLocked) { //close the gate behind us
        newLayer.locked = true;
      }
    }
  }
}

function buildUI(thisObj) {
  var cloninateLayerBttn;
  var replacinateBttn;
  var recurseGrp;
  var levelGroup;
  var infiniteRecurseBttn;
  var recursionLimitTextBx;
  var footageTooChkbx;
  var btnGrp;
  if (thisObj instanceof Panel) {
    pal = thisObj;
  } else {
    pal = new Window('palette', scriptName, undefined, {resizeable: true});
  }

  if (pal !== null) {
    btnGrp = pal.add('group', undefined, {orientation: 'row'});
    cloninateLayerBttn = btnGrp.add('button', [
      undefined, undefined, 90, 22
    ], 'cloninateLayer');
    replacinateBttn = btnGrp.add('button', [
      undefined, undefined, 90, 22
    ], 'replacinate');

    footageTooChkbx = pal.add('checkbox', [
      undefined, undefined, 180, 22
    ], ' replace footage in subcomps');

    recurseGrp = pal.add('panel', undefined, 'recursion level', {alignChildren: "left"});
    recurseGrp.orientation = 'column';

    levelGroup = recurseGrp.add('group', undefined, {
      orientation: 'row',
      alignChildren: "left"
    });
    levelGroup.alignChildren = ['left', 'center'];
    infiniteRecurseBttn = levelGroup.add('checkbox', [
      undefined, undefined, 100, 22
    ], 'infinite');
    recursionLimitTextBx = levelGroup.add('editText', [
      undefined, undefined, 30, 22
    ], '1');

    levelGroup.add('staticText', undefined, 'limit:');
    recursionLimitTextBx.enabled = true;
    recursionLimitTextBx.width = 40;
    infiniteRecurseBttn.value = false;
    footageTooChkbx.value = false;
    footageTooChkbx.oldValue = false; // see below

    infiniteRecurseBttn.onClick = function() {
      // turn off 'footageTooChkbx' checkbox, because it doesn't make sense with the
      // "selected only" checkbox on.
      if (infiniteRecurseBttn.value) {
        reinstateButton(footageTooChkbx);
        recursionLimitTextBx.enabled = false; //infinite overrides the limit
      } else {
        recursionLimitTextBx.enabled = true;
        if (parseInt(recursionLimitTextBx.text, 10) === 0) {
          // both recursion methods are off so turn off the footage switch remember the
          // value so it can be reinstated when I uncheck the "selected only" checkbox
          footageTooChkbx.oldValue = footageTooChkbx.value;

          //turn it off so it's unambiguous
          footageTooChkbx.value = false;
          footageTooChkbx.enabled = false;
        }
      }
    };

    recursionLimitTextBx.onChange = function() {
      if (isNaN(parseInt(recursionLimitTextBx.text, 10))) {
        recursionLimitTextBx.text = 0;
      }

      if (parseInt(recursionLimitTextBx.text, 10) === 0) { //user set no recursion
        infiniteRecurseBttn.value = false;

        // recursion is off so turn off the footage switch remember the value so it can
        // be reinstated when I uncheck the "selected only" checkbox
        footageTooChkbx.oldValue = footageTooChkbx.value;

        //turn it off so it's unambiguous
        footageTooChkbx.value = false;
        footageTooChkbx.enabled = false;
      } else if (parseInt(recursionLimitTextBx.text, 10) < 0) { //user set <0 recursion => infinite
        infiniteRecurseBttn.value = true;
        recursionLimitTextBx.enabled = false;
        reinstateButton(footageTooChkbx);
      } else if (parseInt(recursionLimitTextBx.text, 10) > 0) { //user set limited recursion
        infiniteRecurseBttn.value = false;
        reinstateButton(footageTooChkbx);
      }
    };

    cloninateLayerBttn.onClick = function() {
      // do the hoo-hah
      var originalLayers = app.project.activeItem.selectedLayers;
      var i;
      // var layerHistory = [];
      // recursionLimit of -1 == infinite recursion
      var recursionLimit = (infiniteRecurseBttn.value)
        ? -1
        : parseInt(recursionLimitTextBx.text, 10);
     

      app.beginUndoGroup('cloninator');
      originalIsCompInProjectWindow = (originalLayers.length === 0) ;
      if (originalIsCompInProjectWindow){
        cloninateComp(app.project.activeItem, recursionLimit, footageTooChkbx.value, 0 );
      } else {
        for (i = 0; i < originalLayers.length; i++) {
          cloninateLayer(originalLayers[i], recursionLimit, footageTooChkbx.value, false, 0 );
          originalLayers[i].selected = true
        }
      }
      app.endUndoGroup();
    };

    replacinateBttn.onClick = function() {
      // do the hoo-hah
      var originalLayers = app.project.activeItem.selectedLayers;
      var i;
      // var layerHistory = [];
      // recursionLimit of -1 == infinite recursion
      var recursionLimit = (infiniteRecurseBttn.value)
        ? -1
        : parseInt(recursionLimitTextBx.text, 10);
     

      app.beginUndoGroup('cloninator');
      originalIsCompInProjectWindow = (originalLayers.length === 0) ;
      if (! originalIsCompInProjectWindow){
        for (i = 0; i < originalLayers.length; i++) {
          cloninateLayer(originalLayers[i], recursionLimit, footageTooChkbx.value, false, 0 );
          originalLayers[i].selected = true
        }
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

buildUI(this);
//cloninateLayer(app.project.activeItem.selectedLayers[0], -1, true, false, 0);
