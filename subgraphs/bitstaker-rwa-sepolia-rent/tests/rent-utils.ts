import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  PropertyReset,
  RentStatus,
  RentWithdrawn
} from "../generated/Rent/Rent"

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

export function createPropertyResetEvent(
  _by: Address,
  _propertyId: BigInt,
  _rent: BigInt
): PropertyReset {
  let propertyResetEvent = changetype<PropertyReset>(newMockEvent())

  propertyResetEvent.parameters = new Array()

  propertyResetEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  propertyResetEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  propertyResetEvent.parameters.push(
    new ethereum.EventParam("_rent", ethereum.Value.fromUnsignedBigInt(_rent))
  )

  return propertyResetEvent
}

export function createRentStatusEvent(
  _by: Address,
  _propertyId: BigInt,
  _monthRent: BigInt,
  _status: i32
): RentStatus {
  let rentStatusEvent = changetype<RentStatus>(newMockEvent())

  rentStatusEvent.parameters = new Array()

  rentStatusEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  rentStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  rentStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_monthRent",
      ethereum.Value.fromUnsignedBigInt(_monthRent)
    )
  )
  rentStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_status))
    )
  )

  return rentStatusEvent
}

export function createRentWithdrawnEvent(
  _by: Address,
  _propertyId: BigInt,
  _rent: BigInt
): RentWithdrawn {
  let rentWithdrawnEvent = changetype<RentWithdrawn>(newMockEvent())

  rentWithdrawnEvent.parameters = new Array()

  rentWithdrawnEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  rentWithdrawnEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  rentWithdrawnEvent.parameters.push(
    new ethereum.EventParam("_rent", ethereum.Value.fromUnsignedBigInt(_rent))
  )

  return rentWithdrawnEvent
}
