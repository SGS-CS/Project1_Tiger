// Threads.js
import React, { useState } from 'react';

function Threads() {
  // Initial dummy data
  const [threads, setThreads] = useState([
    { id: 1, title: 'My First Thread', content: 'Hello everyone!', votes: 5 },
    { id: 2, title: 'React Tips', content: 'Share your best tips.', votes: 3 },
  ]);

  // Increment votes
  const upvote = (id) => {
    setThreads(threads.map((thread) =>
      thread.id === id ? { ...thread, votes: thread.votes + 1 } : thread
    ));
  };

  // Decrement votes
  const downvote = (id) => {
    setThreads(threads.map((thread) =>
      thread.id === id ? { ...thread, votes: thread.votes - 1 } : thread
    ));
  };

  return (
    <div>
      <h2>Threads</h2>
      {threads.map((thread) => (
        <div key={thread.id} className="thread-card">
          <h3>{thread.title}</h3>
          <p>{thread.content}</p>
          <p>Votes: {thread.votes}</p>
          <button onClick={() => upvote(thread.id)}>Upvote</button>
          <button onClick={() => downvote(thread.id)}>Downvote</button>
        </div>
      ))}
    </div>
  );
}

export default Threads;
