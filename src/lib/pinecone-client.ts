import { PineconeClient } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";

// Instance to hold the Pinecone client
let pineconeClientInstance: PineconeClient | null = null;

// Function to create a new index in Pinecone if it doesn't already exist
async function createIndex(client: PineconeClient, indexName: string) {
  try {
    // Create the index with the specified name, dimension, and metric
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536,
        metric: "cosine",
      },
    });
    // Log a message and wait for the index to initialize
    console.log(
      `Waiting for ${env.INDEX_INIT_TIMEOUT} seconds for index initialization to complete...`
    );
    await delay(env.INDEX_INIT_TIMEOUT);
    console.log("Index created !!");
  } catch (error) {
    // Log the error and throw a new error
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}

// Function to initialize the Pinecone client and ensure the index is ready to be accessed
async function initPineconeClient() {
  try {
    // Create a new Pinecone client and initialize it with the API key and environment
    const pineconeClient = new PineconeClient();
    await pineconeClient.init({
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT,
    });
    const indexName = env.PINECONE_INDEX_NAME;

    // Get a list of existing indexes
    const existingIndexes = await pineconeClient.listIndexes();

    // If the index doesn't exist, create it
    if (!existingIndexes.includes(indexName)) {
      createIndex(pineconeClient, indexName);
    } else {
      // If the index already exists, log a message
      console.log("Your index already exists. nice !!");
    }

    // Return the initialized Pinecone client
    return pineconeClient;
  } catch (error) {
    // Log the error and throw a new error
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

// Function to get the Pinecone client, initializing it if it hasn't been initialized yet
export async function getPineconeClient() {
  // If the Pinecone client hasn't been initialized yet, initialize it
  if (!pineconeClientInstance) {
    pineconeClientInstance = await initPineconeClient();
  }

  // Return the Pinecone client
  return pineconeClientInstance;
}
