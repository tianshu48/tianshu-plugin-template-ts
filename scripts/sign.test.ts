import { describe, expect, it } from "vitest";
import {
  authorIdFromPluginId,
  generateSeed,
  identitySkPath,
  packPluginFiles,
  publicKeyHexFromSeed,
  signRelease,
  userSkPathFromArgs,
  verifyRelease,
} from "./sign.mjs";

describe("sign", () => {
  it("maps plugin id first segment to author id", () => {
    expect(authorIdFromPluginId("alice.dice")).toBe("alice");
    expect(authorIdFromPluginId("solo")).toBe("solo");
  });

  it("looks for the Tianshu user key, not a repo-local file", () => {
    expect(identitySkPath().replaceAll("\\", "/")).toMatch(
      /com\.tianshu\.desktop\/identity\/user\.sk\.hex$/,
    );
  });

  it("uses Windows Roaming AppData for the default key path", () => {
    expect(
      identitySkPath({
        platform: "win32",
        home: "C:\\Users\\Alice",
        env: { APPDATA: "C:\\Users\\Alice\\AppData\\Roaming" },
      }),
    ).toBe(
      "C:\\Users\\Alice\\AppData\\Roaming\\com.tianshu.desktop\\identity\\user.sk.hex",
    );
    expect(
      identitySkPath({
        platform: "win32",
        home: "C:\\Users\\Alice",
        env: {},
      }),
    ).toBe(
      "C:\\Users\\Alice\\AppData\\Roaming\\com.tianshu.desktop\\identity\\user.sk.hex",
    );
  });

  it("uses --sk when the user key is not in the default place", () => {
    expect(
      userSkPathFromArgs(["node", "sign.mjs", "--sk", "D:\\keys\\user.sk.hex"], {
        platform: "linux",
        home: "/home/alice",
        env: {},
      }),
    ).toBe("D:\\keys\\user.sk.hex");
    expect(
      userSkPathFromArgs(["node", "sign.mjs", "--sk=./mine.hex"], {
        platform: "linux",
        home: "/home/alice",
        env: {},
      }),
    ).toBe("./mine.hex");
  });

  it("round-trips a packed artifact signature", () => {
    const seed = generateSeed();
    const artifact = packPluginFiles(
      Buffer.from("{}"),
      Buffer.from("{}"),
      Buffer.from([0, 97, 115, 109]),
      Buffer.alloc(0),
      Buffer.alloc(0),
    );
    const envelope = signRelease({
      seed,
      pluginId: "alice.dice",
      abi: 3,
      kind: "wasm",
      authorId: "alice",
      artifact,
    });
    expect(
      verifyRelease(envelope, publicKeyHexFromSeed(seed), artifact),
    ).toBe(true);
    const flipped = Buffer.from(artifact);
    flipped[4] ^= 1;
    expect(
      verifyRelease(envelope, publicKeyHexFromSeed(seed), flipped),
    ).toBe(false);
  });
});
