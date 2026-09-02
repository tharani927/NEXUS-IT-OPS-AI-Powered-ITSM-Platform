import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  User,
  CheckCircle,
  Sparkles,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

export default function KnowledgeBase({ onOpenCopilotWithPrompt }) {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState(null);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getKnowledgeBase({
        category: selectedCategory,
        search: searchTerm
      });
      setArticles(data);
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArticles();
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <BookOpen size={14} />
            ITIL RUNBOOKS & KNOWLEDGE ARTICLES
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Knowledge Base & Resolution Playbooks
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Verified engineering runbooks, database lock resolution guides, and automated remediation playbooks
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="basic-card" style={{ padding: '0.85rem 1.15rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search runbooks by keyword, error code, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="All">All Categories</option>
              <option value="Database">Database</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Security & Identity">Security & Identity</option>
              <option value="Network Operations">Network Operations</option>
              <option value="DevOps & Containers">DevOps & Containers</option>
            </select>

            <button type="submit" className="btn btn-primary">
              <Search size={14} /> Search
            </button>
          </div>
        </form>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading runbooks...</div>
      ) : articles.length === 0 ? (
        <div className="basic-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          No knowledge articles found matching your query.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
          {articles.map((art) => (
            <div
              key={art.id}
              className="basic-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => setActiveArticle(art)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}>
                    {art.id}
                  </span>
                  <span className="badge badge-p3">
                    {art.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {art.title}
                </h3>

                <p style={{ fontSize: '0.76rem', color: '#94A3B8', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  {art.rootCause}
                </p>

                {art.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {art.tags.map((tag, tIdx) => (
                      <span key={tIdx} style={{ fontSize: '0.65rem', background: '#0B1120', border: '1px solid #1E293B', color: '#94A3B8', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #1E293B', fontSize: '0.7rem', color: '#64748B' }}>
                <span>Author: {art.author || 'Platform Ops'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#38BDF8', fontWeight: 600 }}>
                  View Runbook <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {activeArticle && (
        <div className="modal-overlay" onClick={() => setActiveArticle(null)}>
          <div className="modal-content" style={{ width: 'min(750px, 95%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}>
                  {activeArticle.id} • {activeArticle.category}
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', marginTop: '0.2rem' }}>
                  {activeArticle.title}
                </h2>
              </div>
              <button onClick={() => setActiveArticle(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Root Cause Hypothesis Box */}
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Root Cause Diagnosis
                </div>
                <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                  {activeArticle.rootCause}
                </p>
              </div>

              {/* Step-by-Step Playbook Resolution */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                  ⚙️ Standard Operating Resolution Procedure
                </h4>
                <pre style={{
                  background: '#0B1120',
                  border: '1px solid #1E293B',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: '#38BDF8',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5
                }}>
                  {activeArticle.resolution}
                </pre>
              </div>

              {/* Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#0F172A', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1E293B', fontSize: '0.72rem', color: '#94A3B8' }}>
                <div><strong>Assigned Team:</strong> {activeArticle.team}</div>
                <div><strong>Author:</strong> {activeArticle.author}</div>
                <div><strong>Updated:</strong> {activeArticle.updatedAt}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveArticle(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
