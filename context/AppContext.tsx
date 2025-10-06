
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { PlannerData, RecipeSummary, MealType, GroceryItem, Ingredient } from '../types';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AppContextType {
    planner: PlannerData;
    groceryList: GroceryItem[];
    addToPlanner: (recipe: RecipeSummary, day: string, meal: MealType) => void;
    removeFromPlanner: (day: string, meal: MealType) => void;
    addIngredientsToGroceryList: (ingredients: Ingredient[]) => void;
    generateGroceryListFromPlanner: () => void;
    toggleGroceryItem: (id: number, name: string) => void;
    clearGroceryList: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [planner, setPlanner] = useState<PlannerData>({});
    const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);

    const addToPlanner = useCallback((recipe: RecipeSummary, day: string, meal: MealType) => {
        setPlanner(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [meal]: recipe,
            }
        }));
    }, []);

    const removeFromPlanner = useCallback((day: string, meal: MealType) => {
        setPlanner(prev => {
            const newDayPlan = { ...prev[day] };
            delete newDayPlan[meal];
            return {
                ...prev,
                [day]: newDayPlan,
            };
        });
    }, []);
    
    const addIngredientsToGroceryList = useCallback((ingredients: Ingredient[]) => {
        setGroceryList(prev => {
            const newItems = ingredients
                .map(ing => ({ ...ing, checked: false }))
                .filter(newItem => !prev.some(existing => existing.id === newItem.id && existing.name === newItem.name));
            return [...prev, ...newItems];
        });
    }, []);

    const generateGroceryListFromPlanner = useCallback(() => {
        alert("This feature requires fetching full recipe details for all planned meals, which would quickly exhaust API quotas. A full implementation would require a backend to manage this. For now, please add ingredients from the recipe detail page.");
    }, []);

    const toggleGroceryItem = useCallback((id: number, name: string) => {
        setGroceryList(prev => prev.map(item =>
            (item.id === id && item.name === name) ? { ...item, checked: !item.checked } : item
        ));
    }, []);

    const clearGroceryList = useCallback(() => {
        setGroceryList([]);
    }, []);

    return (
        <AppContext.Provider value={{ planner, groceryList, addToPlanner, removeFromPlanner, addIngredientsToGroceryList, generateGroceryListFromPlanner, toggleGroceryItem, clearGroceryList }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};
