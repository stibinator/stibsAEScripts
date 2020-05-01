/// @target aftereffects

// eslint-disable-next-line
/// @includepath "./(lib)"
// eslint-disable-next-line
/// @include  getproperties.jsx
/* global app, getPropertiesWithExpressionsFromLayer */

alert("hello");
var proj = app.project;
var itms = proj.items;
alert(itms.length);
var theProps = getPropertiesWithExpressionsFromLayer(app.project.currentItem.selectedLayers, false);
alert(theProps.length)