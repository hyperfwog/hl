import { createInterface } from "readline";
import { config } from "dotenv";
import {Hyperliquid, OrderRequest} from "../src";

config();

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

function waitForUserInput(message: string): Promise<void> {
    return new Promise((resolve) => {
        rl.question(message, () => {
            resolve();
        });
    });
}

async function testCustomExchangeAPI(): Promise<void> {
    const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY;
    if (!privateKey) throw new Error("Missing HYPERLIQUID_PRIVATE_KEY in env");

    const testnet = !process.env.mainnet;
    const sdk = new Hyperliquid(privateKey, testnet);

    try {
        const cancelResponse = await sdk.custom.cancelAllOrders();
        console.log(cancelResponse);
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        rl.close();
    }
}

async function testExchangeAPI(): Promise<void> {
    const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY;
    const walletAddress = process.env.HYPERLIQUID_WALLET_ADDRESS;
    const walletFriend = "0x440E80A60d04788a7cEd5DF27c90F1bcbD131355"

    if (!privateKey) throw new Error("Missing HYPERLIQUID_PRIVATE_KEY in env");
    if (!walletAddress) throw new Error("Missing HYPERLIQUID_WALLET_ADDRESS in env");

    const testnet = !process.env.mainnet;
    const cloid = "spoon";
    const sdk = new Hyperliquid(privateKey, testnet);

    try {
        console.log("Testing ExchangeAPI endpoints:");

        // 1. Place Order
        const orderRequest: OrderRequest = {
            coin: "HYPE-PERP",
            is_buy: true,
            sz: 0.01,
            limit_px: 20,
            order_type: { limit: { tif: "Gtc" } },
            reduce_only: false,
            cloid,
        };

        console.log("\n1. Place Order:");
        const placeOrderResponse = await sdk.exchange.placeOrder(orderRequest);
        console.log(JSON.stringify(placeOrderResponse));
        await waitForUserInput("Press Enter to continue to Cancel Order...");

        // 2. Cancel Order
        if (!placeOrderResponse.response?.data?.statuses?.[0]?.resting?.oid) {
            throw new Error("No order ID received from place order response");
        }

        const cancelRequest = {
            coin: "HYPE-PERP",
            o: placeOrderResponse.response.data.statuses[0].resting.oid,
        };

        console.log("\n2. Cancel Order:");
        const cancelOrderResponse = await sdk.exchange.cancelOrder(cancelRequest);
        console.log(JSON.stringify(cancelOrderResponse));
        await waitForUserInput("Press Enter to continue to Cancel Order by CLOID...");

        // 3. Cancel Order by CLOID
        console.log("\n3. Cancel Order by CLOID:");
        if (!cloid) throw new Error("Missing cloid in env");
        const cancelByCloidResponse = await sdk.exchange.cancelOrderByCloid(
            "HYPE-PERP",
            cloid
        );
        console.log(JSON.stringify(cancelByCloidResponse));
        await waitForUserInput("Press Enter to continue to Modify Order...");

        // 4. Modify Order
        console.log("\n4. Modify Order:");
        const modifyOrderResponse = await sdk.exchange.modifyOrder(
            placeOrderResponse.response.data.statuses[0].resting.oid,
            {
                ...orderRequest,
                limit_px: 25,
            }
        );
        console.log(JSON.stringify(modifyOrderResponse));
        await waitForUserInput("Press Enter to continue to Batch Modify Orders...");

        // 5. Batch Modify Orders
        console.log("\n5. Batch Modify Orders:");
        const batchModifyResponse = await sdk.exchange.batchModifyOrders([
            {
                oid: placeOrderResponse.response.data.statuses[0].resting.oid,
                order: { ...orderRequest, limit_px: 30 },
            },
        ]);
        console.log(JSON.stringify(batchModifyResponse));
        console.log(batchModifyResponse.response.data.statuses);
        await waitForUserInput("Press Enter to continue to Update Leverage...");

        // 6. Update Leverage
        console.log("\n6. Update Leverage:");
        const updateLeverageResponse = await sdk.exchange.updateLeverage(
            "HYPE-PERP",
            "cross",
            2
        );
        console.log(JSON.stringify(updateLeverageResponse));
        await waitForUserInput("Press Enter to continue to Update Isolated Margin...");

        // 7. Update Isolated Margin
        console.log("\n7. Update Isolated Margin:");
        const updateMarginResponse = await sdk.exchange.updateIsolatedMargin(
            "HYPE-PERP",
            true,
            3
        );
        console.log(JSON.stringify(updateMarginResponse));
        await waitForUserInput("Press Enter to continue to USD Transfer...");

        // 8. USD Transfer
        console.log("\n8. USD Transfer:");
        const usdTransferResponse = await sdk.exchange.usdTransfer(
            walletFriend,
            1
        );
        console.log(JSON.stringify(usdTransferResponse));
        await waitForUserInput("Press Enter to continue to Spot Transfer...");

        // 9. Spot Transfer
        console.log("\n9. Spot Transfer:");
        const spotTransferResponse = await sdk.exchange.spotTransfer(
            walletFriend,
            "PURR-SPOT",
            "0.001"
        );
        console.log(JSON.stringify(spotTransferResponse));
        await waitForUserInput("Press Enter to continue to Initiate Withdrawal...");

        // 10. Initiate Withdrawal
        console.log("\n10. Initiate Withdrawal:");
        const withdrawalResponse = await sdk.exchange.initiateWithdrawal(
            walletFriend,
            1
        );
        console.log(JSON.stringify(withdrawalResponse));
        await waitForUserInput("Press Enter to continue to Transfer Between Spot and Perp...");

        // 11. Transfer Between Spot and Perp
        console.log("\n11. Transfer Between Spot and Perp:");
        const transferResponse = await sdk.exchange.transferBetweenSpotAndPerp(
            1,
            false
        );
        console.log(JSON.stringify(transferResponse));
        await waitForUserInput("Press Enter to continue to Schedule Cancel...");

        // 12. Schedule Cancel
        console.log("\n12. Schedule Cancel:");
        const scheduleCancelResponse = await sdk.exchange.scheduleCancel(
            Date.now() + 3600000 // Cancel in 1 hour
        );
        console.log(JSON.stringify(scheduleCancelResponse));
        await waitForUserInput("Press Enter to continue to Vault Transfer...");

        // 13. Vault Transfer
        console.log("\n13. Vault Transfer:");
        const vaultTransferResponse = await sdk.exchange.vaultTransfer(
            "0x579c050b23a4250c834f4176f89f1bc30cb4acf1",
            true,
            1
        );
        console.log(JSON.stringify(vaultTransferResponse));
        await waitForUserInput("Press Enter to continue to Set Referrer...");

        // 14. Set Referrer
        console.log("\n14. Set Referrer:");
        const setReferrerResponse = await sdk.exchange.setReferrer(
            "referrer_code_here"
        );
        console.log(JSON.stringify(setReferrerResponse));

    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        rl.close();
    }
}

// Uncomment the function you want to test
// testCustomExchangeAPI();
testExchangeAPI().then();