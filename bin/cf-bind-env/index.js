#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  // optional argument
  .option("filename", {
    alias: "f",
    type: "string",
    default: "default-env.json",
    describe: "Path to the output file",
  })
  // expect two arguments: service_name and service_key_name.
  .demandCommand(2).argv;

const [service_name, service_key_name] = argv._;
const { filename } = argv;

const fs = require("fs");
const execSync = require("child_process").execSync;

if (!service_name || !service_key_name) {
  console.log("Usage: node index.js <service_name> <service_key_name>");
  process.exit(1);
}

const service_output = execCommand(`cf service ${service_name}`);
const credentials_output = execCommand(
  `cf service-key ${service_name} ${service_key_name}`
);

const credentials = JSON.parse(credentials_output.match(/\{[\s\S]*\}/)[0]);
const instance_name = service_output.match(/^name:\s+(.*)/m)[1];
const service = service_output.match(/^service:\s+(.*)/m)[1];
const tags = [service, instance_name];
const plan = service_output.match(/^plan:\s+(.*)/m)[1];

const vcapStructure = {
  VCAP_SERVICES: {
    [service]: [
      {
        name: instance_name,
        instance_name: instance_name,
        label: service_name,
        tags: tags,
        plan: plan,
        credentials: credentials,
      },
    ],
  },
};

if (fs.existsSync(filename)) {
  const content = JSON.parse(fs.readFileSync(filename, "utf8"));

  if (content.VCAP_SERVICES && content.VCAP_SERVICES[service]) {
    content.VCAP_SERVICES[service][0].credentials =
      vcapStructure.VCAP_SERVICES[service][0].credentials;
  } else {
    content.VCAP_SERVICES = {
      ...content.VCAP_SERVICES,
      ...vcapStructure.VCAP_SERVICES,
    };
  }

  fs.writeFileSync(filename, JSON.stringify(content, null, 2));
} else {
  fs.writeFileSync(filename, JSON.stringify(vcapStructure, null, 2));
}

console.log(`${filename} updated successfully!`);

function execCommand(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}
