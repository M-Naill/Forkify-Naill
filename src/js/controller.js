import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import 'core-js/stable';
import 'regenerator-runtime';
import { async } from 'regenerator-runtime';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js'
import { MODAL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {

    const id = window.location.hash.slice(1);
    if (!id) return
    recipeView.renderSpinner();
    // update results after selection
    resultsView.update(model.getSearchResultsPage());
    // Loading recipe
    await model.loadRecipe(id);
    // Rendring Bookmarks
    bookmarksView.update(model.state.bookmarks)

    //Rendring recipe
    recipeView.render(model.state.recipe);

  } catch (err) {
    recipeView.renderError();
  }

};

const controlSearchResults = async function () {
  try {

    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search)

  } catch (err) {
    console.log(err)
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search)
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);

};

const controlAddBookmark = function () {
  // Add or Remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  console.log(model.state.bookmarks)

  // Render Bookmarks 
  bookmarksView.render(model.state.bookmarks)
};

const controlBookmark = function () {
  bookmarksView.render(model.state.bookmarks)
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    // succes message 
    addRecipeView.renderMessage();
    //render Bookmark view
    bookmarksView.render(model.state.bookmarks);
    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
  } catch (err) {
    console.error('5', err);
    addRecipeView.renderError(err.message);
  }

  // upload new recipe data
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmark)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addhandlerUpload(controlAddRecipe)

};
init();

