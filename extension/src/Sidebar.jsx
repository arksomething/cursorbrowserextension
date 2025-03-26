import './Sidebar.css';
import TextareaAutosize from 'react-textarea-autosize';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'


const Sidebar = ({ data }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [tabText, setTabText] = useState('');
  const [messages, setMessages] = useState([]); 

  const textareaRef = useRef(null);

  // Update prompt when data changes
  useEffect(() => {
    if (data) {
      console.log(data.tabText)
      setSelectedText(data.selectedText);
      setTabText(data.tabText);
    }
  }, [data]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setMessages(prevMessages => [...prevMessages, {role:"user", content: prompt}]);

    const fetchStream = async () => {
      try {
        const response = await fetch("https://streamendpoint-n3piq2jhqq-uc.a.run.app", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Accept": "text/event-stream"
          },
          body: JSON.stringify({ tab: tabText, selected: selectedText, userPrompt: prompt, messages })
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
              const chunk = decoder.decode(value, { stream: true })
              setMessages(prevMessages => {
                if (prevMessages.length === 0) {
                  return [...prevMessages, { role: "assistant", content: "" }]
                } else {
                  const previousRole = prevMessages[prevMessages.length - 1].role
                  const previousContent = prevMessages[prevMessages.length - 1].content

                  if (previousRole === "user") {
                    return [...prevMessages, { role: "assistant", content: chunk }]
                  } else {
                    const updatedItems = [...prevMessages];
                    updatedItems[updatedItems.length - 1] = { 
                        ...updatedItems[updatedItems.length - 1], 
                        content: previousContent + chunk 
                    };
                    return updatedItems;
                  }
                }
              })
          }
        }
      } catch (error) {
        console.error('Error fetching stream:', error);
      }
    };
  
    fetchStream();
    setPrompt("");
  };



  // Utility function to format the selected text
  const formatSelectedText = (text) => {
    const maxLength = 30;
    if (text.length <= maxLength) {
      return text; // Return the text as is if it's within the limit
    }
    // Calculate the number of characters to keep at the start and end
    const startLength = Math.floor((maxLength - 3) / 2); // 3 for the ellipsis
    const endLength = maxLength - startLength - 3; // Remaining characters for the end
    return text.substring(0, startLength) + '...' + text.substring(text.length - endLength);
  };

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '100%',
      height: '100vh',
      background: 'white',
      boxShadow: '-2px 0px 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 99999,
      overflow: 'auto',
      
    }}>
      <div style={{ flex: 1 }}>
        <h2 style={{
          margin: '1em'
        }}>Chat</h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1em',
          padding: '1em',
          overflowY: 'auto',
          maxHeight: '60vh'
        }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              textAlign: msg.role === "user" ? 'right' : 'left',
            }}>
              <ReactMarkdown children={msg.content}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5em',
        backgroundColor: '#ffffff',
        padding: '1em',
        borderRadius: '8px',
        margin: '4px',
        border: '1px solid #000000'
      }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5em'
          }}>
            <TextareaAutosize
              ref={textareaRef}
              maxRows={5}
              minRows={1}
              placeholder="Plan, build, write anything"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '10px',
                border: 'none',
                outline: 'none',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'none'
              }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1em'
              }}>
                <p>gpt-4o-mini</p>
                {selectedText && (
                  <p>"{formatSelectedText(selectedText)}"</p>
                )}
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                disabled={!prompt.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;


