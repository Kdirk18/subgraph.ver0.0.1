

// src/mapping.ts

import { BigInt, Address } from "@graphprotocol/graph-ts"
import { Transfer as TransferEvent } from "../generated/TetherToken/TetherToken"
import { Transfer } from "../generated/schema"


// List ví
const TRACKED: Address[] = [
  Address.fromString("0x3F974022FDd9F42a784D335853B2746bc7ebC5bC"),
  Address.fromString("0xBf2bE2410A02EAAcb81d979C48C4200434E015Bd"),
  // ... thêm ví khác nếu cần
]

// Ngưỡng tối thiểu
const THRESHOLD: BigInt = BigInt.fromI32(5)
  .times(BigInt.fromI32(10).pow(8))



export function handleTransfer(event: TransferEvent): void {
  let from = event.params.from
  let to   = event.params.to
  let value = event.params.value

  // 1) Bỏ qua nếu giá trị nhỏ hơn ngưỡng
  if (value.lt(THRESHOLD)) {
    return
  }

  // 2) Chỉ index khi from HOẶC to nằm trong TRACKED
  let isFromTracked = TRACKED.indexOf(from) != -1
  let isToTracked   = TRACKED.indexOf(to)   != -1
  if (!isFromTracked && !isToTracked) {
    return
  }

  // 3) Tạo ID duy nhất: transactionHash-logIndex
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

  // 4) Lưu entity Transfer
  let transfer = new Transfer(id)
  transfer.transactionHash = event.transaction.hash
  transfer.blockNumber     = event.block.number
  transfer.blockTimestamp  = event.block.timestamp
  transfer.from             = from
  transfer.to               = to
  transfer.value            = value
  transfer.save()
}
