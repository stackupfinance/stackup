import { expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { Interface, LogDescription } from "ethers/lib/utils";

import { pct } from "./numbers";

// Ported from @openzeppelin/test-helpers to use with Ethers. The Test Helpers don't
// yet have Typescript typings, so we're being lax about them here.
// See https://github.com/OpenZeppelin/openzeppelin-test-helpers/issues/122

/* eslint-disable @typescript-eslint/no-explicit-any */

export function assertWithError(
  actual: BigNumber,
  expected: BigNumber,
  error: number
): void {
  const acceptedError = pct(expected, error);
  expect(actual).to.be.at.least(expected.sub(acceptedError));
  expect(actual).to.be.at.most(expected.add(acceptedError));
}

export async function assertEvent(
  tx: ContractTransaction,
  eventName: string,
  eventArgs = {}
): Promise<any> {
  const receipt = await tx.wait();

  if (receipt.events == undefined) {
    throw new Error("No events found in receipt");
  }

  const events = receipt.events.filter((e) => e.event === eventName);
  expect(events.length > 0).to.equal(true, `No '${eventName}' events found`);

  const exceptions: Array<string> = [];
  const event = events.find(function (e) {
    for (const [k, v] of Object.entries(eventArgs)) {
      try {
        if (e.args == undefined) {
          throw new Error("Event has no arguments");
        }

        contains(e.args, k, v);
      } catch (error) {
        exceptions.push(error as string);
        return false;
      }
    }
    return true;
  });

  if (event === undefined) {
    // Each event entry may have failed to match for different reasons,
    // throw the first one
    throw exceptions[0];
  }

  return event;
}

export async function assertIndirectEvent(
  tx: ContractTransaction,
  emitter: Interface,
  eventName: string,
  eventArgs = {}
): Promise<any> {
  const receipt = await tx.wait();
  const decodedEvents = receipt.logs
    .map((log) => {
      try {
        return emitter.parseLog(log);
      } catch {
        return undefined;
      }
    })
    .filter((e): e is LogDescription => e !== undefined);

  const expectedEvents = decodedEvents.filter(
    (event) => event.name === eventName
  );
  expect(expectedEvents.length > 0).to.equal(
    true,
    `No '${eventName}' events found`
  );

  const exceptions: Array<string> = [];
  const event = expectedEvents.find(function (e) {
    for (const [k, v] of Object.entries(eventArgs)) {
      try {
        if (e.args == undefined) {
          throw new Error("Event has no arguments");
        }

        contains(e.args, k, v);
      } catch (error) {
        exceptions.push(error as string);
        return false;
      }
    }
    return true;
  });

  if (event === undefined) {
    // Each event entry may have failed to match for different reasons,
    // throw the first one
    throw exceptions[0];
  }

  return event;
}

export async function assertNoEvent(
  tx: ContractTransaction,
  eventName: string
): Promise<void> {
  const receipt = await tx.wait();
  if (receipt.events != undefined) {
    const events = receipt.events.filter((e) => e.event === eventName);
    expect(events.length > 0).to.equal(false, `'${eventName}' event found`);
  }
}

export async function assertNoIndirectEvent(
  tx: ContractTransaction,
  emitter: Interface,
  eventName: string
): Promise<void> {
  const receipt = await tx.wait();
  const decodedEvents = receipt.logs
    .map((log) => {
      try {
        return emitter.parseLog(log);
      } catch {
        return undefined;
      }
    })
    .filter((e): e is LogDescription => e !== undefined);

  const events = decodedEvents.filter((event) => event.name === eventName);
  expect(events.length > 0).to.equal(false, `'${eventName}' event found`);
}

function contains(
  args: { [key: string]: any | undefined },
  key: string,
  value: any
) {
  expect(key in args).to.equal(true, `Event argument '${key}' not found`);

  if (value === null) {
    expect(args[key]).to.equal(
      null,
      `expected event argument '${key}' to be null but got ${args[key]}`
    );
  } else if (BigNumber.isBigNumber(args[key]) || BigNumber.isBigNumber(value)) {
    const actual = BigNumber.isBigNumber(args[key])
      ? args[key].toString()
      : args[key];
    const expected = BigNumber.isBigNumber(value) ? value.toString() : value;

    expect(args[key]).to.equal(
      value,
      `expected event argument '${key}' to have value ${expected} but got ${actual}`
    );
  } else {
    const expected =
      typeof args[key] === "string" &&
      typeof value === "object" &&
      value.address
        ? value.address
        : value;
    expect(args[key]).to.be.deep.equal(
      expected,
      `expected event argument '${key}' to have value ${value} but got ${args[key]}`
    );
  }
}
