
import React from 'react';
import { ChefHatIcon } from './Icons';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-full w-full p-8">
            <div className="flex flex-col items-center gap-4">
                <ChefHatIcon className="w-16 h-16 text-brand-orange animate-bounce" />
                <p className="text-slate-600 text-lg font-medium">Preparing something delicious...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
