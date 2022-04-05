import { getArtifact } from '../../test/utils/helpers/contracts'

async function benchmark(): Promise<void> {
  const Proxy = await getArtifact('WalletProxy')
  const Wallet = await getArtifact('Wallet')
  const EntryPoint = await getArtifact('EntryPoint')

  console.log(`- Proxy: ${Proxy.deployedBytecode.length / 2} bytes`)
  console.log(`- Wallet: ${Wallet.deployedBytecode.length / 2} bytes`)
  console.log(`- EntryPoint: ${EntryPoint.deployedBytecode.length / 2} bytes`)
}

benchmark().catch((error) => {
  console.error(error)
  process.exit(1)
})
