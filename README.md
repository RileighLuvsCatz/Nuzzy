# Nuzzy - Nuzlocke Tracker

A web-based tracking tool for Pokémon Nuzlocke challenge runs. Built with React, TypeScript, and Tailwind CSS.

**Currently Supporting:** Pokémon Emerald  
**Next Up:** Pokémon Radical Red, DS Pokémon Titles

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## Current Status

Nuzzy is in active, early development. The core tracker loop is functional for Pokémon Emerald:

- **Run management** -- Create, name, and persist multiple runs via localStorage (includes schema migration for older saves)
- **Encounter logging** -- Log catches per route from the game's catch pool, assign nicknames, and track status (Alive / Dead / Boxed)
- **Boss reference** -- View boss trainer teams (Pokémon, types, moves, held items) inline with the route progression
- **Multi-run support** -- Switch between saved runs from the navbar; runs are stored in a versioned library
- **Routing** -- Navigation between landing, new-run creation, and the tracker view

The landing page is currently a stub and is the next area of focus.

## Features

### Implemented

- Run creation with game selection
- Progression-ordered tracker (routes and boss fights in game order)
- Per-route encounter logging with species selection from catch pools
- Encounter status tracking (Alive / Dead / Boxed)
- Boss team reference tables (species, types, moves, items)
- localStorage persistence with migration support
- Navbar with run switcher
- Game data packs for Emerald (route data, boss teams, progression order)

### Planned

- Landing page with project overview
- Emerald Seaglass game pack (data exists, integration in progress)
- Type coverage analysis
- Run statistics and analytics
- Graveyard view for fallen Pokémon
- Export/import functionality
- Radical Red and mainline game support

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Routing:** React Router 7
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript 5.9
- **Linting:** ESLint 9

## What is a Nuzlocke?

A Nuzlocke is a self-imposed challenge for Pokémon games with three core rules:

1. **First Encounter Only** -- You may only catch the first Pokémon encountered in each area.
2. **Permadeath** -- If a Pokémon faints, it is considered dead and must be released or permanently boxed.
3. **Nicknames Required** -- All Pokémon must be nicknamed to build attachment.

Additional optional rules can raise the difficulty further.

## Roadmap

### Near-term

- Landing page implementation
- Dedicated graveyard / death summary view
- Type coverage calculator

### Later

- Radical Red support (route data, boss AI documentation)
- Mainline game support (Platinum, HeartGold/SoulSilver, Black/White, Black2/White2)
- Export/import runs
- Run statistics and analytics
- Backend with user auth and cloud sync
- Enable Emerald Seaglass game pack for run creation

## Contributing

This is currently a personal project, but contributions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Development Notes

This project demonstrates:

- Modern React patterns and hooks
- Component-based architecture
- Client-side state management and persistence
- Responsive design with Tailwind CSS
- TypeScript for type safety across the codebase

The focus is on clean, maintainable code and incremental feature development.

## License

This project is licensed under the MIT License -- see the LICENSE file for details.

## Acknowledgments

- Pokémon and all related properties are (c) Nintendo, Game Freak, and The Pokémon Company
- Emerald Seaglass ROM hack by the Seaglass development team
- Radical Red ROM hack by Soupercell and the RR team
- Nuzlocke challenge created by Nick Franco (Nuzlocke Comics)
- Project Inspiration: [Nuzlocke.app](https://github.com/domtronn/nuzlocke.app)

## Contact

Project Link: [https://github.com/RileighLuvsCatz/Nuzzy](https://github.com/RileighLuvsCatz/Nuzzy)

---

**Note:** This project is a fan-made tool and is not affiliated with Nintendo, Game Freak, or The Pokémon Company.
