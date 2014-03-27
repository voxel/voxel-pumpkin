'use strict';

var ucfirst = require('ucfirst');

module.exports = function(game, opts) {
  return new PumpkinPlugin(game, opts);
};

module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-recipes']
};

function PumpkinPlugin(game, opts) {
  this.game = game;
  // allow changing carved face after carving it once? (reorienting)
  this.allowRecarving = typeof opts.allowRecarving !== 'undefined' ? opts.allowRecarving : true;


  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-pumpkin requires voxel-registry plugin');
  this.recipes = game.plugins.get('voxel-recipes'); // optional

  this.states = ['uncarved',
    'carvedNorth', 'carvedSouth', 'carvedWest', 'carvedEast',
    'carvedNorthLit', 'carvedEastLit', 'carvedSouthLit', 'carvedWestLit',
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
    'Jack-o\'-Lantern East',
    'Jack-o\'-Lantern West',
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
    names: this.states.map(function(state) { 
             if (state === 'uncarved') return 'pumpkin';
             return 'pumpkin' + ucfirst(state);
           }),
    texture: function(offset) { 
      return self.textures[offset] || self.textures[0];
    },
    displayName: function(offset) {
      return self.displayNames[offset] || 'Pumpkin '+offset;
    },
    creativeTab: 'plants'
  });

  // TODO: move to separate modules? shearable, flammable..
  this.registry.registerItem('shears', {itemTexture: 'items/shears', toolClass: 'shears', onUse: this.useShears.bind(this)});

  if (this.recipes) {
    // TODO: 2x2 recipe after https://github.com/deathcap/craftingrecipes/issues/2
    this.recipes.registerPositional([
        [undefined, 'ingotIron', undefined],
        ['ingotIron', undefined, undefined],
        [undefined, undefined, undefined]
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

  if (this.registry.getBlockBaseName(blockIndex) !== 'pumpkin') {
    // not a pumpkin of any type!
    return;
  }

  var meta = this.registry.getBlockMeta(blockIndex);

  console.log('meta',meta, this.states[meta]);

  if (this.states[meta] !== 'uncarved' && !this.allowRecarving) {
    // only uncarved pumpkins can be carved (by default)
    // TODO: fix recarving jack-o'-lanterns?
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

  if (this.registry.getBlockBaseName(blockIndex) !== 'pumpkin') {
    // TODO: support lighting other blocks on fire
    return;
  }

  var meta = this.registry.getBlockMeta(blockIndex);

  var newMeta = this.toggleLit[meta];
  if (newMeta === undefined) return;

  this.game.setBlock(target.voxel, this.registry.changeBlockMeta(blockIndex, newMeta));
  // TODO: lighter durability
};


