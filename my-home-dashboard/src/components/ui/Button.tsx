import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'child' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', className, style, ...props }: ButtonProps) => {
    const baseStyle: React.CSSProperties = {
        padding: size === 'sm' ? '0.5rem 1rem' : size === 'lg' ? '1rem 2rem' : '0.75rem 1.5rem',
        borderRadius: '9999px',
        border: 'none',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...style,
    };

    let variantStyle: React.CSSProperties = {};

    switch (variant) {
        case 'primary':
            variantStyle = { backgroundColor: 'var(--parent-primary)', color: 'white' };
            break;
        case 'secondary':
            variantStyle = { backgroundColor: 'var(--parent-secondary)', color: 'white' };
            break;
        case 'child':
            variantStyle = {
                backgroundColor: 'var(--child-secondary)',
                color: 'white',
                fontSize: '1.2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            };
            break;
        case 'danger':
            variantStyle = { backgroundColor: '#ef4444', color: 'white' };
            break;
        case 'ghost':
            variantStyle = { backgroundColor: 'transparent', color: 'inherit' };
            break;
    }

    return (
        <button
            style={{ ...baseStyle, ...variantStyle }}
            className={className}
            {...props}
        />
    );
};
