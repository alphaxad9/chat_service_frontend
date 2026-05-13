import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from './themeSlice';
import { RootState } from '../store';

const ThemeToggleButton = () => {
const dispatch = useDispatch();
const darkMode = useSelector((state: RootState) => state.theme.darkMode);

return (
<button
    onClick={() => dispatch(toggleDarkMode())}
    className={`p-2 rounded-full focus:outline-none ${
    darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
    }`}
    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
>
    {darkMode ? (
    <span>🌞 Light Mode</span>
    ) : (
    <span>🌙 Dark Mode</span>
    )}
</button>
);
};

export default ThemeToggleButton;