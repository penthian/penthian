import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  PausedStatus,
  RegistrationFeesChanged,
  RequestStatus
} from "../generated/RegistrationForm/RegistrationForm"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedStatusEvent(
  _by: Address,
  _isPaused: boolean
): PausedStatus {
  let pausedStatusEvent = changetype<PausedStatus>(newMockEvent())

  pausedStatusEvent.parameters = new Array()

  pausedStatusEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  pausedStatusEvent.parameters.push(
    new ethereum.EventParam("_isPaused", ethereum.Value.fromBoolean(_isPaused))
  )

  return pausedStatusEvent
}

export function createRegistrationFeesChangedEvent(
  _oldFees: BigInt,
  _newFees: BigInt
): RegistrationFeesChanged {
  let registrationFeesChangedEvent = changetype<RegistrationFeesChanged>(
    newMockEvent()
  )

  registrationFeesChangedEvent.parameters = new Array()

  registrationFeesChangedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldFees",
      ethereum.Value.fromUnsignedBigInt(_oldFees)
    )
  )
  registrationFeesChangedEvent.parameters.push(
    new ethereum.EventParam(
      "_newFees",
      ethereum.Value.fromUnsignedBigInt(_newFees)
    )
  )

  return registrationFeesChangedEvent
}

export function createRequestStatusEvent(
  _by: Address,
  _requestId: BigInt,
  _status: i32,
  _propertyId: BigInt
): RequestStatus {
  let requestStatusEvent = changetype<RequestStatus>(newMockEvent())

  requestStatusEvent.parameters = new Array()

  requestStatusEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  requestStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_requestId",
      ethereum.Value.fromUnsignedBigInt(_requestId)
    )
  )
  requestStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_status))
    )
  )
  requestStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )

  return requestStatusEvent
}
