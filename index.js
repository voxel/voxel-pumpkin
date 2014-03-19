'use strict';

module.exports = function(game, opts) {
  return new PumpkinPlugin(game, opts);
};

function PumpkinPlugin(game, opts) {
  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-pumpkin requires voxel-registry plugin');

  this.states = ['uncarved',
    'carvedNorth', 'carvedEast', 'carvedSouth', 'carvedWest',
    //'carvedNorthLit', 'carvedEastLit', 'carvedSouthLit', 'carvedWestLit',
    ];

  // TODO: textures
  // pumpkin_face_off.png           pumpkin_side.png               
  // pumpkin_face_on.png            pumpkin_top.png        
  
  // TODO: shears to carve on given face
  // TODO: flint/steel to light/extinguish

  this.enable();
};

PumpkinPlugin.prototype.enable = function() {
  this.registry.registerBlocks('pumpkin', this.states.length, {});
};

PumpkinPlugin.prototype.disable = function() {
};

