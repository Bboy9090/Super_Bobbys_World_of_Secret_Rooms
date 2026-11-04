# Bobby's House of Hidden Doors — Product Split Plan

## Decision

**Bobby's House of Hidden Doors** is an entertainment / puzzle-adventure product.

It must not be implemented by simply renaming the current `Super_Bobbys_World_of_Secret_Rooms` codebase because that repository currently implements a device/compliance world-map platform with repair, ownership-verification, audit, legal-classification, and authority-routing services.

## Preserve current lineage

The existing repository remains intact as the systems/navigation project until its own public identity is separately resolved.

Do not relabel:
- device-analysis services,
- ownership-verification services,
- legal-classification services,
- audit-logging,
- authority-routing,
- repair/compliance workflows,
- existing backend APIs

as game features.

## New entertainment product canon

Public name: **Bobby's House of Hidden Doors**

Tagline: **Every room is hiding something.**

Genre:
- puzzle adventure
- exploration
- hidden passages
- environmental mysteries
- keys / locks
- secret rooms
- impossible architecture

Core loop:
1. Enter a room.
2. Inspect the environment.
3. Discover physical or logic clues.
4. Reveal a hidden door / passage / mechanism.
5. Solve the next-room access condition.
6. Collect keys, room records, and house secrets.
7. Unlock deeper wings of the house.

Initial campaign structure:
- Ground Floor
- Basement
- Attic
- Workshop
- After Dark
- The Impossible Wing

## Brand system

### Icon
- House silhouette
- one impossible glowing doorway
- staircase or room visible through a space that cannot physically fit inside the house
- readable at 32 px
- no text in the icon

### Splash
- normal house silhouette
- wall slides / rotates
- hidden doorway appears
- nested impossible doorway opens
- title resolves: **Bobby's House of Hidden Doors**
- tagline: **Every room is hiding something.**

## Asset targets
- 1024×1024 store icon
- 512/192 PWA icons
- Android adaptive foreground/background
- 2732×2732 splash master
- 1920×1080 marketing hero
- 6–8 store screenshots
- 15–30 second promo/trailer storyboard

## Engineering bootstrap

When a dedicated repository is available, start with:
- deterministic room/door graph
- save-state format
- puzzle-state machine
- interactable object contract
- inventory/key system
- room transition system
- accessibility settings
- controller/touch/mouse input abstraction
- automated puzzle-state tests

No device-repair, ownership-verification, or compliance services should be copied into the entertainment game.
