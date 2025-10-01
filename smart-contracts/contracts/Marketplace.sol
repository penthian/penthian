// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Company: Decrypted Labs
/// @title  MarketPlace Contract
/// @author Rabeeb Aqdas
/// @notice Manages primary and secondary sales of Real World Assets (RWA) using ERC1155 tokens.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title AggregatorV3Interface
 * @notice Interface for accessing price feed data (e.g., Chainlink).
 */
interface AggregatorV3Interface {
    /**
     * @notice Retrieves the latest round data from the price feed.
     * @dev Commonly used to fetch real-time price of ETH/USD or USDC/ETH.
     * @return roundId The unique identifier of the price round.
     * @return answer The latest price data (scaled appropriately).
     * @return startedAt The timestamp when the round was initiated.
     * @return updatedAt The timestamp when the latest data was pushed.
     * @return answeredInRound The round ID in which the answer was finalized.
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title IRWA
 * @notice Interface for interacting with tokenized real-world assets (RWAs).
 */
interface IRWA {
    /**
     * @notice Struct representing a tokenized property and its financial details.
     * @param owner Address of the property owner.
     * @param pricePerShare Price per individual share of the property.
     * @param totalOwners Current number of unique owners.
     * @param aprBips Annual percentage rate (APR) in basis points.
     * @param totalShares Total number of shares available for the property.
     * @param uri URI pointing to metadata or documents (e.g., IPFS, HTTPS).
     */
    struct Property {
        address owner;
        uint256 pricePerShare;
        uint256 totalOwners;
        uint256 aprBips;
        uint256 totalShares;
        string uri;
    }

    /**
     * @notice Retrieves complete details for a specific property.
     * @param _propertyId The ID of the property.
     * @return The full {Property} struct containing ownership and pricing data.
     */
    function getPropertyDetails(
        uint256 _propertyId
    ) external view returns (Property memory);

    /**
     * @notice Safely transfers tokenized property shares between users.
     * @dev Follows ERC1155 standards for transferring property tokens.
     * @param from Sender address.
     * @param to Recipient address.
     * @param id Token ID (property ID).
     * @param value Amount of tokens (shares) to transfer.
     * @param data Optional data field for extra transfer logic.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) external;

    /**
     * @notice Retrieves the share balance for a given user and property.
     * @param account The address of the token holder.
     * @param id The token ID (property ID).
     * @return The number of shares the user holds for the specified property.
     */
    function balanceOf(
        address account,
        uint256 id
    ) external view returns (uint256);

    /**
     * @notice Checks if an operator has blanket approval to manage a user’s assets.
     * @dev Useful for whitelisting marketplace or staking contracts.
     * @param account Token holder’s address.
     * @param operator Operator address being validated.
     * @return True if operator is approved for all, false otherwise.
     */
    function isApprovedForAll(
        address account,
        address operator
    ) external view returns (bool);

    /**
     * @notice Checks whether a given user is registered in the RWA system.
     * @param _userAddress Wallet address of the user.
     * @return True if registered, false otherwise.
     */
    function isRegistered(address _userAddress) external view returns (bool);

    /**
     * @notice Determines if a property is marked as delisted (i.e., inactive).
     * @param _propertyId The ID of the property to check.
     * @return True if the property is delisted, false otherwise.
     */
    function isPropertyDelisted(
        uint256 _propertyId
    ) external view returns (bool);
}

/**
 * @dev Revert when the caller has not approved the marketplace to transfer their tokens.
 */
error NftMarketplace__NotApproved();

/**
 * @dev Revert when ETH or token transfer fails due to a low-level call failure.
 */
error NftMarketplace__TransferFailed();

/**
 * @dev Revert when the user's balance is insufficient to complete the transaction.
 */
error NftMarketplace__NotEnoughBalance();

/**
 * @dev Revert when a non-owner tries to perform an owner-only action.
 */
error NftMarketplace__YouAreNotOwner();

/**
 * @dev Revert when trying to conclude or interact with a sale that is still ongoing.
 */
error NftMarketplace__SaleNotEndedYet();

/**
 * @dev Revert when an action is attempted by a restricted or unauthorized party.
 */
error NftMarketplace__ActionRestricted();

/**
 * @dev Revert when the property ID does not exist or has not been listed.
 */
error NftMarketplace__PropertyDoesNotExists();

/**
 * @dev Revert when the number of shares requested exceeds the available shares.
 */
error NftMarketplace__NotEnoughSharesAvailable();

/**
 * @dev Revert when trying to buy during a primary sale that has already ended.
 */
error NftMarketplace__PrimarySaleEnded();

/**
 * @dev Revert when trying to claim or refund while the primary sale is still active.
 */
error NftMarketplace__PrimarySaleNotEndedYet();

/**
 * @dev Revert when trying to conclude a primary sale that has already been concluded.
 */
error NftMarketplace__PrimarySaleAlreadyConcluded();

/**
 * @dev Revert when the user is not eligible to perform the action (e.g., no pending shares).
 */
error NftMarketplace__NotEligible();

/**
 * @dev Revert when the payment currency used is not accepted (must be USDC or ETH).
 */
error NftMarketplace__InvalidCurrency();

/**
 * @dev Revert when the value sent or provided is zero or exceeds required limits.
 */
error NftMarketplace__InvalidAmount();

/**
 * @dev Revert when a seller tries to list the same property twice.
 */
error NftMarketplace__AlreadyListed();

/**
 * @dev Revert when the price per share or base price provided is invalid (e.g., zero or too low).
 */
error NftMarketplace__InvalidPrice();

/**
 * @dev Revert when a user attempts to buy their own listing.
 */
error NftMarketplace__CantBuyYourListing();

/**
 * @dev Revert when a sale or listing could not be found based on the provided ID.
 */
error NftMarketplace__SaleNotFound();

/**
 * @dev Revert when the provided fee (in basis points) is invalid (e.g., > 100%).
 */
error NftMarketplace__InvalidBipsValue();

/**
 * @dev Revert when the listing price is below the minimum enforced listing threshold.
 */
error NftMarketplace__SellPriceTooLow();

/**
 * @dev Revert when attempting to set an invalid platform fee.
 */
error NftMarketplace__InvalidFeeAmount();

/**
 * @dev Revert when auction start or end time is logically invalid (e.g., start ≥ end).
 */
error NftMarketplace__InvalidDuration();

/**
 * @dev Revert when attempting to interact with an auction that doesn't exist.
 */
error NftMarketplace__AuctionNotFound();

/**
 * @dev Revert when trying to conclude an auction that has already been finalized.
 */
error NftMarketplace__AuctionAlreadyConcluded();

/**
 * @dev Revert when trying to interact with an auction that was cancelled.
 */
error NftMarketplace__AuctionHasCancelled();

/**
 * @dev Revert when trying to place a bid on an auction that has ended.
 */
error NftMarketplace__AuctionEnded();

/**
 * @dev Revert when attempting to place a bid before the auction's start time.
 */
error NftMarketplace__AuctionNotStartedYet();

/**
 * @dev Revert when the bid is less than the required minimum increment or base price.
 * @param _bidRequired The minimum valid bid amount.
 * @param _yourBid The actual bid amount provided.
 */
error NftMarketplace__InvalidBid(uint256 _bidRequired, uint256 _yourBid);

/**
 * @dev Revert when trying to conclude an auction before it has expired.
 */
error NftMarketplace__AuctionNotExpired();

/**
 * @dev Revert when attempting to cancel an auction that has already started.
 */
error NftMarketplace__AuctionHasStarted();

/**
 * @dev Revert when the auction conditions prevent placing a bid (e.g., delisted or time logic).
 */
error NftMarketplace__CantPlaceBid();

/**
 * @dev Revert when a referral address is invalid or disallowed.
 */
error NftMarketplace__InvalidReferral();

/**
 * @dev Revert when the attempted state change is redundant (e.g., setting same fee or whitelist status).
 */
error NftMarketplace__SameAction();

/**
 * @dev Revert when the provided address is the zero address or otherwise invalid.
 */
error NftMarketplace__InvalidAddress();

/**
 * @dev Revert when the referral commission value (in BIPS) is invalid.
 */
error NftMarketplace__InvalidReferralBips();

/**
 * @dev Revert when an invalid or zero address is used for an agent.
 */
error NftMarketplace__InvalidAgent();

/**
 * @dev Revert when the caller is not an approved or whitelisted agent.
 */
error NftMarketplace__YouAreNotWhitelistedAgent();

/**
 * @dev Revert when no referral commission is available to claim.
 */
error NftMarketplace__NoCommissionAvailable();

/**
 * @dev Revert when attempting to interact with a property that has been delisted.
 */
error NftMarketplace__PropertyIsDelisted();

contract MarketPlace is Ownable, IERC1155Receiver, ERC165 {
    ///////////////////////////////////////////////Structs//////////////////////////////////////////////

    /**
     * @notice Represents an active primary sale listing for a tokenized property.
     * @dev Stores financial information and sale progress for the property's initial offering.
     * @param seller Address of the seller initiating the primary sale.
     * @param endTime Timestamp when the primary sale ends.
     * @param sharesMinimumWorth Minimum required total worth of shares to validate the sale.
     * @param totalShares Total number of shares being offered in the sale.
     * @param sharesRemaining Number of shares still available for purchase.
     * @param usdcReceived Amount of USDC collected from buyers.
     * @param ethReceived Amount of ETH collected from buyers.
     * @param marketFeesInUSDC USDC fee collected by the marketplace.
     * @param marketFeesInETH ETH fee collected by the marketplace.
     */
    struct PrimaryListing {
        address seller; /// @dev Address of the seller.
        uint256 endTime; /// @dev Time when the sale ends.
        uint256 sharesMinimumWorth; /// @dev Minimum worth of shares to be sold.
        uint256 totalShares; /// @dev Total shares available for sale.
        uint256 sharesRemaining; /// @dev Remaining shares available.
        uint256 usdcReceived; /// @dev Amount of USDC received.
        uint256 ethReceived; /// @dev Amount of ETH received.
        uint256 marketFeesInUSDC; /// @dev Amount of USDC received.
        uint256 marketFeesInETH; /// @dev Amount of ETH received.
    }

    /**
     * @notice Represents a secondary market listing posted by a user.
     * @dev Enables resale of property shares after primary sale concludes.
     * @param seller Address of the share owner listing the tokens.
     * @param propertyId ID of the property the shares belong to.
     * @param pricePerShare Listing price per share in the selected currency.
     * @param sharesRemaining Remaining number of shares available for sale.
     */
    struct SecondaryListing {
        address seller; /// @dev Address of the seller.
        uint256 propertyId; /// @dev ID of the property.
        uint256 pricePerShare; /// @dev Price per share.
        uint256 sharesRemaining; /// @dev Remaining shares available.
    }

    /**
     * @notice Represents shares that a buyer has purchased but not yet claimed or refunded.
     * @dev Used during primary sales to track buyer contributions until sale is finalized.
     * @param shares Number of shares the buyer is entitled to.
     * @param usdcSpent Amount of USDC spent by the buyer.
     * @param ethSpent Amount of ETH spent by the buyer.
     */
    struct PendingShares {
        uint256 shares; /// @dev Number of shares pending.
        uint256 usdcSpent; /// @dev Amount of USDC spent.
        uint256 ethSpent; /// @dev Amount of ETH spent.
    }

    /**
     * @notice Represents a purchase intent for a secondary market listing.
     * @dev Used to specify which listing and how many shares a buyer wants to acquire.
     * @param listingId ID of the secondary sale listing.
     * @param sharesToBuy Number of shares the buyer intends to purchase.
     */
    struct Purchase {
        uint256 listingId; /// @dev ID of the listing.
        uint256 sharesToBuy; /// @dev Number of shares to buy.
    }

    /**
     * @notice Tracks referral commissions earned by an agent for a specific property.
     * @dev Split into ETH and USDC depending on buyer's payment method.
     * @param commissionInETH Total ETH earned in referral fees.
     * @param commissionInUSDC Total USDC earned in referral fees.
     */
    struct Commission {
        uint256 commissionInETH; /// @dev ID of the listing.
        uint256 commissionInUSDC; /// @dev Number of shares to buy.
    }

    /**
     * @notice Holds details of a live or upcoming auction for a property's shares.
     * @dev Used to manage time-based bidding processes for limited shares.
     * @param propertyId ID of the property being auctioned.
     * @param noOfShares Number of shares being auctioned.
     * @param basePrice Minimum total bid required to start the auction.
     * @param startTime Timestamp when the auction becomes active.
     * @param endTime Timestamp when the auction ends.
     * @param highestBid Current highest bid amount.
     * @param highestBidder Address of the highest bidder so far.
     * @param seller Address of the share owner conducting the auction.
     * @param status Current status of the auction (e.g., OnGoing, Ended).
     */
    struct AuctionDetails {
        uint256 propertyId;
        uint256 noOfShares;
        uint256 basePrice;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;
        address seller;
        AuctionState status;
    }

    /**
     * @notice Enum representing the lifecycle state of a primary sale.
     * @dev Used to control access to claim/refund logic post-sale.
     * @param None Initial uninitialized state.
     * @param OnGoing Sale is active and accepting purchases.
     * @param Claim Buyers can claim their shares.
     * @param Refund Buyers are eligible to get refunds.
     */
    enum PrimarySaleState {
        None, // 0
        OnGoing, // 1
        Claim, // 2
        Refund // 3
    }

    /**
     * @notice Enum representing the status of a secondary sale listing.
     * @param OnGoing Listing is active and accepting buyers.
     * @param Ended Listing has been fulfilled, cancelled, or expired.
     */
    enum SecondarySaleState {
        OnGoing, // 0
        Ended // 1
    }

    /**
     * @notice Enum representing the state of an auction for property shares.
     * @dev Used to manage auction flow and restrict bidding or claiming.
     * @param NotStarted Auction is scheduled but not yet live.
     * @param OnGoing Auction is currently accepting bids.
     * @param Cancelled Auction has been cancelled by the seller.
     * @param Ended Auction has reached its end time but is not finalized.
     * @param Concluded Auction has been processed and finalized.
     */
    enum AuctionState {
        NotStarted, // 0
        OnGoing, // 1
        Cancelled, // 2
        Ended, // 3
        Concluded // 4
    }

    /**
     * @dev Constant representing the decimal precision used by the USDC token (6 decimals).
     */
    uint256 private constant USDC_DECIMALS = 1e6;

    /**
     * @dev Base denominator (10000) used for basis points (BIPS) calculations across the contract.
     * For example, 250 BIPS = 2.5%.
     */
    uint256 private constant BASE = 10000;

    /**
     * @dev Address of the USDC token contract on Ethereum mainnet.
     */
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    /**
     * @dev Platform fee charged on each sale in basis points (e.g., 250 = 2.5%).
     */
    uint256 private _platformFeeBips;

    /**
     * @dev Minimum price-per-share listing requirement in basis points.
     * Used to prevent undercutting original property valuations.
     */
    uint256 private _minListingPriceBips;

    /**
     * @dev Minimum bid increment required during auctions, in basis points.
     * Ensures new bids are sufficiently higher than the previous one.
     */
    uint256 private _minBidIncrementBips;

    /**
     * @dev Counter for auto-incrementing secondary listing IDs.
     */
    uint256 private _listingIds;

    /**
     * @dev Counter for auto-incrementing auction IDs.
     */
    uint256 private _auctionIds;

    /**
     * @dev Default referral commission in basis points (applies if no exclusive override is set).
     */
    uint256 private _defaultReferralBips;

    /**
     * @dev ERC20 interface instance for the USDC stablecoin.
     */
    IERC20 private _helperUsdc = IERC20(USDC);

    /**
     * @dev Chainlink oracles price feed interface for converting ETH to USD.
     */
    AggregatorV3Interface private priceFeed;

    /**
     * @dev Instance of the Real World Assets (RWA) contract.
     */
    IRWA private _helperRWA;

    /**
     * @dev Mapping to track blacklisted users.
     * If true, the user is restricted from interacting with the marketplace.
     */
    mapping(address => bool) private _blacklisted;

    /**
     * @dev Maps property ID to its associated primary sale listing.
     */
    mapping(uint256 => PrimaryListing) private _primaryListing;

    /**
     * @dev Whitelist of valid currencies supported by the platform (e.g., USDC, ETH).
     */
    mapping(address => bool) private _validCurrencies;

    /**
     * @dev Maps secondary listing ID to its associated secondary sale details.
     */
    mapping(uint256 => SecondaryListing) private _secondaryListing;

    /**
     * @dev Tracks if a user has already listed a specific property before (used for duplicate prevention).
     */
    mapping(address => mapping(uint256 => bool))
        private _secondaryListingHistory;

    /**
     * @dev Tracks pending shares and payment data for each buyer and property during the primary sale.
     */
    mapping(uint256 => mapping(address => PendingShares))
        private _pendingSharesDetails;

    /**
     * @dev Tracks the current state of the primary sale for each property.
     */
    mapping(uint256 => PrimarySaleState) private _primarySaleState;

    /**
     * @dev Maps auction ID to its respective auction details.
     */
    mapping(uint256 => AuctionDetails) private _auctionDetails;

    /**
     * @dev Optional referral commission override in BIPS for specific agents.
     * If present, overrides the default referral percentage.
     */
    mapping(address => uint256) private _exclusiveReferralBips;

    /**
     * @dev Tracks whitelisted agents eligible for receiving commissions.
     */
    mapping(address => bool) private _whitelistedAgents;

    /**
     * @dev Maps a user to the referral agent who referred them.
     */
    mapping(address => address) private _referral;

    /**
     * @dev Flags properties that have been delisted and should not be tradable.
     */
    mapping(uint256 => bool) private _delistedProperties;

    /**
     * @dev Maps an agent and property to the commissions accumulated in ETH and USDC.
     */
    mapping(address => mapping(uint256 => Commission))
        private _referralCommission;

    /**
     * @notice Emitted when the primary sale state is updated.
     * @dev Tracks sale progress for a given property.
     * @custom:event PrimarySaleStatus
     */
    event PrimarySaleStatus(
        address indexed _seller,
        uint256 _propertyId,
        PrimarySaleState _status
    );

    /**
     * @notice Emitted when the secondary sale state is updated.
     * @dev Tracks status of individual secondary listings.
     * @custom:event SecondarySaleStatus
     */
    event SecondarySaleStatus(
        address indexed _seller,
        uint256 _listingId,
        uint256 _propertyId,
        SecondarySaleState _status
    );

    /**
     * @notice Emitted when an investor buys primary shares.
     * @dev Includes fee breakdown and agent commission.
     * @custom:event PrimarySharesBought
     */
    event PrimarySharesBought(
        address indexed _buyer,
        address _agent,
        uint256 _propertyId,
        uint256 _sharesBought,
        uint256 _investment,
        uint256 _marketFees,
        uint256 _commissionFees
    );

    /**
     * @notice Emitted when a user claims their primary sale shares.
     * @dev Useful for post-sale minting or balance updates.
     * @custom:event PrimarySharesClaimed
     */
    event PrimarySharesClaimed(
        address indexed _user,
        uint256 _propertyId,
        uint256 _noOfShares
    );

    /**
     * @notice Emitted when secondary market shares are purchased.
     * @dev Includes investment amount and applicable fees.
     * @custom:event SecondarySharesBought
     */
    event SecondarySharesBought(
        address indexed _buyer,
        uint256 _propertyId,
        uint256 _sharesBought,
        uint256 _investment,
        uint256 _marketFees
    );

    /**
     * @notice Emitted when the platform fee is updated.
     * @dev Basis points used for fee calculation.
     * @custom:event PlatformFeeUpdated
     */
    event PlatformFeeUpdated(
        address indexed _by,
        uint256 _oldFee,
        uint256 _newFee
    );

    /**
     * @notice Emitted when a new auction is created.
     * @dev Defines auction parameters and timing.
     * @custom:event AuctionCreated
     */
    event AuctionCreated(
        address indexed _seller,
        uint256 _auctionId,
        uint256 _propertyId,
        uint256 _noOfShares,
        uint256 _startTime,
        uint256 _endTime
    );

    /**
     * @notice Emitted when default referral BIPS is changed.
     * @dev Affects agents without exclusive BIPS settings.
     * @custom:event DefaultReferralBipsUpdated
     */
    event DefaultReferralBipsUpdated(
        uint256 _oldReferralBips,
        uint256 _newReferralBips
    );

    /**
     * @notice Emitted when exclusive referral BIPS is updated for an agent.
     * @dev Overrides the default BIPS for that agent.
     * @custom:event ExclusiveReferralBipsUpdated
     */
    event ExclusiveReferralBipsUpdated(address indexed _agent, uint256 _bips);

    /**
     * @notice Emitted when a whitelisted agent claims commissions.
     * @dev Separates ETH and USDC components.
     * @custom:event ReferralCommissionClaimed
     */
    event ReferralCommissionClaimed(
        address indexed _agent,
        uint256 _commissionInETH,
        uint256 _commissionInUSDC
    );

    /**
     * @notice Emitted when an agent is added or removed from whitelist.
     * @dev Used to restrict commission and bidding logic.
     * @custom:event AgentWhitelistUpdated
     */
    event AgentWhitelistUpdated(
        address indexed _owner,
        address indexed _agent,
        bool _isWhitelisted
    );

    /**
     * @notice Emitted when a bid is placed in an auction.
     * @dev Includes amount and auction reference.
     * @custom:event PlacedBid
     */
    event PlacedBid(address indexed _bidder, uint256 _auctionId, uint256 _bid);

    /**
     * @notice Emitted when an auction is concluded.
     * @dev Used to finalize payouts or ownership transfers.
     * @custom:event AuctionConcluded
     */
    event AuctionConcluded(address indexed _by, uint256 _auctionId);

    /**
     * @notice Emitted when minimum listing price (BIPS) is updated.
     * @dev Used in validations for secondary listings.
     * @custom:event MinListingPriceBipsUpdated
     */
    event MinListingPriceBipsUpdated(uint256 _oldBips, uint256 _newBips);

    /**
     * @notice Emitted when the minimum bid increment (BIPS) is updated.
     * @dev Affects auction bidding requirements.
     * @custom:event MinBidIncrementBipsUpdated
     */
    event MinBidIncrementBipsUpdated(uint256 _oldBips, uint256 _newBips);

    /**
     * @notice Emitted when a referral is linked to a user.
     * @dev Used to track commission eligibility.
     * @custom:event ReferralAdded
     */
    event ReferralAdded(address indexed _by, address indexed _referee);

    /**
     * @notice Emitted when a user is blacklisted or removed from blacklist.
     * @dev Restricts interaction with core platform functions.
     * @custom:event Blacklisted
     */
    event Blacklisted(address indexed _user, bool _status);

    ///////////////////////////////////////////////Modifiers//////////////////////////////////////////////

    /**
     * @dev Modifier that allows only the RWA contract (authorizer) to perform an action.
     * Reverts with {NftMarketplace__ActionRestricted} if called by anyone else.
     */
    modifier onlyAuthorizer() {
        address _sender = _msgSender();
        if (_sender != address(_helperRWA))
            revert NftMarketplace__ActionRestricted();
        _;
    }

    /**
     * @dev Modifier that restricts access for blacklisted users.
     * Reverts with {NftMarketplace__ActionRestricted} if user is blacklisted.
     * @param _user The address to check against the blacklist.
     */
    modifier notBlacklisted(address _user) {
        if (_blacklisted[_user]) revert NftMarketplace__ActionRestricted();
        _;
    }

    /**
     * @dev Modifier that ensures the given property is not delisted.
     * Reverts with {NftMarketplace__PropertyIsDelisted} if property is delisted.
     * @param _propertyId The ID of the property to validate.
     */
    modifier onlyIfNotDelisted(uint256 _propertyId) {
        if (_helperRWA.isPropertyDelisted(_propertyId))
            revert NftMarketplace__PropertyIsDelisted();
        _;
    }

    /**
     * @notice Receives plain Ether transfers.
     * @dev Triggered when Ether is sent to the contract without calldata.
     * @custom:receive receive()
     */
    receive() external payable {}

    /**
     * @notice Handles unexpected or unimplemented function calls.
     * @dev Triggered when the call data does not match any function signature.
     * @custom:fallback fallback()
     */
    fallback() external payable {}

    /**
     * @notice Initializes the marketplace contract with core configuration.
     * @dev Sets RWA contract address, fee values, and default referral BIPS. Enables USDC and ETH as valid currencies.
     * @param rwaAddress_ Address of the deployed RWA contract.
     * @param platformFeeBips_ Platform fee expressed in basis points (1 BIP = 0.01%).
     * @param minListingPriceBips_ Minimum listing price allowed, expressed in BIPS.
     * @param minBidIncrementBips_ Minimum increment required to outbid an existing auction bid, in BIPS.
     * @param _referralBips Default referral commission share in BIPS.
     * @custom:constructor Constructor for NftMarketplace
     */
    constructor(
        address rwaAddress_,
        uint256 platformFeeBips_,
        uint256 minListingPriceBips_,
        uint256 minBidIncrementBips_,
        uint256 _referralBips
    ) Ownable(_msgSender()) {
        _helperRWA = IRWA(rwaAddress_);
        _platformFeeBips = platformFeeBips_;
        _minListingPriceBips = minListingPriceBips_;
        _minBidIncrementBips = minBidIncrementBips_;
        _defaultReferralBips = _referralBips;
        _validCurrencies[USDC] = true;
        _validCurrencies[address(0)] = true;
        priceFeed = AggregatorV3Interface(
            0x986b5E1e1755e3C2440e960477f25201B0a8bbD4 // USDC / ETH feed address
        );
    }

    //////////////////////////////Main functions/////////////////////////////////
    /**
     * @notice Starts a new primary sale for a specific property.
     * @dev Only callable by the authorized RWA contract. Initializes listing details and sets the sale state to OnGoing.
     * @param _seller Address of the property owner initiating the sale.
     * @param _propertyId Unique identifier for the property.
     * @param _totalShares Total number of shares available for sale.
     * @param _endTime Timestamp indicating when the sale ends.
     * @param _sharesMinimumWorth Minimum value (in USDC/ETH) required for the sale to be valid.
     */
    function startPrimarySale(
        address _seller,
        uint256 _propertyId,
        uint256 _totalShares,
        uint256 _endTime,
        uint256 _sharesMinimumWorth
    ) external onlyAuthorizer onlyIfNotDelisted(_propertyId) {
        _primaryListing[_propertyId] = PrimaryListing({
            seller: _seller,
            endTime: _endTime,
            sharesMinimumWorth: _sharesMinimumWorth,
            totalShares: _totalShares,
            sharesRemaining: _totalShares,
            usdcReceived: 0,
            ethReceived: 0,
            marketFeesInUSDC: 0,
            marketFeesInETH: 0
        });
        _primarySaleState[_propertyId] = PrimarySaleState.OnGoing;
        emit PrimarySaleStatus(_seller, _propertyId, PrimarySaleState.OnGoing);
    }

    /**
     * @notice Allows a user to purchase shares during an ongoing primary sale.
     * @dev Validates input and delegates the transaction to internal logic. Also registers a referral if provided.
     * @param _recipient Address receiving the shares.
     * @param _currency Currency used for purchase (USDC or ETH).
     * @param _propertyId ID of the property being purchased.
     * @param _sharesToBuy Number of shares the user wants to buy.
     * @param _referralAddress Optional referral agent address.
     */
    function buyPrimaryShares(
        address _recipient,
        address _currency,
        uint256 _propertyId,
        uint256 _sharesToBuy,
        address _referralAddress
    ) external payable notBlacklisted(_recipient) {
        // ► read-only copy from storage (lives in memory)
        PrimaryListing memory prop = _primaryListing[_propertyId];

        // 1) validations
        if (!_validCurrencies[_currency])
            revert NftMarketplace__InvalidCurrency();
        if (prop.seller == address(0))
            revert NftMarketplace__PropertyDoesNotExists();
        if (block.timestamp > prop.endTime)
            revert NftMarketplace__PrimarySaleEnded();
        if (_sharesToBuy > prop.sharesRemaining)
            revert NftMarketplace__NotEnoughSharesAvailable();

        // 2) optional referral registration
        if (
            !_helperRWA.isRegistered(_recipient) &&
            _referralAddress != address(0)
        ) {
            _addReferral(_recipient, _referralAddress);
        }

        // 3) delegate _all_ mutations into one helper (which uses storage)
        _executeBuy(
            _msgSender(),
            _recipient,
            _currency,
            _propertyId,
            _sharesToBuy
        );
    }

    /**
     * @dev Internal function that executes a primary share purchase.
     * @param sender Address initiating the payment.
     * @param recipient Address receiving the shares.
     * @param currency Payment currency (USDC or ETH).
     * @param propertyId ID of the property.
     * @param sharesToBuy Number of shares to purchase.
     */
    function _executeBuy(
        address sender,
        address recipient,
        address currency,
        uint256 propertyId,
        uint256 sharesToBuy
    ) private {
        // pull in your structs
        PrimaryListing storage prop = _primaryListing[propertyId];
        PendingShares storage info = _pendingSharesDetails[propertyId][
            recipient
        ];

        // —— compute pricing & fees exactly as before ——
        uint256 price = _helperRWA.getPropertyDetails(propertyId).pricePerShare;
        uint256 quotation = _getQuote(currency, sharesToBuy, price);

        uint256 initialFees = (quotation * _platformFeeBips) / BASE;
        uint256 creatorAmount = quotation - initialFees;

        (address agent, uint256 referralFees) = _getRefereeAndAmount(
            recipient,
            initialFees
        );

        uint256 marketFees = initialFees - referralFees;

        // —— payment & storage updates ——
        if (currency == USDC) {
            _sendUSDC(sender, address(this), quotation);
            info.usdcSpent += quotation;
            prop.usdcReceived += creatorAmount;
            prop.marketFeesInUSDC += marketFees;
            if (referralFees > 0)
                _referralCommission[agent][propertyId]
                    .commissionInUSDC += referralFees;
        } else {
            if (msg.value < quotation) revert NftMarketplace__InvalidAmount();
            if (msg.value > quotation)
                _sendETH(recipient, msg.value - quotation);
            info.ethSpent += quotation;
            prop.ethReceived += creatorAmount;
            prop.marketFeesInETH += marketFees;
            if (referralFees > 0)
                _referralCommission[agent][propertyId]
                    .commissionInETH += referralFees;
        }

        // —— share counts ——
        info.shares += sharesToBuy;
        prop.sharesRemaining -= sharesToBuy;

        // — single emit —
        uint256 outMarketFees = marketFees;
        uint256 outReferralFees = referralFees;
        if (currency == address(0)) {
            // ETH case, convert both to USD
            outMarketFees = _getUSDFromETH(marketFees);
            outReferralFees = _getUSDFromETH(referralFees);
            quotation = _getUSDFromETH(quotation);
        }

        emit PrimarySharesBought(
            recipient,
            agent,
            propertyId,
            sharesToBuy,
            quotation,
            outMarketFees,
            outReferralFees
        );
    }

    /**
     * @notice Converts an ETH amount to its equivalent in USDC using Chainlink oracle data.
     * @dev Fails if the price feed is stale or returns non-positive price.
     * @param ethAmount Amount in ETH to convert.
     * @return usdAmount Equivalent USDC amount.
     */
    function _getUSDFromETH(
        uint256 ethAmount
    ) private view returns (uint256 usdAmount) {
        (, int256 _oneUsdcPriceInEth, , , ) = priceFeed.latestRoundData();
        if (_oneUsdcPriceInEth <= 0) revert NftMarketplace__InvalidPrice();

        // int256 _oneUsdcPriceInEth = 260035792536273; // 0.000260035792536273

        uint256 ethPerUsd = uint256(_oneUsdcPriceInEth);
        usdAmount = (ethAmount * USDC_DECIMALS) / ethPerUsd;
    }

    /**
     * @notice Allows users to claim purchased shares or receive a refund after a primary sale ends.
     * @dev Transfers shares or refunds the user's ETH/USDC depending on the final sale state.
     * @param _propertyId ID of the property sale the user participated in.
     */
    function claimPendingSharesOrFunds(
        uint256 _propertyId
    ) external notBlacklisted(_msgSender()) {
        address _sender = _msgSender();
        PendingShares memory _userInfo = _pendingSharesDetails[_propertyId][
            _sender
        ];
        PrimarySaleState _propertyState = _primarySaleState[_propertyId];
        if (_propertyState == PrimarySaleState.None)
            revert NftMarketplace__PropertyDoesNotExists();
        if (_userInfo.shares == 0) revert NftMarketplace__NotEligible();
        if (_propertyState == PrimarySaleState.OnGoing)
            revert NftMarketplace__PrimarySaleNotEndedYet();
        delete _pendingSharesDetails[_propertyId][_sender];
        if (_propertyState == PrimarySaleState.Claim) {
            _helperRWA.safeTransferFrom(
                address(this),
                _sender,
                _propertyId,
                _userInfo.shares,
                ""
            );
            emit PrimarySharesClaimed(_sender, _propertyId, _userInfo.shares);
        } else _transferFunds(_sender, _userInfo.ethSpent, _userInfo.usdcSpent);
    }

    /**
     * @notice Adds a referral for the caller.
     * @param _client The address of the client being referred.
     * @param _referee The address of the referral agent.
     * @dev Associates the caller with the given referral agent.
     *      Reverts if the referral already exists or if the user is already registered.
     */
    function _addReferral(address _client, address _referee) private {
        if (_referee == _client || !_whitelistedAgents[_referee])
            revert NftMarketplace__InvalidReferral();
        _referral[_client] = _referee;
        emit ReferralAdded(_client, _referee);
    }

    /**
     * @dev Retrieves the referral agent and referral fee amount for a given recipient.
     * @param _recipient Address of the user who may have a referral agent.
     * @param _amount Base amount on which referral fee is calculated.
     * @return _agent Referral agent's address.
     * @return _referralAmount Calculated referral fee.
     */
    function _getRefereeAndAmount(
        address _recipient,
        uint256 _amount
    ) private view returns (address _agent, uint256 _referralAmount) {
        address _agentAddr = _referral[_recipient];
        if (_agentAddr != address(0)) {
            uint256 _exclusiveBips = _exclusiveReferralBips[_agentAddr];
            uint256 _referralBips = _exclusiveBips > 0
                ? _exclusiveBips
                : _defaultReferralBips;
            _referralAmount = (_amount * _referralBips) / BASE;
            _agent = _agentAddr;
        }
    }

    /**
     * @notice Concludes a primary sale for a given property.
     * @dev Only callable by the contract owner. Transfers remaining funds or refunds based on the outcome.
     * @param _propertyId ID of the property whose sale is being concluded.
     */
    function concludePrimarySale(uint256 _propertyId) external onlyOwner {
        address _sender = _msgSender();
        PrimaryListing memory _listing = _primaryListing[_propertyId];
        if (_listing.sharesRemaining > 0 && _listing.endTime > block.timestamp)
            revert NftMarketplace__SaleNotEndedYet();
        if (_primarySaleState[_propertyId] != PrimarySaleState.OnGoing)
            revert NftMarketplace__PrimarySaleAlreadyConcluded();
        delete _primaryListing[_propertyId];
        uint256 _pricePerShare = _helperRWA
            .getPropertyDetails(_propertyId)
            .pricePerShare;
        uint256 _remainingSharesWorth = _listing.sharesRemaining *
            _pricePerShare;

        bool _action = _remainingSharesWorth > _listing.sharesMinimumWorth;
        PrimarySaleState _status = _action
            ? PrimarySaleState.Refund
            : PrimarySaleState.Claim;

        if (_action) {
            _helperRWA.safeTransferFrom(
                address(this),
                _listing.seller,
                _propertyId,
                _listing.totalShares,
                ""
            );
        } else {
            _transferFunds(
                _listing.seller,
                _listing.ethReceived,
                _listing.usdcReceived
            );

            _transferFunds(
                _sender,
                _listing.marketFeesInETH,
                _listing.marketFeesInUSDC
            );

            if (_listing.sharesRemaining > 0)
                _helperRWA.safeTransferFrom(
                    address(this),
                    _listing.seller,
                    _propertyId,
                    _listing.sharesRemaining,
                    ""
                );
        }

        _primarySaleState[_propertyId] = _status;

        emit PrimarySaleStatus(_listing.seller, _propertyId, _status);
    }

    /**
     * @notice Changes the default referral BIPS value used when no exclusive BIPS is set.
     * @dev Only callable by the contract owner. Emits DefaultReferralBipsUpdated event.
     * @param newReferralBips New referral BIPS value to be set.
     */
    function changeDefaultReferralBips(
        uint256 newReferralBips
    ) external onlyOwner {
        uint256 oldReferralBips = _defaultReferralBips;
        if (
            newReferralBips == 0 ||
            oldReferralBips == newReferralBips ||
            newReferralBips > BASE
        ) revert NftMarketplace__InvalidReferralBips();
        _defaultReferralBips = newReferralBips;
        emit DefaultReferralBipsUpdated(oldReferralBips, newReferralBips);
    }

    /**
     * @notice Adds or updates an exclusive referral BIPS value for a specific agent.
     * @dev Only callable by the contract owner. Emits ExclusiveReferralBipsUpdated event.
     * @param _agent Address of the referral agent.
     * @param _bips Exclusive BIPS value to assign to the agent.
     */

    function addExclusiveReferralBips(
        address _agent,
        uint256 _bips
    ) external onlyOwner {
        if (_agent == address(0)) revert NftMarketplace__InvalidAgent();
        if (_bips > BASE || _exclusiveReferralBips[_agent] == _bips)
            revert NftMarketplace__InvalidReferralBips();

        _exclusiveReferralBips[_agent] = _bips;

        emit ExclusiveReferralBipsUpdated(_agent, _bips);
    }

    /**
     * @notice Updates the whitelist status of a referral agent.
     * @dev Only callable by the contract owner. Emits AgentWhitelistUpdated event.
     * @param _agent Address of the agent.
     * @param _status Boolean indicating whether to whitelist or remove from whitelist.
     */
    function updateAgentWhitelistStatus(
        address _agent,
        bool _status
    ) external onlyOwner {
        if (_agent == address(0)) revert NftMarketplace__InvalidAddress();
        if (_whitelistedAgents[_agent] == _status)
            revert NftMarketplace__SameAction();
        _whitelistedAgents[_agent] = _status;
        emit AgentWhitelistUpdated(owner(), _agent, _status);
    }

    /**
     * @notice Creates a new secondary listing for a property.
     * @dev Only allowed if property is not delisted and caller owns sufficient shares.
     * @param _propertyId ID of the property to list.
     * @param _noOfShares Number of shares to sell.
     * @param _pricePerShare Price per share to list.
     */
    function secondarySale(
        uint256 _propertyId,
        uint256 _noOfShares,
        uint256 _pricePerShare
    ) external notBlacklisted(_msgSender()) onlyIfNotDelisted(_propertyId) {
        address _sender = _msgSender();
        uint256 _userShares = _helperRWA.balanceOf(_sender, _propertyId);

        if (_primarySaleState[_propertyId] == PrimarySaleState.OnGoing)
            revert NftMarketplace__PrimarySaleNotEndedYet();
        if (_secondaryListingHistory[_sender][_propertyId])
            revert NftMarketplace__AlreadyListed();
        if (_noOfShares > _userShares)
            revert NftMarketplace__NotEnoughBalance();
        if (_pricePerShare == 0) revert NftMarketplace__InvalidPrice();
        if (!_helperRWA.isApprovedForAll(_sender, address(this)))
            revert NftMarketplace__NotApproved();

        _enforceMinListingPrice(_propertyId, _pricePerShare);
        uint256 _nextId = ++_listingIds;
        SecondaryListing memory _listing = _secondaryListing[_nextId];

        _listing.seller = _sender;
        _listing.propertyId = _propertyId;
        _listing.pricePerShare = _pricePerShare;
        _listing.sharesRemaining = _noOfShares;
        _secondaryListing[_nextId] = _listing;
        _secondaryListingHistory[_sender][_propertyId] = true;
        emit SecondarySaleStatus(
            _sender,
            _nextId,
            _propertyId,
            SecondarySaleState.OnGoing
        );
    }

    /**
     * @notice Updates a previously created secondary listing.
     * @dev Only the listing owner can update it. Can update share count and/or price per share.
     * @param _listingId ID of the listing to update.
     * @param _noOfShares New number of shares (if updating).
     * @param _pricePerShare New price per share (if updating).
     */
    function updateSecondarySale(
        uint256 _listingId,
        uint256 _noOfShares,
        uint256 _pricePerShare
    ) external notBlacklisted(_msgSender()) {
        address _sender = _msgSender();
        SecondaryListing memory _listing = _secondaryListing[_listingId];
        if (_listing.seller != _sender) revert NftMarketplace__SaleNotFound();
        if (_helperRWA.isPropertyDelisted(_listing.propertyId))
            revert NftMarketplace__PropertyIsDelisted();
        if (_pricePerShare > 0) {
            _enforceMinListingPrice(_listing.propertyId, _pricePerShare);
            _listing.pricePerShare = _pricePerShare;
        }
        if (_noOfShares > 0) {
            uint256 _userShares = _helperRWA.balanceOf(
                _sender,
                _listing.propertyId
            );
            if (_noOfShares > _userShares)
                revert NftMarketplace__NotEnoughBalance();
            _listing.sharesRemaining = _noOfShares;
        }

        _secondaryListing[_listingId] = _listing;

        emit SecondarySaleStatus(
            _listing.seller,
            _listingId,
            _listing.propertyId,
            SecondarySaleState.OnGoing
        );
    }

    /**
     * @notice Cancels a secondary listing created by the user.
     * @dev Only the original seller can cancel their listing.
     * @param _listingId ID of the listing to cancel.
     */
    function cancelSecondarySale(uint256 _listingId) external {
        address _sender = _msgSender();
        SecondaryListing memory _listing = _secondaryListing[_listingId];
        if (_listing.seller != _sender) revert NftMarketplace__SaleNotFound();
        _deleteSecondaryListing(_sender, _listingId, _listing.propertyId);
    }

    /**
     * @notice Buys shares from a secondary sale listing.
     * @dev Validates the listing, currency, and payment; handles ETH/USDC transfer and updates listing state.
     * @param _property The purchase details including listing ID and number of shares to buy.
     * @param _recipient Address that will receive the shares.
     * @param _currency Address of the currency used for purchase (USDC or ETH).
     */
    function buySecondaryShares(
        Purchase memory _property,
        address _recipient,
        address _currency
    ) external payable notBlacklisted(_recipient) {
        if (!_validCurrencies[_currency])
            revert NftMarketplace__InvalidCurrency();

        _buySecondaryShares(_property, _recipient, _currency, false);
    }

    /**
     * @notice Internal function to execute a secondary share purchase.
     * @dev Transfers funds, updates listing or deletes it, and transfers NFTs to buyer.
     * @param _property Purchase details including listing ID and shares to buy.
     * @param _recipient Address to receive shares.
     * @param _currency Currency used in the purchase.
     * @param _isBulk Whether this purchase is part of a bulk transaction.
     * @return _platFormFee The platform fee deducted during the transaction.
     */

    function _buySecondaryShares(
        Purchase memory _property,
        address _recipient,
        address _currency,
        bool _isBulk
    ) private returns (uint256 _platFormFee) {
        address _sender = _msgSender();
        address _marketplaceOwner = owner();

        SecondaryListing memory _listing = _secondaryListing[
            _property.listingId
        ];
        if (_listing.seller == address(0))
            revert NftMarketplace__SaleNotFound();
        if (_helperRWA.isPropertyDelisted(_listing.propertyId))
            revert NftMarketplace__PropertyIsDelisted();
        if (_listing.seller == _recipient)
            revert NftMarketplace__CantBuyYourListing();
        if (_property.sharesToBuy > _listing.sharesRemaining)
            revert NftMarketplace__NotEnoughSharesAvailable();

        uint256 _quotation = _getQuote(
            _currency,
            _property.sharesToBuy,
            _listing.pricePerShare
        );
        _platFormFee = (_quotation * _platformFeeBips) / BASE;
        uint256 outQuotation = _quotation;
        uint256 outMarketFees = _platFormFee;
        if (_currency == USDC) {
            if (!_isBulk) _sendUSDC(_sender, _marketplaceOwner, _platFormFee);
            _sendUSDC(_sender, _listing.seller, (_quotation - _platFormFee));
        } else {
            if (_quotation > msg.value) revert NftMarketplace__InvalidAmount();

            _sendETH(_marketplaceOwner, _platFormFee);
            _sendETH(_listing.seller, (_quotation - _platFormFee));
            if (msg.value > _quotation)
                _sendETH(_recipient, (msg.value - _quotation));
            outQuotation = _getUSDFromETH(_quotation);
            outMarketFees = _getUSDFromETH(_platFormFee);
        }

        _listing.sharesRemaining -= _property.sharesToBuy;

        if (_listing.sharesRemaining > 0)
            _secondaryListing[_property.listingId] = _listing;
        else
            _deleteSecondaryListing(
                _listing.seller,
                _property.listingId,
                _listing.propertyId
            );
        _helperRWA.safeTransferFrom(
            _listing.seller,
            _recipient,
            _listing.propertyId,
            _property.sharesToBuy,
            ""
        );
        emit SecondarySharesBought(
            _recipient,
            _listing.propertyId,
            _property.sharesToBuy,
            outQuotation,
            outMarketFees
        );
    }

    /**
     * @notice Ensures the listing price per share meets minimum requirements.
     * @dev Calculates minimum price based on primary price and configured BIPs.
     * @param _propertyId ID of the property being listed.
     * @param _pricePerShare Price per share in the listing.
     */
    function _enforceMinListingPrice(
        uint256 _propertyId,
        uint256 _pricePerShare
    ) private view {
        uint256 pricePerShare_ = _helperRWA
            .getPropertyDetails(_propertyId)
            .pricePerShare;
        uint256 minAllowedPrice = (pricePerShare_ * _minListingPriceBips) /
            BASE;

        if (minAllowedPrice > _pricePerShare)
            revert NftMarketplace__SellPriceTooLow();
    }

    /**
     * @notice Deletes a secondary listing from storage.
     * @dev Also removes history to allow relisting by same user.
     * @param _seller The address of the listing creator.
     * @param _listingId ID of the listing.
     * @param _propertyId ID of the associated property.
     */
    function _deleteSecondaryListing(
        address _seller,
        uint256 _listingId,
        uint256 _propertyId
    ) private {
        delete _secondaryListing[_listingId];
        delete _secondaryListingHistory[_seller][_propertyId];

        emit SecondarySaleStatus(
            _seller,
            _listingId,
            _propertyId,
            SecondarySaleState.Ended
        );
    }

    /**
     * @notice Allows bulk purchase of secondary sale listings.
     * @dev Aggregates platform fees and purchases all listings in USDC.
     * @param _properties Array of purchase details for each listing.
     * @param _recipient Address that will receive all purchased shares.
     */
    function bulkBuySecondarySale(
        Purchase[] memory _properties,
        address _recipient
    ) external notBlacklisted(_recipient) {
        address _sender = _msgSender();
        address _marketplaceOwner = owner();
        uint256 _platFormFee;
        for (uint256 i; i < _properties.length; ++i) {
            _platFormFee += _buySecondaryShares(
                _properties[i],
                _recipient,
                USDC,
                true
            );
        }
        _sendUSDC(_sender, _marketplaceOwner, _platFormFee);
    }

    /**
     * @notice Creates an auction for a property’s shares.
     * @dev Validates duration, price, balance and approval.
     * @param _propertyId ID of the property.
     * @param _noOfShares Number of shares to auction.
     * @param _basePrice Minimum starting price for all shares.
     * @param _startTime Timestamp when the auction starts.
     * @param _endTime Timestamp when the auction ends.
     */
    function createAuction(
        uint256 _propertyId,
        uint256 _noOfShares,
        uint256 _basePrice,
        uint256 _startTime,
        uint256 _endTime
    ) external notBlacklisted(_msgSender()) onlyIfNotDelisted(_propertyId) {
        address _sender = _msgSender();
        uint256 _currentTime = block.timestamp;
        uint256 _userShares = _helperRWA.balanceOf(_sender, _propertyId);

        if (_primarySaleState[_propertyId] == PrimarySaleState.OnGoing)
            revert NftMarketplace__PrimarySaleNotEndedYet();
        if (_noOfShares > _userShares)
            revert NftMarketplace__NotEnoughBalance();

        if (
            _currentTime >= _endTime ||
            _currentTime >= _startTime ||
            _startTime >= _endTime
        ) revert NftMarketplace__InvalidDuration();
        if (_basePrice == 0) revert NftMarketplace__InvalidPrice();
        if (!_helperRWA.isApprovedForAll(_sender, address(this)))
            revert NftMarketplace__NotApproved();

        _enforceMinListingPrice(_propertyId, (_basePrice / _noOfShares));

        uint256 _nextId = ++_auctionIds;
        AuctionDetails memory _details = _auctionDetails[_nextId];

        _details.propertyId = _propertyId;
        _details.noOfShares = _noOfShares;
        _details.seller = _sender;
        _details.basePrice = _basePrice;
        _details.startTime = _startTime;
        _details.endTime = _endTime;

        _auctionDetails[_nextId] = _details;

        emit AuctionCreated(
            _sender,
            _nextId,
            _propertyId,
            _noOfShares,
            _startTime,
            _endTime
        );
    }

    /**
     * @notice Places a bid in an active auction.
     * @dev Transfers USDC to contract and refunds previous highest bidder if applicable.
     * @param _auctionId ID of the auction.
     * @param _bid Bid amount in USDC.
     */
    function placeBid(
        uint256 _auctionId,
        uint256 _bid
    ) external notBlacklisted(_msgSender()) {
        address _sender = _msgSender();
        uint256 _currentTime = block.timestamp;
        AuctionDetails memory _details = _auctionDetails[_auctionId];
        if (_details.seller == address(0))
            revert NftMarketplace__AuctionNotFound();

        if (_helperRWA.isPropertyDelisted(_details.propertyId))
            revert NftMarketplace__PropertyIsDelisted();

        if (_details.startTime > _currentTime)
            revert NftMarketplace__AuctionNotStartedYet();

        if (_currentTime >= _details.endTime)
            revert NftMarketplace__CantPlaceBid();

        if (_details.highestBid == 0) {
            if (_bid < _details.basePrice)
                revert NftMarketplace__InvalidBid(_details.basePrice, _bid);
        } else {
            uint256 minRequired = _details.highestBid +
                (_details.highestBid * _minBidIncrementBips) /
                BASE;
            if (_bid < minRequired)
                revert NftMarketplace__InvalidBid(_details.highestBid, _bid);
        }

        if (_bid > _helperUsdc.balanceOf(_sender))
            revert NftMarketplace__NotEnoughBalance();
        _helperUsdc.transferFrom(_sender, address(this), _bid);
        if (_details.highestBid > 0)
            _helperUsdc.transfer(_details.highestBidder, _details.highestBid);

        _details.highestBidder = _sender;
        _details.highestBid = _bid;
        _auctionDetails[_auctionId] = _details;
        emit PlacedBid(_sender, _auctionId, _bid);
    }

    /**
     * @notice Cancels an auction before it starts.
     * @dev Only seller can cancel; emits event and updates status.
     * @param _auctionId ID of the auction to cancel.
     */
    function cancelAuction(uint256 _auctionId) external {
        address _sender = _msgSender();
        uint256 _currentTime = block.timestamp;
        AuctionDetails memory _details = _auctionDetails[_auctionId];
        if (_details.seller == address(0))
            revert NftMarketplace__AuctionNotFound();
        if (_details.status == AuctionState.Cancelled)
            revert NftMarketplace__AuctionHasCancelled();
        if (_details.seller != _sender) revert NftMarketplace__YouAreNotOwner();
        if (_currentTime >= _details.startTime)
            revert NftMarketplace__AuctionHasStarted();

        _details.endTime = _currentTime;
        _details.status = AuctionState.Cancelled;
        _auctionDetails[_auctionId] = _details;
        emit AuctionConcluded(_sender, _auctionId);
    }

    /**
     * @notice Concludes an auction after it ends.
     * @dev Transfers shares and funds if bid is valid, otherwise refunds.
     * @param _auctionId ID of the auction to finalize.
     */
    function concludeAuction(
        uint256 _auctionId
    ) external notBlacklisted(_msgSender()) {
        address _sender = _msgSender();

        AuctionDetails memory _details = _auctionDetails[_auctionId];
        if (_details.seller == address(0))
            revert NftMarketplace__AuctionNotFound();
        if (_details.status == AuctionState.Concluded)
            revert NftMarketplace__AuctionAlreadyConcluded();
        if (_details.status == AuctionState.Cancelled)
            revert NftMarketplace__AuctionHasCancelled();
        if (_details.endTime >= block.timestamp)
            revert NftMarketplace__AuctionNotExpired();
        if (_details.highestBid > 0) {
            if (
                _helperRWA.balanceOf(_details.seller, _details.propertyId) >=
                _details.noOfShares &&
                !_helperRWA.isPropertyDelisted(_details.propertyId)
            ) {
                address _marketplaceOwner = owner();
                uint256 _platFormFee = (_details.highestBid *
                    _platformFeeBips) / BASE;
                uint256 _amountToBeGiven = _details.highestBid - _platFormFee;
                _helperRWA.safeTransferFrom(
                    _details.seller,
                    _details.highestBidder,
                    _details.propertyId,
                    _details.noOfShares,
                    ""
                );
                _helperUsdc.transfer(_marketplaceOwner, _platFormFee);
                _helperUsdc.transfer(_details.seller, _amountToBeGiven);

                emit SecondarySharesBought(
                    _details.highestBidder,
                    _details.propertyId,
                    _details.noOfShares,
                    _details.highestBid,
                    _platFormFee
                );
            } else {
                _helperUsdc.transfer(
                    _details.highestBidder,
                    _details.highestBid
                );
            }
        }

        _details.status = AuctionState.Concluded;
        _auctionDetails[_auctionId] = _details;
        emit AuctionConcluded(_sender, _auctionId);
    }

    /**
     * @notice Allows a whitelisted agent to claim referral commissions.
     * @dev Verifies claim eligibility and transfers ETH/USDC to agent.
     * @param _propertyId ID of the property for which the referral commission is claimed.
     */

    function claimReferralCommission(
        uint256 _propertyId
    ) external notBlacklisted(_msgSender()) {
        address _sender = _msgSender();
        if (!_whitelistedAgents[_sender])
            revert NftMarketplace__YouAreNotWhitelistedAgent();
        Commission memory _commission = _referralCommission[_sender][
            _propertyId
        ];
        if (
            _primarySaleState[_propertyId] != PrimarySaleState.Claim ||
            (_commission.commissionInETH == 0 &&
                _commission.commissionInUSDC == 0)
        ) revert NftMarketplace__NoCommissionAvailable();

        delete _referralCommission[_sender][_propertyId];

        _transferFunds(
            _sender,
            _commission.commissionInETH,
            _commission.commissionInUSDC
        );

        emit ReferralCommissionClaimed(
            _sender,
            _commission.commissionInETH,
            _commission.commissionInUSDC
        );
    }

    /**
     * @notice Updates the platform fee.
     * @dev Only callable by the contract owner.
     * @param _newFees New platform fee in basis points.
     */

    function changePlateFormFee(uint256 _newFees) external onlyOwner {
        uint256 _platformFee = _platformFeeBips;
        if (_newFees == 0 || _newFees >= BASE)
            revert NftMarketplace__InvalidFeeAmount();
        emit PlatformFeeUpdated(_msgSender(), _platformFee, _newFees);
        _platformFeeBips = _newFees;
    }

    /**
     * @notice Updates the blacklist status of multiple users.
     * @dev Only callable by the contract owner.
     * @param _users List of user addresses.
     * @param _newStatus The blacklist status to set (true = blacklisted, false = remove blacklisted).
     */

    function updateBlacklist(
        address[] calldata _users,
        bool _newStatus
    ) external onlyOwner {
        for (uint256 i = 0; i < _users.length; i++) {
            address _user = _users[i];
            _blacklisted[_user] = _newStatus;
            emit Blacklisted(_user, _newStatus);
        }
    }

    /**
     * @notice Sets the minimum listing price in basis points.
     * @dev Only callable by the contract owner.
     * @param _newBips The new minimum listing price BIPS.
     */

    function setMinListingPriceBips(uint256 _newBips) external onlyOwner {
        uint256 _oldBips = _minListingPriceBips;
        if (_newBips > BASE || _newBips == _oldBips)
            revert NftMarketplace__InvalidBipsValue();
        _minListingPriceBips = _newBips;

        emit MinListingPriceBipsUpdated(_oldBips, _newBips);
    }

    /**
     * @notice Sets the minimum bid increment in basis points.
     * @dev Only callable by the contract owner.
     * @param _newBips The new minimum bid increment BIPS.
     */

    function setMinBidIncrementBips(uint256 _newBips) external onlyOwner {
        uint256 _oldBips = _minBidIncrementBips;
        if (_newBips > BASE || _newBips == _oldBips)
            revert NftMarketplace__InvalidBipsValue();
        _minBidIncrementBips = _newBips;

        emit MinBidIncrementBipsUpdated(_oldBips, _newBips);
    }

    /**
     * @dev Transfers ETH and USDC to a recipient.
     * @param _recipient The address receiving the funds.
     * @param _ethAmount Amount of ETH to transfer.
     * @param _usdcAmount Amount of USDC to transfer.
     */

    function _transferFunds(
        address _recipient,
        uint256 _ethAmount,
        uint256 _usdcAmount
    ) private {
        if (_ethAmount > 0) {
            (bool success, ) = payable(_recipient).call{value: _ethAmount}("");
            if (!success) revert NftMarketplace__TransferFailed();
        }

        if (_usdcAmount > 0) _helperUsdc.transfer(_recipient, _usdcAmount);
    }

    /**
     * @dev Sends ETH to a recipient.
     * @param _recipient Address of the recipient.
     * @param _ethAmount Amount of ETH to send.
     */

    function _sendETH(address _recipient, uint256 _ethAmount) private {
        (bool success, ) = payable(_recipient).call{value: _ethAmount}("");
        if (!success) revert NftMarketplace__TransferFailed();
    }

    /**
     * @dev Transfers USDC from a sender to a recipient.
     * @param _from The sender address.
     * @param _recipient The recipient address.
     * @param _usdcAmount The amount of USDC to transfer.
     */

    function _sendUSDC(
        address _from,
        address _recipient,
        uint256 _usdcAmount
    ) private {
        _helperUsdc.transferFrom(_from, _recipient, _usdcAmount);
    }

    ///////////////////////////////////View Functions///////////////////////////////////////////

    /**
     * @notice Checks whether a given agent is whitelisted.
     * @param _agent The address of the agent.
     * @return True if the agent is whitelisted, false otherwise.
     */
    function isAgentWhitelisted(address _agent) external view returns (bool) {
        return _whitelistedAgents[_agent];
    }

    /**
     * @notice Retrieves the exclusive referral commission rate for a whitelisted agent.
     * @param _agent The address of the agent.
     * @return The referral commission in basis points.
     */

    function getExclusiveReferralBips(
        address _agent
    ) external view returns (uint256) {
        return _exclusiveReferralBips[_agent];
    }

    /**
     * @notice Retrieves details of an auction.
     * @param _auctionId The ID of the auction.
     * @return _details The auction details, including dynamically calculated status.
     */

    function getAuctionDetails(
        uint256 _auctionId
    ) external view returns (AuctionDetails memory _details) {
        _details = _auctionDetails[_auctionId];

        if (
            _details.status == AuctionState.Cancelled ||
            _details.status == AuctionState.Concluded
        ) return _details;

        uint256 currentTime = block.timestamp;

        if (currentTime < _details.startTime)
            _details.status = AuctionState.NotStarted;
        else if (currentTime >= _details.endTime)
            _details.status = AuctionState.Ended;
        else _details.status = AuctionState.OnGoing;

        return _details;
    }

    /**
     * @notice Calculates the cost to purchase a given number of shares using the selected currency.
     * @param _currency Address of the currency (USDC or ETH).
     * @param _shareToBuy Number of shares to buy.
     * @param _pricePerShare Price per share in USD.
     * @return _outputAmount Total cost in the specified currency.
     */
    function getQuote(
        address _currency,
        uint256 _shareToBuy,
        uint256 _pricePerShare
    ) external view returns (uint256 _outputAmount) {
        _outputAmount = _getQuote(_currency, _shareToBuy, _pricePerShare);
    }

    /**
     * @dev Internal helper to calculate share purchase quote in ETH or USDC.
     * @param _currency Address of the currency (USDC or ETH).
     * @param _shareToBuy Number of shares to buy.
     * @param _pricePerShare Price per share in USD.
     * @return _outputAmount Total cost in the specified currency.
     */

    function _getQuote(
        address _currency,
        uint256 _shareToBuy,
        uint256 _pricePerShare
    ) private view returns (uint256 _outputAmount) {
        if (_currency == address(0)) {
            (, int256 _oneUsdcPriceInEth, , , ) = priceFeed.latestRoundData();
            if (_oneUsdcPriceInEth == 0) revert NftMarketplace__InvalidPrice();
            // int256 _oneUsdcPriceInEth = 260035792536273; // 0.000260035792536273
            _outputAmount =
                ((uint256(_oneUsdcPriceInEth) * _pricePerShare) * _shareToBuy) /
                USDC_DECIMALS;
        } else if (_currency == USDC)
            _outputAmount = _pricePerShare * _shareToBuy;
    }

    /**
     * @notice Checks whether a user is blacklisted on the platform.
     * @param _user Address of the user to check.
     * @return True if blacklisted, false otherwise.
     */

    function isBlacklisted(address _user) external view returns (bool) {
        return _blacklisted[_user];
    }

    /**
     * @notice Retrieves the primary sale details for a property.
     * @param _propertyId ID of the property.
     * @return The primary sale listing struct.
     */

    function getPrimarySale(
        uint256 _propertyId
    ) external view returns (PrimaryListing memory) {
        return _primaryListing[_propertyId];
    }

    /**
     * @notice Returns the platform fee in basis points.
     * @return The platform fee BIPS.
     */

    function getPlatformFee() external view returns (uint256) {
        return _platformFeeBips;
    }

    /**
     * @notice Retrieves the default referral commission rate.
     * @return The referral commission in basis points.
     */

    function getDefaultReferralBips() external view returns (uint256) {
        return _defaultReferralBips;
    }

    /**
     * @notice Retrieves the current minimum bid increment in basis points.
     * @return The minimum bid increment BIPS.
     */

    function getMinBidIncrementBips() external view returns (uint256) {
        return _minBidIncrementBips;
    }

    /**
     * @notice Retrieves pending shares details for a buyer.
     * @param _buyer Address of the buyer.
     * @param _propertyId ID of the property.
     * @return The PendingShares struct containing pending share details.
     */

    function getPendingSharesDetails(
        address _buyer,
        uint256 _propertyId
    ) external view returns (PendingShares memory) {
        return _pendingSharesDetails[_propertyId][_buyer];
    }

    /**
     * @notice Gets the state of a primary sale.
     * @param _propertyId ID of the property.
     * @return The PrimarySaleState of the property.
     */

    function getPrimarySaleState(
        uint256 _propertyId
    ) external view returns (PrimarySaleState) {
        return _primarySaleState[_propertyId];
    }

    /**
     * @notice Retrieves details of a secondary sale listing.
     * @param _listingId ID of the listing.
     * @return The SecondaryListing struct containing listing details.
     */

    function getSecondaryListing(
        uint256 _listingId
    ) external view returns (SecondaryListing memory) {
        return _secondaryListing[_listingId];
    }

    /**
     * @notice Gets the total number of secondary listings.
     * @return The total number of listings.
     */

    function getTotalListings() external view returns (uint256) {
        return _listingIds;
    }

    /**
     * @notice Returns the minimum listing price in basis points.
     * @return The minimum listing price BIPS.
     */

    function getMinListingPriceBips() external view returns (uint256) {
        return _minListingPriceBips;
    }

    /**
     * @notice Retrieves the referral commission earned by an agent for a specific property.
     * @param _referee Address of the referring agent.
     * @param _propertyId ID of the property.
     * @return Commission struct with commission details in ETH and USDC.
     */

    function getReferralCommission(
        address _referee,
        uint256 _propertyId
    ) external view returns (Commission memory) {
        return _referralCommission[_referee][_propertyId];
    }

    /**
     * @notice Checks if the contract supports a given interface.
     * @param interfaceId The interface identifier (bytes4).
     * @return True if the interface is supported, false otherwise.
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Handles the receipt of a single ERC1155 token type.
     * @dev Called by the ERC1155 contract when a token is transferred to this contract.
     * @return The selector to confirm the token transfer.
     */

    function onERC1155Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*id*/,
        uint256 /*value*/,
        bytes calldata /*data*/
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    /**
     * @notice Handles the receipt of multiple ERC1155 token types.
     * @dev Called by the ERC1155 contract when multiple tokens are transferred to this contract.
     * @return The selector to confirm the batch token transfer.
     */

    function onERC1155BatchReceived(
        address /*operator*/,
        address /*from*/,
        uint256[] calldata /*ids*/,
        uint256[] calldata /*values*/,
        bytes calldata /*data*/
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
