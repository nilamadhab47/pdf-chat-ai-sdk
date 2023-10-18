import { ChatGPTMessage } from "@/types";
import { Message } from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Function to merge class names for styling purposes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to delay execution for a specified amount of milliseconds
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to scroll to the bottom of a container, useful for chat interfaces
export function scrollToBottom(containerRef: React.RefObject<HTMLElement>) {
  if (containerRef.current) {
    const lastMessage = containerRef.current.lastElementChild;
    if (lastMessage) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "end",
      };
      lastMessage.scrollIntoView(scrollOptions);
    }
  }
}

// Function to format chat history into a readable format
export const formatChatHistory = (chatHistory: [string, string][]) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
  );

  return formattedDialogueTurns.join("\n");
};

// Function to format text by removing unnecessary spaces and joining hyphenated words
export function formattedText(inputText: string) {
  return inputText
    .replace(/\n+/g, " ") // Replace multiple consecutive new lines with a single space
    .replace(/(\w) - (\w)/g, "$1$2") // Join hyphenated words together
    .replace(/\s+/g, " "); // Replace multiple consecutive spaces with a single space
}

// Initial message displayed by the assistant
export const initialMessages: Message[] = [
  {
    role: "assistant",
    id: "0",
    content:
      "Hi! I am your PDF assistant",
  },
];

interface Data {
  sources: string[];
}

// Function to map the sources with the right ai-message based on role and index
export const getSources = (data: Data[], role: string, index: number) => {
  if (role === "assistant" && index >= 2 && (index - 2) % 2 === 0) {
    const sourcesIndex = (index - 2) / 2;
    if (data[sourcesIndex] && data[sourcesIndex].sources) {
      return data[sourcesIndex].sources;
    }
  }
  return [];
};
