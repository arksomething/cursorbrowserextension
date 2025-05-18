import './Sidebar.css';
import TextareaAutosize from 'react-textarea-autosize';
import { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import Dropdown from './Dropdown';
import TabIcon from './TabIcon';
import { useAuth } from './AuthContext';
import Inspo from './Inspo';
import resetIcon from './assets/system-uicons_reset-alt.svg';

const DEFAULT_SYSTEM_PROMPT = `When writing some text that is meant to be copied, like a sample document
or a blurb of text to be pasted in or inserted into a form, format it 
like code with the language named "text". Do this whenever
the user wants you to write something that they might want to insert into 
the webpage. DO NOT DO THIS FOR CODE, AS THAT CAN ALREADY BE COPY/PASTED EASILY.

Some examples of times you might do this include:
When the user asks you to write a comment while on a reddit page
When the user asks you to write a short story or paragraph
When the user asks you to write a tweet or X post
When the user wants a response for an email
When the user needs a snippet for a blog post
When the user asks for a LinkedIn post`;

const Sidebar = ({ data, setRoute }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [activeText, setActiveText] = useState('');
  const [tabText, setTabText] = useState('');
  const [messages, setMessages] = useState([]); 
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4.1-nano');
  const [messageProcessing, setMessageProcessing] = useState(false);
  const [isDefaultPrompt, setIsDefaultPrompt] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [isLoaded, setIsLoaded] = useState(false);
  const abortControllerRef = useRef(null);

  const { user, loading } = useAuth();

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const modelOptions = [
    { value: 'openai/gpt-4o-mini', plan: 'Free', label: 'gpt-4o-mini' },
    { value: 'openai/gpt-4.1-nano', plan: 'Free', label: 'gpt-4.1-nano' },
    { value: 'google/gemini-2.0-flash-lite-001', plan: 'Free', label: 'gemini-2.0-lite' },
    { value: 'openai/gpt-4.1-mini', plan: 'Plus', label: 'gpt-4.1-mini' },
    { value: 'openai/gpt-4.1', plan: 'Plus', label: 'gpt-4.1' },
    { value: 'openai/gpt-4o-mini-search-preview', plan: 'Plus', label: 'gpt-4o-mini-search' },
    { value: 'openai/gpt-4o-search-preview', plan: 'Plus', label: 'gpt-4o-search' },
    { value: 'anthropic/claude-3.7-sonnet', plan: 'Plus', label: 'claude-3.7-sonnet' },
    { value: 'anthropic/claude-3.7-sonnet:thinking', plan: 'Plus', label: 'claude-3.7-sonnet-thinking' },
    { value: 'anthropic/claude-3.5-sonnet', plan: 'Plus', label: 'claude-3.5-sonnet' },
    { value: 'google/gemini-2.0-flash-001', plan: 'Plus', label: 'gemini-2.0-flash' },
    { value: 'google/gemini-2.5-flash-preview', plan: 'Plus', label: 'gemini-2.5-flash' },
    { value: 'openai/o4-mini', plan: 'Plus', label: 'o4-mini' },
    { value: 'x-ai/grok-3-mini-beta', plan: 'Plus', label: 'grok-3-mini' },
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

  // Add loaded class after initial render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Update system prompt when expert mode changes
  useEffect(() => {
    setSystemPrompt(isDefaultPrompt ? DEFAULT_SYSTEM_PROMPT : 'You are an intelligent assistant.');
  }, [isDefaultPrompt]);

  const handleModelChange = (value) => {
    setSelectedModel(value);
  };

  const stopMessageStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setMessageProcessing(false);
    }
  };

  const sendMessage = async (promptText) => {
    try {
      // Stop any existing message stream and wait for cleanup
      if (messageProcessing && abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setMessageProcessing(false);
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setMessageProcessing(true);
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      const idToken = await user.getIdToken();
      setMessages(prevMessages => [...prevMessages, {role:"user", content: promptText}]);

      const response = await fetch("https://routerendpoint-n3piq2jhqq-uc.a.run.app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
            "Authorization": `Bearer ${idToken}`        },
        body: JSON.stringify({ 
          tab: tabText, 
          selected: selectedText, 
          userPrompt: promptText, 
          messages,
          model: selectedModel,
          systemPrompt: systemPrompt
        }),
        signal: abortControllerRef.current.signal
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
            console.log(chunk)
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
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching stream:', error);
      }
    } finally {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      setMessageProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    const promptText = prompt;
    setPrompt(""); // Clear input immediately
    textareaRef.current?.focus(); // Keep focus on textarea
    await sendMessage(promptText);
  };

  // Utility function to format the selected text
  const formatSelectedText = (text) => {
    const maxLength = 20;
    if (text.length <= maxLength) {
      return text; // Return the text as is if it's within the limit
    }
    const startLength = Math.floor((maxLength - 3) / 2); // 3 for the ellipsis
    const endLength = maxLength - startLength - 3; // Remaining characters for the end
    return text.substring(0, startLength) + '...' + text.substring(text.length - endLength);
  };

  const handleExampleClick = async (exampleText) => {
    await sendMessage(exampleText);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-body">
        <div className='sidebar-header'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="reset-prompts" 
              onClick={() => {
                setMessages([]);
                setPrompt('');
              }}
            >
              <img src={resetIcon} alt="Reset chat" />
            </button>
            <div className={`toggle-switch ${isLoaded ? 'loaded' : ''}`}>
              <input
                type="checkbox"
                id="expert-mode"
                checked={isDefaultPrompt}
                onChange={(e) => setIsDefaultPrompt(e.target.checked)}
              />
              <label htmlFor="expert-mode"></label>
              <span>Apply</span>
            </div>
          </div>
          <div className='sidebar-header-right'>
            <button className="main-button premium-button" onClick={() => setRoute("Subscribe")}>Premium</button>
            <button className="main-button" onClick={() => setRoute("User")}>User</button>
          </div>
        </div>
        <div className="messages-main-wrapper">
          <div className="messages-wrapper">
            {messages.length === 0 ? (
              <Inspo onExampleClick={handleExampleClick} />
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={msg.role === "user" ? 'message-user' : 'message-assistant'}>
                  <MarkdownRenderer 
                    content={msg.content}
                    data={data}
                    onCodeApplied={(response) => {
                      console.log('Code application response:', response);
                    }}
                  />
                </div>
              ))
            )}
            {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            
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
                <div className='input-bottom-middle'>
                  <TabIcon data={data}/>
                  {selectedText && (
                    <p className='input-selected-text'>"{formatSelectedText(selectedText)}"</p>
                  )}
                </div>
              </div>
              {messageProcessing ? (
                <button type="button" onClick={stopMessageStream} className='main-button'>Stop</button>
              ) : (
                <button type="submit" className='main-button' disabled={!prompt.trim()}>Send</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;



