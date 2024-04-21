import { Realtime } from "ably"

const {
  ABLY_API_KEY,
  APTOS_COUNTER_MODULE_ADDRESS,
} = process.env

const ABLY_APTOS_COUNTER_CHANNEL_NAME = "aptos-counter"

const APTOS_COUNTER_RECORD_EVENT_NAME = `${APTOS_COUNTER_MODULE_ADDRESS}::counter::CounterRecordEvent`

const ably = new Realtime(ABLY_API_KEY!)
const channel = ably.channels.get(ABLY_APTOS_COUNTER_CHANNEL_NAME);

export async function GET(request: Request) {
  console.log(JSON.stringify(request))
  return new Response("OK")
}

export async function POST(request: Request) {
  const data = await request.json()

  const ev = data.events
      .filter(({ type }: any) => type === APTOS_COUNTER_RECORD_EVENT_NAME)
      .map(({ data }: any) => data)
      .flat();

  console.log(ev)

  await channel.publish({
    data: ev
  })

  return new Response()
}
// {
//   block: {
//     number: '252528511',
//     timestamp: '1713629392719344',
//     hash: '0x13caaa746ac13cd915ab4d953719ac4f42798a70dd1c1ca851820b69dddbe13b',
//     firstVersion: '1025803306',
//     lastVersion: '1025803309'
//   },
//   changes: [],
//   coinDeposits: [],
//   coinTransfers: [],
//   coinWithdrawals: [],
//   events: [
//     {
//       guid: [Object],
//       sequence_number: '36',
//       type: '0x1::fungible_asset::DepositEvent',
//       data: [Object],
//       txHash: '0xeebf82aa788a142b239ea816ddf4909771b0f023bd6385cec54afd5b670aac59'
//     },
//     {
//       guid: [Object],
//       sequence_number: '0',
//       type: '0x6b2cf48e40e3b651c309dc444d0d094ed9c342089289c8bf50c4a5646271f20b::counter::CounterRecordEvent',
//       data: [Object],
//       txHash: '0xeebf82aa788a142b239ea816ddf4909771b0f023bd6385cec54afd5b670aac59'
//     },
//     {
//       guid: [Object],
//       sequence_number: '0',
//       type: '0x1::transaction_fee::FeeStatement',
//       data: [Object],
//       txHash: '0xeebf82aa788a142b239ea816ddf4909771b0f023bd6385cec54afd5b670aac59'
//     },
//     {
//       guid: [Object],
//       sequence_number: '251',
//       type: '0x1::fungible_asset::WithdrawEvent',
//       data: [Object],
//       txHash: '0xaec307394f8995aa830c97de4dcd83301e63ecb73aeb65b7234d321bb7cc11b7'
//     },
//     {
//       guid: [Object],
//       sequence_number: '0',
//       type: '0x1::fungible_asset::DepositEvent',
//       data: [Object],
//       txHash: '0xaec307394f8995aa830c97de4dcd83301e63ecb73aeb65b7234d321bb7cc11b7'
//     },
//     {
//       guid: [Object],
//       sequence_number: '0',
//       type: '0x1::transaction_fee::FeeStatement',
//       data: [Object],
//       txHash: '0xaec307394f8995aa830c97de4dcd83301e63ecb73aeb65b7234d321bb7cc11b7'
//     }
//   ],
//   network: 'testnet',
//   payloads: [],
//   retries: 0,
//   streamId: '2adb75d3-eb19-46ca-8b77-c9c9d42fa160',
//   tag: 'demo',
//   transactions: []
// }
