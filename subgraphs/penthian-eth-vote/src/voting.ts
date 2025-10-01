import {
  FeesChanged as FeesChangedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ProposalStatus as ProposalStatusEvent,
  Voted as VotedEvent
} from "../generated/Voting/Voting"
import {
  FeesChanged,
  OwnershipTransferred,
  ProposalStatus,
  Voted
} from "../generated/schema"

export function handleFeesChanged(event: FeesChangedEvent): void {
  let entity = new FeesChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._oldFees = event.params._oldFees
  entity._newFees = event.params._newFees

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

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

export function handleProposalStatus(event: ProposalStatusEvent): void {
  let entity = new ProposalStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._proposalId = event.params._proposalId
  entity._endTime = event.params._endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoted(event: VotedEvent): void {
  let entity = new Voted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._proposalId = event.params._proposalId
  entity._inFavor = event.params._inFavor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
