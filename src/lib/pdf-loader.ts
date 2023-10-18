import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "./config";

// This function is used to load a PDF document, split it into chunks and return the chunked documents
export async function getChunkedDocsFromPDF() {
  try {
    // Create a new PDFLoader instance with the path to the PDF document
    const loader = new PDFLoader(env.PDF_PATH || "docs/atlas.pdf");
    // Load the PDF document
    const docs = await loader.load();

    // Create a new RecursiveCharacterTextSplitter instance with the specified chunk size and overlap
    // This is used to split the loaded document into smaller chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Split the loaded document into chunks
    const chunkedDocs = await textSplitter.splitDocuments(docs);

    // Return the chunked documents
    return chunkedDocs;
  } catch (e) {
    // Log the error and throw a new error
    console.error(e);
    throw new Error("PDF docs chunking failed !");
  }
}
