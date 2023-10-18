import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
import {
  StreamingTextResponse,
  experimental_StreamData,
  LangChainStream,
} from "ai-stream-experimental";
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-templates";

// Define the type for the arguments of the callChain function
type callChainArgs = {
  question: string;
  chatHistory: string;
};

// This function is responsible for calling the language chain
export async function callChain({ question, chatHistory }: callChainArgs) {
  try {
    // Sanitize the question by removing new lines
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    // Get the Pinecone client
    const pineconeClient = await getPineconeClient();
    // Get the vector store
    const vectorStore = await getVectorStore(pineconeClient);
    // Initialize the language chain stream
    const { stream, handlers } = LangChainStream({
      experimental_streamData: true,
    });
    // Initialize the stream data
    const data = new experimental_StreamData();

    // Create the conversational retrieval QA chain
    const chain = ConversationalRetrievalQAChain.fromLLM(
      streamingModel,
      vectorStore.asRetriever(),
      {
        qaTemplate: QA_TEMPLATE,
        questionGeneratorTemplate: STANDALONE_QUESTION_TEMPLATE,
        returnSourceDocuments: true, //default 4
        questionGeneratorChainOptions: {
          llm: nonStreamingModel,
        },
      }
    );

    // Call the chain with the sanitized question and chat history
    chain
      .call(
        {
          question: sanitizedQuestion,
          chat_history: chatHistory,
        },
        [handlers]
      )
      .then(async (res) => {
        // Get the source documents from the response
        const sourceDocuments = res?.sourceDocuments;
        // Get the first two documents
        const firstTwoDocuments = sourceDocuments.slice(0, 2);
        // Get the page contents of the first two documents
        const pageContents = firstTwoDocuments.map(
          ({ pageContent }: { pageContent: string }) => pageContent
        );
        // Append the page contents to the stream data
        data.append({
          sources: pageContents,
        });
        // Close the stream data
        data.close();
      });

    // Return the readable stream
    return new StreamingTextResponse(stream, {}, data);
  } catch (e) {
    // Log the error and throw a new error
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}
