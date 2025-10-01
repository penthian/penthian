// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// Company: Decrypted Labs
/// @title  RWA (Real World Assets) Contract
/// @author Rabeeb Aqdas
/// @notice A contract for creating and managing properties within an ERC1155 compliant system.

/// @notice Interface for the Marketplace contract
interface IMarketplace {
    /// @notice State of a primary sale.
    enum PrimarySaleState {
        None, // 0
        OnGoing, // 1
        Claim, // 2
        Refund // 3
    }

    /// @notice Starts the primary sale of a property
    /// @param _seller The address of the property owner
    /// @param _propertyId The ID of the property
    /// @param _totalShares The total shares of the property
    /// @param _endTime The end time of the sale
    /// @param _sharesMinimumWorth The minimum worth of shares
    function startPrimarySale(
        address _seller,
        uint256 _propertyId,
        uint256 _totalShares,
        uint256 _endTime,
        uint256 _sharesMinimumWorth
    ) external;

    /// @notice Retrieves the current state of the primary sale for a given property
    /// @param _propertyId The ID of the property to query
    /// @return The current state of the primary sale (e.g., NotStarted, Active, Ended)
    function getPrimarySaleState(
        uint256 _propertyId
    ) external view returns (PrimarySaleState);
}

/// @notice Error thrown when the price is zero
error PriceCantBeZero();

/// @notice Error thrown when the supply is zero
error SupplyCantBeZero();

/// @notice Error thrown when an invalid discount is provided
error InvalidDiscount();

/// @notice Error thrown when insufficient funds are provided
/// @param _reqPrice The required price
error MoneyNotEnough(uint256 _reqPrice);

/// @notice Error thrown when there is not enough supply
/// @param _supply The available supply
error NotEnoughSupply(uint256 _supply);

/// @notice Error thrown when a limit is exceeded
/// @param _limit The maximum allowed limit
error LimitExceeded(uint256 _limit);

/// @notice Error thrown when a transfer fails
error TransferFailed();

/// @notice Error thrown when the community is not registered
error CommunityNotRegistered();

/// @notice Error thrown when an action is restricted
error ActionRestricted();

/// @notice Error thrown when an invalid address is provided
error InvalidAddress();

/// @notice Error thrown when the contract is already initialized
error AlreadyInitialized();

/// @notice Error thrown when shares cannot be transferred
error CantTransferShares();

/// @notice Error thrown when the property does not exist in the registry
error PropertyNotExists();

/// @notice Error thrown when attempting to delist a property that has already been delisted
error PropertyAlreadyDelisted();

/// @notice Error thrown when an action is attempted but the property is not in the claimable state
error PropertyNotInClaimState();

/// @notice Error thrown when shares cannot be approved
error CantApproveShares();

/// @notice Error thrown when an invalid price is provided
error InvalidPrice();

/// @notice Error thrown when an invalid APR is provided
error InvalidAPR();

contract RWA is ERC1155, Ownable {
    ///////////////////////////////////////////////Structs//////////////////////////////////////////////

    /// @notice Structure representing a property
    struct Property {
        address owner; /// @dev Address of the property owner
        uint256 pricePerShare; /// @dev Price per share of the property
        uint256 totalOwners; /// @dev Total number of owners of the property
        uint256 aprBips; /// @dev The annual percentage rate (APR) for the property in basis points
        uint256 totalShares; /// @dev Total shares of the property
        string uri; /// @dev URI for the property's metadata
    }

    /// @dev Address of the registration form contract
    address private _registrationForm;

    /// @dev Address of the marketplace contract
    address private _marketplace;

    /// @dev Indicates if the contract has been initialized
    bool private initialized;

    /// @dev Reference to the marketplace helper interface
    IMarketplace private _helperMarketplace;

    /// @dev Base value used for calculations (e.g., percentage)
    uint256 private constant BASE = 1000;

    /// @dev Next property ID to be assigned
    uint256 private _nextId;

    /// @dev Name of the token
    string private _name;

    /// @dev Symbol of the token
    string private _symbol;

    /// @dev Mapping from property ID to Property struct
    mapping(uint256 => Property) private _properties;

    /// @dev Mapping to track holding history for a user and property.
    mapping(address => mapping(uint256 => uint256)) private _holdingHistory;

    /// @dev Mapping to track whether a user is registered.
    mapping(address => bool) private _userRegistered;

    /// @dev Mapping to track whether a property is de listed from platform.
    mapping(uint256 => bool) private _delistedProperties;

    /// @notice Emitted when a property is registered
    /// @param _by Address of the entity registering the property
    /// @param _propertyId ID of the property registered
    event PropertyRegistered(address indexed _by, uint256 _propertyId);

    /// @notice Emitted when a property's URI is changed
    /// @param _propertyId ID of the property
    /// @param _newUri New URI of the property
    event UriChanged(uint256 _propertyId, string _newUri);

    /// @notice Emitted when a property's price per share is changed
    /// @param _propertyId ID of the property
    /// @param _oldSharePrice Old price per share
    /// @param _newSharePrice New price per share
    event PriceChanged(
        uint256 _propertyId,
        uint256 _oldSharePrice,
        uint256 _newSharePrice
    );

    /// @notice Emitted when the annual percentage rate (APR) of a property is updated.
    /// @param _propertyId The ID of the property whose APR was updated.
    /// @param _oldApr The previous APR of the property.
    /// @param _newApr The new APR of the property.
    event APRChanged(uint256 _propertyId, uint256 _oldApr, uint256 _newApr);

    /// @notice Emitted when a property is delisted from the marketplace.
    /// @param _by The address of the user who performed the delisting.
    /// @param _propertyId The ID of the property that was delisted.
    event PropertyDelisted(address indexed _by, uint256 _propertyId);

    /// @dev Modifier to check if the caller is the creator of the property
    /// @param _sender Address of the caller
    /// @param _id ID of the property
    modifier isCreator(address _sender, uint256 _id) {
        if (_properties[_id].owner == address(0))
            revert CommunityNotRegistered();
        require(_properties[_id].owner == _sender, "Not a Creator");
        _;
    }
    /// @dev Modifier to check if the contract is initialized
    modifier isInitialized() {
        require(initialized, "Contract not initialized");
        _;
    }
    /// @dev Modifier to restrict access to the authorizer
    /// @param _sender Address of the caller
    modifier onlyAuthorizer(address _sender) {
        if (_sender != _registrationForm) revert ActionRestricted();
        _;
    }

    /// @notice Fallback function to receive Ether
    receive() external payable {}

    /// @notice Initializes the contract
    constructor() ERC1155("") Ownable(_msgSender()) {
        _name = " Real World Assets";
        _symbol = "RWA";
    }

    //////////////////////////////Main functions/////////////////////////////////

    /// @notice Initializes the contract with the registration form and marketplace addresses
    /// @param _formAddress Address of the registration form contract
    /// @param _marketplaceAddress Address of the marketplace contract
    function initialize(
        address _formAddress,
        address _marketplaceAddress
    ) external onlyOwner {
        if (initialized) revert AlreadyInitialized();
        if (_marketplaceAddress == address(0) || _formAddress == address(0))
            revert InvalidAddress();
        _marketplace = _marketplaceAddress;
        _registrationForm = _formAddress;
        _helperMarketplace = IMarketplace(_marketplaceAddress);
        initialized = true;
    }

    /// @notice Registers a new property
    /// @param _property The property details
    /// @param _saleTime The sale time for the property
    /// @param _sharesMinimumWorth The minimum worth of shares
    /// @return _propertyId The ID of the registered property
    function register(
        Property memory _property,
        uint256 _saleTime,
        uint256 _sharesMinimumWorth
    )
        external
        isInitialized
        onlyAuthorizer(_msgSender())
        returns (uint256 _propertyId)
    {
        uint256 _id = ++_nextId;
        _properties[_id] = _property;
        _mint(_marketplace, _id, _property.totalShares, "");
        _helperMarketplace.startPrimarySale(
            _property.owner,
            _id,
            _property.totalShares,
            _saleTime,
            _sharesMinimumWorth
        );
        _propertyId = _id;
        emit PropertyRegistered(_msgSender(), _id);
    }

    /// @notice Delists a property from the marketplace.
    /// @dev Can only be called by the contract owner. The property must exist, be in the Claim state, and not already be delisted.
    /// @param _propertyId The ID of the property to delist.
    ///
    /// Requirements:
    /// - The property must exist.
    /// - The property must be in the `Claim` state.
    /// - The property must not already be delisted.
    ///
    /// Emits a {PropertyDelisted} event.
    function delistProperty(uint256 _propertyId) external onlyOwner {
        Property storage _property = _properties[_propertyId];
        IMarketplace.PrimarySaleState _propertyState = _helperMarketplace
            .getPrimarySaleState(_propertyId);
        if (_property.owner == address(0)) revert PropertyNotExists();
        if (_propertyState != IMarketplace.PrimarySaleState.Claim)
            revert PropertyNotInClaimState();
        if (_delistedProperties[_propertyId]) revert PropertyAlreadyDelisted();
        _delistedProperties[_propertyId] = true;
        delete _properties[_propertyId];
        emit PropertyDelisted(_msgSender(), _propertyId);
    }

    /// @notice Changes the URI of a property
    /// @param _propertyId ID of the property
    /// @param _newUri New URI to be set
    function changeUri(
        uint256 _propertyId,
        string memory _newUri
    ) external isCreator(_msgSender(), _propertyId) {
        _properties[_propertyId].uri = _newUri;
        emit UriChanged(_propertyId, _newUri);
    }

    /// @notice Changes the price per share of a property
    /// @param _propertyId ID of the property
    /// @param _newPricePerShare New price per share to be set
    function changePropertyPrice(
        uint256 _propertyId,
        uint256 _newPricePerShare
    ) external isCreator(_msgSender(), _propertyId) {
        uint256 _oldPricePerShare = _properties[_propertyId].pricePerShare;
        if (_newPricePerShare == 0 || _oldPricePerShare == _newPricePerShare)
            revert InvalidPrice();
        _properties[_propertyId].pricePerShare = _newPricePerShare;
        emit PriceChanged(_propertyId, _oldPricePerShare, _newPricePerShare);
    }

    /// @notice Changes the APR (Annual Percentage Rate) of a property
    /// @param _propertyId ID of the property
    /// @param _newAprBips New APR value (in basis points) to be set
    function changePropertyAPR(
        uint256 _propertyId,
        uint256 _newAprBips
    ) external isCreator(_msgSender(), _propertyId) {
        Property memory _property = _properties[_propertyId];
        uint256 _oldApr = _property.aprBips;
        if (_oldApr == _newAprBips || _newAprBips > BASE) revert InvalidAPR();
        _property.aprBips = _newAprBips;
        _properties[_propertyId] = _property;
        emit APRChanged(_propertyId, _oldApr, _newAprBips);
    }

    /// @notice Transfers a specific token ID and amount from one address to another.
    /// @dev Overrides {IERC1155-safeTransferFrom}. Can only be called by the marketplace contract.
    /// @param from The address sending the token.
    /// @param to The address receiving the token.
    /// @param id The ID of the token to transfer.
    /// @param value The amount of tokens to transfer.
    /// @param data Additional data with no specified format.
    ///
    /// Requirements:
    /// - Caller must be the marketplace.
    ///
    /// Reverts with {CantTransferShares} if called by any address other than the marketplace.
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) public override {
        address _sender = _msgSender();
        address _marketplaceAddress = _marketplace;
        if (_sender != _marketplaceAddress) revert CantTransferShares();
        uint256 _receiverBalanceBefore = balanceOf(to, id);

        super.safeTransferFrom(from, to, id, value, data);

        if (from != _marketplaceAddress && balanceOf(from, id) == 0)
            _properties[id].totalOwners -= 1;

        if (to != _marketplaceAddress && _receiverBalanceBefore == 0)
            _properties[id].totalOwners += 1;

        _holdingHistory[to][id] = block.timestamp;
        if (!_userRegistered[to]) _userRegistered[to] = true;
    }

    /// @notice Transfers multiple token IDs and amounts in a single call.
    /// @dev Overrides {IERC1155-safeBatchTransferFrom}. Only the marketplace contract can initiate this transfer.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param ids The list of token IDs to transfer.
    /// @param values The list of amounts to transfer for each corresponding token ID.
    /// @param data Additional data with no specified format.
    ///
    /// Requirements:
    /// - Caller must be the marketplace.
    ///
    /// Reverts with {CantTransferShares} if called by any address other than the marketplace.
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public override {
        address _sender = _msgSender();
        if (_sender != _marketplace) revert CantTransferShares();
        super.safeBatchTransferFrom(from, to, ids, values, data);
    }

    /// @notice Sets or revokes approval for an operator to manage all of the caller’s tokens.
    /// @dev Overrides {IERC1155-setApprovalForAll}. Only the marketplace contract can be approved.
    /// @param operator The address to grant or revoke approval.
    /// @param approved True to approve the operator, false to revoke.
    ///
    /// Requirements:
    /// - The operator must be the marketplace.
    ///
    /// Reverts with {CantApproveShares} if the operator is not the marketplace.
    function setApprovalForAll(
        address operator,
        bool approved
    ) public override {
        if (operator != _marketplace) revert CantApproveShares();
        super._setApprovalForAll(_msgSender(), operator, approved);
    }

    ///////////////////////////////////View Functions///////////////////////////////////////////

    /// @notice Returns the URI for a given token ID
    /// @param _id ID of the token
    /// @return URI of the token
    function uri(uint256 _id) public view override returns (string memory) {
        return _properties[_id].uri;
    }

    /// @notice Returns the name of the token
    /// @return Name of the token
    function name() external view returns (string memory) {
        return _name;
    }

    /// @notice Returns the symbol of the token
    /// @return Symbol of the token
    function symbol() external view returns (string memory) {
        return _symbol;
    }

    /// @notice Returns the total number of properties registered
    /// @return Total properties registered
    function totalProperties() external view returns (uint256) {
        return _nextId;
    }

    /// @notice Checks whether a property has been delisted from the marketplace.
    /// @param _propertyId The ID of the property to check.
    /// @return True if the property is delisted, false otherwise.
    function isPropertyDelisted(
        uint256 _propertyId
    ) external view returns (bool) {
        return _delistedProperties[_propertyId];
    }

    /// @notice Checks whether a user is registered in the contract.
    /// @param _userAddress The address of the user to check.
    /// @return True if the user is registered, false otherwise.
    function isRegistered(address _userAddress) external view returns (bool) {
        return _userRegistered[_userAddress];
    }

    /// @notice Retrieves the last holding update timestamp for a user and a specific property.
    /// @param _userAddress The address of the user.
    /// @param _propertyId The ID of the property.
    /// @return The timestamp of the last holding update.
    function getHoldingHistory(
        address _userAddress,
        uint256 _propertyId
    ) external view returns (uint256) {
        return _holdingHistory[_userAddress][_propertyId];
    }

    /// @notice Retrieves the details of a specific property
    /// @param _propertyId ID of the property
    /// @return Property struct containing the property details
    function getPropertyDetails(
        uint256 _propertyId
    ) external view returns (Property memory) {
        return _properties[_propertyId];
    }

    /// @notice Indicates whether a contract implements a given interface
    /// @param interfaceId The interface identifier, as specified in ERC-165
    /// @return True if the contract implements the interface, false otherwise
    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
