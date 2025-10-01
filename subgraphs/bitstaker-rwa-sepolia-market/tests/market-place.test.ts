import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { AgentWhitelistUpdated } from "../generated/schema"
import { AgentWhitelistUpdated as AgentWhitelistUpdatedEvent } from "../generated/MarketPlace/MarketPlace"
import { handleAgentWhitelistUpdated } from "../src/market-place"
import { createAgentWhitelistUpdatedEvent } from "./market-place-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _owner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _agent = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _isWhitelisted = "boolean Not implemented"
    let newAgentWhitelistUpdatedEvent = createAgentWhitelistUpdatedEvent(
      _owner,
      _agent,
      _isWhitelisted
    )
    handleAgentWhitelistUpdated(newAgentWhitelistUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AgentWhitelistUpdated created and stored", () => {
    assert.entityCount("AgentWhitelistUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AgentWhitelistUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_owner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AgentWhitelistUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_agent",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AgentWhitelistUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_isWhitelisted",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
