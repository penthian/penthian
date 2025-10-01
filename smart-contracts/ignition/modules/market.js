const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MarketPlaceModule", (m) => {
  const rwaAddress = m.getParameter("_rwaAddress");
  const platformFee = m.getParameter("_platformFee");

  const marketplace = m.contract("MarketPlace", [rwaAddress, platformFee]);

  return { marketplace };
});
