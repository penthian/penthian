// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Rent
/// @author Rabeeb Aqdas
/// @dev This contract handles the management of rent for properties.
///      It allows property owners to deposit rent, users to withdraw rent,
///      and provides eligibility checks for rent withdrawal. It includes
///      functionalities to manage property-specific rent details and ensure
///      fair distribution based on shares held by users.

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

/**
 * @title IRWA
 * @dev Interface for interacting with Real World Asset (RWA) property data and token holdings.
 */
interface IRWA {
    /**
     * @dev Struct representing the metadata and financial details of a tokenized property.
     * @param owner Address of the property owner.
     * @param pricePerShare Price per individual share of the property.
     * @param totalOwners Total number of unique owners holding shares in this property.
     * @param aprBips Annual Percentage Rate (APR) represented in basis points (1% = 100 bips).
     * @param totalShares Total number of shares issued for this property.
     * @param uri URI containing metadata or documentation for the property.
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
     * @notice Returns the cumulative share holdings of a user for a given property over time.
     * @param _userAddress The address of the user to query.
     * @param _propertyId The ID of the property in question.
     * @return The total amount of shares the user has held historically.
     */
    function getHoldingHistory(
        address _userAddress,
        uint256 _propertyId
    ) external view returns (uint256);

    /**
     * @notice Retrieves full details of a tokenized property.
     * @param _propertyId The ID of the property.
     * @return A {Property} struct containing all relevant metadata and financial details.
     */
    function getPropertyDetails(
        uint256 _propertyId
    ) external view returns (Property memory);

    /**
     * @notice Gets the current balance of shares for a user in a specific property.
     * @param account The user's wallet address.
     * @param id The ID of the property token.
     * @return The number of shares currently held by the user.
     */
    function balanceOf(
        address account,
        uint256 id
    ) external view returns (uint256);
}

/**
 * @title IMarketplace
 * @dev Interface for marketplace access control including blacklist and whitelist checks.
 */
interface IMarketplace {
    /**
     * @notice Checks if a user is blacklisted and restricted from participating.
     * @param _user The address to check.
     * @return True if the user is blacklisted, otherwise false.
     */
    function isBlacklisted(address _user) external view returns (bool);

    /**
     * @notice Verifies if a given agent address is whitelisted and approved.
     * @param _agent The agent address to check.
     * @return True if the agent is whitelisted, otherwise false.
     */
    function isAgentWhitelisted(address _agent) external view returns (bool);
}

/**
 * @dev Error thrown when the required time period has not yet passed.
 */
error TimeNotPassedYet();

/**
 * @dev Error thrown when rent for the property has not been withdrawn yet.
 */
error RentNotWithdrawn();

/**
 * @dev Error thrown when no rent is available for the property.
 */
error NoRentAvailable();

/**
 * @dev Error thrown when the user is not eligible to withdraw rent.
 */
error YouAreNotEligible();

/**
 * @dev Error thrown when the rent period for the property has ended.
 */
error TimeOver();

/**
 * @dev Error thrown when an action is restricted.
 */
error NftMarketplace__ActionRestricted();

/**
 * @dev Error thrown when an action is attempted by an address that is neither the property owner nor a whitelisted agent.
 */
error NftMarketplace__OnlyOwnerOrWhitelistedAgent();

contract Rent is Ownable {
    /**
     * @dev Struct to store details of a property's rent.
     * @param startTime The timestamp when the rent period starts.
     * @param endTime The timestamp when the rent period ends.
     * @param totalRent The total rent allocated for the property during the period.
     * @param rentRemaining The amount of rent remaining to be withdrawn.
     * @param rentPerShare The amount of rent allocated per share.
     */
    struct Details {
        uint256 startTime;
        uint256 endTime;
        uint256 totalRent;
        uint256 rentRemaining;
        uint256 rentPerShare;
    }

    /**
     * @dev Enum representing the state of rent.
     * @param Deposited Indicates that the rent has been deposited but not yet withdrawn.
     * @param Withdrawn Indicates that the rent has been withdrawn from the property.
     */
    enum RentState {
        Deposited,
        Withdrawn
    }

    /**
     * @dev Represents the duration of one month, used for rent time calculations.
     */
    uint256 private constant ONEMONTH = 30 days;

    /**
     * @dev Address of the USDC token contract.
     */
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    /**
     * @dev Reference to the USDC token contract interface.
     */
    IERC20 private _helperUsdc = IERC20(USDC);

    /**
     * @dev Reference to the Real-World Assets (RWA) contract interface.
     */
    IRWA private _helperRWA;

    /**
     * @dev Reference to the IMarketplace contract
     */
    IMarketplace private _helperMarketplace;

    /**
     * @dev Mapping to store rent details for each property by its ID.
     * The key is the property ID, and the value is the `Details` struct.
     */
    mapping(uint256 => Details) private _rentDetails;

    /**
     * @dev Mapping to track the rent withdrawal history of users for specific properties.
     * The first key is the user's address, and the second key is the property ID.
     * The value is the timestamp of the last rent withdrawal.
     */
    mapping(address => mapping(uint256 => uint256)) private _rentHistory;

    /**
     * @notice Emitted when the rent status for a property is updated.
     * @param _by The address of the user who triggered the status update.
     * @param _propertyId The ID of the property for which the rent status is updated.
     * @param _monthRent The monthly rent amount allocated for the property.
     * @param _status The current state of the rent (e.g., Deposited or Withdrawn).
     */
    event RentStatus(
        address indexed _by,
        uint256 _propertyId,
        uint256 _monthRent,
        RentState _status
    );

    /**
     * @notice Emitted when rent is withdrawn for a property.
     * @param _by The address of the user who withdrew the rent.
     * @param _propertyId The ID of the property for which the rent was withdrawn.
     * @param _rent The amount of rent withdrawn.
     */
    event RentWithdrawn(
        address indexed _by,
        uint256 _propertyId,
        uint256 _rent
    );

    /**
     * @notice Emitted when the property details are reset.
     * @param _by The address of the user who reset the property details.
     * @param _propertyId The ID of the property that was reset.
     * @param _rent The remaining rent amount that was refunded to the owner.
     */
    event PropertyReset(
        address indexed _by,
        uint256 _propertyId,
        uint256 _rent
    );

    
    /**
     * @dev Modifier that allows access only to the contract owner or a whitelisted agent.
     * Reverts with {NftMarketplace__OnlyOwnerOrWhitelistedAgent} if the caller is neither.
     */
    modifier onlyOwnerOrWhitelistedAgent() {
        address _sender = _msgSender();
        if (
            _sender != owner() &&
            !_helperMarketplace.isAgentWhitelisted(_sender)
        ) revert NftMarketplace__OnlyOwnerOrWhitelistedAgent();
        _;
    }

    /**
     * @notice Initializes the Rent contract with references to the RWA and Voting contracts.
     * @param _rwaAddress The address of the RWA contract.
     * @dev The deployer of the contract is set as the owner.
     */
    constructor(
        address _rwaAddress,
        address _marketAddress
    ) Ownable(_msgSender()) {
        _helperRWA = IRWA(_rwaAddress);
        _helperMarketplace = IMarketplace(_marketAddress);
    }

    /**
     * @notice Adds rent details for a specific property.
     * @param _propertyId The ID of the property for which rent is being added.
     * @param _totalMonthRent The total monthly rent amount to be allocated.
     * @dev Transfers the specified rent amount in USDC from the owner to the contract
     *      and updates the rent details for the property.
     */
    function addRent(
        uint256 _propertyId,
        uint256 _totalMonthRent
    ) external onlyOwnerOrWhitelistedAgent {
        address _sender = _msgSender();
        uint256 _currentTime = block.timestamp;
        Details memory _details = _rentDetails[_propertyId];
        if (_details.endTime > _currentTime) revert TimeNotPassedYet();
        if (_details.rentRemaining > 0) revert RentNotWithdrawn();
        uint256 _totalShares = _helperRWA
            .getPropertyDetails(_propertyId)
            .totalShares;
        uint256 _rentPerShare = _totalMonthRent / _totalShares;

        _details.startTime = _currentTime;
        _details.endTime = _currentTime + ONEMONTH;
        _details.totalRent = _totalMonthRent;
        _details.rentRemaining = _totalMonthRent;
        _details.rentPerShare = _rentPerShare;
        _rentDetails[_propertyId] = _details;

        _helperUsdc.transferFrom(_sender, address(this), _totalMonthRent);

        emit RentStatus(
            _sender,
            _propertyId,
            _totalMonthRent,
            RentState.Deposited
        );
    }

    /**
     * @notice Resets the rent details for a property and refunds any remaining rent to the owner.
     * @param _propertyId The ID of the property whose details are to be reset.
     * @dev Transfers any remaining rent back to the owner and sets `rentRemaining` to zero.
     */
    function resetPropertyDetails(
        uint256 _propertyId
    ) external onlyOwnerOrWhitelistedAgent {
        Details memory _details = _rentDetails[_propertyId];
        if (_details.endTime > block.timestamp) revert TimeNotPassedYet();
        if (_details.rentRemaining == 0) revert NoRentAvailable();
        uint256 _rentRemaining = _details.rentRemaining;
        _details.rentRemaining = 0;
        _rentDetails[_propertyId] = _details;
        _helperUsdc.transfer(owner(), _rentRemaining);
        emit RentStatus(
            _msgSender(),
            _propertyId,
            _rentRemaining,
            RentState.Withdrawn
        );
    }

    /**
     * @notice Allows users to withdraw their share of the rent for a specific property.
     * @param _propertyId The ID of the property for which rent is being withdrawn.
     * @dev Calculates the rent based on the user's shares and updates the rent details and history.
     *      Transfers the calculated rent amount in USDC to the user.
     */
    function withdrawRent(uint256 _propertyId) external {
        address _sender = _msgSender();
        if (_helperMarketplace.isBlacklisted(_sender))
            revert NftMarketplace__ActionRestricted();
        uint256 _currentTime = block.timestamp;
        Details memory _details = _rentDetails[_propertyId];
        if (_details.rentRemaining == 0) revert NoRentAvailable();
        if (_currentTime > _details.endTime) revert TimeOver();
        uint256 _lastClaimTime = _rentHistory[_sender][_propertyId];
        uint256 _holdingTime = _helperRWA.getHoldingHistory(
            _sender,
            _propertyId
        );
        uint256 _userShares = _helperRWA.balanceOf(_sender, _propertyId);

        if (
            _holdingTime > _details.startTime ||
            _lastClaimTime > _details.startTime ||
            _userShares == 0
        ) revert YouAreNotEligible();

        uint256 _rentToBeGiven = _userShares * _details.rentPerShare;
        _details.rentRemaining -= _rentToBeGiven;
        _rentDetails[_propertyId] = _details;
        _rentHistory[_sender][_propertyId] = _currentTime;

        _helperUsdc.transfer(_sender, _rentToBeGiven);

        emit RentWithdrawn(_sender, _propertyId, _rentToBeGiven);
    }

    /**
     * @notice Retrieves the rent details for a specific property.
     * @param _propertyId The ID of the property whose rent details are being queried.
     * @return _startTime The start time of the rent period.
     * @return _endTime The end time of the rent period.
     * @return _totalRent The total rent allocated for the property.
     * @return _rentRemaining The amount of rent remaining to be withdrawn.
     * @return _rentPerShare The rent amount allocated per share.
     */
    function getRentDetails(
        uint256 _propertyId
    )
        external
        view
        returns (
            uint256 _startTime,
            uint256 _endTime,
            uint256 _totalRent,
            uint256 _rentRemaining,
            uint256 _rentPerShare
        )
    {
        Details memory details = _rentDetails[_propertyId];
        return (
            details.startTime,
            details.endTime,
            details.totalRent,
            details.rentRemaining,
            details.rentPerShare
        );
    }

    /**
     * @notice Retrieves the rent withdrawal history for a user and property.
     * @param _userAddress The address of the user whose rent history is being queried.
     * @param _propertyId The ID of the property for which the history is being queried.
     * @return The timestamp of the last rent withdrawal by the user for the property.
     */
    function getRentHistory(
        address _userAddress,
        uint256 _propertyId
    ) external view returns (uint256) {
        return _rentHistory[_userAddress][_propertyId];
    }

    /**
     * @notice Checks if a user is eligible to withdraw rent for a specific property.
     * @param _propertyId The ID of the property for which eligibility is being checked.
     * @param _userAddress The address of the user whose eligibility is being checked.
     * @return True if the user is eligible to withdraw rent, otherwise false.
     * @dev Eligibility is determined based on the user's voting and holding history,
     *      as well as the rent period and remaining rent.
     */
    function isEligibleForRent(
        uint256 _propertyId,
        address _userAddress
    ) external view returns (bool) {
        Details memory _details = _rentDetails[_propertyId];

        if (_details.rentRemaining == 0 || block.timestamp > _details.endTime)
            return false;

        uint256 _lastClaimTime = _rentHistory[_userAddress][_propertyId];
        uint256 _holdingTime = _helperRWA.getHoldingHistory(
            _userAddress,
            _propertyId
        );
        uint256 _userShares = _helperRWA.balanceOf(_userAddress, _propertyId);
        if (
            _holdingTime > _details.startTime ||
            _lastClaimTime > _details.startTime ||
            _userShares == 0
        ) return false;

        return true;
    }
}
