//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {
    //Max no of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    uint8 public numAddressesWhitelisted;

    //creat a mapping if address if whitelisted value is true otherwise false by default
    mapping(address => bool) public whitelistedAddresses;

    constructor(uint8 _maxWhitelistAddresses) {
        maxWhitelistedAddresses = _maxWhitelistAddresses;
    }

    // addAddressToWhitelist - This function adds the address of the sender to the whitelist
    function addAddressToWhiteList() public {
        // check if user whitelisted
        require(
            !whitelistedAddresses[msg.sender],
            "Sender has already been whitelisted"
        );

        require(
            numAddressesWhitelisted < maxWhitelistedAddresses,
            "More addresses cant be added, limit reached"
        );

        whitelistedAddresses[msg.sender] = true;

        numAddressesWhitelisted += 1;
    }
}
