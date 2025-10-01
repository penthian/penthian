import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { APRChanged } from "../generated/schema"
import { APRChanged as APRChangedEvent } from "../generated/RWA/RWA"
import { handleAPRChanged } from "../src/rwa"
import { createAPRChangedEvent } from "./rwa-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _propertyId = BigInt.fromI32(234)
    let _oldApr = BigInt.fromI32(234)
    let _newApr = BigInt.fromI32(234)
    let newAPRChangedEvent = createAPRChangedEvent(
      _propertyId,
      _oldApr,
      _newApr
    )
    handleAPRChanged(newAPRChangedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("APRChanged created and stored", () => {
    assert.entityCount("APRChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "APRChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_propertyId",
      "234"
    )
    assert.fieldEquals(
      "APRChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_oldApr",
      "234"
    )
    assert.fieldEquals(
      "APRChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_newApr",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
