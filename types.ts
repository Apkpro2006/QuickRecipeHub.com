export interface RecipeSummary {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  servings: number;
}

export interface ProductSummary {
  id: number;
  title: string;
  image: string;
}

export interface Ingredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
}

export interface AnalyzedInstruction {
  name: string;
  steps: {
    number: number;
    step: string;
    ingredients: { id: number; name: string; localizedName: string; image: string }[];
    equipment: { id: number; name: string; localizedName: string; image: string }[];
    length?: { number: number; unit: string };
  }[];
}

export interface Recipe extends RecipeSummary {
  summary: string;
  extendedIngredients: Ingredient[];
  analyzedInstructions: AnalyzedInstruction[];
  nutrition: {
    nutrients: {
        name: string;
        amount: number;
        unit: string;
        percentOfDailyNeeds: number;
    }[];
  };
}

export enum MealType {
    Breakfast = 'breakfast',
    Lunch = 'lunch',
    Dinner = 'dinner',
}

export type PlannerData = {
    [day: string]: {
        [meal in MealType]?: RecipeSummary;
    };
};

export interface GroceryItem extends Ingredient {
    checked: boolean;
}