import React, { useState } from 'react';
import { api } from '../services/api';
import { Bot, Send, Sparkles, User, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your **NEXUS AI Operations Assistant**.
I continuously analyze system telemetry, ITIL knowledge runbooks, active incident queues, and CI/CD pipelines.

How can I assist your IT operations & DevOps team today?`,
      suggestedActions: [
        'How to resolve PostgreSQL deadlocks?',
        'Draft P1 incident post-mortem',
        'Summarize critical infrastructure alerts',
        'Explain CI/CD release pipeline stages',
        'How are Jira work items linked to deployments?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    const userMsg = { sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendCopilotPrompt(prompt);
      const aiMsg = {
        sender: 'ai',
        text: res.response,
        suggestedActions: res.suggestedActions || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '⚠️ Error reaching AI engine: ' + err.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 62px)', padding: '1.25rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.55rem',
          borderRadius: '10px',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.4)'
        }}>
          <Bot size={24} color="#C084FC" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
            AI Operations & Incident Copilot
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>
            Query runbooks, diagnose root causes, generate incident post-mortems, and execute resolution playbooks
          </p>
        </div>
      </div>

      {/* Chat Viewport Card */}
      <div className="basic-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={16} color="white" />
                </div>
              )}

              <div style={{
                background: msg.sender === 'user' ? 'rgba(56, 189, 248, 0.15)' : '#0F172A',
                border: msg.sender === 'user' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid #1E293B',
                borderRadius: '0.75rem',
                padding: '0.85rem 1.15rem',
                color: '#F8FAFC',
                fontSize: '0.86rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(action)}
                        style={{
                          background: 'rgba(168, 85, 247, 0.15)',
                          border: '1px solid rgba(168, 85, 247, 0.35)',
                          color: '#D8B4FE',
                          borderRadius: '16px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#38BDF8'
                }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={16} color="white" />
              </div>
              <span className="problem-spin">⚙️</span> Analyzing IT operations knowledge base...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', background: '#0F172A' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.65rem' }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Ask Copilot: 'How to scale Kubernetes ingress?', 'Diagnose DB deadlock', etc..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ background: '#0B1120', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ padding: '0 1.25rem' }}
            >
              <Send size={15} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
