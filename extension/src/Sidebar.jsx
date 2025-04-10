import './Sidebar.css';
import TextareaAutosize from 'react-textarea-autosize';
import { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import Dropdown from './Dropdown';
import TabIcon from './TabIcon';
import { useAuth } from './AuthContext';



const Sidebar = ({ data, setRoute }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [activeText, setActiveText] = useState('');
  const [tabText, setTabText] = useState('');
  const [messages, setMessages] = useState([]); 
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  
  const { user, loading } = useAuth();

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const modelOptions = [
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'gpt-4', label: 'gpt-4' },
    { value: 'gpt-4o', label: 'gpt-4o' }
  ];
  
  // Update prompt when data changes
  useEffect(() => {
    if (data) {
      setSelectedText(data.selectedText);
      setTabText(data.tabText);
      setActiveText(data.activeText);
    }
  }, [data]);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        if (textareaRef.current && document.visibilityState === 'visible') {
          textareaRef.current.focus();
          console.log('Textarea focused');
          clearInterval(interval);
        }
      }, 500); // Retry every 500ms
      
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [loading]); // Only try to focus when `loading` changes

  const handleModelChange = (value) => {
    setSelectedModel(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const idToken = await user.getIdToken();
    console.log(idToken);

    setMessages(prevMessages => [...prevMessages, {role:"user", content: prompt}]);

    const fetchStream = async () => {
      try {
        const response = await fetch("https://streamendpoint-n3piq2jhqq-uc.a.run.app", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Accept": "text/event-stream",
              "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ 
            tab: tabText, 
            selected: selectedText, 
            userPrompt: prompt, 
            messages,
            model: selectedModel 
          })
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
    const maxLength = 20;
    if (text.length <= maxLength) {
      return text; // Return the text as is if it's within the limit
    }
    // Calculate the number of characters to keep at the start and end
    const startLength = Math.floor((maxLength - 3) / 2); // 3 for the ellipsis
    const endLength = maxLength - startLength - 3; // Remaining characters for the end
    return text.substring(0, startLength) + '...' + text.substring(text.length - endLength);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-body">
        <div className='sidebar-header'>
          <h2>Chat</h2>
          <div className='sidebar-header-right'>
            <button onClick={() => setRoute("User")}>User</button>
          </div>
        </div>
        <div className="messages-main-wrapper">
          <div className="messages-wrapper">
            {messages.map((msg, index) => (
              <div key={index} style={{
                textAlign: msg.role === "user" ? 'right' : 'left',
              }}>
                <MarkdownRenderer 
                  content={msg.content}
                  onCodeApplied={(response) => {
                    console.log('Code application response:', response);
                  }}
                />
              </div>
            ))}
            <div style={{ height: '100px' }}></div>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="input-wrapper" >
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="input-wrapper-2">
            <TextareaAutosize
              ref={textareaRef} maxRows={5} minRows={1} placeholder="Plan, build, write anything" className="chat-input" value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="input-bottom">
              <div className="input-bottom-left" >
                <Dropdown
                  options={modelOptions}
                  value={selectedModel}
                  onChange={handleModelChange}
                  placeholder="Select a model"
                />
                <TabIcon data={data}/>
                {selectedText && (
                  <p>"{formatSelectedText(selectedText)}"</p>
                )}
              </div>
              <button
                type="submit"
                className='send-button'
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


