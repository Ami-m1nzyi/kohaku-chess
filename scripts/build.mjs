import {mkdir,copyFile} from 'node:fs/promises';

await mkdir(new URL('../dist/vendor/',import.meta.url),{recursive:true});
await copyFile(new URL('../node_modules/peerjs/dist/peerjs.min.js',import.meta.url),new URL('../dist/vendor/peerjs.min.js',import.meta.url));
console.log('PeerJS browser client copied to dist/vendor.');
