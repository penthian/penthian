import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  FeesChanged,
  OwnershipTransferred,
  ProposalStatus,
  Voted
} from "../generated/Voting/Voting"

export function createFeesChangedEvent(
  _by: Address,
  _oldFees: BigInt,
  _newFees: BigInt
): FeesChanged {
  let feesChangedEvent = changetype<FeesChanged>(newMockEvent())

  feesChangedEvent.parameters = new Array()

  feesChangedEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  feesChangedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldFees",
      ethereum.Value.fromUnsignedBigInt(_oldFees)
    )
  )
  feesChangedEvent.parameters.push(
    new ethereum.EventParam(
      "_newFees",
      ethereum.Value.fromUnsignedBigInt(_newFees)
    )
  )

  return feesChangedEvent
}

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

export function createProposalStatusEvent(
  _by: Address,
  _proposalId: BigInt,
  _endTime: BigInt
): ProposalStatus {
  let proposalStatusEvent = changetype<ProposalStatus>(newMockEvent())

  proposalStatusEvent.parameters = new Array()

  proposalStatusEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  proposalStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_proposalId",
      ethereum.Value.fromUnsignedBigInt(_proposalId)
    )
  )
  proposalStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_endTime",
      ethereum.Value.fromUnsignedBigInt(_endTime)
    )
  )

  return proposalStatusEvent
}

export function createVotedEvent(
  _by: Address,
  _proposalId: BigInt,
  _inFavor: boolean
): Voted {
  let votedEvent = changetype<Voted>(newMockEvent())

  votedEvent.parameters = new Array()

  votedEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  votedEvent.parameters.push(
    new ethereum.EventParam(
      "_proposalId",
      ethereum.Value.fromUnsignedBigInt(_proposalId)
    )
  )
  votedEvent.parameters.push(
    new ethereum.EventParam("_inFavor", ethereum.Value.fromBoolean(_inFavor))
  )

  return votedEvent
}
