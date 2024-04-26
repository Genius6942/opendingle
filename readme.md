# OpenDingle
A fork of dinglebot, made to be easily used. (if you know what you're doing)
- built on top of cold clear, which is really garbage for this use case ngl
- Semi-functional (You need to add the 6.4.3 garbage update yourself)

### Prerequisities
- NodeJS 20 (Nodesource or NVM)
- (optional) BunJS (recommended for development)
- .1 CPU Core/512MB RAM (anything less causes instability)
- Proper .env configuration (see .env.example), figure it out yourself

### Steps to run

Clone the repository

Your options are building it or running it using bun.

To build OpenDingle:
```
cd opendingle/
chmod +x build.sh
./build.sh
```
To run using BunJS:
```
bun run --watch tetr-node/index.ts
```
To run with TS (will likely throw errors):
```
npx ts-node tetr-node/index.ts
```

# Now update the rest of the bot yourself, Haelp and Luke are too lazy to do it for you.

Side note: you probably shouldn't bring your bot into a Super Streamer Lobby
