// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Voting
/// @author Rabeeb Aqdas
/// @dev A contract designed to manage property-related proposals and voting mechanisms.
///      Facilitates the creation of proposals by eligible users, tracks voting activity,
///      and determines the outcome of proposals based on weighted votes.

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
 * @title IERC20
 * @dev Standard ERC-20 interface for transferring tokens from one address to another.
 */
interface IERC20 {
    /**
     * @notice Transfers tokens from one address to another on behalf of the sender.
     * @param from The address to transfer tokens from.
     * @param to The address to transfer tokens to.
     * @param value The amount of tokens to transfer.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

/**
 * @title IRWA
 * @dev Interface for interacting with Real World Asset (RWA) token holdings.
 */
interface IRWA {
    /**
     * @notice Returns the total holding history of a user for a specific property ID.
     * @param _userAddress The address of the user.
     * @param _propertyId The ID of the property being queried.
     * @return The amount of asset the user has held historically.
     */
    function getHoldingHistory(
        address _userAddress,
        uint256 _propertyId
    ) external view returns (uint256);

    /**
     * @notice Returns the current balance of a specific property token for a user.
     * @param account The address of the token holder.
     * @param id The ID of the property token.
     * @return The current token balance of the user for the given property.
     */
    function balanceOf(
        address account,
        uint256 id
    ) external view returns (uint256);
}

/**
 * @title IMarketplace
 * @dev Interface for marketplace-level permission and blacklist checks.
 */
interface IMarketplace {
    /**
     * @notice Checks whether a given user is blacklisted from participating in the marketplace.
     * @param _user The address of the user to check.
     * @return A boolean value indicating whether the user is blacklisted.
     */
    function isBlacklisted(address _user) external view returns (bool);
}

/**
 * @dev Error thrown when a user is not eligible to create or participate in a proposal.
 */
error YouAreNotEligible();

/**
 * @dev Error thrown when a user is not allowed to vote on a proposal.
 */
error YouCantVote();

/**
 * @dev Error thrown when attempting to vote on or interact with a proposal that has already ended.
 */
error ProposalHasEnded();

/**
 * @dev Error thrown when a user attempts to vote on a proposal they have already voted on.
 */
error AlreadyVoted();

/**
 * @dev Error thrown when a specified proposal cannot be found.
 */
error ProposalNotFound();

/**
 * @dev Error thrown when an invalid fee value is provided.
 */
error InvalidFees();

/**
 * @dev Error thrown when an invalid fee value is provided.
 */
error ActionRestricted();

/**
 * @dev Error thrown when attempting to delete a proposal that is not ongoing.
 */
error CantDeleteProposal();

contract Voting is Ownable {
    /**
     * @dev Represents a proposal within the voting system.
     * @param propertyId The ID of the property associated with the proposal.
     * @param proposer The address of the user who created the proposal.
     * @param startTime The timestamp when the proposal was created.
     * @param endTime The timestamp when the proposal voting ends.
     * @param votesInFavor The total number of votes in favor of the proposal.
     * @param votesInAgainst The total number of votes against the proposal.
     * @param description The encoded description of the proposal.
     */
    struct Proposal {
        uint256 propertyId;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 votesInFavor;
        uint256 votesInAgainst;
        bytes description;
    }

    /**
     * @dev Represents the state of a proposal.
     * @value NotFound The proposal does not exist.
     * @value OnGoing The proposal is currently active and open for voting.
     * @value Passed The proposal has been approved based on the voting outcome.
     * @value Failed The proposal has been rejected based on the voting outcome.
     */
    enum ProposalState {
        NotFound,
        OnGoing,
        Passed,
        Failed
    }

    /**
     * @dev The duration of the voting period for a proposal (30 days).
     */
    uint256 private constant VOTINGPERIOD = 30 days;

    /**
     * @dev The address of the USDC token contract.
     */
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    /**
     * @dev The ID of the latest proposal created.
     */
    uint256 private _proposalIds;

    /**
     * @dev The fee required to create a proposal, specified in USDC.
     */
    uint256 private _proposalFee;

    /**
     * @dev Interface for interacting with the USDC token contract.
     */
    IERC20 private _helperUsdc = IERC20(USDC);

    /**
     * @dev Interface for interacting with the RWA contract.
     */
    IRWA private _helperRWA;

    /**
     * @dev Reference to the IMarketplace contract
     */
    IMarketplace private _helperMarketplace;

    /**
     * @dev Mapping of proposal IDs to their corresponding Proposal struct.
     */
    mapping(uint256 => Proposal) private _proposals;

    /**
     * @dev Mapping to track whether a voter has already voted on a specific proposal.
     */
    mapping(address => mapping(uint256 => bool)) private _hasVoted;

    /**
     * @notice Emitted when a new proposal is created.
     * @param _by The address of the proposer.
     * @param _proposalId The ID of the newly created proposal.
     * @param _endTime The timestamp when the proposal voting ends.
     */
    event ProposalStatus(
        address indexed _by,
        uint256 _proposalId,
        uint256 _endTime
    );

    /**
     * @notice Emitted when a user votes on a proposal.
     * @param _by The address of the voter.
     * @param _proposalId The ID of the proposal being voted on.
     * @param _inFavor True if the vote is in favor, false if against.
     */
    event Voted(address indexed _by, uint256 _proposalId, bool _inFavor);

    /**
     * @notice Emitted when the proposal fee is updated.
     * @param _by The address of the user who updated the fee.
     * @param _oldFees The previous fee amount in USDC.
     * @param _newFees The new fee amount in USDC.
     */
    event FeesChanged(address indexed _by, uint256 _oldFees, uint256 _newFees);

    /**
     * @dev Modifier to restrict access for blacklisted users.
     * Reverts with {ActionRestricted} if the given user is blacklisted in the marketplace.
     * @param _user The address to check against the blacklist.
     */
    modifier notBlacklisted(address _user) {
        if (_helperMarketplace.isBlacklisted(_user)) revert ActionRestricted();
        _;
    }

    /**
     * @notice Initializes the Voting contract.
     * @param _rwaAddress The address of the RWA contract used for property and share management.
     * @param _feesInUsdc The initial proposal fee in USDC.
     * @dev Sets the deployer as the contract owner and initializes the RWA contract interface and proposal fee.
     */
    constructor(
        address _rwaAddress,
        address _marketAddress,
        uint256 _feesInUsdc
    ) Ownable(_msgSender()) {
        _helperRWA = IRWA(_rwaAddress);
        _helperMarketplace = IMarketplace(_marketAddress);
        _proposalFee = _feesInUsdc;
    }

    /**
     * @notice Allows eligible users to create a new proposal for a specific property.
     * @param _propertyId The ID of the property associated with the proposal.
     * @param _encodedDescription The encoded description of the proposal.
     * @dev Transfers the proposal fee in STAY tokens to the contract owner.
     *      Reverts with `YouAreNotEligible` if the sender has no shares in the property.
     *      Emits a `ProposalStatus` event upon successful creation.
     */
    function addProposal(
        uint256 _propertyId,
        bytes memory _encodedDescription
    ) external notBlacklisted(_msgSender()) {
        address _sender = _msgSender();
        address _owner = owner();
        uint256 _currentTime = block.timestamp;
        uint256 _proposerBalance = _helperRWA.balanceOf(_sender, _propertyId);
        if (_proposerBalance == 0) revert YouAreNotEligible();

        _helperUsdc.transferFrom(_sender, _owner, _proposalFee);
        uint256 _proposalId = ++_proposalIds;
        uint256 _endTime = _currentTime + VOTINGPERIOD;
        _proposals[_proposalId] = Proposal({
            propertyId: _propertyId,
            proposer: _sender,
            startTime: _currentTime,
            endTime: _endTime,
            votesInFavor: _proposerBalance,
            votesInAgainst: 0,
            description: _encodedDescription
        });
        _hasVoted[_sender][_proposalId] = true;

        emit ProposalStatus(_sender, _proposalId, _endTime);
    }

    /**
     * @notice Allows eligible users to vote on an ongoing proposal.
     * @param _proposalId The ID of the proposal to vote on.
     * @param _inFavor True if voting in favor of the proposal, false if voting against.
     * @dev Records the user's vote and updates the proposal's vote counts.
     *      Reverts with `ProposalNotFound` if the proposal does not exist.
     *      Reverts with `ProposalHasEnded` if the proposal voting period has ended.
     *      Reverts with `AlreadyVoted` if the user has already voted on the proposal.
     *      Reverts with `YouCantVote` if the user is not eligible to vote.
     *      Emits a `Voted` event upon successful voting.
     */
    function vote(
        uint256 _proposalId,
        bool _inFavor
    ) external notBlacklisted(_msgSender()) {
        address _sender = _msgSender();
        uint256 _currentTime = block.timestamp;
        Proposal memory _proposal = _proposals[_proposalId];
        if (_proposal.proposer == address(0)) revert ProposalNotFound();
        if (_currentTime > _proposal.endTime) revert ProposalHasEnded();
        if (_hasVoted[_sender][_proposalId]) revert AlreadyVoted();
        uint256 _voterBalance = _helperRWA.balanceOf(
            _sender,
            _proposal.propertyId
        );
        uint256 _holdingTime = _helperRWA.getHoldingHistory(
            _sender,
            _proposal.propertyId
        );
        if (_voterBalance == 0 || _holdingTime > _proposal.startTime)
            revert YouCantVote();
        _hasVoted[_sender][_proposalId] = true;

        if (_inFavor) _proposal.votesInFavor += _voterBalance;
        else _proposal.votesInAgainst += _voterBalance;

        _proposals[_proposalId] = _proposal;

        emit Voted(_sender, _proposalId, _inFavor);
    }

    /**
     * @notice Allows the owner to delete a proposal.
     * @param _proposalId The ID of the proposal to vote on.
     */
    function deleteProposal(uint256 _proposalId) external onlyOwner {
        address _sender = _msgSender();
        if (_getProposalStatus(_proposalId) != ProposalState.OnGoing)
            revert CantDeleteProposal();
        delete _proposals[_proposalId];
        emit ProposalStatus(_sender, _proposalId, 0);
    }

    /**
     * @notice Allows the owner to update the fee required to create a proposal.
     * @param _newFeesInUsdc The new fee amount in USDC.
     * @dev Updates the proposal fee and emits a `FeesChanged` event.
     *      Reverts with `InvalidFees` if the new fee is zero or matches the current fee.
     */
    function changeProposalFee(uint256 _newFeesInUsdc) external onlyOwner {
        address _sender = _msgSender();
        uint256 _oldFees = _proposalFee;
        if (_newFeesInUsdc == 0 || _newFeesInUsdc == _oldFees)
            revert InvalidFees();
        _proposalFee = _newFeesInUsdc;
        emit FeesChanged(_sender, _oldFees, _newFeesInUsdc);
    }

    /**
     * @notice Retrieves the current status of a proposal.
     * @param _proposalId The ID of the proposal to check.
     * @return The current status of the proposal as a `ProposalState`.
     * @dev Returns `NotFound` if the proposal does not exist, `OnGoing` if voting is active,
     *      `Passed` if the votes in favor exceed votes against, and `Failed` otherwise.
     */
    function _getProposalStatus(
        uint256 _proposalId
    ) private view returns (ProposalState) {
        Proposal memory _proposal = _proposals[_proposalId];
        if (_proposal.proposer == address(0)) return ProposalState.NotFound;
        else if (_proposal.endTime > block.timestamp)
            return ProposalState.OnGoing;
        else if (_proposal.votesInFavor > _proposal.votesInAgainst)
            return ProposalState.Passed;
        else return ProposalState.Failed;
    }

    /**
     * @notice Retrieves the current proposal fee in USDC.
     * @return The proposal fee amount in USDC.
     */
    function getProposalFees() external view returns (uint256) {
        return _proposalFee;
    }

    /**
     * @notice Retrieves the details of a specific proposal.
     * @param _proposalId The ID of the proposal to retrieve.
     * @return _propertyId The ID of the associated property.
     * @return _proposer The address of the proposal creator.
     * @return _endTime The timestamp when the proposal voting ends.
     * @return _votesInFavour The total votes in favor of the proposal.
     * @return _votesInAgainst The total votes against the proposal.
     * @return _description The encoded description of the proposal.
     * @return _status The current status of the proposal.
     * @dev Returns `ProposalNotFound` if the proposal does not exist.
     */
    function getProposal(
        uint256 _proposalId
    )
        external
        view
        returns (
            uint256 _propertyId,
            address _proposer,
            uint256 _endTime,
            uint256 _votesInFavour,
            uint256 _votesInAgainst,
            bytes memory _description,
            ProposalState _status
        )
    {
        Proposal memory proposal = _proposals[_proposalId];

        return (
            proposal.propertyId,
            proposal.proposer,
            proposal.endTime,
            proposal.votesInFavor,
            proposal.votesInAgainst,
            proposal.description,
            _getProposalStatus(_proposalId)
        );
    }

    /**
     * @notice Checks whether a user has voted on a specific proposal.
     * @param _voter The address of the voter.
     * @param _proposalId The ID of the proposal.
     * @return True if the user has voted on the proposal, false otherwise.
     */
    function hasVoted(
        address _voter,
        uint256 _proposalId
    ) external view returns (bool) {
        return _hasVoted[_voter][_proposalId];
    }

    /**
     * @notice Retrieves the total number of proposals created.
     * @return The total number of proposals.
     */
    function totalProposals() external view returns (uint256) {
        return _proposalIds;
    }

    /**
     * @notice Encodes a string into bytes for use in proposal descriptions.
     * @param _description The string to encode.
     * @return The encoded bytes representation of the string.
     */
    function encodeString(
        string memory _description
    ) external pure returns (bytes memory) {
        return abi.encode(_description);
    }

    /**
     * @notice Decodes bytes into a string for reading proposal descriptions.
     * @param encodedDesc The encoded bytes representation of the string.
     * @return The decoded string.
     */
    function decodeString(
        bytes memory encodedDesc
    ) external pure returns (string memory) {
        string memory decodedStr = abi.decode(encodedDesc, (string));
        return decodedStr;
    }
}
