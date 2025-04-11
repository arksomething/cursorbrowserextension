import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-light.css';
import "./MarkdownRenderer.css"

import { useState } from 'react';

const CodeBlock = ({ language, value, handleCopy, applyCode, onCodeApplied, data }) => {
  const [codeStatus, setCodeStatus] = useState("Apply");
  const [copyStatus, setCopyStatus] = useState("Copy");

  const handleApply = () => {
    applyCode();
    setCodeStatus("Applied!");
    if (onCodeApplied) {
      onCodeApplied();
    }
    setTimeout(() => setCodeStatus("Apply"), 2000);
  };

  const handleCopyClick = () => {
    handleCopy();
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy"), 2000);
  };

  if (language === "text") {
    return (
      <div className="text-block">
        <div className="code-header">
          <p>markdown</p>
          <div className="code-header-right">
            <button className='code-button code-pre' onClick={handleCopyClick}>{copyStatus}</button>
            <button className={`code-button code-pre ${!data.targetEditable ? "disabled" : ""}`} onClick={handleApply}>{data.targetEditable ? codeStatus : "Select Field"}</button>
          </div>
        </div>
        <div className="text-content">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      </div>
    );
  }

  if (language === "plaintext") {
    return (
      <pre className="code-content-inline code-pre" style={{ display: "inline" }}>
        <code>{value}</code>
      </pre>
    );
  }

  return (
    <div className="code-block">
      <div className="code-header">
        <p>{language}</p>
        <div className="code-header-right">
          <button className='code-button code-pre' onClick={handleCopyClick}>{copyStatus}</button>
          <button className={`code-button code-pre ${!data.targetEditable ? "disabled" : ""}`} onClick={handleApply}>{data.targetEditable ? codeStatus : "Select Field"}</button>
        </div>
      </div>
      <pre className="code-content code-pre">
        <code>{value}</code>
      </pre>
    </div>
  );

};

// MarkdownRenderer component
const MarkdownRenderer = ({ content, onCodeApplied, data }) => {

  const transformMathDelimiters = (text) => {
    return text
      .replace(/\\\(/g, '$')   // Replace \( with $
      .replace(/\\\)/g, '$')   // Replace \) with $
      .replace(/\\\[\s*/g, '$$\n') // Replace \[ with $$ and ensure newline
      .replace(/\s*\\\]/g, '\n$$') // Replace \] with $$ and ensure newline
      .replace(/\$\$\s*\n/g, '$$\n') // Remove extra spaces after block math open
      .replace(/\n\s*\$\$/g, '\n$$'); // Remove extra spaces before block math close
  };

  const extractText = (node) => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && node.props && node.props.children) {
      return extractText(node.props.children);
    }
    return '';
  };

  const handleCopy = async (children) => { 
    try {
      const text = extractText(children);
      navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const applyCode = async (children) => { 
    try {
        const message = { code: extractText(children) };
        chrome.runtime.sendMessage(message, (response) => {
            console.log("Response from content script:", response);
            if (onCodeApplied) {
                onCodeApplied(response);
            }
        });
    } catch (err) {
        console.error('Failed to apply code: ', err);
        if (onCodeApplied) {
            onCodeApplied({ status: "Error applying code" });
        }
    }
  };

  return (
    <ReactMarkdown
      children={transformMathDelimiters(content)}
      content={content}
      remarkPlugins={[remarkMath]}  
      rehypePlugins={[
        rehypeKatex, 
        [rehypeHighlight, {
          detect: true,
          ignoreMissing: true
        }]
      ]} 
      components={{
        code({ node, inline, className, children, ...props }) {
          const language = className?.replace('language-', '').replace('hljs ', '') || 'plaintext';
          return <CodeBlock language={language} value={children} 
            handleCopy={() => handleCopy(children)}
            applyCode={() => applyCode(children)}
            onCodeApplied={onCodeApplied}
            data={data}
          />;
        },
      }}
    />
  );
};

export default MarkdownRenderer;
