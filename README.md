# voxel-pumpkin

Carvable pumpkin blocks, a directional block metadata demonstration (voxel.js plugin)

![screenshot](http://i.imgur.com/zUcN9YH.png "Screenshot")

Uses [voxel-registry](https://github.com/deathcap/voxel-registry) metablocks for the
pumpkin block orientation (`registerBlocks()`, `getBlockMeta()`, `changeBlockMeta()` etc.).
The base `pumpkin` block has no face:

![screenshot](http://i.imgur.com/P4GMB0Y.png "Screenshot")

It can be right-clicked with the shears item to "carve" it on the clicked
face (hit detection from [voxel-use](https://github.com/deathcap/voxel-use)). By default,
pumpkins can only be carved once, but the `allowRecarving` option can be set to allow
shears to change the carved side even if it has already been carved once.

You can also "light up" or extinguish pumpkins by right-clicking with a lighter;
this turns a carved pumpkin into a jack-o'-lantern or vice versa.

When a block is mined, it drops (using [voxel-harvest](https://github.com/deathcap/voxel-harvest))
an item which has no direction, unlike the blocks. Using this item by right-clicking in the world
(with [voxel-use](https://github.com/deathcap/voxel-use)) places a block with an appropriate
direction such that the carved side faces the player. In this way, blocks can be picked up
as items and reoriented by the player.

For another, simpler, example of block metadata, see also [voxel-wool](https://github.com/deathcap/voxel-wool).

Note: the above screenshot uses the [ProgrammerArt](https://github.com/deathcap/ProgrammerArt) v2.0
texture pack, but other packs can be used; for example, here are some pumpkins
including a jack-o'-lantern and carved pumpkin
using the [Sphax](http://bdcraft.net/) 64x texture pack (not included):

![screenshot](http://i.imgur.com/kPXHIhT.png "Screenshot")

## License

MIT

