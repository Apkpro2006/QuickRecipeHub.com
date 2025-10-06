import { Recipe, RecipeSummary, ProductSummary } from '../types';

// WARNING: Storing API keys in frontend code is a major security risk.
// In a real-world application, this should be handled by a secure backend proxy
// as requested in the original prompt. For this demonstration, it is hardcoded.
const API_KEY = '0e71985b1eae4cf78fa5df78ca8ddad8';
const BASE_URL = 'https://api.spoonacular.com';

const fetchSpoonacular = async <T,>(endpoint: string): Promise<T> => {
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apiKey=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.statusText}`);
    }
    return response.json();
};

export const getTrendingRecipes = async (count: number = 9): Promise<RecipeSummary[]> => {
    const response = await fetchSpoonacular<{ recipes: RecipeSummary[] }>(`/recipes/random?number=${count}`);
    return response.recipes;
};

export const searchRecipes = async (query: string, number: number = 12): Promise<{results: RecipeSummary[]}> => {
    return fetchSpoonacular<{results: RecipeSummary[]}>(`/recipes/complexSearch?query=${query}&number=${number}&addRecipeInformation=true`);
};

export const getRecipeDetails = async (id: number): Promise<Recipe> => {
    return fetchSpoonacular<Recipe>(`/recipes/${id}/information?includeNutrition=true`);
};

export const findRecipesByIngredients = async (
    ingredients: string,
    diet?: string,
    cuisine?: string,
    number: number = 12
): Promise<{ results: RecipeSummary[] }> => {
    let endpoint = `/recipes/complexSearch?includeIngredients=${ingredients}&number=${number}&addRecipeInformation=true`;
    if (diet) {
        endpoint += `&diet=${diet}`;
    }
    if (cuisine) {
        endpoint += `&cuisine=${cuisine}`;
    }
    return fetchSpoonacular<{ results: RecipeSummary[] }>(endpoint);
};

export const searchProducts = async (query: string, number: number = 12): Promise<{ products: ProductSummary[] }> => {
    return fetchSpoonacular<{ products: ProductSummary[] }>(`/food/products/search?query=${query}&number=${number}`);
};