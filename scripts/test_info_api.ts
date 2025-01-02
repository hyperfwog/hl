
import { createInterface } from "node:readline";
import { config } from "dotenv";
import {Hyperliquid} from "../src";

config();

const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY!;
const walletAddress = process.env.HYPERLIQUID_WALLET_ADDRESS!;

if (!privateKey || !walletAddress) {
    console.error("Missing HYPERLIQUID_PRIVATE_KEY or HYPERLIQUID_WALLET_ADDRESS in env");
    process.exit(1);
}

const rawMode = true;
const rl = createInterface({ input: process.stdin, output: process.stdout });

const waitForInput = (prompt: string): Promise<void> =>
    new Promise((resolve) => {
        rl.question(prompt, () => resolve());
    });

// Helper to print only first items
const printFirstItems = (data: any, count: number = 2) => {
    if (Array.isArray(data)) {
        console.log(data.slice(0, count));
    } else if (typeof data === 'object' && data !== null) {
        const entries = Object.entries(data);
        const limitedObj = Object.fromEntries(entries.slice(0, count));
        console.log(limitedObj);
    } else {
        console.log(data);
    }
    console.log(`... (${Array.isArray(data) ? data?.length : Object.keys(data).length} total items)`);
};

async function testInfoAPI(sdk: Hyperliquid) {
    try {
        console.log("Testing InfoAPI methods:");

        console.log("\ngetAllMids (first 2 items):");
        const mids = await sdk.info.getAllMids(rawMode);
        printFirstItems(mids);
        await waitForInput("Press Enter to continue...\n");

        console.log("\ngetUserOpenOrders:");
        const openOrders = await sdk.info.getUserOpenOrders(walletAddress, rawMode);
        printFirstItems(openOrders);
        await waitForInput("Press Enter to continue...\n");

        console.log("\ngetL2Book:");
        const book = await sdk.info.getL2Book("BTC-PERP", rawMode);
        console.log("First 2 ask levels:");
        printFirstItems(book.levels[0]);
        console.log("\nFirst 2 bid levels:");
        printFirstItems(book.levels[1]);
        await waitForInput("Press Enter to continue...\n");

        console.log("\ngetCandleSnapshot (first 2 candles):");
        const candles = await sdk.info.getCandleSnapshot(
            "BTC-PERP",
            "1h",
            Date.now() - 86400000,
            Date.now(),
            rawMode
        );
        printFirstItems(candles);
        await waitForInput("Press Enter to continue...\n");
    } catch (error) {
        console.error("Error in testInfoAPI:", error);
    }
}

async function testSpotInfoAPI(sdk: Hyperliquid) {
    try {
        console.log("\nTesting SpotInfoAPI methods:");

        console.log("\ngetSpotMeta (first 2 universe items):");
        const spotMeta = await sdk.info.spot.getSpotMeta(rawMode);
        printFirstItems(spotMeta.universe);
        await waitForInput("Press Enter to continue...\n");

        console.log("\ngetSpotMetaAndAssetCtxs (first 2 items):");
        const spotMetaAndCtxs = await sdk.info.spot.getSpotMetaAndAssetCtxs(rawMode);
        printFirstItems(spotMetaAndCtxs);
        await waitForInput("Press Enter to continue...\n");
    } catch (error) {
        console.error("Error in testSpotInfoAPI:", error);
    }
}

async function testPerpetualsInfoAPI(sdk: Hyperliquid) {
    try {
        console.log("\nTesting PerpetualsInfoAPI methods:");

        console.log("\ngetMeta (first 2 universe items):");
        const meta = await sdk.info.perpetuals.getMeta(rawMode);
        printFirstItems(meta.universe);
        await waitForInput("Press Enter to continue...\n");

        console.log("\ngetFundingHistory (first 2 entries):");
        const fundingHistory = await sdk.info.perpetuals.getFundingHistory(
            "BTC-PERP",
            Date.now() - 86400000,
            Date.now(),
            rawMode
        );
        printFirstItems(fundingHistory);
        await waitForInput("Press Enter to continue...\n");
    } catch (error) {
        console.error("Error in testPerpetualsInfoAPI:", error);
    }
}

async function main() {
    try {
        const sdk = new Hyperliquid(privateKey);
        await testInfoAPI(sdk);
        await testSpotInfoAPI(sdk);
        await testPerpetualsInfoAPI(sdk);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main().catch(console.error);