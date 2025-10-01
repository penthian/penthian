const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RegistrationFormModule", (m) => {
  const rwaAddress = m.getParameter("_rwaAddress");
  const form = m.contract("RegistrationForm", [rwaAddress]);

  return { form };
});
