import {
  OwnershipTransferred as OwnershipTransferredEvent,
  PropertyReset as PropertyResetEvent,
  RentStatus as RentStatusEvent,
  RentWithdrawn as RentWithdrawnEvent
} from "../generated/Rent/Rent"
import {
  OwnershipTransferred,
  PropertyReset,
  RentStatus,
  RentWithdrawn
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePropertyReset(event: PropertyResetEvent): void {
  let entity = new PropertyReset(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._propertyId = event.params._propertyId
  entity._rent = event.params._rent

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRentStatus(event: RentStatusEvent): void {
  let entity = new RentStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._propertyId = event.params._propertyId
  entity._monthRent = event.params._monthRent
  entity._status = event.params._status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRentWithdrawn(event: RentWithdrawnEvent): void {
  let entity = new RentWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._propertyId = event.params._propertyId
  entity._rent = event.params._rent

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
