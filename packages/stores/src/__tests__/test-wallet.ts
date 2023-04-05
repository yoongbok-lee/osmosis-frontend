// eslint-disable-next-line import/no-extraneous-dependencies
import { chainRegistryChainToKeplr } from "@chain-registry/keplr";
import { StdSignDoc, StdTx } from "@cosmjs/amino";
import { Algo, OfflineDirectSigner } from "@cosmjs/proto-signing";
import {
  BroadcastMode,
  ChainRecord,
  ChainWalletBase,
  DirectSignDoc,
  ExtendedHttpEndpoint,
  MainWalletBase,
  SignOptions,
  SignType,
  Wallet,
  WalletClient,
} from "@cosmos-kit/core";
// eslint-disable-next-line import/no-extraneous-dependencies
import { MockKeplr } from "@keplr-wallet/provider-mock";
import Axios from "axios";

import { TestChainInfos } from "./test-env";

function getMockKeplr(mnemonic: string) {
  return new MockKeplr(
    async (chainId: string, tx: StdTx | Uint8Array) => {
      const chainInfo = TestChainInfos.find((info) => info.chainId === chainId);
      if (!chainInfo) {
        throw new Error("Unknown chain info");
      }

      const restInstance = Axios.create({
        ...{
          baseURL: chainInfo.rest,
        },
      });

      const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

      const params = isProtoTx
        ? {
            tx_bytes: Buffer.from(tx as any).toString("base64"),
            mode: "BROADCAST_MODE_BLOCK",
          }
        : {
            tx,
            mode: "block",
          };

      try {
        const result = await restInstance.post(
          isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs",
          params
        );

        const txResponse = isProtoTx ? result.data["tx_response"] : result.data;

        if (txResponse.code != null && txResponse.code !== 0) {
          throw new Error(txResponse["raw_log"]);
        }

        return Buffer.from(txResponse.txhash, "hex");
      } finally {
        // Sending the other tx right after the response is fetched makes the other tx be failed sometimes,
        // because actually the increased sequence is commited after the block is fully processed.
        // So, to prevent this problem, just wait more time after the response is fetched.
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });
      }
    },
    TestChainInfos,
    mnemonic
  );
}

export const testWalletInfo: Wallet = {
  name: "keplr-extension",
  logo: "https://user-images.githubusercontent.com/545047/202085372-579be3f3-36e0-4e0b-b02f-48182af6e577.svg",
  prettyName: "Keplr",
  mode: "extension",
  mobileDisabled: true,
  rejectMessage: {
    source: "Request rejected",
  },
  connectEventNamesOnWindow: ["keplr_keystorechange"],
  downloads: [],
};

export class MockKeplrClient implements WalletClient {
  readonly client: MockKeplr;

  constructor(client: MockKeplr) {
    this.client = client;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async enable(_chainIds: string | string[]) {
    await this.client.enable();
  }

  async getSimpleAccount(chainId: string) {
    const { address, username } = await this.getAccount(chainId);
    return {
      namespace: "cosmos",
      chainId,
      address,
      username,
    };
  }

  async getAccount(chainId: string) {
    const key = await this.client.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo as Algo,
      pubkey: key.pubKey,
    };
  }

  getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    switch (preferredSignType) {
      case "amino":
        return this.getOfflineSignerAmino(chainId);
      case "direct":
        return this.getOfflineSignerDirect(chainId);
      default:
        return this.getOfflineSignerAmino(chainId);
    }
    // return this.client.getOfflineSignerAuto(chainId);
  }

  getOfflineSignerAmino(chainId: string) {
    return this.client.getOfflineSignerOnlyAmino(chainId);
  }

  getOfflineSignerDirect(chainId: string) {
    return this.client.getOfflineSigner(chainId) as OfflineDirectSigner;
  }

  async addChain(chainInfo: ChainRecord) {
    const suggestChain = chainRegistryChainToKeplr(
      chainInfo.chain,
      chainInfo.assetList ? [chainInfo.assetList] : []
    );

    if (chainInfo.preferredEndpoints?.rest?.[0]) {
      (suggestChain.rest as string | ExtendedHttpEndpoint) =
        chainInfo.preferredEndpoints?.rest?.[0];
    }

    if (chainInfo.preferredEndpoints?.rpc?.[0]) {
      (suggestChain.rpc as string | ExtendedHttpEndpoint) =
        chainInfo.preferredEndpoints?.rpc?.[0];
    }

    await this.client.experimentalSuggestChain();
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ) {
    return await this.client.signAmino(chainId, signer, signDoc, signOptions);
  }

  async signDirect(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _signer: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _signDoc: DirectSignDoc,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _signOptions?: SignOptions
  ) {
    return await this.client.signDirect();
  }

  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode) {
    return await this.client.sendTx(chainId, tx, mode);
  }
}

export class ChainMockKeplrExtension extends ChainWalletBase {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }
}

export class TestWallet extends MainWalletBase {
  constructor(
    walletInfo: Wallet,
    protected readonly mnemonic = "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius"
  ) {
    super(walletInfo, ChainMockKeplrExtension);
  }

  async initClient() {
    this.initingClient();
    try {
      const mockKeplr = getMockKeplr(this.mnemonic);
      this.initClientDone(new MockKeplrClient(mockKeplr));
    } catch (error) {
      this.logger?.error(error);
      this.initClientError(error as Error);
    }
  }
}