import {
  OwnershipTransferred as OwnershipTransferredEvent,
  PausedStatus as PausedStatusEvent,
  RegistrationFeesChanged as RegistrationFeesChangedEvent,
  RequestStatus as RequestStatusEvent
} from "../generated/RegistrationForm/RegistrationForm"
import {
  OwnershipTransferred,
  PausedStatus,
  RegistrationFeesChanged,
  RequestStatus
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

export function handlePausedStatus(event: PausedStatusEvent): void {
  let entity = new PausedStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._isPaused = event.params._isPaused

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRegistrationFeesChanged(
  event: RegistrationFeesChangedEvent
): void {
  let entity = new RegistrationFeesChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._oldFees = event.params._oldFees
  entity._newFees = event.params._newFees

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRequestStatus(event: RequestStatusEvent): void {
  let entity = new RequestStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._requestId = event.params._requestId
  entity._status = event.params._status
  entity._propertyId = event.params._propertyId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
