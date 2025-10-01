import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
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
} from "../generated/MarketPlace/MarketPlace"

export function createAgentWhitelistUpdatedEvent(
  _owner: Address,
  _agent: Address,
  _isWhitelisted: boolean
): AgentWhitelistUpdated {
  let agentWhitelistUpdatedEvent = changetype<AgentWhitelistUpdated>(
    newMockEvent()
  )

  agentWhitelistUpdatedEvent.parameters = new Array()

  agentWhitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(_owner))
  )
  agentWhitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("_agent", ethereum.Value.fromAddress(_agent))
  )
  agentWhitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_isWhitelisted",
      ethereum.Value.fromBoolean(_isWhitelisted)
    )
  )

  return agentWhitelistUpdatedEvent
}

export function createAuctionConcludedEvent(
  _by: Address,
  _auctionId: BigInt
): AuctionConcluded {
  let auctionConcludedEvent = changetype<AuctionConcluded>(newMockEvent())

  auctionConcludedEvent.parameters = new Array()

  auctionConcludedEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  auctionConcludedEvent.parameters.push(
    new ethereum.EventParam(
      "_auctionId",
      ethereum.Value.fromUnsignedBigInt(_auctionId)
    )
  )

  return auctionConcludedEvent
}

export function createAuctionCreatedEvent(
  _seller: Address,
  _auctionId: BigInt,
  _propertyId: BigInt,
  _noOfShares: BigInt,
  _startTime: BigInt,
  _endTime: BigInt
): AuctionCreated {
  let auctionCreatedEvent = changetype<AuctionCreated>(newMockEvent())

  auctionCreatedEvent.parameters = new Array()

  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam("_seller", ethereum.Value.fromAddress(_seller))
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_auctionId",
      ethereum.Value.fromUnsignedBigInt(_auctionId)
    )
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_noOfShares",
      ethereum.Value.fromUnsignedBigInt(_noOfShares)
    )
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_startTime",
      ethereum.Value.fromUnsignedBigInt(_startTime)
    )
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_endTime",
      ethereum.Value.fromUnsignedBigInt(_endTime)
    )
  )

  return auctionCreatedEvent
}

export function createBlacklistedEvent(
  _user: Address,
  _status: boolean
): Blacklisted {
  let blacklistedEvent = changetype<Blacklisted>(newMockEvent())

  blacklistedEvent.parameters = new Array()

  blacklistedEvent.parameters.push(
    new ethereum.EventParam("_user", ethereum.Value.fromAddress(_user))
  )
  blacklistedEvent.parameters.push(
    new ethereum.EventParam("_status", ethereum.Value.fromBoolean(_status))
  )

  return blacklistedEvent
}

export function createDefaultReferralBipsUpdatedEvent(
  _oldReferralBips: BigInt,
  _newReferralBips: BigInt
): DefaultReferralBipsUpdated {
  let defaultReferralBipsUpdatedEvent = changetype<DefaultReferralBipsUpdated>(
    newMockEvent()
  )

  defaultReferralBipsUpdatedEvent.parameters = new Array()

  defaultReferralBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldReferralBips",
      ethereum.Value.fromUnsignedBigInt(_oldReferralBips)
    )
  )
  defaultReferralBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_newReferralBips",
      ethereum.Value.fromUnsignedBigInt(_newReferralBips)
    )
  )

  return defaultReferralBipsUpdatedEvent
}

export function createExclusiveReferralBipsUpdatedEvent(
  _agent: Address,
  _bips: BigInt
): ExclusiveReferralBipsUpdated {
  let exclusiveReferralBipsUpdatedEvent =
    changetype<ExclusiveReferralBipsUpdated>(newMockEvent())

  exclusiveReferralBipsUpdatedEvent.parameters = new Array()

  exclusiveReferralBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam("_agent", ethereum.Value.fromAddress(_agent))
  )
  exclusiveReferralBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam("_bips", ethereum.Value.fromUnsignedBigInt(_bips))
  )

  return exclusiveReferralBipsUpdatedEvent
}

export function createMinBidIncrementBipsUpdatedEvent(
  _oldBips: BigInt,
  _newBips: BigInt
): MinBidIncrementBipsUpdated {
  let minBidIncrementBipsUpdatedEvent = changetype<MinBidIncrementBipsUpdated>(
    newMockEvent()
  )

  minBidIncrementBipsUpdatedEvent.parameters = new Array()

  minBidIncrementBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldBips",
      ethereum.Value.fromUnsignedBigInt(_oldBips)
    )
  )
  minBidIncrementBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_newBips",
      ethereum.Value.fromUnsignedBigInt(_newBips)
    )
  )

  return minBidIncrementBipsUpdatedEvent
}

export function createMinListingPriceBipsUpdatedEvent(
  _oldBips: BigInt,
  _newBips: BigInt
): MinListingPriceBipsUpdated {
  let minListingPriceBipsUpdatedEvent = changetype<MinListingPriceBipsUpdated>(
    newMockEvent()
  )

  minListingPriceBipsUpdatedEvent.parameters = new Array()

  minListingPriceBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldBips",
      ethereum.Value.fromUnsignedBigInt(_oldBips)
    )
  )
  minListingPriceBipsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_newBips",
      ethereum.Value.fromUnsignedBigInt(_newBips)
    )
  )

  return minListingPriceBipsUpdatedEvent
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

export function createPlacedBidEvent(
  _bidder: Address,
  _auctionId: BigInt,
  _bid: BigInt
): PlacedBid {
  let placedBidEvent = changetype<PlacedBid>(newMockEvent())

  placedBidEvent.parameters = new Array()

  placedBidEvent.parameters.push(
    new ethereum.EventParam("_bidder", ethereum.Value.fromAddress(_bidder))
  )
  placedBidEvent.parameters.push(
    new ethereum.EventParam(
      "_auctionId",
      ethereum.Value.fromUnsignedBigInt(_auctionId)
    )
  )
  placedBidEvent.parameters.push(
    new ethereum.EventParam("_bid", ethereum.Value.fromUnsignedBigInt(_bid))
  )

  return placedBidEvent
}

export function createPlatformFeeUpdatedEvent(
  _by: Address,
  _oldFee: BigInt,
  _newFee: BigInt
): PlatformFeeUpdated {
  let platformFeeUpdatedEvent = changetype<PlatformFeeUpdated>(newMockEvent())

  platformFeeUpdatedEvent.parameters = new Array()

  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldFee",
      ethereum.Value.fromUnsignedBigInt(_oldFee)
    )
  )
  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_newFee",
      ethereum.Value.fromUnsignedBigInt(_newFee)
    )
  )

  return platformFeeUpdatedEvent
}

export function createPrimarySaleStatusEvent(
  _seller: Address,
  _propertyId: BigInt,
  _status: i32
): PrimarySaleStatus {
  let primarySaleStatusEvent = changetype<PrimarySaleStatus>(newMockEvent())

  primarySaleStatusEvent.parameters = new Array()

  primarySaleStatusEvent.parameters.push(
    new ethereum.EventParam("_seller", ethereum.Value.fromAddress(_seller))
  )
  primarySaleStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  primarySaleStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_status))
    )
  )

  return primarySaleStatusEvent
}

export function createPrimarySharesBoughtEvent(
  _buyer: Address,
  _agent: Address,
  _propertyId: BigInt,
  _sharesBought: BigInt,
  _investment: BigInt,
  _marketFees: BigInt,
  _commissionFees: BigInt
): PrimarySharesBought {
  let primarySharesBoughtEvent = changetype<PrimarySharesBought>(newMockEvent())

  primarySharesBoughtEvent.parameters = new Array()

  primarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam("_buyer", ethereum.Value.fromAddress(_buyer))
  )
  primarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam("_agent", ethereum.Value.fromAddress(_agent))
  )
  primarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  primarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_sharesBought",
      ethereum.Value.fromUnsignedBigInt(_sharesBought)
    )
  )
  primarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_investment",
      ethereum.Value.fromUnsignedBigInt(_investment)
    )
  )
  primarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_marketFees",
      ethereum.Value.fromUnsignedBigInt(_marketFees)
    )
  )
  primarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_commissionFees",
      ethereum.Value.fromUnsignedBigInt(_commissionFees)
    )
  )

  return primarySharesBoughtEvent
}

export function createPrimarySharesClaimedEvent(
  _user: Address,
  _propertyId: BigInt,
  _noOfShares: BigInt
): PrimarySharesClaimed {
  let primarySharesClaimedEvent = changetype<PrimarySharesClaimed>(
    newMockEvent()
  )

  primarySharesClaimedEvent.parameters = new Array()

  primarySharesClaimedEvent.parameters.push(
    new ethereum.EventParam("_user", ethereum.Value.fromAddress(_user))
  )
  primarySharesClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  primarySharesClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "_noOfShares",
      ethereum.Value.fromUnsignedBigInt(_noOfShares)
    )
  )

  return primarySharesClaimedEvent
}

export function createReferralAddedEvent(
  _by: Address,
  _referee: Address
): ReferralAdded {
  let referralAddedEvent = changetype<ReferralAdded>(newMockEvent())

  referralAddedEvent.parameters = new Array()

  referralAddedEvent.parameters.push(
    new ethereum.EventParam("_by", ethereum.Value.fromAddress(_by))
  )
  referralAddedEvent.parameters.push(
    new ethereum.EventParam("_referee", ethereum.Value.fromAddress(_referee))
  )

  return referralAddedEvent
}

export function createReferralCommissionClaimedEvent(
  _agent: Address,
  _commissionInETH: BigInt,
  _commissionInUSDC: BigInt
): ReferralCommissionClaimed {
  let referralCommissionClaimedEvent = changetype<ReferralCommissionClaimed>(
    newMockEvent()
  )

  referralCommissionClaimedEvent.parameters = new Array()

  referralCommissionClaimedEvent.parameters.push(
    new ethereum.EventParam("_agent", ethereum.Value.fromAddress(_agent))
  )
  referralCommissionClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "_commissionInETH",
      ethereum.Value.fromUnsignedBigInt(_commissionInETH)
    )
  )
  referralCommissionClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "_commissionInUSDC",
      ethereum.Value.fromUnsignedBigInt(_commissionInUSDC)
    )
  )

  return referralCommissionClaimedEvent
}

export function createSecondarySaleStatusEvent(
  _seller: Address,
  _listingId: BigInt,
  _propertyId: BigInt,
  _status: i32
): SecondarySaleStatus {
  let secondarySaleStatusEvent = changetype<SecondarySaleStatus>(newMockEvent())

  secondarySaleStatusEvent.parameters = new Array()

  secondarySaleStatusEvent.parameters.push(
    new ethereum.EventParam("_seller", ethereum.Value.fromAddress(_seller))
  )
  secondarySaleStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_listingId",
      ethereum.Value.fromUnsignedBigInt(_listingId)
    )
  )
  secondarySaleStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  secondarySaleStatusEvent.parameters.push(
    new ethereum.EventParam(
      "_status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_status))
    )
  )

  return secondarySaleStatusEvent
}

export function createSecondarySharesBoughtEvent(
  _buyer: Address,
  _propertyId: BigInt,
  _sharesBought: BigInt,
  _investment: BigInt,
  _marketFees: BigInt
): SecondarySharesBought {
  let secondarySharesBoughtEvent = changetype<SecondarySharesBought>(
    newMockEvent()
  )

  secondarySharesBoughtEvent.parameters = new Array()

  secondarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam("_buyer", ethereum.Value.fromAddress(_buyer))
  )
  secondarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_propertyId",
      ethereum.Value.fromUnsignedBigInt(_propertyId)
    )
  )
  secondarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_sharesBought",
      ethereum.Value.fromUnsignedBigInt(_sharesBought)
    )
  )
  secondarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_investment",
      ethereum.Value.fromUnsignedBigInt(_investment)
    )
  )
  secondarySharesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_marketFees",
      ethereum.Value.fromUnsignedBigInt(_marketFees)
    )
  )

  return secondarySharesBoughtEvent
}
