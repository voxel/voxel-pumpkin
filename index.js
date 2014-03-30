'use strict';

var ucfirst = require('ucfirst');
var ItemPile = require('itempile');

module.exports = function(game, opts) {
  return new PumpkinPlugin(game, opts);
};

module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-recipes', 'voxel-use']
};

function PumpkinPlugin(game, opts) {
  this.game = game;
  // allow changing carved face after carving it once? (reorienting)
  this.allowRecarving = typeof opts.allowRecarving !== 'undefined' ? opts.allowRecarving : true;


  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-pumpkin requires voxel-registry plugin');
  this.use = game.plugins.get('voxel-use');
  if (!this.use) throw new Error('voxel-pumpkin requires voxel-use plugin');
  this.recipes = game.plugins.get('voxel-recipes'); // optional

  // block states, textures, names

  this.states = ['natural',
    'carvedNorth', 'carvedSouth', 'carvedWest', 'carvedEast',
    'carvedNorthLit', 'carvedSouthLit', 'carvedWestLit', 'carvedEastLit',
    ];

  // states correspond to array indices of this.state TODO: cleanup
  this.side2state = {unlit:{north: 1, south: 2, west: 3, east: 4},
                    lit:{north: 5, south: 6, west: 7, east: 8}};
  this.toggleLit = {1:5, 2:6, 3:7, 4:8, // light up
    5:1, 6:2, 7:3, 8:4}; // extinguish
  this.stateIsLit = {0:false, 1:false, 2:false, 3:false, 4:false,
    5:true, 6:true, 7:true, 8:true};


  this.textures = [
    ['pumpkin_top', 'pumpkin_side'],
    // back, front, top, bottom, left, right
    ['pumpkin_face_off', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
    ['pumpkin_side', 'pumpkin_face_off', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
    ['pumpkin_side', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_face_off', 'pumpkin_side'],
    ['pumpkin_side', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_face_off'],

    // lit
    ['pumpkin_face_on', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
    ['pumpkin_side', 'pumpkin_face_on', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
    ['pumpkin_side', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_face_on', 'pumpkin_side'],
    ['pumpkin_side', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_face_on'],

    /* TODO: support objects in voxel-registry
    {top:'pumpkin_top', bottom:'pumpkin_top', front:'pumpkin_face_off', back:'pumpkin_side', left:'pumpkin_side', right:'pumpkin_side'},
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
    'Jack-o\'-Lantern North',
    'Jack-o\'-Lantern South',
    'Jack-o\'-Lantern West',
    'Jack-o\'-Lantern East',
    ];


  this.enable();
};

// get a direction for a face facing towards the player, XZ plane
PumpkinPlugin.prototype.facingPlayer = function() {
  var heading = Math.atan2(self.game.cameraVector()[0], self.game.cameraVector()[2]);
  var dir;
  if (Math.abs(heading) <= Math.PI / 4) { // 0 +/- 45 degrees
    return 'north';
  } else if (Math.PI - Math.abs(heading) <= Math.PI / 4) { // +/-180 +/- 45
    return 'south';
  } else if (heading > 0) { // +90 +/- 45
    return 'west';
  } else { // if (heading <= 0) { // -90 +/- 45
    return 'east';
  }
};

PumpkinPlugin.prototype.enable = function() {
  var self = this;

  // items that place blocks with player-facing orientation
  this.registry.registerItem('pumpkin', {
    itemTexture: this.textures[0],
    onUse: function(held, target) {
      self.use.useBlock(target, new ItemPile('pumpkinNatural'));
      return true; // consume held item
    },
    creativeTab: 'plants'
  });
  this.registry.registerItem('pumpkinCarved', {
    itemTexture: this.textures[2], // unlit item always facing right
    displayName: 'Carved Pumpkin',
    onUse: function(held, target) {
      self.use.useBlock(target, new ItemPile('pumpkinCarved' + ucfirst(self.facingPlayer())));
      return true;
    },
    creativeTab: 'plants'
  });
  this.registry.registerItem('jackolantern', {
    itemTexture: this.textures[6],
    displayName: 'Jack-o\'-Lantern',
    onUse: function(held, target) {
      self.use.useBlock(target, new ItemPile('pumpkinCarved' + ucfirst(self.facingPlayer()) + 'Lit'));
      return true;
    },
    creativeTab: 'plants'
  });


  // blocks for voxels in the world
  this.registry.registerBlocks('pumpkin', this.states.length, {
    names: this.states.map(function(state) { 
             return 'pumpkin' + ucfirst(state);
           }),
    texture: function(offset) { 
      return self.textures[offset] || self.textures[0];
    },
    displayName: function(offset) {
      return self.displayNames[offset] || 'Pumpkin '+offset;
    },
    creativeTab: false, // hide blocks - the items above are meant to be user-visible instead
    itemDrop: function(offset) {
      if (self.states[offset] === 'natural') {
        return 'pumpkin';
      }
      // drop a non-directional item, instead of our directional block itself -- the
      // item places a block in the correct orientation (based on player heading)
      return self.stateIsLit[offset] ? 'jackolantern' : 'pumpkinCarved';
    },
  });

  // TODO: move to separate modules? shearable, flammable..
  this.registry.registerItem('shears', {itemTexture: 'items/shears', toolClass: 'shears', onUse: this.useShears.bind(this)});

  if (this.recipes) {
    this.recipes.registerPositional([
        [undefined, 'ingotIron'],
        ['ingotIron', undefined],
        ], ['shears']);
  }

  this.registry.registerItem('lighter', {itemTexture: 'items/flint_and_steel', toolClass: 'lighter', onUse: this.useLighter.bind(this)});
};

PumpkinPlugin.prototype.disable = function() {
};

PumpkinPlugin.prototype.useShears = function(held, target) {
  console.log('used shears on',held,target);

  if (!target) return;

  var blockIndex = this.game.getBlock(target.voxel);

  if (this.registry.getBlockBaseName(blockIndex) !== 'pumpkinNatural') {
    // not a pumpkin of any type!
    return;
  }

  var meta = this.registry.getBlockMeta(blockIndex);

  console.log('meta',meta, this.states[meta]);

  if (this.states[meta] !== 'natural' && !this.allowRecarving) {
    // only uncarved pumpkins can be carved if !this.allowRecarving
    return;
  }

  var isLit = this.stateIsLit[meta];

  var newMeta = this.side2state[isLit ? 'lit' : 'unlit'][target.side];
  console.log('newMeta',newMeta);
  if (newMeta === undefined) return;

  this.game.setBlock(target.voxel, this.registry.changeBlockMeta(blockIndex, newMeta));
  // TODO: shears durability
};

PumpkinPlugin.prototype.useLighter = function(held, target) {
  if (!target) return;

  var blockIndex = this.game.getBlock(target.voxel);

  if (this.registry.getBlockBaseName(blockIndex) !== 'pumpkinNatural') { // note: base block; includes all meta
    // TODO: support lighting other blocks on fire
    return;
  }

  var meta = this.registry.getBlockMeta(blockIndex);

  var newMeta = this.toggleLit[meta];
  if (newMeta === undefined) return;

  this.game.setBlock(target.voxel, this.registry.changeBlockMeta(blockIndex, newMeta));
  // TODO: lighter durability
};


