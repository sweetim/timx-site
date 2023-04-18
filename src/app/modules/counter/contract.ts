import { keyStores, providers, utils } from "near-api-js"
import { CodeResult } from "near-api-js/lib/providers/provider";

export const CONTRACT_ADDRESS = "dev-1681818876967-82084098872358"
export const FT_CONTRACT_ADDRESS = "dev-1681832116683-59715775518634"

export const MIN_GAS_FEE = utils.format.parseNearAmount("0.0000000003")!

export enum MethodName {
    Increment = "increment",
    Decrement = "decrement",
    Random = "random",
    GetValue = "get_value",
    GetEntryFee = "get_entry_fee",
    GetRecordsLength = "get_records_length",
    QueryAllRecords = "query_all_records",
    QueryRecords = "query_records",
    FTMetaData = "ft_metadata",
    FTBalanceOf = "ft_balance_of",
}

const keyStore = new keyStores.InMemoryKeyStore()

export const CONTRACT_ENVIRONMENT = {
    "mainnet": {
        networkId: "mainnet",
        keyStore,
        nodeUrl: "https://rpc.mainnet.near.org",
        contractName: CONTRACT_ADDRESS,
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
    },
    "testnet": {
        networkId: "testnet",
        keyStore,
        nodeUrl: "https://rpc.testnet.near.org",
        contractName: CONTRACT_ADDRESS,
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    }
} as const;

type ContractEnvironment = keyof typeof CONTRACT_ENVIRONMENT

export function getContractEnvironment() {
    const NODE_ENV_TO_CONTRACT_ENVIRONMENT: Record<typeof process.env.NODE_ENV, ContractEnvironment> = {
        "production": "testnet",
        "development": "testnet",
        "test": "testnet",
    }

    const nodeEnv = process.env.NODE_ENV || "development"

    return CONTRACT_ENVIRONMENT[NODE_ENV_TO_CONTRACT_ENVIRONMENT[nodeEnv]]
}

const provider = new providers.JsonRpcProvider({
    url: getContractEnvironment().nodeUrl
})

async function callFunction<T>(methodName: string, args: Object = {}): Promise<T> {
    const args_base64 = Buffer.from(JSON.stringify(args))
        .toString("base64")

    const res = await provider.query<CodeResult>({
        request_type: "call_function",
        account_id: CONTRACT_ADDRESS,
        method_name: methodName,
        args_base64,
        finality: "optimistic",
    })

    return JSON.parse(Buffer.from(res.result).toString())
}

export type CounterAction =  "Increment"
    | "Decrement"
    | "Random"

export type CounterRecord = {
    timestamp_ms: number,
    action: CounterAction,
    user: string
}

export async function queryAllRecords() {
    return callFunction<CounterRecord[]>(MethodName.QueryAllRecords)
}

export async function queryRecords(fromIndex: number, limit: number) {
    const args = {
        from_index: fromIndex.toString(),
        limit: limit.toString()
    }

    return callFunction<CounterRecord[]>(MethodName.QueryRecords, args)
}

export async function getValue() {
    return callFunction<string>(MethodName.GetValue)
}

export async function getEntryFee() {
    return callFunction<string>(MethodName.GetEntryFee)
}

export async function getRecordsLength() {
    return callFunction<string>(MethodName.GetRecordsLength)
}

export type CounterFTMetaData = {
    spec: string,
    name: string,
    symbol: string,
    icon: string,
    reference: string | null,
    reference_hash: string | null,
    decimals: number,
}

async function callFunctionFT<T>(methodName: string, args: Object = {}): Promise<T> {
    const args_base64 = Buffer.from(JSON.stringify(args))
        .toString("base64")

    const res = await provider.query<CodeResult>({
        request_type: "call_function",
        account_id: FT_CONTRACT_ADDRESS,
        method_name: methodName,
        args_base64,
        finality: "optimistic",
    })

    return JSON.parse(Buffer.from(res.result).toString())
}

export async function counterFTMetadata() {
    return callFunctionFT<CounterFTMetaData>(MethodName.FTMetaData)
}

export async function counterFTBalanceOf(accountId: string) {
    const args = {
        account_id: accountId
    }

    return callFunctionFT<string>(MethodName.FTBalanceOf, args)
}
