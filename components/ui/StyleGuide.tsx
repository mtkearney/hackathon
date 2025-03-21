import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import Badge from './Badge';
import Alert from './Alert';

export default function StyleGuide() {
  const [showAlert, setShowAlert] = useState(true);
  
  return (
    <div className="container py-12">
      <h1 className="mb-8">Style Guide</h1>
      
      <section className="mb-16">
        <h2 className="mb-6">Typography</h2>
        <div className="space-y-6">
          <div>
            <h1>Heading 1 - Boldonse</h1>
            <p>The primary heading font is Boldonse, used for all headings.</p>
          </div>
          <div>
            <h2>Heading 2 - Boldonse</h2>
            <p>Secondary headings also use Boldonse with appropriate sizing.</p>
          </div>
          <div>
            <h3>Heading 3 - Boldonse</h3>
            <p>Tertiary headings maintain the brand consistency.</p>
          </div>
          <div>
            <h4>Heading 4 - Boldonse</h4>
            <p>Even smaller headings follow the same font pattern.</p>
          </div>
          <div>
            <p className="text-lg mb-2">Body text - Instrument Sans</p>
            <p>The main body text uses Instrument Sans, a clean and readable font for optimal readability. 
            Instrument Sans provides excellent legibility at various sizes and works well across different devices and screen resolutions.</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Small text - Also uses Instrument Sans but at a smaller size, typically for captions, footnotes, or secondary information.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-16">
        <h2 className="mb-6">Color Palette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-primary text-white">
            <p className="font-bold">Primary Color</p>
            <p className="text-sm opacity-90">#212D54</p>
            <p className="text-sm mt-2">Used for headers, backgrounds, and important UI elements</p>
          </div>
          <div className="p-6 rounded-lg bg-secondary text-foreground">
            <p className="font-bold">Secondary Color</p>
            <p className="text-sm opacity-90">#FDF4C9</p>
            <p className="text-sm mt-2">Used for contrasting elements and backgrounds</p>
          </div>
          <div className="p-6 rounded-lg bg-accent text-white">
            <p className="font-bold">Accent Color</p>
            <p className="text-sm opacity-90">#DC481F</p>
            <p className="text-sm mt-2">Used for call-to-action buttons and highlights</p>
          </div>
          <div className="p-6 rounded-lg bg-background text-foreground border border-gray-200">
            <p className="font-bold">Background Color</p>
            <p className="text-sm opacity-90">#FFFFFF</p>
            <p className="text-sm mt-2">Used for general backgrounds</p>
          </div>
          <div className="p-6 rounded-lg bg-foreground text-white">
            <p className="font-bold">Foreground Color</p>
            <p className="text-sm opacity-90">#22231B</p>
            <p className="text-sm mt-2">Used for text</p>
          </div>
        </div>
      </section>
      
      <section className="mb-16">
        <h2 className="mb-6">Buttons</h2>
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="accent">Accent Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">Small Button</Button>
            <Button variant="primary" size="md">Medium Button</Button>
            <Button variant="primary" size="lg">Large Button</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" isLoading>Loading Button</Button>
            <Button 
              variant="primary" 
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Button with Icon
            </Button>
          </div>
          
          <div>
            <Button variant="primary" fullWidth>Full Width Button</Button>
          </div>
        </div>
      </section>
      
      <section className="mb-16">
        <h2 className="mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="mb-2">Default Card</h3>
            <p>This is a standard card component with default styling.</p>
          </Card>
          
          <Card variant="highlight">
            <h3 className="mb-2">Highlight Card</h3>
            <p>This card has an accent border to make it stand out.</p>
          </Card>
          
          <Card variant="outline">
            <h3 className="mb-2">Outline Card</h3>
            <p>This card has a simple outline style without shadows.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}