const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RWAModule", (m) => {
  const rwa = m.contract("RWA", []);

  return { rwa };
});
