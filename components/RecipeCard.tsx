import React from 'react';
import { Link } from 'react-router-dom';
import { RecipeSummary } from '../types';
import { ClockIcon, FlameIcon, HeartIcon } from './Icons';

interface RecipeCardProps {
    recipe: RecipeSummary;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    return (
        <Link to={`/recipe/${recipe.id}`} className="block group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="relative">
                <img className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" src={recipe.image} alt={recipe.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button className="absolute top-3 right-3 bg-white/80 rounded-full p-2 text-slate-600 hover:text-red-500 hover:bg-white transition-colors duration-200 z-10">
                    <HeartIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white text-lg font-bold line-clamp-2">{recipe.title}</h3>
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-brand-green" />
                        <span>{recipe.readyInMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FlameIcon className="w-5 h-5 text-brand-orange" />
                        <span>{recipe.healthScore} Health Score</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default RecipeCard;