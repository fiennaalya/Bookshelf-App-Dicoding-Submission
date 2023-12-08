const books = [];
const RENDER_EVENT = 'render-book';
const checkbox = document.getElementById("bookIsComplete");
const bookSubmitButton = document.getElementById("bookSubmit");
function toggleRateElement(){
    const rateElement = document.getElementById("element-rate");
    if(checkbox.checked){
        rateElement.removeAttribute('hidden');
        updateRatingOutput();
    } else{
        rateElement.setAttribute('hidden', 'true');
    }

}

function updateRatingOutput() {
    const ratingOutput = document.getElementById("ratingOutput");
    const ratingInput = document.getElementById("rating");

    if ((ratingInput.value)== 1){
        ratingOutput.textContent = ratingInput.value + " Star";
    } else {
        ratingOutput.textContent = ratingInput.value + " Stars";
    }

}

checkbox.addEventListener('change', function() {
    updateButtonText();
});

document.addEventListener('DOMContentLoaded', function(){
    const bookForm = document.getElementById('form-data-buku');
    bookForm.addEventListener('submit', function(event){
        event.preventDefault();
        addBookData();
        resetForm(bookForm);
        updateButtonText();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
    updateButtonText();
});

async function addBookData() {
    const titleBook = document.getElementById('title').value; 
    const authorBook = document.getElementById('author').value;
    const yearBook = document.getElementById('year').value;
    var yearNumber = parseInt(yearBook, 10);
    let categoryBook = document.getElementById('category').value;
    if (categoryBook.value === ""){
        categoryBook.value = null;
    }
    let coverBook = document.getElementById('bookCover').value;
    let rateBook = document.getElementById('rating').value;
    let isBoolean = true;
    if(!checkbox.checked){
        rateBook = "0";
        isBoolean = false;
    } 

    const generateBookID = generateID();
    const bookObject = await generateBookObject(generateBookID, titleBook, authorBook, categoryBook, yearNumber, coverBook, rateBook, isBoolean);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateID(){
    return +new Date();
}

function resetForm(form) {
    form.reset(); 

    const rateOutput = document.getElementById('ratingOutput');
    const rateElement = document.getElementById('element-rate');

    rateOutput.textContent = '';
    rateElement.setAttribute('hidden', 'true');
}

function updateButtonText() {
    if (checkbox.checked) {
        bookSubmitButton.textContent = "Add Finished Book";
    } else {
        bookSubmitButton.textContent = "Add to the Library";
    }
}

async function isLinkValid(url, expectedImageTypes = ['image/jpeg', 'image/png', 'image/gif']) {
    if (url === "") {
        url= "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg"
        return false;
    }

    if (!url.startsWith("https://") && !url.startsWith("http://")) {
        url = "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg";
        return false;
    }
    
    try {
        const response = await fetch(url, { method: 'HEAD' });

        if (!response.ok) {
            url= "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg"
            return false;
        }

        const contentType = response.headers.get('Content-Type');

        return expectedImageTypes.some(expectedType => contentType.includes(expectedType));
    } catch (error) {
        console.log('error')
        url= "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg"
        return false;
    }
}


async function generateBookObject(id, title, author, category, year, cover, rate, isComplete) {
    const isValidLink = await isLinkValid(cover);
    if (!isValidLink) {
        cover = 'https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg';
    }

    return {
        id,
        title,
        author,
        category,
        year,
        cover,
        rate,
        isComplete
    };
}

function createBaseElements(bookObject){
    const cover = document.createElement('img');
    cover.src = bookObject.cover;

    const title = document.createElement('h1');
    title.innerText = bookObject.title;
    title.style.overflowWrap = 'break-word';

    const author = document.createElement('h2');
    author.innerText = bookObject.author;
    author.style.overflowWrap = 'break-word';

    const category = document.createElement('p');
    category.innerText = bookObject.category;
    category.style.overflowWrap = 'break-word';

    const year = document.createElement('p');
    year.innerText = bookObject.year;

    const rating = document.createElement('p');
    rating.innerText = bookObject.rate;

    return { cover, title, author, category, year, rating};
}

function createDropdownElements(bookObject, title, markAsText, markAsCallback){
    const markAsLink = document.createElement('a');
    markAsLink.textContent = markAsText;
    markAsLink.addEventListener('click', function(){
        markAsCallback(bookObject.id);
    });

    const deleteLink = document.createElement('a');
    deleteLink.textContent = 'Delete';
    deleteLink.addEventListener('click', function(){
        document.getElementById('deleteModal').style.display = 'block';
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        const cancelDeleteBtn = document.getElementById('cancelDelete');
        
        confirmDeleteBtn.addEventListener('click', function () {
            removeBook(bookObject.id);
            hideDeleteModal();
        });

        cancelDeleteBtn.addEventListener('click', function () {
            hideDeleteModal();
        });
    });

    const renameLink = document.createElement('a');
    renameLink.textContent = 'Rename';
    renameLink.addEventListener('click', function () {
        renameBook(bookObject.id);
        hideDropdown();
    });

    const dropButton = document.createElement('button');
    dropButton.classList.add('dropbtn');
    const barsIcon = document.createElement('i');
    barsIcon.classList.add('fa', 'fa-bars');
    dropButton.appendChild(barsIcon);

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');
    dropdownContent.append(markAsLink, renameLink, deleteLink);

    const dropCurrent = document.createElement('div');
    dropCurrent.classList.add('dropdown')
    dropCurrent.append(dropButton, dropdownContent);

    dropButton.addEventListener('click', function(){
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        } else {
            dropdownContent.style.display = 'block';
        }
    })

    function hideDropdown() {
        dropdownContent.style.display = 'none';
    }
    
    return dropCurrent;

}

function makeCurrentList(bookObject){
    const { cover, title, author, category, year, rating} = createBaseElements(bookObject);
    const dropCurrent = createDropdownElements(bookObject, title, 'Mark as Finished', function(id){
        ratingBook(id);        
    });


    const explainCurrent = document.createElement('div');
    explainCurrent.classList.add('item-explain');
    explainCurrent.append(title, author, category, year, dropCurrent);

    const currentShelf = document.createElement('div');
    currentShelf.classList.add('item-current');
    currentShelf.append(cover, explainCurrent);
    currentShelf.setAttribute('id', `book-${bookObject.id}`);

    return currentShelf;
}

function makeFavoriteList(bookObject){
    const { cover, title, author, category, year, rating} = createBaseElements(bookObject);
    const markAsCurrent = document.createElement('a');
    markAsCurrent.textContent = 'Unfinished Book';
    markAsCurrent.addEventListener('click', function(){
        addBookUnfinished(bookObject.id);
    })

    const dropCurrent = createDropdownElements(bookObject, title, 'Move to Current Reading', function(id){
        addBookUnfinished(id);
    });

    dropCurrent.style.width = '10px';

    const explainFavorite = document.createElement('div');
    explainFavorite.classList.add('item-fav-explain');
    explainFavorite.append(title, dropCurrent);

    const favShelf = document.createElement('div');
    favShelf.append(cover, explainFavorite);
    favShelf.classList.add('item-fav');
    favShelf.setAttribute('id', `bookFav-${bookObject.id}`);

    return favShelf;
}

function makeFinishedList(bookObject){
    const { cover, title, author, category, year, rating} = createBaseElements(bookObject);
    const markAsCurrent = document.createElement('a');
    markAsCurrent.textContent = 'Unfinished Book';
    markAsCurrent.addEventListener('click', function(){
        addBookUnfinished(bookObject.id);
    })

    const dropCurrent = createDropdownElements(bookObject, title, 'Move to Current Reading', function(id){
        addBookUnfinished(id);
    });

    const starContainer = document.createElement('div');
    starContainer.classList.add('star');
    for (let i = 1; i <= 5; i++) {
        const starSpan = document.createElement('span');
        starSpan.classList.add('fa', 'fa-star');
        if (i <= bookObject.rate) {
            starSpan.classList.add('checked');
        }

        starContainer.appendChild(starSpan);
    }

    const explainPrev = document.createElement('div');
    explainPrev.append(title, author, category, year, starContainer, dropCurrent);
    explainPrev.classList.add('item-prev-explain');

    const prevShelf = document.createElement('div');
    prevShelf.append(cover, explainPrev);
    prevShelf.classList.add('item-prev');
    prevShelf.setAttribute('id', `bookPrev-${bookObject.id}`);

    return prevShelf;

}

function ratingBook(bookID) {
    const bookTarget = findBook(bookID);
    if (bookTarget == null) return;

    const rateModal = document.getElementById('RateModal');
    const rateInput = document.getElementById('textRating');
    const rateSubmitBtn = document.getElementById('rateSubmit');
    const rateCancelBtn = document.getElementById('rateCancel');

    rateInput.value = bookTarget.rate;
    rateModal.style.display = 'block';

    function submitHandler() {
        const newRate = rateInput.value;

        if (newRate !== null && newRate !== "") {
            bookTarget.rate = newRate;
            hideRateModal();
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            addBookFinished(bookID);
            // Remove the event listener after submission
            rateSubmitBtn.removeEventListener('click', submitHandler);
        }
    }

    function cancelHandler() {
        hideRateModal();
        // Remove the event listener after cancellation
        rateSubmitBtn.removeEventListener('click', submitHandler);
    }

    rateSubmitBtn.addEventListener('click', submitHandler);
    rateCancelBtn.addEventListener('click', cancelHandler);
}


function renameBook(bookID){
    const bookTarget = findBook(bookID);
    if(bookTarget == null) return;
    
    const renameModal = document.getElementById('RenameModal');
    const textRenameInput = document.getElementById('textRename');
    const renameSubmitBtn = document.getElementById('renameSubmit');
    const renameCancelBtn = document.getElementById('renameCancel');

    textRenameInput.value = bookTarget.title;
    renameModal.style.display = 'block';

    renameSubmitBtn.addEventListener('click', function () {
        const newTitle = textRenameInput.value;

        if (newTitle !== null && newTitle !== "") {
            bookTarget.title = newTitle;
            hideRenameModal();
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    });

    renameCancelBtn.addEventListener('click', function () {
        hideRenameModal();
    });
}

function hideRenameModal() {
    const renameModal = document.getElementById('RenameModal');
    renameModal.style.display = 'none';
}

function hideRateModal(){
    const rateModal = document.getElementById('RateModal');
    rateModal.style.display = 'none';
}

function addBookUnfinished(bookID){
    const bookTarget = findBook(bookID);
    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    bookTarget.rate = "";
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookFinished(bookID){
    const bookTarget = findBook(bookID);
    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookID){
    for(const bookItem of books){
        if(bookItem.id === bookID){
            return bookItem;
        }
    }
    return null;
}

function removeBook(bookID){
    const bookTarget = findBookIndex(bookID);
    if(bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function hideDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function findBookIndex(bookID){
    for(const index in books){
        if(books[index].id === bookID){
            return index;
        }
    }
    return -1;
}


document.addEventListener(RENDER_EVENT, function(){
    const currentBookList = document.getElementById('currentBooks');
    currentBookList.innerHTML = '';

    const prevBookList = document.getElementById('prevBooks');
    prevBookList.innerHTML = '';

    const favBookList = document.getElementById('favBooks');
    favBookList.innerHTML = '';

    for(const bookItem of books){
        const bookElementCurrent = makeCurrentList(bookItem);
        const bookElementFinished = makeFinishedList(bookItem);
        const bookElementFav = makeFavoriteList(bookItem);
        if (!bookItem.isComplete){
            currentBookList.append(bookElementCurrent);
        } else{
            prevBookList.append(bookElementFinished); 
            if (bookItem.rate == 5) {
                favBookList.append(bookElementFav);
            }
        }
    } 
});

const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOK_SHELF';

function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
};

function isStorageExist(){
    if (typeof(Storage) === undefined){
        alert ('Browser anda tidak mendukung Local Storage');
        return false;
   }
   return true;
};

document.addEventListener(SAVED_EVENT, function(){
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null){
        for(const book of data){
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks() {
    const searchInput = document.getElementById('search');
    const searchTerm = searchInput.value.toLowerCase();

    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm));

    renderBooks(filteredBooks);
}

function renderBooks(booksToRender) {
    const currentBookList = document.getElementById('currentBooks');
    currentBookList.innerHTML = '';

    const prevBookList = document.getElementById('prevBooks');
    prevBookList.innerHTML = '';

    const favBookList = document.getElementById('favBooks');
    favBookList.innerHTML = '';

    for (const bookItem of booksToRender) {
        const bookElementCurrent = makeCurrentList(bookItem);
        const bookElementFinished = makeFinishedList(bookItem);
        const bookElementFav = makeFavoriteList(bookItem);

        if (!bookItem.isComplete) {
            currentBookList.append(bookElementCurrent);
        } else {
            prevBookList.append(bookElementFinished);
            if (bookItem.rate == 5) {
                favBookList.append(bookElementFav);
            }
        }
    }
}
