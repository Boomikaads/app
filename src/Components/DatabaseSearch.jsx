import React, { useState } from 'react';
import './DatabaseSearch.css';

const DatabaseSearch = () => {
  const [checkboxes, setCheckboxes] = useState({
    Legislature: false,
    Executive: false,
    Judiciary: false,
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const backendUrl = 'https://backend-one-olive.vercel.app'; // Deployed backend URL

  const handleCheckboxChange = async (event) => {
    const { name, checked } = event.target;
    setCheckboxes((prevCheckboxes) => ({
      ...prevCheckboxes,
      [name]: checked,
    }));

    try {
      const response = await fetch(`${backendUrl}/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database: name, action: checked ? 'connect' : 'disconnect' }),
      });
      const data = await response.json();
      setStatusMessage(data.message);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.log('Error:', error);
      setStatusMessage('Error connecting to the database');
    }
  };

  const handleSearchClick = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setError(null);
      setHasSearched(true); // Set to true when a search is performed
      const response = await fetch(`${backendUrl}/search?query=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching search results:', err.message);
      setError('Error fetching search results');
    }
  };

  return (
    <div className="database-search">
      <h2>Database Search</h2>
      <p>
        Search the Constituent Assembly Debates, Historical Constitutions, 
        Constituent Assembly Committee Reports, and the Constitution of India 1950. 
        For other pages, use the <a href="#">Website Search</a>.
      </p>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Type a keyword or a phrase"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearchClick}>Search</button>

        {/* Display "No results found" message beside the search box */}
        {hasSearched && articles.length === 0 && !error && (
          <span style={{ color: 'red', marginLeft: '10px' }}>No results found</span>
        )}
      </div>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="database-selector">
        <h3>Select Databases:</h3>
        {Object.keys(checkboxes).map((name) => (
          <div key={name}>
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={checkboxes[name]}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={name}>{name}</label>
          </div>
        ))}
        <div className="status-message">
          {statusMessage && <p>{statusMessage}</p>}
        </div>
      </div>

      <div className="search-options">
        <label>Search By: </label>
        <select>
          <option>Any Word</option>
          <option>All Words</option>
        </select>
        <label>Sort By: </label>
        <select>
          <option>Relevant Paragraph</option>
          <option>Newest</option>
        </select>
      </div>

      <div className="search-results">
        {/* Display search results */}
        <div>
          {articles.length > 0 && articles.map((result, index) => (
            <div key={index} className="article" style={{ marginBottom: '20px' }}>
              <h3>{result.article_number}</h3>
              <h2>{result.title}</h2>
              <p>{result.content}</p>
              <p>
                <strong>Source:</strong> {result.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSearch;
