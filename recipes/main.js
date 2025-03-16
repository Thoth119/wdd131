import recipes from './recipes.mjs';

function random(num) {
    return Math.floor(Math.random() * num);
}

function getRandomListEntry(list) {
    return list[random(list.length)];
}

function tagsTemplate(tags) {
    return tags.map(tag => `<li>${tag}</li>`).join('');
}

function ratingTemplate(rating) {
    let html = `<span class="rating" role="img" aria-label="Rating: ${rating} out of 5 stars">`;
    for (let i = 1; i <= 5; i++) {
        html += i <= rating ? `<span aria-hidden="true" class="icon-star">⭐</span>` : `<span aria-hidden="true" class="icon-star-empty">☆</span>`;
    }
    html += `</span>`;
    return html;
}

function recipeTemplate(recipe) {
    const ingredientsList = recipe.recipeIngredient.map(ing => `<li>${ing}</li>`).join('');
    return `
        <figure class="recipe">
            <img src="${recipe.image}" alt="${recipe.name}" />
            <figcaption>
                <ul class="recipe__tags">${tagsTemplate(recipe.tags)}</ul>
                <h2><a href="#">${recipe.name}</a></h2>
                <p class="recipe__ratings">${ratingTemplate(recipe.rating)}</p>
                <p class="recipe__description">${recipe.description}</p>
                <h3>Ingredients</h3>
                <ul class="ingredients">${ingredientsList}</ul>
            </figcaption>
        </figure>
    `;
}

function renderRecipes(recipeList) {
    document.querySelector('.recipes-container').innerHTML = recipeList.map(recipe => recipeTemplate(recipe)).join('');
}

function init() {
    renderRecipes([getRandomListEntry(recipes)]);
}

function filterRecipes(query) {
    if (!query) return recipes;
    const q = query.toLowerCase();
    return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(q) ||
        recipe.description.toLowerCase().includes(q) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(q)) ||
        recipe.recipeIngredient.some(ing => ing.toLowerCase().includes(q))
    );
}

document.querySelector('#search-button').addEventListener('click', (e) => {
    e.preventDefault();
    const query = document.querySelector('#search-input').value;
    renderRecipes(filterRecipes(query));
});

init();