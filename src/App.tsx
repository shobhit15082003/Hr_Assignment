import React from 'react';
import { JsonSchemaBuilder } from './components/JsonSchemaBuilder';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <>
      <JsonSchemaBuilder />
      <Toaster />
    </>
  );
}

export default App;