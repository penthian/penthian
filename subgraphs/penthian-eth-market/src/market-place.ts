import {
  AgentWhitelistUpdated as AgentWhitelistUpdatedEvent,
  AuctionConcluded as AuctionConcludedEvent,
  AuctionCreated as AuctionCreatedEvent,
  Blacklisted as BlacklistedEvent,
  DefaultReferralBipsUpdated as DefaultReferralBipsUpdatedEvent,
  ExclusiveReferralBipsUpdated as ExclusiveReferralBipsUpdatedEvent,
  MinBidIncrementBipsUpdated as MinBidIncrementBipsUpdatedEvent,
  MinListingPriceBipsUpdated as MinListingPriceBipsUpdatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PlacedBid as PlacedBidEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent,
  PrimarySaleStatus as PrimarySaleStatusEvent,
  PrimarySharesBought as PrimarySharesBoughtEvent,
  PrimarySharesClaimed as PrimarySharesClaimedEvent,
  ReferralAdded as ReferralAddedEvent,
  ReferralCommissionClaimed as ReferralCommissionClaimedEvent,
  SecondarySaleStatus as SecondarySaleStatusEvent,
  SecondarySharesBought as SecondarySharesBoughtEvent
} from "../generated/MarketPlace/MarketPlace"
import {
  AgentWhitelistUpdated,
  AuctionConcluded,
  AuctionCreated,
  Blacklisted,
  DefaultReferralBipsUpdated,
  ExclusiveReferralBipsUpdated,
  MinBidIncrementBipsUpdated,
  MinListingPriceBipsUpdated,
  OwnershipTransferred,
  PlacedBid,
  PlatformFeeUpdated,
  PrimarySaleStatus,
  PrimarySharesBought,
  PrimarySharesClaimed,
  ReferralAdded,
  ReferralCommissionClaimed,
  SecondarySaleStatus,
  SecondarySharesBought
} from "../generated/schema"

export function handleAgentWhitelistUpdated(
  event: AgentWhitelistUpdatedEvent
): void {
  let entity = new AgentWhitelistUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._owner = event.params._owner
  entity._agent = event.params._agent
  entity._isWhitelisted = event.params._isWhitelisted

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAuctionConcluded(event: AuctionConcludedEvent): void {
  let entity = new AuctionConcluded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._auctionId = event.params._auctionId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let entity = new AuctionCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._seller = event.params._seller
  entity._auctionId = event.params._auctionId
  entity._propertyId = event.params._propertyId
  entity._noOfShares = event.params._noOfShares
  entity._startTime = event.params._startTime
  entity._endTime = event.params._endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBlacklisted(event: BlacklistedEvent): void {
  let entity = new Blacklisted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._user = event.params._user
  entity._status = event.params._status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultReferralBipsUpdated(
  event: DefaultReferralBipsUpdatedEvent
): void {
  let entity = new DefaultReferralBipsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._oldReferralBips = event.params._oldReferralBips
  entity._newReferralBips = event.params._newReferralBips

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleExclusiveReferralBipsUpdated(
  event: ExclusiveReferralBipsUpdatedEvent
): void {
  let entity = new ExclusiveReferralBipsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._agent = event.params._agent
  entity._bips = event.params._bips

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMinBidIncrementBipsUpdated(
  event: MinBidIncrementBipsUpdatedEvent
): void {
  let entity = new MinBidIncrementBipsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._oldBips = event.params._oldBips
  entity._newBips = event.params._newBips

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMinListingPriceBipsUpdated(
  event: MinListingPriceBipsUpdatedEvent
): void {
  let entity = new MinListingPriceBipsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._oldBips = event.params._oldBips
  entity._newBips = event.params._newBips

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

export function handlePlacedBid(event: PlacedBidEvent): void {
  let entity = new PlacedBid(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._bidder = event.params._bidder
  entity._auctionId = event.params._auctionId
  entity._bid = event.params._bid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let entity = new PlatformFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._oldFee = event.params._oldFee
  entity._newFee = event.params._newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePrimarySaleStatus(event: PrimarySaleStatusEvent): void {
  let entity = new PrimarySaleStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._seller = event.params._seller
  entity._propertyId = event.params._propertyId
  entity._status = event.params._status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePrimarySharesBought(
  event: PrimarySharesBoughtEvent
): void {
  let entity = new PrimarySharesBought(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._buyer = event.params._buyer
  entity._agent = event.params._agent
  entity._propertyId = event.params._propertyId
  entity._sharesBought = event.params._sharesBought
  entity._investment = event.params._investment
  entity._marketFees = event.params._marketFees
  entity._commissionFees = event.params._commissionFees

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePrimarySharesClaimed(
  event: PrimarySharesClaimedEvent
): void {
  let entity = new PrimarySharesClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._user = event.params._user
  entity._propertyId = event.params._propertyId
  entity._noOfShares = event.params._noOfShares

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReferralAdded(event: ReferralAddedEvent): void {
  let entity = new ReferralAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._by = event.params._by
  entity._referee = event.params._referee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReferralCommissionClaimed(
  event: ReferralCommissionClaimedEvent
): void {
  let entity = new ReferralCommissionClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._agent = event.params._agent
  entity._commissionInETH = event.params._commissionInETH
  entity._commissionInUSDC = event.params._commissionInUSDC

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSecondarySaleStatus(
  event: SecondarySaleStatusEvent
): void {
  let entity = new SecondarySaleStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._seller = event.params._seller
  entity._listingId = event.params._listingId
  entity._propertyId = event.params._propertyId
  entity._status = event.params._status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSecondarySharesBought(
  event: SecondarySharesBoughtEvent
): void {
  let entity = new SecondarySharesBought(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._buyer = event.params._buyer
  entity._propertyId = event.params._propertyId
  entity._sharesBought = event.params._sharesBought
  entity._investment = event.params._investment
  entity._marketFees = event.params._marketFees

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
