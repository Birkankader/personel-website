# JetBrains plugin repository

Add https://birkankader.com/plugins/updatePlugins.xml in the IDE's
Settings → Plugins → gear → Manage Plugin Repositories.
The directory URLs `/plugins` and `/plugins/` also serve the same XML feed.

Each plugin release owns `public/plugins/<slug>/updatePlugins.xml`, its ZIPs,
and release metadata. `npm run build` runs Vite and then merges these feeds into
`dist/plugins/updatePlugins.xml`. Each legacy per-plugin XML URL serves the same
merged list, including `/plugins/kasif/updatePlugins.xml`.

Do not edit the generated dist files or replace the site deployment with a
plugin-only upload. Push reviewed release files to main to use the existing
Netlify build, Functions, redirects, and environment.

Kaşif's existing release-site command continues to work without changes.
Arcade Machine's source repository provides `scripts/prepare-plugin-release.py`.
Keep versioned ZIPs immutable. The builder rejects duplicate IDs, incomplete
metadata, and missing ZIPs. Run `node --test scripts/build-plugin-repository.test.mjs`
and `npm run build` before publishing.

Arcade Machine requires a separate LAN game server. Hosting the plugin does not
host that server.

Haftanin Seyirligi (`dev.teamwatch.weekly`) requires IntelliJ Platform 2024.3+
and the shared Arcade Machine server 0.4.0+. It offers weekly film/TEDx
suggestions, voting, a weekly winner and watched status. Its source project's
`scripts/prepare-plugin-release.py` prepares immutable ZIP/XML/checksum metadata.
Publishing the plugin here does not run or upgrade the team's LAN server.

## Shared server download

[Arcade Machine + Haftanin Seyirligi server 0.4.2 for Windows x64](arcade-machine/arcade-machine-server-0.4.2-windows-x64-da61f375d1b8.zip) includes Java 21 and the desktop management window.
Extract the whole archive and open `Baslat.bat`, then click Start.
See [server instructions](arcade-machine/SUNUCU-BASLAT.md).
`arcade-machine/server-release.json` identifies the current server download and SHA-256.
Windows execution has not been validated on a Windows machine.

Arcade Machine 0.4.2 adds daily Sudoku and the compact four-game menu. Update the shared server and the modern or 2019 plugin. The server download keeps the same watch board, manager and existing database.
