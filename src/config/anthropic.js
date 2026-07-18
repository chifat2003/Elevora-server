const Anthropic = require("@anthropic-ai/sdk");

let client;

function getAnthropicClient() {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

module.exports = { getAnthropicClient };
