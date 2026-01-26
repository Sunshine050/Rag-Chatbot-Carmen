import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-blue-800">RAG Chatbot for BlueLedgers</h1>
        <ChatInterface />
        <div className="mt-8 text-gray-500 text-center">
          <p>Powered by Next.js, NestJS, Ollama, and ChromaDB</p>
          <p className="text-xs mt-2">On-Premise & Secure Documentation Hub</p>
        </div>
      </div>
    </main>
  );
}
