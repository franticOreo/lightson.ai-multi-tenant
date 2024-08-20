import React from 'react';
import './styles.css';

interface MultiInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
}

export const MultiInput: React.FC<MultiInputProps> = ({ keywords, onChange }) => {
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputKeywords = e.target.value.split(',').map(keyword => keyword.trim());
        onChange(inputKeywords);
    };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement; // Cast to HTMLInputElement
    
    if (e.key === 'Backspace' && keywords.length > 0) {
      const updatedKeywords = [...keywords];
      updatedKeywords.pop();
      onChange(updatedKeywords);
    }
  };

  return (
    <div className="multi-input-container">
      <label htmlFor="keywords" className="multi-input-label">
        SEO Keywords:
      </label>
      <input
        type="text"
        id="keywords"
        className="multi-input-field"
        value={keywords.join(', ')}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown} 
        placeholder="Enter keywords separated by commas"
      />
    </div>
  );
};