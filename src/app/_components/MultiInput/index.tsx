import React, { useEffect, useState } from 'react';
import './styles.css';

interface InputItemProps {
    name: string;
    disabled?: boolean;
    onClose?: (keyword: string) => void;
}

interface MultiInputProps {
    keywords: string[];
    onChange: (keywords: string[]) => void;
}

export const InputItem: React.FC<InputItemProps> = ({name, disabled=false, onClose=() => {}}) => {
  
    const removeItem = ()=>{
        onClose(name)
    }

    return (
    <div className="keyword-item">
        {name}
        {!disabled
        ? <span onClick={removeItem}>x</span>
        : null}
    </div>
  )
}

export const MultiInput: React.FC<MultiInputProps> = ({ keywords, onChange }) => {
    const [currentInput, setCurrentInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement; // Cast to HTMLInputElement
        
        if (e.key === 'Enter') {
          onChange([...keywords, currentInput])
        }
    };

    const handleKeyUP = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement; // Cast to HTMLInputElement
        
        if (e.key === 'Enter') {
          setCurrentInput('')
        }
    };

    const onClose = (keyword: string) => {
        onChange(keywords.filter((k) => k !== keyword))
    }

  return (
    <div className="multi-input-container">
      <label htmlFor="keywords" className="multi-input-label">
        SEO Keywords:
      </label>
      <div className="keywords-container">
        {keywords.map((keyword, index)=>(
            <InputItem key={index} name={keyword} onClose={onClose}/>
        ))}
        <input
            type="text"
            id="keywords"
            className="multi-input-field"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUP}
            placeholder="Add item and press enter"
        />
      </div>
    </div>
  );
};