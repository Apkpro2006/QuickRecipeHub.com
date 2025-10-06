import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import RecipeCard from './components/RecipeCard';
import { getTrendingRecipes, searchRecipes, getRecipeDetails, findRecipesByIngredients, searchProducts } from './services/api';
import { Recipe, RecipeSummary, MealType, AnalyzedInstruction, GroceryItem, ProductSummary } from './types';
import { ChefHatIcon, ClockIcon, FlameIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, CalendarIcon, BookOpenIcon, ListIcon, CarrotIcon, ShoppingBasketIcon } from './components/Icons';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const HomePage: React.FC = () => {
    const [recentRecipes, setRecentRecipes] = useState<RecipeSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const recipes = await getTrendingRecipes(4);
                setRecentRecipes(recipes);
            } catch (error) {
                console.error("Failed to fetch recent recipes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    const ActionButton: React.FC<{ icon: React.ElementType, title: string, linkTo: string, colorClass: string }> = ({ icon: Icon, title, linkTo, colorClass }) => (
        <Link to={linkTo} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClass}`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
            <span className="font-semibold text-slate-700 text-sm mt-1">{title}</span>
        </Link>
    );

    return (
        <div className="p-4 md:p-8 bg-white md:bg-slate-50 min-h-full">
            <section className="grid grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
                <ActionButton icon={SearchIcon} title="Recipes" linkTo="/recipes" colorClass="bg-brand-green" />
                <ActionButton icon={CarrotIcon} title="Ingredients" linkTo="/ingredients" colorClass="bg-brand-orange" />
                <ActionButton icon={ShoppingBasketIcon} title="Products" linkTo="/products" colorClass="bg-blue-500" />
                <ActionButton icon={CalendarIcon} title="Meal Planning" linkTo="/planner" colorClass="bg-purple-500" />
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">Recent recipes</h2>
                {loading ? <LoadingSpinner /> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {recentRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                    </div>
                )}
            </section>
        </div>
    );
};

const RecipesPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<RecipeSummary[]>([]);
    const [featuredRecipes, setFeaturedRecipes] = useState<RecipeSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(!!searchParams.get('q'));

    useEffect(() => {
        const searchQuery = searchParams.get('q');
        
        if (searchQuery) {
            setSearched(true);
            const performSearch = async () => {
                setLoading(true);
                try {
                    const data = await searchRecipes(searchQuery);
                    setResults(data.results);
                } catch (error) {
                    console.error("Failed to search recipes:", error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            };
            performSearch();
        } else {
            setSearched(false);
            const fetchFeatured = async () => {
                setLoading(true);
                try {
                    const recipes = await getTrendingRecipes(4);
                    setFeaturedRecipes(recipes);
                } catch(error) {
                    console.error("Failed to fetch featured recipes:", error);
                    setFeaturedRecipes([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchFeatured();
        }
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearchParams({ q: query });
    };
    
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Find a Recipe</h1>
            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by keyword, e.g., 'pasta'"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-transparent transition"
                />
                <button type="submit" className="bg-brand-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors flex items-center gap-2">
                    <SearchIcon className="w-5 h-5" />
                    <span>Search</span>
                </button>
            </form>

            {loading ? <LoadingSpinner /> : (
                searched ? (
                    results.length === 0 ? (
                        <p className="text-center text-slate-500 mt-8">No recipes found for "{searchParams.get('q')}". Try a different search!</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {results.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                        </div>
                    )
                ) : (
                    <section>
                         <h2 className="text-2xl font-bold text-slate-700 mb-4">Featured Recipes</h2>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {featuredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                        </div>
                    </section>
                )
            )}
        </div>
    );
};

const IngredientsPage: React.FC = () => {
    const [ingredients, setIngredients] = useState('');
    const [diet, setDiet] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [results, setResults] = useState<RecipeSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const dietOptions = ['Vegetarian', 'Vegan', 'Gluten Free', 'Ketogenic', 'Pescetarian'];
    const cuisineOptions = ['African', 'Asian', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 'European', 'French', 'German', 'Greek', 'Indian', 'Italian', 'Japanese', 'Korean', 'Mediterranean', 'Mexican', 'Spanish', 'Thai', 'Vietnamese'];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingredients.trim()) {
            alert("Please enter at least one ingredient.");
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const data = await findRecipesByIngredients(ingredients, diet.toLowerCase(), cuisine.toLowerCase());
            setResults(data.results);
        } catch (error) {
            console.error("Failed to find recipes by ingredients:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Find by Ingredients</h1>
            <p className="text-slate-600 mb-6">Got some ingredients? Find a recipe you can make right now.</p>
            
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <label htmlFor="ingredients-input" className="block text-sm font-medium text-slate-700 mb-1">Ingredients</label>
                        <input
                            id="ingredients-input"
                            type="text"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            placeholder="e.g., chicken, tomatoes, basil"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-transparent transition"
                        />
                        <p className="text-xs text-slate-500 mt-1">Separate ingredients with a comma.</p>
                    </div>
                    <div>
                        <label htmlFor="diet-select" className="block text-sm font-medium text-slate-700 mb-1">Dietary Preference</label>
                        <select id="diet-select" value={diet} onChange={e => setDiet(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg bg-white">
                            <option value="">Any</option>
                            {dietOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cuisine-select" className="block text-sm font-medium text-slate-700 mb-1">Cuisine</label>
                        <select id="cuisine-select" value={cuisine} onChange={e => setCuisine(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg bg-white">
                            <option value="">Any</option>
                            {cuisineOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:self-end">
                         <button type="submit" className="w-full bg-brand-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors flex items-center justify-center gap-2">
                            <SearchIcon className="w-5 h-5" />
                            <span>Find Recipes</span>
                        </button>
                    </div>
                </div>
            </form>

            {loading ? <LoadingSpinner /> : (
                searched ? (
                    results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {results.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 mt-8">No recipes found with those ingredients and filters. Try removing a filter or changing your ingredients.</p>
                    )
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <CarrotIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700">Ready to cook?</h2>
                        <p className="text-slate-500 mt-2">Enter ingredients and apply filters to discover new recipes.</p>
                    </div>
                )
            )}
        </div>
    );
};

const ProductsPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            alert("Please enter a product name.");
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const data = await searchProducts(query);
            setResults(data.products);
        } catch (error) {
            console.error("Failed to search for products:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const ProductCard: React.FC<{ product: ProductSummary }> = ({ product }) => (
        <div className="bg-white rounded-xl shadow-md overflow-hidden text-center">
            <img className="w-full h-48 object-contain p-4 bg-white" src={product.image} alt={product.title} />
            <div className="p-4">
                <h3 className="text-slate-700 font-semibold line-clamp-2">{product.title}</h3>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Search Food Products</h1>
            <p className="text-slate-600 mb-6">Find nutritional information for your favorite packaged foods.</p>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'organic whole milk'"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
                <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <SearchIcon className="w-5 h-5" />
                    <span>Search</span>
                </button>
            </form>

            {loading ? <LoadingSpinner /> : (
                searched ? (
                    results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {results.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 mt-8">No products found for "{query}". Try a different search!</p>
                    )
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <ShoppingBasketIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700">What are you looking for?</h2>
                        <p className="text-slate-500 mt-2">Enter a product name to search our database.</p>
                    </div>
                )
            )}
        </div>
    );
};


const AddToPlannerModal: React.FC<{ recipe: RecipeSummary, onClose: () => void }> = ({ recipe, onClose }) => {
    const { addToPlanner } = useAppContext();
    const [selectedDay, setSelectedDay] = useState(WEEK_DAYS[0]);
    const [selectedMeal, setSelectedMeal] = useState<MealType>(MealType.Dinner);

    const handleAdd = () => {
        addToPlanner(recipe, selectedDay, selectedMeal);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Add to Planner</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </div>
                <p className="mb-4 text-slate-600">Add <span className="font-semibold">{recipe.title}</span> to your meal plan.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="day-select" className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                        <select id="day-select" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                            {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meal</label>
                        <div className="flex gap-2">
                            {Object.values(MealType).map(meal => (
                                <button key={meal} onClick={() => setSelectedMeal(meal)} className={`px-4 py-2 rounded-lg text-sm capitalize flex-1 transition ${selectedMeal === meal ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                    {meal}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleAdd} className="bg-brand-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors">Add Meal</button>
                </div>
            </div>
        </div>
    );
};


const RecipeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPlannerModal, setShowPlannerModal] = useState(false);
    const { addIngredientsToGroceryList } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const details = await getRecipeDetails(Number(id));
                setRecipe(details);
            } catch (error) {
                console.error("Failed to fetch recipe details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);
    
    if (loading) return <LoadingSpinner />;
    if (!recipe) return <div className="p-8 text-center text-red-500">Failed to load recipe.</div>;
    
    const handleAddToGrocery = () => {
        addIngredientsToGroceryList(recipe.extendedIngredients);
        alert(`${recipe.title} ingredients added to your grocery list!`);
    }

    return (
        <div className="max-w-5xl mx-auto">
            {showPlannerModal && <AddToPlannerModal recipe={recipe} onClose={() => setShowPlannerModal(false)} />}
            <div className="relative h-64 md:h-96">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 md:p-8">
                    <h1 className="text-3xl md:text-5xl font-bold text-white">{recipe.title}</h1>
                </div>
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/80 rounded-full p-2 text-slate-700 hover:bg-white transition">
                    <ChevronLeftIcon />
                </button>
            </div>
            
            <div className="p-4 md:p-8">
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8 text-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm flex-1 min-w-[120px]"><div className="text-2xl font-bold text-brand-green">{recipe.readyInMinutes}</div><div className="text-sm text-slate-500">Minutes</div></div>
                    <div className="bg-white p-4 rounded-lg shadow-sm flex-1 min-w-[120px]"><div className="text-2xl font-bold text-brand-orange">{recipe.servings}</div><div className="text-sm text-slate-500">Servings</div></div>
                    <div className="bg-white p-4 rounded-lg shadow-sm flex-1 min-w-[120px]"><div className="text-2xl font-bold text-brand-green-dark">{recipe.healthScore}</div><div className="text-sm text-slate-500">Health Score</div></div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <button onClick={() => setShowPlannerModal(true)} className="w-full md:w-auto flex-1 bg-brand-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors flex items-center justify-center gap-2">
                        <CalendarIcon /> Add to Planner
                    </button>
                    <button onClick={handleAddToGrocery} className="w-full md:w-auto flex-1 bg-brand-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors">Add to Grocery List</button>
                    <Link to={`/cook/${recipe.id}`} className="w-full md:w-auto flex-1 bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors text-center">
                        Start Cooking
                    </Link>
                </div>
                
                <div dangerouslySetInnerHTML={{ __html: recipe.summary }} className="text-slate-700 mb-8 prose" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-brand-green pb-2">Ingredients</h2>
                        <ul className="space-y-2">
                            {recipe.extendedIngredients.map(ing => (
                                <li key={`${ing.id}-${ing.name}`} className="text-slate-700">{ing.original}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-brand-orange pb-2">Instructions</h2>
                        <ol className="space-y-4">
                            {recipe.analyzedInstructions[0]?.steps.map(step => (
                                <li key={step.number} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold">{step.number}</div>
                                    <p className="text-slate-700 flex-1">{step.step}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CookModePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [instructions, setInstructions] = useState<AnalyzedInstruction[]>([]);
    const [recipeTitle, setRecipeTitle] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstructions = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const details = await getRecipeDetails(Number(id));
                setInstructions(details.analyzedInstructions);
                setRecipeTitle(details.title);
            } catch (error) {
                console.error("Failed to fetch instructions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructions();
    }, [id]);

    const steps = instructions[0]?.steps || [];
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    if (loading) return <div className="bg-white h-screen"><LoadingSpinner /></div>;

    return (
        <div className="flex flex-col h-screen bg-white">
            <header className="flex items-center justify-between p-4 border-b">
                <h1 className="text-xl font-bold text-slate-800 truncate">{recipeTitle}</h1>
                <button onClick={() => navigate(`/recipe/${id}`)} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
            </header>
            
            <div className="w-full bg-slate-200 h-2">
                <div className="bg-brand-green h-2" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <p className="text-slate-500 font-semibold mb-4">STEP {currentStep + 1} OF {totalSteps}</p>
                <p className="text-3xl md:text-5xl font-light text-slate-700 max-w-4xl">
                    {steps[currentStep]?.step || "All done!"}
                </p>
            </div>

            <footer className="flex justify-between p-4 border-t">
                <button onClick={prevStep} disabled={currentStep === 0} className="px-8 py-4 bg-slate-200 text-slate-700 rounded-lg font-bold disabled:opacity-50 transition">
                    <ChevronLeftIcon />
                </button>
                <button onClick={nextStep} disabled={currentStep >= totalSteps - 1} className="px-8 py-4 bg-brand-green text-white rounded-lg font-bold disabled:opacity-50 transition">
                    <ChevronRightIcon />
                </button>
            </footer>
        </div>
    );
};

const PlannerPage: React.FC = () => {
    const { planner, removeFromPlanner } = useAppContext();

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Meal Planner</h1>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-1 min-w-[700px]">
                    {WEEK_DAYS.map(day => (
                        <div key={day} className="bg-white rounded-lg shadow-sm p-3">
                            <h2 className="font-bold text-center text-slate-700 mb-3">{day}</h2>
                            <div className="space-y-2">
                                {Object.values(MealType).map(meal => (
                                    <div key={meal} className="bg-slate-50 p-2 rounded-md min-h-[80px] relative group">
                                        <h3 className="text-xs font-semibold text-slate-500 capitalize">{meal}</h3>
                                        {planner[day]?.[meal] ? (
                                            <>
                                                <Link to={`/recipe/${planner[day]?.[meal]?.id}`} className="text-sm font-medium text-brand-green-dark hover:underline line-clamp-2">
                                                    {planner[day]?.[meal]?.title}
                                                </Link>
                                                 <button onClick={() => removeFromPlanner(day, meal)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                                    <XIcon className="w-3 h-3"/>
                                                </button>
                                            </>
                                        ) : (
                                            <Link to="/recipes" className="text-sm text-slate-400 hover:text-brand-green flex items-center justify-center h-full">
                                                + Add Meal
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GroceryListPage: React.FC = () => {
    const { groceryList, toggleGroceryItem, clearGroceryList } = useAppContext();

    const groupedItems = groceryList.reduce((acc: Record<string, GroceryItem[]>, item) => {
        const aisle = item.aisle || 'Other';
        if (!acc[aisle]) {
            acc[aisle] = [];
        }
        acc[aisle].push(item);
        return acc;
    }, {});

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Grocery List</h1>
                {groceryList.length > 0 && (
                    <button 
                        onClick={clearGroceryList} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                    >
                        Clear All
                    </button>
                )}
            </div>
            
            {groceryList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <ListIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">Your list is empty.</h2>
                    <p className="text-slate-500 mt-2">Add ingredients from a recipe page to get started!</p>
                    <Link to="/recipes" className="mt-4 inline-block bg-brand-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors">
                        Find Recipes
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([aisle, items]) => (
                        <div key={aisle} className="bg-white rounded-lg shadow-sm p-4">
                            <h2 className="text-lg font-bold text-slate-700 border-b pb-2 mb-3 capitalize">{aisle}</h2>
                            <ul className="space-y-2">
                                {items.map(item => (
                                    <li key={`${item.id}-${item.name}`} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`${item.id}-${item.name}`}
                                            checked={item.checked}
                                            onChange={() => toggleGroceryItem(item.id, item.name)}
                                            className="w-5 h-5 rounded text-brand-green focus:ring-brand-green-light"
                                        />
                                        <label
                                            htmlFor={`${item.id}-${item.name}`}
                                            className={`ml-3 text-slate-600 flex-1 cursor-pointer ${item.checked ? 'line-through text-slate-400' : ''}`}
                                        >
                                            {item.original}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppContextProvider>
            <HashRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/recipes" element={<RecipesPage />} />
                        <Route path="/ingredients" element={<IngredientsPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                        <Route path="/cook/:id" element={<CookModePage />} />
                        <Route path="/planner" element={<PlannerPage />} />
                        <Route path="/grocery-list" element={<GroceryListPage />} />
                    </Routes>
                </Layout>
            </HashRouter>
        </AppContextProvider>
    );
};

export default App;