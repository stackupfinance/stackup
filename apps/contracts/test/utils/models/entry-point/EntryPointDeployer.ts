import { deploy } from '../../helpers/contracts'

import EntryPoint from './EntryPoint'

const EntryPointDeployer = {
  async deploy(): Promise<EntryPoint> {
    const factory = await deploy('SingletonFactory')
    const instance = await deploy('EntryPoint', [factory.address])
    return new EntryPoint(instance, factory)
  }
}

export default EntryPointDeployer
