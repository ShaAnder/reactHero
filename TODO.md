Next major goal:

To add random dungeon layouts with entry / exit

I want the player to be start on a level 1, so to speak, the player will be able to navigate a randomly generated dungeon to find the exit which will then generate a new map taking them to level 2. This will go on until the player reaches a final level, level 10 which will have a massive room with a boss creature for them to kill

what needs to happen:

- The maps should be generated randomly, using a random walker algorithm
- The maps need to be validated to ensure the exit is reachable
- the maps will be roughly 64 x 64 in size with around 2500 tiles

order of operations

- Walkers start in a select area and carve a 3 x 3 room, from there they begin spreading out and creating the dungeon
- once the walkers finish, we validate the dungeon to ensure the exit is reachable
- once this validation is completed set loading to false, load the map into the gamestate and load player object at the start
- The player object is then spawned in, and raycasting begins

WE want the player to start in a 3x3 tile same as where teh walkers begin to ensure the player is always inside a space that is
not encompassed by a wall

- we will remove the old map
- remove all hardcoded player start positions
- create an exit tile so that when the user interacts with (e key or something) they will initialize the process again for level 2 and so on

- we also want to add a theme state at some point so the player can choose to set the theme of the run, and load appropriate textures / enemies
  to match but this is optional for later
