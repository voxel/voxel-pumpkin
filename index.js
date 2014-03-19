'use strict';

module.exports = function(game, opts) {
  return new PumpkinPlugin(game, opts);
};

function PumpkinPlugin(game, opts) {
  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-pumpkin requires voxel-registry plugin');

  this.states = ['uncarved',
    'carvedNorth', 'carvedSouth', 'carvedWest', 'carvedEast',
    //'carvedNorthLit', 'carvedEastLit', 'carvedSouthLit', 'carvedWestLit',
    ];

  this.textures = [
    ['pumpkin_top', 'pumpkin_side'],
    // back, front, top, bottom, left, right
    ['pumpkin_side', 'pumpkin_face_off', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
    ['pumpkin_face_off', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
    ['pumpkin_side', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_face_off'],
    ['pumpkin_side', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_face_off', 'pumpkin_side'],

    /* TODO: support objects in voxel-registry
    {top:'pumpkin_top', bottom:'pumpkin_top', front:'pumpkin_face_off', back:'pumpkin_side', left:'pumpkin_side', right:'pumpkin_side'}, // TODO: confirm directions
    {top:'pumpkin_top', bottom:'pumpkin_top', front:'pumpkin_side', back:'pumpkin_face_off', left:'pumpkin_side', right:'pumpkin_side'},
    {top:'pumpkin_top', bottom:'pumpkin_top', front:'pumpkin_side', back:'pumpkin_side', left:'pumpkin_face_off', right:'pumpkin_side'},
    {top:'pumpkin_top', bottom:'pumpkin_top', front:'pumpkin_side', back:'pumpkin_side', left:'pumpkin_side', right:'pumpkin_face_off'},
    */
  ];

  this.displayNames = [
    'Pumpkin',
    'Pumpkin Carved North',
    'Pumpkin Carved South',
    'Pumpkin Carved East',
    'Pumpkin Carved West',
    ];


  // pumpkin_face_off.png           pumpkin_side.png               
  // pumpkin_face_on.png            pumpkin_top.png        
  
  // TODO: shears to carve on given face
  // TODO: flint/steel to light/extinguish

  this.enable();
};

PumpkinPlugin.prototype.enable = function() {
  var self = this;

  this.registry.registerBlocks('pumpkin', this.states.length, {
    names: this.states,
    texture: function(offset) { 
      return self.textures[offset] || self.textures[0];
    },
    displayName: function(offset) {
      return self.displayNames[offset] || 'Pumpkin '+offset;
    },
  });
};

PumpkinPlugin.prototype.disable = function() {
};

