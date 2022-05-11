export = stackupfinance__walletjs;

declare const stackupfinance__walletjs: {
  constants: {
    ERC1271: {
      magicValue: string;
    };
    userOperations: {
      defaultGas: number;
      defaultMaxFee: number;
      defaultMaxPriorityFee: number;
      defaults: {
        callData: string;
        callGas: number;
        initCode: string;
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
        nonce: number;
        paymaster: string;
        paymasterData: string;
        preVerificationGas: number;
        signature: string;
        verificationGas: number;
      };
      initNonce: number;
      nullCode: string;
    };
  };
  contracts: {
    EntryPoint: {
      address: string;
      deployInitCode: string;
      deploySalt: string;
      getInstance: any;
      interface: {
        decodeErrorResult: any;
        decodeEventLog: any;
        decodeFunctionData: any;
        decodeFunctionResult: any;
        deploy: {
          format: any;
          gas: any;
          inputs: {
            arrayChildren: any;
            arrayLength: any;
            baseType: string;
            components: any;
            format: any;
            indexed: any;
            name: string;
            type: string;
          }[];
          name: any;
          payable: boolean;
          stateMutability: string;
          type: string;
        };
        encodeDeploy: any;
        encodeErrorResult: any;
        encodeEventLog: any;
        encodeFilterTopics: any;
        encodeFunctionData: any;
        encodeFunctionResult: any;
        errors: {};
        events: {};
        format: any;
        fragments: {
          format: any;
          gas: any;
          inputs: {
            arrayChildren: any;
            arrayLength: any;
            baseType: string;
            components: any;
            format: any;
            indexed: any;
            name: string;
            type: string;
          }[];
          name: any;
          payable: boolean;
          stateMutability: string;
          type: string;
        }[];
        functions: {
          "addStake()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "create2Factory()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getStake(address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "handleOps((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,address,bytes,bytes)[],address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: {
                arrayChildren: any;
                arrayLength: any;
                baseType: string;
                components: {
                  arrayChildren: any;
                  arrayLength: any;
                  baseType: string;
                  components: any;
                  format: any;
                  indexed: any;
                  name: string;
                  type: string;
                }[];
                format: any;
                indexed: any;
                name: any;
                type: string;
              };
              arrayLength: number;
              baseType: string;
              components: {
                arrayChildren: any;
                arrayLength: any;
                baseType: string;
                components: any;
                format: any;
                indexed: any;
                name: string;
                type: string;
              }[];
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "lockStake()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "unlockStake()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "withdrawStake(address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
        };
        getError: any;
        getEvent: any;
        getEventTopic: any;
        getFunction: any;
        getSighash: any;
        parseError: any;
        parseLog: any;
        parseTransaction: any;
        structs: {};
      };
    };
    Erc20: {
      getInstance: any;
      interface: {
        decodeErrorResult: any;
        decodeEventLog: any;
        decodeFunctionData: any;
        decodeFunctionResult: any;
        deploy: {
          format: any;
          gas: any;
          inputs: any[];
          name: any;
          payable: boolean;
          stateMutability: string;
          type: string;
        };
        encodeDeploy: any;
        encodeErrorResult: any;
        encodeEventLog: any;
        encodeFilterTopics: any;
        encodeFunctionData: any;
        encodeFunctionResult: any;
        errors: {};
        events: {
          "Approval(address,address,uint256)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
          "Transfer(address,address,uint256)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
        };
        format: any;
        fragments: {
          constant: boolean;
          format: any;
          gas: any;
          inputs: any[];
          name: string;
          outputs: {
            arrayChildren: any;
            arrayLength: any;
            baseType: string;
            components: any;
            format: any;
            indexed: any;
            name: any;
            type: string;
          }[];
          payable: boolean;
          stateMutability: string;
          type: string;
        }[];
        functions: {
          "allowance(address,address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "approve(address,uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "balanceOf(address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "decimals()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "name()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "symbol()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "totalSupply()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "transfer(address,uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "transferFrom(address,address,uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
        };
        getError: any;
        getEvent: any;
        getEventTopic: any;
        getFunction: any;
        getSighash: any;
        parseError: any;
        parseLog: any;
        parseTransaction: any;
        structs: {};
      };
    };
    SingletonFactory: {
      address: string;
      getInstance: any;
    };
    Wallet: {
      address: string;
      deployInitCode: string;
      deploySalt: string;
      getInstance: any;
      interface: {
        decodeErrorResult: any;
        decodeEventLog: any;
        decodeFunctionData: any;
        decodeFunctionResult: any;
        deploy: {
          format: any;
          gas: any;
          inputs: any[];
          name: any;
          payable: boolean;
          stateMutability: string;
          type: string;
        };
        encodeDeploy: any;
        encodeErrorResult: any;
        encodeEventLog: any;
        encodeFilterTopics: any;
        encodeFunctionData: any;
        encodeFunctionResult: any;
        errors: {};
        events: {
          "AdminChanged(address,address)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
          "BeaconUpgraded(address)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
          "RoleAdminChanged(bytes32,bytes32,bytes32)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
          "RoleGranted(bytes32,address,address)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
          "RoleRevoked(bytes32,address,address)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
          "Upgraded(address)": {
            anonymous: boolean;
            format: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: boolean;
              name: string;
              type: string;
            }[];
            name: string;
            type: string;
          };
        };
        format: any;
        fragments: {
          format: any;
          gas: any;
          inputs: any[];
          name: any;
          payable: boolean;
          stateMutability: string;
          type: string;
        }[];
        functions: {
          "DEFAULT_ADMIN_ROLE()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "GUARDIAN_ROLE()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "OWNER_ROLE()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "entryPoint()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "executeUserOp(address,uint256,bytes)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getCurrentImplementation()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getGuardian(uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getGuardianCount()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getOwner(uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getOwnerCount()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getRoleAdmin(bytes32)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getRoleMember(bytes32,uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "getRoleMemberCount(bytes32)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "grantGuardian(address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "grantRole(bytes32,address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "hasRole(bytes32,address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "initialize(address,address,address[])": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "isValidSignature(bytes32,bytes)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "nonce()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "postOp(uint8,bytes,uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "proxiableUUID()": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: any[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "renounceRole(bytes32,address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "revokeGuardian(address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "revokeRole(bytes32,address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "supportsInterface(bytes4)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: any;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "transferOwner(address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "upgradeTo(address)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "upgradeToAndCall(address,bytes)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "validatePaymasterUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,address,bytes,bytes),uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: {
                arrayChildren: any;
                arrayLength: any;
                baseType: string;
                components: any;
                format: any;
                indexed: any;
                name: string;
                type: string;
              }[];
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: any;
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
          "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,address,bytes,bytes),bytes32,uint256)": {
            constant: boolean;
            format: any;
            gas: any;
            inputs: {
              arrayChildren: any;
              arrayLength: any;
              baseType: string;
              components: {
                arrayChildren: any;
                arrayLength: any;
                baseType: string;
                components: any;
                format: any;
                indexed: any;
                name: string;
                type: string;
              }[];
              format: any;
              indexed: any;
              name: string;
              type: string;
            }[];
            name: string;
            outputs: any[];
            payable: boolean;
            stateMutability: string;
            type: string;
          };
        };
        getError: any;
        getEvent: any;
        getEventTopic: any;
        getFunction: any;
        getSighash: any;
        parseError: any;
        parseLog: any;
        parseTransaction: any;
        structs: {};
      };
    };
  };
  wallet: {
    access: {
      getGuardians: any;
    };
    createRandom: any;
    decodeCallData: {
      Erc20FromExecuteUserOp: any;
      fromUserOperation: any;
    };
    decryptSigner: any;
    encodeFunctionData: {
      ERC20Approve: any;
      ERC20Transfer: any;
      addEntryPointStake: any;
      executeUserOp: any;
      grantGuardian: any;
      initialize: any;
      lockEntryPointStake: any;
      revokeGuardian: any;
      transferOwner: any;
      upgradeTo: any;
    };
    message: {
      paymasterData: any;
      requestId: any;
      userOperation: any;
    };
    proxy: {
      getAddress: any;
      getInitCode: any;
      getNonce: any;
      isCodeDeployed: any;
    };
    reencryptSigner: any;
    userOperations: {
      appendGuardianSignature: any;
      get: any;
      sign: any;
      signAsGuardian: any;
      signPaymasterData: any;
    };
  };
};
