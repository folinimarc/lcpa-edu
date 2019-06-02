'use strict';

initStory();
var ecoReclassMenu = new EcoReclassificationMenu(S['ecoReclassContainerId'], S['ecoReclassInitialValues'], reclassEco);
var slopeReclassMenu = new SlopeReclassificationMenu(S['slopeReclassContainerId'], S['slopeReclassInitialUpperlimitValues'], reclassSlope);
var canvas = new CanvasBg('test', 'canvas-bg', 'data/bg_photo.jpg')


function reclassEco() {
    console.log('ECO')
}

function reclassSlope() {
    console.log('SLOPE')
}