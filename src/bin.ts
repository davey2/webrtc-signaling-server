#!/usr/bin/env node

import commander, { Command, OptionValues } from "commander";
import WebRTCSignalingServer from "./server";

const program: commander.Command = new Command();

program.option("-p, --port [number]", "port to listen on", "8000");

program.parse(process.argv);

console.log(program.opts());

const options: OptionValues = program.opts();

new WebRTCSignalingServer(options.port);
