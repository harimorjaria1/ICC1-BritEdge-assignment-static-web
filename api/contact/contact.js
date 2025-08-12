const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = "contactformdb";
const containerId = "contact_results";

const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
    if (req.method !== "POST") {
        context.res = { status: 405, body: "Method Not Allowed" };
        return;
    }

    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        context.res = { status: 400, body: "Missing required fields" };
        return;
    }

    try {
        const container = client.database(databaseId).container(containerId);
        const item = { id: Date.now().toString(), name, email, subject, message, timestamp: new Date().toISOString() };
        await container.items.create(item);
        context.res = { status: 200, body: { success: true } };
    } catch (err) {
        context.log.error("Cosmos DB error:", err);
        context.res = { status: 500, body: "Internal Server Error" };
    }
};