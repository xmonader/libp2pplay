import process from 'node:process'
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { multiaddr } from 'multiaddr'

import tsrmbhttpclient from "ts-rmb-http-client";
const {HTTPMessageBusClient} = tsrmbhttpclient
import grid3_client from "grid3_client";
const { BackendStorageType, GridClient, KeypairType, NetworkEnv} = "grid3_client";

const MNEMONICS = "scene present enlist initial welcome stone buffalo oak acoustic bulb rose shy"
const NETWORK = NetworkEnv.dev
const STORE_SECRET = "secret"
let config = {
  network: NETWORK,
  mnemonic: MNEMONICS,
  rmb_proxy: true,
  storeSecret: STORE_SECRET,
  ssh_key: `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCeq1MFCQOv3OCLO1HxdQl8V0CxAwt5AzdsNOL91wmHiG9ocgnq2yipv7qz+uCS0AdyOSzB9umyLcOZl2apnuyzSOd+2k6Cj9ipkgVx4nx4q5W1xt4MWIwKPfbfBA9gDMVpaGYpT6ZEv2ykFPnjG0obXzIjAaOsRthawuEF8bPZku1yi83SDtpU7I0pLOl3oifuwPpXTAVkK6GabSfbCJQWBDSYXXM20eRcAhIMmt79zo78FNItHmWpfPxPTWlYW02f7vVxTN/LUeRFoaNXXY+cuPxmcmXp912kW0vhK9IvWXqGAEuSycUOwync/yj+8f7dRU7upFGqd6bXUh67iMl7 ahmed@ahmedheaven  `,
};


const node = await createLibp2p({
  addresses: {
    // add a listen address (localhost) to accept TCP connections on a random port
    listen: ['/ip4/127.0.0.1/tcp/0']
  },
  transports: [tcp()],
  connectionEncryption: [noise()],
  streamMuxers: [mplex()]
})

// start libp2p
await node.start()
let gridClient = undefined;
if (process.argv.length === 2){
    gridClient = new GridClient(
    config.network,
    config.mnemonic,
    config.storeSecret,
    rmb,
    "",
    BackendStorageType.auto,
    KeypairType.sr25519,
  );
  await gridClient.connect();
  console.log("client is connected")
}
console.log('libp2p has started')

// print out listening addresses
console.log('listening on addresses:')
node.getMultiaddrs().forEach((addr) => {
  console.log(addr.toString())
})

// ping peer if received multiaddr
if (process.argv.length >= 3) {
  const ma = multiaddr(process.argv[2])
  console.log(`pinging remote peer at ${process.argv[2]}`)
  const latency = await node.ping(ma)
  console.log(`pinged ${process.argv[2]} in ${latency}ms`)
} else {
  console.log('no remote peer address given, skipping ping')
}

const stop = async () => {
  // stop libp2p
  await node.stop()
  console.log('libp2p has stopped')
  process.exit(0)
}

process.on('SIGTERM', stop)
process.on('SIGINT', stop)
