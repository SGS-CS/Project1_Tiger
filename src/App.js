import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import conf1 from './assets/conf1.png';
import conf2 from './assets/conf2.png';
import conf3 from './assets/conf3.png';

function Header({ onCreate, onAccountSettings }) {
  return (
    <header className="navbar">
      <div className="nav-left">
        <span className="logo">Geggit</span>
      </div>
      <div className="nav-right">
        <button onClick={onCreate}>Create</button>
        <button onClick={onAccountSettings}>Account Settings</button>
      </div>
    </header>
  );
}

function Sidebar({ topThreads }) {
  return (
    <aside className="sidebar">
      <ul>
        <li><a href="#home">Home</a></li>
      </ul>
      <h3>Recently Upvoted</h3>
      <ul>
        {topThreads.map(thread => (
          <li key={thread.id}>{thread.title} ({thread.votes})</li>
        ))}
      </ul>
    </aside>
  );
}

function Confetti() {
  const images = [conf1, conf2, conf3];
  return (
    <div className="confetti-container">
      {Array.from({ length: 20 }).map((_, i) => {
        const img = images[Math.floor(Math.random() * images.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const scale = 0.5 + Math.random() * 0.5;
        return (
          <img
            key={i}
            src={img}
            alt="confetti"
            className="confetti"
            style={{ left: `${left}%`, animationDelay: `${delay}s`, transform: `scale(${scale})` }}
          />
        );
      })}
    </div>
  );
}

function Feed({ threads, onUpvote, onDownvote, searchTerm, setSearchTerm, sortOrder, setSortOrder, confettiThreads, onOpenThread }) {
  return (
    <main className="main">
      <div className="search-sort">
        <input
          type="text"
          placeholder="Search threads..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="mostUpvotes">Most Upvotes</option>
          <option value="leastUpvotes">Least Upvotes</option>
        </select>
      </div>
      <div className="thread-list">
        {threads.map(thread => (
          <div className="thread-item" key={thread.id}>
            <h3>{thread.title}</h3>
            <p>{thread.content}</p>
            <div className="votes">
              <button onClick={() => onUpvote(thread.id)} className={thread.userVote === 'up' ? 'active' : ''}>
                Upvote
              </button>
              <button onClick={() => onDownvote(thread.id)} className={thread.userVote === 'down' ? 'active' : ''}>
                Downvote
              </button>
              <span>{thread.votes} votes</span>
            </div>
            <button className="open-btn" onClick={() => onOpenThread(thread)}>Open</button>
            {confettiThreads[thread.id] && <Confetti />}
          </div>
        ))}
      </div>
    </main>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CreateThreadModal({ newTitle, newContent, setNewTitle, setNewContent, onSubmit, onCancel }) {
  return (
    <Modal onClose={onCancel}>
      <h2>Create a Thread</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
        </div>
        <div>
          <label>Content:</label>
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} />
        </div>
        <button type="submit">Create</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </Modal>
  );
}

function AccountSettingsModal({ username, setUsername, bio, setBio, onSave, onCancel }) {
  return (
    <Modal onClose={onCancel}>
      <h2>Account Settings</h2>
      <form onSubmit={onSave}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Bio:</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </Modal>
  );
}

function ThreadModal({ thread, onClose, onUpvote, onDownvote }) {
  const [commentSort, setCommentSort] = useState('mostUpvotes');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, text: "Great thread!", votes: 5, userVote: "none" },
    { id: 2, text: "I disagree", votes: 2, userVote: "none" },
    { id: 3, text: "Interesting perspective", votes: 3, userVote: "none" }
  ]);

  const commentUpvote = id => {
    setComments(comments.map(c =>
      c.id === id ? (c.userVote === 'up'
        ? { ...c, votes: c.votes - 1, userVote: 'none' }
        : c.userVote === 'down'
          ? { ...c, votes: c.votes + 2, userVote: 'up' }
          : { ...c, votes: c.votes + 1, userVote: 'up' })
        : c
    ));
  };

  const commentDownvote = id => {
    setComments(comments.map(c =>
      c.id === id ? (c.userVote === 'down'
        ? { ...c, votes: c.votes + 1, userVote: 'none' }
        : c.userVote === 'up'
          ? { ...c, votes: c.votes - 2, userVote: 'down' }
          : { ...c, votes: c.votes - 1, userVote: 'down' })
        : c
    ));
  };

  const addComment = e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const id = comments.length ? comments[comments.length - 1].id + 1 : 1;
    setComments([...comments, { id, text: newComment, votes: 0, userVote: 'none' }]);
    setNewComment('');
  };

  const sortedComments = useMemo(() =>
    [...comments].sort((a, b) =>
      commentSort === 'mostUpvotes' ? b.votes - a.votes : a.votes - b.votes
    ), [comments, commentSort]);

  return (
    <Modal onClose={onClose}>
      <div className="thread-modal">
        <h2>{thread.title}</h2>
        <p>{thread.content}</p>
        <div className="votes">
          <button onClick={() => onUpvote(thread.id)} className={thread.userVote === 'up' ? 'active' : ''}>
            Upvote
          </button>
          <button onClick={() => onDownvote(thread.id)} className={thread.userVote === 'down' ? 'active' : ''}>
            Downvote
          </button>
          <span>{thread.votes} votes</span>
        </div>
        <hr />
        <div className="comment-section">
          <h3>Comments</h3>
          <select value={commentSort} onChange={e => setCommentSort(e.target.value)}>
            <option value="mostUpvotes">Most Upvotes</option>
            <option value="leastUpvotes">Least Upvotes</option>
          </select>
          <div className="comments">
            {sortedComments.map(c => (
              <div key={c.id} className="comment">
                <p>{c.text}</p>
                <div className="comment-votes">
                  <button onClick={() => commentUpvote(c.id)} className={c.userVote === 'up' ? 'active' : ''}>
                    ▲
                  </button>
                  <span>{c.votes}</span>
                  <button onClick={() => commentDownvote(c.id)} className={c.userVote === 'down' ? 'active' : ''}>
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form className="add-comment" onSubmit={addComment}>
            <input type="text" placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} />
            <button type="submit">Post</button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

function App() {
  const [threads, setThreads] = useState([
    { id: 1, title: 'React Tips', content: 'Share your best tips', votes: 10, userVote: 'none' },
    { id: 2, title: 'First Thread', content: 'Hello world', votes: 5, userVote: 'none' },
    { id: 3, title: 'Favorite Tools', content: 'What are your favorite dev tools?', votes: 3, userVote: 'none' },
    { id: 4, title: 'Bugs', content: 'SPS!', votes: 0, userVote: 'none' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('mostUpvotes');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [username, setUsername] = useState('John Doe');
  const [bio, setBio] = useState('This is a filler bio.');
  const [confettiThreads, setConfettiThreads] = useState({});
  const [selectedThread, setSelectedThread] = useState(null);

  const handleUpvote = useCallback(id => {
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        if (t.userVote === 'up') return { ...t, votes: t.votes - 1, userVote: 'none' };
        if (t.userVote === 'down') return { ...t, votes: t.votes + 2, userVote: 'up' };
        const updated = { ...t, votes: t.votes + 1, userVote: 'up' };
        setConfettiThreads(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setConfettiThreads(prev => { const conf = { ...prev }; delete conf[id]; return conf; });
        }, 2000);
        return updated;
      }
      return t;
    }));
  }, []);

  const handleDownvote = useCallback(id => {
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        if (t.userVote === 'down') return { ...t, votes: t.votes + 1, userVote: 'none' };
        if (t.userVote === 'up') return { ...t, votes: t.votes - 2, userVote: 'down' };
        return { ...t, votes: t.votes - 1, userVote: 'down' };
      }
      return t;
    }));
  }, []);

  const handleCreateThread = useCallback(e => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const newThread = { id: threads.length + 1, title: newTitle, content: newContent, votes: 0, userVote: 'none' };
    setThreads(prev => [...prev, newThread]);
    setNewTitle(''); setNewContent(''); setShowCreateForm(false);
  }, [newTitle, newContent, threads.length]);

  const handleSaveAccountSettings = useCallback(e => {
    e.preventDefault();
    alert(`Profile updated:\nUsername: ${username}\nBio: ${bio}`);
    setShowAccountSettings(false);
  }, [username, bio]);

  const filtered = useMemo(() => threads.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  ), [threads, searchTerm]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => sortOrder === 'mostUpvotes' ? b.votes - a.votes : a.votes - b.votes), [filtered, sortOrder]);

  const topThreads = useMemo(() => [...threads].sort((a, b) => b.votes - a.votes).slice(0, 3), [threads]);

  return (
    <div className="container">
      <Header onCreate={() => setShowCreateForm(true)} onAccountSettings={() => setShowAccountSettings(true)} />
      <div className="content">
        <Sidebar topThreads={topThreads} />
        <Feed
          threads={sorted}
          onUpvote={handleUpvote}
          onDownvote={handleDownvote}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          confettiThreads={confettiThreads}
          onOpenThread={t => setSelectedThread(t)}
        />
      </div>
      {showCreateForm && <CreateThreadModal newTitle={newTitle} newContent={newContent} setNewTitle={setNewTitle} setNewContent={setNewContent} onSubmit={handleCreateThread} onCancel={() => setShowCreateForm(false)} />}
      {showAccountSettings && <AccountSettingsModal username={username} setUsername={setUsername} bio={bio} setBio={setBio} onSave={handleSaveAccountSettings} onCancel={() => setShowAccountSettings(false)} />}
      {selectedThread && <ThreadModal thread={selectedThread} onClose={() => setSelectedThread(null)} onUpvote={handleUpvote} onDownvote={handleDownvote} />}
    </div>
  );
}

export default App;
