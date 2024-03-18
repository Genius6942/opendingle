# OpenDingle
A fork of dinglebot, made to be easily used. (if you know what you're doing)
- built on top of cold clear, which is really garbage for this use case ngl

### Prerequisities
- NodeJS 20 (Nodesource or NVM)
- (optional) BunJS
- 1 CPU Core/1GB RAM (anything less causes instability)
- Proper .env configuration (see .env.example)

### Steps to run

Clone the repository using the required credentials. (probably your gh api key)

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

# Now update the rest of the bot yourself, Haelp and Luke are too lazy to do it for you.
