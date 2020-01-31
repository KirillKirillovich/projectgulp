const initSearch = () => {
  const renderResults = (data) => {
    let resultLayout = '';
    const resultsRoot = document.querySelector('.search-results');
    const createResultsLayout = resultsHtml => `<div class="search-results">${resultsHtml}</div>`;

    data.forEach(dataItem => {
      resultLayout += `<div class="search-results-item" id="${dataItem.id}">
        <h3>${dataItem.title}</h3>
        <p>${dataItem.body}</p>
       </div>`;
    });
    const resultsLayout = createResultsLayout(resultLayout);

    if (!resultsRoot) {
      document.querySelector('.search-form')
        .insertAdjacentHTML('afterEnd', resultsLayout);
    } else {
      resultsRoot.remove();
      document.querySelector('.search-form')
        .insertAdjacentHTML('afterEnd', resultsLayout);
    }
  };

  const searchRequest = () => {
    // const searchInput = document.querySelector('#search-input');

    const searchDate = fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'GET'
      // body: searchInput.value
    });

    searchDate.then(response => response.json())
      .then(json => renderResults(json));
  };

  const initAddListener = () => {
    const addButton = document.querySelector('#search-btn');

    if (addButton) {
      addButton.addEventListener('click', searchRequest);
    }
  };

  initAddListener();
};


export { initSearch };
