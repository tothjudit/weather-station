function SearchBar({ city, setCity, handleSearch, isLoading }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Enter a city name"
        aria-label="Enter a city name"
      />

      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Search"}
      </button>
    </form>
  );
}

export default SearchBar;