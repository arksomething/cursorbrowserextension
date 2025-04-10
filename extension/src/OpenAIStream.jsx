import { useEffect, useState } from "react";

const OpenAIStream = () => {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await fetch("https://streamendpoint-n3piq2jhqq-uc.a.run.app", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Accept": "text/event-stream"
          },
          body: JSON.stringify({ tab: "tabText", selected: "selectedText", userPrompt: "tell me a joke", messages: [] })
        });
  
        if (!response.body) throw new Error('ReadableStream not supported in this browser.');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
  
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
              const chunk = decoder.decode(value, { stream: true });
              // const parsedData = JSON.parse(chunk);   
              setResponse(prev => prev + chunk)                   
          
          }
        }
      } catch (error) {
        console.error('Error fetching stream:', error);
      }
    };
  
    fetchStream();
  }, []);
  
    return (
        <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-bold">AI Response:</h2>
            <pre className="text-gray-700 whitespace-pre-wrap">{response}</pre>
        </div>
    );
};

export default OpenAIStream;