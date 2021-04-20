// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if(Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch(error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if(Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if(headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch(error) {
                cb(error);
            }
        },
    };
}
// Init http module
const http = customHttp();

const newsService = (function() {
    const apiKey = "d84f58168051b69d9f337c48a16b157c";
    const apiUrl = 'https://gnews.io/api/v4';

    return {
        topHeadlines(country = "ru", cb) {
            http.get(`https://gnews.io/api/v4/top-headlines?lang=${country}&token=${apiKey}`, cb); //it's working
        },
        everything(query, cb) {
            http.get(`${apiUrl}/search?q=${query}&token=${apiKey}`, cb);


        },
    }

})();

//ELements forms
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];


form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function() {

    M.AutoInit();
    loadNews();
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
});

//Load News
function loadNews() {
    showLoader();
    const country = countrySelect.value;
    const searchText = searchInput.value;
    if(!searchText) {
        newsService.topHeadlines(country, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse);

    }


};

function onGetResponse(err, res) {

    removePreLoader();
    if(err) {
        showAlert(err, 'error-msg');
        return;
    }

    if(!res.articles.length) {
        //show empty message
        return;
    }
    renderNews(res.articles);
}

function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');
    if(newsContainer.children.length) {
        clearContainer(newsContainer);
    }
    let fragment = '';

    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });
    newsContainer.insertAdjacentHTML('afterbegin', fragment)
}

//function clearContainer
function clearContainer(container) {
    let child = container.lastElementChild;
    while(child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

//News item template function
function newsTemplate({ image, title, url, publishedAt, description }) {
    return `
      <div class="col s12">
        <div class="card">
          <div class="card-image">
            <img src="${image}">
            <span class="card-title">${title || ''}</span>
          </div>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <span class="right-align btn text-white date">
           Дата публикации: ${publishedAt.slice(0, 10)}</span>
           <a href="${url}" class="btn">Подробнее</a>
        </div>
      </div>

    `;

}

function showAlert(msg, type = 'success') {
    M.toast({ html: msg, classes: type });
}

//show loader function
function showLoader() {
    document.body.insertAdjacentHTML('afterbegin',
        `
    <div class="progress">
        <div class="indeterminate"></div>
    </div>
    `);
}

//remove loader functi
function removePreLoader() {
    const loader = document.querySelector('.progress');
    if(loader) {
        loader.remove();
    }
}

//