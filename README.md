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

For another example of block metadata, see also [voxel-wool](https://github.com/deathcap/voxel-wool).

Note: the above screenshot uses the [ProgrammerArt](https://github.com/deathcap/ProgrammerArt) v2.0
texture pack, but other packs can be used; for example, using Minecraft (not included):

![screenshot](http://i.imgur.com/6RJKOXt.png "Screenshot")

## License

MIT

