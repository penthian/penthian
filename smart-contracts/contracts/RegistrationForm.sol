// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
/// Company: Decrypted Labs
/// @title  Registration Form
/// @author Rabeeb Aqdas
/// @notice This contract handles the registration and validation of property forms for Real World Assets (RWA).

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IRWA Interface
 * @notice Interface for interacting with the Real World Assets (RWA) registration contract.
 */
interface IRWA {
    /**
     * @notice Structure defining the metadata and financial parameters of a tokenized property.
     * @dev Used during registration and on-chain record keeping of properties.
     * @param owner The address of the property creator.
     * @param pricePerShare The price per individual share of the property.
     * @param totalOwners The current total number of owners of the property.
     * @param aprBips The annual percentage rate in basis points (1% = 100 bips).
     * @param totalShares The total supply of shares that can be minted.
     * @param uri The metadata URI for the property (e.g., IPFS or HTTPS link).
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
     * @notice Registers a new tokenized property on-chain.
     * @dev Only callable by authorized contracts or users.
     * @param _property The property struct containing financial and metadata details.
     * @param _saleTime The duration for which the property sale remains active.
     * @param _sharesMinimumWorth The calculated minimum worth of shares to start sale.
     * @return _propertyId A unique ID assigned to the registered property.
     */
    function register(
        Property memory _property,
        uint256 _saleTime,
        uint256 _sharesMinimumWorth
    ) external returns (uint256 _propertyId);
}


/**
 * @title IMarketplace Interface
 * @notice Interface for the Real World Assets Marketplace used to control user access.
 */
interface IMarketplace {
    /**
     * @notice Checks if a user is blacklisted from interacting with the platform.
     * @dev Can be used to prevent form submissions, purchases, or administrative actions.
     * @param _user The wallet address of the user to verify.
     * @return Boolean value indicating whether the user is blacklisted.
     */
    function isBlacklisted(address _user) external view returns (bool);
}


/**
 * @dev Error thrown when the provided sale time is outside the allowed range.
 * Reverts with this if saleTime < MINTIME or > MAXTIME.
 */
error InvalidTime();

/**
 * @dev Error thrown when a form does not exist or is malformed.
 * Typically occurs when a request ID is invalid or the form is empty.
 */
error InvalidForm();

/**
 * @dev Error thrown when a threshold value is not within acceptable limits.
 * Reverts if the threshold is greater than or equal to 100%.
 */
error InvalidThreshold();

/**
 * @dev Error thrown when the new registration fee is the same as the current one.
 * @param _oldFees The existing registration fee.
 * @param _newFees The attempted new registration fee (which matches the old one).
 */
error SameFees(uint256 _oldFees, uint256 _newFees);

/**
 * @dev Error thrown when the provided APR exceeds the allowed APR_BASE.
 * Reverts if APR basis points > APR_BASE (1000).
 */
error InvalidAPR();

/**
 * @dev Error thrown when the platform is in a paused state.
 * Reverts if any restricted action is attempted while paused.
 */
error ActionPaused();

/**
 * @dev Error thrown when the caller is blacklisted in the marketplace.
 * Reverts to prevent further interaction from restricted users.
 */
error BlacklistedUser();

/**
 * @dev Error thrown when attempting to set a state variable to its current value.
 * Used to avoid unnecessary updates and gas costs.
 */
error SameState();


contract RegistrationForm is Ownable {
    ///////////////////////////////////////////////Structs//////////////////////////////////////////////

    /**
     * @notice Struct used for collecting user input when submitting a property registration request.
     * @dev Contains the raw form values provided by the requester.
     * @param owner Address of the property owner.
     * @param pricePerShare Price per share of the property.
     * @param totalShares Total number of shares for the property.
     * @param aprBips Annual percentage rate in basis points.
     * @param saleTime Duration for which the property will be on sale (in seconds).
     * @param uri URI pointing to property metadata (IPFS, HTTPS, etc.).
     */
    struct InputForm {
        address owner; /// @dev Address of the property owner
        uint256 pricePerShare; /// @dev Price per share of the property
        uint256 totalShares; /// @dev Total shares of the property
        uint256 aprBips; /// @dev The annual percentage rate (APR) for the property in basis points
        uint256 saleTime; /// @dev Duration of the sale in seconds
        string uri; /// @dev URI for the property's metadata
    }

    /**
     * @notice Struct used internally to store form data along with its status and payment.
     * @dev Tracks the registration request state, including fees and status.
     * @param owner Address of the property owner.
     * @param status Current status of the form (Pending, Accepted, etc.).
     * @param pricePerShare Price per share of the property.
     * @param totalShares Total shares of the property.
     * @param aprBips Annual percentage rate in basis points.
     * @param saleTime Duration of the sale in seconds.
     * @param registrationFeesPaid Amount of registration fee paid by the owner.
     * @param uri Metadata URI for the property.
     */
    struct Form {
        address owner; /// @dev Address of the property owner
        Status status; /// @dev Current status of the form
        uint256 pricePerShare; /// @dev Price per share of the property
        uint256 totalShares; /// @dev Total shares of the property
        uint256 aprBips; /// @dev The annual percentage rate (APR) for the property in basis points
        uint256 saleTime; /// @dev Duration of the sale in seconds
        uint256 registrationFeesPaid;
        string uri; /// @dev URI for the property's metadata
    }

    /**
     * @notice Enum representing the status of a form request.
     * @dev Used to track the lifecycle of a property registration request.
     * @param None Default uninitialized state.
     * @param Pending Form has been submitted and is awaiting validation.
     * @param Accepted Form has been validated and property registered.
     * @param Rejected Form has been reviewed and rejected.
     */
    enum Status {
        None,
        Pending,
        Accepted,
        Rejected
    }

    /**
     * @dev Address of the USDC contract on Ethereum Mainnet.
     */
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    /**
     * @dev Reference to the deployed IRWA (Real World Asset) contract.
     */
    IRWA private _helperRWA;

    /**
     * @dev ERC20 interface instance for USDC.
     */
    IERC20 private _helperUsdc = IERC20(USDC);

    /**
     * @dev Reference to the deployed marketplace contract for blacklist checks.
     */
    IMarketplace private _helperMarketplace;

    /**
     * @dev Tracks the total number of submitted registration requests.
     */
    uint256 private _totalRequests;

    /**
     * @dev Used as the base value (100%) for percentage and threshold calculations.
     */
    uint256 private constant BASE = 100;

    /**
     * @dev Used as the base value for APR calculations in basis points (0.1% = 1 bips).
     */
    uint256 private constant APR_BASE = 1000;

    /**
     * @dev Current fee in USDC required to register a new property.
     */
    uint256 private _registrationFees;

    /**
     * @dev Minimum duration allowed for a property sale.
     */
    uint256 private constant MINTIME = 60 minutes;

    /**
     * @dev Maximum duration allowed for a property sale.
     */
    uint256 private constant MAXTIME = 180 days;

    /**
     * @dev Global pause flag for disabling registration actions.
     */
    bool private _isPaused;

    /**
     * @dev Mapping to store all submitted forms by their request ID.
     */
    mapping(uint256 => Form) private _requests;

    /**
     * @notice Emitted whenever a registration request status is updated.
     * @param _by The address of the form submitter.
     * @param _requestId The ID of the registration request.
     * @param _status The new status of the form (Pending, Accepted, Rejected).
     * @param _propertyId ID of the registered property (non-zero only if accepted).
     */
    event RequestStatus(
        address indexed _by,
        uint256 _requestId,
        Status _status,
        uint256 _propertyId
    );

    /**
     * @notice Emitted when the contract's paused state is toggled.
     * @param _by Address that triggered the pause/unpause.
     * @param _isPaused New state of the platform.
     */
    event PausedStatus(address indexed _by, bool _isPaused);

    /**
     * @notice Emitted when the registration fee is updated by the owner.
     * @param _oldFees Previous fee amount.
     * @param _newFees Updated fee amount.
     */
    event RegistrationFeesChanged(uint256 _oldFees, uint256 _newFees);

    /**
     * @notice Initializes the contract with RWA and Marketplace contract addresses and registration fee.
     * @param _rwaAddress Address of the IRWA contract.
     * @param _marketAddress Address of the IMarketplace contract.
     * @param registrationFees_ Initial registration fee to be charged per request.
     */
    constructor(
        address _rwaAddress,
        address _marketAddress,
        uint256 registrationFees_
    ) Ownable(_msgSender()) {
        _helperRWA = IRWA(_rwaAddress);
        _helperMarketplace = IMarketplace(_marketAddress);
        _registrationFees = registrationFees_;
    }

    //////////////////////////////Main functions/////////////////////////////////

    /**
     * @notice Submits a new registration form for a tokenized property.
     * @dev Validates input, transfers registration fee, and stores form with Pending status.
     * Reverts with {ActionPaused}, {InvalidAPR}, {BlacklistedUser}, or {InvalidTime} if constraints fail.
     * @param _form The input form containing property metadata and sale details.
     */
    function registerProperty(InputForm memory _form) external {
        address _sender = _msgSender();
        if (_isPaused) revert ActionPaused();
        if (_form.aprBips > APR_BASE) revert InvalidAPR();
        if (_helperMarketplace.isBlacklisted(_form.owner))
            revert BlacklistedUser();
        if (_form.saleTime < MINTIME || _form.saleTime > MAXTIME)
            revert InvalidTime();
        _helperUsdc.transferFrom(_sender, address(this), _registrationFees);
        _totalRequests++;
        uint256 _requestId = _totalRequests;
        Form memory _formDetails = _requests[_requestId];
        _formDetails.owner = _form.owner;
        _formDetails.pricePerShare = _form.pricePerShare;
        _formDetails.aprBips = _form.aprBips;
        _formDetails.saleTime = _form.saleTime;
        _formDetails.status = Status.Pending;
        _formDetails.totalShares = _form.totalShares;
        _formDetails.registrationFeesPaid = _registrationFees;
        _formDetails.uri = _form.uri;
        _requests[_requestId] = _formDetails;

        emit RequestStatus(_form.owner, _requestId, Status.Pending, 0);
    }

    /**
     * @notice Validates a pending property registration request.
     * @dev Only callable by the contract owner. Accepts or rejects the request based on `_action`.
     * On acceptance, transfers fees back to owner and registers the property on the RWA contract.
     * On rejection, refunds registration fee to the form owner.
     * Reverts with {InvalidForm}, {BlacklistedUser}, or {InvalidThreshold}.
     * @param _requestNo The ID of the form request.
     * @param _threshold The minimum percentage of total share worth required.
     * @param _action Boolean: true to accept, false to reject the request.
     */
    function validateForms(
        uint256 _requestNo,
        uint256 _threshold,
        bool _action
    ) external onlyOwner {
        address _sender = _msgSender();
        Form memory _form = _requests[_requestNo];
        if (_form.owner == address(0)) revert InvalidForm();
        if (_helperMarketplace.isBlacklisted(_form.owner) && _action)
            revert BlacklistedUser();
        if (_action) {
            if (_threshold >= BASE) revert InvalidThreshold();
            uint256 _sharesMinimumWorth = ((_form.totalShares *
                _form.pricePerShare) * _threshold) / BASE;
            _helperUsdc.transfer(_sender, _form.registrationFeesPaid);
            IRWA.Property memory _property = IRWA.Property({
                owner: _form.owner,
                pricePerShare: _form.pricePerShare,
                totalShares: _form.totalShares,
                aprBips: _form.aprBips,
                totalOwners: 0,
                uri: _form.uri
            });

            uint256 _propertyId = _helperRWA.register(
                _property,
                (block.timestamp + _form.saleTime),
                _sharesMinimumWorth
            );

            emit RequestStatus(
                _form.owner,
                _requestNo,
                Status.Accepted,
                _propertyId
            );
        } else {
            _helperUsdc.transferFrom(
                _sender,
                _form.owner,
                _form.registrationFeesPaid
            );
            emit RequestStatus(_form.owner, _requestNo, Status.Rejected, 0);
        }
        _form.status = _action ? Status.Accepted : Status.Rejected;
        _requests[_requestNo] = _form;
    }

    /**
     * @notice Updates the registration fee for submitting new property forms.
     * @dev Only callable by the contract owner.
     * Reverts with {SameFees} if the new fee is equal to the existing fee.
     * @param _newFees The new fee amount in USDC.
     */
    function changeRegistrationFees(uint256 _newFees) external onlyOwner {
        uint256 _oldRegistrationFees = _registrationFees;
        if (_oldRegistrationFees == _newFees)
            revert SameFees(_oldRegistrationFees, _newFees);
        _registrationFees = _newFees;
        emit RegistrationFeesChanged(_oldRegistrationFees, _newFees);
    }

    /**
     * @notice Updates the paused state of the contract, enabling/disabling actions globally.
     * @dev Only callable by the contract owner.
     * Reverts with {SameState} if the new state is the same as the current one.
     * @param isPaused_ New paused state (true to pause, false to unpause).
     */
    function changeIsPaused(bool isPaused_) external onlyOwner {
        address _sender = _msgSender();
        if (_isPaused == isPaused_) revert SameState();
        _isPaused = isPaused_;
        emit PausedStatus(_sender, isPaused_);
    }

    ///////////////////////////////////View Functions///////////////////////////////////////////

    /**
     * @notice Returns the form details for a given request ID.
     * @param _requestNo The ID of the request to retrieve.
     * @return A {Form} struct with the submitted property registration data.
     */
    function getRequests(
        uint256 _requestNo
    ) external view returns (Form memory) {
        return _requests[_requestNo];
    }

    /**
     * @notice Retrieves the total number of property registration requests submitted.
     * @return The total number of requests stored.
     */
    function getTotalRequests() external view returns (uint256) {
        return _totalRequests;
    }

    /**
     * @notice Returns the current registration fee required to submit a new form.
     * @return The fee amount in USDC.
     */
    function getRegistrationFees() external view returns (uint256) {
        return _registrationFees;
    }

    /**
     * @notice Checks whether the platform is currently paused.
     * @return Boolean indicating if platform actions are restricted.
     */
    function getIsPaused() external view returns (bool) {
        return _isPaused;
    }
}
